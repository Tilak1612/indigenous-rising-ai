import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';
import { Mail, Twitter, Linkedin, Youtube, Leaf } from 'lucide-react';
import { ComplianceBadge, DataResidencyNote } from '@/components/trust';
import { RisingGlyph } from '@/components/RisingGlyph';

// Single canonical footer used on every route (marketing + inner pages + the
// homepage). New brand (IR monogram + terracotta tokens). Claims kept factual
// and hedged per the no-fake-claims rule — no "certified", "owned", "TRC
// aligned", or unreviewed decorative Indigenous-language headers. OCAP is the
// registered ® mark of the FNIGC.

type FooterLink = { name: string; to: string };

const SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Platform',
    links: [
      { name: 'The platform', to: '/#platform' },
      { name: 'Data sovereignty', to: '/#sovereignty' },
      { name: 'Training', to: '/training' },
      { name: 'Pricing', to: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', to: '/blog' },
      { name: 'FAQ', to: '/faq' },
      { name: 'Track a request', to: '/track-request' },
      { name: 'Community', to: '/community' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'Success stories', to: '/success-stories' },
      { name: 'Careers', to: '/careers' },
      { name: 'Contact', to: '/contact' },
      { name: 'Canadian compliance', to: '/compliance' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', to: '/privacy' },
      { name: 'Terms of Service', to: '/terms' },
      { name: 'Cookie Policy', to: '/cookies' },
      { name: 'Your data rights', to: '/data-rights' },
      { name: 'Accessibility', to: '/accessibility' },
    ],
  },
];

const SOCIAL = [
  { name: 'X (Twitter)', icon: Twitter, href: 'https://twitter.com/indigenous_ai' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/indigenous-ai' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@indigenousai' },
];

// Homepage-section links (#...) use a plain anchor so the browser does a real
// navigation to the homepage and scrolls to the section; routes use SPA Link.
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) =>
  to.includes('#') ? (
    <a href={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{children}</a>
  ) : (
    <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{children}</Link>
  );

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Brand + contact + trust */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="Indigenous Rising AI — home">
              <span className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-primary text-primary-foreground transition-opacity duration-300 group-hover:opacity-80">
                <RisingGlyph size={21} />
              </span>
              <span className="font-display font-semibold text-xl text-foreground tracking-tight">
                Indigenous Rising
              </span>
            </Link>

            <p className="text-muted-foreground leading-relaxed max-w-md">
              The AI platform for Indigenous business growth — funding, planning, training,
              and growth, built around your community&apos;s data sovereignty.
            </p>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:help@indigenousrising.ai" className="text-muted-foreground hover:text-foreground transition-colors">
                help@indigenousrising.ai
              </a>
            </div>

            {/* Trust badges now link to /compliance for the full explanation */}
            <div className="flex flex-wrap gap-2">
              <ComplianceBadge label="Built around OCAP®" />
              <ComplianceBadge label="PIPEDA-aligned" />
              <ComplianceBadge label="Data stored in Canada" />
            </div>

            <DataResidencyNote className="max-w-md" />

            <div className="flex gap-3 pt-1">
              {SOCIAL.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="w-9 h-9 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/60 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Newsletter (double opt-in via the newsletter-subscribe function) */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-6 space-y-4">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">Stay connected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Updates on new features, funding opportunities, and Indigenous business resources.
                We&apos;ll only email you after you confirm your subscription.
              </p>
            </div>
            <NewsletterSignup />
          </div>
        </div>

        <Separator className="opacity-40" />

        {/* Link columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="font-medium text-foreground text-sm">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <NavLink to={link.to}>{link.name}</NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="opacity-40" />

        {/* Land acknowledgement */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-5 flex gap-3 items-start">
          <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            We acknowledge that this work takes place on the traditional territories of First Nations,
            Métis, and Inuit peoples across the lands now called Canada. We are committed to data
            sovereignty and to the communities we serve.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {year} Indigenous Rising. OCAP® is a registered trademark of the First Nations
            Information Governance Centre.
          </p>
          <div className="flex gap-5 text-xs">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/compliance" className="text-muted-foreground hover:text-foreground transition-colors">Trust</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
