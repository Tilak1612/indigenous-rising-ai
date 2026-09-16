// Build-time SEO prerender (dependency-free, no headless browser).
//
// Vite emits a single dist/index.html whose <title>/<meta>/canonical are the
// generic homepage values — so without this step every route's INITIAL HTML
// (what crawlers and social bots see before JS runs) carries the wrong title
// and a duplicate description. This script writes a per-route dist/<path>/
// index.html with the correct <title>, description, canonical, Open Graph /
// Twitter tags, and route JSON-LD (BlogPosting schema for blog posts).
//
// It also renders each route's real markup into #root via the SSR bundle in
// dist-ssr (see src/entry-server.tsx). Before that, the shipped HTML carried an
// empty <div id="root"> and a crawler saw ~336 words of nav/JSON-LD boilerplate
// on every route.
//
// Head-only failures stay non-fatal (worst case: fewer routes prerendered, the
// SPA still works), but an SSR failure sets a non-zero exit code — shipping an
// empty body while claiming the page is prerendered is the exact regression
// this exists to prevent.

import { buildLlmsTxt } from './llms-txt.mjs';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BASE = 'https://www.indigenousrising.ai';
const OG_DEFAULT = `${BASE}/og-home.jpg`;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Static marketing routes (unique title + description per page) ───────────
const HOME_TITLE = 'Indigenous Business Funding Platform | Indigenous Rising AI';
const HOME_DESC = 'Find funding, build your business plan and access training — all in one place, designed around OCAP® principles and the data sovereignty of your community.';

// /about, /mission and /partnerships are NOT listed here. They 301 to / at the
// edge (vercel.json). Prerendering a redirect target produced an indexed URL
// that returned 200 with an empty body while browsers were bounced home.
// Routes whose page component renders <Breadcrumbs /> with no customItems.
// /guides and /demo instead carry an explicit `breadcrumb` label below.
const BREADCRUMB_ROUTES = new Set([
  '/funding/alerts', '/contact', '/privacy', '/success-stories', '/cookies', '/training', '/faq', '/careers',
]);

const MARKETING = [
  { p: '/', t: HOME_TITLE, d: HOME_DESC, software: true },
  { p: '/auth', t: 'Sign in | Indigenous Rising AI', d: 'Sign in to your Indigenous Rising AI account.', robots: 'noindex, nofollow' },
  // /signup was NOT prerendered, so Vercel's SPA fallback served index.html —
  // the HOMEPAGE markup, with the homepage title — until React hydrated and
  // routed. Every "Start free account" click landed on the wrong page's HTML
  // first, on the exact route P0-0 made the primary CTA target. Verified on
  // production: /signup returned 97,980 bytes titled "Indigenous Rising AI —
  // The AI platform for Indigenous business growth". noindex like /auth: this
  // is a conversion surface, not a search landing page.
  { p: '/signup', t: 'Create your account | Indigenous Rising AI', d: 'Create a free Indigenous Rising AI account. Three funding matches a month, a guided business plan, and no credit card required.', robots: 'noindex, nofollow' },
  { p: '/pricing', img: '/og-pricing.jpg', t: 'Pricing: Free, Growth & Nations Plans | Indigenous Rising AI', d: 'Transparent pricing for Indigenous entrepreneurs. Start free, no credit card. Growth is $49/mo. OCAP®-aligned, with your data stored in Canada.' },
  { p: '/blog', t: 'Indigenous Business Funding Blog | Indigenous Rising AI', d: 'Guides on Indigenous business grants, funding applications and business planning for First Nations, Métis and Inuit entrepreneurs across Canada.' },
  { p: '/guides/indigenous-business-grants', t: 'Indigenous Business Grants & Funding in Canada', d: 'Indigenous business grants, loans and non-repayable funding across Canada, by province and by community, plus how to apply and get procurement-ready.', breadcrumb: 'Grants & funding' },
  { p: '/demo', t: 'Book a demo | Indigenous Rising AI', d: 'Book a 30-minute walkthrough of Indigenous Rising AI — funding matching, the business plan assistant, and the controls that decide who sees your data.', breadcrumb: 'Book a demo' },
  { p: '/contact', img: '/og-contact.jpg', t: 'Contact us | Indigenous Rising AI', d: 'Get in touch with the Indigenous Rising AI team. We reply within one business day at help@indigenousrising.ai.' },
  { p: '/faq', t: 'Frequently asked questions | Indigenous Rising AI', d: 'Answers about funding matching, business planning, OCAP® data sovereignty, pricing, and what is live today versus coming soon on Indigenous Rising AI.' },
  { p: '/success-stories', t: 'Success stories | Indigenous Rising AI', d: 'Illustrative examples of the kinds of Indigenous businesses the platform is built to support. Named stories will be added only with each entrepreneur’s consent.' },
  { p: '/careers', t: 'Careers | Indigenous Rising AI', d: 'Join the team building the AI platform for Indigenous business growth. See open roles and how we work with communities.' },
  { p: '/training', t: 'AI training program | Indigenous Rising AI', d: 'Live training on AI, data sovereignty, and practical business skills for Indigenous communities — monthly sessions and a growing library.' },
  { p: '/community', t: 'Community forum | Indigenous Rising AI', d: 'Connect with other Indigenous entrepreneurs — ask questions, share wins, and find resources in the Indigenous Rising community.' },
  { p: '/compliance', img: '/og-compliance.jpg', t: 'Canadian Regulatory Alignment - Indigenous Rising AI', d: 'How Indigenous Rising AI aligns with Canadian regulation — PIPEDA, CASL, AODA — and is built around OCAP® data sovereignty. Not a third-party certification.' },
  { p: '/privacy', img: '/og-privacy.jpg', t: 'Privacy Policy | Indigenous Rising AI', d: 'How Indigenous Rising AI collects, uses, and protects your information, with data stored in Canada and full export available at any time.' },
  { p: '/terms', img: '/og-terms.jpg', t: 'Terms of Service | Indigenous Rising AI', d: 'Legal terms for using Indigenous Rising AI: user responsibilities, intellectual property, liability, termination, and Canadian governing law.' },
  { p: '/accessibility', t: 'Accessibility statement | Indigenous Rising AI', d: 'Our commitment to an accessible platform for all Indigenous entrepreneurs, and how to reach us with accessibility feedback.' },
  { p: '/cookies', t: 'Cookie Policy | Indigenous Rising AI', d: 'How Indigenous Rising AI uses cookies and similar technologies, and the choices available to you.' },
  // These five render fine but were absent from MARKETING, so no per-route HTML
  // was written and Vercel's SPA rewrite served index.html — meaning all five
  // shipped the HOMEPAGE <title>. That is a WCAG 2.4.2 (Page Titled) failure —
  // a screen reader announces the same name on five different pages — and five
  // duplicate title tags for search engines.
  { p: '/funding', t: 'Find Indigenous business funding | Indigenous Rising AI', d: 'Browse real funding and financing for Indigenous entrepreneurs across Canada: grants, non-repayable contributions and loans from Indigenous institutions.' },
  { p: '/funding/alerts', t: 'Free weekly funding alerts | Indigenous Rising AI', d: 'A free weekly email of Indigenous business funding matched to your province and industry. CASL double opt-in, and one-click unsubscribe.' },
  { p: '/impact', t: 'Measure your community impact | Indigenous Rising AI', d: 'Coming soon: a community impact tracker for Indigenous businesses — jobs, youth programs and local spend, in a form funders recognise.' },
  { p: '/plan', t: 'Indigenous Business Plan Builder | Indigenous Rising AI', d: 'Write a funder-ready business plan section by section, with prompts grounded in Indigenous business context. Free to start, no credit card.' },
  { p: '/track-request', t: 'Track a data request | Indigenous Rising AI', d: 'Check the status of a data access, export, correction, or deletion request — OCAP® Possession in practice.', robots: 'noindex, nofollow' },
  { p: '/data-rights', img: '/og-data-rights.jpg', t: 'Your data rights | Indigenous Rising AI', d: 'Access, export, correct, or delete your data at any time — OCAP® Possession in practice. Submit and track a data request.' },
];

// ── Breadcrumbs ────────────────────────────────────────────────────────────
// Mirrors src/components/Breadcrumbs.tsx (routeNames + NON_ROUTE_SEGMENTS +
// trail building) so the static BreadcrumbList matches the trail a visitor
// sees. The component no longer emits its own JSON-LD — it did, which put two
// BreadcrumbLists in the rendered DOM on every page that also had a
// prerendered one. Guarded by src/__tests__/seo-breadcrumbs.test.ts, which
// fails if the two maps drift.
const NON_ROUTE_SEGMENTS = new Set(['/guides', '/features']);
const ROUTE_NAMES = {
  '/': 'Home',
  '/guides': 'Guides',
  '/features': 'Features',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/cookies': 'Cookie Policy',
  '/accessibility': 'Accessibility',
  '/compliance': 'Canadian Compliance',
  '/data-rights': 'Data Rights',
  '/contact': 'Contact',
  '/training': 'Training Programs',
  '/auth': 'Sign In',
  '/admin': 'Admin Dashboard',
  '/track-request': 'Track Request',
  '/unsubscribe': 'Unsubscribe',
  '/faq': 'FAQ',
  '/success-stories': 'Success Stories',
};

/** The visible trail for a path, as the component builds it. */
function breadcrumbTrail(p) {
  const items = [{ name: 'Home', path: '/' }];
  let current = '';
  for (const segment of p.split('/').filter(Boolean)) {
    current += `/${segment}`;
    const name = ROUTE_NAMES[current] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    items.push({ name, path: current, navigable: !NON_ROUTE_SEGMENTS.has(current) });
  }
  return items;
}

function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      // A namespace segment (/guides) has no page behind it: omitting `item`
      // is valid and avoids publishing a URL that 404s.
      ...(item.navigable === false ? {} : { item: `${BASE}${item.path === '/' ? '/' : item.path}` }),
    })),
  };
}

// Mirrors pageTitle() in src/data/blogSeoTitles.ts — the site name is appended
// only when the whole title still fits in ~60 characters.
const SITE_SUFFIX = ' | Indigenous Rising AI';
function pageTitle(title) {
  const t = String(title || '').trim();
  return (t + SITE_SUFFIX).length <= 60 ? t + SITE_SUFFIX : t;
}

// ── Load blog posts via esbuild, stubbing asset imports + the @/ alias ──────
/** Load a TS data module through esbuild (same trick as loadBlogPosts). */
async function loadDataModule(relPath, exportName) {
  try {
    const result = await build({
      entryPoints: [path.join(ROOT, relPath)],
      bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
      plugins: [{
        name: 'alias-only',
        setup(b) { b.onResolve({ filter: /^@\// }, (a) => ({ path: path.join(ROOT, 'src', a.path.slice(2)) })); },
      }],
    });
    const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
    return mod[exportName] ?? null;
  } catch (e) {
    console.warn(`[prerender] could not load ${relPath}:`, e.message);
    return null;
  }
}

async function loadBlogPosts() {
  try {
    const result = await build({
      entryPoints: [path.join(ROOT, 'src/data/blogPosts.ts')],
      bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
      plugins: [{
        name: 'stub-assets',
        setup(b) {
          // Asset imports -> empty string default export
          b.onResolve({ filter: /\.(jpg|jpeg|png|svg|webp|gif|avif)$/ }, (a) => ({ path: a.path, namespace: 'stub' }));
          b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default ""', loader: 'js' }));
          // Resolve the "@/..." alias to /src/...
          b.onResolve({ filter: /^@\// }, (a) => ({ path: path.join(ROOT, 'src', a.path.slice(2)) }));
        },
      }],
    });
    const code = result.outputFiles[0].text;
    const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    const posts = (mod.getAllPosts?.() ?? mod.blogPosts ?? []);
    return Array.isArray(posts) ? posts : [];
  } catch (e) {
    console.warn('[prerender] could not load blog posts:', e.message);
    return [];
  }
}

// Trim a meta description to a SERP-safe length on a word boundary (mirrors
// src/lib/seo.ts so the static HTML and the client-rendered tags agree).
// Never emit a fragment. The old version cut at a word boundary and appended
// an ellipsis, which produced 57 descriptions ending mid-phrase — "…you are
// never billed for a…" — forfeiting control of the search snippet on every one.
// Prefer the last COMPLETE sentence inside the limit; fall back to the last
// clause and close it with a period rather than trailing off.
function truncateDesc(text, max = 160) {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max);

  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > max * 0.5) return cut.slice(0, lastStop + 1).trim();

  const lastClause = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf(' — '));
  const base = lastClause > max * 0.5 ? cut.slice(0, lastClause) : cut.slice(0, cut.lastIndexOf(' '));
  return base.replace(/[\s,;:–—-]+$/, '') + '.';
}

function applyHead(html, { url, title, description, ogImage = OG_DEFAULT, jsonLd, robots, noCanonical = false }) {
  let out = html;
  const T = esc(title), D = esc(truncateDesc(description)), U = esc(url), I = esc(ogImage);
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${T}</title>`);
  if (robots) {
    out = out.replace(/(<meta\s+name="robots"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${esc(robots)}$2`);
  }
  out = out.replace(/(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${D}$2`);
  out = out.replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${T}$2`);
  out = out.replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${D}$2`);
  out = out.replace(/(<meta\s+property="og:url"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${U}$2`);
  out = out.replace(/(<meta\s+property="og:image"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${I}$2`);
  out = out.replace(/(<meta\s+name="twitter:title"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${T}$2`);
  out = out.replace(/(<meta\s+name="twitter:description"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${D}$2`);
  out = out.replace(/(<meta\s+name="twitter:image"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${I}$2`);
  if (noCanonical) {
    if (jsonLd) out = out.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`);
    return out;
  }
  // No data-rh anywhere. react-helmet-async only replaces tags carrying that
  // attribute — and it DELETES marked tags a page does not re-emit. Measured
  // on a preview: marking canonical left /pricing with none at all, and
  // marking og:title emptied it on /pricing and /community. The page
  // components for prerendered routes no longer emit description, canonical,
  // robots or og/twitter at all, so these static tags are the only copy and
  // must survive hydration untouched.
  // Canonical: replace if present, else inject before </head>
  const inject = [`<link rel="canonical" href="${U}" />`];
  if (jsonLd) inject.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  if (/<link\s+rel="canonical"/i.test(out)) {
    out = out.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${U}" />`);
    if (jsonLd) out = out.replace('</head>', `  ${inject[1]}\n  </head>`);
  } else {
    out = out.replace('</head>', `  ${inject.join('\n  ')}\n  </head>`);
  }
  return out;
}

// Loaded lazily so prerendering still degrades to head-only if the SSR bundle
// is missing, rather than failing the whole build.
let ssrRender = null;
async function getSsrRender() {
  if (ssrRender !== null) return ssrRender;
  try {
    const mod = await import(pathToFileURL(path.join(ROOT, 'dist-ssr', 'entry-server.js')).href);
    ssrRender = mod.render;
  } catch (err) {
    console.warn('[prerender] SSR bundle unavailable — head-only output:', err.message);
    ssrRender = false;
  }
  return ssrRender;
}

async function writeRoute(template, route) {
  const dir = path.join(DIST, route.p.replace(/^\//, ''));
  const outFile = route.file ? path.join(DIST, route.file) : path.join(dir, 'index.html');
  if (!route.file) await mkdir(dir, { recursive: true });
  let html = applyHead(template, route);

  // Render the route's real markup into #root. Without this the shipped HTML
  // carried <div id="root"></div> and a crawler saw ~336 words of nav/JSON-LD
  // boilerplate on EVERY route — distinct titles over identical empty bodies.
  const render = await getSsrRender();
  if (render) {
    try {
      const { html: body } = await render(route.p);
      html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    } catch (err) {
      // Loud, and non-fatal: a broken route must not silently ship empty.
      console.error(`[prerender] SSR FAILED for ${route.p}: ${err.message}`);
      process.exitCode = 1;
    }
  }
  await writeFile(outFile, html);
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found — skipping');
    return;
  }
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

  // FAQPage for the grants hub comes from the same module the page renders,
  // so the markup and the visible Q&A cannot drift apart.
  // Titles come from the same module the page components import, so the
  // static <title> and the one Helmet sets after hydration cannot drift.
  // They had, on 12 of 23 routes.
  const routeTitles = await loadDataModule('src/data/routeTitles.ts', 'ROUTE_TITLES');
  if (routeTitles) {
    for (const m of MARKETING) {
      const t = routeTitles[m.p];
      if (t) m.t = t;
      else console.warn(`[prerender] no shared title for ${m.p} — using the local one`);
    }
  } else {
    console.warn('[prerender] shared route titles unavailable — using local titles');
  }

  const hubFaqs = await loadDataModule('src/data/grantsHubFaqs.ts', 'grantsHubFaqs');
  // Entity facts for the homepage SoftwareApplication node (see entityFacts.ts).
  const liveFeatureList = await loadDataModule('src/data/entityFacts.ts', 'liveFeatureList');
  const productAudience = await loadDataModule('src/data/entityFacts.ts', 'PRODUCT_AUDIENCE');
  const entityFacts = {
    features: typeof liveFeatureList === 'function' ? liveFeatureList() : [],
    audience: productAudience,
  };
  if (Array.isArray(hubFaqs) && hubFaqs.length) {
    const hub = MARKETING.find((m) => m.p === '/guides/indigenous-business-grants');
    if (hub) hub.faqs = hubFaqs.map((f) => ({ q: f.question, a: f.answer }));
  } else {
    console.warn('[prerender] grants-hub FAQs unavailable — page ships without FAQPage');
  }
  let count = 0;
  // Collected live and indexable URLs — written to dist/sitemap.xml at the end so
  // the sitemap is generated from the SAME source as the prerendered pages and can
  // never drift (no more dead slugs listed / real posts omitted).
  const sitemap = [];

  for (const m of MARKETING) {
    try {
      const url = m.p === '/' ? `${BASE}/` : `${BASE}${m.p}`;
      // Optional structured data for content hubs (mirrors the client-rendered
      // Helmet tags so non-JS crawlers / AI extractors see it in the raw HTML).
      const jsonLd = [];
      // Pages that render <Breadcrumbs /> (or pass customItems) — the visible
      // trail and this markup are generated from the same rules.
      if (m.breadcrumb) {
        jsonLd.push(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: m.breadcrumb, path: m.p }]));
      } else if (BREADCRUMB_ROUTES.has(m.p)) {
        jsonLd.push(breadcrumbJsonLd(breadcrumbTrail(m.p)));
      }
      if (m.software) {
        // Homepage only. Offers mirror the live pricing page: Free ($0) and
        // Growth ($49/mo) are the purchasable fixed-price plans; Nations is
        // custom-quoted, so it is not advertised as a price.
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          '@id': `${BASE}/#software`,
          name: 'Indigenous Rising AI',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: `${BASE}/`,
          description: 'Funding matching, business planning and training tools for First Nations, Inuit and Métis entrepreneurs in Canada, designed around OCAP® principles with data stored in Canada.',
          // Derived from plans.ts: only rows marked available on the
          // self-serve plans, so nothing "coming soon" is declared a feature.
          ...(entityFacts.features.length ? { featureList: entityFacts.features } : {}),
          ...(entityFacts.audience ? { audience: { '@type': 'BusinessAudience', audienceType: entityFacts.audience } } : {}),
          isAccessibleForFree: true,
          // Free $0, Growth $49 and Professional $149 all have live Stripe
          // prices (see STRIPE_PRICES + docs/STRIPE_GO_LIVE.md). Nations is
          // custom-quoted, so it is not advertised as a price.
          offers: { '@type': 'AggregateOffer', priceCurrency: 'CAD', lowPrice: '0', highPrice: '149', offerCount: 3 },
          provider: { '@id': `${BASE}/#organization` },
        });
      }
      if (!/noindex/i.test(m.robots || '')) {
        // WebPage node written from the SAME title and description as this
        // route's meta tags. It used to be injected client-side by MetaTags
        // with a different, per-component description — and, where a page
        // passed none, a default claiming the platform harmonized traditional
        // knowledge. One owner now, visible without JavaScript.
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: m.t,
          // truncateDesc: the same clipping the meta description gets.
          description: truncateDesc(m.d),
          isPartOf: { '@id': `${BASE}/#website` },
          about: { '@id': `${BASE}/#organization` },
          inLanguage: 'en-CA',
        });
      }
      if (Array.isArray(m.faqs) && m.faqs.length) {
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: m.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        });
      }
      await writeRoute(template, {
        p: m.p, url, title: m.t, description: m.d, robots: m.robots,
        // Per-route social image. applyHead OVERWRITES og:image on every
        // route, so without this the page component's own <meta og:image>
        // is discarded at build time and every marketing page shipped
        // og-home.jpg — including the five pages that already had bespoke
        // images sitting in public/ and correctly referenced in their
        // components. Blog posts already did this (see ogForPost below);
        // marketing routes simply had no field for it.
        ...(m.img ? { ogImage: `${BASE}${m.img}` } : {}),
        ...(jsonLd.length ? { jsonLd } : {}),
      });
      count++;
      if (!/noindex/i.test(m.robots || '')) {
        sitemap.push({ loc: url, title: m.t, description: m.d, changefreq: m.p === '/' ? 'weekly' : 'monthly', priority: m.p === '/' ? '1.0' : '0.8' });
      }
    } catch (e) { console.warn('[prerender] route failed', m.p, e.message); }
  }

  // Resolve each post's unique hero image (bundled as dist/assets/post-<id>-*.jpg)
  // so the STATIC HTML uses a per-article OG image instead of the generic
  // og-home.jpg — social scrapers read the static HTML, not client-rendered tags.
  const assetFiles = await readdir(path.join(DIST, 'assets')).catch(() => []);
  const ogForPost = (id) => {
    if (id == null) return OG_DEFAULT;
    const f = assetFiles.find((n) => n.startsWith(`post-${id}-`) && /\.(jpe?g|png|webp)$/i.test(n));
    return f ? `${BASE}/assets/${f}` : OG_DEFAULT;
  };

  const posts = await loadBlogPosts();
  for (const post of posts) {
    if (!post?.slug) continue;
    const url = `${BASE}/blog/${post.slug}`;
    const title = pageTitle(post.seoTitle || post.title);
    const description = post.summary || post.excerpt || '';
    const ogImage = ogForPost(post.id);
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description,
        image: ogImage,
        url,
        datePublished: post.publishedAt || post.date,
        dateModified: post.updatedAt || post.publishedAt || post.date,
        author: { '@type': 'Organization', name: post.author?.name || 'Indigenous Rising AI' },
        publisher: {
          '@type': 'Organization',
          '@id': `${BASE}/#organization`,
          name: 'Indigenous Rising AI',
          logo: { '@type': 'ImageObject', url: `${BASE}/logo-icon.png`, width: 512, height: 512 },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
      ...(Array.isArray(post.faqs) && post.faqs.length
        ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }]
        : []),
    ];
    try {
      await writeRoute(template, { p: `/blog/${post.slug}`, url, title, description, ogImage, jsonLd });
      count++;
      const lastmod = toISODate(post.updatedAt || post.publishedAt || post.date);
      sitemap.push({ loc: url, title, description, ...(lastmod ? { lastmod } : {}), changefreq: 'monthly', priority: '0.7' });
    } catch (e) { console.warn('[prerender] blog route failed', post.slug, e.message); }
  }

  // Real 404 page. vercel.json no longer rewrites every path to index.html, so
  // unknown URLs fall through to dist/404.html and return HTTP 404. Before,
  // every URL — /this-page-does-not-exist, /blog/not-a-real-post — returned
  // 200 with the homepage HTML: a soft 404 on every mistyped or stale link.
  // It is the full SPA shell, so if a legitimate client-only route were ever
  // missed from the rewrites it would still render correctly for users (React
  // Router reads the URL); only the status code would be wrong.
  try {
    await writeRoute(template, {
      p: '/__prerender-404__', file: '404.html', url: `${BASE}/404`,
      title: 'Page not found | Indigenous Rising AI',
      description: 'The page you are looking for does not exist. Find Indigenous business funding guides, pricing, and support from the Indigenous Rising AI homepage.',
      robots: 'noindex, follow', noCanonical: true,
    });
    count++;
  } catch (e) { console.warn('[prerender] 404 page failed:', e.message); }

  await writeSitemap(sitemap);
  await writeLlmsTxt(sitemap);

  console.log(`[prerender] wrote ${count} static route file(s) (${MARKETING.length} marketing + ${posts.length} blog).`);
}

/** Coerce any date-ish value to YYYY-MM-DD, or null if unparseable. */
function toISODate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Write dist/llms.txt from the indexable URL list plus plan and entity facts. */
async function writeLlmsTxt(entries) {
  try {
    const [plans, planFeatures, liveFeatureList, definition, audience] = await Promise.all([
      loadDataModule('src/data/plans.ts', 'PLANS'),
      loadDataModule('src/data/plans.ts', 'PLAN_FEATURES'),
      loadDataModule('src/data/entityFacts.ts', 'liveFeatureList'),
      loadDataModule('src/data/entityFacts.ts', 'PRODUCT_DEFINITION'),
      loadDataModule('src/data/entityFacts.ts', 'PRODUCT_AUDIENCE'),
    ]);
    if (!plans || !planFeatures || typeof liveFeatureList !== 'function' || !definition) {
      console.warn('[prerender] llms.txt skipped: a data module failed to load');
      return;
    }
    const planned = Object.values(planFeatures).flat().filter((f) => !f.available).map((f) => f.text);
    const text = buildLlmsTxt({
      base: BASE, definition, audience, plans,
      available: liveFeatureList(), planned, pages: entries,
    });
    await writeFile(path.join(DIST, 'llms.txt'), text, 'utf8');
    console.log(`[prerender] wrote dist/llms.txt (${entries.length} URLs)`);
  } catch (e) {
    console.warn('[prerender] llms.txt write failed:', e.message);
  }
}

/** Write dist/sitemap.xml from the live, indexable URL list. */
async function writeSitemap(entries) {
  try {
    const body = entries.map((e) =>
      '  <url>\n' +
      `    <loc>${esc(e.loc)}</loc>\n` +
      (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : '') +
      `    <changefreq>${e.changefreq}</changefreq>\n` +
      `    <priority>${e.priority}</priority>\n` +
      '  </url>'
    ).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
    await writeFile(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
    console.log(`[prerender] wrote dist/sitemap.xml (${entries.length} URLs)`);
  } catch (e) {
    console.warn('[prerender] sitemap write failed:', e.message);
  }
}

main().catch((e) => {
  console.warn('[prerender] non-fatal error:', e?.message || e);
  process.exit(0); // never fail the build
});
