import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

const STABLE_USER = { id: 'u1', email: 'qa@example.test' };
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: STABLE_USER, loading: false }) }));
const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (...a: unknown[]) => toastError(...a), success: vi.fn() } }));

const upsertMock = vi.fn(() => Promise.resolve({ error: null }));
let grantsResult: unknown = { data: [], error: null };
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (t: string) =>
      t === 'business_profiles'
        ? { upsert: (...a: unknown[]) => upsertMock(...a) }
        : { select: () => ({ eq: () => Promise.resolve(grantsResult) }) },
  },
  SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));

import { TooltipProvider } from '@/components/ui/tooltip';
import OnboardingWizard from '../OnboardingWizard';

const GRANT = {
  id: 'g1', name: 'Aboriginal Business Financing Program', funder: 'NACCA',
  funding_type: 'grant', is_repayable: false, source_url: 'https://nacca.ca',
  last_verified: '2026-08-01', provinces: ['ON'], industries: ['Technology'],
  business_stages: ['startup'],
};

const answerAll = async (u: ReturnType<typeof userEvent.setup>) => {
  const picks = ['First Nations', 'ON', 'Starting — first customers', 'Technology', 'No revenue yet', 'Find funding'];
  for (const choice of picks) {
    await u.click(screen.getByRole('combobox'));
    await u.click(await screen.findByRole('option', { name: choice }));
    const next = screen.queryByRole('button', { name: /^next$/i });
    if (next) await u.click(next);
  }
};

beforeEach(() => {
  localStorage.clear();
  upsertMock.mockClear(); toastError.mockClear();
  grantsResult = { data: [GRANT], error: null };
});
afterEach(() => localStorage.clear());

// App.tsx wraps the whole tree in TooltipProvider, so the "why we ask"
// tooltip has a provider in production; a bare render does not.
const renderWizard = () =>
  render(
    <MemoryRouter>
      <TooltipProvider>
        <OnboardingWizard />
      </TooltipProvider>
    </MemoryRouter>
  );

describe('onboarding asks six questions and delivers a first win', () => {
  test('asks exactly six questions', async () => {
    renderWizard();
    expect(screen.getByText(/Question 1 of 6/)).toBeInTheDocument();
  });

  test('explains why community identity is asked, and offers prefer-not-to-say', async () => {
    const u = userEvent.setup();
    renderWizard();
    expect(screen.getByText(/Is your business Indigenous-owned\?/)).toBeInTheDocument();
    // The brief requires a visible reason on this question specifically.
    expect(screen.getByText(/decides which ones can apply to you/i)).toBeInTheDocument();
    await u.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Prefer not to say' })).toBeInTheDocument();
  });

  test('persists answers to business_profiles — not just localStorage', async () => {
    const u = userEvent.setup();
    renderWizard();
    await answerAll(u);
    await u.click(screen.getByRole('button', { name: /see my matches/i }));
    await waitFor(() => expect(upsertMock).toHaveBeenCalledTimes(1));
    const [payload] = upsertMock.mock.calls[0] as [Record<string, unknown>];
    // The old wizard wrote NOTHING here; answers were collected and discarded.
    expect(payload).toMatchObject({
      user_id: 'u1', ownership_type: 'first_nations', province: 'ON',
      stage: 'startup', sector: 'Technology', revenue_range: 'pre_revenue', goals: 'find_funding',
    });
  });

  test('reaches a non-empty first win with a visible rationale', async () => {
    const u = userEvent.setup();
    renderWizard();
    await answerAll(u);
    await u.click(screen.getByRole('button', { name: /see my matches/i }));
    expect(await screen.findByText(/Aboriginal Business Financing Program/)).toBeInTheDocument();
    // A match without a rationale is the thing P0-4 forbids.
    expect(screen.getByText(/Open in ON/)).toBeInTheDocument();
    expect(screen.getByText(/Covers Technology/)).toBeInTheDocument();
    expect(screen.getByText(/last verified 2026-08-01/i)).toBeInTheDocument();
  });

  test('marks skipped identity as not assessed rather than guessing', async () => {
    const u = userEvent.setup();
    renderWizard();
    const picks = ['Prefer not to say', 'ON', 'Starting — first customers', 'Technology', 'No revenue yet', 'Find funding'];
    for (const choice of picks) {
      await u.click(screen.getByRole('combobox'));
      await u.click(await screen.findByRole('option', { name: choice }));
      const next = screen.queryByRole('button', { name: /^next$/i });
      if (next) await u.click(next);
    }
    await u.click(screen.getByRole('button', { name: /see my matches/i }));
    expect(await screen.findByText(/Not assessed — Indigenous ownership/)).toBeInTheDocument();
  });

  test('a failed save reports the error instead of showing fake matches', async () => {
    upsertMock.mockImplementationOnce(() => Promise.resolve({ error: { message: 'db down' } }));
    const u = userEvent.setup();
    renderWizard();
    await answerAll(u);
    await u.click(screen.getByRole('button', { name: /see my matches/i }));
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(screen.queryByText(/Here is what you can apply for/)).not.toBeInTheDocument();
  });
});
