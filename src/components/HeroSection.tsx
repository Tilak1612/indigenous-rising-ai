import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Globe } from 'lucide-react';
import InteractiveQuiz from './InteractiveQuiz';
import VideoModal from './VideoModal';
import CountUpStats from './CountUpStats';

const HeroSection = () => {
  return (
    <section 
      id="hero" 
      className="relative z-10 px-4 sm:px-6 lg:px-8 pt-8 pb-8 mb-20 lg:mb-40 mt-0 max-w-7xl mx-auto"
      aria-label="Welcome to Indigenous Rising AI"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(251,191,36,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_120%,rgba(16,185,129,0.06),transparent_60%)]" />
      </div>

      <div className="text-center max-w-4xl mx-auto mt-32 sm:mt-40 animate-fade-slide-in">
        {/* Badge */}
        <span className="badge-amber">
          <Sparkles className="w-4 h-4" />
          Biidaasige Naadamaage • Community-Driven Innovation
        </span>

        {/* Main heading */}
        <h1 className="mt-4 sm:mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight font-medium">
          <span className="block text-white">Empowering Indigenous</span>
          <span className="block bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
            Entrepreneurs
          </span>
          <span className="block text-white">with AI-Driven Tools</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-base sm:text-lg font-normal text-slate-300/90 max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}>
          Gichi-manidoo miigwech. A culturally respectful platform harmonizing traditional Indigenous knowledge 
          with cutting-edge AI technology to support business growth while honoring data sovereignty principles.
        </p>

        {/* Key features */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-white/80">OCAP™ Compliant</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="text-white/80">Multi-Language Support</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/80">AI-Powered Matching</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="sm:mt-6 mt-4" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="btn-aura px-6 py-3 text-base font-medium text-white flex items-center gap-2 group"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <VideoModal 
              triggerText="Watch How It Works"
              triggerVariant="outline"
              triggerSize="lg"
              triggerClassName="border border-white/20 text-white/80 hover:text-white hover:bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Interactive Quiz */}
      <div className="mt-8 max-w-2xl mx-auto" style={{ animationDelay: '0.4s' }}>
        <InteractiveQuiz />
      </div>

      {/* Statistics */}
      <div className="sm:mt-20 mt-12 relative" style={{ animationDelay: '0.5s' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6 text-center border-gradient animate-gentle-float">
            <div className="text-5xl font-medium text-amber-400 tracking-tighter">
              <CountUpStats end={500} suffix="+" />
            </div>
            <div className="mt-2 text-sm text-white/70">Indigenous Businesses Supported</div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 text-center border-gradient animate-gentle-float" style={{ animationDelay: '0.5s' }}>
            <div className="text-5xl font-medium text-emerald-400 tracking-tighter">
              $<CountUpStats end={2.5} decimals={1} />M
            </div>
            <div className="mt-2 text-sm text-white/70">Funding Connected</div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 text-center border-gradient animate-gentle-float" style={{ animationDelay: '1s' }}>
            <div className="text-5xl font-medium text-amber-400 tracking-tighter">
              <CountUpStats end={50} suffix="+" />
            </div>
            <div className="mt-2 text-sm text-white/70">Community Partnerships</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
