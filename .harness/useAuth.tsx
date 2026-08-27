/* eslint-disable react-refresh/only-export-components -- this file must
   mirror the real module's shape (a component and a hook) to substitute
   for it; it is dev-only and never part of a build. */
import React from 'react';
const USER = { id: '00000000-0000-4000-8000-000000000001', email: 'harness@local.test' };
export function AuthProvider({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function useAuth() {
  return { user: USER, session: { access_token: 'harness' }, loading: false,
    isAdmin: true, isTeamMember: true,
    signIn: async () => ({ error: null }), signUp: async () => ({ error: null }),
    signOut: async () => {}, resetPassword: async () => ({ error: null }) };
}
