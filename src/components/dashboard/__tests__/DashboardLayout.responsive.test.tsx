import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * The dashboard shell had no tests at all — every page test mocks it away, so
 * the component that owns navigation for all 23 pages was never exercised.
 *
 * jsdom has no layout engine, so this asserts responsive BEHAVIOUR (which
 * component the sidebar becomes, and whether a control exists to open it),
 * not pixel geometry. On mobile the sidebar must be off-canvas with a trigger
 * to reveal it; a fixed rail at 375px would eat the screen.
 */

const STABLE_USER = { id: 'u1', email: 'owner@example.test' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: STABLE_USER, loading: false, isAdmin: false, isTeamMember: false, signOut: vi.fn() }),
}));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ subscribed: false, product_id: null, price_id: null, subscription_end: null, isLoading: false }),
  SUBSCRIPTION_QUERY_KEY: 'subscription-status',
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
// The shell reads the subscription row, so the chain must terminate in the
// same shapes the component uses — maybeSingle/single/order, not just a promise.
const chain = () => {
  const result = Promise.resolve({ data: null, error: null });
  const node: Record<string, unknown> = {
    eq: () => node, order: () => node, limit: () => node,
    maybeSingle: () => result, single: () => result,
    then: (fn: (v: unknown) => unknown) => result.then(fn),
  };
  return node;
};
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => chain() }),
    auth: { getUser: () => Promise.resolve({ data: { user: STABLE_USER } }) },
  },
  SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));

import DashboardLayout from '../DashboardLayout';

const setWidth = (w: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: w });
};
const renderShell = () =>
  render(<MemoryRouter><DashboardLayout><p>page body</p></DashboardLayout></MemoryRouter>);

beforeEach(() => setWidth(1280));
afterEach(cleanup);

describe('dashboard shell', () => {
  test('renders its children on desktop', () => {
    setWidth(1280);
    renderShell();
    expect(screen.getByText('page body')).toBeInTheDocument();
  });

  test('renders its children at 375px', () => {
    setWidth(375);
    renderShell();
    expect(screen.getByText('page body')).toBeInTheDocument();
  });

  test('offers a control to open navigation on mobile', () => {
    setWidth(375);
    renderShell();
    // Without a trigger the sidebar is unreachable on a phone — navigation
    // would be dead for every dashboard page.
    expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument();
  });

  test('does not leave a fixed desktop rail on screen at 375px', () => {
    setWidth(375);
    const { container } = renderShell();
    // The primitive swaps to an off-canvas Sheet below 768px. A desktop rail
    // still expanded at 375px would occupy the viewport.
    expect(container.querySelector('[data-variant="sidebar"][data-state="expanded"]')).toBeNull();
  });
});
