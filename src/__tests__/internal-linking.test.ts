import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A page that is in the sitemap but that no other page links to is discoverable
 * only through the sitemap: crawlers and answer engines weigh internal links as
 * the signal that a page matters, and a visitor can never navigate to it. Eight
 * pages shipped in exactly that state - they were built, tested, listed in the
 * sitemap, and linked from nowhere.
 *
 * This reads the PRERENDERED html, because that is what a crawler that does not
 * run JavaScript sees; links that only exist after React mounts do not count.
 */
const DIST = 'dist';
const ORIGIN = 'https://www.indigenousrising.ai';

function htmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name === 'index.html') out.push(p);
  }
  return out;
}

const built = existsSync(join(DIST, 'sitemap.xml'));

describe.runIf(built)('every sitemap page is linked from another prerendered page', () => {
  // Guarded: CI builds first, but a local run without dist/ must not fail collection.
  const sitemap = built ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
  const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((m) => m[1].replace(ORIGIN, '') || '/');

  const bodies = new Map<string, string>();
  if (built) {
    for (const file of htmlFiles(DIST)) {
      const rel = file.slice(DIST.length, -'/index.html'.length) || '/';
      bodies.set(rel, readFileSync(file, 'utf8').split('</head>').slice(1).join('</head>'));
    }
  }

  const inbound = new Map<string, Set<string>>();
  for (const [from, body] of bodies) {
    for (const m of body.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)/g)) {
      const to = m[1].replace(/\/$/, '') || '/';
      if (to === from) continue;
      if (!inbound.has(to)) inbound.set(to, new Set());
      inbound.get(to)!.add(from);
    }
  }

  test('the sitemap and the prerendered output were both found', () => {
    expect(routes.length).toBeGreaterThan(30);
    expect(bodies.size).toBeGreaterThan(30);
  });

  test('no sitemap page is an orphan', () => {
    const orphans = routes.filter((r) => r !== '/' && (inbound.get(r)?.size ?? 0) === 0);
    expect(orphans, 'in the sitemap but linked from no prerendered page').toEqual([]);
  });
});
