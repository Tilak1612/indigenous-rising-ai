import { ShinyButton } from '@/components/ui/shiny-button';
import { ArrowRight, Play, ChevronDown, Sparkles, Shield, Globe } from 'lucide-react';
import InteractiveQuiz from './InteractiveQuiz';
import VideoModal from './VideoModal';
import CountUpStats from './CountUpStats';

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
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <picture>
          <source media="(min-width: 1025px)" srcSet="/hero-image-1200.webp" type="image/webp" />
          <source media="(min-width: 640px) and (max-width: 1024px)" srcSet="/hero-image-800.webp" type="image/webp" />
          <source media="(max-width: 639px)" srcSet="/hero-image-mobile.webp" type="image/webp" />
          <img 
            src="/hero-image-mobile.webp" 
            alt="Indigenous community gathering with mountains in background" 
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-24 pb-12 sm:pt-32 sm:pb-20 md:pt-36 lg:pt-40 lg:pb-24">
          {/* Brand badge */}
          <div 
            className="flex flex-col gap-1.5 sm:gap-3 lg:gap-4 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.2s forwards' }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 text-xs sm:text-sm font-medium font-geist mb-2 sm:mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Biidaasige Naadamaage • </span>Community-Driven Innovation
            </span>
            
            {/* Main heading */}
            <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white font-geist tracking-tight sm:tracking-tighter leading-[1.1]" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)' }}>
              Empowering Indigenous Entrepreneurs
            </h1>
          </div>

          {/* Subtitle */}
          <p 
            className="mt-4 sm:mt-6 max-w-xl sm:max-w-2xl text-white/90 text-sm sm:text-base md:text-lg leading-relaxed font-geist opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.6s forwards', textShadow: '0 2px 12px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)' }}
          >
            <span className="hidden sm:inline">Gichi-manidoo miigwech. </span>A culturally respectful platform harmonizing traditional Indigenous knowledge 
            with cutting-edge AI technology to support business growth.
          </p>

          {/* Key features badges */}
          <div 
            className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.8s forwards' }}
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white text-xs sm:text-sm font-medium rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 ring-1 ring-white/20 backdrop-blur">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-geist">OCAP™</span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white text-xs sm:text-sm font-medium rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 ring-1 ring-white/20 backdrop-blur">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-geist">Multi-Language</span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 text-white text-xs sm:text-sm font-medium rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-geist">AI-Powered</span>
            </div>
          </div>

          {/* CTAs */}
          <div 
            className="mt-5 sm:mt-8 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-3 sm:gap-4 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1s forwards' }}
          >
            <ShinyButton 
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group w-full xs:w-auto justify-center"
              size="default"
            >
              <span className="font-geist text-sm sm:text-base">Start Your Journey</span>
              <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-0.5 transition-transform" />
            </ShinyButton>
            
            <VideoModal 
              triggerText="Watch Demo"
              triggerSize="default"
              triggerClassName="inline-flex items-center gap-2 justify-center w-full xs:w-auto"
            />
          </div>

          {/* Interactive Quiz */}
          <div 
            className="mt-6 sm:mt-10 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.2s forwards' }}
          >
            <InteractiveQuiz />
          </div>

          {/* Scroll indicator */}
          <div 
            className="mt-10 sm:mt-16 md:mt-20 flex justify-center opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.4s forwards' }}
          >
            <button 
              onClick={scrollToStats}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-white/80 hover:text-white text-xs sm:text-sm font-medium transition font-geist"
            >
              <ChevronDown className="w-5 h-4 sm:w-6 sm:h-4 animate-pulse-soft" />
              <span className="hidden xs:inline">Scroll to </span>See More
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
