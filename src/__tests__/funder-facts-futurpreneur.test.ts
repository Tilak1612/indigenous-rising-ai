import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Futurpreneur IESP figures must match the funder's own page, everywhere.
 *
 * The seed row, the live grants row and a blog post all carried the RETIRED
 * programme structure: "$20,000 from Futurpreneur + $40,000 from BDC = up to
 * $60,000", and a business "in its first year of operation".
 *
 * Read from https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/
 * in a browser on 2026-09-26, the page says: an equity-free loan of up to
 * $75,000; a business "not yet operational or ... operating full time for 24
 * months or less"; up to two years of 1:1 mentorship; ages 18-39. BDC is not
 * mentioned on the page at all.
 *
 * Both halves of this matter to an applicant:
 *   - the ceiling was understated by $15,000, and a floor was invented;
 *   - "first year" turns away an eligible applicant who is 18 months in.
 *
 * This guards the two copies that live in the repo. The database row is
 * corrected by supabase/migrations/20260926000001_correct_futurpreneur_iesp_terms.sql,
 * which a test cannot reach — that one is asserted by the migration's own
 * WHERE clause and by reading the row back after it is applied.
 */
const read = (p: string) => readFileSync(p, 'utf8');
const seed = read('seed/grants_starter.sql');
const blog = read('src/data/blogPosts.ts');
const migration = read(
  'supabase/migrations/20260926000001_correct_futurpreneur_iesp_terms.sql',
);

/** The seed row for the Futurpreneur programme, isolated from its neighbours. */
const seedRow = (() => {
  const start = seed.indexOf("'Indigenous Entrepreneur Startup Program'");
  expect(start, 'Futurpreneur seed row not found').toBeGreaterThan(-1);
  return seed.slice(start, seed.indexOf('\n),', start));
})();

/** The blog section that describes the programme. */
const blogSection = (() => {
  const start = blog.indexOf('id: "futurpreneur"');
  expect(start, 'futurpreneur blog section not found').toBeGreaterThan(-1);
  return blog.slice(start, blog.indexOf('      },', start));
})();

/** Every surface that states the programme's terms. */
const surfaces: Array<[string, string]> = [
  ['seed/grants_starter.sql', seedRow],
  ['src/data/blogPosts.ts (futurpreneur section)', blogSection],
  ['the correcting migration', migration],
];

/**
 * The negative checks run on the copy a READER sees, not on the migration —
 * the migration has to name the retired figures in order to document what it
 * removed. Blanking its body inside a shared test.each would make those cases
 * assert on an empty string, which is a test that cannot fail.
 */
const readerSurfaces = surfaces.filter(([name]) => name !== 'the correcting migration');

describe('Futurpreneur IESP terms match the funder page', () => {
  test.each(surfaces)('%s states the $75,000 ceiling', (_name, text) => {
    expect(text).toMatch(/75,?000/);
  });

  test.each(readerSurfaces)('%s does not resurrect the retired figures', (_name, text) => {
    expect(text).not.toMatch(/\$?20,000\b/);
    expect(text).not.toMatch(/\$?40,000\b/);
    expect(text).not.toMatch(/\$?60,000\b/);
  });

  test.each(readerSurfaces)('%s does not describe a BDC matching loan', (_name, text) => {
    expect(text).not.toMatch(/BDC/);
  });

  test.each(surfaces)('%s states the two-year operating window', (_name, text) => {
    expect(text).toMatch(/24 months or less|less than two years/);
  });

  test.each(readerSurfaces)('%s does not say "first year" or "12 months"', (_name, text) => {
    expect(text).not.toMatch(/first year of operation/i);
    expect(text).not.toMatch(/under 12 months/i);
  });

  test('the seed row renders as "Up to $75,000", not a made-up range', () => {
    // formatAmount() prints "$min – $max" when BOTH are set, and "Up to $max"
    // when only max is. The funder states a ceiling and no floor, so amount_min
    // must stay NULL or the card invents a minimum the programme does not have.
    expect(seedRow).toMatch(/\n\s*NULL,\s*75000,\s*'CAD',/);
  });

  test('the age range and mentorship length survived the correction', () => {
    for (const [, text] of surfaces) expect(text).toMatch(/18-39/);
    expect(blogSection).toMatch(/two years of 1:1 mentorship/);
  });

  test('the migration leaves the row needing human review', () => {
    // 'verified' is what makes a row sendable in email. A browser read is not
    // the sign-off that gate exists to require.
    expect(migration).not.toMatch(/verification_status\s*=\s*'verified'/);
    expect(migration).toMatch(/verification_status <> 'verified'/);
  });
});

describe('no fabricated usage counts', () => {
  // /plan carried "Join thousands of Indigenous entrepreneurs who've created
  // winning business plans" while the database held 5 profiles and 1 plan.
  const claimFiles = [
    'src/pages/PublicPlan.tsx',
    'src/pages/LandingV2.tsx',
    'src/pages/PublicFunding.tsx',
    'src/components/PricingSection.tsx',
  ];

  test.each(claimFiles)('%s claims no user count we cannot evidence', (f) => {
    const src = read(f);
    expect(src).not.toMatch(/join thousands/i);
    expect(src).not.toMatch(/thousands of (Indigenous )?entrepreneurs/i);
    expect(src).not.toMatch(/trusted by [\d,]+/i);
    expect(src).not.toMatch(/[\d,]{3,} (entrepreneurs|businesses|users) (have|already)/i);
  });

  test('/plan does not promise a "winning" plan', () => {
    expect(read('src/pages/PublicPlan.tsx')).not.toMatch(/winning business plan/i);
  });
});
