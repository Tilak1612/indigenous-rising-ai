import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LENDER_EQUITY_RULES } from '../lenderEquity';

const page = readFileSync('src/pages/guides/EquityRequirements.tsx', 'utf8');
const packet = readFileSync('docs/review/lender-equity-figures.md', 'utf8');

describe('published lender equity rules', () => {
  test('exactly the five approved rows, each sourced and dated', () => {
    expect(LENDER_EQUITY_RULES).toHaveLength(5);
    for (const r of LENDER_EQUITY_RULES) {
      expect(r.url, r.lender).toMatch(/^https:\/\//);
      expect(r.checkedOn).toMatch(/^2026-\d\d-\d\d$/);
      expect(r.quote.length, r.lender).toBeGreaterThan(20);
    }
  });

  test('every quote appears verbatim in the approved review packet', () => {
    const flat = packet.replace(/\s+/g, ' ');
    for (const r of LENDER_EQUITY_RULES) expect(flat, r.lender).toContain(r.quote);
  });

  test('every percentage in the published copy is in the approved packet', () => {
    for (const r of LENDER_EQUITY_RULES) {
      for (const p of r.summary.match(/\d+%/g) ?? []) expect(packet, `${r.lender}: ${p}`).toContain(p);
    }
  });

  test('the page keeps the illustrative example labelled and says these are each lender’s own rules', () => {
    expect(page).toMatch(/Illustrative arithmetic only/);
    expect(page).toMatch(/each lender&apos;s own rules|each lender's own rules/);
    expect(page).toMatch(/LENDER_EQUITY_RULES\.map/);
  });
});
