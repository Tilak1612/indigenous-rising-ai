import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Every dashboard page must mount without throwing.
 *
 * This is deliberately shallow — it proves no page crashes on render, which is
 * the failure mode a user meets as a blank screen or an error boundary. The
 * five pages that take input and write it have real workflow tests elsewhere;
 * the rest are stubs or read-only, and a mount check is the honest limit of
 * what can be asserted about them without inventing behaviour to test.
 */

const STABLE_USER = { id: 'u1', email: 'owner@example.test' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: STABLE_USER, loading: false, isAdmin: false, isTeamMember: false }),
}));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ subscribed: true, product_id: 'prod_x', price_id: null, subscription_end: null, isLoading: false }),
  SUBSCRIPTION_QUERY_KEY: 'subscription-status',
}));
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/auth-storage', () => ({
  readStoredSession: () => ({ access_token: 'tok' }),
  readAccessToken: () => 'tok',
}));
// ReadinessWorkspace is flag-gated and renders a redirect when off, which
// this file's "something must be on screen" assertion would read as a
// silent failure. The off path is covered in ReadinessWorkspace.workflow.
vi.mock('@/lib/flags', () => ({ FLAGS: { readinessWorkspace: true } }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warning: vi.fn() } }));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }),
                                    single: () => Promise.resolve({ data: null, error: null }),
                                    order: () => Promise.resolve({ data: [], error: null }),
                                    then: (r: (v: unknown) => unknown) => r({ data: [], error: null }) }) }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      upsert: () => Promise.resolve({ error: null }),
      delete: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
    }),
    auth: { getUser: () => Promise.resolve({ data: { user: STABLE_USER } }) },
    storage: { from: () => ({ createSignedUrl: () => Promise.resolve({ data: null, error: null }) }) },
  },
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'anon',
}));

const PAGES = [
  'Analytics', 'ApiAccess', 'Assistant', 'BusinessPlanner', 'BusinessTools',
  'Certifications', 'Compliance', 'Documents', 'Forum', 'Funding',
  'FundingMatches', 'Integrations', 'Network', 'Profile', 'Resources',
  'ReadinessWorkspace', 'SavedMatches', 'Security', 'Settings', 'Support', 'Tasks', 'Team',
  'Templates', 'TrainingCalendar',
] as const;

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) } as Response)));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('every dashboard page mounts', () => {
  test.each(PAGES)('%s renders without throwing', async (name) => {
    const mod = await import(`../${name}.tsx`);
    const Page = (mod.default ?? mod[name]) as React.ComponentType;
    expect(Page, `${name} should export a component`).toBeTruthy();
    expect(() => render(<MemoryRouter><Page /></MemoryRouter>)).not.toThrow();
    // Something must actually be on screen — an empty render is a silent failure.
    expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });
});
