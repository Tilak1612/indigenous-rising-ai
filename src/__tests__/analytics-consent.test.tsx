import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsent from '@/components/CookieConsent';
import { CONSENT_KEY, withdrawConsent, consentModeState } from '@/lib/cookie-consent';

/**
 * /cookies tells visitors analytics and marketing cookies "Require your
 * consent". GA4 used to load unconditionally, so "Essential Only" changed
 * nothing, and "Manage Cookie Settings" removed a key the banner never read,
 * so consent could not be withdrawn. These tests pin the real behaviour.
 */
const indexHtml = readFileSync('index.html', 'utf8');

/** The inline script that declares gtag and sets the consent default. */
const consentScript = (() => {
  const blocks = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const found = blocks.find((b) => b.includes("gtag('consent', 'default'"));
  if (!found) throw new Error('index.html has no Consent Mode default script');
  return found;
})();

/** Run index.html's script as a browser would, with a given stored value. */
function runHeadScript(stored: string | null): unknown[][] {
  const window: Record<string, unknown> = {};
  const localStorage = { getItem: (k: string) => (k === CONSENT_KEY ? stored : null) };
  const ctx: Record<string, unknown> = { window, localStorage, Date };
  ctx.dataLayer = undefined;
  runInNewContext(`${consentScript}; this.__dl = window.dataLayer;`, Object.assign(ctx, { window: ctx }));
  return (ctx.__dl as IArguments[]).map((a) => Array.from(a));
}

const defaultOf = (dl: unknown[][]) => dl.find((c) => c[0] === 'consent' && c[1] === 'default')?.[2];

describe('index.html sets a consent default before GA4 initialises', () => {
  test('no stored choice → analytics and ads denied', () => {
    expect(defaultOf(runHeadScript(null))).toEqual({
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
  });

  test('"Essential Only" stored → denied', () => {
    const essential = JSON.stringify({ necessary: true, functional: false, analytics: false, marketing: false });
    expect(defaultOf(runHeadScript(essential))).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied' });
  });

  test('opted in to analytics only → analytics granted, ads still denied', () => {
    const analyticsOnly = JSON.stringify({ necessary: true, functional: false, analytics: true, marketing: false });
    expect(defaultOf(runHeadScript(analyticsOnly))).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied' });
  });

  test('a corrupted stored value fails closed', () => {
    expect(defaultOf(runHeadScript('{not json'))).toMatchObject({ analytics_storage: 'denied' });
    expect(defaultOf(runHeadScript('"yes"'))).toMatchObject({ analytics_storage: 'denied' });
  });

  test('the default is queued before config, so the first hit already respects it', () => {
    const dl = runHeadScript(null);
    const consentAt = dl.findIndex((c) => c[0] === 'consent');
    const configAt = dl.findIndex((c) => c[0] === 'config');
    expect(consentAt).toBeGreaterThan(-1);
    expect(configAt).toBeGreaterThan(consentAt);
  });

  test('the head script and the app agree on what each choice means', () => {
    for (const prefs of [null,
      { necessary: true, functional: false, analytics: false, marketing: false },
      { necessary: true, functional: true, analytics: true, marketing: true },
      { necessary: true, functional: false, analytics: true, marketing: false }]) {
      expect(defaultOf(runHeadScript(prefs ? JSON.stringify(prefs) : null))).toEqual(consentModeState(prefs));
    }
  });
});

describe('the banner and the policy page act on the choice', () => {
  beforeEach(() => {
    localStorage.clear();
    (window as unknown as { gtag: unknown }).gtag = vi.fn();
  });

  test('"Essential Only" updates consent to denied', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByText('Essential Only'));
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({ analytics_storage: 'denied' }));
    expect(JSON.parse(localStorage.getItem(CONSENT_KEY)!).analytics).toBe(false);
  });

  test('"Accept All Cookies" updates consent to granted', () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByText('Accept All Cookies'));
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({ analytics_storage: 'granted' }));
  });

  test('refusing expires GA cookies that were already set', () => {
    document.cookie = '_ga=GA1.1.123; path=/';
    document.cookie = '_ga_WB8K26EHYC=GS1.1.456; path=/';
    document.cookie = 'unrelated=keep; path=/';
    render(<CookieConsent />);
    fireEvent.click(screen.getByText('Essential Only'));
    expect(document.cookie).not.toMatch(/_ga/);
    expect(document.cookie).toMatch(/unrelated=keep/);
  });

  test('withdrawing removes the key the banner actually reads, and denies', () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ necessary: true, functional: true, analytics: true, marketing: true }));
    withdrawConsent();
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({ analytics_storage: 'denied' }));
  });

  test('after withdrawal the banner asks again', () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ necessary: true, functional: true, analytics: true, marketing: true }));
    const { unmount } = render(<CookieConsent />);
    expect(screen.queryByText('Essential Only')).toBeNull();
    unmount();
    withdrawConsent();
    render(<CookieConsent />);
    expect(screen.getByText('Essential Only')).toBeTruthy();
  });

  test('"Manage Cookie Settings" on /cookies calls the real withdrawal', () => {
    const policy = readFileSync('src/pages/CookiePolicy.tsx', 'utf8');
    expect(policy).toMatch(/withdrawConsent\(\);\s*\n\s*window\.location\.reload\(\);/);
    expect(policy, "a hand-typed consent key has crept back in").not.toMatch(/removeItem\('cookie/);
  });
});
