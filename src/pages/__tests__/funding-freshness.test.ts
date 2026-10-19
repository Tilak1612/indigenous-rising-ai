import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { formatFreshness } from '@/lib/funding-freshness';

/**
 * The public Funding Navigator showed programme amounts and eligibility with no
 * indication of when — or whether — any of it had been checked.
 *
 * CLAUDE.md is explicit: "Keep program source links and freshness dates visible
 * ... stale funding data must be labelled, never silently shown as current."
 * The page already selected '*', so last_verified and verification_status were
 * in hand and simply not rendered.
 *
 * It matters at this specific moment because only 2 of 17 published programmes
 * carry a verified date. Rendering nothing made all 17 read as current.
 */
describe('formatFreshness', () => {
  test('a verified programme says when it was checked', () => {
    const r = formatFreshness({ last_verified: '2026-09-26', verification_status: 'needs_review' });
    expect(r.verified).toBe(true);
    expect(r.text).toContain('Details last verified');
    expect(r.text).toMatch(/2026/);
  });

  test('an unverified programme says so instead of staying silent', () => {
    const r = formatFreshness({ last_verified: null, verification_status: 'unverified' });
    expect(r.verified).toBe(false);
    expect(r.text).toMatch(/not yet verified/i);
    expect(r.text).toMatch(/confirm with the funder/i);
  });

  test('a null date is never rendered as a date', () => {
    expect(formatFreshness({ last_verified: null, verification_status: null }).text)
      .not.toMatch(/\d{4}/);
  });

  test('an unparseable date falls back to the raw value rather than "Invalid Date"', () => {
    const r = formatFreshness({ last_verified: 'not-a-date', verification_status: null });
    expect(r.text).not.toMatch(/Invalid Date/);
    expect(r.text).toContain('not-a-date');
  });

  test('the date is read as local, so it cannot slip a day across timezones', () => {
    // new Date('2026-09-26') parses as UTC midnight and renders as the 25th in
    // any negative-offset timezone, which is most of Canada.
    //
    // Asserted two ways on purpose. The behavioural check below only reproduces
    // the bug when the runner is NOT on UTC, and CI may well be — an earlier
    // version of this test used toContain('26'), which "2026" satisfies no
    // matter which day rendered, so it passed against the broken parse. The
    // structural check catches the regression in every timezone.
    const text = formatFreshness({ last_verified: '2026-09-26', verification_status: null }).text;
    expect(text).toMatch(/\b26\b/);
    expect(text).not.toMatch(/\b25\b/);

    expect(
      readFileSync('src/lib/funding-freshness.ts', 'utf8'),
      'the date must be parsed as local midnight',
    ).toMatch(/new Date\(g\.last_verified \+ 'T00:00:00'\)/);
  });
});

describe('the page actually renders it', () => {
  const page = readFileSync('src/pages/PublicFunding.tsx', 'utf8');

  test('every card computes and shows freshness', () => {
    expect(page).toMatch(/const freshness = formatFreshness\(grant\)/);
    expect(page).toMatch(/\{freshness\.text\}/);
  });

  test('the columns it needs are part of the Grant type', () => {
    expect(page).toMatch(/last_verified: string \| null/);
    expect(page).toMatch(/verification_status: string \| null/);
  });

  test('an unverified programme is visually distinct, not just differently worded', () => {
    expect(page).toMatch(/freshness\.verified \?/);
    expect(page).toMatch(/amber/);
  });
});
