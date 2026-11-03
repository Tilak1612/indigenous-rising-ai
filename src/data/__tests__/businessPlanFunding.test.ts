import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PLAN_SUPPORT, PLAN_HELP_ONLY } from '../businessPlanFunding';
import { PROVINCES } from '@/lib/funding-catalog';

const codes = new Set<string>(PROVINCES.map((p) => p.code));
const page = readFileSync('src/pages/guides/BusinessPlanFunding.tsx', 'utf8');

describe('business plan funding sources', () => {
  test('every entry cites an https page, a check date and a verbatim extract', () => {
    for (const p of [...PLAN_SUPPORT]) {
      expect(p.url, p.institution).toMatch(/^https:\/\//);
      expect(p.checkedOn, p.institution).toMatch(/^2026-\d\d-\d\d$/);
      expect(p.quote.length, p.institution).toBeGreaterThan(20);
      for (const r of p.regions) expect(codes.has(r), `${p.institution}:${r}`).toBe(true);
    }
    for (const h of PLAN_HELP_ONLY) expect(h.url).toMatch(/^https:\/\//);
  });

  test('a percentage appears only where the institution publishes one', () => {
    for (const p of PLAN_SUPPORT) {
      if (p.share) expect(p.quote, `${p.institution} share without a quoted figure`).toMatch(/\d+%/);
      else expect(p.published, p.institution).toMatch(/No share (for the plan itself )?is published/);
    }
  });

  test('the page never states 75 percent as a general rule', () => {
    expect(page).toMatch(/not a general rule/i);
    expect(page).not.toMatch(/funders (usually|typically|generally) (pay|cover)/i);
  });
});
