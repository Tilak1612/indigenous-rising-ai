import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, ArrowLeft, Clock, Send } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  body: string;
  display_name: string;
  category: string;
  upvotes: number;
  created_at: string;
}

interface Comment {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
}

const CommunityPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    const { data } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    const load = async () => {
      setLoading(true);

      const { data: postData, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('id', postId)
        .eq('is_approved', true)
        .single();

      if (error || !postData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(postData);
      setLocalUpvotes(postData.upvotes ?? 0);

      await fetchComments();

      if (user) {
        const { data: vote } = await supabase
          .from('community_votes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        setHasVoted(!!vote);
      }

      setLoading(false);
    };

    load();
  }, [postId, user, fetchComments]);

  const handleVote = async () => {
    if (!user) {
      setToastMsg('Sign in to upvote');
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    if (!postId) return;

    if (hasVoted) {
      setHasVoted(false);
      setLocalUpvotes((prev) => prev - 1);
      await supabase
        .from('community_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      setHasVoted(true);
      setLocalUpvotes((prev) => prev + 1);
      await supabase
        .from('community_votes')
        .insert({ post_id: postId, user_id: user.id });
    }
  };

  const handleComment = async () => {
    if (!user || !postId || !commentBody.trim()) return;
    setSubmitting(true);

    const displayName =
      user.user_metadata?.full_name || user.email || 'Community Member';

    await supabase.from('community_comments').insert({
      user_id: user.id,
      post_id: postId,
      display_name: displayName,
      body: commentBody.trim(),
    });

    setCommentBody('');
    await fetchComments();
    setSubmitting(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-32 pb-16 text-center text-muted-foreground">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This post may have been removed or is awaiting approval.
          </p>
          <Button asChild variant="outline">
            <Link to="/community">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-16">
        {/* Back link */}
        <Link
          to="/community"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>

        {/* Post */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(post.display_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.display_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(post.created_at)}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {post.category}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{post.title}</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              {post.body.split('\n').map((paragraph, i) =>
                paragraph.trim() ? <p key={i}>{paragraph}</p> : null
              )}
            </div>

            {/* Vote button */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                variant={hasVoted ? 'default' : 'outline'}
                size="sm"
                onClick={handleVote}
                className="gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                {localUpvotes}
              </Button>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Toast */}
            {toastMsg && (
              <div className="rounded-md bg-muted px-4 py-2 text-sm">
                {toastMsg}{' '}
                <Link to="/auth" className="underline font-medium">
                  Sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </h2>

          {comments.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(c.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{c.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}

          {/* Comment form */}
          {user ? (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!commentBody.trim() || submitting}
                    onClick={handleComment}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4 text-center py-8">
                <p className="text-muted-foreground mb-3">
                  Sign in to join the conversation
                </p>
                <Button asChild variant="outline">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPost;
