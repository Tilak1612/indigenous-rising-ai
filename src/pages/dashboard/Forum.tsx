import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  MessageSquare, 
  Heart, 
  MessageCircle,
  Users,
  TrendingUp,
  Plus,
  Filter,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  likes: number;
  replies: number;
  timestamp: Date;
  pinned?: boolean;
}

const posts: ForumPost[] = [
  {
    id: '1',
    title: 'Tips for First-Time Grant Applications',
    content: 'I recently received my first grant and wanted to share some tips that helped me through the process...',
    author: { name: 'Sarah Crow Feather' },
    category: 'Funding',
    likes: 24,
    replies: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    pinned: true,
  },
  {
    id: '2',
    title: 'How to Balance Traditional Knowledge with Modern Business',
    content: 'Starting a business while honoring our traditions can be challenging. Here is what I have learned...',
    author: { name: 'James Running Bear' },
    category: 'Culture',
    likes: 45,
    replies: 28,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    pinned: true,
  },
  {
    id: '3',
    title: 'Looking for Mentorship in E-commerce',
    content: 'I am launching an online store for Indigenous crafts. Would love to connect with someone who has experience...',
    author: { name: 'Maria Two Rivers' },
    category: 'Mentorship',
    likes: 8,
    replies: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: '4',
    title: 'Success Story: From Idea to $100K Revenue',
    content: 'Three years ago I started with just an idea. Today I want to share my journey and what I learned...',
    author: { name: 'Robert White Eagle' },
    category: 'Success Stories',
    likes: 89,
    replies: 34,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: '5',
    title: 'OCAP™ Compliance Questions',
    content: 'Can someone explain how OCAP principles apply to customer data in an e-commerce context?',
    author: { name: 'Lisa Deer' },
    category: 'Compliance',
    likes: 12,
    replies: 7,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
];

const categories = ['All', 'Funding', 'Culture', 'Mentorship', 'Success Stories', 'Compliance'];

export default function ForumPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showNewPost, setShowNewPost] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                          post.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedPosts = filteredPosts.filter(p => p.pinned);
  const regularPosts = filteredPosts.filter(p => !p.pinned);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground">Connect, learn, and share with fellow Indigenous entrepreneurs</p>
          </div>
          <Button onClick={() => setShowNewPost(!showNewPost)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,250</p>
                <p className="text-sm text-muted-foreground">Community Members</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">324</p>
                <p className="text-sm text-muted-foreground">Active Discussions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Posts This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Post title..." />
              <Textarea placeholder="Share your thoughts, questions, or experiences..." className="min-h-[120px]" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
                <Button>Post to Community</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📌 Pinned Discussions
            </h2>
            <div className="space-y-4">
              {pinnedPosts.map(post => (
                <Card key={post.id} className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{post.category}</Badge>
                          <Badge variant="outline">Pinned</Badge>
                        </div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                          </span>
                          <span className="ml-auto">{post.author.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Discussions</h2>
          <div className="space-y-4">
            {regularPosts.map(post => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-1">{post.category}</Badge>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                        </span>
                        <span className="ml-auto">{post.author.name}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
