import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Download, Eye, Star, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  downloads: number;
  rating: number;
  format: string;
  premium: boolean;
}

const templates: Template[] = [
  {
    id: '1',
    title: 'Business Plan Template',
    description: 'Comprehensive business plan template tailored for Indigenous enterprises.',
    category: 'Business Planning',
    downloads: 1250,
    rating: 4.8,
    format: 'DOCX',
    premium: false,
  },
  {
    id: '2',
    title: 'Grant Application Worksheet',
    description: 'Step-by-step worksheet to prepare winning grant applications.',
    category: 'Funding',
    downloads: 890,
    rating: 4.9,
    format: 'PDF',
    premium: false,
  },
  {
    id: '3',
    title: 'Financial Projections Spreadsheet',
    description: '3-year financial projection template with automatic calculations.',
    category: 'Finance',
    downloads: 2100,
    rating: 4.7,
    format: 'XLSX',
    premium: true,
  },
  {
    id: '4',
    title: 'Marketing Strategy Canvas',
    description: 'Visual canvas for planning your marketing strategy.',
    category: 'Marketing',
    downloads: 567,
    rating: 4.6,
    format: 'PDF',
    premium: true,
  },
  {
    id: '5',
    title: 'OCAP™ Compliance Checklist',
    description: 'Ensure your data practices align with OCAP™ principles.',
    category: 'Compliance',
    downloads: 445,
    rating: 4.9,
    format: 'PDF',
    premium: false,
  },
  {
    id: '6',
    title: 'Partnership Agreement Template',
    description: 'Legal template for formalizing business partnerships.',
    category: 'Legal',
    downloads: 678,
    rating: 4.5,
    format: 'DOCX',
    premium: true,
  },
  {
    id: '7',
    title: 'Impact Report Template',
    description: 'Template for documenting and sharing your community impact.',
    category: 'Impact',
    downloads: 334,
    rating: 4.7,
    format: 'PPTX',
    premium: false,
  },
  {
    id: '8',
    title: 'Invoice Template',
    description: 'Professional invoice template with Indigenous branding elements.',
    category: 'Finance',
    downloads: 1890,
    rating: 4.8,
    format: 'XLSX',
    premium: false,
  },
];

const categories = ['All', 'Business Planning', 'Funding', 'Finance', 'Marketing', 'Compliance', 'Legal', 'Impact'];

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Templates</h1>
          <p className="text-muted-foreground mt-1">
            Download professional templates to accelerate your business
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
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{template.format}</Badge>
                    {template.premium && (
                      <Badge className="bg-amber-500">PRO</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
                <Badge variant="secondary">{template.category}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1">
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
    </DashboardLayout>
  );
}
