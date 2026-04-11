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

    // Safety net: if neither getSession() nor the auth listener has resolved
    // the loading state within 8 seconds (pathological network / SDK hang),
    // force-unblock the app. Users will land on /auth and can retry.
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[useAuth] loading state did not resolve within 8s — forcing loading=false');
        setLoading(false);
      }
    }, 8000);

    // DIAGNOSTIC: inspect what's actually in localStorage at boot time
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('sb-') || k.includes('supabase'));
      console.log('[useAuth] localStorage keys:', keys);
      for (const k of keys) {
        const val = localStorage.getItem(k);
        console.log(`[useAuth] localStorage[${k}] length:`, val?.length ?? 0);
      }
    } catch (e) {
      console.error('[useAuth] localStorage access threw:', e);
    }

    // Set up auth state listener FIRST
    // Await role check before setting loading=false — prevents ProtectedRoute
    // from redirecting admins during the brief window before roles are confirmed.
    //
    // IMPORTANT: On first app load, Supabase fires an INITIAL_SESSION event
    // on the listener very early — sometimes before the SDK has finished
    // hydrating the cached session from localStorage. If that event arrives
    // with nextSession=null and we set loading=false, ProtectedRoute will
    // redirect to /auth before the real session is restored a few ms later.
    // Race observed on hard refresh of protected sub-routes.
    //
    // Fix: ignore the loading-flag side effect on INITIAL_SESSION. The
    // getSession() call below is the authoritative source for the initial
    // state and its finally block always runs, so we never hang.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        console.log('[useAuth] onAuthStateChange event:', event, 'hasSession:', !!nextSession);
        if (!mounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          await checkUserRole(nextSession.user.id);
        } else {
          setIsAdmin(false);
          setIsTeamMember(false);
        }

        // Only the getSession() IIFE below sets loading=false on INITIAL_SESSION.
        // All subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
        // safely resolve loading here.
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session.
    // Wrapped in try/catch + guaranteed setLoading(false) so a corrupted
    // token, network error, or Supabase outage can never leave the app
    // stuck on an infinite spinner. Users hit the auth page instead.
    //
    // Additional protection: race getSession() against a 5-second timeout
    // so we never wait the full 8s safety net before giving up. This
    // catches the known Supabase SDK hang where getSession() returns a
    // Promise that never resolves.
    (async () => {
      console.log('[useAuth] calling getSession');
      try {
        type SessionResult = Awaited<ReturnType<typeof supabase.auth.getSession>>;
        const timeoutResult: SessionResult = {
          data: { session: null },
          error: { name: 'TimeoutError', message: 'getSession timed out after 5s', status: 0 } as unknown as SessionResult['error'],
        };
        const getSessionPromise = supabase.auth.getSession() as Promise<SessionResult>;
        const timeoutPromise = new Promise<SessionResult>((resolve) => {
          setTimeout(() => resolve(timeoutResult), 5000);
        });
        const { data, error } = await Promise.race([getSessionPromise, timeoutPromise]);
        console.log('[useAuth] getSession resolved, has session:', !!data?.session, 'error:', error?.message ?? 'none');
        if (!mounted) return;

        if (error) {
          console.error('[useAuth] getSession error:', error.message);
          // On a timeout, DO NOT clear the session — a hang can be transient
          // and the onAuthStateChange listener may still fire later with the
          // real session. Just leave loading=false so ProtectedRoute can
          // redirect the user to /auth, where they can sign in again.
          // On a real corrupted-token error, also don't clear it unless we
          // know the token is actually bad — safer to redirect to /auth and
          // let the user log in normally.
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsTeamMember(false);
          return;
        }

        const existing = data.session;
        setSession(existing);
        setUser(existing?.user ?? null);

        if (existing?.user) {
          await checkUserRole(existing.user.id);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('[useAuth] getSession threw:', err);
        // Don't destroy the session — the user may still be valid. Just
        // mark them anonymous for now; a page reload or explicit sign-in
        // can recover. The localStorage entry stays intact.
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsTeamMember(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

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