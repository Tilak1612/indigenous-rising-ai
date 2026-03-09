import { ShinyButton } from '@/components/ui/shiny-button';
import { ArrowRight, ChevronDown, Sparkles, Shield, Globe } from 'lucide-react';
import InteractiveQuiz from './InteractiveQuiz';
import heroAbstract from '@/assets/hero-bg-abstract.jpg';
import heroHybrid from '@/assets/hero-bg-hybrid.jpg';
import heroPhoto from '@/assets/hero-bg-photo.jpg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const heroBackgrounds = [
  { key: 'abstract', src: heroAbstract, label: 'Cultural Pattern' },
  { key: 'hybrid', src: heroHybrid, label: 'Platform Preview' },
  { key: 'photo', src: heroPhoto, label: 'Entrepreneurs' },
] as const;

const HeroSection = () => {
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(2);

  const scrollToFunding = () => {
    document.querySelector('#funding')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStats = () => {
    document.querySelector('#stats')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative isolate min-h-screen" aria-label="Welcome to Indigenous Rising AI">
      {/* Background image with crossfade */}
      <div className="absolute inset-0 -z-10">
        {heroBackgrounds.map((bg, i) => (
          <img
            key={bg.key}
            src={bg.src}
            alt="Indigenous Rising AI hero background"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === bgIndex ? 1 : 0 }}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        ))}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content — left-aligned split layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-44 pb-16 sm:pt-52 md:pt-56 lg:pt-64 sm:pb-20 lg:pb-24 lg:max-w-[55%]">
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
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-geist tracking-tighter leading-[1.05]"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)' }}
            >
              AI-Powered Support for Indigenous Entrepreneurs
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="mt-6 max-w-xl text-white/90 text-base sm:text-lg leading-relaxed font-geist opacity-0 translate-y-8"
            style={{
              animation: 'fadeSlideBlurIn 1.2s ease-out 0.6s forwards',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            AI-powered business support for Indigenous entrepreneurs across Canada, built on OCAP™ and traditional knowledge.
          </p>

          {/* Key features badges */}
          <div
            className="mt-6 flex flex-wrap gap-3 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 0.8s forwards' }}
          >
            {[
              { icon: Shield, label: 'OCAP™ Compliant' },
              { icon: Sparkles, label: 'AI-Powered Matching' },
              { icon: Globe, label: 'Multi-Language Support' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium rounded-full px-4 py-2 ring-1 ring-white/20 backdrop-blur-sm"
              >
                <Icon className="w-4 h-4" />
                <span className="font-geist">{label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="mt-8 flex flex-wrap items-center gap-4 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1s forwards' }}
          >
            <ShinyButton onClick={() => navigate('/auth')} className="group">
              <span className="font-geist">Start Free Account</span>
              <ArrowRight className="w-4 h-4 ml-2 inline-block group-hover:translate-x-0.5 transition-transform" />
            </ShinyButton>

            <ShinyButton
              onClick={() =>
                window.open(
                  'mailto:hello@indigenousrising.ai?subject=Demo Request&body=I would like to schedule a demo of the Indigenous Rising AI Business Support Platform.',
                  '_blank'
                )
              }
              className="group"
            >
              <span className="font-geist">Schedule Demo</span>
            </ShinyButton>
          </div>

          {/* Secondary links */}
          <div
            className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80 opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.1s forwards' }}
          >
            <button onClick={scrollToFunding} className="underline underline-offset-4 hover:text-white transition">
              Explore Funding
            </button>
            <button
              onClick={() => document.querySelector('#training')?.scrollIntoView({ behavior: 'smooth' })}
              className="underline underline-offset-4 hover:text-white transition"
            >
              View Training Programs
            </button>
            <button onClick={() => navigate('/contact')} className="underline underline-offset-4 hover:text-white transition">
              Request Platform Video
            </button>
          </div>

          {/* 3-step cards */}
          <div
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-white/90 text-sm opacity-0 translate-y-8"
            style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.15s forwards' }}
          >
            {[
              { step: '1', title: 'Create your free account', desc: 'It takes under two minutes.' },
              { step: '2', title: 'Share your goals', desc: 'Tell us about your community and business.' },
              { step: '3', title: 'Get matched', desc: 'Funding, tools, and training tailored to you.' },
            ].map((item) => (
              <div key={item.step} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="font-semibold">
                  {item.step}) {item.title}
                </div>
                <div className="text-white/70">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Interactive Quiz */}
          <div className="mt-10 opacity-0 translate-y-8" style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.2s forwards' }}>
            <InteractiveQuiz />
          </div>
        </div>

        {/* Background switcher — bottom center */}
        <div
          className="flex justify-center gap-2 pb-6 opacity-0 translate-y-8"
          style={{ animation: 'fadeSlideBlurIn 1.2s ease-out 1.3s forwards' }}
        >
          {heroBackgrounds.map((bg, i) => (
            <button
              key={bg.key}
              onClick={() => setBgIndex(i)}
              className={`text-xs font-geist px-3 py-1.5 rounded-full transition-all ${
                i === bgIndex
                  ? 'bg-white/25 text-white ring-1 ring-white/40'
                  : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
              }`}
              aria-label={`Switch to ${bg.label} background`}
            >
              {bg.label}
            </button>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="flex justify-center pb-8 opacity-0 translate-y-8"
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
