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
    expect(nav).toMatch(/!isOpen \? \{ inert/);
  });

  test('it uses the string form React 18 actually renders', () => {
    // React 18 DROPS unknown boolean attributes: inert={true} never reached
    // the DOM. Measured: inert:false on a closed menu with six tabbable
    // links. An empty string renders the attribute. React 19 supports it
    // natively — revisit when this project upgrades.
    expect(nav).toMatch(/inert: '' as unknown as boolean/);
    expect(nav, 'the boolean form is silently dropped by React 18')
      .not.toMatch(/inert=\{!isOpen\}/);
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
