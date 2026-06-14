import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Calendar, Clock, User, Share2, BookOpen,
  ArrowRight, ChevronUp, Facebook, Twitter, Linkedin, Link as LinkIcon
} from 'lucide-react';
import { getBlogBySlug, getRelatedPosts, getPostImage } from '@/data/blogPosts';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

// Old blog slugs that were renamed (and were in the sitemap, soft-404'ing).
// Handled here rather than as App-level redirect routes so it doesn't depend on
// React Router static-vs-dynamic route ranking — when getBlogBySlug misses, we
// check this map and redirect, recovering link equity from the old URLs.
const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  'indigenous-business-grants-alberta-2025': 'indigenous-business-funding-alberta-complete-guide',
  'indigenous-business-grants-british-columbia-2025': 'bc-indigenous-business-grants-loans-complete-resource',
  'indigenous-business-grants-ontario-2025': 'ontario-indigenous-business-funding-programs-grants-support',
  'how-to-apply-indigenous-business-funding-canada': 'how-to-apply-indigenous-business-funding-step-by-step',
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const post = slug ? getBlogBySlug(slug) : undefined;
  const relatedPosts = post ? getRelatedPosts(post.relatedPosts) : [];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Redirect a known renamed slug to its current article before rendering 404.
  // MUST come after the hooks above — an early return before them would change
  // the hook count between renders (Rules of Hooks) and crash the page.
  if (!post && slug && LEGACY_SLUG_REDIRECTS[slug]) {
    return <Navigate to={`/blog/${LEGACY_SLUG_REDIRECTS[slug]}`} replace />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Article Not Found | Indigenous Rising AI</title>
        </Helmet>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BASE_URL = 'https://www.indigenousrising.ai';
  const shareUrl = `${BASE_URL}/blog/${post.slug}`;
  const absoluteImage = `${BASE_URL}${getPostImage(post.id)}`;
  
  const handleShare = async (platform?: string) => {
    const shareData = {
      title: post.title,
      text: post.summary,
      url: shareUrl
    };

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Indigenous Rising AI</title>
        <meta name="description" content={post.summary} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <link rel="canonical" href={shareUrl} />
        
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={absoluteImage} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
        {post.keywords.map((kw, i) => (
          <meta key={i} property="article:tag" content={kw} />
        ))}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.summary} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": shareUrl }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.summary,
            "image": absoluteImage,
            "url": shareUrl,
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt,
            "author": {
              "@type": "Organization",
              "name": post.author.name
            },
            "publisher": {
              "@type": "Organization",
              "name": "Indigenous Rising AI",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.indigenousrising.ai/logo-icon.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": shareUrl
            },
            "keywords": post.keywords.join(', '),
            "articleSection": post.category,
            "wordCount": post.introduction.split(' ').length +
              post.sections.reduce((acc, s) =>
                acc + s.content.split(' ').length +
                (s.subsections?.reduce((a, sub) => a + sub.content.split(' ').length, 0) ?? 0), 0)
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white mb-6"
              onClick={() => navigate('/blog')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
            
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              {post.title}
            </h1>
            
            <p className="text-lg text-white/80 mb-8">
              {post.summary}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </div>

        {/* Hero image — was previously only emitted in OG/meta, not visible */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <img
            src={getPostImage(post.id)}
            alt={post.title}
            className="w-full aspect-[16/9] object-cover rounded-2xl border border-border/50"
            loading="eager"
            width={1200}
            height={675}
          />
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* Share Bar */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share:
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-9 h-9"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-9 h-9"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-9 h-9"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-9 h-9"
                onClick={() => handleShare('copy')}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table of Contents */}
          <Card className="mb-8 bg-muted/30">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">In This Article</h2>
              <nav className="space-y-2">
                {post.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Introduction */}
          <article className="prose prose-lg max-w-none mb-12">
            {post.introduction.split('\n\n').map((para, i) => (
              <p key={i} className="text-foreground/90 leading-relaxed">
                {para}
              </p>
            ))}
          </article>

          {/* Sections */}
          {post.sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-display font-bold mb-6">{section.title}</h2>
              <div className="prose prose-lg max-w-none">
                {section.content.split('\n\n').map((para, i) => {
                  // Handle bold headers
                  if (para.startsWith('**') && para.includes(':**')) {
                    const [header, ...rest] = para.split(':**');
                    return (
                      <div key={i} className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {header.replace(/\*\*/g, '')}
                        </h3>
                        <p className="text-foreground/90">{rest.join(':**')}</p>
                      </div>
                    );
                  }
                  // Handle lists
                  if (para.includes('\n- ')) {
                    const [intro, ...items] = para.split('\n- ');
                    return (
                      <div key={i} className="mb-4">
                        {intro && <p className="text-foreground/90 mb-2">{intro}</p>}
                        <ul className="list-disc pl-6 space-y-1">
                          {items.map((item, j) => (
                            <li key={j} className="text-foreground/90">{item}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                      {para}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-display font-bold mb-4">
                Ready to Find Your Funding?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {post.cta}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/auth">
                    Start Your Search
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <div className="mb-12">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-12" />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-display font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all hover:border-primary/30">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="text-xs mb-3">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.summary}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Scroll to Top */}
        {showScrollTop && (
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg"
            onClick={scrollToTop}
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
