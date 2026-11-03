import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/lib/supabase', () => ({ SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon', supabase: {} }));

import FundingFinder from '@/components/landing/FundingFinder';

const row = (over: Record<string, unknown>) => ({
  id: 'g', slug: 'g', name: 'G', funder: 'F', description: '', funding_type: 'loan', is_repayable: true, amount_min: null, amount_max: null,
  amount_currency: 'CAD', deadline: null, opens_at: null, is_recurring: true, recurrence_notes: null, intake_status: 'rolling', provinces: [],
  industries: [], business_stages: [], applicant_types: [], identity_criteria: null, ownership_min_pct: null, entrepreneur_age_min: null,
  entrepreneur_age_max: null, business_age_max_months: null, revenue_max: null, program_category: [], eligibility_notes: null,
  eligibility_exclusions: null, matching_funds_required: null, matching_funds_notes: null, eligible_expenses: [], documents_required: [],
  application_steps: [], repayment_terms: null, source_url: 'https://f.ca', application_url: 'https://f.ca', apply_url: null,
  apply_link_type: 'program_page', application_method: 'unknown', last_verified: '2026-10-26', verification_status: 'unverified',
  verification_confidence: 'medium', source_published_date: null, source_evidence: [], updated_at: '2026-10-26T00:00:00Z', ...over,
});
const AEP = row({ id: '1', slug: 'aboriginal-entrepreneurship-program', name: 'Aboriginal Entrepreneurship Program', funder: 'Indigenous Services Canada', funding_type: 'contribution', is_repayable: false, amount_max: 250000, provinces: ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'] });
const BDC = row({ id: '2', slug: 'bdc-indigenous-entrepreneur-loan', name: 'BDC Indigenous Entrepreneur Loan', funder: 'BDC', amount_max: 350000, provinces: ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'] });
const MB = row({ id: '3', slug: 'fpegf', name: 'FPEGF Entrepreneur Loan Program', funder: 'First Peoples Economic Growth Fund', amount_max: 200000, provinces: ['MB'], last_verified: null });

const calls: string[] = [];
const json = (rows: unknown[], total: number) =>
  new Response(JSON.stringify(rows), { status: 200, headers: { 'content-type': 'application/json', 'content-range': `0-${Math.max(0, total - 1)}/${total}` } });

beforeEach(() => {
  calls.length = 0;
  vi.stubGlobal('fetch', (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (decodeURIComponent(url).includes('provinces=ov.')) return Promise.resolve(json([MB, AEP], 2));
    return Promise.resolve(json([AEP, BDC, MB], 17));
  });
});
afterEach(() => { vi.unstubAllGlobals(); delete (globalThis as { __IR_FUNDING__?: unknown }).__IR_FUNDING__; });

const mount = () => render(<MemoryRouter><FundingFinder /></MemoryRouter>);

describe('hero funding finder', () => {
  test('shows real programmes with funder, type, amount and freshness, and the real count', async () => {
    mount();
    expect(await screen.findByText('Aboriginal Entrepreneurship Program')).toBeInTheDocument();
    expect(screen.getByText('Indigenous Services Canada')).toBeInTheDocument();
    expect(screen.getByText('Non-repayable contribution')).toBeInTheDocument();
    expect(screen.getByText('Up to $250,000')).toBeInTheDocument();
    expect(screen.getAllByText(/Details last verified/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Details not yet verified/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /See all 17 programmes/ })).toHaveAttribute('href', expect.stringContaining('/funding?'));
    expect(screen.queryByText(/\d+%\s*match/i)).not.toBeInTheDocument();
  });

  test('only ever asks for programmes that are accepting applications', async () => {
    mount();
    await screen.findByText('Aboriginal Entrepreneurship Program');
    expect(decodeURIComponent(calls[0])).toContain('intake_status=in.(open,rolling)');
    expect(decodeURIComponent(calls[0])).toContain('limit=3');
  });

  test('changing the province re-queries and carries the answer into the directory link', async () => {
    mount();
    await screen.findByText('Aboriginal Entrepreneurship Program');
    fireEvent.change(screen.getByLabelText('Where is the business?'), { target: { value: 'MB' } });
    await waitFor(() => expect(decodeURIComponent(calls.at(-1) ?? '')).toContain('provinces=ov.{"MB"}'));
    expect(await screen.findByText('FPEGF Entrepreneur Loan Program')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /See all 2 programmes for Manitoba/ })).toHaveAttribute('href', expect.stringContaining('province=MB'));
  });

  test('renders from the build-time seed without fetching', () => {
    (globalThis as { __IR_FUNDING__?: unknown }).__IR_FUNDING__ = { programs: [AEP, BDC, MB] };
    mount();
    expect(screen.getByText('Aboriginal Entrepreneurship Program')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });

  test('the signup CTA and the eligibility caveat are always present', async () => {
    mount();
    await screen.findByText('Aboriginal Entrepreneurship Program');
    expect(screen.getByRole('link', { name: /Get matched to these, free/ })).toHaveAttribute('href', expect.stringContaining('/signup'));
    expect(screen.getByText(/Only the funder decides eligibility/)).toBeInTheDocument();
  });
});
