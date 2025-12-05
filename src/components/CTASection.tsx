import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, Shield } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-foreground relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pattern-geometric opacity-5" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-gentle-float" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-secondary/20 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 max-w-5xl mx-auto bg-card rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Info */}
        <div className="md:w-5/12 bg-primary text-primary-foreground p-12 flex flex-col justify-between">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-semibold tracking-wide mb-6">
              <Sparkles className="w-3 h-3" />
              Maadaadizi • Begin Your Journey
            </div>
            
            <h2 className="font-display text-3xl mb-6 text-primary-foreground">
              Ready to Transform Your Indigenous Business?
            </h2>
            <p className="text-primary-foreground/80 mb-8 leading-relaxed">
              Join thousands of Indigenous entrepreneurs who are building sustainable, culturally grounded businesses 
              with our AI-powered platform.
            </p>
            
            {/* Key benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/90">OCAP™ Protected - Your data sovereignty guaranteed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/90">Community Driven - Built by and for Indigenous peoples</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Sparkles className="w-5 h-5 text-primary-foreground/80" />
                <span className="text-primary-foreground/90">AI Enhanced - Modern tools, traditional wisdom</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 md:mt-0">
            <p className="text-xs text-primary-foreground/50 uppercase tracking-widest">Trusted by Indigenous Organizations<br/>Across Canada</p>
          </div>
        </div>

        {/* Right Content */}
        <div className="md:w-7/12 p-12 flex flex-col justify-center">
          <h3 className="font-display text-2xl text-foreground mb-4">Start Your Free Account</h3>
          <p className="text-foreground/60 mb-8 leading-relaxed">
            Start your free account today and discover opportunities that respect 
            your values while driving growth.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col gap-4 mb-8">
            <Button 
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-[hsl(15,60%,55%)] hover:shadow-lg hover:-translate-y-0.5 transition-all w-full md:w-auto"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              className="px-8 py-4 border-2 border-border rounded-full hover:border-primary hover:text-primary transition-all w-full md:w-auto"
              onClick={() => {
                window.open('mailto:hello@indigenousrising.ai?subject=Demo Request&body=I would like to schedule a demo of the Indigenous Rising AI Business Support Platform.', '_blank');
              }}
            >
              Schedule Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">Trusted by Indigenous organizations across Canada</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/50">
              <span>NACCA Partner</span>
              <span className="w-1 h-1 bg-foreground/20 rounded-full" />
              <span>CCIB Member</span>
              <span className="w-1 h-1 bg-foreground/20 rounded-full" />
              <span>AFN Endorsed</span>
              <span className="w-1 h-1 bg-foreground/20 rounded-full" />
              <span>TRC Aligned</span>
            </div>
          </div>

          {/* Additional incentive */}
          <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-foreground font-medium mb-1">
              🎁 Limited Time: First 100 Indigenous entrepreneurs get
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-foreground/70">
              <span className="font-bold text-primary">3 months Premium free</span>
              <span>+ personalized onboarding session</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;