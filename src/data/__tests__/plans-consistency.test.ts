import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Entitlements are written in TWO places — src/data/plans.ts (the cards) and a
 * hardcoded array inside PricingSection's "Compare Plans" table. They drifted:
 * the table showed Growth with Free's support level, and BOTH claimed Growth
 * gets "Unlimited" AI matching while match-funding-opportunities caps it at 50.
 *
 * These assertions pin the two together, and pin the advertised match quota to
 * the number the edge function actually enforces.
 */
const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const plans = read('src/data/plans.ts');
const pricing = read('src/components/PricingSection.tsx');
const matcher = read('supabase/functions/match-funding-opportunities/index.ts');

const quotaFor = (tier: string) => {
  const block = matcher.match(/QUOTA_BY_TIER[^{]*\{([\s\S]*?)\}/)?.[1] ?? '';
  const m = block.match(new RegExp(`${tier}:\\s*(null|\\d+)`));
  return m?.[1] ?? null;
};

describe('advertised entitlements match what is enforced', () => {
  test('Growth matching quota is advertised as the number actually enforced', () => {
    expect(quotaFor('growth')).toBe('50');
    // Neither surface may promise unlimited matching to Growth.
    expect(plans).not.toMatch(/funding navigator \(unlimited matches\)/i);
    expect(pricing).toMatch(/'AI funding matching'[^}]*growth: '50\/mo'/);
  });

  test('free tier matching quota agrees with the matcher', () => {
    expect(quotaFor('free')).toBe('3');
    expect(pricing).toMatch(/'AI funding matching'[^}]*free: '3\/mo'/);
  });

  test('unlimited is only claimed for tiers the matcher leaves uncapped', () => {
    expect(quotaFor('pro')).toBe('null');
    expect(pricing).toMatch(/'AI funding matching'[^}]*pro: 'Unlimited'/);
  });

  test('support ladder escalates and Growth is not shown Free-level support', () => {
    const row = pricing.match(/\{ feature: 'Priority support',([^}]*)\}/)?.[1] ?? '';
    const free = row.match(/free: '([^']*)'/)?.[1];
    const growth = row.match(/growth: '([^']*)'/)?.[1];
    expect(free).toBeTruthy();
    expect(growth).toBeTruthy();
    // The bug: Growth showed 'Email', identical to Free.
    expect(growth).not.toBe(free);
    expect(plans).toMatch(/Priority email support/);
  });
});
