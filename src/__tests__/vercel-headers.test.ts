import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

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
