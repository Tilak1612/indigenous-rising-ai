import { Button } from '@/components/ui/button';
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
        { name: "Blog", href: "/blog" },
        { name: "Training Programs", href: "/training" },
        { name: "Data Rights Guide", href: "/data-rights" },
        { name: "Track Your Request", href: "/track-request" },
        { name: "Contact Support", href: "/contact" },
        { name: "FAQ", href: "/faq" }
      ]
    },
    {
      title: "Organization",
      titleTranslation: "Mamashkiing",
      links: [
        { name: "About Us", href: "#hero" },
        { name: "Our Mission", href: "#features" },
        { name: "Success Stories", href: "/success-stories" },
        { name: "Community Impact", href: "/success-stories#impact" },
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

  // Audit: Facebook page currently unavailable; mark as coming soon.
  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#", color: "#1877F2", available: false, note: 'Coming soon' },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/indigenous_ai", color: "#1DA1F2", available: true },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/indigenous-ai", color: "#0A66C2", available: true },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@indigenousai", color: "#FF0000", available: true }
  ];

  const languages = [
    "English", "Français", "ᐃᓄᒃᑎᑐᑦ (Inuktitut)", 
    "ᓀᐦᐃᔭᐍᐏᐣ (Cree)", "ᐊᓂᔑᓈᐯᒧᐎᓐ (Ojibwe)"
  ];

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main footer content */}
        <div className="py-20 space-y-16">
          {/* Company info and newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              {/* Logo and tagline */}
              <Link to="/" className="inline-block group">
                <img 
                  src={logoFull} 
                  alt="Indigenous Rising AI Business Support Platform - Empowering Indigenous entrepreneurs with culturally respectful AI technology" 
                  className="h-14 w-auto transition-all duration-300 group-hover:opacity-80"
                  loading="lazy"
                  decoding="async"
                  width={180}
                  height={56}
                />
              </Link>

              <p className="text-muted-foreground leading-relaxed max-w-md text-lg">
                Empowering Indigenous entrepreneurs across Turtle Island through culturally respectful AI technology, 
                traditional knowledge integration, and community-centered business support.
              </p>

              {/* Contact info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 glass bg-muted/50 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-muted-foreground">
                    Traditional Territory of the Anishinaabe, Toronto, ON
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 glass bg-muted/50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-muted-foreground">1-800-INDIGENOUS (1-800-463-4436)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 glass bg-muted/50 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-muted-foreground">hello@indigenousrising.ai</span>
                </div>
              </div>

              {/* Cultural badges */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 glass bg-muted/30 border border-border/30 rounded-full px-4 py-2 text-xs font-medium">
                  <Shield className="w-3 h-3 text-secondary" />
                  <span className="text-muted-foreground">OCAP™ Certified</span>
                </div>
                <div className="inline-flex items-center gap-2 glass bg-muted/30 border border-border/30 rounded-full px-4 py-2 text-xs font-medium">
                  <Heart className="w-3 h-3 text-secondary" />
                  <span className="text-muted-foreground">Indigenous Led</span>
                </div>
                <div className="inline-flex items-center gap-2 glass bg-muted/30 border border-border/30 rounded-full px-4 py-2 text-xs font-medium">
                  <Globe className="w-3 h-3 text-secondary" />
                  <span className="text-muted-foreground">Multi-Language</span>
                </div>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="glass bg-card/50 border border-border/30 rounded-3xl p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-light text-foreground">
                  Stay Connected
                </h3>
                <p className="text-sm text-secondary italic">
                  Wiidookaage • Working Together
                </p>
                <p className="text-muted-foreground">
                  Subscribe to receive updates on new features, funding opportunities, 
                  and Indigenous business success stories.
                </p>
              </div>

              <NewsletterSignup />

              {/* Social links */}
              <div className="space-y-4 pt-4">
                <h4 className="font-medium text-foreground text-sm">Follow Our Journey</h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon as any;
                    if (!social.available) {
                      return (
                        <button
                          key={social.name}
                          className="w-10 h-10 glass bg-muted/20 border border-border/30 rounded-xl flex items-center justify-center transition-smooth cursor-not-allowed opacity-60"
                          aria-label={`${social.name} (coming soon)`}
                          title={social.note || 'Coming soon'}
                          disabled
                        >
                          <Icon className="w-4 h-4" style={{ color: social.color }} />
                        </button>
                      );
                    }

                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 glass bg-muted/30 hover:bg-muted/50 border border-border/30 rounded-xl flex items-center justify-center transition-smooth hover-lift group"
                        aria-label={social.name}
                      >
                        <Icon 
                          className="w-4 h-4 transition-smooth group-hover:scale-110" 
                          style={{ color: social.color }}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Separator className="opacity-30" />

          {/* Footer links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{section.title}</h3>
                  <p className="text-xs text-secondary italic">{section.titleTranslation}</p>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-smooth cursor-pointer"
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
                          className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
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

          <Separator className="opacity-30" />

          {/* Language selector */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-secondary" />
              <span>Available Languages</span>
              <span className="text-xs text-secondary italic">• Anishinaabemowin</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 text-xs rounded-xl border transition-smooth ${
                    idx === 0 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'glass bg-card/50 border-border/50 hover:border-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="opacity-30" />

        {/* Bottom footer */}
        <div className="py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-1">
            <p className="text-sm text-muted-foreground">
              © 2024 Indigenous Rising AI Business Support Platform. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Built with respect on the traditional territories of Indigenous peoples across Turtle Island.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Powered by Brainfy AI Inc
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-secondary" />
              <span>Indigenous Owned</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-secondary" />
              <span>OCAP™ Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-secondary" />
              <span>TRC Aligned</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
