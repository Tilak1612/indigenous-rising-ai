import { callFunction } from './api';
import { supabase } from './supabase';

// Mirrors the columns the web Funding page selects. RLS exposes only
// published rows, so this is the same catalogue the matcher uses; each row carries its own
// last_verified date and verification_status rather than a blanket claim.
export interface Grant {
  id: string;
  name: string;
  funder: string | null;
  description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string | null;
  deadline: string | null;
  is_recurring: boolean | null;
  provinces: string[] | null;
  industries: string[] | null;
  eligibility_notes: string | null;
  application_url: string | null;
  source_url: string | null;
  funding_type: string | null;
  is_repayable: boolean | null;
  last_verified: string | null;
  verification_status: string | null;
}

export const GRANT_COLUMNS =
  'id,name,funder,description,amount_min,amount_max,amount_currency,deadline,is_recurring,provinces,industries,eligibility_notes,application_url,source_url,funding_type,is_repayable,last_verified,verification_status';

export async function fetchGrants(): Promise<Grant[]> {
  const { data, error } = await supabase
    .from('grants')
    .select(GRANT_COLUMNS)
    .eq('is_published', true)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Grant[];
}

export async function fetchGrant(id: string): Promise<Grant | null> {
  const { data, error } = await supabase
    .from('grants')
    .select(GRANT_COLUMNS)
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Grant | null) ?? null;
}

export interface SavedMatch {
  id: string;
  grant_id: string;
  status: string;
  notes: string | null;
  saved_at: string;
  grant: Grant | null;
}

// The web's default when a user saves from the browser; the table's CHECK
// constraint limits the values, so keep this in step with the web.
const DEFAULT_SAVED_STATUS = 'saved';

export async function fetchSavedMatches(): Promise<SavedMatch[]> {
  const { data, error } = await supabase
    .from('funding_saved_matches')
    .select(`id,grant_id,status,notes,saved_at,grant:grants(${GRANT_COLUMNS})`)
    .order('saved_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SavedMatch[];
}

export async function fetchSavedGrantIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('funding_saved_matches').select('grant_id');
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.grant_id as string));
}

export async function setSaved(userId: string, grantId: string, saved: boolean): Promise<void> {
  const q = saved
    ? supabase
        .from('funding_saved_matches')
        .upsert(
          { user_id: userId, grant_id: grantId, status: DEFAULT_SAVED_STATUS },
          { onConflict: 'user_id,grant_id' },
        )
    : supabase.from('funding_saved_matches').delete().eq('user_id', userId).eq('grant_id', grantId);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

// --- AI matching (match-funding-opportunities edge function) ---------------

export interface Criterion {
  label: string;
  met: boolean | null;
  detail?: string;
}

export interface Match {
  grant_id: string;
  name: string;
  funder: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  is_recurring: boolean;
  application_url: string;
  funding_type: string;
  is_repayable: boolean | null;
  criteria?: Criterion[];
  verification_status?: string;
  eligibility: 'yes' | 'no' | 'maybe';
  fit_score?: number;
  explanation?: string;
}

export interface MatchResponse {
  matches: Match[];
  tier: 'free' | 'growth' | 'pro' | 'enterprise';
  matches_remaining_this_month: number | null;
  message?: string;
  error?: string;
  missing_fields?: string[];
  quota_exceeded?: boolean;
  rate_limited?: boolean;
  upgrade_url?: string;
}

export type MatchOutcome =
  | { kind: 'results'; data: MatchResponse }
  | { kind: 'profile-incomplete'; missing: string[] }
  | { kind: 'quota-exceeded'; message: string }
  | { kind: 'rate-limited'; message: string }
  | { kind: 'error'; message: string };

export async function runMatching(): Promise<MatchOutcome> {
  const { status, data } = await callFunction<MatchResponse>('match-funding-opportunities');
  if (data.missing_fields?.length) {
    return { kind: 'profile-incomplete', missing: data.missing_fields };
  }
  if (status === 402 || data.quota_exceeded) {
    return {
      kind: 'quota-exceeded',
      message: data.message ?? 'You have used all your AI matches for this month.',
    };
  }
  if (status === 429 || data.rate_limited) {
    return { kind: 'rate-limited', message: data.message ?? 'Please wait a moment and try again.' };
  }
  if (status >= 400 || data.error) {
    return { kind: 'error', message: data.error ?? data.message ?? `Matching failed (HTTP ${status})` };
  }
  return { kind: 'results', data };
}

// --- formatting ------------------------------------------------------------

/** 'loan_guarantee' -> 'Loan guarantee'; catalogue values are snake_case enums. */
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  const words = value.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatAmount(min: number | null, max: number | null): string {
  if (!min && !max) return 'Amount varies';
  const fmt = (n: number) => '$' + n.toLocaleString('en-CA');
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  return `Up to ${fmt((max ?? min) as number)}`;
}

export function formatDeadline(deadline: string | null, recurring?: boolean | null): string {
  if (!deadline) return recurring ? 'Rolling intake' : 'No fixed deadline';
  const [y, m, d] = deadline.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const [y, m, d] = deadline.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86_400_000);
}
