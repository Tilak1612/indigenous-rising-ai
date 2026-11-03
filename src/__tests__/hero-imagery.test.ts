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
  test('both art-directed sources exist in avif, webp and jpeg', () => {
    // AVIF is the smallest by a wide margin and must be offered: 12K/8K
    // against WebP's 20K/12K and JPEG's 100K/52K.
    for (const base of ['sovereignty-land-desktop', 'sovereignty-land-mobile']) {
      for (const ext of ['avif', 'webp', 'jpg']) {
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
    // Anchored on this section's own source. There are now two <picture>
    // blocks on the page and the first one is the hero screenshot, which
    // correctly has real alt text — so indexOf('<picture>') tested the
    // wrong element.
    const at = page.indexOf('sovereignty-land-mobile');
    const block = page.slice(page.lastIndexOf('<picture>', at), page.indexOf('</picture>', at));
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
    // Anchored after the sovereignty image, the same way the CTA test is:
    // matching the first rgba(36,25,16,…) in the whole file broke when an
    // unrelated box-shadow using that colour landed earlier in the page.
    const after = page.slice(page.indexOf('sovereignty-land-desktop.jpg'));
    const m = /rgba\(36,25,16,\.(\d+)\)/.exec(after);
    expect(m, 'the scrim over the sovereignty image is gone').not.toBeNull();
    expect(Number('0.' + m![1])).toBeGreaterThanOrEqual(0.88);
  });
});

describe('the hero product frame holds the real product', () => {
  test('the live funding finder replaced the screenshot, and no invented score came back', () => {
    // What stood here first invented match scores — 94%, 88%, 81% — and
    // attached them to real programme names; then a static screenshot of
    // the real page. Now the frame holds the product itself: a finder that
    // reads the public catalogue, so every number is the database's.
    expect(page).toMatch(/<FundingFinder \/>/);
    expect(page).not.toMatch(/shot-funding-1280/);
    expect(page, 'invented match scores are back').not.toMatch(/pct: '\d+%'/);
    expect(page, 'an invented programme count is back')
      .not.toMatch(/\d+ programs match your profile/);
  });

  test('the finder reads the catalogue and never asserts eligibility', () => {
    const finder = readFileSync('src/components/landing/FundingFinder.tsx', 'utf8');
    expect(finder).toMatch(/fetchPrograms\(/);
    expect(finder).toMatch(/formatFreshness\(/);
    expect(finder).toMatch(/Only the funder decides eligibility/);
    expect(finder).not.toMatch(/\d+%\s*match/i);
    // The frame label must not claim a hosted app that does not exist.
    expect(page).not.toMatch(/app\.indigenousrising\.ai/);
  });
});

describe('final CTA band', () => {
  test('both art-directed sources exist in all three formats', () => {
    for (const base of ['cta-prairie-desktop', 'cta-prairie-mobile']) {
      for (const ext of ['avif', 'webp', 'jpg']) {
        expect(existsSync(`public/img/${base}.${ext}`), `${base}.${ext} missing`).toBe(true);
      }
    }
  });

  test('AVIF is offered first, being the smallest', () => {
    // Slice the WHOLE <picture>, not from the first filename match — that
    // started mid-attribute and put the mobile avif behind the cursor.
    const at = page.indexOf('cta-prairie-mobile');
    const block = page.slice(page.lastIndexOf('<picture>', at), page.indexOf('</picture>', at));
    const avif = block.indexOf('image/avif');
    const webp = block.indexOf('image/webp');
    expect(avif).toBeGreaterThan(-1);
    expect(avif, 'webp is listed before avif, so avif never wins').toBeLessThan(webp);
  });

  test('the CTA scrim is deep enough over the brightest pixel', () => {
    // Measured at .86: heading 7.07/6.61, body 6.10/5.71.
    // Anchored after the CTA image: the file also contains decorative
    // rgba(18,76,59,.12) blurs, and the loose regex matched one of those.
    const after = page.slice(page.indexOf('cta-prairie-desktop.jpg'));
    const m = /rgba\(18,76,59,\.(\d+)\)/.exec(after);
    expect(m, 'the scrim over the CTA image is gone').not.toBeNull();
    expect(Number('0.' + m![1])).toBeGreaterThanOrEqual(0.86);
  });
});

describe('every backdrop offers AVIF first', () => {
  test('no <picture> lists webp ahead of avif', () => {
    // Source order decides the winner: a webp listed first is always taken
    // and the avif never used, silently wasting the smaller file.
    const blocks = page.split('<picture>').slice(1).map((b) => b.split('</picture>')[0]);
    expect(blocks.length).toBeGreaterThanOrEqual(3);
    for (const b of blocks) {
      // Presence first. Skipping blocks without avif meant deleting every
      // avif <source> passed this test — it only policed ordering.
      if (b.includes('image/webp')) {
        expect(b, 'a <picture> offers webp but no avif').toContain('image/avif');
      }
      if (!b.includes('image/avif')) continue;
      const perMedia = b.split('<source').filter((x) => x.includes('type="image/'));
      const seenWebpBeforeAvif = /image\/webp[\s\S]*?image\/avif/.test(
        perMedia.filter((x) => x.includes('max-width')).join(''),
      );
      expect(seenWebpBeforeAvif, 'webp precedes avif in a media branch').toBe(false);
    }
  });
});
