import { supabase } from '@/lib/supabase';

/**
 * Completes an OAuth / email-link return.
 *
 * The client is configured with flowType 'pkce' and detectSessionInUrl: false
 * (the SDK's URL detection hangs in this project — see src/lib/supabase.ts).
 * PKCE means the provider sends the browser back with `?code=…`, which has to
 * be exchanged for a session. Nothing did that: signInWithOAuth sent users to
 * Google, Google sent them back to /auth?code=…, the code was ignored and the
 * page rendered the signed-out form again. Verified from the generated
 * authorize URL, which carries code_challenge + code_challenge_method=s256.
 *
 * GoTrue reports failures in the URL *fragment* (#error=access_denied&…),
 * which is also what a cancelled consent screen produces — measured against
 * the live project — so both query and hash are inspected.
 */
export type AuthRedirectResult =
  | { status: 'none' }
  | { status: 'signed-in' }
  | { status: 'recovery' }
  | { status: 'error'; message: string };

/** Human wording for the error codes GoTrue actually returns. */
function describe(code: string | null, description: string | null): string {
  const d = (description || '').replace(/\+/g, ' ').trim();
  switch (code) {
    case 'access_denied':
      // Also what a user sees after pressing Cancel on the provider screen.
      return d && !/expired/i.test(d) ? d : 'Sign-in was cancelled, or the link has expired. Please try again.';
    case 'otp_expired':
      return 'That link has expired. Request a new one and use it within the hour.';
    case 'server_error':
      return 'The sign-in provider had a problem. Please try again.';
    default:
      return d || 'Sign-in could not be completed. Please try again.';
  }
}

/** Strip auth parameters so a refresh cannot replay a consumed code. */
function cleanUrl(): void {
  const url = new URL(window.location.href);
  for (const k of ['code', 'error', 'error_code', 'error_description', 'state', 'token_hash', 'type']) {
    url.searchParams.delete(k);
  }
  window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '') + '');
}

export async function consumeAuthRedirect(): Promise<AuthRedirectResult> {
  if (typeof window === 'undefined') return { status: 'none' };
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  // Errors arrive in the fragment; a cancelled provider screen looks the same.
  const errorCode = query.get('error_code') || hash.get('error_code') || query.get('error') || hash.get('error');
  if (errorCode) {
    const message = describe(
      query.get('error_code') || hash.get('error_code') || errorCode,
      query.get('error_description') || hash.get('error_description'),
    );
    cleanUrl();
    window.location.hash = '';
    return { status: 'error', message };
  }

  // Password recovery still arrives as a fragment token on this project.
  if (hash.get('type') === 'recovery' || query.get('type') === 'recovery') return { status: 'recovery' };

  const code = query.get('code');
  if (!code) return { status: 'none' };

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    cleanUrl();
    if (error) return { status: 'error', message: error.message };
    return { status: 'signed-in' };
  } catch (err) {
    cleanUrl();
    return { status: 'error', message: err instanceof Error ? err.message : 'Sign-in could not be completed.' };
  }
}
