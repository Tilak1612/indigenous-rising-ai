import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Referentially stable — these pages memoise load() on [user] and re-run it in
// an effect, so a fresh object per call re-fires the effect forever.
const STABLE_USER = { id: 'u1', email: 'owner@example.test' };
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: STABLE_USER, loading: false }) }));
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 'tok' }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: {}, SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));
const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...a: unknown[]) => toastError(...a), success: (...a: unknown[]) => toastSuccess(...a) },
}));

import Support from '../Support';
import Team from '../Team';

const res = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({ ok, status, json: () => Promise.resolve(body) } as Response);

let fetchMock: ReturnType<typeof vi.fn>;
const posts = () => fetchMock.mock.calls.filter(([, i]) => (i as RequestInit)?.method === 'POST');

beforeEach(() => {
  toastError.mockClear(); toastSuccess.mockClear();
  fetchMock = vi.fn((url: string, init?: RequestInit) =>
    !init?.method || init.method === 'GET' ? res([]) : res([{ id: 'x' }]));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('Support — raising a ticket', () => {
  test('refuses a ticket with no subject or description', async () => {
    render(<Support />);
    // The form is behind a dialog; the submit button does not exist until it opens.
    await userEvent.click(await screen.findByRole('button', { name: /new ticket/i }));
    await userEvent.click(await screen.findByRole('button', { name: /submit ticket/i }));
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    // Nothing may be written for an empty ticket.
    expect(posts()).toHaveLength(0);
  });
});

describe('Team — inviting a member', () => {
  test('refuses an invalid email before writing anything', async () => {
    render(<Team />);
    const email = await screen.findByPlaceholderText(/email/i);
    await userEvent.type(email, 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /add invitation/i }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/valid email/i)));
    expect(posts()).toHaveLength(0);
  });

  test('refuses to invite the owner to their own team', async () => {
    render(<Team />);
    const email = await screen.findByPlaceholderText(/email/i);
    // Same address as the signed-in owner, in different case — the guard
    // lowercases both sides, so casing must not defeat it.
    await userEvent.type(email, 'Owner@Example.TEST');
    await userEvent.click(screen.getByRole('button', { name: /add invitation/i }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/already the owner/i)));
    expect(posts()).toHaveLength(0);
  });

  test('sends a valid invite as pending, owned by the caller', async () => {
    render(<Team />);
    const email = await screen.findByPlaceholderText(/email/i);
    await userEvent.type(email, 'colleague@example.test');
    await userEvent.click(screen.getByRole('button', { name: /add invitation/i }));

    await waitFor(() => expect(posts()).toHaveLength(1));
    const body = JSON.parse((posts()[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ owner_id: 'u1', email: 'colleague@example.test', status: 'pending' });
  });

  test('reports a duplicate invite instead of silently succeeding', async () => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) =>
      init?.method === 'POST' ? res({}, false, 409) : res([]));
    render(<Team />);
    const email = await screen.findByPlaceholderText(/email/i);
    await userEvent.type(email, 'colleague@example.test');
    await userEvent.click(screen.getByRole('button', { name: /add invitation/i }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/already invited/i)));
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
