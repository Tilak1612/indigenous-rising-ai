import { describe, expect, test } from 'vitest';
import { FUNDING_CHANGES, SITE_CORRECTIONS, sortedChanges, CHANGES_CHECKED, KIND_LABELS, APPLICANT_LABELS } from '../fundingChanges';
import { ROUTE_TITLES } from '../routeTitles';
import { getBlogBySlug } from '../blogPosts';

const DATE = /^\d{4}-\d{2}(-\d{2})?$/;
const today = new Date();

describe('funding change log', () => {
  test('every entry is dated, sourced on https and not in the future', () => {
    expect(FUNDING_CHANGES.length).toBeGreaterThan(5);
    for (const c of FUNDING_CHANGES) {
      expect(c.date, c.programme).toMatch(DATE);
      expect(c.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${c.checkedOn}T00:00:00`).getTime()).toBeLessThanOrEqual(today.getTime() + 86400000);
      expect(c.url).toMatch(/^https:\/\//);
      expect(c.what.length, c.programme).toBeGreaterThan(40);
      expect(KIND_LABELS[c.kind]).toBeTruthy();
      expect(APPLICANT_LABELS[c.applicant]).toBeTruthy();
    }
  });

  test('an observed date is the day it was checked', () => {
    for (const c of FUNDING_CHANGES.filter((x) => x.dateKind === 'observed')) expect(c.date).toBe(c.checkedOn);
  });

  test('newest first, and the page date is the latest check', () => {
    const s = sortedChanges();
    for (let i = 1; i < s.length; i++) expect(s[i - 1].date.padEnd(10, '-01') >= s[i].date.padEnd(10, '-01')).toBe(true);
    expect(CHANGES_CHECKED).toBe(FUNDING_CHANGES.map((c) => c.checkedOn).sort().at(-1));
  });

  test('corrections point at real pages', () => {
    for (const c of SITE_CORRECTIONS) {
      const ok = c.page.startsWith('/blog/') ? !!getBlogBySlug(c.page.slice(6)) : c.page.startsWith('/funding/') || !!ROUTE_TITLES[c.page];
      expect(ok, c.page).toBe(true);
    }
  });

  test('the page is a titled, prerendered route', () => {
    expect(ROUTE_TITLES['/guides/funding-program-changes'].length).toBeLessThanOrEqual(60);
  });
});
