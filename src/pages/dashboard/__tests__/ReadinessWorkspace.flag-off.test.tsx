import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Flag off is the production default, so this is the shipped behaviour
// until the workspace is switched on: match-only, no workspace entry.
vi.mock('@/lib/flags', () => ({ FLAGS: { readinessWorkspace: false } }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, loading: false }),
}));
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 't' }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: {}, SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));

import ReadinessWorkspace from '../ReadinessWorkspace';
import InProgressApplications from '@/components/dashboard/InProgressApplications';

describe('feature flag off', () => {
  test('the workspace route falls back to saved matches', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/funding/readiness/g1']}>
        <Routes>
          <Route path="/dashboard/funding/readiness/:grantId" element={<ReadinessWorkspace />} />
          <Route path="/dashboard/funding/saved" element={<p>Saved matches page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Saved matches page')).toBeInTheDocument();
  });

  test('the in-progress list renders nothing at all', () => {
    const { container } = render(<MemoryRouter><InProgressApplications /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
  });

  test('no request is made when the flag is off', () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    render(<MemoryRouter><InProgressApplications /></MemoryRouter>);
    expect(spy).not.toHaveBeenCalled();
  });
});
