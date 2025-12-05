import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Shield, Globe, Sparkles } from 'lucide-react';
import InteractiveQuiz from './InteractiveQuiz';
import VideoModal from './VideoModal';
import CountUpStats from './CountUpStats';

const HeroSection = () => {
  return (
    <section 
      id="hero" 
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden bg-background"
      aria-label="Welcome to Indigenous Rising AI"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="order-2 lg:order-1 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Biidaasige Naadamaage • Community-Driven Innovation
          </div>
          
          {/* Main heading */}
          <h1 className="font-display text-5xl lg:text-7xl leading-[1.1] tracking-tight mb-6 text-foreground">
            Empowering Indigenous
            <span className="block italic text-primary">Entrepreneurs</span>
            with AI-Driven Tools
          </h1>
          
          <p className="text-lg text-foreground/80 mb-2 font-medium">
            OCAP™ Compliant • Multi-Language Support • AI-Powered
          </p>
          <p className="text-base text-foreground/60 mb-8 max-w-md leading-relaxed">
            Gichi-manidoo miigwech. A culturally respectful platform harmonizing traditional Indigenous knowledge 
            with cutting-edge AI technology to support business growth while honoring data sovereignty principles.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-[hsl(15,60%,55%)] transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <VideoModal 
              triggerText="Watch How It Works"
              triggerVariant="outline"
              triggerSize="lg"
              triggerClassName="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-foreground text-sm font-semibold rounded-full hover:border-primary hover:text-primary transition-all duration-300"
            />
          </div>

          {/* Key features badges */}
          <div className="mt-10 flex flex-wrap items-center gap-4 text-xs text-foreground/50 font-medium">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              OCAP™ Compliant
            </span>
            <span className="w-1 h-1 rounded-full bg-foreground/20" />
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Multi-Language Support
            </span>
            <span className="w-1 h-1 rounded-full bg-foreground/20" />
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Matching
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="order-1 lg:order-2 relative">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/10 aspect-[4/5] lg:aspect-[3/4] max-w-md mx-auto lg:max-w-full">
            <picture>
              <source
                srcSet="/hero-image-400.webp 400w, /hero-image-800.webp 800w, /hero-image-1200.webp 1200w, /hero-image-1920.webp 1920w"
                sizes="(max-width: 1024px) 400px, 600px"
                type="image/webp"
              />
              <img
                src="/hero-image-1200.webp"
                alt="Indigenous entrepreneurs collaborating with technology, representing community-driven innovation and business growth"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={600}
                height={800}
              />
            </picture>
            
            {/* Decorative overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-foreground/40 to-transparent" />
            <div className="absolute bottom-6 left-6 text-card/90 font-display italic text-xl">
              "Innovation rooted in tradition."
            </div>
          </div>
          
          {/* Abstract Decorative Shapes */}
          <div className="absolute -z-10 top-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Interactive Quiz */}
      <div className="max-w-7xl mx-auto mt-16">
        <InteractiveQuiz />
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-border">
        <div className="text-center space-y-2">
          <div className="font-display text-5xl font-medium text-primary">
            <CountUpStats end={500} suffix="+" />
          </div>
          <div className="text-sm font-medium text-foreground/60">Indigenous Businesses Supported</div>
        </div>
        <div className="text-center space-y-2">
          <div className="font-display text-5xl font-medium text-secondary">
            $<CountUpStats end={2.5} decimals={1} />M
          </div>
          <div className="text-sm font-medium text-foreground/60">Funding Connected</div>
        </div>
        <div className="text-center space-y-2">
          <div className="font-display text-5xl font-medium text-accent">
            <CountUpStats end={50} suffix="+" />
          </div>
          <div className="text-sm font-medium text-foreground/60">Community Partnerships</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;