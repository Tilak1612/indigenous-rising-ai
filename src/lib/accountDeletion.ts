import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';

/**
 * Self-serve account deletion (30-day grace period). One row per user in
 * account_deletion_requests, protected by RLS; a daily database job performs
 * the hard delete once scheduled_for has passed. Uses PostgREST directly, as
 * the rest of the dashboard does, because supabase-js query calls can hang
 * on this project.
 */
export interface DeletionRequest {
  user_id: string;
  requested_at: string;
  scheduled_for: string;
  source: 'web' | 'app' | 'email';
}

export const DELETION_GRACE_DAYS = 30;

const headers = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${readStoredSession()?.access_token ?? SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
});

export async function getDeletionRequest(userId: string): Promise<DeletionRequest | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/account_deletion_requests?select=user_id,requested_at,scheduled_for,source&user_id=eq.${userId}`,
    { headers: headers() },
  );
  if (!res.ok) throw new Error(`Could not read deletion status (HTTP ${res.status})`);
  const rows = (await res.json()) as DeletionRequest[];
  return rows[0] ?? null;
}

export async function requestAccountDeletion(userId: string): Promise<DeletionRequest> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/account_deletion_requests`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: userId, source: 'web' }),
  });
  if (!res.ok) throw new Error(`Could not schedule deletion (HTTP ${res.status})`);
  const rows = (await res.json()) as DeletionRequest[];
  return rows[0];
}

export async function cancelAccountDeletion(userId: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/account_deletion_requests?user_id=eq.${userId}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Could not cancel deletion (HTTP ${res.status})`);
}

export function formatDeletionDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}
