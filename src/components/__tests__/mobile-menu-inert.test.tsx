import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * The closed mobile menu must not be in the tab order.
 *
 * It collapses with max-height and opacity so it can animate, which leaves
 * it in the layout. Measured on the live site at 375px: all five nav links
 * kept full 343x48 boxes with tabIndex 0 while invisible, so a keyboard
 * user tabbed through five links they could not see before reaching the
 * page. `max-h-0` with `overflow-hidden` hides them visually and does
 * nothing for focus.
 *
 * `inert` removes them from focus AND hit-testing without breaking the
 * transition; `display:none` would kill the animation.
 *
 * Verified in a real browser after the fix:
 *   closed  tab order = skip link, chat, logo, Open menu, page content
 *           (the five links are gone), and elementFromPoint no longer
 *           reaches them
 *   open    Enter on the toggle then Tab reaches Platform, How it works,
 *           Sovereignty, Pricing, FAQ, Start free account in order
 */
const nav = readFileSync('src/components/Navigation.tsx', 'utf8');

describe('closed mobile menu is inert', () => {
  test('the panel receives inert when closed', () => {
    expect(nav, 'the mobile panel never sets inert').toMatch(/inert/);
    // Applied only while closed — an always-inert menu could never be used.
    expect(nav).toMatch(/inert=\{!isOpen\}/);
  });

  test('it uses the boolean form React 19 actually renders', () => {
    // React 19 treats an empty-string boolean attribute as false. The React 18
    // workaround (`inert: ''`) would leave the closed menu focusable.
    expect(nav).toMatch(/inert=\{!isOpen\}/);
    expect(nav).not.toMatch(/inert:\s*''/);
  });

  test('it is also hidden from assistive tech when closed', () => {
    expect(nav).toMatch(/aria-hidden=\{!isOpen\}/);
  });

  test('the visual collapse is still animated, not display:none', () => {
    // display:none would fix focus but kill the transition; inert is what
    // lets both hold at once.
    expect(nav).toMatch(/transition-all/);
    expect(nav).toMatch(/max-h-0 opacity-0/);
  });
});
