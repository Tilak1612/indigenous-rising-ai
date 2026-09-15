import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { blogSeoTitles, pageTitle } from '@/data/blogSeoTitles';
import { getAllPosts } from '@/data/blogPosts';

const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const read = (p: string) => readFileSync(p, 'utf8');

describe('search-result titles fit', () => {
  const posts = getAllPosts();

  test('every post has a short title and it is merged onto the post', () => {
    const missing = posts.filter((p) => !p.seoTitle).map((p) => p.slug);
    expect(missing, `posts with no seoTitle: ${missing.join(', ')}`).toEqual([]);
    expect(Object.keys(blogSeoTitles).length).toBe(posts.length);
  });

  test('no rendered title exceeds 60 characters', () => {
    // 49 of 51 post titles were over 60 on their own before the suffix.
    const tooLong = posts
      .map((p) => pageTitle(p.seoTitle ?? p.title))
      .filter((t) => t.length > 60);
    expect(tooLong, `titles over 60: ${tooLong.join(' | ')}`).toEqual([]);
  });

  test('short titles are unique, so no two results look the same', () => {
    const values = Object.values(blogSeoTitles);
    expect(new Set(values).size).toBe(values.length);
  });

  test('every seoTitle key matches a real post slug', () => {
    const slugs = new Set(posts.map((p) => p.slug));
    const orphans = Object.keys(blogSeoTitles).filter((s) => !slugs.has(s));
    expect(orphans, `seoTitle keys with no post: ${orphans.join(', ')}`).toEqual([]);
  });

  test('the prerender mirrors pageTitle instead of hardcoding the suffix', () => {
    expect(prerender).toMatch(/const title = pageTitle\(post\.seoTitle \|\| post\.title\)/);
    expect(prerender).toMatch(/\(t \+ SITE_SUFFIX\)\.length <= 60/);
  });

  test('marketing titles in the prerender fit too', () => {
    const titles = [...prerender.matchAll(/\bt: '((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
    expect(titles.length).toBeGreaterThan(15);
    const tooLong = titles.filter((t) => t.length > 60);
    expect(tooLong, `over 60: ${tooLong.join(' | ')}`).toEqual([]);
  });
});

describe('the prerender is the only source of search and social head tags', () => {
  test('nothing is marked data-rh', () => {
    // react-helmet-async DELETES tags carrying data-rh that the current page
    // does not re-emit. Measured on a preview: marking canonical left
    // /pricing with none at all; marking og:title emptied it on /pricing and
    // /community. The static tags are now the only copy, so they must not be
    // marked at all.
    // Checks emitted markup, not the comment that explains why.
    expect(prerender).not.toMatch(/data-rh="true"/);
  });

  test('prerendered pages do not emit description, canonical, robots or og/twitter', () => {
    const files = ['src/components/MetaTags.tsx', 'src/pages/Pricing.tsx', 'src/pages/Blog.tsx',
      'src/pages/BlogPost.tsx', 'src/pages/TermsOfService.tsx', 'src/pages/DataRights.tsx',
      'src/pages/CanadianCompliance.tsx', 'src/pages/AccessibilityStatement.tsx', 'src/pages/Community.tsx'];
    for (const f of files) {
      const src = read(f);
      expect(src, `${f} emits its own description`).not.toMatch(/<meta\s+name="description"/);
      expect(src, `${f} emits its own canonical`).not.toMatch(/rel="canonical"/);
      expect(src, `${f} emits og tags`).not.toMatch(/property="og:(?:title|description|url|image)"/);
      // noindex is the one robots value a page may still set for itself.
      const robots = src.match(/<meta\s+name="robots"[^>]*>/g) ?? [];
      for (const tag of robots) expect(tag, `${f} sets an index robots value`).toMatch(/noindex/);
    }
  });

  test('the prerender writes them for every marketing route', () => {
    expect(prerender).toMatch(/name="description"/);
    expect(prerender).toMatch(/<link rel="canonical" href="\$\{U\}" \/>/);
    expect(prerender).toMatch(/property="og:title"/);
    expect(prerender).toMatch(/name="twitter:title"/);
  });
});

describe('FAQ answers are in the page', () => {
  test('the shared FAQ section does not use the accordion that unmounts them', () => {
    const faq = read('src/components/FAQSection.tsx');
    // Radix renders `children: isOpen && children`, so all 15 answers were
    // absent from the HTML and from the rendered DOM.
    expect(faq).not.toMatch(/AccordionContent/);
    expect(faq).toMatch(/hidden=\{!open\}/);
    expect(faq).toMatch(/aria-expanded=\{open\}/);
  });

  test('the homepage FAQ renders every answer, not just the open one', () => {
    const landing = read('src/pages/LandingV2.tsx');
    expect(landing).not.toMatch(/\{open && <div id=\{`faq-panel/);
    expect(landing).toMatch(/hidden=\{!open\} style/);
  });
});

describe('structured data claims nothing false', () => {
  const sd = read('src/components/StructuredData.tsx');
  const index = read('index.html');

  test('no invented dates', () => {
    // datePublished defaulted to 2025-01-01 and dateModified to the visitor's
    // current date — telling Google every page changed on every crawl.
    expect(sd).not.toMatch(/datePublished.*\|\| "2025-01-01"/);
    expect(sd).not.toMatch(/new Date\(\)\.toISOString\(\)\.split/);
  });

  test('no SearchAction pointing at a route that does not exist', () => {
    // Checks the emitted fields, not the word: the file explains in a comment
    // why there is no SearchAction (no /search route; Google retired the
    // sitelinks search box in Nov 2024).
    expect(sd).not.toMatch(/"potentialAction"/);
    expect(sd).not.toMatch(/"@type": "SearchAction"/);
    expect(sd).not.toMatch(/urlTemplate/);
  });

  test('the support address is the real one', () => {
    expect(sd).not.toMatch(/support@indigenousrising\.ai/);
    expect(index).not.toMatch(/support@indigenousrising\.ai/);
    expect(index).toMatch(/help@indigenousrising\.ai/);
  });

  test('SoftwareApplication ships once, on the homepage only', () => {
    expect(index, 'sitewide SoftwareApplication is back in index.html').not.toMatch(/SoftwareApplication/);
    expect(sd, 'React pushes a second copy on the homepage').not.toMatch(/schemas\.push\(softwareApplicationSchema\)/);
    expect(prerender).toMatch(/'@type': 'SoftwareApplication'/);
    expect(prerender).toMatch(/\{ p: '\/', t: HOME_TITLE, d: HOME_DESC, software: true \}/);
  });

  test('the homepage declares its site name for Google', () => {
    expect(index).toMatch(/"@type": "WebSite"/);
    expect(index).toMatch(/"alternateName": "Indigenous Rising"/);
  });
});

describe('layout stability and internal links', () => {
  test('content images declare dimensions', () => {
    for (const [file, count] of [['src/pages/Blog.tsx', 2], ['src/components/SuccessGallery.tsx', 2]] as const) {
      const src = read(file);
      const imgs = src.match(/<img[\s\S]*?\/>/g) ?? [];
      const sized = imgs.filter((i) => /width=\{\d+\}/.test(i) && /height=\{\d+\}/.test(i));
      expect(sized.length, `${file}: ${sized.length}/${imgs.length} images sized`).toBeGreaterThanOrEqual(count);
    }
    expect(read('src/components/media/AmbientVideo.tsx')).toMatch(/width=\{1600\}\n\s*height=\{900\}/);
  });

  test('the footer links the pages that had no inbound links', () => {
    // /plan and /impact were orphans; /funding had 2 inbound links.
    const footer = read('src/components/Footer.tsx');
    for (const to of ['/funding', '/plan', '/impact', '/funding/alerts']) {
      expect(footer, `footer does not link ${to}`).toMatch(new RegExp(`to: '${to}'`));
    }
  });

  test('heading levels do not skip on the pages that skipped them', () => {
    // Measured live: h1 -> h3 on 7 pages, h2 -> h4 on 2.
    const files = ['src/pages/Contact.tsx', 'src/pages/PrivacyPolicy.tsx', 'src/pages/TermsOfService.tsx',
      'src/pages/AccessibilityStatement.tsx', 'src/pages/DataRights.tsx', 'src/pages/FundingAlerts.tsx'];
    for (const f of files) {
      const src = read(f);
      const firstH2 = src.search(/<h2[\s>]/);
      const firstH3 = src.search(/<h3[\s>]/);
      if (firstH3 !== -1) {
        expect(firstH2, `${f}: an h3 appears before any h2`).not.toBe(-1);
        expect(firstH2, `${f}: an h3 appears before any h2`).toBeLessThan(firstH3);
      }
    }
    // The footer is on every page: its headings start at h2.
    expect(read('src/components/Footer.tsx')).toMatch(/<h2 className="font-display text-xl font-semibold text-foreground">Stay connected<\/h2>/);
  });

  test('the funding-guide FAQ answers ship in the static HTML', () => {
    // The prerendered FAQPage block is the only copy a non-rendering crawler
    // sees. It is loaded from the module the page renders (see
    // seo-schema-single-source.test.ts) so the two cannot drift.
    expect(prerender).toMatch(/hub\.faqs = hubFaqs\.map/);
    expect(prerender).toMatch(/'@type': 'FAQPage'/);
  });

  test('every asset referenced by the sitemap build exists', () => {
    const files = new Set(readdirSync('public'));
    for (const f of ['robots.txt', 'og-home.jpg', 'og-pricing.jpg', 'logo-icon.png', 'favicon.ico']) {
      expect(files.has(f), `public/${f} missing`).toBe(true);
    }
    expect(files.has('404.html'), 'the GitHub Pages 404 shim is back').toBe(false);
  });
});
