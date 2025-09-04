import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Shield } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-primary/70" />
      {/* Background decorative elements */}
      <div className="absolute inset-0 pattern-geometric opacity-5" />
      <div className="absolute top-10 left-10 w-32 h-32 gradient-earth rounded-full opacity-20 animate-gentle-float" />
      <div className="absolute bottom-10 right-10 w-24 h-24 gradient-sky rounded-full opacity-20 animate-gentle-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 gradient-subtle rounded-full opacity-15 animate-gentle-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white drop-shadow-sm">
              Maadaadizi • Begin Your Journey Today
            </span>
          </div>

          {/* Main heading */}
          <h2 className="font-display text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
            Ready to Transform Your
            <span className="block text-white drop-shadow-lg">
              Indigenous Business?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl font-semibold text-white max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Join thousands of Indigenous entrepreneurs who are building sustainable, culturally grounded businesses 
            with our AI-powered platform. Start your free account today and discover opportunities that respect 
            your values while driving growth.
          </p>

          {/* Key benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <div className="flex flex-col items-center space-y-3 text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <Shield className="w-8 h-8 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 drop-shadow-sm">OCAP™ Protected</h3>
                <p className="text-sm text-white font-medium drop-shadow-sm">Your data sovereignty guaranteed</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <Users className="w-8 h-8 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 drop-shadow-sm">Community Driven</h3>
                <p className="text-sm text-white font-medium drop-shadow-sm">Built by and for Indigenous peoples</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <Sparkles className="w-8 h-8 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 drop-shadow-sm">AI Enhanced</h3>
                <p className="text-sm text-white font-medium drop-shadow-sm">Modern tools, traditional wisdom</p>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              className="group bg-white text-primary hover:bg-white/90 shadow-2xl px-8 py-6 text-lg font-bold border-2 border-white/50"
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
              size="lg"
              className="border-2 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg font-bold shadow-xl bg-white/10"
              onClick={() => {
                window.open('mailto:hello@indigenousrising.ai?subject=Demo Request&body=I would like to schedule a demo of the Indigenous AI Business Support Platform.', '_blank');
              }}
            >
              Schedule Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 border-t border-white/30 bg-white/5 backdrop-blur-sm rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-4 drop-shadow-sm">Trusted by Indigenous organizations across Canada</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="text-white font-bold text-sm drop-shadow-sm">NACCA Partner</div>
              <div className="w-1 h-1 bg-white rounded-full" />
              <div className="text-white font-bold text-sm drop-shadow-sm">CCIB Member</div>
              <div className="w-1 h-1 bg-white rounded-full" />
              <div className="text-white font-bold text-sm drop-shadow-sm">AFN Endorsed</div>
              <div className="w-1 h-1 bg-white rounded-full" />
              <div className="text-white font-bold text-sm drop-shadow-sm">TRC Aligned</div>
            </div>
          </div>

          {/* Additional incentive */}
          <div className="bg-white/15 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl">
            <p className="text-white font-bold mb-2 drop-shadow-sm">
              🎁 Limited Time: First 100 Indigenous entrepreneurs get
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white">
              <span className="font-black text-xl drop-shadow-sm">3 months Premium free</span>
              <span className="text-white font-semibold drop-shadow-sm">+ personalized onboarding session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;