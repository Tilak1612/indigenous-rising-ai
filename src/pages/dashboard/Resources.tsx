import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  Video, 
  Users, 
  ExternalLink,
  Download,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'template' | 'video' | 'partner';
  type: string;
  rating: number;
  downloads?: number;
  duration?: string;
  featured?: boolean;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Starting an Indigenous Business',
    description: 'Comprehensive guide to launching your first business with cultural considerations',
    category: 'guide',
    type: 'PDF Guide',
    rating: 4.8,
    downloads: 1250,
    featured: true,
  },
  {
    id: '2',
    title: 'OCAP™ Principles Overview',
    description: 'Understanding Ownership, Control, Access, and Possession principles',
    category: 'guide',
    type: 'Article',
    rating: 4.9,
    downloads: 890,
  },
  {
    id: '3',
    title: 'Business Plan Template - Indigenous Focus',
    description: 'Pre-formatted template with community impact sections',
    category: 'template',
    type: 'Word Document',
    rating: 4.7,
    downloads: 2100,
    featured: true,
  },
  {
    id: '4',
    title: 'Financial Projections Spreadsheet',
    description: 'Excel template for revenue forecasting and budgeting',
    category: 'template',
    type: 'Excel',
    rating: 4.5,
    downloads: 1800,
  },
  {
    id: '5',
    title: 'Traditional Knowledge in Business',
    description: 'How to incorporate traditional knowledge while protecting IP',
    category: 'video',
    type: 'Video',
    rating: 4.6,
    duration: '45 min',
  },
  {
    id: '6',
    title: 'Indigenous Business Development Corporation',
    description: 'Access loans, grants, and business support services',
    category: 'partner',
    type: 'Partner Organization',
    rating: 4.8,
  },
];

const categoryIcons = {
  guide: BookOpen,
  template: FileText,
  video: Video,
  partner: Users,
};

const categoryColors = {
  guide: 'bg-blue-500/10 text-blue-600',
  template: 'bg-green-500/10 text-green-600',
  video: 'bg-purple-500/10 text-purple-600',
  partner: 'bg-amber-500/10 text-amber-600',
};

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(search.toLowerCase()) ||
                          resource.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || resource.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community Resource Directory</h1>
            <p className="text-muted-foreground">Guides, templates, videos, and partner organizations</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="guide">Guides</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="partner">Partners</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Featured Resources */}
            {activeTab === 'all' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Featured Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.filter(r => r.featured).map(resource => {
                    const Icon = categoryIcons[resource.category];
                    return (
                      <Card key={resource.id} className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", categoryColors[resource.category])}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary">{resource.type}</Badge>
                                <Badge variant="outline" className="text-amber-500">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Featured
                                </Badge>
                              </div>
                              <h3 className="font-semibold">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-sm flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  {resource.rating}
                                </span>
                                {resource.downloads && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Download className="h-4 w-4" />
                                    {resource.downloads.toLocaleString()}
                                  </span>
                                )}
                                <Button size="sm" className="ml-auto">
                                  Access
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map(resource => {
                const Icon = categoryIcons[resource.category];
                return (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", categoryColors[resource.category])}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="text-xs mb-2">{resource.type}</Badge>
                          <h3 className="font-medium text-sm leading-tight">{resource.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {resource.rating}
                            </span>
                            {resource.duration && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {resource.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No resources found matching your search.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
