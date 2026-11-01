/**
 * Native-app context: pages the Indigenous Rising mobile app opens in its
 * in-app browser arrive with ?context=app. For the rest of that browser tab
 * (sessionStorage, so it survives the sign-in redirect and an OAuth round
 * trip, and ends when the tab closes) the site leaves out its direct plan
 * purchase prompts: the Pricing nav and footer links, and the dashboard's
 * Upgrade link, badges and locked-feature dialog CTA. The profile page renders
 * without the dashboard chrome, and sign-in returns to it.
 *
 * Presentation only. Nothing here changes what an account can access:
 * entitlements, the pricing page itself and checkout are untouched, and a
 * normal visit (no flag) is exactly as before.
 */

export const NATIVE_CONTEXT_PARAM = 'context';
export const NATIVE_CONTEXT_VALUE = 'app';
export const NATIVE_CONTEXT_STORAGE_KEY = 'ira.nativeContext';
export const NATIVE_PROFILE_PATH = `/dashboard/profile?${NATIVE_CONTEXT_PARAM}=${NATIVE_CONTEXT_VALUE}`;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function sessionStore(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null; // blocked site data
  }
}

function hasParam(search: string): boolean {
  return new URLSearchParams(search).get(NATIVE_CONTEXT_PARAM) === NATIVE_CONTEXT_VALUE;
}

/** Records the flag when the current URL carries it. Call once before the first render. */
export function captureNativeContext(
  search: string = typeof window === 'undefined' ? '' : window.location.search,
  storage: StorageLike | null = sessionStore(),
): void {
  if (!hasParam(search)) return;
  try {
    storage?.setItem(NATIVE_CONTEXT_STORAGE_KEY, '1');
  } catch {
    // Storage unavailable: the URL parameter still applies to this page.
  }
}

export function isNativeContext(
  search: string = typeof window === 'undefined' ? '' : window.location.search,
  storage: StorageLike | null = sessionStore(),
): boolean {
  if (hasParam(search)) return true;
  try {
    return storage?.getItem(NATIVE_CONTEXT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Where a completed sign-in goes: back to the profile in native context, else the dashboard. */
export function postAuthPath(native: boolean = isNativeContext()): string {
  return native ? NATIVE_PROFILE_PATH : '/dashboard';
}
