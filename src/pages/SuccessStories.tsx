import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import SuccessGallery from '../components/SuccessGallery';
import ImpactCalculator from '../components/ImpactCalculator';
import ElderWisdom from '../components/ElderWisdom';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Star, Heart } from 'lucide-react';

const SuccessStories = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags 
        title="Success Stories | Indigenous Rising AI"
        description="Discover inspiring stories of Indigenous entrepreneurs who have grown their businesses with Indigenous Rising AI. See real community impact and learn from Elder wisdom."
        keywords="Indigenous success stories, Indigenous entrepreneurs, community impact, Elder wisdom, business growth"
      />
      <Navigation />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/90 to-primary py-20">
          <div className="container mx-auto px-4">
            <Breadcrumbs />
            <div className="max-w-4xl mx-auto text-center mt-8">
              <div className="inline-flex items-center space-x-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-4 py-2 mb-6">
                <Star className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-primary-foreground">Community Impact</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-black text-primary-foreground mb-6">
                Stories of Indigenous
                <span className="block text-secondary">
                  Business Success
                </span>
              </h1>
              
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Real entrepreneurs, real growth, real community impact. Discover how Indigenous 
                business owners across Turtle Island are building thriving enterprises while 
                honoring traditional values.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                  <Link to="/funding">
                    Explore Funding
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="bg-card border-y border-border py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <Users className="w-8 h-8 text-primary mx-auto" />
                <p className="text-4xl font-bold text-foreground">2,500+</p>
                <p className="text-muted-foreground">Indigenous Businesses Supported</p>
              </div>
              <div className="space-y-2">
                <Heart className="w-8 h-8 text-primary mx-auto" />
                <p className="text-4xl font-bold text-foreground">$15M+</p>
                <p className="text-muted-foreground">Funding Secured</p>
              </div>
              <div className="space-y-2">
                <Star className="w-8 h-8 text-primary mx-auto" />
                <p className="text-4xl font-bold text-foreground">50+</p>
                <p className="text-muted-foreground">Communities Served</p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Gallery */}
        <SuccessGallery />

        {/* Impact Calculator */}
        <ImpactCalculator />

        {/* Elder Wisdom */}
        <ElderWisdom />

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Indigenous entrepreneurs who are building thriving businesses 
              while honoring their cultural values.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessStories;
