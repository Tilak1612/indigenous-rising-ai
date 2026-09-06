import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Onboarding exists to make matching work. If its answers do not reach the
 * columns the matcher reads, in the vocabulary the grant data uses, the
 * product's headline promise — "3 free funding matches every month" — is
 * broken for every user who completes it.
 *
 * Both halves were broken in production and are pinned here.
 *
 * 1. WRONG TABLE. The wizard wrote business_profiles.{province,stage,sector};
 *    match-funding-opportunities reads profiles.{territory,industry,
 *    business_stage}. Verified live: a user with a complete
 *    business_profiles row still got HTTP 400,
 *    missing_fields ["territory","industry","business_stage"].
 *
 * 2. WRONG VOCABULARY. Values are compared with an exact includes() against
 *    grants.industries / grants.business_stages. Of four stages offered only
 *    two existed in the data; of thirteen industries only two did.
 *
 * The grant vocabulary below was read from production.
 */
const wizard = readFileSync('src/components/OnboardingWizard.tsx', 'utf8');

const GRANT_STAGES = ['early-stage', 'established', 'growth', 'ideation', 'startup'];
const GRANT_INDUSTRIES = [
  'Agriculture & Forestry', 'Arts & Crafts', 'Construction',
  'Energy & Mining', 'Hospitality & Tourism', 'Transportation',
];

const values = (block: string) =>
  [...block.matchAll(/value: '([^']+)'/g)].map((m) => m[1]);

describe('onboarding answers reach the matcher', () => {
  test('it writes the three columns the matcher reads', () => {
    const save = wizard.slice(wizard.indexOf("from('profiles')"));
    expect(wizard, 'the wizard never updates public.profiles').toContain("from('profiles')");
    for (const col of ['territory', 'industry', 'business_stage']) {
      expect(save.slice(0, 600), `${col} is not written`).toContain(col);
    }
  });

  test('it still writes the richer business_profiles record', () => {
    // Profile page and data export read this one; both must be populated.
    expect(wizard).toContain("from('business_profiles')");
    expect(wizard).toContain('revenue_range');
  });
});

describe('the wizard speaks the vocabulary the grants use', () => {
  test('every stage offered exists in grants.business_stages', () => {
    const block = wizard.slice(wizard.indexOf('const STAGES'), wizard.indexOf('const SECTORS'));
    const offered = values(block);
    expect(offered.length).toBeGreaterThan(0);
    const unmatched = offered.filter((v) => !GRANT_STAGES.includes(v));
    expect(unmatched, 'these stages match no grant').toEqual([]);
  });

  test('every industry offered exists in grants.industries, bar Other', () => {
    const line = /const SECTORS = \[([^\]]+)\]/.exec(wizard)?.[1] ?? '';
    const offered = [...line.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((v) => v !== 'Other');
    expect(offered.length).toBeGreaterThan(0);
    const unmatched = offered.filter((v) => !GRANT_INDUSTRIES.includes(v));
    expect(unmatched, 'these industries match no grant').toEqual([]);
  });

  test('"Other" is stored as null so it reads as unknown, not a rejection', () => {
    expect(wizard).toMatch(/answers\.sector !== 'Other' \? answers\.sector : null/);
  });

  test('the stage list covers every stage the grant data uses', () => {
    // Omitting one means a user in that stage can never match a grant that
    // names it. 'growth' was missing.
    const block = wizard.slice(wizard.indexOf('const STAGES'), wizard.indexOf('const SECTORS'));
    const offered = values(block);
    for (const s of GRANT_STAGES) {
      expect(offered, `no option for the "${s}" stage`).toContain(s);
    }
  });
});
