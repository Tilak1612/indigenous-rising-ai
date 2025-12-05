import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';
import { 
  Mail, Phone, MapPin, Facebook, Twitter, Linkedin, 
  Youtube, Globe, Shield, Heart, BookOpen, Instagram
} from 'lucide-react';
import logoFull from '@/assets/logo-full.png';

const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
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
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Your Data Rights", href: "/data-rights" },
        { name: "Canadian Compliance", href: "/compliance" },
        { name: "Accessibility", href: "/accessibility" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/indigenousai" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/indigenousai" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@indigenousai" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/indigenous-ai" }
  ];

  return (
    <footer className="bg-card border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
          {/* Company info */}
          <div className="lg:max-w-sm space-y-6">
            <div className="space-y-2">
              <Link to="/">
                <img 
                  src={logoFull} 
                  alt="Indigenous Rising AI Business Support Platform" 
                  className="h-12 w-auto hover:opacity-80 transition-opacity"
                  loading="lazy"
                  decoding="async"
                  width={150}
                  height={48}
                />
              </Link>
              <p className="font-display text-lg font-medium text-foreground">Indigenous Rising AI</p>
              <p className="text-xs text-foreground/50">Community-Driven Innovation • Biidaasige Naadamaage</p>
            </div>

            <p className="text-foreground/60 leading-relaxed text-sm">
              Empowering Indigenous entrepreneurs across Turtle Island through culturally respectful AI technology, 
              traditional knowledge integration, and community-centered business support.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:hello@indigenousrising.ai" className="text-foreground/60 hover:text-primary transition-colors">
                  hello@indigenousrising.ai
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-foreground/60">1-800-INDIGENOUS</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/40 hover:text-primary transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="font-semibold text-foreground text-sm">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className="text-sm text-foreground/60 hover:text-primary transition-colors"
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
                          className="text-sm text-foreground/60 hover:text-primary transition-colors"
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
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-b border-border mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-lg font-medium text-foreground mb-1">Stay Connected</h3>
              <p className="text-sm text-foreground/60">Subscribe for updates on new features and Indigenous business success stories.</p>
            </div>
            <div className="w-full md:w-auto md:min-w-[400px]">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-foreground/50">
              © 2024 Indigenous Rising AI Business Support Platform. All rights reserved.
            </p>
            <p className="text-xs text-foreground/40 mt-1">
              Built with respect on the traditional territories of Indigenous peoples across Turtle Island.
            </p>
            <p className="text-xs text-foreground/40 mt-1">
              Powered by Brainfy AI Inc
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-foreground/50">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-primary" />
              <span>Indigenous Owned</span>
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary" />
              <span>OCAP™ Compliant</span>
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-primary" />
              <span>TRC Aligned</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;