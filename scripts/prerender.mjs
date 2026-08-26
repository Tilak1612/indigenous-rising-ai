// Build-time SEO prerender (dependency-free, no headless browser).
//
// Vite emits a single dist/index.html whose <title>/<meta>/canonical are the
// generic homepage values — so without this step every route's INITIAL HTML
// (what crawlers and social bots see before JS runs) carries the wrong title
// and a duplicate description. This script writes a per-route dist/<path>/
// index.html with the correct <title>, description, canonical, Open Graph /
// Twitter tags, and route JSON-LD (BlogPosting schema for blog posts).
//
// It is intentionally resilient: any failure is caught and logged, and the
// process still exits 0, so a prerender hiccup can never fail the Vercel build
// (worst case: fewer routes get prerendered, the SPA still works).

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BASE = 'https://www.indigenousrising.ai';
const OG_DEFAULT = `${BASE}/og-home.jpg`;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Static marketing routes (unique title + description per page) ───────────
const HOME_TITLE = 'Indigenous Rising AI — The AI platform for Indigenous business growth';
const HOME_DESC = 'Find funding, build your business plan, access training, and manage your growth — all in one place, designed around OCAP® principles and the data sovereignty of your community.';

const MARKETING = [
  { p: '/', t: HOME_TITLE, d: HOME_DESC },
  { p: '/auth', t: 'Sign in | Indigenous Rising AI', d: 'Sign in to your Indigenous Rising AI account.', robots: 'noindex, nofollow' },
  { p: '/pricing', t: 'Pricing — Free, Growth & Nations plans | Indigenous Rising AI', d: 'Honest, transparent pricing for Indigenous entrepreneurs. Start free; Growth is $49/mo. OCAP®-aligned, data stored in Canada, and you are never billed for a feature before it ships.' },
  { p: '/blog', t: 'Blog — Indigenous business funding & growth | Indigenous Rising AI', d: 'Guides on Indigenous business grants, funding applications, business planning, and growth across Canada — written for First Nations, Métis, and Inuit entrepreneurs.' },
  { p: '/guides/indigenous-business-grants', t: 'Indigenous Business Grants & Funding in Canada | Indigenous Rising AI', d: 'A hub of guides to Indigenous business grants, loans, and non-repayable funding across Canada — by province and by community (First Nations, Métis, Inuit), plus how to apply and get procurement-ready.', breadcrumb: 'Grants & funding', faqs: [
    { q: 'What Indigenous business grants are available in Canada?', a: 'Indigenous entrepreneurs can access a mix of federal and provincial programs, non-repayable contributions, and loans from Indigenous Financial Institutions. Availability depends on your province, community (First Nations, Métis, or Inuit), industry, and stage.' },
    { q: 'Do I need Indian status to get Indigenous business funding?', a: 'Not always. Many programs serve Status and Non-Status First Nations, Métis, and Inuit entrepreneurs, using community membership, Métis citizenship, or Inuit beneficiary status as proof of identity rather than Indian status specifically. Always check each program’s eligibility.' },
    { q: 'Are Indigenous business grants the same as loans?', a: 'No. Grants and non-repayable contributions do not have to be paid back (subject to using funds for the approved purpose and meeting reporting requirements), while loans do. Many entrepreneurs combine both.' },
    { q: 'How do I find the grants I am actually eligible for?', a: 'Start with the guide for your province and your community, then use Indigenous Rising AI’s funding matching to scan programs against your profile. A clear business plan makes every application stronger.' },
  ] },
  { p: '/contact', t: 'Contact us | Indigenous Rising AI', d: 'Get in touch with the Indigenous Rising AI team. We reply within one business day at help@indigenousrising.ai.' },
  { p: '/faq', t: 'Frequently asked questions | Indigenous Rising AI', d: 'Answers about funding matching, business planning, OCAP® data sovereignty, pricing, and what is live today versus coming soon on Indigenous Rising AI.' },
  { p: '/about', t: 'About Indigenous Rising AI', d: 'The AI platform for Indigenous business growth — funding, planning, training, and growth, built around your community’s data sovereignty.' },
  { p: '/mission', t: 'Our mission | Indigenous Rising AI', d: 'Why we build Indigenous Rising AI: practical, respectful tools for Indigenous entrepreneurs, designed around OCAP® principles and Canadian data residency.' },
  { p: '/success-stories', t: 'Success stories | Indigenous Rising AI', d: 'Stories from Indigenous entrepreneurs growing their businesses with funding, planning, and training support — shared with permission.' },
  { p: '/careers', t: 'Careers | Indigenous Rising AI', d: 'Join the team building the AI platform for Indigenous business growth. See open roles and how we work with communities.' },
  { p: '/training', t: 'AI training program | Indigenous Rising AI', d: 'Live training on AI, data sovereignty, and practical business skills for Indigenous communities — monthly sessions and a growing library.' },
  { p: '/community', t: 'Community forum | Indigenous Rising AI', d: 'Connect with other Indigenous entrepreneurs — ask questions, share wins, and find resources in the Indigenous Rising community.' },
  { p: '/compliance', t: 'Canadian Regulatory Alignment - Indigenous Rising AI', d: 'How Indigenous Rising AI is built in alignment with Canadian federal and provincial regulations — PIPEDA-aligned, CASL-aligned, AODA-aligned, and designed around OCAP® data sovereignty. Not third-party certifications.' },
  { p: '/privacy', t: 'Privacy Policy | Indigenous Rising AI', d: 'How Indigenous Rising AI collects, uses, and protects your information, with data stored in Canada and full export available at any time.' },
  { p: '/terms', t: 'Terms of Service | Indigenous Rising AI', d: 'The terms that govern your use of the Indigenous Rising AI platform.' },
  { p: '/accessibility', t: 'Accessibility statement | Indigenous Rising AI', d: 'Our commitment to an accessible platform for all Indigenous entrepreneurs, and how to reach us with accessibility feedback.' },
  { p: '/cookies', t: 'Cookie Policy | Indigenous Rising AI', d: 'How Indigenous Rising AI uses cookies and similar technologies, and the choices available to you.' },
  // These five render fine but were absent from MARKETING, so no per-route HTML
  // was written and Vercel's SPA rewrite served index.html — meaning all five
  // shipped the HOMEPAGE <title>. That is a WCAG 2.4.2 (Page Titled) failure —
  // a screen reader announces the same name on five different pages — and five
  // duplicate title tags for search engines.
  { p: '/funding', t: 'Find Indigenous business funding | Indigenous Rising AI', d: 'Browse real funding and financing programs for First Nations, Métis, and Inuit entrepreneurs across Canada — grants, non-repayable contributions, and loans from Indigenous Financial Institutions.' },
  { p: '/funding/alerts', t: 'Free weekly funding alerts | Indigenous Rising AI', d: 'Get a free weekly email of Indigenous business funding opportunities matched to your province and industry. CASL-compliant double opt-in; unsubscribe in one click.' },
  { p: '/impact', t: 'Measure your community impact | Indigenous Rising AI', d: 'Track and report the community impact of your Indigenous business — jobs, training, and local spend — in a form funders and your Nation recognise.' },
  { p: '/plan', t: 'Build your business plan with AI guidance | Indigenous Rising AI', d: 'Write a funder-ready business plan section by section, with prompts grounded in Indigenous business context. Free to start, no credit card.' },
  { p: '/track-request', t: 'Track a data request | Indigenous Rising AI', d: 'Check the status of a data access, export, correction, or deletion request — OCAP® Possession in practice.', robots: 'noindex, nofollow' },
  { p: '/data-rights', t: 'Your data rights | Indigenous Rising AI', d: 'Access, export, correct, or delete your data at any time — OCAP® Possession in practice. Submit and track a data request.' },
];

// ── Load blog posts via esbuild, stubbing asset imports + the @/ alias ──────
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
function truncateDesc(text, max = 160) {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s,.;:–—-]+$/, '') + '…';
}

function applyHead(html, { url, title, description, ogImage = OG_DEFAULT, jsonLd, robots }) {
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

async function writeRoute(template, route) {
  const dir = path.join(DIST, route.p.replace(/^\//, ''));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), applyHead(template, route));
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html not found — skipping');
    return;
  }
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
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
      if (m.breadcrumb) {
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
            { '@type': 'ListItem', position: 2, name: m.breadcrumb, item: url },
          ],
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
      await writeRoute(template, { p: m.p, url, title: m.t, description: m.d, robots: m.robots, ...(jsonLd.length ? { jsonLd } : {}) });
      count++;
      if (!/noindex/i.test(m.robots || '')) {
        sitemap.push({ loc: url, changefreq: m.p === '/' ? 'weekly' : 'monthly', priority: m.p === '/' ? '1.0' : '0.8' });
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
    const title = `${post.title} | Indigenous Rising AI`;
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
        publisher: { '@type': 'Organization', name: 'Indigenous Rising AI' },
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
      sitemap.push({ loc: url, ...(lastmod ? { lastmod } : {}), changefreq: 'monthly', priority: '0.7' });
    } catch (e) { console.warn('[prerender] blog route failed', post.slug, e.message); }
  }

  await writeSitemap(sitemap);

  console.log(`[prerender] wrote ${count} static route file(s) (${MARKETING.length} marketing + ${posts.length} blog).`);
}

/** Coerce any date-ish value to YYYY-MM-DD, or null if unparseable. */
function toISODate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
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
