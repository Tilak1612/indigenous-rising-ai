import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

/**
 * Every bespoke social image that exists must actually be served.
 *
 * applyHead() OVERWRITES og:image on every prerendered route, so a page
 * component's own <meta property="og:image"> is discarded at build time.
 * Five images sat in public/, correctly referenced in their components, and
 * every marketing page still shipped og-home.jpg. Blog posts already passed
 * a per-route image; marketing routes had no field for one.
 */
const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const publicFiles = readdirSync('public');

const WIRED: Record<string, string> = {
  '/compliance': 'og-compliance.jpg',
  '/contact': 'og-contact.jpg',
  '/data-rights': 'og-data-rights.jpg',
  '/privacy': 'og-privacy.jpg',
  '/terms': 'og-terms.jpg',
};

describe('per-page Open Graph images', () => {
  test('every bespoke og-*.jpg in public/ is wired to a route', () => {
    // A new image dropped into public/ that nobody wires up is invisible —
    // exactly the state this fixes. Fail loudly instead.
    const bespoke = publicFiles.filter((f) => /^og-.+\.jpg$/.test(f) && f !== 'og-home.jpg');
    const unwired = bespoke.filter((f) => !prerender.includes(`img: '/${f}'`));
    expect(unwired, 'these images exist but no route serves them').toEqual([]);
  });

  test('each wired route names an image that exists on disk', () => {
    for (const [route, img] of Object.entries(WIRED)) {
      expect(prerender, `${route} is not wired`).toContain(`img: '/${img}'`);
      expect(publicFiles, `${img} is referenced but missing from public/`).toContain(img);
    }
  });

  test('writeRoute forwards the per-route image', () => {
    // Without this the field is silently ignored and every page falls back.
    expect(prerender).toMatch(/\.\.\.\(m\.img \? \{ ogImage: `\$\{BASE\}\$\{m\.img\}` \} : \{\}\)/);
  });
});

const built = existsSync('dist/compliance/index.html');
describe.runIf(built)('the built output carries the right image', () => {
  const ogOf = (dir: string) =>
    (readFileSync(`dist/${dir}/index.html`, 'utf8')
      .match(/property="og:image" content="([^"]*)"/) ?? [])[1];
  const twOf = (dir: string) =>
    (readFileSync(`dist/${dir}/index.html`, 'utf8')
      .match(/name="twitter:image" content="([^"]*)"/) ?? [])[1];

  test('each page ships its own image, not the generic one', () => {
    for (const [route, img] of Object.entries(WIRED)) {
      const dir = route.slice(1);
      if (!existsSync(`dist/${dir}/index.html`)) continue;
      expect(ogOf(dir), `${route} still ships the generic image`).toContain(img);
      expect(twOf(dir), `${route} twitter:image disagrees with og:image`).toBe(ogOf(dir));
    }
  });

  test('all social URLs are absolute production URLs', () => {
    for (const route of Object.keys(WIRED)) {
      const dir = route.slice(1);
      if (!existsSync(`dist/${dir}/index.html`)) continue;
      expect(ogOf(dir)).toMatch(/^https:\/\/www\.indigenousrising\.ai\//);
    }
  });
});
