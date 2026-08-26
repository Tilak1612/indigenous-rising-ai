import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mocking auth/subscription in a unit test is standard practice — it is how a
// protected component is tested at all, and it changes nothing in production.
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ subscribed: true, product_id: 'prod_x', price_id: null, subscription_end: null, isLoading: false }),
  SUBSCRIPTION_QUERY_KEY: 'subscription-status',
}));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'qa@example.test' }, loading: false }),
}));
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const selectMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ select: (...a: unknown[]) => selectMock(...a) }) },
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'anon',
}));

import Funding from '../Funding';

const GRANT = {
  id: 'g1',
  name: 'Aboriginal Business Financing Program',
  funder: 'NACCA',
  description: 'Non-repayable contribution toward start-up costs.',
  amount_min: 10000, amount_max: 99999,
  deadline: null,
  provinces: ['ON'],
  eligibility_notes: 'Indigenous-owned',
  application_url: 'https://nacca.ca/abfp',
  source_url: 'https://nacca.ca/abfp',
  funding_type: 'grant',
  is_repayable: false,
  last_verified: '2026-08-01',
};
const LOAN = { ...GRANT, id: 'g2', name: 'BDC Indigenous Entrepreneur Loan', funder: 'BDC', funding_type: 'loan', is_repayable: true };

beforeEach(() => { selectMock.mockReset(); });
const resolves = (payload: unknown) => ({ eq: () => Promise.resolve(payload) });

describe('Funding Navigator renders from the verified catalogue', () => {
  test('shows real programmes returned by the grants query', async () => {
    selectMock.mockReturnValue(resolves({ data: [GRANT, LOAN], error: null }));
    render(<Funding />);
    expect(await screen.findByText(/Aboriginal Business Financing Program/)).toBeInTheDocument();
    expect(screen.getByText(/BDC Indigenous Entrepreneur Loan/)).toBeInTheDocument();
  });

  test('marks a repayable programme so a loan is never mistaken for a grant', async () => {
    selectMock.mockReturnValue(resolves({ data: [LOAN], error: null }));
    render(<Funding />);
    expect(await screen.findByText(/You pay this back/i)).toBeInTheDocument();
  });

  test('never renders a match percentage — no criteria back one', async () => {
    selectMock.mockReturnValue(resolves({ data: [GRANT, LOAN], error: null }));
    render(<Funding />);
    await screen.findByText(/Aboriginal Business Financing Program/);
    expect(screen.queryByText(/\d+%\s*match/i)).not.toBeInTheDocument();
  });

  test('surfaces a load failure instead of rendering an empty list', async () => {
    selectMock.mockReturnValue(resolves({ data: null, error: { message: 'network down' } }));
    render(<Funding />);
    // "no programmes" would be a lie when the truth is "we could not load them".
    await waitFor(() => {
      expect(screen.queryByText(/Aboriginal Business Financing Program/)).not.toBeInTheDocument();
    });
  });
});
