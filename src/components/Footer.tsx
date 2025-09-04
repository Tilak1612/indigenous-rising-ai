import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, 
  Youtube, Globe, Shield, Heart, BookOpen, Building 
} from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
      titleTranslation: "Mazina'igan",
      links: [
        { name: "Business Tools", href: "#business-tools" },
        { name: "Funding Navigator", href: "#funding" },
        { name: "Impact Tracker", href: "#community" },
        { name: "Training Programs", href: "#training" },
        { name: "Partnerships", href: "#partnerships" },
        { name: "Pricing", href: "#pricing" }
      ]
    },
    {
      title: "Resources",
      titleTranslation: "Naadamaaganan",
      links: [
        { name: "Getting Started Guide", href: "/guide" },
        { name: "Cultural Guidelines", href: "/cultural-guidelines" },
        { name: "Data Sovereignty", href: "/data-sovereignty" },
        { name: "Success Stories", href: "/stories" },
        { name: "Community Forum", href: "/forum" },
        { name: "Help Center", href: "/help" }
      ]
    },
    {
      title: "Organization",
      titleTranslation: "Mamashkiing",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Our Mission", href: "/mission" },
        { name: "Leadership Team", href: "/team" },
        { name: "Cultural Advisors", href: "/advisors" },
        { name: "Careers", href: "/careers" },
        { name: "News & Updates", href: "/news" }
      ]
    },
    {
      title: "Legal",
      titleTranslation: "Dibaakonigewin",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "OCAP™ Compliance", href: "/ocap" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Data Security", href: "/security" },
        { name: "Accessibility", href: "/accessibility" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/indigenousai", color: "#1877F2" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/indigenous_ai", color: "#1DA1F2" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/indigenous-ai", color: "#0A66C2" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/@indigenousai", color: "#FF0000" }
  ];

  const languages = [
    "English", "Français", "ᐃᓄᒃᑎᑐᑦ (Inuktitut)", 
    "ᓀᐦᐃᔭᐍᐏᐣ (Cree)", "ᐊᓂᔑᓈᐯᒧᐎᓐ (Ojibwe)"
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-16 space-y-12">
          {/* Company info and newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {/* Logo and tagline */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 gradient-earth rounded-xl flex items-center justify-center shadow-natural">
                  <Users className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl text-primary">Indigenous Rising AI</span>
                  <span className="text-sm text-muted-foreground font-medium">Business Support Platform</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-md">
                Empowering Indigenous entrepreneurs across Turtle Island through culturally respectful AI technology, 
                traditional knowledge integration, and community-centered business support.
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Traditional Territory of the Anishinaabe, Toronto, ON
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">1-800-INDIGENOUS (1-800-463-4436)</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">hello@indigenousrising.ai</span>
                </div>
              </div>

              {/* Cultural acknowledgment badges */}
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1 text-xs">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">OCAP™ Certified</span>
                </div>
                <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1 text-xs">
                  <Heart className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Indigenous Led</span>
                </div>
                <div className="inline-flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1 text-xs">
                  <Globe className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Multi-Language</span>
                </div>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Stay Connected
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  Wiidookaage • Working Together
                </p>
                <p className="text-muted-foreground">
                  Subscribe to receive updates on new features, funding opportunities, 
                  and Indigenous business success stories.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-smooth"
                />
                <Button variant="hero" className="px-6">
                  Subscribe
                </Button>
              </div>

              {/* Social links */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm">Follow Our Journey</h4>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-muted/50 hover:bg-muted/70 rounded-lg flex items-center justify-center transition-smooth group"
                        aria-label={social.name}
                        style={{ '--icon-color': social.color } as any}
                      >
                        <Icon 
                          className="w-5 h-5 transition-smooth group-hover:scale-110" 
                          style={{ color: social.color }}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Footer links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <p className="text-xs text-primary/70 italic">{section.titleTranslation}</p>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-smooth cursor-pointer"
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          e.preventDefault();
                          const element = document.querySelector(link.href);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      {link.name}
                    </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="opacity-50" />

          {/* Language selector */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Available Languages</span>
              <span className="text-xs text-primary/70 italic">• Anishinaabemowin</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, idx) => (
                <button
                  key={idx}
                  className={`px-3 py-1 text-xs rounded-full border transition-smooth ${
                    idx === 0 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Bottom footer */}
        <div className="py-8 flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 Indigenous Rising AI Business Support Platform. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Built with respect on the traditional territories of Indigenous peoples across Turtle Island.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-primary" />
              <span>Indigenous Owned</span>
            </span>
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-primary" />
              <span>OCAP™ Compliant</span>
            </span>
            <span className="flex items-center space-x-1">
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