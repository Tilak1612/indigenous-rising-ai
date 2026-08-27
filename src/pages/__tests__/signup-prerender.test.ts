import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

/**
 * /signup must be prerendered, and must prerender as the REGISTRATION form.
 *
 * Two defects this pins, both found on production:
 *
 * 1. /signup was not in the prerender list, so Vercel's SPA fallback served
 *    index.html — the HOMEPAGE markup, 97,980 bytes, titled "Indigenous
 *    Rising AI — The AI platform for Indigenous business growth" — until
 *    React hydrated. That is the route every "Start free account" CTA points
 *    at.
 *
 * 2. Once prerendered, it rendered the SIGN-IN view. The isLogin initializer
 *    read window.location, which is undefined server-side, so it took the
 *    fallback branch and returned sign-in on every server render.
 */
const prerender = readFileSync('scripts/prerender.mjs', 'utf8');

describe('the signup route is prerendered', () => {
  test('/signup is in the prerender list, noindex like /auth', () => {
    const entry = /\{\s*p:\s*'\/signup'[^}]*\}/.exec(prerender);
    expect(entry, '/signup is missing from the prerender list').not.toBeNull();
    expect(entry![0]).toMatch(/robots:\s*'noindex/);
  });

  test('the mode is seeded from the router, not window', () => {
    // window.location is undefined during prerendering; reading it there
    // silently produced the wrong form.
    const auth = readFileSync('src/pages/Auth.tsx', 'utf8');
    const init = auth.slice(auth.indexOf('const [isLogin, setIsLogin]'));
    const body = init.slice(0, init.indexOf('\n  );') + 5);
    expect(body).toMatch(/routeWantsSignup\(location\.pathname, location\.search\)/);
    expect(body, 'the initializer must not read window.location')
      .not.toMatch(/window\.location/);
  });
});

// Asserted against build output when it exists, so a broken prerender fails
// here rather than in production.
const built = 'dist/signup/index.html';
describe.runIf(existsSync(built))('the built /signup is the registration form', () => {
  const html = existsSync(built) ? readFileSync(built, 'utf8') : '';

  test('it renders registration, not sign-in', () => {
    expect(html).toContain('Create an Account');
    expect(html).not.toContain('Welcome Back');
  });

  test('it carries the P1-4 additions in the initial HTML', () => {
    expect(html).toContain('Step 1 of 2');
    expect(html).toContain('3 free funding matches');
    expect(html).toContain('with Google');
    expect(html).toContain('stored exclusively on Canadian servers');
  });

  test('it is not the homepage fallback', () => {
    // The fallback was ~98KB of homepage markup with the homepage title.
    expect(html).toContain('Create your account | Indigenous Rising AI');
    expect(html.length).toBeLessThan(60_000);
  });

  test('/auth still prerenders as sign-in', () => {
    const authHtml = readFileSync('dist/auth/index.html', 'utf8');
    expect(authHtml).toContain('Welcome Back');
    expect(authHtml).not.toContain('Step 1 of 2');
  });
});
