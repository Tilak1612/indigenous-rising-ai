import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Scroll-reveal must never be the reason content is unreachable.
 *
 * [data-reveal] starts at opacity 0 and only becomes visible when the
 * IntersectionObserver adds .irv2-revealed. That is fine as decoration, but
 * it means 25 sections of the homepage depend on JavaScript to be seen, and
 * a visitor who has asked for reduced motion still starts from hidden.
 *
 * The global rule in index.css collapses transition DURATION, which does not
 * help: duration 0 on an element that is still opacity 0 is still invisible.
 */
const css = readFileSync('src/pages/landing-v2.css', 'utf8');
const landing = readFileSync('src/pages/LandingV2.tsx', 'utf8');

describe('reveal animation and reduced motion', () => {
  test('reduced motion makes revealed content unconditionally visible', () => {
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/.exec(css)?.[0] ?? '';
    expect(block, 'no reduced-motion guard for [data-reveal]').not.toBe('');
    expect(block).toContain('[data-reveal]');
    expect(block).toMatch(/opacity:\s*1/);
    expect(block).toMatch(/transform:\s*none/);
  });

  test('the guard targets the reveal selector, not just any element', () => {
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/.exec(css)?.[0] ?? '';
    expect(block).toMatch(/\.irv2-root \[data-reveal\]/);
  });

  test('the observer still has a no-IntersectionObserver fallback', () => {
    // Without this, a browser lacking IO leaves everything at opacity 0.
    expect(landing).toMatch(/if \(!\('IntersectionObserver' in window\)\)/);
    expect(landing).toMatch(/els\.forEach\(\(el\) => el\.classList\.add\('irv2-revealed'\)\)/);
  });

  test('the default (motion-allowed) reveal is still a real transition', () => {
    // The fix must not flatten the animation for everyone else.
    expect(css).toMatch(/\.irv2-root \[data-reveal\] \{[\s\S]*?opacity: 0;/);
    expect(css).toMatch(/transition: opacity \.8s/);
  });
});
