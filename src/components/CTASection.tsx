import { ShinyButton } from '@/components/ui/shiny-button';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900" />
      <div className="absolute inset-0 pattern-geometric opacity-5" />
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl floating" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl floating" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl floating" style={{ animationDelay: '-4s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-8 fade-in">
          {/* Badge */}
          <div className="slide-up">
            <span className="inline-flex items-center gap-2 glass bg-white/10 border border-white/20 text-white text-sm font-medium rounded-full py-3 px-6">
              <Sparkles className="w-4 h-4" />
              Maadaadizi • Begin Your Journey Today
            </span>
          </div>

          {/* Main heading */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-light font-display text-white leading-tight tracking-tight slide-up stagger-1">
            Ready to Transform Your
            <span className="block text-white/90">
              Indigenous Business?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-white/80 slide-up stagger-2">
            Start your free account today and explore tools aligned with Indigenous values.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center slide-up stagger-3">
            <ShinyButton 
              className="group"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Free Account
              <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
            </ShinyButton>
            
            <ShinyButton 
              className="group"
              onClick={() => {
                window.open('mailto:help@indigenousrising.ai?subject=Demo Request&body=I would like to schedule a demo of the Indigenous Rising AI Business Support Platform.', '_blank');
              }}
            >
              Schedule Demo
            </ShinyButton>
          </div>

          {/* Trust indicators */}
          <div className="pt-12 slide-up stagger-4">
            <div className="glass bg-white/10 border border-white/20 rounded-3xl p-8 max-w-3xl mx-auto">
              <p className="text-sm font-medium text-white mb-6">Trusted by Indigenous organizations across Canada</p>
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
                <span className="text-white/80 font-medium text-sm">NACCA Partner</span>
                <div className="w-1 h-1 bg-white/50 rounded-full hidden sm:block" />
                <span className="text-white/80 font-medium text-sm">CCIB Member</span>
                <div className="w-1 h-1 bg-white/50 rounded-full hidden sm:block" />
                <span className="text-white/80 font-medium text-sm">AFN Endorsed</span>
                <div className="w-1 h-1 bg-white/50 rounded-full hidden sm:block" />
                <span className="text-white/80 font-medium text-sm">TRC Aligned</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;
