/**
 * Single source of truth for reading/writing the Supabase auth session
 * from localStorage. Replaces the duplicated localStorage key and parsing
 * logic that was scattered across useAuth.tsx, useSubscription.tsx, and
 * FundingMatches.tsx.
 */

export const SUPABASE_STORAGE_KEY = 'sb-upxojfcdtmqtcvgbjsym-auth-token';

export interface StoredSession {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number; // unix seconds
  token_type?: string;
  user?: {
    id?: string;
    email?: string;
    [key: string]: unknown;
  };
}

/**
 * Read the cached Supabase session from localStorage.
 * Returns null if nothing is stored or if parsing fails.
 */
export function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession | { currentSession?: StoredSession };
    // Some supabase-js versions wrap the session under currentSession
    const stored: StoredSession = (parsed as { currentSession?: StoredSession }).currentSession
      ?? (parsed as StoredSession);
    if (!stored?.access_token || !stored?.user?.id) return null;
    return stored;
  } catch {
    return null;
  }
}

/**
 * Write a refreshed session back to localStorage.
 */
export function writeStoredSession(session: StoredSession): void {
  try {
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('[auth-storage] failed to write session:', err);
  }
}

/**
 * Read just the access token. Convenience for edge function calls
 * that need an explicit Bearer header.
 */
export function readAccessToken(): string | null {
  const session = readStoredSession();
  return session?.access_token ?? null;
}

/**
 * Remove the cached session. Used when a stored token is found to be invalid
 * server-side (revoked / signed out elsewhere / JWT secret rotated) so we don't
 * keep treating a dead token as a live login.
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SUPABASE_STORAGE_KEY);
  } catch (err) {
    console.error('[auth-storage] failed to clear session:', err);
  }
}

/**
 * "Remember me".
 *
 * Supabase always persists the session to localStorage, so an unchecked
 * "Remember me" has to be enforced here: the choice is recorded in
 * localStorage and a marker is written to sessionStorage, which the browser
 * discards when the browser session ends. On the next boot a stored session
 * whose marker is gone is cleared before it is ever applied.
 */
const SESSION_SCOPED_KEY = 'ir-auth-session-scoped';
const TAB_MARKER_KEY = 'ir-auth-tab';

export function setSessionScoped(scoped: boolean): void {
  try {
    if (scoped) {
      localStorage.setItem(SESSION_SCOPED_KEY, '1');
      sessionStorage.setItem(TAB_MARKER_KEY, '1');
    } else {
      localStorage.removeItem(SESSION_SCOPED_KEY);
      sessionStorage.removeItem(TAB_MARKER_KEY);
    }
  } catch {
    // storage blocked — the session simply stays as the SDK left it
  }
}

/** True when a session-scoped login was dropped because the browser restarted. */
export function enforceSessionScope(): boolean {
  try {
    if (localStorage.getItem(SESSION_SCOPED_KEY) !== '1') return false;
    if (sessionStorage.getItem(TAB_MARKER_KEY) === '1') return false; // same browser session
    clearStoredSession();
    localStorage.removeItem(SESSION_SCOPED_KEY);
    return true;
  } catch {
    return false;
  }
}
