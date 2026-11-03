import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { PROGRAM_GUIDES } from '../programGuides';
import { getBlogBySlug } from '../blogPosts';

describe('programme guides', () => {
  test('every guide is a real blog post', () => {
    for (const guides of Object.values(PROGRAM_GUIDES)) {
      for (const g of guides) expect(getBlogBySlug(g.slug), g.slug).toBeTruthy();
    }
  });

  test('each article links back to its programme page', () => {
    for (const [program, guides] of Object.entries(PROGRAM_GUIDES)) {
      const post = getBlogBySlug(guides[0].slug)!;
      const body = [post.introduction, ...post.sections.map((s) => s.content)].join('\n');
      expect(body, guides[0].slug).toContain(`(/funding/${program})`);
    }
  });

  test('the programme page renders them', () => {
    expect(readFileSync('src/pages/FundingProgram.tsx', 'utf8')).toMatch(/PROGRAM_GUIDES\[/);
  });
});
