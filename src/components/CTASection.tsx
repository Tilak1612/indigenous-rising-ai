import { ArrowRight, Sparkles, Users, Shield, Calendar, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="z-10 px-4 sm:px-6 sm:mt-10 max-w-7xl mx-auto mt-8 mb-16 animate-fade-slide-in">
      <div className="relative overflow-hidden rounded-[40px] bg-neutral-950 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] p-6 sm:p-8 border-gradient">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_120%,rgba(255,255,255,0.05),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15]" />
        </div>

        <div className="relative">
          {/* Main heading */}
          <h2 className="leading-[0.9] text-3xl sm:text-[8vw] lg:text-[7vw] font-medium tracking-tight">
            <span className="block text-white">Ready to Transform Your</span>
            <span className="block text-white/60">Indigenous Business?</span>
          </h2>

          {/* Contact grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div>
              <p className="text-sm text-white/60">Get Started</p>
              <a 
                href="mailto:hello@indigenousrising.ai" 
                className="mt-2 inline-flex items-center gap-3 text-xl sm:text-2xl font-medium tracking-tight text-white hover:text-amber-400 transition-colors"
              >
                <span className="break-all">hello@indigenousrising.ai</span>
              </a>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-sm text-white/60">Schedule a Call</p>
              <button 
                onClick={() => {
                  window.open('mailto:hello@indigenousrising.ai?subject=Demo Request&body=I would like to schedule a demo of the Indigenous Rising AI Business Support Platform.', '_blank');
                }}
                className="inline-flex items-center gap-2 hover:bg-white/90 text-sm font-medium text-gray-900 tracking-tight bg-white rounded-full mt-2 py-3 px-5 transition-colors duration-200"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Meeting</span>
              </button>
            </div>

            {/* Social */}
            <div>
              <p className="text-sm text-white/60">Follow Along</p>
              <div className="flex flex-wrap gap-3 mt-2 items-center">
                <a 
                  href="https://twitter.com/indigenous_ai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 tracking-tight bg-white border-white/10 border rounded-full py-3 px-4 hover:bg-white/90 transition-colors duration-200"
                >
                  <Twitter className="w-4 h-4" />
                  <span>50K+</span>
                </a>
                <a 
                  href="https://instagram.com/indigenousai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-gray-900 hover:bg-white/90 transition-colors duration-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com/company/indigenous-ai" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-gray-900 border border-white/10 hover:bg-white/90 transition-colors duration-200"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Key benefits */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center space-y-3 text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">OCAP™ Protected</h3>
                <p className="text-sm text-white/60">Your data sovereignty guaranteed</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Community Driven</h3>
                <p className="text-sm text-white/60">Built by and for Indigenous peoples</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">AI Enhanced</h3>
                <p className="text-sm text-white/60">Modern tools, traditional wisdom</p>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-white/60">Explore</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Features
                </a>
                <Link to="/training" className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Programs
                </Link>
                <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.querySelector('#testimonials')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Impact Stories
                </a>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Pricing
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60">Fine Print</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Link to="/terms" className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/accessibility" className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  Accessibility
                </Link>
                <Link to="/compliance" className="font-medium tracking-tight hover:underline hover:text-amber-400 transition-colors">
                  OCAP™ Principles
                </Link>
              </div>
            </div>
          </div>

          {/* Limited time offer */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white font-medium mb-2">
              🎁 Limited Time: First 100 Indigenous entrepreneurs get
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-white">
              <span className="font-medium text-xl text-amber-400">3 months Premium free</span>
              <span className="text-white/60">+ personalized onboarding session</span>
            </div>
            <button 
              className="mt-4 btn-aura px-8 py-3 text-base font-medium text-white inline-flex items-center gap-2 group"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Claim Your Spot</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
