import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

/**
 * The homepage's first viewport must not wait for JavaScript to become visible.
 *
 * [data-reveal] starts at opacity 0 and only becomes visible after the JS bundle
 * loads, React mounts, an effect runs, an IntersectionObserver fires and an
 * 800ms transition finishes. The hero's eyebrow, H1, subhead, signup CTA row and
 * microcopy were all [data-reveal], so the headline - the page's LCP element -
 * and the primary "Start free" button were invisible until then.
 *
 * Measured on a controlled A/B (same browser, same load, local server so there
 * is no network latency to blur it, five runs each): LCP median 2152ms with the
 * reveal gating the hero vs 1400ms without. First paint was the same in both, so
 * the whole cost was the headline becoming visible. These are not field numbers
 * - n is small and the machine was loaded - but the direction held in 4 of 5
 * pairs and the mechanism is not in doubt.
 *
 * A CSS-only entrance animation would not fix it: the app mounts with
 * createRoot, which REPLACES the prerendered markup, so the animation would play
 * on the static copy and then replay on React's copy as a visible blink.
 *
 * Below the fold is unaffected on purpose - those reveals are decoration, and the
 * second half of this file makes sure the fix cannot flatten them by accident.
 */
const landing = readFileSync('src/pages/LandingV2.tsx', 'utf8');

// The hero text block: from the top section to the product-mock wrapper, which
// sits below the headline and CTAs and stays revealed.
const start = landing.indexOf('<section id="top"');
const end = landing.indexOf('{/* Hero product mock');
const hero = start > -1 && end > start ? landing.slice(start, end) : '';

describe('the first viewport does not depend on JavaScript to be visible', () => {
  test('the hero block was found, or every check below is vacuous', () => {
    expect(hero.length).toBeGreaterThan(500);
    expect(hero).toContain('<h1');
  });

  test('nothing in the hero text block is [data-reveal]', () => {
    expect(hero, 'a first-viewport element is gated behind JS again').not.toContain('data-reveal');
  });

  test.each([
    ['the H1', /<h1\b[^>]*>/],
    ['the signup CTA', /trackSignupCta\('hero'\)/],
  ])('%s is in the hero block', (_name, re) => {
    expect(re.test(hero)).toBe(true);
  });

  test('the reasoning is recorded next to the code, where the next editor will look', () => {
    expect(landing).toMatch(/first viewport is deliberately NOT \[data-reveal\]/);
    expect(landing).toMatch(/createRoot/);
  });
});

describe('the below-the-fold reveals are untouched', () => {
  const css = readFileSync('src/pages/landing-v2.css', 'utf8');

  test('most sections still reveal on scroll', () => {
    const rest = landing.slice(end);
    const n = (rest.match(/data-reveal/g) ?? []).length;
    expect(n, 'the below-fold reveals were flattened').toBeGreaterThanOrEqual(15);
  });

  test('the reveal mechanism itself is intact', () => {
    expect(css).toMatch(/\.irv2-root \[data-reveal\] \{[\s\S]*?opacity: 0;/);
    expect(landing).toMatch(/classList\.add\('irv2-revealed'\)/);
  });
});

const built = 'dist/index.html';
describe.runIf(existsSync(built))('the prerendered homepage ships a visible hero', () => {
  // CI builds first; locally a stale or absent dist/ must not break collection.
  const html = existsSync(built) ? readFileSync(built, 'utf8') : '';

  test('the static H1 is not opacity-0 pending JavaScript', () => {
    const h1 = /<h1\b[^>]*>/.exec(html)?.[0] ?? '';
    expect(h1.length).toBeGreaterThan(0);
    expect(h1).not.toContain('data-reveal');
  });

  test('the static signup CTA row is not reveal-gated', () => {
    const i = html.indexOf('Start free');
    expect(i, 'no Start free CTA in the static HTML').toBeGreaterThan(-1);
    // The nearest opening tag with a data-reveal before the CTA would be its gate.
    const before = html.slice(Math.max(0, i - 900), i);
    const lastReveal = before.lastIndexOf('data-reveal');
    const lastHeroEnd = before.lastIndexOf('</h1>');
    expect(lastReveal === -1 || lastReveal < lastHeroEnd).toBe(true);
  });
});
