import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, Calendar, Clock, ArrowRight, BookOpen, 
  TrendingUp, Filter, ChevronDown 
} from 'lucide-react';
import { getAllPosts, getAllCategories, searchBlogs, getPostImage } from '@/data/blogPosts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getAllCategories();

  const filteredPosts = useMemo(() => {
    let posts = getAllPosts();
    
    if (searchQuery) {
      posts = searchBlogs(searchQuery);
    }
    
    if (selectedCategory) {
      posts = posts.filter(post => post.category === selectedCategory);
    }
    
    return posts;
  }, [searchQuery, selectedCategory]);

  const featuredPost = blogPosts[0];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Indigenous Business Funding Blog | Indigenous Rising AI</title>
        <meta name="description" content="Expert guides on Indigenous business grants, First Nations funding, Métis entrepreneur programs, and Inuit business support. Learn how to access funding for your Indigenous business." />
        <meta name="keywords" content="Indigenous business grants Canada, First Nations funding, Métis entrepreneur grants, Inuit business support, Indigenous small business" />
        <link rel="canonical" href="https://indigenousrising.ai/blog" />
        
        <meta property="og:title" content="Indigenous Business Funding Blog | Indigenous Rising AI" />
        <meta property="og:description" content="Expert guides on Indigenous business grants, First Nations funding, Métis entrepreneur programs, and Inuit business support." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indigenousrising.ai/blog" />
        <meta property="og:image" content="/og-home.jpg" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Indigenous Business Funding Blog",
            "description": "Expert guides on Indigenous business funding in Canada",
            "url": "https://indigenousrising.ai/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Indigenous Rising AI",
              "logo": {
                "@type": "ImageObject",
                "url": "https://indigenousrising.ai/logo-icon.png"
              }
            },
            "blogPost": blogPosts.slice(0, 10).map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.summary,
              "url": `https://indigenousrising.ai/blog/${post.slug}`,
              "datePublished": post.publishedAt,
              "dateModified": post.updatedAt,
              "author": {
                "@type": "Organization",
                "name": post.author.name
              }
            }))
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                Indigenous Business Resources
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Indigenous Business Funding Blog
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Expert guides on grants, loans, and support programs for First Nations, 
                Métis, and Inuit entrepreneurs across Canada.
              </p>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {selectedCategory || 'All Categories'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  All Categories
                </DropdownMenuItem>
                {categories.map(category => (
                  <DropdownMenuItem 
                    key={category} 
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Featured Post */}
          {!searchQuery && !selectedCategory && (
            <Link to={`/blog/${featuredPost.slug}`} className="block mb-12 group">
              <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img 
                      src={getPostImage(featuredPost.id)} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <Badge variant="secondary" className="w-fit mb-4">
                      Featured Guide
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {featuredPost.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime} min read
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              // Skip featured post in grid if not filtering
              (!searchQuery && !selectedCategory && idx === 0) ? null : (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary/30 overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={getPostImage(post.id)} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Categories Section */}
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-display font-bold mb-6">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => {
                const count = blogPosts.filter(p => p.category === category).length;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category ? null : category
                    )}
                    className="gap-2"
                  >
                    {category}
                    <Badge variant="secondary" className="ml-1">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Ready to Find Your Funding?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Use Indigenous Rising AI to search hundreds of business funding programs 
              and find the grants and loans that match your business vision.
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
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
