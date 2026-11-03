import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FUNDING_PATHS, PATH_DETAILS } from '../fundingPaths';

const page = readFileSync('src/pages/guides/ChoosingFunding.tsx', 'utf8');

describe('business or community funding paths', () => {
  test('every path quotes an official ISC page and is dated', () => {
    for (const p of FUNDING_PATHS) {
      expect(p.url, p.id).toMatch(/^https:\/\/www\.sac-isc\.gc\.ca\/eng\//);
      expect(p.checkedOn).toMatch(/^2026-\d\d-\d\d$/);
      expect(p.quote.length, p.id).toBeGreaterThan(40);
      expect(p.next.to).toMatch(/^\//);
    }
  });

  test('the page never decides eligibility for the reader', () => {
    expect(page).toMatch(/only the\s+funder can decide/);
    expect(JSON.stringify(FUNDING_PATHS) + JSON.stringify(PATH_DETAILS)).not.toMatch(/you (are|will be) eligible|guaranteed/i);
  });

  test('community programmes are not presented as open to Métis communities', () => {
    for (const p of FUNDING_PATHS.filter((x) => x.id.startsWith('community'))) expect(p.quote).toMatch(/First Nation(s)? and Inuit/);
    expect(page).toMatch(/If you are Métis/);
  });
});
