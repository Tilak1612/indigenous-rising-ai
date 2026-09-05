import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';

/**
 * The sovereignty section's background image.
 *
 * Decorative, so it carries an empty alt and aria-hidden — it states nothing
 * the heading does not. Art-directed rather than cropped: the 16:9 desktop
 * frame loses the treeline entirely at phone widths, so the vertical
 * composition is a separate source.
 *
 * The contrast numbers below were measured against the BRIGHTEST pixel in
 * each image, not the average — the eyebrow text has to survive the lightest
 * patch of sky it can sit over, and an average would have hidden that.
 */
const page = readFileSync('src/pages/LandingV2.tsx', 'utf8');

describe('sovereignty background imagery', () => {
  test('both art-directed sources exist in webp and jpeg', () => {
    for (const base of ['sovereignty-land-desktop', 'sovereignty-land-mobile']) {
      for (const ext of ['webp', 'jpg']) {
        const p = `public/img/${base}.${ext}`;
        expect(existsSync(p), `${p} is missing`).toBe(true);
        // A background that outweighs the page defeats the point.
        expect(statSync(p).size, `${p} is too heavy`).toBeLessThan(200_000);
      }
    }
  });

  test('the mobile source is served below 768px, not a crop of desktop', () => {
    expect(page).toMatch(/media="\(max-width: 767px\)"[\s\S]{0,200}sovereignty-land-mobile\.webp/);
    expect(page).toMatch(/sovereignty-land-desktop\.webp/);
  });

  test('it is decorative, lazy, and reserves its space', () => {
    const block = page.slice(page.indexOf('<picture>'), page.indexOf('</picture>'));
    expect(block).toMatch(/alt=""/);
    expect(block).toMatch(/aria-hidden="true"/);
    expect(block).toMatch(/loading="lazy"/);
    // Explicit dimensions prevent layout shift — but they must be on the
    // <img>, which is the element that occupies layout. A <source> also
    // carries them, so asserting on the whole <picture> block passed while
    // the <img> had none.
    const imgTag = /<img[\s\S]*?\/>/.exec(block)?.[0] ?? '';
    expect(imgTag, 'no <img> inside <picture>').not.toBe('');
    expect(imgTag).toMatch(/width=\{1920\}/);
    expect(imgTag).toMatch(/height=\{1080\}/);
  });

  test('the scrim is deep enough for WCAG AA over the brightest pixel', () => {
    // Measured: at .88 the eyebrow clears 4.5 on both sources (5.04 desktop,
    // 5.40 mobile). At .82 it was 4.68 — passing, but with no headroom.
    const m = /rgba\(36,25,16,\.(\d+)\)/.exec(page);
    expect(m, 'the scrim over the sovereignty image is gone').not.toBeNull();
    expect(Number('0.' + m![1])).toBeGreaterThanOrEqual(0.88);
  });
});
