import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { BLOG_SOURCES } from '@/data/blogSources';
import { getAllPosts } from '@/data/blogPosts';

/**
 * Blog citations must be real, primary, and on the page.
 *
 * A SearchFit audit on 2026-10-02 found zero external links across all 53 posts,
 * including the ones whose own meta descriptions promise primary-source
 * reporting - "here is what each funder's own page states". For funding advice
 * that is a trust problem, and the main reason an answer engine cites the funder
 * instead of us.
 *
 * The risk in fixing it is the opposite failure: a citation lends a post
 * authority, so a citation that was never checked is worse than none. These
 * assertions hold the line mechanically - sources must be primary, dated,
 * attached to a real post, and visibly rendered before they are declared in
 * structured data.
 */
const posts = getAllPosts();
const slugs = new Set(posts.map((p) => p.slug));

// Hosts we accept as PRIMARY: the funder or the government body itself. Adding
// a source on another host should be a conscious edit to this list, not an
// accident - an aggregator or a blog is not a primary source for a funding rule.
const PRIMARY_HOSTS = [
  'sac-isc.gc.ca',
  'canada.ca',
  'futurpreneur.ca',
  'nacca.ca',
  'bdc.ca',
  'mfcbc.ca',
  'apeetogosan.com',
  'clarencecampeau.com',
  'lrcc.mb.ca',
  'mvdf.ca',
];
const hostOf = (u: string) => new URL(u).hostname.replace(/^www\./, '');

describe('the source data is well formed', () => {
  test('there are entries, or every check below is vacuous', () => {
    expect(Object.keys(BLOG_SOURCES).length).toBeGreaterThanOrEqual(2);
  });

  test('every key is the slug of a real post', () => {
    const orphans = Object.keys(BLOG_SOURCES).filter((k) => !slugs.has(k));
    expect(orphans, `sources for posts that do not exist: ${orphans.join(', ')}`).toEqual([]);
  });

  test.each(Object.entries(BLOG_SOURCES))('%s: every source is complete', (_slug, list) => {
    for (const s of list) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.label.length, `${s.url} has no label`).toBeGreaterThan(10);
      expect(s.supports.length, `${s.url} says nothing about what it supports`).toBeGreaterThan(40);
    }
  });

  test.each(Object.entries(BLOG_SOURCES))('%s: no source is listed twice', (_slug, list) => {
    const urls = list.map((s) => s.url);
    expect(urls.filter((u, i) => urls.indexOf(u) !== i)).toEqual([]);
  });
});

describe('every source is primary and dated', () => {
  const all = Object.entries(BLOG_SOURCES).flatMap(([slug, list]) => list.map((s) => ({ slug, ...s })));

  test('every source is on a primary host', () => {
    const bad = all.filter((s) => !PRIMARY_HOSTS.some((h) => hostOf(s.url) === h || hostOf(s.url).endsWith('.' + h)));
    expect(bad.map((s) => `${s.slug}: ${s.url}`), 'non-primary source').toEqual([]);
  });

  test('every checkedOn is a real date that is not in the future', () => {
    for (const s of all) {
      expect(s.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const d = new Date(s.checkedOn + 'T00:00:00');
      expect(Number.isNaN(d.getTime()), `${s.url} has an invalid date`).toBe(false);
      expect(d.getTime(), `${s.url} is dated in the future`).toBeLessThanOrEqual(Date.now() + 86400000);
    }
  });

  test('a source for an amount-bearing claim says the page was read, not assumed', () => {
    // The ISC page states a Date modified of 2024-04-10; the entry must carry it
    // so a reader can weigh the figure's age rather than assume it is current.
    const isc = all.find((s) => hostOf(s.url) === 'sac-isc.gc.ca');
    expect(isc, 'no ISC source').toBeDefined();
    expect(isc!.supports).toMatch(/last modified/i);
  });
});

describe('the sources are merged onto the posts', () => {
  test.each(Object.keys(BLOG_SOURCES))('%s carries its sources', (slug) => {
    const post = posts.find((p) => p.slug === slug);
    expect(post?.sources?.length, `${slug} lost its sources in the merge`).toBe(BLOG_SOURCES[slug].length);
  });

  test('a post without an entry is not given citations by default', () => {
    const uncited = posts.filter((p) => !(p.slug in BLOG_SOURCES));
    expect(uncited.length).toBeGreaterThan(0);
    for (const p of uncited) expect(p.sources, `${p.slug} has invented sources`).toBeUndefined();
  });
});

describe('the page and the schema agree', () => {
  const page = readFileSync('src/pages/BlogPost.tsx', 'utf8');
  const prerender = readFileSync('scripts/prerender.mjs', 'utf8');

  test('the post page renders a visible Sources section', () => {
    expect(page).toMatch(/id="sources"/);
    expect(page).toMatch(/post\.sources\.map/);
  });

  test('citation is emitted in the schema only when sources exist', () => {
    expect(prerender).toMatch(/citation: post\.sources\.map/);
    expect(prerender).toMatch(/Array\.isArray\(post\.sources\) && post\.sources\.length/);
  });

  test('the dates are formatted from parts, so they cannot slip a day', () => {
    expect(page).toMatch(/new Date\(y, m - 1, d\)/);
    expect(page).not.toMatch(/new Date\(s\.checkedOn\)/);
  });

  test('external citations open safely', () => {
    expect(page).toMatch(/rel="noopener"/);
  });
});

function builtPost(slug: string) {
  const f = `dist/blog/${slug}/index.html`;
  // CI builds first, but locally a stale or absent dist/ must not break collection.
  return existsSync(f) ? readFileSync(f, 'utf8') : '';
}

describe.runIf(existsSync('dist/blog'))('the built posts carry visible, matching citations', () => {
  test.each(Object.keys(BLOG_SOURCES))('%s: Sources are in the HTML and match the schema', (slug) => {
    const html = builtPost(slug);
    expect(html.length, `${slug} was not built`).toBeGreaterThan(0);

    const nodes = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].flatMap((m) => {
      const d = JSON.parse(m[1]);
      return Array.isArray(d) ? d : [d];
    });
    const posting = nodes.find((n) => n && n['@type'] === 'BlogPosting');
    expect(posting, `${slug} has no BlogPosting`).toBeDefined();

    const urls = BLOG_SOURCES[slug].map((s) => s.url);
    expect(posting.citation).toEqual(urls);

    const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
    for (const u of urls) {
      expect(body, `${slug}: ${u} is in the schema but not linked on the page`).toContain(`href="${u}"`);
    }
    expect(body).toContain('id="sources"');
  });

  test('a post with no sources declares no citation', () => {
    const slug = 'indigenous-business-grants-manitoba-2025';
    const html = builtPost(slug);
    if (!html) return;
    expect(html).not.toMatch(/"citation"/);
    expect(html).not.toContain('id="sources"');
  });
});
