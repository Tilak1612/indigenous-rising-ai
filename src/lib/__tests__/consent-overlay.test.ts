import { describe, test, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  setConsentOverlay,
  subscribeConsentOverlay,
  isConsentOverlayOpen,
  isConsentOverlayOpenOnServer,
} from '../consent-overlay';

const read = (p: string) => readFileSync(p, 'utf8');

describe('consent overlay store', () => {
  beforeEach(() => {
    setConsentOverlay('cookie-consent', false);
    setConsentOverlay('compliance-banner', false);
  });

  test('reports open while any overlay is registered', () => {
    expect(isConsentOverlayOpen()).toBe(false);
    setConsentOverlay('cookie-consent', true);
    expect(isConsentOverlayOpen()).toBe(true);
    setConsentOverlay('compliance-banner', true);
    expect(isConsentOverlayOpen()).toBe(true);
    // One dismissal is not enough — the other still covers the launcher.
    setConsentOverlay('cookie-consent', false);
    expect(isConsentOverlayOpen()).toBe(true);
    setConsentOverlay('compliance-banner', false);
    expect(isConsentOverlayOpen()).toBe(false);
  });

  test('registering twice does not need two dismissals', () => {
    // A re-render re-runs the effect. With a counter this would leak and the
    // launcher would never come back.
    setConsentOverlay('cookie-consent', true);
    setConsentOverlay('cookie-consent', true);
    setConsentOverlay('cookie-consent', false);
    expect(isConsentOverlayOpen()).toBe(false);
  });

  test('notifies subscribers on change and only on change', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsentOverlay(listener);
    setConsentOverlay('cookie-consent', true);
    expect(listener).toHaveBeenCalledTimes(1);
    setConsentOverlay('cookie-consent', true); // no-op
    expect(listener).toHaveBeenCalledTimes(1);
    setConsentOverlay('cookie-consent', false);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    setConsentOverlay('cookie-consent', true);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('the server snapshot ignores client state, so hydration does not loop', () => {
    // useSyncExternalStore compares the server snapshot against the client
    // one during hydration. If this read live state it would still return
    // false in an empty test, so assert it with an overlay registered.
    expect(isConsentOverlayOpenOnServer()).toBe(false);
    setConsentOverlay('cookie-consent', true);
    expect(isConsentOverlayOpen()).toBe(true);
    expect(isConsentOverlayOpenOnServer()).toBe(false);
  });
});

describe('the launcher yields the corner to consent surfaces', () => {
  const widget = read('src/components/marketing/SiteAssistant.tsx');
  const cookie = read('src/components/CookieConsent.tsx');
  const compliance = read('src/components/ComplianceBanner.tsx');

  test('the launcher is gated on the store, not just rendered underneath', () => {
    expect(widget).toMatch(/!open && !consentOverlayOpen/);
    expect(widget).toMatch(/useSyncExternalStore\(\s*subscribeConsentOverlay/);
  });

  test('both consent surfaces register while they are covering it', () => {
    expect(compliance).toMatch(/setConsentOverlay\('compliance-banner', isVisible\)/);
    expect(cookie).toMatch(/setConsentOverlay\('cookie-consent', covering\)/);
    expect(cookie).toMatch(/showBanner && !isMinimized/);
  });

  test('both surfaces deregister on unmount, or the launcher never returns', () => {
    for (const [name, src] of [['CookieConsent', cookie], ['ComplianceBanner', compliance]] as const) {
      expect(src, `${name} has no cleanup`).toMatch(/return \(\) => setConsentOverlay\('[a-z-]+', false\)/);
    }
  });
});
