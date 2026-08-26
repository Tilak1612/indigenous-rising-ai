import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Auth/layout mocked so protected pages can be rendered at all. Standard for
// testing a guarded component; nothing changes in production.
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
vi.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }) },
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'anon',
}));

import Certifications from '../Certifications';
import Integrations from '../Integrations';
import ApiAccess from '../ApiAccess';
import Compliance from '../Compliance';

describe('Certifications', () => {
  test('renders, and claims no completed course or certificate', () => {
    render(<Certifications />);
    expect(screen.getByText(/Training isn.t live yet\./i)).toBeInTheDocument();
    // A certificate for a course nobody took is a false credential.
    expect(screen.queryByRole('button', { name: /^certificate$/i })).not.toBeInTheDocument();
    // "Completed" is the caption of a stat tile, not a claim. The COUNT is what
    // must be zero — it was 1 when a course was hardcoded complete.
    const completedTile = screen.getByText('Completed').previousElementSibling;
    expect(completedTile?.textContent).toBe('0');
  });
});

describe('Integrations', () => {
  test('renders, and shows nothing as connected', () => {
    render(<Integrations />);
    expect(screen.getByText(/Integrations aren.t live yet\./i)).toBeInTheDocument();
    // The counter is derived from the cards; with none connected it must be 0.
    const connectedTile = screen.getByText('Connected').previousElementSibling;
    expect(connectedTile?.textContent).toBe('0');
  });
});

describe('ApiAccess', () => {
  test('renders, and issues no keys', () => {
    render(<ApiAccess />);
    expect(screen.getByText(/API access isn.t available yet\./i)).toBeInTheDocument();
    // No key-shaped string may reach the DOM.
    expect(document.body.textContent ?? '').not.toMatch(/ir_(live|test)_sk_/);
  });

  test('cannot create a key, because there is no API', () => {
    render(<ApiAccess />);
    const create = screen.getByRole('button', { name: /create new key/i });
    expect(create).toBeDisabled();
  });
});

describe('Compliance', () => {
  test('renders as a self-assessment, not a certification', () => {
    render(<Compliance />);
    expect(screen.getByText(/not a certification/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FNIGC/).length).toBeGreaterThan(0);
    // The removed certificate export must not come back.
    expect(screen.queryByRole('button', { name: /export certificate/i })).not.toBeInTheDocument();
  });

  test('starts at zero recorded items, not a fabricated score', () => {
    render(<Compliance />);
    expect(screen.getByText(/0 of 8/)).toBeInTheDocument();
    expect(screen.queryByText(/Good Standing/i)).not.toBeInTheDocument();
  });
});
