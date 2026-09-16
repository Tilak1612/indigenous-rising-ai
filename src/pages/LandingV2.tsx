import React, { useEffect, useRef, useState } from 'react';
import AmbientVideo from '@/components/media/AmbientVideo';
import { signupHref } from '@/lib/signup-intent';
import { trackSignupCta } from '@/lib/conversion-events';
import DemoCta from '@/components/DemoCta';
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
import { BrandMark } from '@/components/BrandMark';
import './landing-v2.css';
import { ROUTE_TITLES } from '@/data/routeTitles';

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
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) =>
  to.startsWith('/') ? (
    <Link to={to} className={className} style={style} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a href={to} className={className} style={style} onClick={onClick}>
      {children}
    </a>
  );

type Tab = 'funding' | 'plan' | 'training' | 'growth';

const MODULES = [
  {
    icon: 'solar:wallet-money-linear',
    accent: 'var(--ir-green)',
    soft: 'rgba(18,76,59,.12)',
    title: 'Funding Navigator',
    desc: 'Search and match to grants, loans, and programs relevant to Indigenous businesses — with deadlines and eligibility written in plain language.',
    roadmap: 'auto-filled application drafts.',
  },
  {
    icon: 'solar:document-text-linear',
    accent: 'var(--ir-green)',
    soft: 'rgba(62,107,79,.12)',
    title: 'Business Planning Assistant',
    desc: 'Build a lender-ready business plan section by section, with prompts written for Indigenous entrepreneurs — not generic templates.',
    roadmap: 'financial projection templates.',
  },
  {
    icon: 'solar:square-academic-cap-linear',
    accent: 'var(--ir-gold)',
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
  { q: 'Is it really free to start?', a: 'Yes. The Free plan is free forever — funding search with deadline reminders, one guided business plan, and full data export. No credit card to sign up. The cultural competency training library is included once you upgrade to Growth.' },
  { q: 'Who owns my data?', a: 'You do. We design around OCAP® principles — Ownership, Control, Access, and Possession — and you can export everything in open formats and delete your account at any time. For community accounts, your organization controls access for its members.' },
  { q: 'What does OCAP® mean here?', a: 'OCAP® is a set of First Nations principles for how data about a community should be governed. We design the platform around those principles. OCAP® is a registered trademark of the First Nations Information Governance Centre; we are designed around it, not certified by it.' },
  { q: 'Where is my information stored?', a: 'In Canada. Your data is stored in AWS ca-central-1, encrypted in transit and at rest, with role-based access you control. Some AI features process limited, non-identifying details through third-party providers — we disclose every one in our Privacy Policy.' },
  { q: 'Is my information shared with funders?', a: 'No. Nothing is shared with a funder unless you choose to submit it. We do not sell your data, and we do not share it with funders or third parties without your explicit action.' },
  { q: 'What do I get when I sign up?', a: 'All four modules — Funding Navigator, Business Planning, Training, and Growth Tools — are live and available today. The free plan gets you started with no credit card: three funding matches a month, a guided business plan, the funding browser, and the community forum. Growth adds 50 matches a month, priority support, the training library, readiness checklists and email deadline alerts. Anything still in build is marked "coming soon" on the pricing page. You can export your data and cancel at any time.' },
];

// Brand display face — Manrope ExtraBold/Bold per brand/09-brand-system spec
// 108. Fraunces was never the brand typeface.
const FONT_HEAD: React.CSSProperties = { fontFamily: "'Manrope', 'Inter', Arial, sans-serif" };

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

    const colors = ['var(--ir-green)', 'var(--ir-green)', '#C9962E', '#D9885E', 'var(--ir-sage)'];
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
    background: active ? 'var(--ir-green)' : 'var(--ir-paper)',
    color: active ? 'var(--ir-cream)' : 'var(--ir-bark)',
    boxShadow: active ? '0 4px 14px rgba(18,76,59,.28)' : 'none',
  });

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* Homepage SEO: title, description, OpenGraph/Twitter, canonical, JSON-LD. */}
      <MetaTags
        isHomePage
        title={ROUTE_TITLES['/']}
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
              <BrandMark size={32} />
              <span style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 19, color: 'var(--ir-ink)', letterSpacing: '-.01em' }}>Indigenous Rising</span>
            </a>
            <nav className="ir-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              {[['Platform', '#platform'], ['How it works', '#how'], ['Sovereignty', '#sovereignty'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
                <a key={href} href={href} style={{ fontSize: 14.5, color: 'var(--ir-bark)', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
              ))}
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <LinkTo to="/auth" className="ir-login-link" style={{ fontSize: 14.5, color: 'var(--ir-bark)', textDecoration: 'none', fontWeight: 500 }}>Log in</LinkTo>
              <LinkTo to="/signup" onClick={() => trackSignupCta('landing_nav')} className="irv2-hov-cta" style={{ background: 'var(--ir-green)', color: 'var(--ir-cream)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '11px 20px', borderRadius: 10, boxShadow: '0 2px 10px rgba(18,76,59,.28)' }}><span className="ir-cta-long">Start free account</span><span className="ir-cta-short">Get Started</span></LinkTo>
              <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="ir-burger" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ir-ink)', padding: 4 }}>
                <Icon icon="solar:hamburger-menu-linear" size={26} />
              </button>
            </div>
          </div>
          {menuOpen && (
            <div style={{ borderTop: '1px solid rgba(74,56,38,.08)', padding: '14px 24px 20px', display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--ir-cream)' }}>
              {[['Platform', '#platform'], ['How it works', '#how'], ['Data sovereignty', '#sovereignty'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', fontSize: 16, color: 'var(--ir-umber)', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
              ))}
            </div>
          )}
        </header>

        <main>
        {/* ===== HERO ===== */}
        <section id="top" style={{ position: 'relative', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(120% 80% at 50% 0%, rgba(250,246,239,.2) 0%, rgba(250,246,239,.7) 55%, var(--ir-cream) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: 'clamp(52px,9vw,88px) 24px 0', textAlign: 'center' }}>
            <div data-reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(62,107,79,.1)', border: '1px solid rgba(62,107,79,.22)', color: 'var(--ir-green)', fontSize: 13, fontWeight: 600, padding: '7px 15px', borderRadius: 100, marginBottom: 30 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ir-green)' }} />
              Built around Indigenous data sovereignty
            </div>
            <h1 data-reveal style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(34px,5vw,64px)', lineHeight: 1.08, letterSpacing: '-.025em', color: 'var(--ir-ink)', maxWidth: 860, margin: '0 auto' }}>
              Get <span style={{ fontStyle: 'italic', color: '#D45B35' }}>funded.</span> Grow your business. Keep your data.
            </h1>
            <p data-reveal style={{ fontSize: 'clamp(17px,1.6vw,21px)', lineHeight: 1.65, color: 'var(--ir-bark)', maxWidth: 620, margin: '28px auto 0' }}>
              Find funding, build your business plan, access training, and manage your growth — all in one place, designed around OCAP® principles and the data sovereignty of your community.
            </p>
            <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center', marginTop: 38 }}>
              <LinkTo to="/signup" onClick={() => trackSignupCta('hero')} className="irv2-hov-cta-lift" style={{ background: 'var(--ir-green)', color: 'var(--ir-cream)', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 30px', borderRadius: 12, boxShadow: '0 6px 20px rgba(18,76,59,.3)', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                Start free account
                <Icon icon="solar:arrow-right-linear" size={19} />
              </LinkTo>
              <a href="#platform" className="irv2-hov-link" style={{ color: 'var(--ir-ink)', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                See the platform
                <Icon icon="solar:play-circle-linear" size={19} />
              </a>
              <DemoCta
                placement="hero"
                className="irv2-hov-link"
                style={{ color: 'var(--ir-green)', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 14px', display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(18,76,59,.28)', borderRadius: 12 }}
              >
                Book a demo
              </DemoCta>
            </div>
            <p data-reveal style={{ marginTop: 20, fontSize: 13.5, color: 'var(--ir-stone)', display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon icon="solar:check-circle-bold" size={15} style={{ color: 'var(--ir-green)' }} /> Free to start</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon icon="solar:map-point-bold" size={15} style={{ color: 'var(--ir-green)' }} /> Your data stays in Canada</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon icon="solar:lock-keyhole-bold" size={15} style={{ color: 'var(--ir-green)' }} /> Export anytime</span>
            </p>

            {/* Hero product mock, seated on a slow timber loop.
                The motion is atmosphere only: it sits BEHIND the browser
                frame and never under the headline or the screenshot, so
                nothing readable moves. AmbientVideo does not render a
                <video> at all under reduced motion, below 768px, on
                Save-Data, or before it scrolls into view — it shows the
                poster instead, so a phone never spends the 120KB. */}
            <div data-reveal style={{ position: 'relative', marginTop: 64, maxWidth: 1060, marginLeft: 'auto', marginRight: 'auto' }}>
              <AmbientVideo
                webm="/video/hero-ambient.webm"
                mp4="/video/hero-ambient.mp4"
                poster="/video/hero-ambient-poster.jpg"
                posterAvif="/video/hero-ambient-poster.avif"
                posterWebp="/video/hero-ambient-poster.webp"
                style={{
                  position: 'absolute', inset: '-6% -3%', borderRadius: 28,
                  overflow: 'hidden', opacity: 0.28, filter: 'saturate(.85)',
                  // Fades out at the edges so it reads as depth, not a panel.
                  maskImage: 'radial-gradient(120% 90% at 50% 45%, #000 55%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(120% 90% at 50% 45%, #000 55%, transparent 100%)',
                }}
              />
            <div style={{ position: 'relative', maxWidth: 980, marginLeft: 'auto', marginRight: 'auto', background: 'var(--ir-paper)', border: '1px solid rgba(74,56,38,.1)', borderRadius: 20, boxShadow: '0 30px 80px -30px rgba(44,30,18,.35)', overflow: 'hidden', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: '1px solid rgba(74,56,38,.08)', background: 'var(--ir-linen)' }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#D9694A' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--ir-amber)' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--ir-sage)' }} />
                <span style={{ marginLeft: 14, fontSize: 12.5, color: 'var(--ir-stone)' }}>app.indigenousrising.ai / funding</span>
              </div>
              {/* A REAL screenshot of /funding, inside the browser frame above.
                  What stood here was a hand-built mock whose match scores —
                  94%, 88%, 81% — were invented and attached to real programme
                  names. That is a fabricated business result on the most-seen
                  surface of the site, and no amount of styling makes it true.
                  This is the actual product with actual programmes and actual
                  amounts, captured from production.

                  Art-directed: the 1280-wide capture is unreadable on a phone,
                  so below 768px a tighter 640 crop is served instead of
                  shrinking the whole thing to illegibility. */}
              <picture>
                <source media="(max-width: 767px)" type="image/webp" srcSet="/img/shot-funding-640.webp" />
                <source type="image/avif" srcSet="/img/shot-funding-1280.avif" />
                <source type="image/webp" srcSet="/img/shot-funding-1280.webp" />
                <img
                  src="/img/shot-funding-1280.jpg"
                  alt="The funding page of Indigenous Rising AI, listing current programmes with their funder, amount range and intake status."
                  width={1280}
                  height={860}
                  loading="lazy"
                  decoding="async"
                  style={{ display: 'block', width: '100%', height: 'auto', borderTop: '1px solid rgba(74,56,38,.08)' }}
                />
              </picture>
            </div>
            </div>
            <div style={{ height: 90 }} />
          </div>
        </section>

        {/* ===== WHO IT HELPS ===== */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 24px' }}>
          <div className="ir-who-head">
            <div data-reveal style={{ maxWidth: 680 }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-green)' }}>Who it helps</span>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: 'var(--ir-ink)', margin: '14px 0 0' }}>Built for the people doing the work.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ir-bark)', margin: '18px 0 0' }}>Whether you're starting your first business or supporting hundreds across a Nation, the tools meet you where you are.</p>
            </div>
            {/* Reviewed Higgsfield output (Track A of docs/higgsfield-asset-plan.md,
                asset A2): hands only, no face — Track B (any identifiable person)
                is commissioned photography, never generated. */}
            <picture data-reveal>
              <source media="(max-width: 920px)" type="image/webp" srcSet="/img/section-hands-ledger-640.webp" width={640} height={478} />
              <source type="image/avif" srcSet="/img/section-hands-ledger-1600.avif" width={1600} height={1194} />
              <source type="image/webp" srcSet="/img/section-hands-ledger-1600.webp" width={1600} height={1194} />
              <img
                src="/img/section-hands-ledger-1600.jpg"
                alt="Hands writing in a paper ledger on a workshop bench beside an enamel mug."
                width={1600}
                height={1194}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: 'auto', borderRadius: 18, border: '1px solid rgba(74,56,38,.12)', boxShadow: '0 10px 30px rgba(36,25,16,.12)' }}
              />
            </picture>
          </div>
          <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginTop: 48 }}>
            {[
              { icon: 'solar:rocket-2-linear', accent: 'var(--ir-green)', soft: 'rgba(18,76,59,.12)', title: 'Entrepreneurs & small businesses', desc: 'Find the right funding, write a fundable business plan, and build the skills to grow — without paying for a dozen consultants.' },
              { icon: 'solar:users-group-rounded-linear', accent: 'var(--ir-green)', soft: 'rgba(62,107,79,.12)', title: 'First Nations, Métis & Inuit communities', desc: 'Support economic development across your membership with tools your own team controls — and data that stays yours.' },
              { icon: 'solar:hand-heart-linear', accent: 'var(--ir-gold)', soft: 'rgba(201,150,46,.16)', title: 'Funders & support organizations', desc: 'Help more applicants reach "yes" with clearer plans and better-matched funding — and spend less time on back-and-forth.' },
            ].map((c) => (
              <div key={c.title} data-reveal style={{ background: 'var(--ir-paper)', border: '1px solid rgba(74,56,38,.1)', borderRadius: 18, padding: 30 }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: c.soft, color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Icon icon={c.icon} size={26} /></div>
                <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 22, color: 'var(--ir-ink)', margin: '0 0 10px' }}>{c.title}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--ir-bark)', margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how" style={{ background: 'var(--ir-sand)', borderTop: '1px solid rgba(74,56,38,.07)', borderBottom: '1px solid rgba(74,56,38,.07)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 24px' }}>
            <div data-reveal style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-green)' }}>How it works</span>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: 'var(--ir-ink)', margin: '14px 0 0' }}>From idea to funded. In days, not months.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ir-bark)', margin: '18px auto 0', maxWidth: 560 }}>No onboarding marathon, no consultants on retainer. Four steps, then you're moving.</p>
            </div>
            <div className="ir-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26, marginTop: 58 }}>
              {STEPS.map((s) => (
                <div key={s.num} data-reveal style={{ position: 'relative' }}>
                  <div style={{ ...FONT_HEAD, fontSize: 46, lineHeight: 1, color: 'var(--ir-green)', marginBottom: 14 }}>{s.num}</div>
                  <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 20, color: 'var(--ir-ink)', margin: '0 0 9px' }}>{s.title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.62, color: 'var(--ir-bark)', margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CORE MODULES ===== */}
        <section id="platform" style={{ maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
          <div data-reveal style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-green)' }}>The platform</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: 'var(--ir-ink)', margin: '14px 0 0' }}>Four tools. One platform you control.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ir-bark)', margin: '18px auto 0', maxWidth: 560 }}>Each module is live today. Where something is still coming, we say so — clearly.</p>
          </div>
          <div className="ir-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 22, marginTop: 50 }}>
            {MODULES.map((m) => (
              <div key={m.title} data-reveal className="irv2-hov-card" style={{ background: 'var(--ir-paper)', border: '1px solid rgba(74,56,38,.1)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: m.soft, color: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon icon={m.icon} size={28} /></div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: 'var(--ir-green)', background: 'rgba(62,107,79,.1)', border: '1px solid rgba(62,107,79,.2)', padding: '6px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ir-green)' }} /> Live today
                  </span>
                </div>
                <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: 'var(--ir-ink)', margin: '0 0 10px' }}>{m.title}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.66, color: 'var(--ir-bark)', margin: '0 0 18px' }}>{m.desc}</p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--ir-stone)', borderTop: '1px dashed rgba(74,56,38,.16)', paddingTop: 16 }}>
                  <Icon icon="solar:map-arrow-up-linear" size={16} style={{ color: 'var(--ir-gold)' }} />
                  <span><strong style={{ color: 'var(--ir-bark)', fontWeight: 600 }}>On the roadmap:</strong> {m.roadmap}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== DATA SOVEREIGNTY ===== */}
        <section id="sovereignty" style={{ background: 'var(--ir-brown-deep)', color: 'var(--ir-cream-warm)', position: 'relative', overflow: 'hidden' }}>
          {/* Boreal forest at dusk, behind a heavy scrim. Decorative only —
              empty alt and aria-hidden, because it carries no information the
              heading does not already state. Art-directed per breakpoint: the
              16:9 desktop frame crops the treeline out at phone widths, so the
              vertical composition is a separate source rather than a crop.
              Lazy-loaded and sized so it reserves no layout. The scrim keeps
              the reversed cream text above 4.5:1 — measured, not assumed. */}
          <picture>
            <source
              media="(max-width: 767px)"
              type="image/avif"
              srcSet="/img/sovereignty-land-mobile.avif"
              width={1080}
              height={1440}
            />
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet="/img/sovereignty-land-mobile.webp"
              width={1080}
              height={1440}
            />
            <source media="(max-width: 767px)" srcSet="/img/sovereignty-land-mobile.jpg" width={1080} height={1440} />
            <source type="image/avif" srcSet="/img/sovereignty-land-desktop.avif" width={1920} height={1080} />
            <source type="image/webp" srcSet="/img/sovereignty-land-desktop.webp" width={1920} height={1080} />
            <img
              src="/img/sovereignty-land-desktop.jpg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              width={1920}
              height={1080}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
            />
          </picture>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(36,25,16,.88)' }} />
          <div style={{ position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(18,76,59,.18)', filter: 'blur(110px)' }} />
          <div style={{ position: 'absolute', bottom: -140, left: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(62,107,79,.22)', filter: 'blur(120px)' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
            <div className="ir-sov-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
              <div data-reveal>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-terracotta)' }}>Data sovereignty</span>
                <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.06, letterSpacing: '-.02em', color: 'var(--ir-cream-light)', margin: '14px 0 0' }}>Your data. Your Nation's data. Your rules.</h2>
                <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--ir-clay)', margin: '22px 0 0' }}>We build the platform around the principle that the data belongs to the people it's about. That isn't a feature — it's the foundation.</p>
                <div style={{ marginTop: 30, padding: '20px 22px', border: '1px solid rgba(243,233,219,.16)', borderRadius: 14, background: 'rgba(243,233,219,.04)' }}>
                  <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ir-clay)', margin: 0 }}><strong style={{ color: 'var(--ir-cream-light)', fontWeight: 600 }}>PIPEDA-aligned and CASL-aligned.</strong> These describe how we build and operate. They are not third-party certifications unless explicitly stated on our Trust page.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: 'solar:shield-keyhole-linear', iconBg: 'rgba(224,146,110,.18)', iconColor: 'var(--ir-terracotta)', title: 'OCAP® by design', body: 'We design around the First Nations principles of Ownership, Control, Access, and Possession. OCAP® is a registered trademark of the First Nations Information Governance Centre — we are designed around it, not certified by it.' },
                  { icon: 'solar:map-point-linear', iconBg: 'rgba(111,163,124,.2)', iconColor: '#8FBF9C', title: 'Stored in Canada', body: <>Your data is stored in Canada (AWS <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, color: '#F0A98A' }}>ca-central-1</span>), encrypted in transit and at rest.</> },
                  { icon: 'solar:export-linear', iconBg: 'rgba(201,150,46,.2)', iconColor: 'var(--ir-brass)', title: 'Export anytime. No lock-in.', body: 'Take your data with you whenever you want, in open formats. Encryption in transit and at rest, with role-based access you manage.' },
                ].map((c, i) => (
                  <div key={i} data-reveal style={{ display: 'flex', gap: 18, padding: 22, border: '1px solid rgba(243,233,219,.13)', borderRadius: 16, background: 'rgba(243,233,219,.04)' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: c.iconBg, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon icon={c.icon} size={24} /></div>
                    <div>
                      <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 19, color: 'var(--ir-cream-light)', margin: '0 0 6px' }}>{c.title}</h3>
                      <p style={{ fontSize: 14.5, lineHeight: 1.62, color: 'var(--ir-clay)', margin: 0 }}>{c.body}</p>
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
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-green)' }}>A closer look</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: 'var(--ir-ink)', margin: '14px 0 0' }}>See it in action.</h2>
          </div>
          <div data-reveal style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 36 }}>
            <button onClick={() => setTab('funding')} style={tabBtn(tab === 'funding')}><Icon icon="solar:wallet-money-linear" size={17} /> Funding</button>
            <button onClick={() => setTab('plan')} style={tabBtn(tab === 'plan')}><Icon icon="solar:document-text-linear" size={17} /> Plan</button>
            <button onClick={() => setTab('training')} style={tabBtn(tab === 'training')}><Icon icon="solar:square-academic-cap-linear" size={17} /> Training</button>
            <button onClick={() => setTab('growth')} style={tabBtn(tab === 'growth')}><Icon icon="solar:chart-2-linear" size={17} /> Growth</button>
          </div>

          <div data-reveal style={{ marginTop: 30, background: 'var(--ir-paper)', border: '1px solid rgba(74,56,38,.12)', borderRadius: 20, boxShadow: '0 24px 60px -30px rgba(44,30,18,.3)', overflow: 'hidden', minHeight: 420 }}>
            {tab === 'funding' && (
              /* A real screenshot of /dashboard/funding/matches, captured with
                 a throwaway sample account. It replaces a hand-built mock that
                 showed invented fit percentages (94%, 88%) attached to real
                 programme names — the same fabrication the hero shed in #171,
                 which its test only policed there. The real screen carries the
                 product's own "how to read these results" disclaimer. */
              <div style={{ padding: 18 }}>
                <picture>
                  <source media="(max-width: 700px)" type="image/webp" srcSet="/img/shot-matches-640.webp" width={640} height={538} />
                  <source type="image/avif" srcSet="/img/shot-matches-1024.avif" width={1024} height={860} />
                  <source type="image/webp" srcSet="/img/shot-matches-1024.webp" width={1024} height={860} />
                  <img
                    src="/img/shot-matches-1024.jpg"
                    alt="The Funding Matches screen: real programs found for a sample profile, each showing the criteria it meets, with a note explaining how to read the results."
                    width={1024}
                    height={860}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid rgba(74,56,38,.12)', display: 'block' }}
                  />
                </picture>
                <p style={{ fontSize: 13, color: 'var(--ir-stone)', margin: '12px 4px 0', textAlign: 'center' }}>
                  The real Funding Matches screen, shown with a sample account. Programs come from our database — always confirm details with the funder.
                </p>
              </div>
            )}

            {tab === 'plan' && (
              /* A real screenshot of /dashboard/plan, same sample account. */
              <div style={{ padding: 18 }}>
                <picture>
                  <source media="(max-width: 700px)" type="image/webp" srcSet="/img/shot-plan-640.webp" width={640} height={538} />
                  <source type="image/avif" srcSet="/img/shot-plan-1024.avif" width={1024} height={860} />
                  <source type="image/webp" srcSet="/img/shot-plan-1024.webp" width={1024} height={860} />
                  <img
                    src="/img/shot-plan-1024.jpg"
                    alt="The Business Planning Assistant: six guided sections from Vision and Mission to Community Impact, with a rich text editor and plan completion tracking."
                    width={1024}
                    height={860}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid rgba(74,56,38,.12)', display: 'block' }}
                  />
                </picture>
                <p style={{ fontSize: 13, color: 'var(--ir-stone)', margin: '12px 4px 0', textAlign: 'center' }}>
                  The real Business Planner, shown with a sample account — six guided sections, saved versions, and export.
                </p>
              </div>
            )}

            {tab === 'training' && (
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
                  <div>
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: 'var(--ir-ink)', margin: 0 }}>Training & Certification</h3>
                    <p style={{ fontSize: 14, color: 'var(--ir-stone)', margin: '5px 0 0' }}>Short, practical lessons · learn at your pace</p>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--ir-green)', background: 'rgba(62,107,79,.1)', padding: '8px 14px', borderRadius: 10, fontWeight: 600 }}>3 in progress</span>
                </div>
                <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {[
                    { grad: 'linear-gradient(135deg,var(--ir-green),var(--ir-terracotta))', icon: 'solar:wallet-money-linear', title: 'Financing basics', pct: 75, note: '6 of 8 lessons' },
                    { grad: 'linear-gradient(135deg,var(--ir-green),var(--ir-sage))', icon: 'solar:shop-linear', title: 'Marketing your business', pct: 40, note: '2 of 5 lessons' },
                    { grad: 'linear-gradient(135deg,#C9962E,var(--ir-amber))', icon: 'solar:clipboard-check-linear', title: 'Operations & bookkeeping', pct: 15, note: 'Just started' },
                  ].map((c) => (
                    <div key={c.title} style={{ border: '1px solid rgba(74,56,38,.1)', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ height: 90, background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon icon={c.icon} size={34} style={{ color: 'var(--ir-cream)' }} /></div>
                      <div style={{ padding: 16 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ir-ink)', margin: '0 0 8px' }}>{c.title}</h4>
                        <div style={{ height: 6, background: '#EDE2D2', borderRadius: 100, overflow: 'hidden' }}><div style={{ width: `${c.pct}%`, height: '100%', background: 'var(--ir-green)' }} /></div>
                        <p style={{ fontSize: 12.5, color: 'var(--ir-stone)', margin: '8px 0 0' }}>{c.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--ir-sand)', borderRadius: 12, padding: '14px 18px' }}>
                  <Icon icon="solar:map-arrow-up-linear" size={20} style={{ color: 'var(--ir-gold)' }} />
                  <span style={{ fontSize: 14, color: 'var(--ir-bark)' }}><strong style={{ color: 'var(--ir-umber)' }}>On the roadmap:</strong> issued certificates of completion you can share with funders.</span>
                </div>
              </div>
            )}

            {tab === 'growth' && (
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                  <div>
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 23, color: 'var(--ir-ink)', margin: 0 }}>Growth & Data Tools</h3>
                    <p style={{ fontSize: 14, color: 'var(--ir-stone)', margin: '5px 0 0' }}>Last 6 months · data you own</p>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--ir-bark)', border: '1px solid rgba(74,56,38,.15)', padding: '8px 14px', borderRadius: 10 }}>Export CSV</span>
                </div>
                <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
                  {[
                    { label: 'Revenue', value: '$31,400', delta: '▲ 18% vs prior', deltaColor: 'var(--ir-green)' },
                    { label: 'Customers', value: '142', delta: '▲ 9 this month', deltaColor: 'var(--ir-green)' },
                    { label: 'Goal progress', value: '72%', delta: 'to $45k target', deltaColor: 'var(--ir-gold)' },
                  ].map((s) => (
                    <div key={s.label} style={{ background: 'var(--ir-linen)', borderRadius: 14, padding: 18 }}>
                      <p style={{ fontSize: 13, color: 'var(--ir-stone)', margin: '0 0 6px' }}>{s.label}</p>
                      <div style={{ ...FONT_HEAD, fontSize: 28, color: 'var(--ir-ink)' }}>{s.value}</div>
                      <span style={{ fontSize: 12.5, color: s.deltaColor, fontWeight: 600 }}>{s.delta}</span>
                    </div>
                  ))}
                </div>
                <div style={{ border: '1px solid rgba(74,56,38,.1)', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
                    {[
                      { h: '42%', bg: 'var(--ir-sand-deep)', m: 'Jan' },
                      { h: '55%', bg: 'var(--ir-sand-deep)', m: 'Feb' },
                      { h: '50%', bg: 'var(--ir-sand-deep)', m: 'Mar' },
                      { h: '70%', bg: '#D9A07E', m: 'Apr' },
                      { h: '84%', bg: 'var(--ir-green)', m: 'May' },
                      { h: '100%', bg: 'var(--ir-green)', m: 'Jun' },
                    ].map((b) => (
                      <div key={b.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: '100%', height: b.h, background: b.bg, borderRadius: '7px 7px 0 0' }} />
                        <span style={{ fontSize: 11, color: 'var(--ir-stone)' }}>{b.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section id="pricing" style={{ background: 'var(--ir-sand)', borderTop: '1px solid rgba(74,56,38,.07)', borderBottom: '1px solid rgba(74,56,38,.07)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '100px 24px' }}>
            <div data-reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-green)' }}>Pricing</span>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', color: 'var(--ir-ink)', margin: '14px 0 0' }}>Honest pricing. Start free.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--ir-bark)', margin: '18px auto 0' }}>Start free, upgrade when you're ready. Billed in CAD — cancel anytime, your data stays exportable.</p>
            </div>
            {/* Cards render from the shared src/data/plans.ts so they stay in
                lock-step with /pricing. Same landing card colour theme; full
                feature lists with ◐ for planned items. */}
            <div className="ir-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 50, alignItems: 'stretch' }}>
              {PLANS.map((p) => {
                const dark = p.popular;
                // These pointed at /auth, which defaults to SIGN IN — so
                // "Start free account" on a pricing card put a brand new
                // visitor on a login form, and the plan they clicked was
                // dropped. That is the P0-0 defect; it was fixed in
                // PricingSection.tsx but this page carries its own pricing
                // block, which nobody updated. signupHref() lands on the
                // registration form with the plan preserved through
                // verification. "Log in" above and "Talk to our team" below
                // are correct as they are.
                const cta = {
                  Maadaadiziwin: { to: signupHref('Maadaadiziwin'), label: 'Start free account', variant: 'dark' },
                  Ogichidaakwe: { to: signupHref('Ogichidaakwe'), label: 'Start free account', variant: 'terracotta' },
                  Bimaadiziwin: { to: signupHref('Bimaadiziwin'), label: 'Get Started', variant: 'outline' },
                  // Enterprise has no self-serve checkout, so its action is a
                  // conversation. A booked demo is a better first step than a
                  // contact form for a Nation evaluating the platform.
                  Gimishoomis: { to: '/demo', label: 'Book a demo', variant: 'outline' },
                }[p.key];
                const btnBase = { textAlign: 'center' as const, textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: 13, borderRadius: 11, marginBottom: 24 };
                const btnStyle = cta.variant === 'dark'
                  ? { ...btnBase, background: 'var(--ir-ink)', color: 'var(--ir-cream)' }
                  : cta.variant === 'terracotta'
                  ? { ...btnBase, background: 'var(--ir-green)', color: 'var(--ir-cream)' }
                  : { ...btnBase, background: 'var(--ir-paper)', color: 'var(--ir-ink)', border: '1px solid rgba(74,56,38,.2)' };
                const btnClass = cta.variant === 'dark' ? 'irv2-hov-free-btn' : cta.variant === 'terracotta' ? 'irv2-hov-growth-btn' : 'irv2-hov-nations-btn';
                const checkColor = dark ? '#8FBF9C' : 'var(--ir-green)';
                const comingColor = dark ? 'var(--ir-brass)' : 'var(--ir-gold)';
                const featColor = dark ? '#E7D8C5' : 'var(--ir-umber)';
                const comingTextColor = dark ? '#B7A48F' : 'var(--ir-bark-light)';
                return (
                  <div key={p.key} data-reveal style={{ background: dark ? 'var(--ir-brown-deep)' : 'var(--ir-paper)', color: dark ? 'var(--ir-cream-warm)' : undefined, border: dark ? undefined : '1px solid rgba(74,56,38,.12)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: dark ? '0 24px 60px -28px rgba(44,30,18,.5)' : undefined }}>
                    {p.popular && (
                      <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 11.5, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', background: 'var(--ir-green)', color: 'var(--ir-cream)', padding: '5px 11px', borderRadius: 100 }}>Most popular</span>
                    )}
                    <h3 style={{ ...FONT_HEAD, fontWeight: 600, fontSize: 22, color: dark ? 'var(--ir-cream-light)' : 'var(--ir-ink)', margin: 0 }}>{p.name}</h3>
                    <p style={{ fontSize: 14, color: dark ? 'var(--ir-clay)' : 'var(--ir-bark-light)', margin: '6px 0 18px' }}>{p.tagline}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 22 }}>
                      <span style={{ ...FONT_HEAD, fontSize: p.period ? 46 : 38, color: dark ? 'var(--ir-cream-light)' : 'var(--ir-ink)' }}>{p.priceLabel}</span>
                      {p.period && <span style={{ fontSize: 15, color: dark ? 'var(--ir-clay)' : 'var(--ir-bark-light)' }}>/ {p.period}</span>}
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
            <p data-reveal style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ir-stone)', margin: '28px auto 0', maxWidth: 560, lineHeight: 1.6 }}>All plans are billed in CAD. Cancel anytime — your data stays exportable.</p>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section id="faq" style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px' }}>
          <div data-reveal style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ir-green)' }}>Questions</span>
            <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(30px,4vw,46px)', lineHeight: 1.08, letterSpacing: '-.02em', color: 'var(--ir-ink)', margin: '14px 0 0' }}>Straight answers.</h2>
          </div>
          <div data-reveal style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={f.q} style={{ background: 'var(--ir-paper)', border: '1px solid rgba(74,56,38,.12)', borderRadius: 14, overflow: 'hidden' }}>
                  <button onClick={() => setFaqOpen(open ? -1 : i)} aria-expanded={open} aria-controls={`faq-panel-${i}`} id={`faq-trigger-${i}`} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', ...FONT_HEAD, fontWeight: 600, fontSize: 18, color: 'var(--ir-ink)' }}>
                    {f.q}
                    <Icon icon={open ? 'solar:minus-circle-linear' : 'solar:add-circle-linear'} size={22} style={{ color: 'var(--ir-green)', flexShrink: 0 }} aria-hidden="true" />
                  </button>
                  {/* Always rendered, hidden when closed. `{open && …}` removed the
                      answer from the page entirely, so crawlers saw one answer
                      of ten and aria-controls pointed at nothing. */}
                  <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-trigger-${i}`} hidden={!open} style={{ padding: '0 24px 22px', fontSize: 15.5, lineHeight: 1.7, color: 'var(--ir-bark)' }}>{f.a}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section id="start" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 100px' }}>
          <div data-reveal style={{ background: 'var(--ir-green)', borderRadius: 26, padding: 'clamp(40px,6vw,76px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Prairie at golden hour, decorative, behind a heavy scrim. The
                21:9 desktop frame is nearly a letterbox strip on a phone, so
                a square composition is served below 768px instead of cropping.
                Contrast over the brightest pixel is asserted in
                hero-imagery.test.ts — the CTA text is the whole point of the
                section and must never be the thing that degrades. */}
            <picture>
              <source media="(max-width: 767px)" type="image/avif" srcSet="/img/cta-prairie-mobile.avif" />
              <source media="(max-width: 767px)" type="image/webp" srcSet="/img/cta-prairie-mobile.webp" />
              <source media="(max-width: 767px)" srcSet="/img/cta-prairie-mobile.jpg" />
              <source type="image/avif" srcSet="/img/cta-prairie-desktop.avif" />
              <source type="image/webp" srcSet="/img/cta-prairie-desktop.webp" />
              <img
                src="/img/cta-prairie-desktop.jpg"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                width={1920}
                height={720}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
              />
            </picture>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(18,76,59,.86)' }} />
            <div style={{ position: 'absolute', top: -80, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.1)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: -100, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'rgba(36,25,16,.22)', filter: 'blur(80px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ ...FONT_HEAD, fontWeight: 500, fontSize: 'clamp(32px,4.5vw,54px)', lineHeight: 1.06, letterSpacing: '-.02em', color: 'var(--ir-blush)', margin: '0 auto', maxWidth: 680 }}>Start building your business today.</h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: '#FCE3D6', margin: '20px auto 0', maxWidth: 480 }}>Free to start. Your data stays in Canada, and stays yours.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 34 }}>
                <LinkTo to="/signup" onClick={() => trackSignupCta('footer_cta')} className="irv2-hov-lift" style={{ background: 'var(--ir-blush)', color: 'var(--ir-green)', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 32px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 24px rgba(36,25,16,.2)' }}>
                  Start free account <Icon icon="solar:arrow-right-linear" size={19} />
                </LinkTo>
                <LinkTo to="/contact" className="irv2-hov-soft" style={{ background: 'rgba(255,255,255,.18)', color: 'var(--ir-blush)', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '16px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,.6)' }}>
                  Talk to our team
                </LinkTo>
              </div>
            </div>
          </div>
        </section>

        </main>

        {/* ===== FOOTER (shared canonical component, used on every route) ===== */}
        <Footer />
      </div>
    </>
  );
};

export default LandingV2;
