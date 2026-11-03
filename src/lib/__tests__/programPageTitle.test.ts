import { describe, test, expect } from 'vitest';
import { programPageTitle } from '../funding-catalog';

describe('programme page titles', () => {
  test('short names keep the site suffix', () => {
    expect(programPageTitle({ name: 'BDC Indigenous Entrepreneur Loan' })).toBe('BDC Indigenous Entrepreneur Loan | Indigenous Rising AI');
  });

  test('a name that fits alone drops the suffix instead of being cut', () => {
    expect(programPageTitle({ name: 'Indigenous Entrepreneur Startup Program' })).toBe('Indigenous Entrepreneur Startup Program');
  });

  test('a name over 60 characters is cut at a word boundary', () => {
    const name = 'Northern Indigenous Economic Opportunities Program Business Development Stream';
    const t = programPageTitle({ name });
    expect(t.length).toBeLessThanOrEqual(60);
    expect(t.endsWith('\u2026')).toBe(true);
    const kept = t.slice(0, -1);
    expect(name.startsWith(kept)).toBe(true);
    expect(name[kept.length]).toBe(' ');
  });
});
