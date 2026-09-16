import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
// @ts-expect-error — plain ESM build script, no type declarations
import { buildLlmsTxt } from '../../scripts/llms-txt.mjs';
import { PLANS, PLAN_FEATURES } from '@/data/plans';
import { liveFeatureList, PRODUCT_DEFINITION, PRODUCT_AUDIENCE } from '@/data/entityFacts';

/**
 * /llms.txt is an optional, unofficial map of the site for LLM tools. It is
 * generated from the sitemap entries, plans.ts and entityFacts.ts, so it can
 * only describe indexable pages, live prices and live capabilities.
 */
const BASE = 'https://www.indigenousrising.ai';
const planned = Object.values(PLAN_FEATURES).flat().filter((f) => !f.available).map((f) => f.text);

const pages = [
  { loc: `${BASE}/`, title: 'Home | Indigenous Rising AI', description: 'The homepage.' },
  { loc: `${BASE}/pricing`, title: 'Pricing | Indigenous Rising AI', description: 'Plans.' },
  { loc: `${BASE}/blog/a-guide`, title: 'A Guide', description: 'A post.' },
];

const txt: string = buildLlmsTxt({
  base: BASE, definition: PRODUCT_DEFINITION, audience: PRODUCT_AUDIENCE, plans: PLANS,
  available: liveFeatureList(), planned, pages,
});

const section = (name: string) => {
  const start = txt.indexOf(`## ${name}\n`);
  if (start === -1) return '';
  const next = txt.indexOf('\n## ', start + 1);
  return txt.slice(start, next === -1 ? undefined : next);
};

describe('llms.txt content', () => {
  test('follows the llmstxt.org shape: H1, blockquote summary, H2 link sections', () => {
    expect(txt.startsWith('# Indigenous Rising AI\n\n> ')).toBe(true);
    expect(txt).toContain(`> ${PRODUCT_DEFINITION}`);
    expect(section('Pages')).toContain(`- [Pricing](${BASE}/pricing): Plans.`);
  });

  test('nothing planned is listed as available', () => {
    const available = section('Available today');
    expect(planned.length).toBeGreaterThan(5);
    for (const p of planned) expect(available, `"${p}" listed as available`).not.toContain(`- ${p}\n`);
  });

  test('planned capabilities are stated as not available', () => {
    expect(section('Planned — not available yet')).toContain('- Grant writing assistant');
  });

  test('prices come from plans.ts, and custom pricing is not given a number', () => {
    const plans = section('Plans');
    expect(plans).toContain('- Growth: $49 CAD per month');
    expect(plans).toContain('- Nations & Organizations: custom pricing');
  });

  test('blog posts are separated from product pages', () => {
    expect(section('Guides and articles')).toContain(`${BASE}/blog/a-guide`);
    expect(section('Pages')).not.toContain('/blog/a-guide');
  });

  test('funding is framed as decision support, and OCAP® is not called a certification', () => {
    expect(txt).toMatch(/not an eligibility decision or a guarantee of funding/);
    expect(txt).toMatch(/not certified by FNIGC/);
    expect(txt).not.toMatch(/OCAP®[- ]certified(?! by)/i);
  });
});

describe('llms.txt wiring', () => {
  const prerender = readFileSync('scripts/prerender.mjs', 'utf8');

  test('is built from the sitemap entries, so noindex pages cannot appear', () => {
    expect(prerender).toMatch(/await writeSitemap\(sitemap\);\s*\n\s*await writeLlmsTxt\(sitemap\);/);
    // sitemap entries are only pushed for routes without noindex
    expect(prerender).toMatch(/if \(!\/noindex\/i\.test\(m\.robots \|\| ''\)\) \{\s*\n\s*sitemap\.push/);
  });

  test('robots.txt lets crawlers fetch it', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');
    expect(robots).not.toMatch(/^Disallow: \/llms/m);
  });
});
