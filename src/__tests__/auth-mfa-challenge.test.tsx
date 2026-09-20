import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

/**
 * Settings can enrol a TOTP factor, but sign-in never asked for a code: the
 * session stayed at aal1, so 2FA protected nothing. These tests hold the line
 * on both session-creating paths.
 */
const state = vi.hoisted(() => ({
  currentLevel: 'aal1', nextLevel: 'aal1' as string,
  factors: [] as { id: string }[],
  verifyError: null as null | { message: string },
  // Supabase establishes an aal1 session as soon as the password is accepted —
  // the user object exists BEFORE the second factor. Modelling that is what
  // makes "the dashboard is not reached" a real assertion.
  user: null as null | { id: string },
}));
const signIn = vi.fn(async () => { state.user = { id: 'u1' }; return { error: null }; });
const signOut = vi.fn(async () => {});
const challengeAndVerify = vi.fn(async () => ({ error: state.verifyError }));
const navigateSpy = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: state.user, loading: false, signIn, signUp: vi.fn(), signOut }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(), exchangeCodeForSession: vi.fn(async () => ({ data: {}, error: null })),
      getSession: async () => ({ data: { session: null } }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: state.currentLevel, nextLevel: state.nextLevel }, error: null }),
        listFactors: async () => ({ data: { totp: state.factors }, error: null }),
        challengeAndVerify: (...a: unknown[]) => challengeAndVerify(...a),
      },
    },
  },
  SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));
vi.mock('@/lib/auth-providers', () => ({
  fetchEnabledProviders: async () => ({ google: true, azure: false }),
  PROVIDER_LABEL: { google: 'Continue with Google', azure: 'Continue with Microsoft' },
}));
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateSpy };
});

import Auth from '@/pages/Auth';

const renderAuth = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/auth']}>
        <Routes><Route path="/auth" element={<Auth />} /></Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

const signInWithPassword = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), 'someone@example.test');
  await user.type(screen.getByLabelText('Password'), 'correct horse battery');
  await user.click(screen.getByRole('button', { name: /^sign in$/i }));
  return user;
};

beforeEach(() => {
  state.currentLevel = 'aal1'; state.nextLevel = 'aal1'; state.factors = []; state.verifyError = null; state.user = null;
  signIn.mockClear(); signOut.mockClear(); challengeAndVerify.mockClear(); navigateSpy.mockClear();
  localStorage.clear(); sessionStorage.clear();
});

describe('accounts without 2FA are unaffected', () => {
  test('no code screen, straight through', async () => {
    renderAuth();
    await signInWithPassword();
    await waitFor(() => expect(signIn).toHaveBeenCalled());
    expect(screen.queryByLabelText(/authentication code/i)).not.toBeInTheDocument();
    expect(challengeAndVerify).not.toHaveBeenCalled();
  });
});

describe('an enrolled account is challenged', () => {
  beforeEach(() => { state.nextLevel = 'aal2'; state.factors = [{ id: 'factor-1' }]; });

  test('password sign-in stops at the code screen — the dashboard is not reached', async () => {
    renderAuth();
    await signInWithPassword();
    expect(await screen.findByLabelText(/authentication code/i)).toBeInTheDocument();
    expect(navigateSpy).not.toHaveBeenCalledWith('/dashboard', expect.anything());
    expect(navigateSpy).not.toHaveBeenCalledWith('/dashboard');
  });

  test('the field is set up for phone one-time-code autofill', async () => {
    renderAuth();
    await signInWithPassword();
    const field = await screen.findByLabelText(/authentication code/i);
    expect(field).toHaveAttribute('autocomplete', 'one-time-code');
    expect(field).toHaveAttribute('inputmode', 'numeric');
  });

  test('a correct code verifies and lets the user in', async () => {
    renderAuth();
    const user = await signInWithPassword();
    await user.type(await screen.findByLabelText(/authentication code/i), '123456');
    await user.click(screen.getByRole('button', { name: /verify and sign in/i }));
    await waitFor(() => expect(challengeAndVerify).toHaveBeenCalledWith({ factorId: 'factor-1', code: '123456' }));
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/dashboard', { replace: true }));
  });

  test('a rejected code explains itself and keeps the user on the screen', async () => {
    state.verifyError = { message: 'Invalid TOTP code entered' };
    renderAuth();
    const user = await signInWithPassword();
    await user.type(await screen.findByLabelText(/authentication code/i), '000000');
    await user.click(screen.getByRole('button', { name: /verify and sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/codes expire every 30 seconds/i);
    expect(navigateSpy).not.toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  test('backing out signs the half-authenticated session out', async () => {
    renderAuth();
    const user = await signInWithPassword();
    await screen.findByLabelText(/authentication code/i);
    await user.click(screen.getByRole('button', { name: /use a different account/i }));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(await screen.findByLabelText('Password')).toBeInTheDocument();
  });

  test('the OAuth return is challenged too', async () => {
    window.history.replaceState({}, '', '/auth?code=abc');
    renderAuth();
    expect(await screen.findByLabelText(/authentication code/i)).toBeInTheDocument();
    window.history.replaceState({}, '', '/auth');
  });
});
