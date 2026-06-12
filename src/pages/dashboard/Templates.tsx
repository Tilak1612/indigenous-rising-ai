import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Download, Eye, Filter } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { TEMPLATES, TEMPLATE_CATEGORIES, type BusinessTemplate } from '@/lib/templates';
import { toast } from 'sonner';

// Real, downloadable templates (src/lib/templates.ts). No fabricated download
// counts, ratings, or "PRO" gating — Preview shows the actual content and
// Download produces a real file.

const formatFromFilename = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'TXT';

const downloadTemplate = (t: BusinessTemplate) => {
  try {
    const blob = new Blob([t.content], { type: `${t.mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${t.filename}`);
  } catch {
    toast.error('Could not download the template');
  }
};

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [preview, setPreview] = useState<BusinessTemplate | null>(null);

  const filteredTemplates = TEMPLATES.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Templates</h1>
          <p className="text-muted-foreground mt-1">
            Free, ready-to-use templates to accelerate your business. Preview, then download.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline">{formatFromFilename(template.filename)}</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-auto">
                <Badge variant="secondary">{template.category}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setPreview(template)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => downloadTemplate(template)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>{preview?.description}</DialogDescription>
          </DialogHeader>
          <pre className="max-h-[55vh] overflow-auto rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap font-mono">
            {preview?.content}
          </pre>
          {preview && (
            <Button onClick={() => downloadTemplate(preview)} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download {preview.filename}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
