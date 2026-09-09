import { describe, test, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';

const landing = readFileSync('src/pages/LandingV2.tsx', 'utf8');

// The "See it in action" funding and plan tabs are real product screenshots,
// captured from a throwaway sample account. They replaced hand-built mocks —
// the funding one showed invented fit percentages (94%, 88%) attached to real
// programme names, the same fabrication the hero shed in #171. That fix's
// test only policed the hero; this one polices the whole landing page.
describe('the landing page invents no product results', () => {
  test('no hand-built fit percentages anywhere on the page', () => {
    expect(landing).not.toMatch(/\d+% fit/);
    expect(landing).not.toMatch(/fit: '/);
  });

  test('the funding and plan tabs are real screenshots, not rebuilt mocks', () => {
    expect(landing).toMatch(/shot-matches-1024\.(avif|webp|jpg)/);
    expect(landing).toMatch(/shot-plan-1024\.(avif|webp|jpg)/);
  });

  test('both tabs say on screen that a sample account is shown', () => {
    // "Clearly label sample or demonstration data" — the caption is the
    // label, and it must be visible text, not just alt text.
    const captions = landing.match(/shown with a sample account/g) ?? [];
    expect(captions.length).toBeGreaterThanOrEqual(2);
  });
});

describe('the tab screenshot assets are deliverable', () => {
  test('every referenced file exists in every format', () => {
    for (const f of [
      'public/img/shot-matches-1024.avif',
      'public/img/shot-matches-1024.webp',
      'public/img/shot-matches-1024.jpg',
      'public/img/shot-matches-640.webp',
      'public/img/shot-plan-1024.avif',
      'public/img/shot-plan-1024.webp',
      'public/img/shot-plan-1024.jpg',
      'public/img/shot-plan-640.webp',
    ]) {
      expect(statSync(f).size, `${f} is empty`).toBeGreaterThan(5_000);
    }
  });

  test('both screenshots are lazy-loaded with explicit dimensions', () => {
    for (const base of ['shot-matches', 'shot-plan']) {
      const chunk = landing.split('<picture').find((c) => c.includes(base)) ?? '';
      expect(chunk, `${base} picture missing`).not.toBe('');
      expect(chunk).toMatch(/loading="lazy"/);
      expect(chunk).toMatch(/width=\{1024\}/);
      expect(chunk).toMatch(/height=\{860\}/);
    }
  });

  test('narrow screens get the 640px file', () => {
    expect(landing).toMatch(/media="\(max-width: 700px\)"[^>]*shot-matches-640/);
    expect(landing).toMatch(/media="\(max-width: 700px\)"[^>]*shot-plan-640/);
  });

  test('every /img/ path referenced on the landing page exists on disk', () => {
    // Format-level checks above pass as long as ANY format matches, so a
    // single broken filename slipped through a mutation. This closes that:
    // each referenced path must be a real file.
    const refs = [...landing.matchAll(/["'](\/img\/[A-Za-z0-9._-]+)["']/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThanOrEqual(8);
    for (const ref of refs) {
      expect(() => statSync(`public${ref}`), `${ref} referenced but missing on disk`).not.toThrow();
    }
  });
});
