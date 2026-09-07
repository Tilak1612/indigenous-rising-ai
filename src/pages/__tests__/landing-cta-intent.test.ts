import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { signupHref } from '@/lib/signup-intent';

/**
 * The homepage's pricing cards must reach the SIGN-UP form with the chosen
 * plan attached.
 *
 * They pointed at /auth, which defaults to sign-IN, and carried no plan. So
 * "Start free account" on a pricing card put a brand new visitor on a login
 * form and forgot which plan they clicked — the P0-0 defect. It was fixed in
 * PricingSection.tsx, but this page carries its own pricing block that
 * nobody updated, and the homepage is where most people see pricing first.
 *
 * Confirmed live before the fix: three CTAs resolved to /auth.
 */
const page = readFileSync('src/pages/LandingV2.tsx', 'utf8');

const ctaBlock = () => {
  const i = page.indexOf('const cta = {');
  expect(i, 'the pricing CTA map moved').toBeGreaterThan(-1);
  return page.slice(i, page.indexOf('}[p.key]', i));
};

describe('homepage pricing CTAs preserve signup intent', () => {
  test('no paid or free plan CTA points at the sign-in route', () => {
    const block = ctaBlock();
    const authLinks = [...block.matchAll(/to: '\/auth'/g)];
    expect(authLinks, 'a plan CTA still lands on the sign-in form').toHaveLength(0);
  });

  test('each plan CTA is built with signupHref and names its plan', () => {
    const block = ctaBlock();
    for (const plan of ['Maadaadiziwin', 'Ogichidaakwe', 'Bimaadiziwin']) {
      expect(block, `${plan} does not use signupHref`).toContain(`signupHref('${plan}')`);
    }
  });

  test('signupHref actually produces a signup URL carrying the plan', () => {
    // Guards the helper itself, not just its use — a signupHref that
    // silently returned /auth would satisfy the checks above.
    const href = signupHref('Ogichidaakwe');
    expect(href.startsWith('/signup')).toBe(true);
    expect(href).toContain('plan=Ogichidaakwe');
  });

  test('the enterprise plan still routes to contact, not signup', () => {
    // It has no self-serve checkout; sending it to signup would be wrong.
    expect(ctaBlock()).toContain("Gimishoomis: { to: '/contact'");
  });

  test('the header Log in link still points at /auth', () => {
    // Only the PLAN CTAs should have moved. Sign-in must stay sign-in.
    expect(page).toMatch(/<LinkTo to="\/auth"[^>]*>Log in<\/LinkTo>/);
  });
});
