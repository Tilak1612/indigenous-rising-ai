/**
 * Funding catalogue: types, vocabularies, URL filter state and the PostgREST
 * query behind the public directory and the region pages.
 *
 * All reads go straight to PostgREST with the anon key (RLS exposes only
 * published rows). supabase-js query calls can hang on this project, so the
 * rest of the app already uses direct fetch; this does the same.
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Vocabularies (mirror the CHECK constraints and array conventions in grants)
// ---------------------------------------------------------------------------
export const PROVINCES = [
  { code: 'AB', name: 'Alberta', slug: 'alberta' },
  { code: 'BC', name: 'British Columbia', slug: 'british-columbia' },
  { code: 'MB', name: 'Manitoba', slug: 'manitoba' },
  { code: 'NB', name: 'New Brunswick', slug: 'new-brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador', slug: 'newfoundland-and-labrador' },
  { code: 'NS', name: 'Nova Scotia', slug: 'nova-scotia' },
  { code: 'NT', name: 'Northwest Territories', slug: 'northwest-territories' },
  { code: 'NU', name: 'Nunavut', slug: 'nunavut' },
  { code: 'ON', name: 'Ontario', slug: 'ontario' },
  { code: 'PE', name: 'Prince Edward Island', slug: 'prince-edward-island' },
  { code: 'QC', name: 'Quebec', slug: 'quebec' },
  { code: 'SK', name: 'Saskatchewan', slug: 'saskatchewan' },
  { code: 'YT', name: 'Yukon', slug: 'yukon' },
] as const;
export type ProvinceCode = (typeof PROVINCES)[number]['code'];
export const PROVINCE_CODES = PROVINCES.map((p) => p.code) as ProvinceCode[];
export const provinceByCode = (code: string) => PROVINCES.find((p) => p.code === code);
export const provinceBySlug = (slug: string) => PROVINCES.find((p) => p.slug === slug);

export const FUNDING_TYPE_LABELS: Record<string, string> = {
  grant: 'Grant',
  contribution: 'Contribution',
  loan: 'Loan',
  loan_guarantee: 'Loan guarantee',
  equity: 'Equity',
  mixed: 'Loans and contributions',
  varies: 'Varies by stream',
};
export const FUNDING_TYPES = Object.keys(FUNDING_TYPE_LABELS);

export const STAGE_LABELS: Record<string, string> = {
  ideation: 'Idea stage',
  startup: 'Start-up',
  'early-stage': 'Early stage',
  growth: 'Growth',
  established: 'Established',
};
export const STAGES = Object.keys(STAGE_LABELS);

export const APPLICANT_LABELS: Record<string, string> = {
  individual: 'Individual entrepreneur',
  business: 'Business',
  community_business: 'Community-owned business',
  community: 'Nation or community',
  organization: 'Indigenous organization',
  nonprofit: 'Not-for-profit',
  institution: 'Learning institution',
};
export const APPLICANT_TYPES = Object.keys(APPLICANT_LABELS);

export const IDENTITY_LABELS: Record<string, string> = {
  first_nations: 'First Nations',
  metis: 'Métis',
  inuit: 'Inuit',
};
export const IDENTITIES = Object.keys(IDENTITY_LABELS);

export const CATEGORY_LABELS: Record<string, string> = {
  startup: 'Starting a business',
  expansion: 'Expansion',
  acquisition: 'Buying a business',
  working_capital: 'Working capital',
  equipment: 'Equipment',
  technology: 'Technology and digital',
  export: 'Export',
  training: 'Skills and training',
  community_development: 'Community economic development',
  tourism: 'Tourism',
  agriculture: 'Agriculture',
  arts: 'Arts and culture',
  clean_energy: 'Clean energy',
  research: 'Research and innovation',
  youth: 'Youth entrepreneurs',
  women: 'Women entrepreneurs',
  northern: 'Northern and remote',
};
export const CATEGORIES = Object.keys(CATEGORY_LABELS);

export const INDUSTRIES = [
  'Agriculture & Forestry', 'Arts & Crafts', 'Construction', 'Consulting', 'Education',
  'Energy & Mining', 'Finance & Insurance', 'Food & Beverage', 'Healthcare',
  'Hospitality & Tourism', 'Information Technology', 'Manufacturing',
  'Professional Services', 'Real Estate', 'Retail', 'Transportation', 'Other',
] as const;

export const INTAKE_LABELS: Record<string, string> = {
  open: 'Accepting applications',
  rolling: 'Rolling intake',
  closed: 'Closed',
  not_yet_open: 'Not yet open',
  unknown: 'Intake status unknown',
};

export const AMOUNT_BANDS = [
  { value: 'under-25k', label: 'Under $25,000', min: null, max: 25000 },
  { value: '25k-100k', label: '$25,000 to $100,000', min: 25000, max: 100000 },
  { value: '100k-500k', label: '$100,000 to $500,000', min: 100000, max: 500000 },
  { value: 'over-500k', label: 'Over $500,000', min: 500000, max: null },
] as const;
export type AmountBand = (typeof AMOUNT_BANDS)[number]['value'];

export const DEADLINE_OPTIONS = [
  { value: 'next-30', label: 'Closing in the next 30 days' },
  { value: 'next-90', label: 'Closing in the next 90 days' },
  { value: 'rolling', label: 'Rolling intake only' },
] as const;
export type DeadlineOption = (typeof DEADLINE_OPTIONS)[number]['value'];

// ---------------------------------------------------------------------------
// Row shape
// ---------------------------------------------------------------------------
export interface SourceEvidence {
  field: string;
  quote: string;
  url: string;
  fetched_at: string;
}

export interface FundingProgram {
  id: string;
  slug: string;
  name: string;
  funder: string;
  description: string;
  funding_type: string;
  is_repayable: boolean | null;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  opens_at: string | null;
  is_recurring: boolean;
  recurrence_notes: string | null;
  intake_status: string;
  provinces: string[];
  industries: string[];
  business_stages: string[];
  applicant_types: string[] | null;
  identity_criteria: string[] | null;
  ownership_min_pct: number | null;
  entrepreneur_age_min: number | null;
  entrepreneur_age_max: number | null;
  business_age_max_months: number | null;
  revenue_max: number | null;
  program_category: string[];
  eligibility_notes: string | null;
  eligibility_exclusions: string | null;
  matching_funds_required: boolean | null;
  matching_funds_notes: string | null;
  eligible_expenses: string[];
  documents_required: string[];
  application_steps: string[];
  repayment_terms: string | null;
  source_url: string | null;
  application_url: string;
  apply_url: string | null;
  apply_link_type: string;
  application_method: string;
  last_verified: string | null;
  verification_status: string;
  verification_confidence: string;
  source_published_date: string | null;
  source_evidence: SourceEvidence[];
  updated_at: string;
}

export const PROGRAM_COLUMNS = [
  'id', 'slug', 'name', 'funder', 'description', 'funding_type', 'is_repayable',
  'amount_min', 'amount_max', 'amount_currency', 'deadline', 'opens_at', 'is_recurring',
  'recurrence_notes', 'intake_status', 'provinces', 'industries', 'business_stages',
  'applicant_types', 'identity_criteria', 'ownership_min_pct', 'entrepreneur_age_min',
  'entrepreneur_age_max', 'business_age_max_months', 'revenue_max', 'program_category',
  'eligibility_notes', 'eligibility_exclusions', 'matching_funds_required',
  'matching_funds_notes', 'eligible_expenses', 'documents_required', 'application_steps',
  'repayment_terms', 'source_url', 'application_url', 'apply_url', 'apply_link_type',
  'application_method', 'last_verified', 'verification_status', 'verification_confidence',
  'source_published_date', 'source_evidence', 'updated_at',
].join(',');

// ---------------------------------------------------------------------------
// Filter state <-> URL
// ---------------------------------------------------------------------------
export interface FilterState {
  q: string;
  provinces: string[];
  types: string[];
  stages: string[];
  sectors: string[];
  applicants: string[];
  identities: string[];
  categories: string[];
  amount: AmountBand | null;
  deadline: DeadlineOption | null;
  verifiedOnly: boolean;
  acceptingOnly: boolean;
  page: number;
}

export const EMPTY_FILTERS: FilterState = {
  q: '', provinces: [], types: [], stages: [], sectors: [], applicants: [], identities: [],
  categories: [], amount: null, deadline: null, verifiedOnly: false, acceptingOnly: false, page: 1,
};

export const PAGE_SIZE = 12;

const list = (params: URLSearchParams, key: string, allowed: readonly string[]) =>
  (params.get(key) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && allowed.includes(s));

export function parseFilters(params: URLSearchParams): FilterState {
  const amount = params.get('amount');
  const deadline = params.get('deadline');
  const page = Number.parseInt(params.get('page') ?? '1', 10);
  return {
    q: (params.get('q') ?? '').slice(0, 120),
    provinces: list(params, 'province', PROVINCE_CODES),
    types: list(params, 'type', FUNDING_TYPES),
    stages: list(params, 'stage', STAGES),
    sectors: list(params, 'sector', INDUSTRIES),
    applicants: list(params, 'applicant', APPLICANT_TYPES),
    identities: list(params, 'identity', IDENTITIES),
    categories: list(params, 'category', CATEGORIES),
    amount: AMOUNT_BANDS.some((b) => b.value === amount) ? (amount as AmountBand) : null,
    deadline: DEADLINE_OPTIONS.some((d) => d.value === deadline) ? (deadline as DeadlineOption) : null,
    verifiedOnly: params.get('verified') === '1',
    acceptingOnly: params.get('accepting') === '1',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toSearchParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.provinces.length) p.set('province', f.provinces.join(','));
  if (f.types.length) p.set('type', f.types.join(','));
  if (f.stages.length) p.set('stage', f.stages.join(','));
  if (f.sectors.length) p.set('sector', f.sectors.join(','));
  if (f.applicants.length) p.set('applicant', f.applicants.join(','));
  if (f.identities.length) p.set('identity', f.identities.join(','));
  if (f.categories.length) p.set('category', f.categories.join(','));
  if (f.amount) p.set('amount', f.amount);
  if (f.deadline) p.set('deadline', f.deadline);
  if (f.verifiedOnly) p.set('verified', '1');
  if (f.acceptingOnly) p.set('accepting', '1');
  if (f.page > 1) p.set('page', String(f.page));
  return p;
}

export const activeFilterCount = (f: FilterState) =>
  [f.provinces, f.types, f.stages, f.sectors, f.applicants, f.identities, f.categories].filter((a) => a.length).length +
  (f.amount ? 1 : 0) + (f.deadline ? 1 : 0) + (f.verifiedOnly ? 1 : 0) + (f.acceptingOnly ? 1 : 0) + (f.q ? 1 : 0);

// ---------------------------------------------------------------------------
// PostgREST query
// ---------------------------------------------------------------------------
const pgArray = (values: string[]) => `{${values.map((v) => `"${v.replace(/"/g, '')}"`).join(',')}}`;
const pgList = (values: string[]) => `(${values.map((v) => `"${v.replace(/[",()]/g, '')}"`).join(',')})`;
const escapeLike = (q: string) => q.replace(/[%_*,()."\\]/g, ' ').replace(/\s+/g, ' ').trim();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Builds the query string for /rest/v1/grants. Array dimensions the grant
 * leaves empty mean "no restriction", so a filter on them must also admit the
 * empty (or null) array; every such group is an OR inside one top-level AND.
 */
export function buildProgramsQuery(f: FilterState, opts: { today?: Date; pageSize?: number } = {}): string {
  const today = opts.today ?? new Date();
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const p = new URLSearchParams();
  p.set('select', PROGRAM_COLUMNS);
  p.set('is_published', 'eq.true');
  const and: string[] = [];

  if (f.q) {
    const q = escapeLike(f.q);
    if (q) and.push(`or(name.ilike.*${q}*,funder.ilike.*${q}*,description.ilike.*${q}*)`);
  }
  if (f.provinces.length) p.set('provinces', `ov.${pgArray(f.provinces)}`);
  if (f.types.length) p.set('funding_type', `in.${pgList(f.types)}`);
  if (f.stages.length) and.push(`or(business_stages.ov.${pgArray(f.stages)},business_stages.eq.{})`);
  if (f.sectors.length) and.push(`or(industries.ov.${pgArray(f.sectors)},industries.eq.{})`);
  if (f.applicants.length) and.push(`or(applicant_types.ov.${pgArray(f.applicants)},applicant_types.eq.{},applicant_types.is.null)`);
  if (f.identities.length) and.push(`or(identity_criteria.ov.${pgArray(f.identities)},identity_criteria.is.null,identity_criteria.eq.{})`);
  if (f.categories.length) and.push(`or(program_category.ov.${pgArray(f.categories)},program_category.eq.{})`);
  if (f.amount) {
    const band = AMOUNT_BANDS.find((b) => b.value === f.amount)!;
    if (band.min != null) p.set('amount_max', `gte.${band.min}`);
    if (band.max != null) and.push(`and(amount_max.not.is.null,amount_max.lte.${band.max})`);
  }
  if (f.deadline === 'rolling') p.set('intake_status', 'eq.rolling');
  else if (f.deadline) {
    const days = f.deadline === 'next-30' ? 30 : 90;
    const until = new Date(today.getTime() + days * 86_400_000);
    and.push(`and(deadline.gte.${isoDate(today)},deadline.lte.${isoDate(until)})`);
  }
  if (f.acceptingOnly && f.deadline !== 'rolling') p.set('intake_status', 'in.(open,rolling)');
  if (f.verifiedOnly) p.set('last_verified', 'not.is.null');

  if (and.length) p.set('and', `(${and.join(',')})`);
  p.set('order', 'deadline.asc.nullslast,name.asc');
  p.set('limit', String(pageSize));
  p.set('offset', String((Math.max(1, f.page) - 1) * pageSize));
  return p.toString();
}

const restHeaders = () => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` });

export interface ProgramsPage {
  rows: FundingProgram[];
  total: number;
}

export async function fetchPrograms(f: FilterState, signal?: AbortSignal): Promise<ProgramsPage> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grants?${buildProgramsQuery(f)}`, {
    headers: { ...restHeaders(), Prefer: 'count=exact' },
    signal,
  });
  if (!res.ok) throw new Error(`Could not load funding programmes (HTTP ${res.status})`);
  const rows = (await res.json()) as FundingProgram[];
  const range = res.headers.get('content-range') ?? '';
  const total = Number.parseInt(range.split('/')[1] ?? '', 10);
  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

export async function fetchProgramBySlug(slug: string): Promise<FundingProgram | null> {
  const safe = slug.replace(/[^a-z0-9-]/g, '');
  if (!safe) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/grants?select=${PROGRAM_COLUMNS}&is_published=eq.true&slug=eq.${safe}&limit=1`,
    { headers: restHeaders() },
  );
  if (!res.ok) throw new Error(`Could not load programme (HTTP ${res.status})`);
  const rows = (await res.json()) as FundingProgram[];
  return rows[0] ?? null;
}

/** Legacy /funding/<uuid> links resolve to the slug route. */
export async function fetchSlugById(id: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grants?select=slug&is_published=eq.true&id=eq.${id}&limit=1`, {
    headers: restHeaders(),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as { slug: string }[];
  return rows[0]?.slug ?? null;
}

export async function fetchSimilarPrograms(g: FundingProgram, limit = 4): Promise<FundingProgram[]> {
  const p = new URLSearchParams();
  p.set('select', PROGRAM_COLUMNS);
  p.set('is_published', 'eq.true');
  p.set('id', `neq.${g.id}`);
  if (g.provinces.length && g.provinces.length < 13) p.set('provinces', `ov.${pgArray(g.provinces)}`);
  p.set('order', 'last_verified.desc.nullslast,name.asc');
  p.set('limit', String(limit));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/grants?${p.toString()}`, { headers: restHeaders() });
  if (!res.ok) return [];
  return (await res.json()) as FundingProgram[];
}

// ---------------------------------------------------------------------------
// Derived display values
// ---------------------------------------------------------------------------
export type IntakeTone = 'open' | 'soon' | 'urgent' | 'rolling' | 'closed' | 'unknown';

export function deriveIntake(g: Pick<FundingProgram, 'deadline' | 'is_recurring' | 'intake_status' | 'recurrence_notes' | 'opens_at'>, today = new Date()): { text: string; tone: IntakeTone; daysLeft: number | null } {
  if (g.intake_status === 'closed') return { text: g.deadline ? `Closed ${fmtDate(g.deadline)}` : 'Closed', tone: 'closed', daysLeft: null };
  if (g.intake_status === 'not_yet_open') return { text: g.opens_at ? `Opens ${fmtDate(g.opens_at)}` : 'Not yet open', tone: 'unknown', daysLeft: null };
  if (g.deadline) {
    // Calendar days, not elapsed hours: a deadline of the 31st read on the 26th
    // is "5 days left" whatever the time of day.
    const daysLeft = Math.round((Date.UTC(+g.deadline.slice(0, 4), +g.deadline.slice(5, 7) - 1, +g.deadline.slice(8, 10)) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
    if (daysLeft < 0) return { text: `Deadline passed ${fmtDate(g.deadline)}`, tone: 'closed', daysLeft };
    const text = `Closes ${fmtDate(g.deadline)} · ${daysLeft === 0 ? 'today' : `${daysLeft} days left`}`;
    return { text, tone: daysLeft <= 7 ? 'urgent' : daysLeft <= 30 ? 'soon' : 'open', daysLeft };
  }
  if (g.intake_status === 'rolling' || g.is_recurring) return { text: g.recurrence_notes || 'Rolling intake', tone: 'rolling', daysLeft: null };
  if (g.intake_status === 'open') return { text: 'Accepting applications', tone: 'open', daysLeft: null };
  return { text: 'Intake status not confirmed', tone: 'unknown', daysLeft: null };
}

export function formatAmount(g: Pick<FundingProgram, 'amount_min' | 'amount_max'>): string {
  const fmt = (n: number) => '$' + n.toLocaleString('en-CA');
  if (!g.amount_min && !g.amount_max) return 'Amount not published';
  if (g.amount_min && g.amount_max && g.amount_min !== g.amount_max) return `${fmt(g.amount_min)} to ${fmt(g.amount_max)}`;
  if (g.amount_max) return `Up to ${fmt(g.amount_max)}`;
  return `From ${fmt(g.amount_min as number)}`;
}

export function fundingTypeLabel(g: Pick<FundingProgram, 'funding_type' | 'is_repayable'>): string {
  const base = FUNDING_TYPE_LABELS[g.funding_type] ?? g.funding_type;
  if (g.funding_type === 'contribution') return g.is_repayable === false ? 'Non-repayable contribution' : g.is_repayable ? 'Repayable contribution' : 'Contribution';
  return base;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function regionLabel(g: Pick<FundingProgram, 'provinces'>): string {
  if (!g.provinces || g.provinces.length === 0 || g.provinces.length >= 13) return 'All of Canada';
  return g.provinces.map((c) => provinceByCode(c)?.name ?? c).join(', ');
}

/** One-line who-may-qualify summary for cards. */
export function eligibilitySummary(g: FundingProgram): string {
  const parts: string[] = [];
  if (g.identity_criteria?.length) parts.push(g.identity_criteria.map((k) => IDENTITY_LABELS[k] ?? k).join(', '));
  if (g.applicant_types?.length) parts.push(g.applicant_types.map((k) => APPLICANT_LABELS[k] ?? k).join(', ').toLowerCase());
  if (g.entrepreneur_age_min != null || g.entrepreneur_age_max != null) {
    parts.push(`ages ${g.entrepreneur_age_min ?? ''}${g.entrepreneur_age_min != null && g.entrepreneur_age_max != null ? ' to ' : ''}${g.entrepreneur_age_max ?? ''}`.replace(/\s+/g, ' ').trim());
  }
  if (g.ownership_min_pct != null) parts.push(`${g.ownership_min_pct}%+ Indigenous ownership`);
  return parts.length ? parts.join(' · ') : 'See eligibility on the funder\u2019s page';
}

/** Title used by the tab and by the prerender for /funding/<slug>. Always 60 chars or fewer. */
export function programPageTitle(g: Pick<FundingProgram, 'name'>): string {
  const suffix = ' | Indigenous Rising AI';
  const room = 60 - suffix.length;
  const name = g.name.length > room ? g.name.slice(0, room - 1).trimEnd() + '\u2026' : g.name;
  return name + suffix;
}

// Type and region landing pages ---------------------------------------------
export const TYPE_PAGES = [
  { slug: 'indigenous-business-loans', title: 'Indigenous business loans in Canada', types: ['loan', 'loan_guarantee'], intro: 'Repayable financing for Indigenous entrepreneurs: business loans, micro-loans and loan guarantees from Indigenous Financial Institutions, Métis Capital Corporations, BDC and provincial programmes.' },
  { slug: 'indigenous-business-grants', title: 'Indigenous business grants and non-repayable contributions', types: ['grant', 'contribution'], intro: 'Money that does not have to be paid back: grants and non-repayable contributions for Indigenous-owned businesses, with the matching-funds rules funders attach to them.' },
] as const;
export const typePageBySlug = (slug: string) => TYPE_PAGES.find((t) => t.slug === slug);
