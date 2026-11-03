import { describe, expect, it } from 'vitest';
import { formatPostDate, postDateLabel } from '../blogDates';

describe('blog dates', () => {
  it('formats a bare ISO date without shifting it a day', () => {
    expect(formatPostDate('2026-11-03')).toMatch(/3/);
    expect(formatPostDate('2026-11-03')).toMatch(/November/);
  });
  it('labels a reviewed post by its review date', () => {
    expect(postDateLabel({ publishedAt: '2025-01-07', updatedAt: '2026-11-03' })).toMatch(/^Reviewed .*2026/);
    expect(postDateLabel({ publishedAt: '2026-09-28', updatedAt: '2026-09-28' })).toMatch(/^Published .*2026/);
  });
});
