/**
 * Admin-side catalogue management. Every call carries the signed-in user's
 * token; RLS only honours it for users with the admin role, so a non-admin
 * gets empty lists and 401/403 on writes rather than data.
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { PROGRAM_COLUMNS, type FundingProgram } from '@/lib/funding-catalog';

const REST = `${SUPABASE_URL}/rest/v1`;
const headers = (json = false, prefer?: string): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` };
  if (json) h['Content-Type'] = 'application/json';
  if (prefer) h.Prefer = prefer;
  return h;
};

async function expectOk(res: Response, what: string) {
  if (!res.ok) throw new Error(`${what} failed (HTTP ${res.status})`);
  return res;
}

export interface AdminGrant extends FundingProgram {
  is_published: boolean;
  verification_notes: string | null;
  published_at: string | null;
  created_at: string;
}

export const ADMIN_COLUMNS = `${PROGRAM_COLUMNS},is_published,verification_notes,published_at,created_at`;

export async function listAllGrants(): Promise<AdminGrant[]> {
  const res = await expectOk(await fetch(`${REST}/grants?select=${ADMIN_COLUMNS}&order=is_published.desc,name.asc&limit=500`, { headers: headers() }), 'Loading programmes');
  return (await res.json()) as AdminGrant[];
}

/** Editable fields. Anything else (slug, evidence, provider) is set by migration or research. */
export type GrantPatch = Partial<Pick<AdminGrant,
  'name' | 'funder' | 'description' | 'funding_type' | 'is_repayable' | 'amount_min' | 'amount_max' | 'deadline' | 'opens_at' |
  'is_recurring' | 'recurrence_notes' | 'intake_status' | 'provinces' | 'industries' | 'business_stages' | 'applicant_types' |
  'identity_criteria' | 'ownership_min_pct' | 'eligibility_notes' | 'eligibility_exclusions' | 'source_url' | 'application_url' |
  'apply_url' | 'apply_link_type' | 'application_method' | 'verification_status' | 'verification_notes' | 'last_verified' |
  'is_published' | 'published_at' | 'verification_confidence'
>>;

export async function updateGrant(id: string, patch: GrantPatch, summary: string): Promise<void> {
  await expectOk(await fetch(`${REST}/grants?id=eq.${id}`, { method: 'PATCH', headers: headers(true, 'return=minimal'), body: JSON.stringify(patch) }), 'Saving the programme');
  await logEvent(id, 'edited', summary, patch as Record<string, unknown>);
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  const patch: GrantPatch = published ? { is_published: true, published_at: new Date().toISOString() } : { is_published: false };
  await expectOk(await fetch(`${REST}/grants?id=eq.${id}`, { method: 'PATCH', headers: headers(true, 'return=minimal'), body: JSON.stringify(patch) }), published ? 'Publishing' : 'Unpublishing');
  await logEvent(id, published ? 'published' : 'unpublished', published ? 'Published from the admin console' : 'Unpublished from the admin console');
}

/** A person confirms the record against the funder's page: this is the only route to 'verified'. */
export async function markVerified(id: string, note: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const patch: GrantPatch = { verification_status: 'verified', last_verified: today, verification_confidence: 'high', verification_notes: note };
  await expectOk(await fetch(`${REST}/grants?id=eq.${id}`, { method: 'PATCH', headers: headers(true, 'return=minimal'), body: JSON.stringify(patch) }), 'Marking verified');
  await logEvent(id, 'checked', `Verified by an admin on ${today}: ${note}`.slice(0, 500));
}

export async function logEvent(grantId: string, eventType: string, summary: string, details: Record<string, unknown> = {}): Promise<void> {
  const actor = readStoredSession()?.user?.id ?? null;
  await fetch(`${REST}/funding_verification_events`, {
    method: 'POST', headers: headers(true, 'return=minimal'),
    body: JSON.stringify({ grant_id: grantId, event_type: eventType, actor, summary: summary.slice(0, 500), details }),
  }).catch(() => undefined);
}

export interface ReviewItem {
  id: string; grant_id: string | null; reason: string; severity: string; payload: Record<string, unknown>;
  status: string; created_at: string; resolution: string | null;
  grants: { name: string; slug: string; is_published: boolean } | null;
}
export async function listReviewQueue(status: 'open' | 'resolved' | 'dismissed' = 'open'): Promise<ReviewItem[]> {
  const res = await expectOk(await fetch(`${REST}/funding_review_queue?select=id,grant_id,reason,severity,payload,status,created_at,resolution,grants(name,slug,is_published)&status=eq.${status}&order=created_at.desc&limit=200`, { headers: headers() }), 'Loading the review queue');
  return (await res.json()) as ReviewItem[];
}
export async function resolveReview(id: string, status: 'resolved' | 'dismissed', resolution: string): Promise<void> {
  const resolved_by = readStoredSession()?.user?.id ?? null;
  await expectOk(await fetch(`${REST}/funding_review_queue?id=eq.${id}`, { method: 'PATCH', headers: headers(true, 'return=minimal'), body: JSON.stringify({ status, resolution: resolution.slice(0, 500), resolved_at: new Date().toISOString(), resolved_by }) }), 'Updating the review item');
}

export interface LinkCheck { id: string; grant_id: string; kind: string; url: string; status_code: number | null; final_url: string | null; verdict: string; error: string | null; checked_at: string; grants: { name: string } | null }
export async function listLinkChecks(limit = 100): Promise<LinkCheck[]> {
  const res = await expectOk(await fetch(`${REST}/funding_link_checks?select=id,grant_id,kind,url,status_code,final_url,verdict,error,checked_at,grants(name)&order=checked_at.desc&limit=${limit}`, { headers: headers() }), 'Loading link checks');
  return (await res.json()) as LinkCheck[];
}

export interface LinkReport { id: string; grant_id: string; url: string; message: string | null; created_at: string; grants: { name: string } | null }
export async function listLinkReports(limit = 100): Promise<LinkReport[]> {
  const res = await expectOk(await fetch(`${REST}/funding_link_reports?select=id,grant_id,url,message,created_at,grants(name)&order=created_at.desc&limit=${limit}`, { headers: headers() }), 'Loading reports');
  return (await res.json()) as LinkReport[];
}

export interface ClickRow { grant_id: string; day: string; link_kind: string; clicks: number; grants: { name: string } | null }
export async function listClicks(days = 30): Promise<ClickRow[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const res = await expectOk(await fetch(`${REST}/funding_outbound_clicks?select=grant_id,day,link_kind,clicks,grants(name)&day=gte.${since}&order=day.desc&limit=1000`, { headers: headers() }), 'Loading click counts');
  return (await res.json()) as ClickRow[];
}

export interface VerificationEvent { id: string; event_type: string; summary: string; created_at: string }
export async function listEvents(grantId: string): Promise<VerificationEvent[]> {
  const res = await expectOk(await fetch(`${REST}/funding_verification_events?select=id,event_type,summary,created_at&grant_id=eq.${grantId}&order=created_at.desc&limit=50`, { headers: headers() }), 'Loading history');
  return (await res.json()) as VerificationEvent[];
}
