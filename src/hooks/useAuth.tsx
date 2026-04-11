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
    function hydrateFromLocalStorage(): StoredSession | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          console.log('[useAuth] no cached session in localStorage');
          return null;
        }
        const parsed = JSON.parse(raw) as StoredSession | { currentSession?: StoredSession };
        // Some supabase-js versions wrap the session under currentSession
        const stored: StoredSession = (parsed as { currentSession?: StoredSession }).currentSession
          ?? (parsed as StoredSession);

        if (!stored?.access_token || !stored?.user?.id) {
          console.log('[useAuth] cached session missing required fields');
          return null;
        }

        // Check expiry — if expired, we can't use it locally (would need refresh)
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (stored.expires_at && stored.expires_at < nowSeconds) {
          console.log('[useAuth] cached session is expired, skipping local hydration');
          return null;
        }

        // Construct Session-shaped object. We trust the cached user claims
        // — this is the same trust model the SDK uses when reading its own
        // cache. The JWT is still verified server-side on every API call.
        const hydratedSession = stored as unknown as Session;
        const hydratedUser = stored.user as unknown as User;

        setSession(hydratedSession);
        setUser(hydratedUser);
        console.log('[useAuth] hydrated from localStorage, user:', stored.user.email);
        return stored;
      } catch (err) {
        console.error('[useAuth] localStorage hydration failed:', err);
        return null;
      }
    }

    const hydratedSession = hydrateFromLocalStorage();

    // If hydration succeeded, resolve loading immediately, fire off the
    // role check in the background, and CRUCIALLY restore the SDK's
    // internal session via setSession() so that supabase.functions.invoke()
    // and other SDK calls correctly attach the Bearer token.
    if (hydratedSession) {
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
    } else {
      // No cached session — mark as anonymous and resolve loading
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsTeamMember(false);
      setLoading(false);
    }

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