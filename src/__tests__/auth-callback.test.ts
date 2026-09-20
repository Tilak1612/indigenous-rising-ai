import { describe, test, expect, vi, beforeEach } from 'vitest';

const exchangeCodeForSession = vi.fn(async () => ({ data: {}, error: null }));
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { exchangeCodeForSession: (...a: unknown[]) => exchangeCodeForSession(...a) } },
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'anon',
}));

import { consumeAuthRedirect } from '@/lib/auth-callback';

/**
 * The client uses flowType 'pkce' with detectSessionInUrl: false, so the
 * provider returns ?code=… and something has to exchange it. Nothing did:
 * Google sent users back to /auth?code=… and the page rendered the signed-out
 * form again. Confirmed from the generated authorize URL, which carries
 * code_challenge + code_challenge_method=s256.
 */
const at = (url: string) => window.history.replaceState({}, '', url);

beforeEach(() => {
  exchangeCodeForSession.mockClear();
  exchangeCodeForSession.mockResolvedValue({ data: {}, error: null });
  at('/auth');
  window.location.hash = '';
});

describe('OAuth return', () => {
  test('exchanges the PKCE code for a session', async () => {
    at('/auth?code=abc123&state=xyz');
    await expect(consumeAuthRedirect()).resolves.toEqual({ status: 'signed-in' });
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc123');
  });

  test('clears the code from the URL so a refresh cannot replay it', async () => {
    at('/auth?code=abc123&plan=growth');
    await consumeAuthRedirect();
    expect(window.location.search).not.toContain('code=');
    expect(window.location.search).toContain('plan=growth'); // signup context survives
  });

  test('a failed exchange is reported, not swallowed', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: null, error: { message: 'bad code' } });
    at('/auth?code=nope');
    await expect(consumeAuthRedirect()).resolves.toEqual({ status: 'error', message: 'bad code' });
  });

  test('a thrown network error is reported', async () => {
    exchangeCodeForSession.mockRejectedValue(new Error('Failed to fetch'));
    at('/auth?code=nope');
    const r = await consumeAuthRedirect();
    expect(r).toMatchObject({ status: 'error' });
    expect((r as { message: string }).message).toMatch(/failed to fetch/i);
  });

  test('a hanging exchange gives up instead of waiting forever', async () => {
    // detectSessionInUrl is off precisely because this SDK's session calls can
    // hang on this project; the page must not sit there with no progress.
    vi.useFakeTimers();
    exchangeCodeForSession.mockImplementation(() => new Promise(() => {}));
    at('/auth?code=hangs');
    const promise = consumeAuthRedirect();
    await vi.advanceTimersByTimeAsync(15000);
    const r = await promise;
    vi.useRealTimers();
    expect(r).toMatchObject({ status: 'error' });
    expect((r as { message: string }).message).toMatch(/timed out/i);
  });

  test('does nothing on a plain visit', async () => {
    await expect(consumeAuthRedirect()).resolves.toEqual({ status: 'none' });
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});

describe('cancellation and expired links', () => {
  test('a cancelled provider screen explains itself', async () => {
    // Measured against the live project: GoTrue reports these in the fragment.
    at('/auth');
    window.location.hash = '#error=access_denied&error_code=access_denied&error_description=User+denied';
    const r = await consumeAuthRedirect();
    expect(r.status).toBe('error');
    expect((r as { message: string }).message).toMatch(/User denied/);
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  test('an expired email link says so in plain words', async () => {
    at('/auth');
    window.location.hash = '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    const r = await consumeAuthRedirect();
    expect((r as { message: string }).message).toMatch(/expired/i);
  });

  test('a recovery link is routed to the set-password screen', async () => {
    at('/auth');
    window.location.hash = '#access_token=t&type=recovery';
    await expect(consumeAuthRedirect()).resolves.toEqual({ status: 'recovery' });
  });
});
