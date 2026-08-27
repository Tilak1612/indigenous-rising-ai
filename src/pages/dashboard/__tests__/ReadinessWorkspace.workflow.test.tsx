import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { emptyDb, installFakeRest, resetIds, type FakeDb } from '@/test/fake-postgrest';

const USER = { id: 'u1', email: 'qa@example.test' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: USER, loading: false, isAdmin: false, isTeamMember: false }),
}));
// The dashboard shell needs QueryClient/Tooltip providers that App.tsx
// supplies in production. Stubbed here per repo convention; the real shell
// is covered by all-pages-mount.test.tsx.
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 't' }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: USER } }) } },
  SUPABASE_URL: 'https://example.test',
  SUPABASE_ANON_KEY: 'anon',
}));
// The workspace is behind a flag; these tests exercise the enabled path.
vi.mock('@/lib/flags', () => ({ FLAGS: { readinessWorkspace: true } }));
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...a: unknown[]) => toastError(...a), success: vi.fn() },
}));

import ReadinessWorkspace from '../ReadinessWorkspace';
import InProgressApplications from '@/components/dashboard/InProgressApplications';
import { WORKING_STAGES, STAGE_LABELS } from '@/lib/readiness';

let db: FakeDb;

const seed = () => {
  db = emptyDb();
  db.grants.push(
    { id: 'g1', name: 'Aboriginal Business Financing Program', funder: 'NACCA', deadline: null, application_url: 'https://example.test/apply' },
    { id: 'g2', name: 'Indigenous Growth Fund', funder: 'NACCA', deadline: null, application_url: null },
    { id: 'g3', name: 'Community Opportunity Readiness', funder: 'ISC', deadline: null, application_url: null },
  );
  db.documents.push(
    { id: 'd1', user_id: 'u1', name: 'Status card.pdf', category: 'certificates' },
    { id: 'd2', user_id: 'u1', name: 'Financials 2025.pdf', category: 'financial' },
  );
};

beforeEach(() => {
  resetIds();
  seed();
  const { fetchImpl } = installFakeRest(db);
  vi.stubGlobal('fetch', vi.fn(fetchImpl));
});

const renderWorkspace = (grantId = 'g1') =>
  render(
    <MemoryRouter initialEntries={[`/dashboard/funding/readiness/${grantId}`]}>
      <Routes>
        <Route path="/dashboard/funding/readiness/:grantId" element={<ReadinessWorkspace />} />
      </Routes>
    </MemoryRouter>,
  );

describe('progressing through all seven stages', () => {
  test('every stage persists and survives a full remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWorkspace();
    await screen.findByRole('heading', { name: /Aboriginal Business Financing Program/ });

    for (const stage of WORKING_STAGES) {
      await user.click(screen.getByRole('button', { name: STAGE_LABELS[stage] }));
      await waitFor(() =>
        expect(db.funding_applications[0].stage).toBe(stage),
      );
    }

    // The workspace record must be one row, not one per visit — otherwise
    // "resume" would silently start over on a fresh copy.
    expect(db.funding_applications).toHaveLength(1);
    const lastStage = WORKING_STAGES[WORKING_STAGES.length - 1];

    // Remount from scratch: this is what a reload or a re-login does.
    unmount();
    renderWorkspace();
    await screen.findByRole('heading', { name: /Aboriginal Business Financing Program/ });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: STAGE_LABELS[lastStage] }))
        .toHaveAttribute('aria-current', 'step'),
    );
    expect(db.funding_applications).toHaveLength(1);
  });

  test('checklist items and notes survive a remount', async () => {
    const user = userEvent.setup();
    const { unmount } = renderWorkspace();
    await screen.findByRole('heading', { name: /Aboriginal Business Financing Program/ });

    await user.click(screen.getByRole('button', { name: STAGE_LABELS.eligibility }));
    await screen.findByLabelText('New checklist item');
    await user.type(screen.getByLabelText('New checklist item'), 'Majority Indigenous ownership');
    await user.click(screen.getByRole('button', { name: /^Add$/ }));

    await waitFor(() => expect(db.funding_readiness_items).toHaveLength(1));
    await user.click(
      await screen.findByRole('button', { name: 'Mark Majority Indigenous ownership as met' }),
    );
    await waitFor(() => expect(db.funding_readiness_items[0].state).toBe('met'));

    unmount();
    renderWorkspace();
    expect(await screen.findByText('Majority Indigenous ownership')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Mark Majority Indigenous ownership as met' }))
        .toHaveAttribute('aria-pressed', 'true'),
    );
  });

  test('readiness counts unknown items as not met', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await screen.findByRole('heading', { name: /Aboriginal Business Financing Program/ });
    await user.click(screen.getByRole('button', { name: STAGE_LABELS.eligibility }));

    for (const label of ['First requirement', 'Second requirement']) {
      await user.type(screen.getByLabelText('New checklist item'), label);
      await user.click(screen.getByRole('button', { name: /^Add$/ }));
      await screen.findByText(label);
    }
    await user.click(screen.getByRole('button', { name: 'Mark First requirement as met' }));

    // One of two confirmed. An unanswered requirement must not read as
    // progress — that would overstate how ready the application is.
    await waitFor(() =>
      expect(screen.getByTestId('readiness-percent')).toHaveTextContent('50%'),
    );
  });
});

describe('the document vault is reused, not re-uploaded', () => {
  test('a second application re-selects an existing document', async () => {
    const user = userEvent.setup();

    // First application attaches the status card.
    const first = renderWorkspace('g1');
    await screen.findByRole('heading', { name: /Aboriginal Business Financing Program/ });
    await user.click(screen.getByRole('button', { name: STAGE_LABELS.eligibility }));
    await user.type(screen.getByLabelText('New checklist item'), 'Proof of status');
    await user.click(screen.getByRole('button', { name: /^Add$/ }));
    await screen.findByText('Proof of status');
    await user.click(screen.getByLabelText('Attach a document to Proof of status'));
    await user.click(await screen.findByRole('option', { name: 'Status card.pdf' }));
    await waitFor(() => expect(db.funding_readiness_items[0].document_id).toBe('d1'));
    first.unmount();

    // Second, unrelated application: the same file must be offered again.
    renderWorkspace('g2');
    await screen.findByRole('heading', { name: /Indigenous Growth Fund/ });
    await user.click(screen.getByRole('button', { name: STAGE_LABELS.eligibility }));
    await user.type(screen.getByLabelText('New checklist item'), 'Proof of status');
    await user.click(screen.getByRole('button', { name: /^Add$/ }));
    await screen.findByText('Proof of status');
    await user.click(screen.getByLabelText('Attach a document to Proof of status'));
    expect(await screen.findByRole('option', { name: 'Status card.pdf' })).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Status card.pdf' }));

    // Resolved via the grant, not a guessed row id.
    const secondApp = db.funding_applications.find((a) => a.grant_id === 'g2');
    expect(secondApp).toBeDefined();
    await waitFor(() => {
      const item = db.funding_readiness_items.find((i) => i.application_id === secondApp!.id);
      expect(item?.document_id).toBe('d1');
    });
    // Still two documents: reuse must not have duplicated the file.
    expect(db.documents).toHaveLength(2);
  });
});

describe('the dashboard lists applications in progress', () => {
  test('three applications each show their own stage', async () => {
    db.funding_applications.push(
      { id: 'a1', user_id: 'u1', grant_id: 'g1', stage: 'eligibility', grant_application_id: null, updated_at: '2026-08-27T00:00:03Z' },
      { id: 'a2', user_id: 'u1', grant_id: 'g2', stage: 'draft', grant_application_id: null, updated_at: '2026-08-27T00:00:02Z' },
      { id: 'a3', user_id: 'u1', grant_id: 'g3', stage: 'submitted', grant_application_id: null, updated_at: '2026-08-27T00:00:01Z' },
    );
    render(<MemoryRouter><InProgressApplications /></MemoryRouter>);

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(3);

    const row = (name: RegExp) =>
      items.find((li) => name.test(li.textContent ?? ''))!;
    expect(within(row(/Aboriginal Business Financing/)).getByText(/Eligibility · step 2 of 7/)).toBeInTheDocument();
    expect(within(row(/Indigenous Growth Fund/)).getByText(/Draft · step 5 of 7/)).toBeInTheDocument();
    expect(within(row(/Community Opportunity Readiness/)).getByText(/^Submitted$/)).toBeInTheDocument();

    expect(within(row(/Aboriginal Business Financing/)).getByRole('link', { name: /Continue/ }))
      .toHaveAttribute('href', '/dashboard/funding/readiness/g1');
  });

  test('a failed load says so instead of claiming no applications', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    render(<MemoryRouter><InProgressApplications /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load/i);
    expect(screen.queryByText(/No applications started yet/)).not.toBeInTheDocument();
  });
});

describe('a failed save never leaves the UI ahead of the database', () => {
  test('the stage reverts and the user is told', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await screen.findByRole('heading', { name: /Aboriginal Business Financing Program/ });
    expect(screen.getByRole('button', { name: STAGE_LABELS.match }))
      .toHaveAttribute('aria-current', 'step');

    // Reject only the stage write, leaving reads working.
    const { fetchImpl } = installFakeRest(db);
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const isStageWrite = (init?.method ?? 'GET').toUpperCase() === 'PATCH'
        && String(input).includes('funding_applications');
      if (isStageWrite) return new Response('nope', { status: 500 });
      return fetchImpl(input, init);
    }));

    toastError.mockClear();
    await user.click(screen.getByRole('button', { name: STAGE_LABELS.eligibility }));

    // Showing 'Eligibility' here would be the same defect as a save button
    // that reports success while the row was rejected: the next reload
    // silently drops the user back, reading as lost work.
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: STAGE_LABELS.match }))
      .toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: STAGE_LABELS.eligibility }))
      .not.toHaveAttribute('aria-current');
  });
});
