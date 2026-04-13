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
