import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Globe } from 'lucide-react';

import HeroImage from '@/assets/hero-image.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HeroImage})` }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      <div className="absolute inset-0 pattern-geometric opacity-20" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Biidaasige Naadamaage • Community-Driven Innovation
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Empowering Indigenous
            <span className="block gradient-earth bg-clip-text text-transparent">
              Entrepreneurs
            </span>
            with AI-Driven Tools
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Gichi-manidoo miigwech. A culturally respectful platform harmonizing traditional Indigenous knowledge 
            with cutting-edge AI technology to support business growth while honoring data sovereignty principles.
          </p>

          {/* Key features */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>OCAP™ Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Multi-Language Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Matching</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero"
              size="lg" 
              className="group px-8 py-6 text-lg font-semibold"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 hover:bg-muted/50 transition-smooth px-8 py-6 text-lg font-semibold"
              onClick={() => {
                const element = document.querySelector('#features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Platform
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 border-t border-border/50">
            <div className="text-center space-y-2 animate-gentle-float">
              <div className="font-display text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Indigenous Businesses Supported</div>
            </div>
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '0.5s' }}>
              <div className="font-display text-3xl font-bold text-secondary">$2.5M</div>
              <div className="text-sm text-muted-foreground">Funding Connected</div>
            </div>
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '1s' }}>
              <div className="font-display text-3xl font-bold text-accent">50+</div>
              <div className="text-sm text-muted-foreground">Community Partnerships</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 gradient-earth rounded-full opacity-20 animate-gentle-float" />
      <div className="absolute bottom-20 right-10 w-16 h-16 gradient-sky rounded-full opacity-20 animate-gentle-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 gradient-hero rounded-full opacity-15 animate-gentle-float" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default HeroSection;