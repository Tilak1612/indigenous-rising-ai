import { describe, test, expect } from 'vitest';
import { REGIONAL_SUPPORTS, REGIONAL_CHECKED } from '../regionalSupports';
import { PROVINCES } from '@/lib/funding-catalog';

const sections = Object.entries(REGIONAL_SUPPORTS);

describe('regional lenders and supports', () => {
  test('keys are real region page slugs', () => {
    const slugs = PROVINCES.map((p) => p.slug);
    for (const [slug] of sections) expect(slugs, slug).toContain(slug);
    expect(REGIONAL_CHECKED).toMatch(/^2026-\d\d-\d\d$/);
  });

  test('every item links to an official https page and quotes it', () => {
    for (const [slug, s] of sections) {
      expect(s.items.length, slug).toBeGreaterThanOrEqual(4);
      for (const it of s.items) {
        expect(it.url, it.name).toMatch(/^https:\/\//);
        expect(it.offers.length, it.name).toBeGreaterThan(0);
      }
    }
  });

  test('general programmes say they are not Indigenous-specific', () => {
    const general = ['Economic Development Fund', 'Prosper NWT', 'SEED', 'Nunavut Business Credit', 'Business Development Program', 'Supplier Diversity'];
    for (const [, s] of sections) {
      for (const it of s.items.filter((x) => general.some((g) => x.name.includes(g)))) {
        expect(it.note, it.name).toMatch(/not (Indigenous|Inuit)-specific|not an Indigenous-specific/);
      }
    }
  });

  test('lenders open to everyone are labelled as such', () => {
    const open = ['Akaitcho', 'Thebacha', 'Baffin', 'Kitikmeot Community Futures', 'Kivalliq Business'];
    for (const [, s] of sections) {
      for (const it of s.items.filter((x) => open.some((o) => x.name.includes(o)))) {
        expect(it.note, it.name).toMatch(/not (only Indigenous|Indigenous-only|Inuit-only)|wider business community/i);
      }
    }
  });

  test('stale or support-only items are never presented as funding', () => {
    const all = JSON.stringify(REGIONAL_SUPPORTS);
    expect(all).not.toMatch(/COVID-19 Business Relief|Emergency Loan Program/);
    for (const [, s] of sections) for (const it of s.items.filter((x) => /Registry|Chamber/.test(x.name))) expect(it.kind).toBe('support');
  });
});
