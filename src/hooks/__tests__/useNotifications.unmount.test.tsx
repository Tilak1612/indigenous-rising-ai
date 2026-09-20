import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 't' }) }));
vi.mock('@/lib/supabase', () => ({ SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon' }));

import { useNotifications } from '@/hooks/useNotifications';

/**
 * The poll and the initial load outlive unmounts (route change, sign-out, test
 * teardown). Unguarded, the fetch resolved into a component that was gone; in
 * CI that surfaced as an unhandled "window is not defined" rejection which
 * failed the run even though every test passed.
 */
describe('useNotifications survives unmounting mid-request', () => {
  beforeEach(() => vi.unstubAllGlobals());

  // Behavioural note: jsdom does NOT reproduce the CI failure — the crash
  // needs the environment torn down under the in-flight promise, and an
  // unmounted setState is silent in React 18. A behavioural version of this
  // test passed with the guard removed, so it is asserted structurally
  // instead, which does fail when the guard goes.
  test('every state update after the await is guarded by the alive ref', () => {
    const src = readFileSync('src/hooks/useNotifications.ts', 'utf8');
    const load = /const load = useCallback\(async \(\) => \{[\s\S]*?\}, \[user\]\);/.exec(src)?.[0] ?? '';
    expect(load, 'load() not found — update this guard').not.toBe('');
    expect(load).toMatch(/const rows =[\s\S]*?if \(!alive\.current\) return;[\s\S]*?setNotifications\(rows\)/);
    expect(load).toMatch(/if \(alive\.current\) setLoading\(false\)/);
    expect(src).toMatch(/return \(\) => \{ alive\.current = false; \};/);
  });

  test('it still loads normally while mounted', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [{ id: 'n1', type: 't', title: 'T', message: 'm', read: false, created_at: '2026-01-01' }] })));
    const { result } = renderHook(() => useNotifications(0));
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
    expect(result.current.loading).toBe(false);
  });
});
