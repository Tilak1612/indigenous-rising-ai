/**
 * Cookie consent state, shared by the banner, the /cookies page and the
 * Consent Mode default in index.html.
 *
 * /cookies tells visitors analytics and marketing cookies "Require your
 * consent". Until this module existed that was not true: GA4 loaded
 * unconditionally and set _ga cookies whether a visitor chose "Accept All" or
 * "Essential Only" — the banner stored the choice and nothing read it. And
 * "Manage Cookie Settings" removed a key ('cookieConsent') the banner never
 * read ('cookie-consent'), so once someone accepted they could not withdraw.
 *
 * index.html cannot import this file (it runs before the bundle), so it reads
 * CONSENT_KEY by its literal value. src/__tests__/analytics-consent.test.ts
 * executes that inline script to keep the two in step.
 */
export const CONSENT_KEY = 'cookie-consent';
export const CONSENT_DATE_KEY = 'cookie-consent-date';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

type ConsentValue = 'granted' | 'denied';
export interface ConsentModeState {
  analytics_storage: ConsentValue;
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
}

/** No stored choice, or a choice without opt-in, is denied. */
export function consentModeState(prefs: Partial<CookiePreferences> | null): ConsentModeState {
  const analytics = prefs?.analytics === true ? 'granted' : 'denied';
  const marketing = prefs?.marketing === true ? 'granted' : 'denied';
  return {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
  };
}

export function readConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as CookiePreferences) : null;
  } catch {
    return null;
  }
}

/**
 * Consent Mode stops GA writing new cookies once analytics is denied, but it
 * does not delete the ones already set. Expire them so a withdrawal is real.
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const parts = host.split('.');
  // www.indigenousrising.ai -> ['', 'indigenousrising.ai', 'www.indigenousrising.ai']
  const domains = [''];
  for (let i = parts.length - 2; i >= 0; i--) domains.push(parts.slice(i).join('.'));
  for (const pair of document.cookie.split(';')) {
    const name = pair.split('=')[0].trim();
    if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const domain of domains) {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` + (domain ? `; domain=${domain}` : '');
    }
  }
}

/** Tell gtag about a choice the visitor just made, and honour a refusal now. */
export function applyConsent(prefs: CookiePreferences | null): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', consentModeState(prefs));
  }
  if (prefs?.analytics !== true) clearAnalyticsCookies();
}

export function saveConsent(prefs: CookiePreferences): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
  } catch {
    // storage blocked — still apply the choice for this page view
  }
  applyConsent(prefs);
}

/** Forget the stored choice so the banner asks again, and stop measuring. */
export function withdrawConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CONSENT_DATE_KEY);
  } catch {
    // storage blocked — nothing stored to remove
  }
  applyConsent(null);
}
