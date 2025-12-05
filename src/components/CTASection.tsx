import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Shield } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-purple" />
      <div className="absolute inset-0 pattern-geometric opacity-5" />
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl floating" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl floating" style={{ animationDelay: '-2s' }} />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-blue-400/20 rounded-full blur-xl floating" style={{ animationDelay: '-4s' }} />
      
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
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-white/80 slide-up stagger-2">
            Join thousands of Indigenous entrepreneurs who are building sustainable, culturally grounded businesses 
            with our AI-powered platform. Start your free account today and discover opportunities that respect 
            your values while driving growth.
          </p>

          {/* Key benefits grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 slide-up stagger-3">
            <div className="glass bg-white/10 border border-white/20 rounded-3xl p-8 hover-lift">
              <div className="w-16 h-16 glass bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">OCAP™ Protected</h3>
              <p className="text-sm text-white/70">Your data sovereignty guaranteed</p>
            </div>
            
            <div className="glass bg-white/10 border border-white/20 rounded-3xl p-8 hover-lift">
              <div className="w-16 h-16 glass bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">Community Driven</h3>
              <p className="text-sm text-white/70">Built by and for Indigenous peoples</p>
            </div>
            
            <div className="glass bg-white/10 border border-white/20 rounded-3xl p-8 hover-lift">
              <div className="w-16 h-16 glass bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">AI Enhanced</h3>
              <p className="text-sm text-white/70">Modern tools, traditional wisdom</p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center slide-up stagger-4">
            <Button 
              className="group glass bg-white text-primary hover:bg-white/90 rounded-2xl px-10 py-6 font-medium shadow-aura-xl hover:shadow-aura-xl transition-all duration-300 h-auto text-lg"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Free Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              className="glass bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 rounded-2xl px-10 py-6 font-medium shadow-aura-lg transition-all duration-300 h-auto text-lg"
              onClick={() => {
                window.open('mailto:hello@indigenousrising.ai?subject=Demo Request&body=I would like to schedule a demo of the Indigenous Rising AI Business Support Platform.', '_blank');
              }}
            >
              Schedule Demo
            </Button>
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

          {/* Limited time offer */}
          <div className="glass bg-white/15 border-2 border-white/30 rounded-3xl p-8 max-w-2xl mx-auto slide-up stagger-4">
            <p className="text-white font-semibold mb-3">
              🎁 Limited Time: First 100 Indigenous entrepreneurs get
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white">
              <span className="font-bold text-xl">3 months Premium free</span>
              <span className="text-white/80">+ personalized onboarding session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
