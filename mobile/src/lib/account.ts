import { callFunction } from './api';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  business_name: string | null;
  province: string | null;
  industry: string | null;
  business_stage: string | null;
  indigenous_identity: string | null;
  entity_type: string | null;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,full_name,email,business_name,province,industry,business_stage,indigenous_identity,entity_type')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
}

// The fields the matcher needs before it can run; shown as a nudge on Home.
export function profileMissingFields(p: Profile | null): string[] {
  if (!p) return ['business profile'];
  const missing: string[] = [];
  if (!p.business_name) missing.push('business name');
  if (!p.province) missing.push('province');
  if (!p.industry) missing.push('industry');
  if (!p.business_stage) missing.push('business stage');
  return missing;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  plan_name: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Read-only. The source of truth is Stripe via the check-subscription
 * function (as on the web); the subscriptions row adds the plan's display
 * name. Upgrades and cancellations happen on the website, never in the app.
 */
export async function fetchSubscription(): Promise<SubscriptionStatus> {
  const fallback: SubscriptionStatus = {
    subscribed: false,
    plan_name: null,
    status: null,
    current_period_end: null,
    cancel_at_period_end: false,
  };
  let subscribed = false;
  try {
    const { data } = await callFunction<{ subscribed?: boolean }>('check-subscription', {}, 8_000);
    subscribed = Boolean(data?.subscribed);
  } catch {
    // Unreachable -> treat as free, which is the function's own fallback.
  }
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_name,status,current_period_end,cancel_at_period_end')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { ...fallback, subscribed };
  return {
    subscribed,
    plan_name: data.plan_name ?? null,
    status: data.status ?? null,
    current_period_end: data.current_period_end ?? null,
    cancel_at_period_end: Boolean(data.cancel_at_period_end),
  };
}

// --- self-serve account deletion (30-day grace period) ----------------------

export interface DeletionRequest {
  requested_at: string;
  scheduled_for: string;
}

export async function getDeletionRequest(userId: string): Promise<DeletionRequest | null> {
  const { data, error } = await supabase
    .from('account_deletion_requests')
    .select('requested_at,scheduled_for')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DeletionRequest | null) ?? null;
}

export async function requestAccountDeletion(userId: string): Promise<DeletionRequest> {
  const { data, error } = await supabase
    .from('account_deletion_requests')
    .insert({ user_id: userId, source: 'app' })
    .select('requested_at,scheduled_for')
    .single();
  if (error) throw new Error(error.message);
  return data as DeletionRequest;
}

export async function cancelAccountDeletion(userId: string): Promise<void> {
  const { error } = await supabase.from('account_deletion_requests').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export function formatDeletionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Everything the signed-in user owns that the app can read, as one JSON
 * document. Same tables the web export covers; RLS scopes each query.
 */
export async function exportMyData(userId: string): Promise<string> {
  const [profile, plans, saved] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('business_plans').select('*').eq('user_id', userId),
    supabase.from('funding_saved_matches').select('*').eq('user_id', userId),
  ]);
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      profile: profile.data ?? null,
      business_plans: plans.data ?? [],
      saved_funding: saved.data ?? [],
    },
    null,
    2,
  );
}
