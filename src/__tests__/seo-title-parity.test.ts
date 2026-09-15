import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { ROUTE_TITLES } from '@/data/routeTitles';

const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const read = (p: string) => readFileSync(p, 'utf8');

// The static <title> and the one Helmet sets after hydration must be the same
// string. Measured on a Vercel preview, they differed on 12 of 23 routes
// ("Frequently asked questions" vs "Frequently Asked Questions",
// "Terms of Service | …" vs "Terms of Service - …", "Contact Us | Get Support"),
// and Google indexes the rendered one.
describe('titles have a single source', () => {
  test('every prerendered route has an entry', () => {
    const routes = [...prerender.matchAll(/\{ p: '([^']+)'/g)].map((m) => m[1]);
    const missing = routes.filter((r) => !ROUTE_TITLES[r]);
    expect(missing, `prerendered routes with no shared title: ${missing.join(', ')}`).toEqual([]);
  });

  test('the prerender reads the shared map', () => {
    expect(prerender).toMatch(/loadDataModule\('src\/data\/routeTitles\.ts', 'ROUTE_TITLES'\)/);
    expect(prerender).toMatch(/if \(t\) m\.t = t;/);
  });

  test('no page hardcodes a title literal any more', () => {
    // Any <title>…</title> or title="…" literal in a prerendered page is a
    // second source waiting to drift.
    const pages = readdirSync('src/pages').filter((f) => f.endsWith('.tsx'));
    const offenders: string[] = [];
    for (const f of pages) {
      const src = read(`src/pages/${f}`);
      if (!src.includes('ROUTE_TITLES')) continue; // not a prerendered marketing page
      if (/<title>[^<{]+<\/title>/.test(src)) offenders.push(`${f} (<title> literal)`);
      // a title="…" prop on MetaTags specifically (other components have their
      // own unrelated title props)
      const meta = /<MetaTags[\s\S]{0,400}?\/>/.exec(src)?.[0] ?? '';
      if (/\btitle="[^"]+"/.test(meta)) offenders.push(`${f} (MetaTags title literal)`);
    }
    expect(offenders, `pages with a hardcoded title: ${offenders.join(', ')}`).toEqual([]);
  });

  test('every title fits in the search result', () => {
    const tooLong = Object.entries(ROUTE_TITLES).filter(([, t]) => t.length > 60);
    expect(tooLong.map(([r, t]) => `${r} (${t.length})`)).toEqual([]);
  });

  test('titles are unique per route', () => {
    const values = Object.values(ROUTE_TITLES);
    // /auth and /signup are the two states of one page but have distinct titles
    expect(new Set(values).size).toBe(values.length);
  });

  test('the sign-in page uses both entries for its two states', () => {
    expect(read('src/pages/Auth.tsx')).toMatch(/isLogin \? ROUTE_TITLES\['\/auth'\] : ROUTE_TITLES\['\/signup'\]/);
  });
});
