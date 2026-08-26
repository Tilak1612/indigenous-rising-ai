import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

const STABLE_USER = { id: 'u1', email: 'qa@example.test' };
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

import Documents from '../Documents';

const res = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);

let fetchMock: ReturnType<typeof vi.fn>;
const calls = () => fetchMock.mock.calls.map(([u, i]) => ({ url: String(u), method: (i as RequestInit)?.method }));

beforeEach(() => {
  toastError.mockClear(); toastSuccess.mockClear();
  fetchMock = vi.fn((url: string, init?: RequestInit) => {
    if (!init?.method || init.method === 'GET') return res([]);
    return res({}, true);
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const pick = async (file: File) => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  expect(input, 'file input should exist').toBeTruthy();
  await userEvent.upload(input, file);
};

describe('Documents — upload workflow', () => {
  test('rejects a file over 10 MB before any network call', async () => {
    render(<Documents />);
    await screen.findByText('No documents yet');
    const big = new File([new Uint8Array(11 * 1024 * 1024)], 'huge.pdf', { type: 'application/pdf' });
    await pick(big);
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/too large/i)));
    // No upload should be attempted at all.
    expect(calls().some((c) => c.method === 'POST')).toBe(false);
  });

  test('uploads bytes then metadata, scoping the path to the user', async () => {
    render(<Documents />);
    await screen.findByText('No documents yet');
    await pick(new File(['hello'], 'Articles of Incorporation.pdf', { type: 'application/pdf' }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const posts = calls().filter((c) => c.method === 'POST');
    expect(posts).toHaveLength(2);
    // Bytes go to the private bucket under the caller's own id — never a shared root.
    expect(posts[0].url).toContain('/object/documents/u1/');
    // Filename is sanitised, so spaces cannot become path segments.
    expect(posts[0].url).not.toContain(' ');
    expect(posts[1].url).toContain('/documents');
  });

  test('deletes the uploaded bytes if the metadata write fails', async () => {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (!init?.method || init.method === 'GET') return res([]);
      if (init.method === 'POST' && String(url).includes('/rest/')) return res({}, false); // metadata fails
      return res({}, true);
    });
    render(<Documents />);
    await screen.findByText('No documents yet');
    await pick(new File(['hello'], 'doc.pdf', { type: 'application/pdf' }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/upload failed/i)));
    // Without cleanup the bytes stay in the bucket with no row pointing at them:
    // invisible to the user, undeletable, and duplicated on every retry.
    const deletes = calls().filter((c) => c.method === 'DELETE');
    expect(deletes).toHaveLength(1);
    expect(deletes[0].url).toContain('/object/documents/u1/');
  });
});
