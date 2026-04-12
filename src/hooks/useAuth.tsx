/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isTeamMember: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Role lookup must never throw out of the auth flow — if user_roles table
  // is missing, the user is unauthenticated, or the network is flaky, we
  // fall back to "no special roles" rather than hanging the whole app.
  const checkUserRole = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('[useAuth] user_roles query failed:', error.message);
        setIsAdmin(false);
        setIsTeamMember(false);
        return;
      }

      const roleList = (roles ?? []).map(r => r.role);
      setIsAdmin(roleList.includes('admin'));
      setIsTeamMember(roleList.includes('team_member') || roleList.includes('admin'));
    } catch (err) {
      console.error('[useAuth] user_roles threw:', err);
      setIsAdmin(false);
      setIsTeamMember(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety net: hydration is synchronous and should resolve loading in
    // single-digit milliseconds. This timeout is only for the pathological
    // case where neither the localStorage read nor the auth listener fires.
    // Set to 10s — if it ever triggers in production, something is genuinely
    // wrong and we want a console.warn so we know to investigate.
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[useAuth] safety timeout fired — neither hydration nor auth listener resolved loading');
        setLoading(false);
      }
    }, 10000);

    // ------------------------------------------------------------------
    // SYNCHRONOUS SESSION HYDRATION FROM LOCALSTORAGE
    // ------------------------------------------------------------------
    // We can't rely on supabase.auth.getSession() — in supabase-js@2.80.0
    // on this project, it returns a Promise that never resolves and never
    // throws. Observed via Test B diagnostic logs with bundle CNgh3ZC9:
    // - localStorage key is present (2276 bytes)
    // - supabase.auth.getSession() is called
    // - neither getSession nor onAuthStateChange ever fires
    // - the 5s timeout always fires
    //
    // Workaround: read the session directly from localStorage, decode the
    // access_token JWT to extract expiry and user claims, and populate our
    // React state synchronously. This bypasses the SDK's broken async
    // machinery entirely for the initial load.
    //
    // The SDK is still responsible for fresh sign-ins (via signInWithPassword
    // which DOES work — confirmed by the fact that users can sign in), and
    // onAuthStateChange is still registered for future events. Only the
    // initial hydration is bypassed.
    const STORAGE_KEY = 'sb-upxojfcdtmqtcvgbjsym-auth-token';

    interface StoredSession {
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

    // Returns the parsed StoredSession if successful, null otherwise.
    function readStoredSession(): StoredSession | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredSession | { currentSession?: StoredSession };
        const stored: StoredSession = (parsed as { currentSession?: StoredSession }).currentSession
          ?? (parsed as StoredSession);
        if (!stored?.access_token || !stored?.user?.id) return null;
        return stored;
      } catch {
        return null;
      }
    }

    function writeStoredSession(next: StoredSession) {
      try {
        // Match the shape supabase-js writes — top-level access_token etc.
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('[useAuth] failed to write refreshed session:', err);
      }
    }

    // Bypass the SDK's hung refreshSession() by hitting the Supabase auth REST
    // endpoint directly. Returns the new StoredSession on success or null.
    async function refreshAccessToken(refreshToken: string): Promise<StoredSession | null> {
      try {
        const res = await fetch(
          'https://upxojfcdtmqtcvgbjsym.supabase.co/auth/v1/token?grant_type=refresh_token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9qZmNkdG1xdGN2Z2Jqc3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzAwMDgsImV4cCI6MjA4NzU0NjAwOH0.tAaSqKPPy8nfj6u8lby5Fmuqdiy1CezxnSUpWfA2yP0',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        );
        if (!res.ok) {
          console.warn('[useAuth] refresh failed:', res.status, await res.text().catch(() => ''));
          return null;
        }
        const data = await res.json() as StoredSession;
        if (!data?.access_token || !data?.user?.id) {
          console.warn('[useAuth] refresh response missing fields');
          return null;
        }
        writeStoredSession(data);
        console.log('[useAuth] token refreshed via direct REST, new expiry:', data.expires_at);
        return data;
      } catch (err) {
        console.error('[useAuth] refresh threw:', err);
        return null;
      }
    }

    // Hydrate the user state from a known-good StoredSession.
    function applyStoredSession(stored: StoredSession) {
      const hydratedSession = stored as unknown as Session;
      const hydratedUser = stored.user as unknown as User;
      setSession(hydratedSession);
      setUser(hydratedUser);
    }

    // High-level: read cache, refresh if expired/near-expired, return usable
    // session or null. We refresh proactively when within 60s of expiry so we
    // don't ship the user a JWT that's about to die before their next click.
    async function hydrateFromLocalStorage(): Promise<StoredSession | null> {
      const stored = readStoredSession();
      if (!stored) {
        console.log('[useAuth] no cached session in localStorage');
        return null;
      }

      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiresIn = (stored.expires_at ?? 0) - nowSeconds;

      if (expiresIn > 60) {
        // Healthy — use as-is
        applyStoredSession(stored);
        console.log('[useAuth] hydrated from localStorage, user:', stored.user?.email, 'expires in', expiresIn, 's');
        return stored;
      }

      // Expired or about to expire — refresh via REST
      if (!stored.refresh_token) {
        console.log('[useAuth] cached session expired and has no refresh_token');
        return null;
      }
      console.log('[useAuth] cached session expired/near-expired, refreshing via REST');
      const refreshed = await refreshAccessToken(stored.refresh_token);
      if (!refreshed) return null;
      applyStoredSession(refreshed);
      return refreshed;
    }

    // Hydration is async because we may need to refresh the access token
    // via REST first. We resolve `loading` only after the hydration promise
    // settles so the ProtectedRoute doesn't bounce a still-valid user to /auth.
    hydrationPromise
      .then((hydratedSession) => {
        if (!mounted) return;
        if (!hydratedSession) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsTeamMember(false);
          setLoading(false);
          return;
        }

        setLoading(false);
        // Fire-and-forget role check (pass the id directly — React state
        // updates are async so `user` is still null at this point)
        checkUserRole(hydratedSession.user!.id!).catch(err => {
          console.error('[useAuth] role check failed:', err);
        });

        // CRITICAL: restore the SDK's internal session so functions.invoke()
        // and database queries correctly attach the user's Bearer token.
        // We race against a 3s timeout because setSession() is part of the
        // same async machinery as getSession() and may also hang in this
        // environment. If it does, we proceed without the SDK session — but
        // FundingMatches.tsx and useSubscription.tsx already read the token
        // directly from localStorage and pass it explicitly, so functions
        // still work even if setSession is dead.
        if (hydratedSession.access_token && hydratedSession.refresh_token) {
          const setSessionPromise = supabase.auth.setSession({
            access_token: hydratedSession.access_token,
            refresh_token: hydratedSession.refresh_token,
          });
          const setSessionTimeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000));
          Promise.race([setSessionPromise, setSessionTimeout])
            .then((result) => {
              if (result === 'timeout') {
                console.warn('[useAuth] setSession() timed out — SDK internal session not synced; using explicit Bearer headers');
              } else {
                console.log('[useAuth] setSession() succeeded — SDK internal session synced');
              }
            })
            .catch((err) => {
              console.error('[useAuth] setSession() threw:', err);
            });
        }
      })
      .catch((err) => {
        console.error('[useAuth] hydration promise rejected:', err);
        if (mounted) setLoading(false);
      });

    // Background refresh loop: every 60s, check if the cached token is
    // within 5 minutes of expiry and refresh proactively. This is what
    // supabase-js's autoRefreshToken would normally do, but it's broken on
    // this project. Without this, users get logged out after 1 hour mid-audit.
    const refreshIntervalId = setInterval(async () => {
      if (!mounted) return;
      const stored = readStoredSession();
      if (!stored?.refresh_token || !stored.expires_at) return;
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiresIn = stored.expires_at - nowSeconds;
      if (expiresIn > 300) return; // > 5 min, nothing to do
      console.log('[useAuth] background refresh: token expires in', expiresIn, 's');
      const refreshed = await refreshAccessToken(stored.refresh_token);
      if (refreshed && mounted) applyStoredSession(refreshed);
    }, 60_000);

    // Register the auth state change listener for future events
    // (sign-in, sign-out, token refresh). Even if INITIAL_SESSION fires
    // late or not at all, this handles all subsequent user actions.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        console.log('[useAuth] onAuthStateChange event:', event, 'hasSession:', !!nextSession);
        if (!mounted) return;

        // Skip INITIAL_SESSION entirely — we already hydrated from localStorage
        // and we don't want this event to overwrite our hydrated state with
        // null if the SDK's internal state is broken.
        if (event === 'INITIAL_SESSION') {
          return;
        }

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          await checkUserRole(nextSession.user.id);
        } else {
          setIsAdmin(false);
          setIsTeamMember(false);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      clearInterval(refreshIntervalId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Do not navigate here — allow calling components to react to auth state
    // and handle redirects (e.g., Auth page redirects to `/dashboard` on user change).
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsTeamMember(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isTeamMember,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}