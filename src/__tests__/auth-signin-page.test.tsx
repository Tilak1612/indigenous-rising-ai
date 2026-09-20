import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const signIn = vi.fn(async () => ({ error: null }));
const signInWithOAuth = vi.fn(async () => ({ error: null }));
const providerState = vi.hoisted(() => ({ google: true, azure: false }));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, loading: false, signIn, signUp: vi.fn() }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithOAuth: (...a: unknown[]) => signInWithOAuth(...a), exchangeCodeForSession: vi.fn(), getSession: async () => ({ data: { session: null } }) } },
  SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));
vi.mock('@/lib/auth-providers', async (orig) => {
  const actual = await orig<typeof import('@/lib/auth-providers')>();
  return { ...actual, fetchEnabledProviders: async () => ({ ...providerState }) };
});
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));

import Auth from '@/pages/Auth';
import { enforceSessionScope, setSessionScoped } from '@/lib/auth-storage';

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes><Route path="/auth" element={<Auth />} /><Route path="/signup" element={<Auth />} /></Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  signIn.mockClear(); signInWithOAuth.mockClear();
  localStorage.clear(); sessionStorage.clear();
  providerState.google = true; providerState.azure = false;
});

describe('sign-in hierarchy', () => {
  test('logo, heading, providers, email form, remember me, forgot, terms, sign-up link, back link', async () => {
    renderAt('/auth');
    expect(screen.getByLabelText(/Indigenous Rising AI — home/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByText(/or continue with email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByText(/By continuing, you agree/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Indigenous Rising/i })).toBeInTheDocument();
  });

  test('password fields carry the attributes password managers need', () => {
    renderAt('/auth');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
  });

  test('sign-up asks for a NEW password, so managers offer to generate one', () => {
    renderAt('/signup');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
  });
});

describe('providers', () => {
  test('Microsoft is hidden while the provider is disabled', async () => {
    renderAt('/auth');
    await screen.findByRole('button', { name: 'Continue with Google' });
    expect(screen.queryByRole('button', { name: /microsoft/i })).not.toBeInTheDocument();
  });

  test('Microsoft appears, full width, once the provider is enabled', async () => {
    providerState.azure = true;
    renderAt('/auth');
    const ms = await screen.findByRole('button', { name: 'Continue with Microsoft' });
    const google = screen.getByRole('button', { name: 'Continue with Google' });
    expect(ms.className).toContain('w-full');
    expect(google.className).toContain('w-full');
  });

  test('clicking Microsoft starts the azure flow', async () => {
    providerState.azure = true;
    const user = userEvent.setup();
    renderAt('/auth');
    await user.click(await screen.findByRole('button', { name: 'Continue with Microsoft' }));
    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalled());
    expect(signInWithOAuth.mock.calls[0][0]).toMatchObject({ provider: 'azure' });
  });

  test('no provider the brief excludes is offered', async () => {
    renderAt('/auth');
    await screen.findByRole('button', { name: 'Continue with Google' });
    for (const name of [/facebook/i, /linkedin/i, /github/i, /apple/i, /twitter/i]) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });
});

describe('remember me', () => {
  test('checked by default, and the session survives a browser restart', async () => {
    const user = userEvent.setup();
    renderAt('/auth');
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeChecked();
    await user.type(screen.getByLabelText(/email/i), 'someone@example.test');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(signIn).toHaveBeenCalled());

    sessionStorage.clear(); // browser closed and reopened
    expect(enforceSessionScope()).toBe(false); // session kept
  });

  test('unchecked, the stored session is dropped when the browser restarts', async () => {
    const user = userEvent.setup();
    renderAt('/auth');
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }));
    await user.type(screen.getByLabelText(/email/i), 'someone@example.test');
    await user.type(screen.getByLabelText('Password'), 'correct horse battery');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(() => expect(signIn).toHaveBeenCalled());

    localStorage.setItem('sb-upxojfcdtmqtcvgbjsym-auth-token', JSON.stringify({ access_token: 'a', user: { id: 'u' } }));
    expect(enforceSessionScope()).toBe(false); // same browser session: still signed in
    sessionStorage.clear(); // browser closed and reopened
    expect(enforceSessionScope()).toBe(true);
    expect(localStorage.getItem('sb-upxojfcdtmqtcvgbjsym-auth-token')).toBeNull();
  });

  test('a remembered session is never dropped', () => {
    setSessionScoped(false);
    localStorage.setItem('sb-upxojfcdtmqtcvgbjsym-auth-token', JSON.stringify({ access_token: 'a', user: { id: 'u' } }));
    sessionStorage.clear();
    expect(enforceSessionScope()).toBe(false);
    expect(localStorage.getItem('sb-upxojfcdtmqtcvgbjsym-auth-token')).not.toBeNull();
  });
});

describe('data-rights wording matches what the product actually does', () => {
  test('export is self-serve; deletion is on request', () => {
    renderAt('/signup');
    const line = screen.getByText(/Your data is stored in Canada/i);
    expect(line).toHaveTextContent(/Export it yourself at any time/i);
    expect(line).not.toHaveTextContent(/export or delete it at any time/i);
    expect(screen.getByRole('link', { name: /your data rights/i })).toHaveAttribute('href', '/data-rights');
  });
});
