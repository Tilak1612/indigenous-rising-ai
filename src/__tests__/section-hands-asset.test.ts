import { describe, test, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';

const landing = readFileSync('src/pages/LandingV2.tsx', 'utf8');

describe('the hands-and-ledger section visual (Higgsfield plan asset A2)', () => {
  test('every referenced file exists on disk in every format', () => {
    for (const f of [
      'public/img/section-hands-ledger-1600.avif',
      'public/img/section-hands-ledger-1600.webp',
      'public/img/section-hands-ledger-1600.jpg',
      'public/img/section-hands-ledger-640.webp',
    ]) {
      expect(statSync(f).size, `${f} is empty`).toBeGreaterThan(10_000);
    }
  });

  test('the image is lazy-loaded with explicit dimensions (no layout shift)', () => {
    const img = /<img\s[^>]*section-hands-ledger[^>]*>/s.exec(landing)?.[0] ?? '';
    expect(img).toMatch(/loading="lazy"/);
    expect(img).toMatch(/width=\{1600\}/);
    expect(img).toMatch(/height=\{1194\}/);
  });

  test('AVIF is offered before WebP, JPEG is the <img> fallback', () => {
    // Split on <picture so the match can't drift into an earlier picture
    // block and pass on someone else's AVIF source.
    const pic = landing
      .split('<picture')
      .find((chunk) => chunk.includes('section-hands-ledger')) ?? '';
    const avif = pic.indexOf('image/avif');
    const webp = pic.indexOf('type="image/webp" srcSet="/img/section-hands-ledger-1600.webp"');
    expect(avif).toBeGreaterThan(-1);
    expect(webp).toBeGreaterThan(avif);
    expect(pic).toMatch(/src="\/img\/section-hands-ledger-1600\.jpg"/);
  });

  test('narrow screens get the small file, not the 1600px one', () => {
    expect(landing).toMatch(/media="\(max-width: 920px\)"[^>]*section-hands-ledger-640/);
  });

  test('alt text describes the scene and never claims a person or nation', () => {
    const alt = /alt="([^"]*ledger[^"]*)"/.exec(landing)?.[1] ?? '';
    expect(alt.length).toBeGreaterThan(20);
    // Track B rule: no generated people presented as anyone.
    expect(alt).not.toMatch(/entrepreneur|founder|customer|Indigenous|Nation member/i);
  });
});
