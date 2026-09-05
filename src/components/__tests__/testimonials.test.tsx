import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';

const USER = { id: 'admin-1', email: 'a@example.test' };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: USER, loading: false, isAdmin: true }),
}));
vi.mock('@/lib/auth-storage', () => ({ readStoredSession: () => ({ access_token: 't' }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: {}, SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));

// vi.mock is hoisted above module scope, so the mutable object it returns
// has to be created with vi.hoisted or the factory captures a TDZ binding.
const flags = vi.hoisted(() => ({ testimonials: true }));
vi.mock('@/lib/flags', () => ({ FLAGS: flags }));

import Testimonials from '../Testimonials';
import { isPublishable, listPublishedTestimonials } from '@/lib/testimonials';

const APPROVED = {
  id: 't1', customer_name: 'Real Person', role: 'Owner', company: 'Real Co',
  location: 'Alberta', quote: 'A genuine approved quote that the customer agreed we could publish.',
  verified_metric: 'Cut reporting from three days to four hours',
  photo_or_logo_url: null, created_at: '2026-08-01T00:00:00Z',
};

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => { flags.testimonials = true; });

describe('nothing unapproved can ever render', () => {
  test('renders NOTHING when there are no approved testimonials', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okJson([])));
    const { container } = render(<Testimonials />);
    // No heading, no skeleton, no "coming soon" — an empty social-proof
    // section is worse than none, and a placeholder is worse still.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('renders nothing when the flag is off, and makes no request', () => {
    flags.testimonials = false;
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    const { container } = render(<Testimonials />);
    expect(container).toBeEmptyDOMElement();
    expect(spy).not.toHaveBeenCalled();
  });

  test('a failed load renders nothing rather than a broken block', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    const { container } = render(<Testimonials />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  test('renders real content when it exists, with the exact quote', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okJson([APPROVED])));
    render(<Testimonials />);
    expect(await screen.findByText(/A genuine approved quote/)).toBeInTheDocument();
    expect(screen.getByText('Real Person')).toBeInTheDocument();
    expect(screen.getByText(/Owner · Real Co · Alberta/)).toBeInTheDocument();
    expect(screen.getByText(/three days to four hours/)).toBeInTheDocument();
  });
});

describe('the query mirrors the RLS policy', () => {
  test('it filters on all three gates, not just publish_status', async () => {
    const spy = vi.fn(async () => okJson([]));
    vi.stubGlobal('fetch', spy);
    await listPublishedTestimonials();
    const url = String(spy.mock.calls[0][0]);
    expect(url).toContain('publish_status=eq.published');
    expect(url).toContain('approval_status=eq.approved');
    expect(url).toContain('consent_status=eq.granted');
  });

  test('the public query never selects workflow or approver columns', async () => {
    const spy = vi.fn(async () => okJson([]));
    vi.stubGlobal('fetch', spy);
    await listPublishedTestimonials();
    const url = String(spy.mock.calls[0][0]);
    const select = decodeURIComponent(url.split('select=')[1].split('&')[0]);
    // A wildcard names no columns, so an allowlist check alone passes while
    // exposing everything — including approved_by and submitted_by user ids
    // on public rows. Require an explicit list first.
    expect(select, 'the public query must not select *').not.toBe('*');
    expect(select).not.toContain('*');
    const cols = select.split(',');
    for (const leaky of ['approved_by', 'submitted_by', 'consent_status', 'approval_status']) {
      expect(cols, `${leaky} must not be exposed publicly`).not.toContain(leaky);
    }
  });
});

describe('publishability', () => {
  test('both consent and approval are required', () => {
    expect(isPublishable({ consent_status: 'granted', approval_status: 'approved' })).toBe(true);
    expect(isPublishable({ consent_status: 'pending', approval_status: 'approved' })).toBe(false);
    expect(isPublishable({ consent_status: 'granted', approval_status: 'pending' })).toBe(false);
    expect(isPublishable({ consent_status: 'withdrawn', approval_status: 'approved' })).toBe(false);
  });
});

describe('the intake never sends workflow columns', () => {
  test('a submission carries content only', async () => {
    const spy = vi.fn(async () => new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', spy);
    const { submitTestimonial } = await import('@/lib/testimonials');
    await submitTestimonial({ customer_name: 'A Person', quote: 'A quote long enough to be accepted by the check.' });
    const body = JSON.parse(String((spy.mock.calls[0][1] as RequestInit).body));
    // Sending these would be refused by the RLS WITH CHECK anyway; not
    // sending them is what makes the intake honest by construction.
    for (const k of ['consent_status', 'approval_status', 'publish_status', 'approved_by', 'approved_at']) {
      expect(Object.keys(body), `${k} must not be submitted`).not.toContain(k);
    }
  });
});

describe('no fabricated content ships', () => {
  test('neither file contains a hardcoded person, quote, company or rating', () => {
    for (const f of ['src/components/Testimonials.tsx', 'src/lib/testimonials.ts']) {
      const src = readFileSync(f, 'utf8');
      expect(src, 'a star rating implies reviews that do not exist').not.toMatch(/ratingValue|AggregateRating|★/);
      // A quoted sentence in source would be a placeholder testimonial.
      expect(src).not.toMatch(/&ldquo;[A-Z][^&]{40,}&rdquo;(?!\{)/);
    }
  });
});
