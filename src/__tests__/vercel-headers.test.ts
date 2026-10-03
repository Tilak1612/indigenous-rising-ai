import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

/**
 * Header rules in vercel.json.
 *
 * Measured on production on 2026-10-02: everything under /img/ and /video/ was
 * served `public, max-age=0, must-revalidate`, i.e. revalidated on every single
 * navigation. That is roughly 390KB of unhashed imagery on the homepage alone.
 * Only the Vite-hashed /assets/* had a cache rule.
 *
 * Those files have UNHASHED names, so they must not be marked `immutable`: a
 * replaced hero image has to reach users. A day fresh plus a week of
 * stale-while-revalidate removes the per-navigation round trip without pinning
 * a changed file for long.
 */
type HeaderRule = { source: string; headers: Array<{ key: string; value: string }> };
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers: HeaderRule[] };

const ruleFor = (source: string) => vercel.headers.find((h) => h.source === source);
const cacheControl = (source: string) =>
  ruleFor(source)?.headers.find((h) => h.key.toLowerCase() === 'cache-control')?.value;

const maxAge = (v: string | undefined) => Number(/max-age=(\d+)/.exec(v ?? '')?.[1] ?? NaN);

describe('unhashed static assets are cached, but not pinned', () => {
  test.each(['/img/(.*)', '/video/(.*)'])('%s has a Cache-Control rule', (source) => {
    expect(cacheControl(source), `no Cache-Control for ${source}`).toBeDefined();
  });

  test.each(['/img/(.*)', '/video/(.*)'])('%s is cacheable, so it no longer revalidates every navigation', (source) => {
    expect(maxAge(cacheControl(source))).toBeGreaterThan(0);
    expect(cacheControl(source)).toMatch(/\bpublic\b/);
  });

  test.each(['/img/(.*)', '/video/(.*)'])('%s is NOT immutable — its filenames are not hashed', (source) => {
    expect(cacheControl(source)).not.toMatch(/immutable/);
  });

  test.each(['/img/(.*)', '/video/(.*)'])('%s cannot pin a replaced file for more than a week', (source) => {
    expect(maxAge(cacheControl(source))).toBeLessThanOrEqual(7 * 24 * 3600);
  });

  test.each(['/img/(.*)', '/video/(.*)'])('%s uses stale-while-revalidate', (source) => {
    expect(cacheControl(source)).toMatch(/stale-while-revalidate=\d+/);
  });
});

describe('the existing hashed-asset rule is untouched', () => {
  test('/assets stays immutable for a year, because those names carry a content hash', () => {
    expect(cacheControl('/assets/(.*)')).toBe('public, max-age=31536000, immutable');
  });

  test('the security header block is still present', () => {
    const keys = ruleFor('/(.*)')?.headers.map((h) => h.key) ?? [];
    for (const k of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Content-Security-Policy']) {
      expect(keys, `${k} missing`).toContain(k);
    }
  });
});

describe('the files these rules cover really are unhashed', () => {
  // The rule is only correct while that holds. If images move into the hashed
  // pipeline, `immutable` becomes the right choice and this should be revisited.
  const hashed = /[-.][A-Za-z0-9_-]{8}\.(?:jpe?g|png|webp|avif|mp4|webm)$/;

  test.each(['public/img', 'public/video'])('%s holds no content-hashed filenames', (dir) => {
    const files = readdirSync(dir);
    expect(files.length).toBeGreaterThan(0);
    const looksHashed = files.filter((f) => hashed.test(f) && !/-(?:640|1280|1920|desktop|mobile|poster)\b/.test(f));
    expect(looksHashed, `hashed names in ${dir}: ${looksHashed.join(', ')}`).toEqual([]);
  });
});

/**
 * noindex on client-only routes.
 *
 * Every client-rendered route is rewritten to /index.html, which is the
 * PRERENDERED HOMEPAGE. Measured on production on 2026-10-02, /funding/abc123,
 * /features/anything, /community/hello, /dashboard and /onboarding all returned
 * 200 with the homepage <title>, `index, follow`, and a canonical pointing at
 * "/". None has an internal link or a sitemap entry, so this is hygiene rather
 * than a rescue — but they should not present as indexable copies of the
 * homepage.
 *
 * The one thing that must never happen is noindexing a REAL page. /funding/alerts
 * is sitemap-listed, so a blanket /funding/(.*) rule would have dropped it. The
 * safety property asserted below is therefore the load-bearing one: no noindex
 * source may match any public route.
 */
const robotsRules = vercel.headers.filter((h) =>
  h.headers.some((x) => x.key.toLowerCase() === 'x-robots-tag'),
);

// The path-to-regexp subset vercel.json uses: literals, a trailing "(.*)", and
// a named parameter with its own regex, e.g. ":id([0-9a-f-]{36})".
function sourceToRegExp(source: string): RegExp {
  let out = '';
  let i = 0;
  while (i < source.length) {
    if (source.startsWith('(.*)', i)) {
      out += '.*';
      i += 4;
    } else if (source[i] === ':') {
      const m = /^:\w+\(((?:[^()\\]|\\.)*)\)/.exec(source.slice(i));
      if (!m) throw new Error(`unsupported parameter syntax in ${source}`);
      out += `(?:${m[1]})`;
      i += m[0].length;
    } else {
      out += source[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i += 1;
    }
  }
  return new RegExp('^' + out + '$');
}

const noindexMatches = (path: string) =>
  robotsRules.filter((r) => sourceToRegExp(r.source).test(path)).map((r) => r.source);

describe('private and client-only routes carry X-Robots-Tag noindex', () => {
  test('there are rules to test, or every check below is vacuous', () => {
    expect(robotsRules.length).toBeGreaterThanOrEqual(8);
  });

  test('every rule uses exactly "noindex, nofollow"', () => {
    for (const r of robotsRules) {
      const v = r.headers.find((x) => x.key.toLowerCase() === 'x-robots-tag')!.value;
      expect(v, `${r.source} has an unexpected directive`).toBe('noindex, nofollow');
    }
  });

  test.each([
    '/dashboard',
    '/dashboard/funding',
    '/dashboard/plan/anything',
    '/admin',
    '/admin/users',
    '/onboarding',
    '/unsubscribe',
    '/features/funding-matching',
    '/community/some-post-id',
    '/funding/7b366d5f-d9af-4862-95cc-a820e5e035bf',
    // The rollup-plugin-visualizer report is emitted into dist and served.
    '/stats.html',
  ])('%s is noindexed', (path) => {
    expect(noindexMatches(path), `${path} is not noindexed`).not.toEqual([]);
  });
});

describe('no noindex rule can ever match a real public page', () => {
  const marketing = [...readFileSync('scripts/prerender.mjs', 'utf8').matchAll(/\{ p: '(\/[^']*)'/g)].map(
    (m) => m[1],
  );

  test('the prerender route list was found, or this check is vacuous', () => {
    expect(marketing.length).toBeGreaterThanOrEqual(15);
    expect(marketing).toContain('/funding');
  });

  test.each([
    '/',
    '/funding',
    '/funding/alerts',
    '/community',
    '/pricing',
    '/blog',
    '/blog/off-reserve-indigenous-business-funding-canada',
    '/guides/indigenous-business-grants',
  ])('%s is NOT noindexed', (path) => {
    expect(noindexMatches(path), `${path} would be dropped from search`).toEqual([]);
  });

  test('no prerendered marketing route is matched by any noindex rule', () => {
    const hit = marketing
      .map((p) => [p, noindexMatches(p)] as const)
      .filter(([, m]) => m.length > 0)
      .map(([p, m]) => `${p} <- ${m.join(', ')}`);
    expect(hit, `public pages would be noindexed: ${hit.join('; ')}`).toEqual([]);
  });

  test('the funding rule matches only a UUID, never a named sub-page', () => {
    for (const named of ['alerts', 'confirm', 'unsubscribe', 'confirm-subscription']) {
      expect(noindexMatches(`/funding/${named}`), `/funding/${named} is noindexed`).toEqual([]);
    }
    expect(noindexMatches('/funding/7b366d5f-d9af-4862-95cc-a820e5e035bf')).not.toEqual([]);
  });
});

describe.runIf(existsSync('dist/sitemap.xml'))('the built sitemap is untouched by noindex rules', () => {
  test('no sitemap URL is matched by a noindex rule', () => {
    const urls = [...readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    );
    expect(urls.length).toBeGreaterThan(20);
    const hit = urls.filter((u) => noindexMatches(u).length > 0);
    expect(hit, `sitemap URLs that would be noindexed: ${hit.join(', ')}`).toEqual([]);
  });
});

describe('the build config does not misdescribe its own sourcemaps', () => {
  // vite.config.ts used to say sourcemaps were "not publicly exposed". They are:
  // `sourcemap: 'hidden'` only drops the //# sourceMappingURL comment, the .map
  // files are still emitted and Vercel serves them (verified on production:
  // <bundle>.js.map returned 200 with sourcesContent). That is fine for a public
  // repo, but the comment must say so rather than imply a confidentiality the
  // setting does not provide.
  const cfg = readFileSync('vite.config.ts', 'utf8');

  test('it does not claim the maps are private', () => {
    expect(cfg).not.toMatch(/not publicly exposed/i);
  });

  test("while 'hidden' is in use, the comment states the maps are publicly fetchable", () => {
    if (/sourcemap:\s*'hidden'/.test(cfg)) {
      expect(cfg).toMatch(/publicly fetchable/i);
      expect(cfg).toMatch(/repository is public/i);
    }
  });
});
