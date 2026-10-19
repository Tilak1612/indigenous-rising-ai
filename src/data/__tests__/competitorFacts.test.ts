import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { COMPARISONS, comparisonBySlug } from '../competitorFacts';

/**
 * Comparison pages are the easiest page type to get wrong, because the
 * incentive runs one way. The brief that asked for these said it directly:
 * differentiate on axis, "not invented superiority".
 *
 * The structural guarantee is that every competitor entry must concede
 * something. A comparison page claiming to win on every axis is one the reader
 * disproves with a single click to the competitor's pricing page — and it takes
 * the rest of the site's credibility with it.
 */
describe('every comparison concedes where we are behind', () => {
  test.each(COMPARISONS.map((c) => [c.name, c] as const))(
    '%s: weAreBehind is populated, not an empty gesture',
    (_name, c) => {
      expect(c.weAreBehind.length, `${c.name} concedes nothing`).toBeGreaterThanOrEqual(2);
      for (const w of c.weAreBehind) expect(w.length).toBeGreaterThan(40);
    },
  );

  test.each(COMPARISONS.map((c) => [c.name, c] as const))(
    '%s: tells the reader when to choose them instead',
    (_name, c) => {
      expect(c.chooseThemIf.length, `${c.name} never says to choose them`).toBeGreaterThanOrEqual(2);
    },
  );

  test.each(COMPARISONS.map((c) => [c.name, c] as const))(
    '%s: states their own facts and when they were checked',
    (_name, c) => {
      expect(c.theirFacts.length).toBeGreaterThanOrEqual(3);
      expect(c.checkedOn).toMatch(/2026/);
      expect(c.url).toMatch(/^https:\/\//);
    },
  );

  test.each(COMPARISONS.map((c) => [c.name, c] as const))(
    '%s: every difference row describes both sides',
    (_name, c) => {
      expect(c.differences.length).toBeGreaterThanOrEqual(3);
      for (const d of c.differences) {
        expect(d.them.length, `${c.name}/${d.axis} has no "them"`).toBeGreaterThan(10);
        expect(d.us.length, `${c.name}/${d.axis} has no "us"`).toBeGreaterThan(10);
      }
    },
  );

  test('no comparison claims a feature the product does not have', () => {
    // /plan was found selling "sector-specific templates" and an "AI Copilot"
    // that do not exist. Those must not reappear here.
    const all = JSON.stringify(COMPARISONS).toLowerCase();
    expect(all).not.toMatch(/sector-specific template/);
    expect(all).not.toMatch(/ai copilot/);
    expect(all).not.toMatch(/governance console/);
    expect(all).not.toMatch(/white-label/);
  });

  test('the LivePlan page concedes price, which is the obvious objection', () => {
    const lp = comparisonBySlug('liveplan')!;
    expect(lp.weAreBehind.join(' ')).toMatch(/cheaper/i);
  });

  test('the GrantCompass page concedes catalogue size, which is the obvious objection', () => {
    const gc = comparisonBySlug('grantcompass')!;
    expect(gc.weAreBehind.join(' ')).toMatch(/catalogue is far larger|850/i);
  });

  test('projection templates are described as roadmap, matching the homepage', () => {
    const lp = comparisonBySlug('liveplan')!;
    expect(JSON.stringify(lp)).toMatch(/roadmap, not live/i);
  });
});

describe('the page resolves its competitor from the path', () => {
  const page = readFileSync('src/pages/ComparisonPage.tsx', 'utf8');

  test('it reads the pathname, not an empty :slug param', () => {
    // The routes are static, so useParams() is always empty and every visitor
    // would have been redirected to the hub.
    expect(page).toMatch(/useLocation/);
    expect(page).not.toMatch(/useParams\(/);
  });

  test('both slugs resolve from their real route paths', () => {
    for (const [path, slug] of [
      ['/grantcompass-alternative', 'grantcompass'],
      ['/liveplan-alternative', 'liveplan'],
    ]) {
      const derived = path.replace(/^\//, '').replace(/-alternative\/?$/, '');
      expect(derived).toBe(slug);
      expect(comparisonBySlug(derived), `${path} resolves nothing`).toBeDefined();
    }
  });

  test('an unknown slug redirects rather than rendering an empty page', () => {
    expect(comparisonBySlug('nope')).toBeUndefined();
    expect(page).toMatch(/Navigate to=/);
  });
});

describe('both routes are registered', () => {
  test.each(['/grantcompass-alternative', '/liveplan-alternative'])('%s is wired', (slug) => {
    for (const f of ['src/App.tsx', 'src/data/routeTitles.ts', 'scripts/prerender.mjs']) {
      expect(readFileSync(f, 'utf8'), `${f} missing ${slug}`).toContain(slug);
    }
  });
});
