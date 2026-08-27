import { describe, test, expect, beforeEach } from 'vitest';
import { readCampaign, saveSignupIntent, readSignupIntent, clearSignupIntent, signupHref } from '@/lib/signup-intent';

/**
 * P0-0: every top-of-funnel CTA must reach a SIGNUP form with the chosen plan
 * and the campaign that brought the visitor, and that context must survive the
 * email-verification round trip.
 *
 * Before this, "Start free account" — the primary homepage CTA — pointed at a
 * bare /auth whose mode was hardcoded `useState(true)`, i.e. sign-IN.
 */
beforeEach(() => clearSignupIntent());

describe('signup intent', () => {
  test('CTA hrefs carry plan and billing to the signup route, not /auth', () => {
    expect(signupHref()).toBe('/signup');
    expect(signupHref('Ogichidaakwe')).toBe('/signup?plan=Ogichidaakwe');
    expect(signupHref('Bimaadiziwin', 'annual')).toBe('/signup?plan=Bimaadiziwin&billing=annual');
    // Never the sign-in route.
    expect(signupHref('Maadaadiziwin')).not.toContain('/auth');
  });

  test('campaign parameters are captured from the landing URL', () => {
    const c = readCampaign('?utm_source=google&utm_campaign=grants&gclid=abc&irrelevant=1');
    expect(c).toEqual({ utm_source: 'google', utm_campaign: 'grants', gclid: 'abc' });
  });

  test('a later plan click does not wipe the campaign that brought the visitor', () => {
    saveSignupIntent({ campaign: { utm_source: 'newsletter' } });
    saveSignupIntent({ plan: 'Ogichidaakwe', billing: 'annual' });
    const intent = readSignupIntent();
    expect(intent?.campaign).toEqual({ utm_source: 'newsletter' });
    expect(intent?.plan).toBe('Ogichidaakwe');
    expect(intent?.billing).toBe('annual');
  });

  test('intent persists across a full page load, as verification requires', () => {
    saveSignupIntent({ plan: 'Bimaadiziwin', campaign: { utm_source: 'x' } });
    // sessionStorage survives the redirect back from the verification email;
    // component state would not.
    expect(readSignupIntent()?.plan).toBe('Bimaadiziwin');
    expect(sessionStorage.getItem('ir-signup-intent')).toBeTruthy();
  });

  test('attacker-supplied campaign values are length-bounded', () => {
    const c = readCampaign('?utm_source=' + 'a'.repeat(500));
    expect(c.utm_source.length).toBeLessThanOrEqual(200);
  });
});

describe('signup entry points', () => {
  test('marketing CTAs point at /signup and the login link still points at /auth', async () => {
    const { readFileSync } = await import('node:fs');
    const landing = readFileSync('src/pages/LandingV2.tsx', 'utf8');
    expect(landing).toMatch(/to="\/signup"/);
    // "Log in" must not be diverted into registration.
    expect(landing).toMatch(/to="\/auth"[^>]*ir-login-link|ir-login-link[^>]*to="\/auth"/);
  });

  test('Auth opens in registration mode for /signup, ?intent=signup or ?plan=', async () => {
    const { readFileSync } = await import('node:fs');
    const auth = readFileSync('src/pages/Auth.tsx', 'utf8');
    // The bug was a hardcoded sign-in default.
    expect(auth).not.toMatch(/useState\(true\);\s*\/\/ isLogin/);
    expect(auth).toMatch(/pathname === '\/signup'/);
    expect(auth).toMatch(/intent'\) === 'signup'/);
    expect(auth).toMatch(/p\.has\('plan'\)/);
  });

  test('pricing CTAs route signed-out users to signup with their plan', async () => {
    const { readFileSync } = await import('node:fs');
    const pricing = readFileSync('src/components/PricingSection.tsx', 'utf8');
    // BOTH signed-out paths must route to signup: the free plan and the paid
    // plans. Asserting the string merely appears passes when only one of the
    // two is correct — which is exactly what a partial regression looks like.
    const signupRoutes = pricing.match(/navigate\(signupHref\(/g) ?? [];
    expect(signupRoutes).toHaveLength(2);
    // No signed-out CTA may still dump the user on the sign-in form.
    expect(pricing).not.toMatch(/Please sign in to subscribe[\s\S]{0,120}navigate\('\/auth'\)/);
    expect(pricing).not.toMatch(/Please sign in to start with the free plan/);
  });
});
