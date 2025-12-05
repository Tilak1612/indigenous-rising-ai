import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';
import { 
  Mail, Phone, MapPin, Facebook, Twitter, Linkedin, 
  Youtube, Globe, Shield, Heart, BookOpen
} from 'lucide-react';
import logoFull from '@/assets/logo-full.png';

const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
      titleTranslation: "Mazina'igan",
      links: [
        { name: "Business Tools", href: "#features" },
        { name: "Funding Navigator", href: "#funding" },
        { name: "Impact Tracker", href: "#testimonials" },
        { name: "Training Programs", href: "/training" },
        { name: "Partnerships", href: "#partnerships" },
        { name: "Pricing", href: "#pricing" }
      ]
    },
    {
      title: "Resources",
      titleTranslation: "Naadamaaganan",
      links: [
        { name: "Training Programs", href: "/training" },
        { name: "Data Rights Guide", href: "/data-rights" },
        { name: "Track Your Request", href: "/track-request" },
        { name: "Contact Support", href: "/contact" },
        { name: "FAQ", href: "#faq" },
        { name: "Community Forum", href: "#testimonials" }
      ]
    },
    {
      title: "Organization",
      titleTranslation: "Mamashkiing",
      links: [
        { name: "About Us", href: "#hero" },
        { name: "Our Mission", href: "#features" },
        { name: "Cultural Partners", href: "#partnerships" },
        { name: "Success Stories", href: "#testimonials" },
        { name: "Contact Us", href: "/contact" },
        { name: "Admin Portal", href: "/auth" }
      ]
    },
    {
      title: "Legal",
      titleTranslation: "Dibaakonigewin",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Your Data Rights", href: "/data-rights" },
        { name: "Canadian Compliance", href: "/compliance" },
        { name: "OCAP™ Principles", href: "/compliance#ocap" },
        { name: "Accessibility", href: "/accessibility" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/indigenousai" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/indigenous_ai" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/indigenous-ai" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@indigenousai" }
  ];

  const languages = [
    "English", "Français", "ᐃᓄᒃᑎᑐᑦ (Inuktitut)", 
    "ᓀᐦᐃᔭᐍᐏᐣ (Cree)", "ᐊᓂᔑᓈᐯᒧᐎᓐ (Ojibwe)"
  ];

  return (
    <footer className="bg-zinc-950 border-t border-white/10">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-16 space-y-12">
          {/* Company info and newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {/* Logo and tagline */}
              <div className="space-y-2">
                <Link to="/">
                  <img 
                    src={logoFull} 
                    alt="Indigenous Rising AI Business Support Platform - Empowering Indigenous entrepreneurs with culturally respectful AI technology" 
                    className="h-12 w-auto hover:opacity-80 transition-opacity"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </div>

              <p className="text-zinc-400 leading-relaxed max-w-md">
                Empowering Indigenous entrepreneurs across Turtle Island through culturally respectful AI technology, 
                traditional knowledge integration, and community-centered business support.
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-zinc-400">
                    Traditional Territory of the Anishinaabe, Toronto, ON
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="tel:+18004634436" className="text-zinc-400 hover:text-amber-400 transition-colors">
                    1-800-INDIGENOUS (1-800-463-4436)
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href="mailto:hello@indigenousrising.ai" className="text-zinc-400 hover:text-amber-400 transition-colors">
                    hello@indigenousrising.ai
                  </a>
                </div>
              </div>

              {/* Cultural acknowledgment badges */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1 text-xs border border-white/10">
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span className="text-zinc-400">OCAP™ Certified</span>
                </div>
                <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1 text-xs border border-white/10">
                  <Heart className="w-3 h-3 text-amber-400" />
                  <span className="text-zinc-400">Indigenous Led</span>
                </div>
                <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1 text-xs border border-white/10">
                  <Globe className="w-3 h-3 text-amber-400" />
                  <span className="text-zinc-400">Multi-Language</span>
                </div>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-medium text-white">
                  Stay Connected
                </h3>
                <p className="text-sm text-amber-400/70 italic">
                  Wiidookaage • Working Together
                </p>
                <p className="text-zinc-400">
                  Subscribe to receive updates on new features, funding opportunities, 
                  and Indigenous business success stories.
                </p>
              </div>

              <NewsletterSignup />

              {/* Social links */}
              <div className="space-y-3">
                <h4 className="font-medium text-white text-sm">Follow Our Journey</h4>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all group border border-white/10"
                        aria-label={social.name}
                      >
                        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Footer links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-white">{section.title}</h3>
                  <p className="text-xs text-amber-400/70 italic">{section.titleTranslation}</p>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="text-sm text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.querySelector(link.href);
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="bg-white/10" />

          {/* Language selector */}
          <div className="space-y-4">
            <h4 className="font-medium text-white text-sm flex items-center space-x-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Available Languages</span>
              <span className="text-xs text-amber-400/70 italic">• Anishinaabemowin</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    idx === 0 
                      ? 'bg-amber-500 text-black border-amber-500' 
                      : 'bg-transparent border-white/10 hover:border-amber-400/50 text-zinc-400 hover:text-white'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Bottom footer */}
        <div className="py-8 flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <p className="text-sm text-zinc-400">
              © 2024 Indigenous Rising AI Business Support Platform. All rights reserved.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Built with respect on the traditional territories of Indigenous peoples across Turtle Island.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Powered by Brainfy AI Inc
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-zinc-500">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-amber-400" />
              <span>Indigenous Owned</span>
            </span>
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>OCAP™ Compliant</span>
            </span>
            <span className="flex items-center space-x-1">
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>TRC Aligned</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
