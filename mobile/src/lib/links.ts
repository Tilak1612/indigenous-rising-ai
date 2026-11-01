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
 * iOS and Android, links to our own site are therefore limited to pages with
 * no purchase path (legal, data rights, FAQ, account deletion). The
 * website's dashboard pages are refused because their navigation carries
 * "Upgrade" prompts that link to /pricing and Stripe checkout. Payment
 * processor hosts are refused outright.
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

const PAYMENT_DOMAINS = ['stripe.com'];

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
    if (PAYMENT_DOMAINS.some((d) => onDomain(host, d))) return { ok: false, reason: 'payment' };
    if (onDomain(host, SITE_DOMAIN)) {
      const path = u.pathname.length > 1 && u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname;
      if (u.protocol !== 'https:' || u.search || u.hash || !NATIVE_SITE_PATHS.has(path)) {
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
