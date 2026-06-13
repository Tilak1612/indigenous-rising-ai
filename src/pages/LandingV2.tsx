import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  PlusCircle, ArrowRight, Bell, BarChart3, CheckCircle2, ClipboardCheck,
  FileText, Download, Menu, HandHeart, Leaf, Lock, TrendingUp, MapPin,
  MinusCircle, Pencil, PlayCircle, Rocket, ShieldCheck, Store, GraduationCap,
  Sparkles, Users, Wallet, type LucideIcon,
} from 'lucide-react';
import MetaTags from '@/components/MetaTags';
import Footer from '@/components/Footer';
import { PLANS } from '@/data/plans';
import { RisingGlyph } from '@/components/RisingGlyph';
import './landing-v2.css';

/**
 * Indigenous Rising AI — landing page redesign.
 * Faithful recreation of the Claude Design handoff ("Indigenous Rising AI.dc.html"),
 * scoped to .irv2-root so the app's global shadcn theme is untouched.
 * Lives at /landing-v2 (non-destructive; the live homepage at / is unchanged).
 */

// Map the prototype's solar:* icon names to bundled lucide-react components.
// Bundled into the build (no CDN) so icons always render — the original iconify
// web component fetched icon data from code.iconify.design at runtime and showed
// empty boxes whenever that CDN was slow or returned 503.
const ICONS: Record<string, LucideIcon> = {
  'solar:add-circle-linear': PlusCircle,
  'solar:arrow-right-linear': ArrowRight,
  'solar:bell-bing-linear': Bell,
  'solar:chart-2-linear': BarChart3,
  'solar:check-circle-bold': CheckCircle2,
  'solar:clipboard-check-linear': ClipboardCheck,
  'solar:document-text-linear': FileText,
  'solar:export-linear': Download,
  'solar:hamburger-menu-linear': Menu,
  'solar:hand-heart-linear': HandHeart,
  'solar:leaf-linear': Leaf,
  'solar:lock-keyhole-bold': Lock,
  'solar:lock-keyhole-minimalistic-linear': Lock,
  'solar:map-arrow-up-linear': TrendingUp,
  'solar:map-point-bold': MapPin,
  'solar:map-point-linear': MapPin,
  'solar:minus-circle-linear': MinusCircle,
  'solar:pen-2-linear': Pencil,
  'solar:play-circle-linear': PlayCircle,
  'solar:rocket-2-linear': Rocket,
  'solar:shield-keyhole-linear': ShieldCheck,
  'solar:shop-linear': Store,
  'solar:square-academic-cap-linear': GraduationCap,
  'solar:stars-minimalistic-linear': Sparkles,
  'solar:users-group-rounded-linear': Users,
  'solar:wallet-money-linear': Wallet,
};

const Icon = ({
  icon,
  size = 20,
  style,
  className,
}: {
  icon: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const Cmp = ICONS[icon] ?? Sparkles;
  return (
    <Cmp
      size={size}
      className={className}
      style={{ display: 'inline-flex', flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  );
};

// Render a real react-router Link for internal routes ("/auth", "/contact", …)
// and a plain anchor for in-page section links ("#pricing", …). Lets the
// landing page's CTAs navigate for real when it's used as the homepage.
const LinkTo = ({
  to,
  children,
  className,
  style,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) =>
  to.startsWith('/') ? (
    <Link to={to} className={className} style={style}>
      {children}
    </Link>
  ) : (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  );

type Tab = 'funding' | 'plan' | 'training' | 'growth';

const MODULES = [
  {
    icon: 'solar:wallet-money-linear',
    accent: '#C45A33',
    soft: 'rgba(196,90,51,.12)',
    title: 'Funding Navigator',
    desc: 'Search and match to grants, loans, and programs relevant to Indigenous businesses — with deadlines and eligibility written in plain language.',
    roadmap: 'auto-filled application drafts.',
  },
  {
    icon: 'solar:document-text-linear',
    accent: '#3E6B4F',
    soft: 'rgba(62,107,79,.12)',
    title: 'Business Planning Assistant',
    desc: 'Build a lender-ready business plan section by section, with prompts written for Indigenous entrepreneurs — not generic templates.',
    roadmap: 'financial projection templates.',
  },
  {
    icon: 'solar:square-academic-cap-linear',
    accent: '#A87A1E',
    soft: 'rgba(201,150,46,.16)',
    title: 'Training & Certification',
    desc: 'Short, practical lessons on financing, marketing, and operations. Learn at your own pace, track your progress, return anytime.',
    roadmap: 'issued certificates of completion.',
  },
  {
    icon: 'solar:chart-2-linear',
    accent: '#8A5A2B',
    soft: 'rgba(138,90,43,.14)',
    title: 'Growth & Data Tools',
    desc: 'Track revenue, customers, and goals in a simple dashboard you own — and export the data whenever you want.',
    roadmap: 'benchmark insights across regions.',
  },
];

const STEPS = [
  { num: '01', title: 'Create your free account', desc: 'No credit card. Set up in a couple of minutes and start exploring right away.' },
  { num: '02', title: 'Tell us about your business', desc: 'A few questions about what you do and where you are. That shapes everything you see.' },
  { num: '03', title: 'Get matched and build', desc: 'See funding you qualify for, start a business plan, and pick up the skills you need.' },
  { num: '04', title: 'Grow and track', desc: 'Watch revenue and goals in one dashboard. Your data stays yours, exportable anytime.' },
];

const FAQS = [
  { q: 'Is it really free to start?', a: 'Yes. The Free plan is free forever — funding search with deadline reminders, one guided business plan, the full training library, and data export. No credit card to sign up.' },
  { q: 'Who owns my data?', a: 'You do. We design around OCAP® principles — Ownership, Control, Access, and Possession — and you can export everything in open formats and delete your account at any time. For community accounts, your organization controls access for its members.' },
  { q: 'What does OCAP® mean here?', a: 'OCAP® is a set of First Nations principles for how data about a community should be governed. We design the platform around those principles. OCAP® is a registered trademark of the First Nations Information Governance Centre; we are designed around it, not certified by it.' },
  { q: 'Where is my information stored?', a: 'In Canada. Your data lives in AWS ca-central-1 and does not leave the country. It is encrypted in transit and at rest, with role-based access you control.' },
  { q: 'Is my information shared with funders?', a: 'No. Nothing is shared with a funder unless you choose to submit it. We do not sell your data, and we do not share it with funders or third parties without your explicit action.' },
  { q: 'What do I get when I sign up?', a: 'All four modules — Funding Navigator, Business Planning, Training, and Growth Tools — are live and available today. The free plan gets you started with no credit card; paid plans add unlimited AI funding matches, the grant writing assistant, the IFI Connection Engine, and more. You can export your data and cancel at any time.' },
];

const FONT_HEAD: React.CSSProperties = { fontFamily: "'Fraunces', serif" };

const LandingV2 = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<Tab>('funding');
  const [faqOpen, setFaqOpen] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Signature animated moment: generative woven-thread canvas behind the hero.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#C45A33', '#3E6B4F', '#C9962E', '#D9885E', '#6FA37C'];
    const N = 16;
    const lines = Array.from({ length: N }, (_, i) => ({
      off: 0.08 + (i / N) * 0.88,
      amp: 16 + Math.random() * 34,
      freq: 0.5 + Math.random() * 1.1,
      speed: 0.12 + Math.random() * 0.3,
      color: colors[i % colors.length],
      width: 1 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const l of lines) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 7) {
          const y =
            h * l.off +
            Math.sin(x * 0.0065 * l.freq + t * l.speed + l.phase) * l.amp +
            Math.sin(x * 0.0018 + t * 0.12) * 22;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = l.color;
        ctx.globalAlpha = 0.16;
        ctx.lineWidth = l.width;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Reveal-on-scroll: add .irv2-revealed when each [data-reveal] enters the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('irv2-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('irv2-revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14.5,
    fontWeight: 600,
    padding: '11px 20px',
    borderRadius: 11,
    cursor: 'pointer',
    transition: 'all .2s ease',
    border: '1px solid ' + (active ? 'transparent' : 'rgba(74,56,38,.16)'),
    background: active ? '#C45A33' : '#FFFDF9',
    color: active ? '#FAF6EF' : '#6B5645',
    boxShadow: active ? '0 4px 14px rgba(196,90,51,.28)' : 'none',
  });

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Homepage SEO: title, description, OpenGraph/Twitter, canonical, JSON-LD. */}
      <MetaTags
        isHomePage
        title="Indigenous Rising AI — The AI platform for Indigenous business growth"
        description="Find funding, build your business plan, access training, and manage your growth — all in one place, designed around OCAP® principles and the data sovereignty of your community."
        faqs={FAQS.map((f) => ({ question: f.q, answer: f.a }))}
      />


      <div className="irv2-root" ref={rootRef}>
        {/* ===== NAV ===== */}
        <header
          style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(250,246,239,.82)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(74,56,38,.08)',
          }}
        >
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: '#C45A33', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF6EF' }}><RisingGlyph size={19} /></span>
              <span style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 19, color: '#2C1E12', letterSpacing: '-.01em' }}>Indigenous Rising</span>
            </a>
            <nav className="ir-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              {[['Platform', '#platform'], ['How it works', '#how'], ['Sovereignty', '#sovereignty'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
                <a key={href} href={href} style={{ fontSize: 14.5, color: '#6B5645', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <LinkTo to="/auth" className="ir-login-link" style={{ fontSize: 14.5, color: '#6B5645', textDecoration: 'none', fontWeight: 500 }}>Log in</LinkTo>
              <LinkTo to="/auth" className="irv2-hov-cta" style={{ background: '#C45A33', color: '#FAF6EF', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '11px 20px', borderRadius: 10, boxShadow: '0 2px 10px rgba(196,90,51,.28)' }}>Start free account</LinkTo>
              <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="ir-burger" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2C1E12', padding: 4 }}>
                <Icon icon="solar:hamburger-menu-linear" size={26} />
              </button>
            </div>
          </div>
          {menuOpen && (
            <div style={{ borderTop: '1px solid rgba(74,56,38,.08)', padding: '14px 24px 20px', display: 'flex', flexDirection: 'column', gap: 6, background: '#FAF6EF' }}>
              {[['Platform', '#platform'], ['How it works', '#how'], ['Data sovereignty', '#sovereignty'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', fontSize: 16, color: '#4A3826', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
              ))}
            </div>
          )}
        </header>

        {/* ===== HERO ===== */}
        <section id="top" style={{ position: 'relative', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(120% 80% at 50% 0%, rgba(250,246,239,.2) 0%, rgba(250,246,239,.7) 55%, #FAF6EF 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: 'clamp(52px,9vw,88px) 24px 0', textAlign: 'center' }}>
            <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(62,107,79,.1)', border: '1px solid rgba(62,107,79,.22)', color: '#3E6B4F', fontSize: 13, fontWeight: 600, padding: '7px 15px', borderRadius: 100, marginBottom: 30 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3E6B4F' }} />
              Built around Indigenous data sovereignty
            </div>
            <h1 data-reveal style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(34px,5vw,64px)', lineHeight: 1.08, letterSpacing: '-.025em', color: '#2C1E12', maxWidth: 860, margin: '0 auto' }}>
              Get <span style={{ fontStyle: 'italic', color: '#C45A33' }}>funded.</span> Grow your business. Keep your data.
            </h1>
            <p data-reveal style={{ fontSize: 'clamp(17px,1.6vw,21px)', lineHeight: 1.65, color: '#6B5645', maxWidth: 620, margin: '28px auto 0' }}>
              Find funding, build your business plan, access training, and manage your growth — all in one place, designed around OCAP® principles and the data sovereignty of your community.
            </p>
            <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center', marginTop: 38 }}>
              <LinkTo to="/auth" className="irv2-hov-cta-lift" style={{ background: '#C45A33', color: '#FAF6EF', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 30px', borderRadius: 12, boxShadow: '0 6px 20px rgba(196,90,51,.3)', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                Start free account
                <Icon icon="solar:arrow-right-linear" size={19} />
              </LinkTo>
              <a href="#platform" className="irv2-hov-link" style={{ color: '#2C1E12', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                See the platform
                <Icon icon="solar:play-circle-linear" size={19} />
              </a>
            </div>
            <p data-reveal style={{ marginTop: 20, fontSize: 13.5, color: '#8A7560', display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon icon="solar:check-circle-bold" size={15} style={{ color: '#3E6B4F' }} /> Free to start</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon icon="solar:map-point-bold" size={15} style={{ color: '#3E6B4F' }} /> Your data stays in Canada</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon icon="solar:lock-keyhole-bold" size={15} style={{ color: '#3E6B4F' }} /> Export anytime</span>
            </p>

            {/* Hero product mock */}
            <div data-reveal style={{ marginTop: 64, maxWidth: 980, marginLeft: 'auto', marginRight: 'auto', background: '#FFFDF9', border: '1px solid rgba(74,56,38,.1)', borderRadius: 20, boxShadow: '0 30px 80px -30px rgba(44,30,18,.35)', overflow: 'hidden', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: '1px solid rgba(74,56,38,.08)', background: '#F7F1E8' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#D9694A' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0B23E' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#6FA37C' }} />
                <span style={{ marginLeft: 14, fontSize: 12.5, color: '#8A7560' }}>app.indigenousrising.ai / funding</span>
              </div>
              <div className="ir-mock-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 300 }}>
                <div style={{ background: '#F4ECE0', borderRight: '1px solid rgba(74,56,38,.08)', padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { icon: 'solar:wallet-money-linear', label: 'Funding', active: true },
                    { icon: 'solar:document-text-linear', label: 'Business plan' },
                    { icon: 'solar:square-academic-cap-linear', label: 'Training' },
                    { icon: 'solar:chart-2-linear', label: 'Growth' },
                  ].map((it) => (
                    <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 9, background: it.active ? '#C45A33' : 'transparent', color: it.active ? '#FAF6EF' : '#6B5645', fontSize: 13.5, fontWeight: it.active ? 600 : 500 }}>
                      <Icon icon={it.icon} size={17} /> {it.label}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 21, color: '#2C1E12', margin: 0 }}>Funding matches</h3>
                    <span style={{ fontSize: 12.5, color: '#8A7560' }}>Sorted by fit</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { pct: '94%', pctColor: '#3E6B4F', pctBg: 'rgba(62,107,79,.12)', name: 'Aboriginal Business Financing Program', meta: 'Grant · up to $99,999 · closes in 21 days', tag: 'Eligible', tagColor: '#3E6B4F', tagBg: 'rgba(62,107,79,.1)' },
                      { pct: '88%', pctColor: '#A87A1E', pctBg: 'rgba(201,150,46,.14)', name: 'Indigenous Growth Fund — Working Capital', meta: 'Loan · flexible terms · rolling intake', tag: 'Check terms', tagColor: '#A87A1E', tagBg: 'rgba(201,150,46,.14)' },
                      { pct: '81%', pctColor: '#C45A33', pctBg: 'rgba(196,90,51,.12)', name: 'Community Futures — Start-up Support', meta: 'Loan + mentorship · regional', tag: 'Saved', tagColor: '#6B5645', tagBg: 'rgba(74,56,38,.07)' },
                    ].map((m) => (
                      <div key={m.name} style={{ border: '1px solid rgba(74,56,38,.1)', borderRadius: 13, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 11, background: m.pctBg, color: m.pctColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 14 }}>{m.pct}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#2C1E12', fontSize: 14.5 }}>{m.name}</div>
                          <div style={{ fontSize: 12.5, color: '#8A7560', marginTop: 3 }}>{m.meta}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.tagColor, background: m.tagBg, padding: '5px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>{m.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ height: 90 }} />
          </div>
        </section>

        {/* ===== WHO IT HELPS ===== */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 24px' }}>
          <div data-reveal style={{ maxWidth: 680 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C45A33' }}>Who it helps</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: '#2C1E12', margin: '14px 0 0' }}>Built for the people doing the work.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#6B5645', margin: '18px 0 0' }}>Whether you're starting your first business or supporting hundreds across a Nation, the tools meet you where you are.</p>
          </div>
          <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginTop: 48 }}>
            {[
              { icon: 'solar:rocket-2-linear', accent: '#C45A33', soft: 'rgba(196,90,51,.12)', title: 'Entrepreneurs & small businesses', desc: 'Find the right funding, write a fundable business plan, and build the skills to grow — without paying for a dozen consultants.' },
              { icon: 'solar:users-group-rounded-linear', accent: '#3E6B4F', soft: 'rgba(62,107,79,.12)', title: 'First Nations, Métis & Inuit communities', desc: 'Support economic development across your membership with tools your own team controls — and data that stays yours.' },
              { icon: 'solar:hand-heart-linear', accent: '#A87A1E', soft: 'rgba(201,150,46,.16)', title: 'Funders & support organizations', desc: 'Help more applicants reach "yes" with clearer plans and better-matched funding — and spend less time on back-and-forth.' },
            ].map((c) => (
              <div key={c.title} data-reveal style={{ background: '#FFFDF9', border: '1px solid rgba(74,56,38,.1)', borderRadius: 18, padding: 30 }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: c.soft, color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon icon={c.icon} size={26} /></div>
                <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 22, color: '#2C1E12', margin: '0 0 10px' }}>{c.title}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: '#6B5645', margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how" style={{ background: '#F4ECE0', borderTop: '1px solid rgba(74,56,38,.07)', borderBottom: '1px solid rgba(74,56,38,.07)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 24px' }}>
            <div data-reveal style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C45A33' }}>How it works</span>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: '#2C1E12', margin: '14px 0 0' }}>From idea to funded. In days, not months.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: '#6B5645', margin: '18px auto 0', maxWidth: 560 }}>No onboarding marathon, no consultants on retainer. Four steps, then you're moving.</p>
            </div>
            <div className="ir-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26, marginTop: 58 }}>
              {STEPS.map((s) => (
                <div key={s.num} data-reveal style={{ position: 'relative' }}>
                  <div style={{ ...FONT_HEAD, fontSize: 46, lineHeight: 1, color: '#C45A33', marginBottom: 14 }}>{s.num}</div>
                  <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 20, color: '#2C1E12', margin: '0 0 9px' }}>{s.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.62, color: '#6B5645', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CORE MODULES ===== */}
        <section id="platform" style={{ maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
          <div data-reveal style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C45A33' }}>The platform</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: '#2C1E12', margin: '14px 0 0' }}>Four tools. One platform you control.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#6B5645', margin: '18px auto 0', maxWidth: 560 }}>Each module is live today. Where something is still coming, we say so — clearly.</p>
          </div>
          <div className="ir-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 22, marginTop: 50 }}>
            {MODULES.map((m) => (
              <div key={m.title} data-reveal className="irv2-hov-card" style={{ background: '#FFFDF9', border: '1px solid rgba(74,56,38,.1)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: m.soft, color: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon icon={m.icon} size={28} /></div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: '#3E6B4F', background: 'rgba(62,107,79,.1)', border: '1px solid rgba(62,107,79,.2)', padding: '6px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3E6B4F' }} /> Live today
                  </span>
                </div>
                <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: '#2C1E12', margin: '0 0 10px' }}>{m.title}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.66, color: '#6B5645', margin: '0 0 18px' }}>{m.desc}</p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: '#8A7560', borderTop: '1px dashed rgba(74,56,38,.16)', paddingTop: 16 }}>
                  <Icon icon="solar:map-arrow-up-linear" size={16} style={{ color: '#A87A1E' }} />
                  <span><strong style={{ color: '#6B5645', fontWeight: 600 }}>On the roadmap:</strong> {m.roadmap}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== DATA SOVEREIGNTY ===== */}
        <section id="sovereignty" style={{ background: '#241910', color: '#F3E9DB', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(196,90,51,.18)', filter: 'blur(110px)' }} />
          <div style={{ position: 'absolute', bottom: -140, left: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(62,107,79,.22)', filter: 'blur(120px)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
            <div className="ir-sov-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
              <div data-reveal>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#E0926E' }}>Data sovereignty</span>
                <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.06, letterSpacing: '-.02em', color: '#FBF5EC', margin: '14px 0 0' }}>Your data. Your Nation's data. Your rules.</h2>
                <p style={{ fontSize: 18, lineHeight: 1.7, color: '#C8B6A2', margin: '22px 0 0' }}>We build the platform around the principle that the data belongs to the people it's about. That isn't a feature — it's the foundation.</p>
                <div style={{ marginTop: 30, padding: '20px 22px', border: '1px solid rgba(243,233,219,.16)', borderRadius: 14, background: 'rgba(243,233,219,.04)' }}>
                  <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#C8B6A2', margin: 0 }}><strong style={{ color: '#FBF5EC', fontWeight: 600 }}>PIPEDA-aligned and CASL-aligned.</strong> These describe how we build and operate. They are not third-party certifications unless explicitly stated on our Trust page.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: 'solar:shield-keyhole-linear', iconBg: 'rgba(224,146,110,.18)', iconColor: '#E0926E', title: 'OCAP® by design', body: 'We design around the First Nations principles of Ownership, Control, Access, and Possession. OCAP® is a registered trademark of the First Nations Information Governance Centre — we are designed around it, not certified by it.' },
                  { icon: 'solar:map-point-linear', iconBg: 'rgba(111,163,124,.2)', iconColor: '#8FBF9C', title: 'Stored in Canada', body: <>Your data is stored in Canada (AWS <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#E0926E' }}>ca-central-1</span>). It doesn't leave the country.</> },
                  { icon: 'solar:export-linear', iconBg: 'rgba(201,150,46,.2)', iconColor: '#D9B45A', title: 'Export anytime. No lock-in.', body: 'Take your data with you whenever you want, in open formats. Encryption in transit and at rest, with role-based access you manage.' },
                ].map((c, i) => (
                  <div key={i} data-reveal style={{ display: 'flex', gap: 18, padding: 22, border: '1px solid rgba(243,233,219,.13)', borderRadius: 16, background: 'rgba(243,233,219,.04)' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: c.iconBg, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon icon={c.icon} size={24} /></div>
                    <div>
                      <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 19, color: '#FBF5EC', margin: '0 0 6px' }}>{c.title}</h3>
                      <p style={{ fontSize: 14.5, lineHeight: 1.62, color: '#C8B6A2', margin: 0 }}>{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== PLATFORM PREVIEW TABS ===== */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
          <div data-reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C45A33' }}>A closer look</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: '#2C1E12', margin: '14px 0 0' }}>See it in action.</h2>
          </div>
          <div data-reveal style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 36 }}>
            <button onClick={() => setTab('funding')} style={tabBtn(tab === 'funding')}><Icon icon="solar:wallet-money-linear" size={17} /> Funding</button>
            <button onClick={() => setTab('plan')} style={tabBtn(tab === 'plan')}><Icon icon="solar:document-text-linear" size={17} /> Plan</button>
            <button onClick={() => setTab('training')} style={tabBtn(tab === 'training')}><Icon icon="solar:square-academic-cap-linear" size={17} /> Training</button>
            <button onClick={() => setTab('growth')} style={tabBtn(tab === 'growth')}><Icon icon="solar:chart-2-linear" size={17} /> Growth</button>
          </div>

          <div data-reveal style={{ marginTop: 30, background: '#FFFDF9', border: '1px solid rgba(74,56,38,.12)', borderRadius: 20, boxShadow: '0 24px 60px -30px rgba(44,30,18,.3)', overflow: 'hidden', minHeight: 420 }}>
            {tab === 'funding' && (
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
                  <div>
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: '#2C1E12', margin: 0 }}>Funding Navigator</h3>
                    <p style={{ fontSize: 14, color: '#8A7560', margin: '5px 0 0' }}>12 programs match your profile · 3 closing soon</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#6B5645', border: '1px solid rgba(74,56,38,.15)', padding: '8px 14px', borderRadius: 10 }}>Grants</span>
                    <span style={{ fontSize: 13, color: '#FAF6EF', background: '#C45A33', padding: '8px 14px', borderRadius: 10, fontWeight: 600 }}>All · 12</span>
                  </div>
                </div>
                <div className="ir-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { fit: '94% fit', fitColor: '#3E6B4F', fitBg: 'rgba(62,107,79,.1)', right: '21 days left', rightColor: '#C45A33', title: 'Aboriginal Business Financing Program', desc: 'Non-repayable contribution toward business start-up and expansion costs.', amount: 'up to $99,999' },
                    { fit: '88% fit', fitColor: '#A87A1E', fitBg: 'rgba(201,150,46,.14)', right: 'Rolling', rightColor: '#8A7560', title: 'Indigenous Growth Fund', desc: 'Flexible working-capital loans for established Indigenous businesses.', amount: 'flexible terms' },
                  ].map((c) => (
                    <div key={c.title} style={{ border: '1px solid rgba(74,56,38,.1)', borderRadius: 14, padding: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: c.fitColor, background: c.fitBg, padding: '4px 10px', borderRadius: 100 }}>{c.fit}</span>
                        <span style={{ fontSize: 12.5, color: c.rightColor, fontWeight: 600 }}>{c.right}</span>
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#2C1E12', margin: '13px 0 5px' }}>{c.title}</h4>
                      <p style={{ fontSize: 13.5, color: '#6B5645', margin: '0 0 14px', lineHeight: 1.55 }}>{c.desc}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ ...FONT_HEAD, fontSize: 22, color: '#2C1E12' }}>{c.amount}</span>
                        <span style={{ fontSize: 13, color: '#C45A33', fontWeight: 600 }}>View →</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: '#F4ECE0', borderRadius: 12, padding: '14px 18px' }}>
                  <Icon icon="solar:bell-bing-linear" size={20} style={{ color: '#C45A33' }} />
                  <span style={{ fontSize: 14, color: '#6B5645' }}>Deadline reminders are on. We'll email you 7 days before anything you've saved closes.</span>
                </div>
              </div>
            )}

            {tab === 'plan' && (
              <div className="ir-mock-grid" style={{ display: 'grid', gridTemplateColumns: '230px 1fr', minHeight: 420 }}>
                <div style={{ background: '#F4ECE0', borderRight: '1px solid rgba(74,56,38,.08)', padding: '24px 18px' }}>
                  <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '.1em', color: '#8A7560', margin: '0 0 16px' }}>Your plan · 60%</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 9, fontSize: 14, color: '#2C1E12', background: '#FFFDF9', fontWeight: 600 }}><Icon icon="solar:check-circle-bold" size={17} style={{ color: '#3E6B4F' }} /> Executive summary</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 9, fontSize: 14, color: '#2C1E12', background: '#FFFDF9', fontWeight: 600 }}><Icon icon="solar:check-circle-bold" size={17} style={{ color: '#3E6B4F' }} /> Market & customers</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 9, fontSize: 14, color: '#C45A33', border: '1px solid rgba(196,90,51,.3)', fontWeight: 600 }}><Icon icon="solar:pen-2-linear" size={17} /> Financial plan</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 9, fontSize: 14, color: '#8A7560' }}><Icon icon="solar:lock-keyhole-minimalistic-linear" size={17} /> Operations</div>
                  </div>
                </div>
                <div style={{ padding: '30px 32px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C45A33' }}>Financial plan</span>
                  <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 24, color: '#2C1E12', margin: '8px 0 16px' }}>Let's project your first year.</h3>
                  <div style={{ background: '#F7F1E8', border: '1px solid rgba(74,56,38,.1)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#C45A33', color: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon icon="solar:stars-minimalistic-linear" size={17} /></div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#8A7560' }}>Assistant</span>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A3826', margin: 0 }}>Based on your catering business, most plans like yours estimate <strong>$4,000–$6,000</strong> in monthly revenue by month six. Want me to draft a conservative and an optimistic scenario?</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 14, color: '#FAF6EF', background: '#C45A33', padding: '10px 16px', borderRadius: 10, fontWeight: 600 }}>Draft both scenarios</span>
                    <span style={{ fontSize: 14, color: '#6B5645', border: '1px solid rgba(74,56,38,.18)', padding: '10px 16px', borderRadius: 10 }}>Enter my own numbers</span>
                  </div>
                </div>
              </div>
            )}

            {tab === 'training' && (
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
                  <div>
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: '#2C1E12', margin: 0 }}>Training & Certification</h3>
                    <p style={{ fontSize: 14, color: '#8A7560', margin: '5px 0 0' }}>Short, practical lessons · learn at your pace</p>
                  </div>
                  <span style={{ fontSize: 13, color: '#3E6B4F', background: 'rgba(62,107,79,.1)', padding: '8px 14px', borderRadius: 10, fontWeight: 600 }}>3 in progress</span>
                </div>
                <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[
                    { grad: 'linear-gradient(135deg,#C45A33,#E0926E)', icon: 'solar:wallet-money-linear', title: 'Financing basics', pct: 75, note: '6 of 8 lessons' },
                    { grad: 'linear-gradient(135deg,#3E6B4F,#6FA37C)', icon: 'solar:shop-linear', title: 'Marketing your business', pct: 40, note: '2 of 5 lessons' },
                    { grad: 'linear-gradient(135deg,#C9962E,#E0B23E)', icon: 'solar:clipboard-check-linear', title: 'Operations & bookkeeping', pct: 15, note: 'Just started' },
                  ].map((c) => (
                    <div key={c.title} style={{ border: '1px solid rgba(74,56,38,.1)', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ height: 90, background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon icon={c.icon} size={34} style={{ color: '#FAF6EF' }} /></div>
                      <div style={{ padding: 16 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: '#2C1E12', margin: '0 0 8px' }}>{c.title}</h4>
                        <div style={{ height: 6, background: '#EDE2D2', borderRadius: 100, overflow: 'hidden' }}><div style={{ width: `${c.pct}%`, height: '100%', background: '#3E6B4F' }} /></div>
                        <p style={{ fontSize: 12.5, color: '#8A7560', margin: '8px 0 0' }}>{c.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: '#F4ECE0', borderRadius: 12, padding: '14px 18px' }}>
                  <Icon icon="solar:map-arrow-up-linear" size={20} style={{ color: '#A87A1E' }} />
                  <span style={{ fontSize: 14, color: '#6B5645' }}><strong style={{ color: '#4A3826' }}>On the roadmap:</strong> issued certificates of completion you can share with funders.</span>
                </div>
              </div>
            )}

            {tab === 'growth' && (
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                  <div>
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: '#2C1E12', margin: 0 }}>Growth & Data Tools</h3>
                    <p style={{ fontSize: 14, color: '#8A7560', margin: '5px 0 0' }}>Last 6 months · data you own</p>
                  </div>
                  <span style={{ fontSize: 13, color: '#6B5645', border: '1px solid rgba(74,56,38,.15)', padding: '8px 14px', borderRadius: 10 }}>Export CSV</span>
                </div>
                <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
                  {[
                    { label: 'Revenue', value: '$31,400', delta: '▲ 18% vs prior', deltaColor: '#3E6B4F' },
                    { label: 'Customers', value: '142', delta: '▲ 9 this month', deltaColor: '#3E6B4F' },
                    { label: 'Goal progress', value: '72%', delta: 'to $45k target', deltaColor: '#A87A1E' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: '#F7F1E8', borderRadius: 14, padding: 18 }}>
                      <p style={{ fontSize: 13, color: '#8A7560', margin: '0 0 6px' }}>{s.label}</p>
                      <div style={{ ...FONT_HEAD, fontSize: 28, color: '#2C1E12' }}>{s.value}</div>
                      <span style={{ fontSize: 12.5, color: s.deltaColor, fontWeight: 600 }}>{s.delta}</span>
                    </div>
                  ))}
                </div>
                <div style={{ border: '1px solid rgba(74,56,38,.1)', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
                    {[
                      { h: '42%', bg: '#E6D8C4', m: 'Jan' },
                      { h: '55%', bg: '#E6D8C4', m: 'Feb' },
                      { h: '50%', bg: '#E6D8C4', m: 'Mar' },
                      { h: '70%', bg: '#D9A07E', m: 'Apr' },
                      { h: '84%', bg: '#C45A33', m: 'May' },
                      { h: '100%', bg: '#C45A33', m: 'Jun' },
                    ].map((b) => (
                      <div key={b.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: '100%', height: b.h, background: b.bg, borderRadius: '7px 7px 0 0' }} />
                        <span style={{ fontSize: 11, color: '#8A7560' }}>{b.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="pricing" style={{ background: '#F4ECE0', borderTop: '1px solid rgba(74,56,38,.07)', borderBottom: '1px solid rgba(74,56,38,.07)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
            <div data-reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C45A33' }}>Pricing</span>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: '#2C1E12', margin: '14px 0 0' }}>Honest pricing. Start free.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: '#6B5645', margin: '18px auto 0' }}>Start free, upgrade when you're ready. Billed in CAD — cancel anytime, your data stays exportable.</p>
            </div>
            {/* Cards render from the shared src/data/plans.ts so they stay in
                lock-step with /pricing. Same landing card colour theme; full
                feature lists with ◐ for planned items. */}
            <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 50, alignItems: 'stretch' }}>
              {PLANS.map((p) => {
                const dark = p.popular;
                const cta = {
                  Maadaadiziwin: { to: '/auth', label: 'Start free account', variant: 'dark' },
                  Ogichidaakwe: { to: '/auth', label: 'Start free account', variant: 'terracotta' },
                  Bimaadiziwin: { to: '/auth', label: 'Get Started', variant: 'outline' },
                  Gimishoomis: { to: '/contact', label: 'Talk to our team', variant: 'outline' },
                }[p.key];
                const btnBase = { textAlign: 'center' as const, textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: 13, borderRadius: 11, marginBottom: 24 };
                const btnStyle = cta.variant === 'dark'
                  ? { ...btnBase, background: '#2C1E12', color: '#FAF6EF' }
                  : cta.variant === 'terracotta'
                  ? { ...btnBase, background: '#C45A33', color: '#FAF6EF' }
                  : { ...btnBase, background: '#FFFDF9', color: '#2C1E12', border: '1px solid rgba(74,56,38,.2)' };
                const btnClass = cta.variant === 'dark' ? 'irv2-hov-free-btn' : cta.variant === 'terracotta' ? 'irv2-hov-growth-btn' : 'irv2-hov-nations-btn';
                const checkColor = dark ? '#8FBF9C' : '#3E6B4F';
                const comingColor = dark ? '#D9B45A' : '#A87A1E';
                const featColor = dark ? '#E7D8C5' : '#4A3826';
                const comingTextColor = dark ? '#B7A48F' : '#8A7560';
                return (
                  <div key={p.key} data-reveal style={{ background: dark ? '#241910' : '#FFFDF9', color: dark ? '#F3E9DB' : undefined, border: dark ? undefined : '1px solid rgba(74,56,38,.12)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: dark ? '0 24px 60px -28px rgba(44,30,18,.5)' : undefined }}>
                    {p.popular && (
                      <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', background: '#C45A33', color: '#FAF6EF', padding: '5px 11px', borderRadius: 100 }}>Most popular</span>
                    )}
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 22, color: dark ? '#FBF5EC' : '#2C1E12', margin: 0 }}>{p.name}</h3>
                    <p style={{ fontSize: 14, color: dark ? '#C8B6A2' : '#8A7560', margin: '6px 0 18px' }}>{p.tagline}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 22 }}>
                      <span style={{ ...FONT_HEAD, fontSize: p.period ? 46 : 38, color: dark ? '#FBF5EC' : '#2C1E12' }}>{p.priceLabel}</span>
                      {p.period && <span style={{ fontSize: 15, color: dark ? '#C8B6A2' : '#8A7560' }}>/ {p.period}</span>}
                    </div>
                    <LinkTo to={cta.to} className={btnClass} style={btnStyle}>{cta.label}</LinkTo>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 13 }}>
                      {p.features.map((f) => (
                        f.available ? (
                          <li key={f.text} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: featColor, lineHeight: 1.45 }}>
                            <Icon icon="solar:check-circle-bold" size={18} style={{ color: checkColor, flexShrink: 0 }} /> {f.text}
                          </li>
                        ) : (
                          <li key={f.text} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: comingTextColor, lineHeight: 1.45 }}>
                            <span style={{ color: comingColor, fontSize: 18, flexShrink: 0, lineHeight: 1 }}>◐</span>
                            {f.text} <em style={{ color: comingColor, fontStyle: 'normal' }}>· coming soon</em>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p data-reveal style={{ textAlign: 'center', fontSize: 13.5, color: '#8A7560', margin: '28px auto 0', maxWidth: 560, lineHeight: 1.6 }}>All plans are billed in CAD. Cancel anytime — your data stays exportable.</p>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C45A33' }}>Questions</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.08, letterSpacing: '-.02em', color: '#2C1E12', margin: '14px 0 0' }}>Straight answers.</h2>
          </div>
          <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={f.q} style={{ background: '#FFFDF9', border: '1px solid rgba(74,56,38,.12)', borderRadius: 14, overflow: 'hidden' }}>
                  <button onClick={() => setFaqOpen(open ? -1 : i)} aria-expanded={open} aria-controls={`faq-panel-${i}`} id={`faq-trigger-${i}`} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', ...FONT_HEAD, fontWeight: 600, fontSize: 18, color: '#2C1E12' }}>
                    {f.q}
                    <Icon icon={open ? 'solar:minus-circle-linear' : 'solar:add-circle-linear'} size={22} style={{ color: '#C45A33', flexShrink: 0 }} aria-hidden="true" />
                  </button>
                  {open && <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-trigger-${i}`} style={{ padding: '0 24px 22px', fontSize: 15.5, lineHeight: 1.7, color: '#6B5645' }}>{f.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section id="start" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 100px' }}>
          <div data-reveal style={{ background: '#C45A33', borderRadius: 26, padding: 'clamp(40px,6vw,76px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.1)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: -100, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'rgba(36,25,16,.22)', filter: 'blur(80px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(32px,4.5vw,54px)', lineHeight: 1.06, letterSpacing: '-.02em', color: '#FFF7F0', margin: '0 auto', maxWidth: 680 }}>Start building your business today.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: '#FCE3D6', margin: '20px auto 0', maxWidth: 480 }}>Free to start. Your data stays in Canada, and stays yours.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 34 }}>
                <LinkTo to="/auth" className="irv2-hov-lift" style={{ background: '#FFF7F0', color: '#C45A33', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 32px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 24px rgba(36,25,16,.2)' }}>
                  Start free account <Icon icon="solar:arrow-right-linear" size={19} />
                </LinkTo>
                <LinkTo to="/contact" className="irv2-hov-soft" style={{ background: 'rgba(255,255,255,.18)', color: '#FFF7F0', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,.6)' }}>
                  Talk to our team
                </LinkTo>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER (shared canonical component, used on every route) ===== */}
        <Footer />
      </div>
    </>
  );
};

export default LandingV2;
