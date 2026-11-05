/**
 * Native-app context (src/lib/native-context.ts): what the mobile app's
 * in-app browser sees, and that an ordinary visit is unchanged. Everything is
 * mocked; nothing reaches Supabase, Stripe or the network.
 */
import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const auth = vi.hoisted(() => ({ user: null as null | { id: string; email: string } }));
const sub = vi.hoisted(() => ({ subscribed: false, product_id: null as string | null, price_id: null as string | null }));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: auth.user, loading: false, isAdmin: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }),
}));
vi.mock('@/hooks/useSubscription', () => ({ useSubscription: () => ({ ...sub, loading: false }) }));
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 0, markRead: vi.fn(), markAllRead: vi.fn() }),
}));
vi.mock('@/lib/supabase', () => {
  const chain: Record<string, unknown> = {};
  for (const op of ['from', 'select', 'eq']) chain[op] = () => chain;
  chain.maybeSingle = async () => ({ data: null, error: null });
  return {
    supabase: {
      ...chain,
      auth: { signInWithOAuth: vi.fn(), exchangeCodeForSession: vi.fn(), getSession: async () => ({ data: { session: null } }) },
    },
    SUPABASE_URL: 'https://example.test',
    SUPABASE_ANON_KEY: 'anon',
  };
});
vi.mock('@/lib/auth-callback', () => ({ consumeAuthRedirect: async () => ({ status: 'none' }) }));
vi.mock('@/lib/auth-providers', async (orig) => {
  const actual = await orig<typeof import('@/lib/auth-providers')>();
  return { ...actual, fetchEnabledProviders: async () => ({ google: true, azure: false }) };
});
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));

import {
  captureNativeContext,
  isNativeContext,
  postAuthPath,
  NATIVE_CONTEXT_STORAGE_KEY,
  NATIVE_PROFILE_PATH,
} from '@/lib/native-context';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Profile from '@/pages/dashboard/Profile';
import Auth from '@/pages/Auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function Where() {
  const l = useLocation();
  return <div data-testid="where">{l.pathname + l.search}</div>;
}

const inRouter = (ui: React.ReactNode, path = '/faq') =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  auth.user = null;
  sub.subscribed = false;
  window.history.replaceState(null, '', '/');
  vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } })));
});

describe('context capture', () => {
  test('?context=app is recorded for the tab and survives later navigation', () => {
    captureNativeContext('?context=app');
    expect(sessionStorage.getItem(NATIVE_CONTEXT_STORAGE_KEY)).toBe('1');
    expect(isNativeContext('')).toBe(true);
    expect(isNativeContext('?code=abc')).toBe(true); // OAuth return to /auth
  });

  test('anything else is not native context', () => {
    for (const q of ['', '?context=APP', '?context=web', '?ctx=app', '?context=app2']) {
      sessionStorage.clear();
      captureNativeContext(q);
      expect(isNativeContext(q), q).toBe(false);
    }
  });

  test('blocked storage: the parameter still applies to the page itself', () => {
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(() => captureNativeContext('?context=app', blocked)).not.toThrow();
    expect(isNativeContext('?context=app', blocked)).toBe(true);
    expect(isNativeContext('', blocked)).toBe(false);
  });

  test('sign-in destination', () => {
    expect(postAuthPath(false)).toBe('/dashboard');
    expect(postAuthPath(true)).toBe('/dashboard/profile?context=app');
    expect(NATIVE_PROFILE_PATH).toBe('/dashboard/profile?context=app');
  });
});

describe('legal and FAQ pages: Pricing navigation', () => {
  test('ordinary visit keeps the Pricing nav item and footer link', () => {
    inRouter(<><Navigation /><Footer /></>);
    expect(screen.getAllByText('Pricing')).toHaveLength(3); // desktop nav, mobile menu, footer
    expect(screen.getAllByRole('link', { name: 'Pricing' }).map((a) => a.getAttribute('href'))).toEqual(['#pricing', '/pricing']); // closed mobile menu is not exposed
  });

  test('native context: no Pricing, legal, support and resource links stay', () => {
    captureNativeContext('?context=app');
    inRouter(<><Navigation /><Footer /></>);
    expect(screen.queryByText('Pricing')).toBeNull();
    for (const name of ['FAQ', 'Find funding', 'What is OCAP®?']) {
      expect(screen.getAllByText(name).length, name).toBeGreaterThan(0);
    }
    expect(screen.getAllByText('Platform').length).toBeGreaterThan(0);
  });

  test('pre-JS: the prerendered Pricing links are tagged and hidden by the head script + CSS', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toMatch(/get\('context'\)==='app'\|\|sessionStorage\.getItem\('ira\.nativeContext'\)==='1'/);
    expect(html).toMatch(/setAttribute\('data-native-context',''\)/);
    expect(readFileSync('src/index.css', 'utf8')).toMatch(/html\[data-native-context\] \[data-native-hide\]\s*\{\s*display: none !important;/);
    // Ordinary render (as prerendered): the attribute is present on exactly the Pricing items.
    const { container } = inRouter(<><Navigation /><Footer /></>);
    const tagged = [...container.querySelectorAll('[data-native-hide]')].map((el) => el.textContent?.trim());
    expect(tagged).toEqual(['Pricing', 'Pricing', 'Pricing']);
  });
});

describe('dashboard chrome', () => {
  beforeEach(() => {
    auth.user = { id: 'u1', email: 'u1@example.invalid' };
  });

  test('ordinary visit (free plan): header Upgrade link, sidebar badge and locked-feature CTA are there', async () => {
    inRouter(<DashboardLayout><p>content</p></DashboardLayout>, '/dashboard');
    expect(screen.getByRole('link', { name: /upgrade your plan/i })).toHaveAttribute('href', '/pricing');
    expect(screen.getAllByText('Upgrade').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: /Impact Analytics/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /View Pricing/ })).toHaveAttribute('href', '/pricing');
  });

  test('native context: no Upgrade link, badges or pricing CTA; the locked dialog only closes', async () => {
    captureNativeContext('?context=app');
    inRouter(<DashboardLayout><p>content</p></DashboardLayout>, '/dashboard');
    expect(screen.queryByRole('link', { name: /upgrade your plan/i })).toBeNull();
    expect(screen.queryByText('Upgrade')).toBeNull();
    expect(screen.queryByText('Contact Us')).toBeNull();
    expect(document.querySelector('a[href="/pricing"]')).toBeNull();

    // Open a locked (paid-tier) item: the dialog says so without a purchase route.
    await userEvent.click(screen.getByRole('button', { name: /Impact Analytics/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Impact Analytics is not included in your current plan.')).toBeInTheDocument();
    expect(within(dialog).queryByRole('link')).toBeNull();
    expect(within(dialog).queryByText(/View Pricing|Contact Sales|Upgrade/)).toBeNull();
    expect(within(dialog).getAllByRole('button', { name: 'Close' }).length).toBeGreaterThan(0);
  });
});

describe('profile page', () => {
  beforeEach(() => {
    auth.user = { id: 'u1', email: 'u1@example.invalid' };
  });

  test('ordinary visit renders inside the dashboard layout', async () => {
    inRouter(<Profile />, '/dashboard/profile');
    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.queryByTestId('native-context-layout')).toBeNull();
    expect(screen.getByRole('link', { name: /upgrade your plan/i })).toBeInTheDocument();
  });

  test('native context: first render is the profile form alone, with no links at all', async () => {
    window.history.replaceState(null, '', '/dashboard/profile?context=app');
    captureNativeContext();
    inRouter(<Profile />, '/dashboard/profile?context=app');
    const layout = screen.getByTestId('native-context-layout');
    expect(within(layout).getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(within(layout).getByText(/close this window to return to the app/i)).toBeInTheDocument();
    expect(layout.querySelectorAll('a')).toHaveLength(0);
    // The page still loads the profile the same way (direct REST read under RLS).
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(String((fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0])).toMatch(/\/rest\/v1\/profiles\?select=.*&id=eq\.u1/);
  });
});

describe('sign-in returns to the profile in native context', () => {
  const app = (path: string) =>
    inRouter(
      <Routes>
        <Route path="/auth" element={<><Auth /><Where /></>} />
        <Route path="/dashboard" element={<Where />} />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Where />
            </ProtectedRoute>
          }
        />
      </Routes>,
      path,
    );

  test('signed out at the profile: sent to /auth; once signed in, back to the profile with the context', async () => {
    captureNativeContext('?context=app'); // what main.tsx does on arrival
    const { rerender } = app('/dashboard/profile?context=app');
    expect(await screen.findByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByTestId('where').textContent).toBe('/auth');

    auth.user = { id: 'u1', email: 'u1@example.invalid' };
    rerender(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <Routes>
            <Route path="/auth" element={<><Auth /><Where /></>} />
            <Route path="/dashboard" element={<Where />} />
            <Route path="/dashboard/profile" element={<Where />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/dashboard/profile?context=app'));
  });

  test('ordinary sign-in still goes to the dashboard', async () => {
    auth.user = { id: 'u1', email: 'u1@example.invalid' };
    app('/auth');
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/dashboard'));
  });
});
