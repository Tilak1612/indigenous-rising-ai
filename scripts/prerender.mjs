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

import { readFile, writeFile, mkdir } from 'node:fs/promises';
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
const MARKETING = [
  { p: '/pricing', t: 'Pricing — Free, Growth & Nations plans | Indigenous Rising AI', d: 'Honest, transparent pricing for Indigenous entrepreneurs. Start free; Growth is $49/mo. OCAP®-aligned, data stored in Canada, and you are never billed for a feature before it ships.' },
  { p: '/blog', t: 'Blog — Indigenous business funding & growth | Indigenous Rising AI', d: 'Guides on Indigenous business grants, funding applications, business planning, and growth across Canada — written for First Nations, Métis, and Inuit entrepreneurs.' },
  { p: '/contact', t: 'Contact us | Indigenous Rising AI', d: 'Get in touch with the Indigenous Rising AI team. We reply within one business day at help@indigenousrising.ai.' },
  { p: '/faq', t: 'Frequently asked questions | Indigenous Rising AI', d: 'Answers about funding matching, business planning, OCAP® data sovereignty, pricing, and what is live today versus coming soon on Indigenous Rising AI.' },
  { p: '/about', t: 'About Indigenous Rising AI', d: 'The AI platform for Indigenous business growth — funding, planning, training, and growth, built around your community’s data sovereignty.' },
  { p: '/mission', t: 'Our mission | Indigenous Rising AI', d: 'Why we build Indigenous Rising AI: practical, respectful tools for Indigenous entrepreneurs, designed around OCAP® principles and Canadian data residency.' },
  { p: '/success-stories', t: 'Success stories | Indigenous Rising AI', d: 'Stories from Indigenous entrepreneurs growing their businesses with funding, planning, and training support — shared with permission.' },
  { p: '/careers', t: 'Careers | Indigenous Rising AI', d: 'Join the team building the AI platform for Indigenous business growth. See open roles and how we work with communities.' },
  { p: '/training', t: 'AI training program | Indigenous Rising AI', d: 'Live training on AI, data sovereignty, and practical business skills for Indigenous communities — monthly sessions and a growing library.' },
  { p: '/community', t: 'Community forum | Indigenous Rising AI', d: 'Connect with other Indigenous entrepreneurs — ask questions, share wins, and find resources in the Indigenous Rising community.' },
  { p: '/compliance', t: 'Trust, security & OCAP® compliance | Indigenous Rising AI', d: 'How we handle your data: OCAP®-aligned practices, PIPEDA alignment, Canadian data residency, and your right to access and export everything, anytime.' },
  { p: '/privacy', t: 'Privacy Policy | Indigenous Rising AI', d: 'How Indigenous Rising AI collects, uses, and protects your information, with data stored in Canada and full export available at any time.' },
  { p: '/terms', t: 'Terms of Service | Indigenous Rising AI', d: 'The terms that govern your use of the Indigenous Rising AI platform.' },
  { p: '/accessibility', t: 'Accessibility statement | Indigenous Rising AI', d: 'Our commitment to an accessible platform for all Indigenous entrepreneurs, and how to reach us with accessibility feedback.' },
  { p: '/cookies', t: 'Cookie Policy | Indigenous Rising AI', d: 'How Indigenous Rising AI uses cookies and similar technologies, and the choices available to you.' },
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

function applyHead(html, { url, title, description, ogImage = OG_DEFAULT, jsonLd }) {
  let out = html;
  const T = esc(title), D = esc(description), U = esc(url), I = esc(ogImage);
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${T}</title>`);
  out = out.replace(/(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${D}$2`);
  out = out.replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${T}$2`);
  out = out.replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${D}$2`);
  out = out.replace(/(<meta\s+property="og:url"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${U}$2`);
  out = out.replace(/(<meta\s+property="og:image"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${I}$2`);
  out = out.replace(/(<meta\s+name="twitter:title"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${T}$2`);
  out = out.replace(/(<meta\s+name="twitter:description"\s+content=")[\s\S]*?("\s*\/?>)/i, `$1${D}$2`);
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

  for (const m of MARKETING) {
    try {
      await writeRoute(template, { p: m.p, url: `${BASE}${m.p}`, title: m.t, description: m.d });
      count++;
    } catch (e) { console.warn('[prerender] route failed', m.p, e.message); }
  }

  const posts = await loadBlogPosts();
  for (const post of posts) {
    if (!post?.slug) continue;
    const url = `${BASE}/blog/${post.slug}`;
    const title = `${post.title} | Indigenous Rising AI`;
    const description = post.summary || post.excerpt || '';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      url,
      datePublished: post.publishedAt || post.date,
      dateModified: post.updatedAt || post.publishedAt || post.date,
      author: { '@type': 'Organization', name: post.author?.name || 'Indigenous Rising AI' },
      publisher: { '@type': 'Organization', name: 'Indigenous Rising AI' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };
    try {
      await writeRoute(template, { p: `/blog/${post.slug}`, url, title, description, jsonLd });
      count++;
    } catch (e) { console.warn('[prerender] blog route failed', post.slug, e.message); }
  }

  console.log(`[prerender] wrote ${count} static route file(s) (${MARKETING.length} marketing + ${posts.length} blog).`);
}

main().catch((e) => {
  console.warn('[prerender] non-fatal error:', e?.message || e);
  process.exit(0); // never fail the build
});
