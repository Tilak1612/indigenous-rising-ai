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
      <div className="absolute inset-0 bg-background/85 backdrop-blur-[3px]" />
      <div className="absolute inset-0 pattern-geometric opacity-20" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-natural">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Biidaasige Naadamaage • Community-Driven Innovation
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight tracking-tight drop-shadow-sm">
            Empowering Indigenous
            <span className="block gradient-earth bg-clip-text text-transparent font-black">
              Entrepreneurs
            </span>
            with AI-Driven Tools
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl font-semibold text-foreground/80 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            Gichi-manidoo miigwech. A culturally respectful platform harmonizing traditional Indigenous knowledge 
            with cutting-edge AI technology to support business growth while honoring data sovereignty principles.
          </p>

          {/* Key features */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-foreground">
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
              <Shield className="w-4 h-4 text-primary" />
              <span>OCAP™ Compliant</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
              <Globe className="w-4 h-4 text-primary" />
              <span>Multi-Language Support</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Matching</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero"
              size="lg" 
              className="group px-8 py-6 text-lg font-bold shadow-elevated"
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
              className="border-2 bg-card/80 backdrop-blur-sm hover:bg-muted/70 transition-smooth px-8 py-6 text-lg font-bold border-primary/30 text-foreground hover:text-primary"
              onClick={() => {
                const element = document.querySelector('#features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Platform
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 border-t border-border bg-card/30 backdrop-blur-sm rounded-2xl p-8 shadow-natural">
            <div className="text-center space-y-2 animate-gentle-float">
              <div className="font-display text-4xl font-black text-primary drop-shadow-sm">500+</div>
              <div className="text-sm font-bold text-foreground">Indigenous Businesses Supported</div>
            </div>
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '0.5s' }}>
              <div className="font-display text-4xl font-black text-secondary drop-shadow-sm">$2.5M</div>
              <div className="text-sm font-bold text-foreground">Funding Connected</div>
            </div>
            <div className="text-center space-y-2 animate-gentle-float" style={{ animationDelay: '1s' }}>
              <div className="font-display text-4xl font-black text-accent drop-shadow-sm">50+</div>
              <div className="text-sm font-bold text-foreground">Community Partnerships</div>
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