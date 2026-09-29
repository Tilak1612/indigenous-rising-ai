import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { getAllPosts } from '@/data/blogPosts';

/**
 * Blog content must survive the template literal it lives in.
 *
 * A post was appended with `${N}` as a stand-in for a newline. Python wrote it
 * literally, so the TypeScript template literal contained a real `${N}`
 * interpolation of an identifier that does not exist. `tsc --noEmit` exited 0
 * and the whole thing looked fine — the failure only appeared in the build,
 * where the module threw on load and the prerender silently wrote
 * "24 marketing + 0 blog" instead of 57 blog files.
 *
 * Silently dropping every blog page from the sitemap is about as bad as an SEO
 * regression gets, and nothing in the suite would have caught it, so:
 *
 *   1. assert the posts actually load and there are a plausible number of them;
 *   2. assert no post body carries an unresolved interpolation.
 *
 * AGENTS.md already bans nested backticks in template literals for the same
 * family of reasons. This is the assertion form of that rule.
 */
describe('blog posts load and render as text', () => {
  const posts = getAllPosts();

  test('the posts load, and there are enough of them to be the real set', () => {
    // If the module ever throws on load this fails loudly rather than the
    // prerender quietly emitting zero blog files.
    expect(posts.length).toBeGreaterThanOrEqual(50);
  });

  test('no post body contains an unresolved ${...} interpolation', () => {
    const offenders: string[] = [];
    for (const p of posts) {
      const bodies = [p.introduction, p.cta, ...p.sections.map((s) => s.content)];
      for (const body of bodies) {
        if (typeof body === 'string' && /\$\{/.test(body)) {
          offenders.push(`${p.slug}: ${/\$\{[^}]*\}/.exec(body)?.[0]}`);
        }
      }
    }
    expect(offenders, `unresolved interpolation: ${offenders.join(', ')}`).toEqual([]);
  });

  test('no post body contains a literal backslash-n that should have been a newline', () => {
    // A double-escaped newline renders as the characters \n on the page.
    const offenders = posts
      .filter((p) => /\\n/.test(p.introduction) || p.sections.some((s) => /\\n/.test(s.content)))
      .map((p) => p.slug);
    expect(offenders, `literal \\n in: ${offenders.join(', ')}`).toEqual([]);
  });

  test('every post has a slug, a title and at least one section', () => {
    for (const p of posts) {
      expect(p.slug, 'a post has no slug').toBeTruthy();
      expect(p.title, `${p.slug} has no title`).toBeTruthy();
      expect(p.sections.length, `${p.slug} has no sections`).toBeGreaterThan(0);
    }
  });

  test('slugs are unique', () => {
    const slugs = posts.map((p) => p.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    expect(dupes, `duplicate slugs: ${dupes.join(', ')}`).toEqual([]);
  });

  test('every relatedPosts id refers to a post that exists', () => {
    const ids = new Set(posts.map((p) => p.id));
    const broken: string[] = [];
    for (const p of posts) {
      for (const r of p.relatedPosts ?? []) if (!ids.has(r)) broken.push(`${p.slug} -> ${r}`);
    }
    expect(broken, `dangling relatedPosts: ${broken.join(', ')}`).toEqual([]);
  });
});

describe('the prerender emits the blog', () => {
  test('the build script still writes blog routes, not just marketing', () => {
    // The regression showed up in this line of build output. Pin the code path
    // that produces blog files so a silent drop to zero is not possible again
    // without this failing.
    const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
    expect(prerender).toMatch(/blog/i);
    expect(prerender).toMatch(/getAllPosts|blogPosts/);
  });
});
