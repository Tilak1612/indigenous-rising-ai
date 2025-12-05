import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Globe, ChevronDown } from 'lucide-react';
import InteractiveQuiz from './InteractiveQuiz';
import VideoModal from './VideoModal';
import CountUpStats from './CountUpStats';

const HeroSection = () => {
  const scrollToCollections = () => {
    const element = document.querySelector('#features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero"
      aria-label="Welcome to Indigenous Rising AI"
    >
      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-xl floating" />
      <div className="absolute bottom-1/3 right-16 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-xl floating" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-xl floating" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-xl floating" style={{ animationDelay: '-1s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <div className="fade-in">
          {/* Badge */}
          <div className="mb-8 slide-up">
            <span className="inline-flex items-center gap-2 glass bg-card/60 border border-border/40 text-foreground text-sm font-medium rounded-full py-3 px-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              Biidaasige Naadamaage • Community-Driven Innovation
            </span>
          </div>

          {/* Main heading */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl leading-none font-light tracking-tight font-display">
              <span className="bg-gradient-to-r from-foreground via-muted-foreground to-secondary bg-clip-text text-transparent inline-block mb-4">
                Empowering Indigenous
              </span>
              <span className="block font-light text-muted-foreground/60 relative">
                <span>Entrepreneurs</span>
                <div className="absolute -right-8 -top-4 w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-60 blur-sm floating" />
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed slide-up font-light text-muted-foreground">
            Gichi-manidoo miigwech. A culturally respectful platform harmonizing traditional Indigenous knowledge 
            with cutting-edge AI technology to support business growth while honoring data sovereignty principles.
          </p>

          {/* Key features */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 slide-up stagger-1">
            <div className="flex items-center gap-2 glass bg-card/50 border border-border/30 px-4 py-2 rounded-full text-sm font-medium text-foreground">
              <Shield className="w-4 h-4 text-secondary" />
              <span>OCAP™ Compliant</span>
            </div>
            <div className="flex items-center gap-2 glass bg-card/50 border border-border/30 px-4 py-2 rounded-full text-sm font-medium text-foreground">
              <Globe className="w-4 h-4 text-secondary" />
              <span>Multi-Language Support</span>
            </div>
            <div className="flex items-center gap-2 glass bg-card/50 border border-border/30 px-4 py-2 rounded-full text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>AI-Powered Matching</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 slide-up stagger-2 mb-12">
            <Button 
              className="group glass bg-card/90 border border-border/60 rounded-2xl px-10 py-6 font-medium hover-lift magnetic flex items-center gap-3 shadow-aura-lg hover:shadow-aura-xl transition-all duration-300 text-foreground h-auto"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="w-5 h-5" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <VideoModal 
              triggerText="Watch How It Works"
              triggerVariant="default"
              triggerSize="lg"
              triggerClassName="glass bg-gradient-purple border border-primary/20 rounded-2xl px-10 py-6 font-medium hover-lift magnetic flex items-center gap-3 shadow-aura-lg hover:shadow-glow-lg transition-all duration-300 text-primary-foreground h-auto"
            />
          </div>

          {/* Interactive Quiz */}
          <div className="mt-8 mb-12">
            <InteractiveQuiz />
          </div>

          {/* Statistics */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 slide-up stagger-3">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-light font-display mb-1 text-foreground">
                <CountUpStats end={500} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Indigenous Businesses Supported</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-light font-display mb-1 text-foreground">
                $<CountUpStats end={2.5} decimals={1} />M
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Funding Connected</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-light font-display mb-1 text-foreground">
                <CountUpStats end={50} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Community Partnerships</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 slide-up stagger-4">
        <button 
          onClick={scrollToCollections}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth cursor-pointer group"
        >
          <span className="text-sm font-medium tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-border group-hover:bg-foreground transition-smooth" />
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
