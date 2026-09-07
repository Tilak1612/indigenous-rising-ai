import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * The landing page paints from named tokens, not repeated hex literals.
 *
 * It carried 197 hardcoded hex values across 35 colours — the same green
 * appeared 47 times and could drift 47 ways. The tokens hold the exact
 * values that were already in use, so the render is unchanged; they simply
 * have one definition each now.
 *
 * Proven visually rather than assumed: the page was screenshotted at
 * 320/375/390/768/1024/1440/1920 before and after. Both runs differ by a
 * few thousand pixels at a max channel delta of ~20 — but capturing the
 * SAME build twice differs by the same amount (10,949px / max 9 at 320;
 * 56,690px / max 10 at 1440). That is gradient dithering, not a change.
 * Without that control the diff reads as a regression, which is what it
 * looked like at first.
 */
const css = readFileSync('src/pages/landing-v2.css', 'utf8');
const page = readFileSync('src/pages/LandingV2.tsx', 'utf8');

const REPEATED = [
  ['--ir-green', '#124C3B'],
  ['--ir-ink', '#111111'],
  ['--ir-bark', '#6B5645'],
  ['--ir-stone', '#5C554B'],
  ['--ir-cream', '#F5F0E8'],
  ['--ir-paper', '#FFFDF9'],
];

describe('landing palette tokens', () => {
  test('every repeated colour has exactly one definition', () => {
    for (const [name, value] of REPEATED) {
      const defs = [...css.matchAll(new RegExp(`${name}\\s*:`, 'g'))];
      expect(defs, `${name} is defined ${defs.length} times`).toHaveLength(1);
      expect(css, `${name} does not hold ${value}`).toMatch(
        new RegExp(`${name}:\\s*${value}`, 'i'),
      );
    }
  });

  test('the page no longer repeats those colours as literals', () => {
    for (const [name, value] of REPEATED) {
      const literals = [...page.matchAll(new RegExp(value, 'gi'))];
      expect(literals, `${value} is still hardcoded (use ${name})`).toHaveLength(0);
    }
  });

  test('the page actually references the tokens', () => {
    const refs = [...page.matchAll(/var\(--ir-[a-z-]+\)/g)];
    expect(refs.length, 'the page stopped using tokens').toBeGreaterThan(150);
  });

  test('--ir-green is the same colour as --primary', () => {
    // index.css defines --primary: 162 62% 27%, which IS #124C3B. If these
    // ever disagree the landing page and the app would paint two greens.
    expect(css).toMatch(/--ir-green:\s*#124C3B/i);
    expect(readFileSync('src/index.css', 'utf8')).toMatch(/--primary:\s*162 62% 27%/);
  });

  test('one-off colours are left alone', () => {
    // Tokenising a value used once adds a layer of indirection and buys
    // nothing. Only colours that repeat are worth a name.
    const remaining = [...page.matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0].toUpperCase());
    const counts = remaining.reduce<Record<string, number>>((a, c) => ((a[c] = (a[c] ?? 0) + 1), a), {});
    const repeatedLeft = Object.entries(counts).filter(([, n]) => n > 2);
    expect(repeatedLeft, 'these colours repeat enough to deserve a token').toEqual([]);
  });
});
