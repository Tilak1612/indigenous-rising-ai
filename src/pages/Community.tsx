import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, ThumbsUp, Pin, Plus, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { sanitizeInput } from '@/lib/sanitize';

interface CommunityPost {
  id: string;
  user_id: string;
  display_name: string;
  title: string;
  body: string;
  category: string;
  upvote_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: string;
}

const CATEGORIES = ['All', 'Feedback', 'Funding Tips', 'Business Advice', 'Success Stories'] as const;
type Category = (typeof CATEGORIES)[number];

const categoryColors: Record<string, string> = {
  'Feedback': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Funding Tips': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Business Advice': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  'Success Stories': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', category: 'Feedback' });

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('is_approved', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeCategory !== 'All') {
      query = query.eq('category', activeCategory);
    }

    const { data, error } = await query;
    if (!error && data) {
      setPosts(data as CommunityPost[]);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPosts depends on activeCategory via closure
  useEffect(() => { fetchPosts(); }, [activeCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const title = sanitizeInput(newPost.title, 200);
    const body = sanitizeInput(newPost.body, 5000);
    if (!title.trim() || !body.trim()) return;

    setSubmitting(true);
    const displayName = user.user_metadata?.full_name || user.email || 'Community Member';

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      display_name: displayName,
      title,
      body,
      category: newPost.category,
    });

    if (!error) {
      setNewPost({ title: '', body: '', category: 'Feedback' });
      setShowForm(false);
      await fetchPosts();
    }
    setSubmitting(false);
  };

  const truncateBody = (text: string, maxLen = 150) => {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + '...';
  };

  return (
    <>
      <Helmet>
        <title>Community Forum | Indigenous Rising AI</title>
        <meta
          name="description"
          content="Join the Indigenous Rising AI community. Share funding tips, business advice, success stories, and connect with Indigenous entrepreneurs across Canada."
        />
        <link rel="canonical" href="https://www.indigenousrising.ai/community" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <Users className="w-3 h-3 mr-1" />
                Community Forum
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                Community Discussions
              </h1>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                Connect with Indigenous entrepreneurs. Share tips, ask questions, and celebrate wins together.
              </p>
            </div>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* Action bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
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

            {/* Start a Discussion */}
            {user ? (
              <Button onClick={() => setShowForm((prev) => !prev)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Start a Discussion
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">
                  <Plus className="w-4 h-4 mr-1" />
                  Sign in to Post
                </Link>
              </Button>
            )}
          </div>

          {/* New post form */}
          {showForm && user && (
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <h2 className="text-lg font-semibold">New Discussion</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Discussion title"
                    value={newPost.title}
                    onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                    maxLength={200}
                    required
                  />
                  <Textarea
                    placeholder="What would you like to discuss?"
                    value={newPost.body}
                    onChange={(e) => setNewPost((p) => ({ ...p, body: e.target.value }))}
                    rows={4}
                    maxLength={5000}
                    required
                  />
                  <div className="flex items-center gap-4">
                    <Select
                      value={newPost.category}
                      onValueChange={(val) => setNewPost((p) => ({ ...p, category: val }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 ml-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Posts list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="py-6">
                    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a conversation in the community.
                </p>
                {user ? (
                  <Button onClick={() => setShowForm(true)} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Start a Discussion
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link to="/auth">Sign in to Post</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link key={post.id} to={`/community/${post.id}`} className="block group">
                  <Card className="transition-colors group-hover:border-primary/40">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {post.is_pinned && (
                              <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {post.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {truncateBody(post.body)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="font-medium">{post.display_name}</span>
                            <Badge
                              variant="secondary"
                              className={categoryColors[post.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
                            >
                              {post.category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {post.upvote_count ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {post.reply_count ?? 0}
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Community;
