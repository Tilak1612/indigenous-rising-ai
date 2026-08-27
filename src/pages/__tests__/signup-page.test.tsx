import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { readFileSync } from 'node:fs';
import { DATA_RESIDENCY_LINE } from '@/lib/trust-copy';
import { scorePassword } from '@/lib/password-strength';

const signInWithOAuth = vi.fn(async () => ({ error: null }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signIn: vi.fn(), signUp: vi.fn() }),
}));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...a: unknown[]) => signInWithOAuth(...a),
      getSession: async () => ({ data: { session: null } }),
    },
  },
  SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));

import Auth from '../Auth';

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  signInWithOAuth.mockClear();
  sessionStorage.clear();
});

describe('the default /auth screen states its value', () => {
  test('the recap renders even in sign-in mode', () => {
    // It used to render only while registering, and /auth defaults to
    // sign-in — so the front door of the funnel said nothing at all.
    renderAt('/auth');
    expect(screen.getByText(/3 free funding matches every month/i)).toBeInTheDocument();
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument();
  });

  test('a Google option is offered', () => {
    renderAt('/auth');
    expect(screen.getByRole('button', { name: /with google/i })).toBeInTheDocument();
  });
});

describe('registration mode', () => {
  test('/signup shows the step indicator and trust line', () => {
    renderAt('/signup');
    expect(screen.getByText(/Step 1 of 2: Create your account/i)).toBeInTheDocument();
    expect(screen.getByText(DATA_RESIDENCY_LINE)).toBeInTheDocument();
  });

  test('the trust line is the Trust Center wording verbatim, not a paraphrase', () => {
    // Asserted against the shared constant AND the compliance page, so the
    // two surfaces cannot drift into making different promises.
    const compliance = readFileSync('src/pages/CanadianCompliance.tsx', 'utf8');
    expect(compliance).toContain('DATA_RESIDENCY_LINE');
    expect(compliance).not.toContain(
      'All user data is stored exclusively on Canadian servers, subject to Canadian jurisdiction.');
  });

  test('sign-in mode shows no step indicator — there is no step 2', () => {
    renderAt('/auth');
    expect(screen.queryByText(/Step 1 of 2/i)).not.toBeInTheDocument();
  });
});

describe('the mode follows the route, not the first mount', () => {
  test('/signup renders the registration form', async () => {
    renderAt('/signup');
    expect(await screen.findByRole('heading', { name: /create an account/i })).toBeInTheDocument();
  });

  test('/auth renders the sign-in form', async () => {
    renderAt('/auth');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});

describe('password controls', () => {
  test('both fields have a show/hide toggle that reveals the value', async () => {
    const user = userEvent.setup();
    renderAt('/signup');
    const pw = document.getElementById('password') as HTMLInputElement;
    expect(pw.type).toBe('password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(pw.type).toBe('text');

    const confirm = document.getElementById('confirm-password') as HTMLInputElement;
    expect(confirm.type).toBe('password');
    await user.click(screen.getByRole('button', { name: /show confirmed password/i }));
    expect(confirm.type).toBe('text');
  });

  test('the strength meter appears only once something is typed', async () => {
    const user = userEvent.setup();
    renderAt('/signup');
    expect(screen.queryByTestId('password-strength')).not.toBeInTheDocument();
    await user.type(document.getElementById('password') as HTMLElement, 'abc');
    expect(await screen.findByTestId('password-strength')).toBeInTheDocument();
  });

  test('a score of zero does not render a stray full stop', async () => {
    // "Password strength: . Use at least 8 characters" is what naive
    // concatenation produced when the label was empty. Asserted on the
    // RENDERED text: checking scorePassword's return values alone left the
    // rendering free to regress, and it did when mutated.
    const user = userEvent.setup();
    renderAt('/signup');
    await user.type(document.getElementById('password') as HTMLElement, 'abc');
    const meter = await screen.findByTestId('password-strength');
    expect(meter.textContent).toBe('Use at least 8 characters');
    expect(meter.textContent).not.toMatch(/:\s*\./);
    expect(meter.textContent).not.toMatch(/strength:\s*$/i);
  });

  test('strength describes properties, never an invented score', () => {
    expect(scorePassword('').score).toBe(0);
    expect(scorePassword('abcdefgh').label).toBe('Weak');
    expect(scorePassword('Abcdefgh1!xyz').label).toBe('Strong');
    // The 8-character minimum stays a schema concern; this only describes.
    expect(scorePassword('Ab1!').advice).toBe('Use at least 8 characters');
  });

  test('Confirm Password is retained and still required', () => {
    // Kept deliberately: the show/hide toggle helps a sighted user catch a
    // typo, but it does not catch one in a password manager fill or on a
    // screen reader. The match check is the only thing that does.
    renderAt('/signup');
    const confirm = document.getElementById('confirm-password') as HTMLInputElement;
    expect(confirm).toBeTruthy();
    expect(confirm.required).toBe(true);
  });
});

describe('OAuth preserves plan and campaign', () => {
  test('the redirect carries the same context as an email signup', async () => {
    const user = userEvent.setup();
    renderAt('/signup?plan=Ogichidaakwe&billing=annual&utm_source=audit&utm_campaign=spring');
    await user.click(screen.getByRole('button', { name: /with google/i }));

    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    const [args] = signInWithOAuth.mock.calls[0] as [{ provider: string; options: { redirectTo: string } }];
    expect(args.provider).toBe('google');

    const url = new URL(args.options.redirectTo);
    expect(url.searchParams.get('plan')).toBe('Ogichidaakwe');
    expect(url.searchParams.get('billing')).toBe('annual');
    expect(url.searchParams.get('utm_source')).toBe('audit');
    expect(url.searchParams.get('utm_campaign')).toBe('spring');

    // Also persisted, so the context survives even if the provider drops
    // the query string.
    const stored = JSON.parse(sessionStorage.getItem('ir-signup-intent') ?? '{}');
    expect(stored.plan).toBe('Ogichidaakwe');
    expect(stored.campaign?.utm_source).toBe('audit');
  });

  test('only Google is offered — azure is disabled on this project', () => {
    // Verified against the live GoTrue settings endpoint: external.google
    // true, external.azure false. A Microsoft button would fail on click.
    renderAt('/signup');
    expect(screen.getByRole('button', { name: /with google/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /microsoft/i })).not.toBeInTheDocument();
  });
});

describe('no invented statistics or quotes', () => {
  test('the page shows no unsourced numeric claim', () => {
    const src = readFileSync('src/pages/Auth.tsx', 'utf8');
    // Real data at the time of writing: 17 grants, 0 with
    // verification_status='verified', 0 funding applications, no consented
    // founder quotes. There is no honest proof point to show, so none is
    // shown — an invented one would contradict the product's whole premise.
    const claims = [...src.matchAll(/>\s*([\d,]{2,})\+?\s*(entrepreneurs|businesses|users|members|funded|matched)/gi)];
    expect(claims.map((m) => m[0])).toEqual([]);
    expect(src).not.toMatch(/thousands of (entrepreneurs|businesses|users)/i);
  });
});
