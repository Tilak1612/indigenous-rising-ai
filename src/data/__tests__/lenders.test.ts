import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LENDERS, NACCA_LISTINGS_URL } from '../lenders';
import { PROVINCES } from '@/lib/funding-catalog';

const snapshot = JSON.parse(readFileSync('scripts/data/funding-snapshot.json', 'utf8')) as { rows: { slug: string }[] };
const published = new Set(snapshot.rows.map((r) => r.slug));
const codes = new Set<string>(PROVINCES.map((p) => p.code));

describe('lender directory data', () => {
  test('every programme link points at a published programme page', () => {
    const dead = LENDERS.filter((l) => l.programme && !published.has(l.programme.slug)).map((l) => l.slug);
    expect(dead, 'lenders linked to an unpublished or missing programme').toEqual([]);
  });

  test('regions are real province or territory codes', () => {
    const bad = LENDERS.flatMap((l) => l.regions.filter((r) => !codes.has(r)).map((r) => `${l.slug}:${r}`));
    expect(bad).toEqual([]);
  });

  test('every website is an https URL and slugs are unique', () => {
    for (const l of LENDERS) expect(l.website, l.slug).toMatch(/^https:\/\//);
    expect(new Set(LENDERS.map((l) => l.slug)).size).toBe(LENDERS.length);
  });

  test('the page names NACCA as the authority above the list', () => {
    const page = readFileSync('src/pages/LenderDirectory.tsx', 'utf8');
    expect(NACCA_LISTINGS_URL).toMatch(/^https:\/\/nacca\.ca\//);
    const nacca = page.indexOf('NACCA_LISTINGS_URL');
    const list = page.indexOf('visible.map');
    expect(nacca).toBeGreaterThan(-1);
    expect(nacca).toBeLessThan(list);
  });
});
