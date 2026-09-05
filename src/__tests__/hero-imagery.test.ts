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
    const m = /rgba\(36,25,16,\.(\d+)\)/.exec(page);
    expect(m, 'the scrim over the sovereignty image is gone').not.toBeNull();
    expect(Number('0.' + m![1])).toBeGreaterThanOrEqual(0.88);
  });
});

describe('the hero product mockup shows the real product', () => {
  test('a real screenshot replaced the hand-built mock', () => {
    // What stood here invented match scores — 94%, 88%, 81% — and attached
    // them to real programme names. A fabricated business result on the
    // most-seen surface of the site.
    expect(page).toMatch(/shot-funding-1280\.(avif|webp|jpg)/);
    expect(page, 'invented match scores are back').not.toMatch(/pct: '\d+%'/);
    expect(page, 'an invented programme count is back')
      .not.toMatch(/\d+ programs match your profile/);
  });

  test('the screenshot is described, not decorative', () => {
    // It carries information (what the product actually looks like), so
    // unlike the backdrops it needs real alt text.
    const block = page.slice(page.indexOf('shot-funding-640'), page.indexOf('shot-funding-640') + 1400);
    expect(block).toMatch(/alt="The funding page of Indigenous Rising AI[^"]+"/);
    expect(block).not.toMatch(/alt=""/);
  });

  test('a tighter crop is served on phones rather than shrinking it', () => {
    // A 1280-wide screenshot scaled into a 320px column is unreadable.
    expect(page).toMatch(/media="\(max-width: 767px\)"[\s\S]{0,120}shot-funding-640\.webp/);
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
