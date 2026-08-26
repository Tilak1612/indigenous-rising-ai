import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// The user object MUST be referentially stable. Tasks does
//   const load = useCallback(..., [user]);  useEffect(() => load(), [load]);
// so a fresh object each call changes load's identity every render and the
// effect re-fires forever. In production `user` comes from useState and is
// stable; a naive mock is not.
const STABLE_USER = { id: 'u1', email: 'qa@example.test' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: STABLE_USER, loading: false }),
}));
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 'tok' }) }));
const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (...a: unknown[]) => toastError(...a), success: (...a: unknown[]) => toastSuccess(...a) } }));
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'anon',
}));

import Tasks from '../Tasks';

const jsonRes = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);

// Stateful, because addTask calls load() straight after inserting in order to
// re-sort by due date. A mock that returns [] on GET would wipe the row the
// POST just created and make a working component look broken.
let fetchMock: ReturnType<typeof vi.fn>;
let rows: Record<string, unknown>[];
beforeEach(() => {
  rows = [];
  fetchMock = vi.fn((url: string, init?: RequestInit) => {
    if (!init || init.method === undefined) return jsonRes(rows);      // load()
    if (init.method === 'POST') {
      const body = JSON.parse(init.body as string);
      const created = { id: 't1', created_at: new Date().toISOString(), ...body };
      rows = [created, ...rows];
      return jsonRes([created]);
    }
    return jsonRes([]);
  });
  vi.stubGlobal('fetch', fetchMock);
  toastError.mockClear();
  toastSuccess.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe('Tasks — the deadline workflow', () => {
  test('refuses an empty task instead of writing a blank row', async () => {
    render(<Tasks />);
    const add = await screen.findByRole('button', { name: /add task/i });
    await userEvent.click(add);
    // No POST should be attempted for an empty title.
    await waitFor(() => {
      const posts = fetchMock.mock.calls.filter(([, i]) => (i as RequestInit)?.method === 'POST');
      expect(posts).toHaveLength(0);
    });
  });

  test('creating a task persists it and shows it in the list', async () => {
    render(<Tasks />);
    const input = await screen.findByPlaceholderText(/e\.g\./i);
    await userEvent.type(input, 'Submit ABFP application');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      const posts = fetchMock.mock.calls.filter(([, i]) => (i as RequestInit)?.method === 'POST');
      expect(posts).toHaveLength(1);
      const body = JSON.parse((posts[0][1] as RequestInit).body as string);
      // The row must be owned by the caller and start as todo.
      expect(body).toMatchObject({ user_id: 'u1', title: 'Submit ABFP application', status: 'todo' });
    });
    expect(await screen.findByText('Submit ABFP application')).toBeInTheDocument();
  });

  test('a failed write does not leave the task on screen', async () => {
    // ok:false with a DESTRUCTURABLE body. If the body were {}, removing the
    // `if (!res.ok) throw` guard would blow up on `const [created] = {}` and be
    // caught anyway — the test would pass for the wrong reason and prove
    // nothing about the guard. This shape means only the guard can stop it.
    fetchMock.mockImplementation((url: string, init?: RequestInit) =>
      init?.method === 'POST'
        ? jsonRes([{ id: 'x', title: 'Task that fails', description: null,
                     task_type: 'task', due_date: null, status: 'todo',
                     created_at: new Date().toISOString() }], false)
        : jsonRes([]));
    render(<Tasks />);
    const input = await screen.findByPlaceholderText(/e\.g\./i);
    await userEvent.type(input, 'Task that fails');
    await userEvent.click(screen.getByRole('button', { name: /add task/i }));
    // The guard's observable effect is the error toast. Asserting only that the
    // task is absent proves nothing: without the guard the row is added, then
    // load() refetches, the server has nothing, and it vanishes anyway — so the
    // assertion would pass either way. The toast is the real contract.
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.queryByText('Task that fails')).not.toBeInTheDocument();
  });
});
