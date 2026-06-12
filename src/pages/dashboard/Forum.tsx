import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, MessageSquare, ArrowUp, MessageCircle, Plus, Loader2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';

// Community Forum — wired to the real public.community_posts table (the same
// table the public /community page uses). Reads via direct-fetch (anon key);
// posting uses the user's token. No fabricated authors, likes, or "trending".
// Full threads (comments) live at /community/:id.

const REST = `${SUPABASE_URL}/rest/v1`;

const CATEGORIES = ['Funding', 'Culture', 'Mentorship', 'Success Stories', 'Compliance', 'General'];
const FILTERS = ['All', ...CATEGORIES];

interface Post {
  id: string;
  display_name: string;
  title: string;
  body: string;
  category: string;
  upvotes: number;
  reply_count: number;
  created_at: string;
}

const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
const excerpt = (s: string, n = 160) => (s.length <= n ? s : s.slice(0, n).trimEnd() + '…');

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        select: 'id,display_name,title,body,category,upvotes,reply_count,created_at',
        is_approved: 'eq.true',
        order: 'is_pinned.desc,created_at.desc',
      });
      if (activeCategory !== 'All') params.set('category', `eq.${activeCategory}`);
      const res = await fetch(`${REST}/community_posts?${params}`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
      if (!res.ok) throw new Error('load failed');
      setPosts((await res.json()) as Post[]);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!user) {
      toast.error('Please sign in to post');
      return;
    }
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) {
      toast.error('Add a title and a message');
      return;
    }
    setSubmitting(true);
    try {
      const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
      const displayName = (user.user_metadata?.full_name as string) || user.email || 'Community member';
      const res = await fetch(`${REST}/community_posts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ user_id: user.id, display_name: displayName, title: t, body: b, category }),
      });
      if (!res.ok) throw new Error('insert failed');
      setTitle(''); setBody(''); setCategory('General'); setShowForm(false);
      toast.success('Posted to the community');
      if (activeCategory === 'All' || activeCategory === category) {
        await load();
      } else {
        setActiveCategory('All');
      }
    } catch {
      toast.error('Could not post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((p) => !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
  }, [posts, search]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground mt-1">
              Ask questions, share wins, and connect with other Indigenous entrepreneurs.
            </p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4 mr-2" /> New discussion
          </Button>
        </div>

        {/* New post */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Start a discussion</CardTitle>
              <CardDescription>Posts are public to the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Share your thoughts, questions, or experiences..." className="min-h-[120px]"
                value={body} onChange={(e) => setBody(e.target.value)} />
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 sm:ml-auto">
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {submitting ? 'Posting…' : 'Post'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search discussions..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {FILTERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Discussions</CardTitle>
            <CardDescription>{visible.length} {visible.length === 1 ? 'post' : 'posts'}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No discussions yet</p>
                <p className="text-sm mt-1">Be the first to start one.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visible.map((post) => (
                  <li key={post.id} className="py-4">
                    <Link to={`/community/${post.id}`} className="group block">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary">{initials(post.display_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium group-hover:text-primary transition-colors">{post.title}</h4>
                            <Badge variant="secondary" className="font-normal">{post.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{excerpt(post.body)}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{post.display_name}</span>
                            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                            <span className="inline-flex items-center gap-1"><ArrowUp className="h-3 w-3" />{post.upvotes}</span>
                            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.reply_count}</span>
                            <span className="inline-flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Open <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
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
