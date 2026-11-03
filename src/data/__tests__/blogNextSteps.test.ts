import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BLOG_NEXT_STEPS } from '../blogNextSteps';
import { ROUTE_TITLES } from '../routeTitles';

const posts = readFileSync('src/data/blogPosts.ts', 'utf8') + readFileSync('src/data/blogPostsExtra.ts', 'utf8');

describe('blog next steps', () => {
  test('every key is a real blog post slug', () => {
    for (const slug of Object.keys(BLOG_NEXT_STEPS)) {
      expect(posts.includes(`"${slug}"`) || posts.includes(`'${slug}'`), slug).toBe(true);
    }
  });

  test('every target is a prerendered marketing route', () => {
    for (const steps of Object.values(BLOG_NEXT_STEPS)) {
      for (const s of steps) expect(ROUTE_TITLES[s.to], s.to).toBeTruthy();
    }
  });

  test('the post page renders them', () => {
    const page = readFileSync('src/pages/BlogPost.tsx', 'utf8');
    expect(page).toMatch(/BLOG_NEXT_STEPS\[/);
  });
});
