import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const app = readFileSync('src/App.tsx', 'utf8');
const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const robots = readFileSync('public/robots.txt', 'utf8');

const rewrites: Array<{ source: string }> = vercel.rewrites ?? [];
const redirects: Array<{ source: string; destination: string }> = vercel.redirects ?? [];

// Vercel path-to-regexp subset used in vercel.json: literal paths and a
// trailing "(.*)" capture.
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matches = (pattern: string, path: string) =>
  new RegExp('^' + pattern.split('(.*)').map(escapeRe).join('.*') + '$').test(path);

describe('soft 404s are gone', () => {
  test('there is no catch-all rewrite to index.html', () => {
    // It served every URL — including /this-page-does-not-exist — as a 200
    // with the homepage HTML.
    for (const r of rewrites) expect(r.source, 'catch-all rewrite is back').not.toBe('/(.*)');
  });

  test('the prerender writes a real 404 page with noindex and no canonical', () => {
    expect(prerender).toMatch(/file: '404\.html'/);
    expect(prerender).toMatch(/robots: 'noindex, follow', noCanonical: true/);
  });

  test('every client-only route still reaches the SPA', () => {
    // The safety net for the scoped rewrites: each <Route path> must be
    // prerendered, an edge redirect, or matched by a rewrite. A route that is
    // none of these would still render (404.html is the SPA shell) but with a
    // 404 status — so catch it here instead.
    const prerendered = new Set([...prerender.matchAll(/\{ p: '([^']+)'/g)].map((m) => m[1]));
    const paths = [...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*');
    const uncovered: string[] = [];
    for (const p of paths) {
      if (prerendered.has(p)) continue;
      if (p === '/blog/:slug') continue; // every post is prerendered from the same data
      if (redirects.some((r) => r.source === p)) continue;
      const sample = p.replace(/:[A-Za-z]+/g, 'sample-id');
      if (rewrites.some((r) => matches(r.source, sample))) continue;
      uncovered.push(p);
    }
    expect(uncovered, `routes with no prerender, redirect or rewrite: ${uncovered.join(', ')}`).toEqual([]);
  });
});

describe('duplicate URL variants resolve to one URL', () => {
  test('trailing slashes redirect instead of serving a second copy', () => {
    expect(vercel.trailingSlash).toBe(false);
  });

  test('client-only aliases are real edge redirects', () => {
    // They were <Navigate> only: a crawler got a 200 with homepage HTML.
    for (const [src, dst] of [['/learning', '/training'], ['/v1', '/'], ['/landing-v2', '/'], ['/login', '/auth'], ['/signin', '/auth']]) {
      const r = redirects.find((x) => x.source === src);
      expect(r, `${src} has no edge redirect`).toBeDefined();
      expect(r!.destination).toBe(dst);
    }
  });
});

describe('robots.txt', () => {
  test('no crawler-specific group silently overrides the private-area Disallows', () => {
    // A bot obeys only the most specific group naming it. "User-agent:
    // Googlebot / Allow: /" made Googlebot ignore every Disallow in the * group.
    for (const bot of ['Googlebot', 'Bingbot', 'Twitterbot', 'facebookexternalhit', 'LinkedInBot']) {
      expect(robots, `${bot} group is back`).not.toMatch(new RegExp(`^User-agent:\\s*${bot}\\s*$`, 'mi'));
    }
    expect(robots).toMatch(/^Disallow: \/dashboard$/m);
    expect(robots).toMatch(/^Disallow: \/admin$/m);
  });

  test('noindex pages are not blocked, so Google can read the noindex', () => {
    // Scoped to the "*" group (the one Googlebot now follows). The AI
    // retrieval-bot groups further down block /auth on purpose — that is fine,
    // they don't need to read a noindex.
    const starGroup = robots.split(/^User-agent:\s*\*\s*$/m)[1].split(/^User-agent:/m)[0];
    expect(starGroup).not.toMatch(/^Disallow: \/auth$/m);
    expect(starGroup).not.toMatch(/^Disallow: \/signup$/m);
  });

  test('the sovereignty AI-crawler policy is preserved', () => {
    for (const bot of ['GPTBot', 'CCBot', 'ClaudeBot']) {
      expect(robots).toMatch(new RegExp(`User-agent: ${bot}\\nDisallow: /`));
    }
    expect(robots).toMatch(/Sitemap: https:\/\/www\.indigenousrising\.ai\/sitemap\.xml/);
  });
});
