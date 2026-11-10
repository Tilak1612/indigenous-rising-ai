import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';
// The same WHATWG URL implementation the app installs globally in supabase.ts
// (Hermes has no complete URL of its own). Importing it explicitly means the
// tests exercise the parser the device runs, not Node's.
import { URL } from 'react-native-url-polyfill';

/**
 * Outgoing-link policy for the native app.
 *
 * The app is a free companion to the website: plans are bought and managed on
 * the web only, and the app must not lead into that from an in-app button. On
 * iOS and Android, links to our own site are limited to the legal, data
 * rights, FAQ and account-deletion pages, plus the business profile opened
 * with ?context=app. That parameter puts the website into native context
 * (src/lib/native-context.ts in the web app): the profile renders without the
 * dashboard sidebar and header, and the Upgrade link, badges, locked-feature
 * CTA and Pricing nav/footer links are left out for the rest of that browser
 * tab. Any other dashboard page, and the profile without the parameter, is
 * refused because the full dashboard carries Upgrade prompts to /pricing.
 *
 * The website's own subscription purchase and management run on Stripe
 * Checkout Sessions (checkout.stripe.com, create-checkout) and the Billing
 * Portal (billing.stripe.com, customer-portal); those two hosts are refused.
 * Other stripe.com hosts are not ours and are left alone. A funder's own
 * Checkout Session link would share checkout.stripe.com and cannot be told
 * apart by URL; none is in the catalogue today.
 *
 * Third-party links (funders' programme and application pages, government
 * resources) are untouched apart from basic scheme hygiene; they are the point
 * of the app. On web the app follows the website's own behaviour, so only the
 * scheme hygiene applies there.
 */

export const SITE_ORIGIN = 'https://www.indigenousrising.ai';
const SITE_DOMAIN = 'indigenousrising.ai';

// Exact pathnames, compared after the parser has resolved dot segments.
// Percent-encoded spellings never match, which is intended: the app only ever
// links these pages literally.
const NATIVE_SITE_PATHS = new Set(['/privacy', '/terms', '/data-rights', '/faq', '/account-deletion']);
export const NATIVE_CONTEXT_QUERY = '?context=app';
// Allowed only in native context, where the website renders it without the dashboard chrome.
const NATIVE_CONTEXT_ONLY_PATHS = new Set(['/dashboard/profile']);

const OWN_PAYMENT_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com']);

/** A page on our site, opened in native context. */
export function siteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}${NATIVE_CONTEXT_QUERY}`;
}

export type LinkPlatform = 'ios' | 'android' | 'web' | (string & {});

export type LinkDecision =
  | { ok: true; href: string; opener: 'mail' | 'browser' }
  | { ok: false; reason: 'unparseable' | 'scheme' | 'credentials' | 'host' | 'site-path' | 'payment' };

function isNative(platform: LinkPlatform) {
  return platform === 'ios' || platform === 'android';
}

/** Lower-case host without the single trailing dot DNS allows; null if it ends in more than one dot. */
function canonicalHost(hostname: string): string | null {
  const h = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname;
  if (!h || h.endsWith('.')) return null;
  return h.toLowerCase();
}

function onDomain(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function outgoingLinkDecision(raw: string, platform: LinkPlatform): LinkDecision {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, reason: 'unparseable' };
  }

  if (u.protocol === 'mailto:') return { ok: true, href: u.href, opener: 'mail' };
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, reason: 'scheme' };
  if (u.username || u.password) return { ok: false, reason: 'credentials' };

  const host = canonicalHost(u.hostname);
  if (!host) return { ok: false, reason: 'host' };

  if (isNative(platform)) {
    if (OWN_PAYMENT_HOSTS.has(host)) return { ok: false, reason: 'payment' };
    if (onDomain(host, SITE_DOMAIN)) {
      const path = u.pathname.length > 1 && u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname;
      const native = u.search === NATIVE_CONTEXT_QUERY;
      const allowedPath = NATIVE_SITE_PATHS.has(path) || (native && NATIVE_CONTEXT_ONLY_PATHS.has(path));
      if (u.protocol !== 'https:' || u.hash || (u.search && !native) || !allowedPath) {
        return { ok: false, reason: 'site-path' };
      }
    }
  }

  return { ok: true, href: u.href, opener: 'browser' };
}

export function canOpenOutgoing(raw: string | null | undefined, platform: LinkPlatform = Platform.OS): raw is string {
  return Boolean(raw) && outgoingLinkDecision(raw as string, platform).ok;
}

/** Opens the normalised URL if the policy allows it; resolves false (and opens nothing) otherwise. */
export async function openOutgoing(raw: string, platform: LinkPlatform = Platform.OS): Promise<boolean> {
  const d = outgoingLinkDecision(raw, platform);
  if (!d.ok) return false;
  if (d.opener === 'mail') await Linking.openURL(d.href);
  else await WebBrowser.openBrowserAsync(d.href);
  return true;
}
