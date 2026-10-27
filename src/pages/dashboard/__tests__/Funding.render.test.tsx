import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';

// Mocking auth/subscription in a unit test is standard practice — it is how a
// protected component is tested at all, and it changes nothing in production.
const subState = vi.hoisted(() => ({ subscribed: true }));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ subscribed: subState.subscribed, product_id: 'prod_x', price_id: null, subscription_end: null, isLoading: false }),
  SUBSCRIPTION_QUERY_KEY: 'subscription-status',
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'qa@example.test' }, loading: false }),
}));
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/supabase', () => ({ SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon', supabase: {} }));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 'tok', user: { id: 'u1' } }) }));

import { MemoryRouter } from 'react-router-dom';
import Funding from '../Funding';
import { DEFAULT_SAVED_STATUS, SAVED_MATCH_STATUSES } from '@/lib/funding-status';

const renderPage = () => render(<MemoryRouter><Funding /></MemoryRouter>);

const GRANT = {
  id: 'g1', slug: 'aboriginal-business-financing-program', name: 'Aboriginal Business Financing Program', funder: 'NACCA',
  description: 'Non-repayable contribution toward start-up costs.', funding_type: 'grant', is_repayable: false,
  amount_min: 10000, amount_max: 99999, amount_currency: 'CAD', deadline: null, opens_at: null, is_recurring: true,
  recurrence_notes: null, intake_status: 'rolling', provinces: ['ON'], industries: [], business_stages: [],
  applicant_types: [], identity_criteria: null, ownership_min_pct: null, entrepreneur_age_min: null, entrepreneur_age_max: null,
  business_age_max_months: null, revenue_max: null, program_category: [], eligibility_notes: 'Indigenous-owned',
  eligibility_exclusions: null, matching_funds_required: null, matching_funds_notes: null, eligible_expenses: [],
  documents_required: [], application_steps: [], repayment_terms: null, source_url: 'https://nacca.ca/abfp',
  application_url: 'https://nacca.ca/abfp', apply_url: 'https://nacca.ca/abfp', apply_link_type: 'program_page',
  application_method: 'online', last_verified: '2026-08-01', verification_status: 'unverified',
  verification_confidence: 'medium', source_published_date: null, source_evidence: [], updated_at: '2026-10-26T00:00:00Z',
};
const LOAN = { ...GRANT, id: 'g2', slug: 'bdc-loan', name: 'BDC Indigenous Entrepreneur Loan', funder: 'BDC', funding_type: 'loan', is_repayable: true };

// The page reads PostgREST directly. One fetch mock routes each request by
// URL so the tests can describe the catalogue, a failure, or a pending load.
type Handler = (url: string, init?: RequestInit) => Promise<Response> | Response;
const calls: Array<{ url: string; init?: RequestInit }> = [];
let grantsHandler: Handler;
const json = (body: unknown, total?: number, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...(total !== undefined ? { 'content-range': `0-${Math.max(0, total - 1)}/${total}` } : {}) } });

beforeEach(() => {
  calls.length = 0;
  subState.subscribed = true;
  grantsHandler = () => json([GRANT, LOAN], 2);
  vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    if (url.includes('/rest/v1/grants')) return Promise.resolve(grantsHandler(url, init));
    if (url.includes('/rest/v1/funding_saved_matches')) return Promise.resolve(init?.method === 'POST' || init?.method === 'DELETE' ? new Response(null, { status: 204 }) : json([]));
    return Promise.resolve(new Response('not found', { status: 404 }));
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('Funding Navigator renders from the verified catalogue', () => {
  test('shows real programmes returned by the grants query', async () => {
    renderPage();
    expect(await screen.findByText(/Aboriginal Business Financing Program/)).toBeInTheDocument();
    expect(screen.getByText(/BDC Indigenous Entrepreneur Loan/)).toBeInTheDocument();
    expect(calls.some((c) => c.url.includes('/rest/v1/grants') && c.url.includes('is_published=eq.true'))).toBe(true);
  });

  test('marks a repayable programme so a loan is never mistaken for a grant', async () => {
    grantsHandler = () => json([LOAN], 1);
    renderPage();
    await screen.findByText(/BDC Indigenous Entrepreneur Loan/);
    expect(screen.getByText(/^Loan$/)).toBeInTheDocument();
    expect(screen.queryByText(/^Grant$/)).not.toBeInTheDocument();
  });

  test('never renders a match percentage — no criteria back one', async () => {
    renderPage();
    await screen.findByText(/Aboriginal Business Financing Program/);
    expect(screen.queryByText(/\d+%\s*match/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Avg Match Score|Available Funding/i)).not.toBeInTheDocument();
  });

  test('surfaces a load failure instead of rendering an empty list', async () => {
    grantsHandler = () => new Response('boom', { status: 500 });
    renderPage();
    // "no programmes" would be a lie when the truth is "we could not load them".
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t load funding programmes/i);
    expect(screen.queryByText(/No programmes match/i)).not.toBeInTheDocument();
  });

  test('while loading, it says so — never "No programmes match"', () => {
    // Asserted from the source rather than by rendering a pending fetch: a
    // response left pending across tests stalled the vitest worker (three
    // variants tried, each hung the next test). The branch order below is
    // what guarantees the loading text is shown before any empty state.
    const src = readFileSync('src/pages/dashboard/Funding.tsx', 'utf8');
    const loadingAt = src.indexOf('Loading funding programmes');
    const emptyAt = src.indexOf('No programmes match those filters');
    expect(loadingAt).toBeGreaterThan(-1);
    expect(emptyAt).toBeGreaterThan(loadingAt);
    expect(src).toMatch(/\{loading \? \(\s*<div[^>]*role="status"/);
  });

  test('the empty state is shown only when the catalogue really is empty', async () => {
    grantsHandler = () => json([], 0);
    renderPage();
    expect(await screen.findByText(/No programmes match those filters/i)).toBeInTheDocument();
  });
});

describe('browsing is free', () => {
  test('a free user sees the programmes, not an upgrade wall', async () => {
    // plans.ts lists "Funding opportunity browser" on the free plan; the page
    // used to show an upgrade card and blurred rows instead.
    subState.subscribed = false;
    renderPage();
    expect(await screen.findByText(/Aboriginal Business Financing Program/)).toBeInTheDocument();
    expect(screen.queryByText(/Unlock AI-Powered Funding Matches/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Upgrade to see all/i)).not.toBeInTheDocument();
    // Saving stays on Growth, so no Save control for a free user.
    expect(screen.queryByRole('button', { name: /^Save / })).not.toBeInTheDocument();
  });
});

describe('saving an opportunity persists', () => {
  test('writes to funding_saved_matches instead of only local state', async () => {
    grantsHandler = () => json([GRANT], 1);
    renderPage();
    await screen.findByText(/Aboriginal Business Financing Program/);

    // Named control — an icon-only button with no accessible name announces
    // only "button" to a screen reader.
    const saveBtn = screen.getByRole('button', { name: /^Save Aboriginal Business Financing Program$/i });
    expect(saveBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(saveBtn);
    await waitFor(() => expect(calls.some((c) => c.url.includes('/rest/v1/funding_saved_matches') && c.init?.method === 'POST')).toBe(true));
    const post = calls.find((c) => c.url.includes('/rest/v1/funding_saved_matches') && c.init?.method === 'POST')!;
    const payload = JSON.parse(String(post.init?.body)) as Record<string, unknown>;
    // Asserted against the shared constant, not a literal: the mock accepts
    // any string while Postgres rejects anything outside the CHECK constraint.
    expect(payload).toMatchObject({ user_id: 'u1', grant_id: 'g1', status: DEFAULT_SAVED_STATUS });
    expect(SAVED_MATCH_STATUSES).toContain(payload.status);
    expect(saveBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
