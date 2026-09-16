import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PLAN_FEATURES } from '@/data/plans';
import { liveFeatureList, PRODUCT_DEFINITION, PRODUCT_AUDIENCE } from '@/data/entityFacts';

/**
 * Structured data is what search engines and AI answer engines read to decide
 * what this company is and what the product does. It must only state facts
 * the site states, and must never declare a planned capability as a feature.
 */
const read = (p: string) => readFileSync(p, 'utf8');
const planned = Object.values(PLAN_FEATURES).flat().filter((f) => !f.available).map((f) => f.text);

describe('SoftwareApplication featureList', () => {
  const features = liveFeatureList();

  test('lists real capabilities', () => {
    expect(features.length).toBeGreaterThanOrEqual(6);
    expect(features).toContain('Funding opportunity browser');
  });

  test('contains nothing marked coming soon', () => {
    expect(planned.length).toBeGreaterThan(5); // the check below is not vacuous
    for (const f of features) expect(planned, `"${f}" is planned, not live`).not.toContain(f);
  });

  test('every entry is an available row on a self-serve plan', () => {
    const selfServe = [...PLAN_FEATURES.Maadaadiziwin, ...PLAN_FEATURES.Ogichidaakwe];
    for (const f of features) {
      expect(selfServe.find((r) => r.text === f)?.available, `"${f}" is not an available Free/Growth row`).toBe(true);
    }
  });

  test('plan inheritance rows and support promises are not "features"', () => {
    for (const f of features) {
      expect(f).not.toMatch(/^Everything in /);
      expect(f).not.toMatch(/support/i);
    }
  });

  test('the prerender reads the derived list rather than a hand-typed one', () => {
    const prerender = read('scripts/prerender.mjs');
    expect(prerender).toMatch(/loadDataModule\('src\/data\/entityFacts\.ts', 'liveFeatureList'\)/);
    expect(prerender).toMatch(/featureList: entityFacts\.features/);
    expect(prerender).not.toMatch(/featureList: \[/);
  });
});

describe('the company definition', () => {
  const orgDescription = (() => {
    const html = read('index.html');
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const node = JSON.parse(m[1]);
      if (node['@type'] === 'Organization') return node.description as string;
    }
    return '';
  })();

  test('the Organization node uses the shared definition', () => {
    // index.html runs before the bundle and cannot import it, so pin it here.
    expect(orgDescription).toBe(PRODUCT_DEFINITION);
  });

  test('names the peoples served distinctly rather than generalizing', () => {
    for (const people of ['First Nations', 'Inuit', 'Métis']) {
      expect(PRODUCT_DEFINITION).toContain(people);
      expect(PRODUCT_AUDIENCE).toContain(people);
    }
  });

  test('makes no claim about traditional knowledge', () => {
    // The old description said the platform was "harmonizing traditional
    // knowledge with modern business tools" — a claim the product cannot
    // support and that the site assistant is explicitly told never to make.
    for (const src of [PRODUCT_DEFINITION, orgDescription, read('index.html')]) {
      expect(src).not.toMatch(/traditional knowledge/i);
    }
  });
});
