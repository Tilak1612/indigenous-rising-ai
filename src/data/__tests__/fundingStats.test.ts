import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FUNDING_STATS, UNVERIFIED_REASONS, VERIFICATION_FINDINGS } from '../fundingStats';

/**
 * The statistics page makes dated, checkable claims about our own directory.
 *
 * It is the one page on the site whose credibility rests entirely on the
 * numbers being internally consistent, so the arithmetic is asserted rather
 * than trusted — a page that says "6 could not be verified" and then lists
 * reasons adding to 5 is worse than no page.
 */
describe('the published figures are internally consistent', () => {
  test('verified plus unverified equals the total', () => {
    expect(FUNDING_STATS.verified + FUNDING_STATS.unverified).toBe(FUNDING_STATS.total);
  });

  test('the unverified reasons account for every unverified programme', () => {
    const counted = UNVERIFIED_REASONS.reduce((n, r) => n + r.count, 0);
    expect(counted, 'reason counts must sum to the unverified total').toBe(
      FUNDING_STATS.unverified,
    );
  });

  test('no count exceeds the total', () => {
    for (const k of ['verified', 'unverified', 'statesAmount', 'withDeadline', 'rolling'] as const) {
      expect(FUNDING_STATS[k], `${k} exceeds total`).toBeLessThanOrEqual(FUNDING_STATS.total);
    }
  });

  test('rolling plus deadlined equals the total — a programme is one or the other', () => {
    expect(FUNDING_STATS.rolling + FUNDING_STATS.withDeadline).toBe(FUNDING_STATS.total);
  });

  test('the amount range is ordered and positive', () => {
    expect(FUNDING_STATS.lowestCeiling).toBeGreaterThan(0);
    expect(FUNDING_STATS.highestCeiling).toBeGreaterThan(FUNDING_STATS.lowestCeiling);
  });

  test('there are findings and reasons to show, not empty lists', () => {
    expect(UNVERIFIED_REASONS.length).toBeGreaterThan(0);
    expect(VERIFICATION_FINDINGS.length).toBeGreaterThan(0);
  });

  test('the as-of date is a real date and matches its label year', () => {
    const d = new Date(FUNDING_STATS.asOf + 'T00:00:00');
    expect(Number.isNaN(d.getTime())).toBe(false);
    expect(FUNDING_STATS.asOfLabel).toContain(String(d.getFullYear()));
  });
});

describe('the page claims nothing it cannot support', () => {
  const page = readFileSync('src/pages/FundingStatistics.tsx', 'utf8');

  test('every figure comes from the data file, not a literal in the markup', () => {
    // A hard-coded number in the JSX would drift from the file the moment the
    // inventory is re-checked. The only bare integers allowed are layout.
    expect(page).toMatch(/FUNDING_STATS as S/);
    expect(page).not.toMatch(/>\s*1[0-9]\s*(programmes|programs)/i);
  });

  test('it publishes no national total, which we would have to invent', () => {
    expect(page).not.toMatch(/total funding available in Canada/i);
    expect(page).toMatch(/publish no national total/i);
  });

  test('it shows the as-of date, since every claim is dated', () => {
    expect(page).toMatch(/asOfLabel/);
  });

  test('it states that nothing here is an eligibility decision', () => {
    expect(page).toMatch(/not.*eligibility decision/i);
  });

  test('it distinguishes a blocked request from a dead programme', () => {
    // Conflating the two would misrepresent live programmes as ended.
    const reasons = UNVERIFIED_REASONS.map((r) => r.detail).join(' ');
    expect(reasons).toMatch(/bot protection, not evidence/i);
  });
});

describe('the route is registered everywhere it must be', () => {
  const slug = '/guides/indigenous-business-funding-statistics';

  test.each([
    ['src/App.tsx'],
    ['src/data/routeTitles.ts'],
    ['scripts/prerender.mjs'],
  ])('%s carries the route', (file) => {
    expect(readFileSync(file, 'utf8')).toContain(slug);
  });

  test('the title fits a search result with the site suffix', () => {
    const m = new RegExp(`'${slug}':\\s*'([^']+)'`).exec(
      readFileSync('src/data/routeTitles.ts', 'utf8'),
    );
    expect(m).not.toBeNull();
    expect(m![1].length).toBeLessThanOrEqual(60);
  });
});
