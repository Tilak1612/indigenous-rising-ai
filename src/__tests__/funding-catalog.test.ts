import { describe, test, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' }));

import {
  parseFilters, toSearchParams, buildProgramsQuery, deriveIntake, formatAmount, fundingTypeLabel,
  eligibilitySummary, EMPTY_FILTERS, PROVINCES, TYPE_PAGES, type FundingProgram,
} from '@/lib/funding-catalog';

const base = (over: Partial<FundingProgram> = {}): FundingProgram => ({
  id: 'x', slug: 'x', name: 'X', funder: 'F', description: '', funding_type: 'loan', is_repayable: true,
  amount_min: null, amount_max: null, amount_currency: 'CAD', deadline: null, opens_at: null, is_recurring: true,
  recurrence_notes: null, intake_status: 'rolling', provinces: [], industries: [], business_stages: [],
  applicant_types: [], identity_criteria: null, ownership_min_pct: null, entrepreneur_age_min: null,
  entrepreneur_age_max: null, business_age_max_months: null, revenue_max: null, program_category: [],
  eligibility_notes: null, eligibility_exclusions: null, matching_funds_required: null, matching_funds_notes: null,
  eligible_expenses: [], documents_required: [], application_steps: [], repayment_terms: null, source_url: null,
  application_url: 'https://f.ca', apply_url: null, apply_link_type: 'program_page', application_method: 'unknown',
  last_verified: null, verification_status: 'unverified', verification_confidence: 'none',
  source_published_date: null, source_evidence: [], updated_at: '2026-10-26T00:00:00Z', ...over,
});

describe('filters round-trip through the URL and reject junk', () => {
  test('round trip', () => {
    const f = { ...EMPTY_FILTERS, q: 'loan', provinces: ['BC', 'ON'], types: ['loan'], identities: ['metis'], amount: 'under-25k' as const, verifiedOnly: true, page: 3 };
    expect(parseFilters(toSearchParams(f))).toEqual(f);
  });
  test('unknown values are dropped rather than sent to the database', () => {
    const f = parseFilters(new URLSearchParams('province=BC,XX&type=loan,bribe&page=-2&amount=lots&q=' + 'a'.repeat(300)));
    expect(f.provinces).toEqual(['BC']);
    expect(f.types).toEqual(['loan']);
    expect(f.page).toBe(1);
    expect(f.amount).toBeNull();
    expect(f.q).toHaveLength(120);
  });
});

describe('buildProgramsQuery', () => {
  const today = new Date('2026-10-26T12:00:00Z');
  test('always restricts to published rows and pages', () => {
    const q = buildProgramsQuery(EMPTY_FILTERS, { today });
    expect(q).toContain('is_published=eq.true');
    expect(q).toContain('limit=12');
    expect(q).toContain('offset=0');
    expect(q).toContain('order=deadline.asc.nullslast');
  });
  test('an empty array on the grant means "no restriction", so filters admit it', () => {
    const q = decodeURIComponent(buildProgramsQuery({ ...EMPTY_FILTERS, stages: ['startup'], identities: ['inuit'] }, { today }));
    expect(q).toContain('business_stages.ov.{"startup"}');
    expect(q).toContain('business_stages.eq.{}');
    expect(q).toContain('identity_criteria.is.null');
  });
  test('provinces use overlap, types use in-list', () => {
    const q = decodeURIComponent(buildProgramsQuery({ ...EMPTY_FILTERS, provinces: ['BC', 'YT'], types: ['grant', 'contribution'] }, { today }));
    expect(q).toContain('provinces=ov.{"BC","YT"}');
    expect(q).toContain('funding_type=in.("grant","contribution")');
  });
  test('search text is escaped so it cannot inject PostgREST operators', () => {
    const q = decodeURIComponent(buildProgramsQuery({ ...EMPTY_FILTERS, q: 'a,b)or(id.not.is.null' }, { today })).replace(/\+/g, ' ');
    expect(q).not.toContain('or(id');
    expect(q).toContain('name.ilike.*a b or id not is null*');
    expect(q).not.toMatch(/\.\*a,b\)/);
  });
  test('deadline windows are computed from today', () => {
    const q = decodeURIComponent(buildProgramsQuery({ ...EMPTY_FILTERS, deadline: 'next-30' }, { today }));
    expect(q).toContain('deadline.gte.2026-10-26');
    expect(q).toContain('deadline.lte.2026-11-25');
  });
  test('verified-only and accepting-only map to columns', () => {
    const q = decodeURIComponent(buildProgramsQuery({ ...EMPTY_FILTERS, verifiedOnly: true, acceptingOnly: true }, { today }));
    expect(q).toContain('last_verified=not.is.null');
    expect(q).toContain('intake_status=in.(open,rolling)');
  });
});

describe('deriveIntake never calls a passed deadline open', () => {
  const today = new Date('2026-10-26T12:00:00Z');
  test('closed status wins', () => expect(deriveIntake(base({ intake_status: 'closed', deadline: '2026-09-30' }), today).tone).toBe('closed'));
  test('a future deadline shows days left', () => {
    const r = deriveIntake(base({ intake_status: 'open', deadline: '2026-10-31', is_recurring: false }), today);
    expect(r.tone).toBe('urgent');
    expect(r.text).toMatch(/5 days left/);
  });
  test('a passed deadline with a stale open status still reads as passed', () => {
    expect(deriveIntake(base({ intake_status: 'open', deadline: '2026-10-01', is_recurring: false }), today).tone).toBe('closed');
  });
  test('rolling', () => expect(deriveIntake(base(), today).tone).toBe('rolling'));
  test('unknown', () => expect(deriveIntake(base({ intake_status: 'unknown', is_recurring: false }), today).tone).toBe('unknown'));
});

describe('amounts and types are stated, never invented', () => {
  test('no amount → "Amount not published", never $0', () => expect(formatAmount(base())).toBe('Amount not published'));
  test('min only is "From", not "Up to"', () => expect(formatAmount(base({ amount_min: 4000 }))).toBe('From $4,000'));
  test('range', () => expect(formatAmount(base({ amount_min: 150000, amount_max: 3000000 }))).toBe('$150,000 to $3,000,000'));
  test('contribution repayability is spelled out', () => {
    expect(fundingTypeLabel(base({ funding_type: 'contribution', is_repayable: false }))).toBe('Non-repayable contribution');
    expect(fundingTypeLabel(base({ funding_type: 'contribution', is_repayable: null }))).toBe('Contribution');
  });
  test('eligibility summary', () => {
    expect(eligibilitySummary(base({ identity_criteria: ['metis'], entrepreneur_age_min: 18, entrepreneur_age_max: 39, ownership_min_pct: 51 })))
      .toBe('Métis · ages 18 to 39 · 51%+ Indigenous ownership');
  });
});

describe('static vocabularies', () => {
  test('13 provinces and territories with slugs', () => {
    expect(PROVINCES).toHaveLength(13);
    expect(new Set(PROVINCES.map((p) => p.slug)).size).toBe(13);
  });
  test('type pages cover loans and grants/contributions separately', () => {
    expect(TYPE_PAGES.map((t) => t.slug)).toEqual(['indigenous-business-loans', 'indigenous-business-grants']);
  });
});
