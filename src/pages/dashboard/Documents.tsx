import React, { useCallback, useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';
import { Upload, FileText, Download, Trash2, Loader2, FolderOpen } from 'lucide-react';

// Document Library — private 'documents' Storage bucket + documents metadata
// table. All I/O is direct-fetch (the supabase-js query path can hang on this
// project) with the user's token; RLS + per-user-folder storage policies scope
// everything to the owner. Downloads use short-lived signed URLs.

const CATEGORIES = [
  { value: 'business_registration', label: 'Business registration' },
  { value: 'financial', label: 'Financial statements' },
  { value: 'funding', label: 'Funding documents' },
  { value: 'letters_of_support', label: 'Letters of support' },
  { value: 'reports', label: 'Reports' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'exported_plans', label: 'Exported plans' },
  { value: 'other', label: 'Other' },
] as const;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

type Doc = {
  id: string;
  name: string;
  category: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

const REST = `${SUPABASE_URL}/rest/v1`;
const STORAGE = `${SUPABASE_URL}/storage/v1`;

const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

const categoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? 'Other';

const fmtSize = (n: number | null) => {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<string>('other');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${REST}/documents?select=id,name,category,storage_path,mime_type,size_bytes,created_at&user_id=eq.${user.id}&order=created_at.desc`,
        { headers: authHeaders() }
      );
      if (!res.ok) throw new Error('load failed');
      setDocs((await res.json()) as Doc[]);
    } catch {
      toast.error('Could not load documents');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (file.size > MAX_BYTES) {
      toast.error('File too large (max 10 MB)');
      return;
    }
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${user.id}/${Date.now()}_${safeName}`;
      // 1) upload the bytes to the private bucket
      const up = await fetch(`${STORAGE}/object/documents/${path}`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
        body: file,
      });
      if (!up.ok) throw new Error('storage upload failed');
      // 2) record metadata
      const meta = await fetch(`${REST}/documents`, {
        method: 'POST',
        headers: { ...authHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({
          user_id: user.id,
          name: file.name,
          category,
          storage_path: path,
          mime_type: file.type || null,
          size_bytes: file.size,
        }),
      });
      if (!meta.ok) throw new Error('metadata insert failed');
      toast.success('Document uploaded');
      await load();
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDownload = async (doc: Doc) => {
    try {
      const res = await fetch(`${STORAGE}/object/sign/documents/${doc.storage_path}`, {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ expiresIn: 3600 }),
      });
      if (!res.ok) throw new Error('sign failed');
      const data = (await res.json()) as { signedURL?: string; signedUrl?: string };
      const signed = data.signedURL ?? data.signedUrl;
      if (!signed) throw new Error('no signed url');
      window.open(`${STORAGE}${signed}`, '_blank', 'noopener');
    } catch {
      toast.error('Could not generate a download link');
    }
  };

  const handleDelete = async (doc: Doc) => {
    try {
      // remove the object, then the metadata row (RLS scopes both to the owner)
      await fetch(`${STORAGE}/object/documents/${doc.storage_path}`, { method: 'DELETE', headers: authHeaders() });
      const res = await fetch(`${REST}/documents?id=eq.${doc.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('delete failed');
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document deleted');
    } catch {
      toast.error('Could not delete');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-muted-foreground mt-1">
            Securely store and manage your business documents. Files are private, stored in Canada,
            and only accessible by you.
          </p>
        </div>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload a document</CardTitle>
            <CardDescription>Choose a category, then select a file (max 10 MB).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="doc-category">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="doc-category" className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
              <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading…' : 'Select file'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your documents</CardTitle>
            <CardDescription>{docs.length} {docs.length === 1 ? 'file' : 'files'}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground/60 mb-3" />
                <p className="font-medium">No documents yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload business registration, financial statements, funding letters and more.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 py-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="font-normal">{categoryLabel(doc.category)}</Badge>
                        <span>{fmtSize(doc.size_bytes)}</span>
                        <span>·</span>
                        <span>{new Date(doc.created_at).toLocaleDateString('en-CA')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" aria-label="Download" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(doc)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
