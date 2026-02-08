import { ShinyButton } from '@/components/ui/shiny-button';
import { ArrowRight, Play, ChevronDown, Sparkles, Shield, Globe } from 'lucide-react';
import InteractiveQuiz from './InteractiveQuiz';
import VideoModal from './VideoModal';
import CountUpStats from './CountUpStats';
import heroImage from '@/assets/hero-image.jpg';

const HeroSection = () => {
  const scrollToFeatures = () => {
    const element = document.querySelector('#features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStats = () => {
    const element = document.querySelector('#stats');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative isolate min-h-screen" aria-label="Welcome to Indigenous Rising AI">
      {/* Background image - SAME image for all breakpoints */}
      <div className="absolute inset-0 -z-10">
        <img 
          src={heroImage} 
          alt="Indigenous entrepreneurs collaborating in a bright workspace" 
          className="w-full h-full object-cover object-[50%_35%]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-28 pb-16 sm:pt-32 md:pt-36 lg:pt-40 sm:pb-20 lg:pb-24">
          {/* Brand badge */}
          <div 
            className="flex flex-col gap-2 sm:gap-3 lg:gap-4 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.2s forwards' }}
          >
            <span className="inline-flex items-center gap-2 text-white/80 text-sm font-medium font-geist mb-4">
              <Sparkles className="w-4 h-4" />
              Biidaasige Naadamaage • Community-Driven Innovation
            </span>
            
            {/* Main heading */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white font-geist tracking-tighter" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)' }}>
              Empowering Indigenous Entrepreneurs
            </h1>
          </div>

          {/* Subtitle */}
          <p 
            className="mt-6 max-w-2xl text-white/90 text-base sm:text-lg leading-relaxed font-geist opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.6s forwards', textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)' }}
          >
            Gichi-manidoo miigwech. A culturally respectful platform harmonizing traditional Indigenous knowledge 
            with cutting-edge AI technology to support business growth while honoring data sovereignty principles.
          </p>

          {/* Key features badges */}
          <div 
            className="mt-6 flex flex-wrap gap-3 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.8s forwards' }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium rounded-full px-4 py-2 ring-1 ring-white/20 backdrop-blur">
              <Shield className="w-4 h-4" />
              <span className="font-geist">OCAP™ Compliant</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium rounded-full px-4 py-2 ring-1 ring-white/20 backdrop-blur">
              <Globe className="w-4 h-4" />
              <span className="font-geist">Multi-Language Support</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium rounded-full px-4 py-2 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="w-4 h-4" />
              <span className="font-geist">AI-Powered Matching</span>
            </div>
          </div>

          {/* CTAs */}
          <div 
            className="mt-8 flex flex-wrap items-center gap-4 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1s forwards' }}
          >
            <ShinyButton 
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group"
            >
              <span className="font-geist">Start Your Journey</span>
              <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-0.5 transition-transform" />
            </ShinyButton>
            
            <VideoModal 
              triggerText="Watch How It Works"
              triggerSize="lg"
              triggerClassName="inline-flex items-center gap-2"
            />
          </div>

          {/* Interactive Quiz */}
          <div 
            className="mt-10 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.2s forwards' }}
          >
            <InteractiveQuiz />
          </div>

          {/* Scroll indicator */}
          <div 
            className="mt-16 sm:mt-20 flex justify-center opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.4s forwards' }}
          >
            <button 
              onClick={scrollToStats}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition font-geist"
            >
              <ChevronDown className="w-6 h-4 animate-pulse-soft" />
              Scroll to See More
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideBlurIn {
          0% {
            opacity: 0;
            transform: translateY(32px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
