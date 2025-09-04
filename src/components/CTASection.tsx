import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Shield } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pattern-geometric opacity-10" />
      <div className="absolute top-10 left-10 w-32 h-32 gradient-earth rounded-full opacity-20 animate-gentle-float" />
      <div className="absolute bottom-10 right-10 w-24 h-24 gradient-sky rounded-full opacity-20 animate-gentle-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 gradient-subtle rounded-full opacity-15 animate-gentle-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white/90">
              Maadaadizi • Begin Your Journey Today
            </span>
          </div>

          {/* Main heading */}
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            Ready to Transform Your
            <span className="block">
              Indigenous Business?
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Join thousands of Indigenous entrepreneurs who are building sustainable, culturally grounded businesses 
            with our AI-powered platform. Start your free account today and discover opportunities that respect 
            your values while driving growth.
          </p>

          {/* Key benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">OCAP™ Protected</h3>
                <p className="text-sm text-white/70">Your data sovereignty guaranteed</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Community Driven</h3>
                <p className="text-sm text-white/70">Built by and for Indigenous peoples</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">AI Enhanced</h3>
                <p className="text-sm text-white/70">Modern tools, traditional wisdom</p>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              className="group bg-white text-primary hover:bg-white/90 shadow-elevated px-8 py-6 text-lg font-semibold"
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
              className="border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg font-semibold"
              onClick={() => {
                window.open('mailto:hello@indigenousai.ca?subject=Demo Request&body=I would like to schedule a demo of the Indigenous AI Business Support Platform.', '_blank');
              }}
            >
              Schedule Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 border-t border-white/20">
            <p className="text-sm text-white/60 mb-4">Trusted by Indigenous organizations across Canada</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="text-white/80 font-medium text-sm">NACCA Partner</div>
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <div className="text-white/80 font-medium text-sm">CCIB Member</div>
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <div className="text-white/80 font-medium text-sm">AFN Endorsed</div>
              <div className="w-1 h-1 bg-white/40 rounded-full" />
              <div className="text-white/80 font-medium text-sm">TRC Aligned</div>
            </div>
          </div>

          {/* Additional incentive */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-white/90 font-medium mb-2">
              🎁 Limited Time: First 100 Indigenous entrepreneurs get
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white">
              <span className="font-bold text-lg">3 months Premium free</span>
              <span className="text-white/70">+ personalized onboarding session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;