/**
 * Testimonials — consent-gated social proof.
 *
 * Nothing here can surface an unapproved quote. RLS only returns rows that
 * are simultaneously consent_status='granted', approval_status='approved'
 * and publish_status='published', and a CHECK constraint stops a row
 * reaching 'published' without a recorded approver and timestamp. Both were
 * verified against production by attempting the exploit, including as the
 * table owner with RLS bypassed.
 *
 * The public component renders nothing when the list is empty, so it is
 * safe to mount before any real testimonial exists — which is the state
 * today. No placeholder is ever displayed.
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';

const REST = `${SUPABASE_URL}/rest/v1`;

const headers = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

export const CONSENT_STATUSES  = ['pending', 'granted', 'withdrawn'] as const;
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export const PUBLISH_STATUSES  = ['draft', 'published', 'unpublished'] as const;

export type ConsentStatus  = (typeof CONSENT_STATUSES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type PublishStatus  = (typeof PUBLISH_STATUSES)[number];

export type Testimonial = {
  id: string;
  customer_name: string;
  role: string | null;
  company: string | null;
  location: string | null;
  quote: string;
  verified_metric: string | null;
  photo_or_logo_url: string | null;
  source: string | null;
  consent_status: ConsentStatus;
  approval_status: ApprovalStatus;
  publish_status: PublishStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

/** What a visitor may submit. The workflow columns are deliberately absent. */
export type TestimonialSubmission = {
  customer_name: string;
  role?: string;
  company?: string;
  location?: string;
  quote: string;
  verified_metric?: string;
  source?: string;
};

const PUBLIC_FIELDS =
  'id,customer_name,role,company,location,quote,verified_metric,photo_or_logo_url,created_at';

/**
 * Published testimonials only. The filters below mirror the RLS policy
 * rather than replacing it — if this query were wrong, RLS would still
 * refuse the rows.
 */
export const listPublishedTestimonials = async (): Promise<Testimonial[]> => {
  const res = await fetch(
    `${REST}/testimonials?select=${PUBLIC_FIELDS}` +
      `&publish_status=eq.published&approval_status=eq.approved&consent_status=eq.granted` +
      `&order=created_at.desc`,
    { headers: headers() },
  );
  if (!res.ok) throw new Error(`could not load testimonials (${res.status})`);
  return (await res.json()) as Testimonial[];
};

/**
 * Public intake. Sends only the content fields: consent, approval and
 * publish state come from column defaults, and the RLS WITH CHECK refuses
 * any insert that tries to set them.
 */
export const submitTestimonial = async (input: TestimonialSubmission): Promise<void> => {
  const res = await fetch(`${REST}/testimonials`, {
    method: 'POST',
    headers: { ...headers(true), Prefer: 'return=minimal' },
    body: JSON.stringify({
      customer_name: input.customer_name.trim(),
      role: input.role?.trim() || null,
      company: input.company?.trim() || null,
      location: input.location?.trim() || null,
      quote: input.quote.trim(),
      verified_metric: input.verified_metric?.trim() || null,
      source: input.source?.trim() || null,
    }),
  });
  if (!res.ok) throw new Error(`could not submit (${res.status})`);
};

/** Admin queue. RLS returns nothing here unless the caller is an admin. */
export const listAllTestimonials = async (): Promise<Testimonial[]> => {
  const res = await fetch(
    `${REST}/testimonials?select=*&order=created_at.desc`,
    { headers: headers() },
  );
  if (!res.ok) throw new Error(`could not load the review queue (${res.status})`);
  return (await res.json()) as Testimonial[];
};

export const updateTestimonial = async (
  id: string,
  patch: Partial<Pick<Testimonial,
    'consent_status' | 'approval_status' | 'publish_status' | 'photo_or_logo_url' | 'source'>>,
  approverId?: string,
): Promise<void> => {
  // Approving must record who and when. The database enforces this too
  // (testimonials_approval_provenance), so a caller that forgets is
  // rejected rather than silently creating an unattributed approval.
  const body: Record<string, unknown> = { ...patch };
  if (patch.approval_status === 'approved') {
    body.approved_by = approverId ?? null;
    body.approved_at = new Date().toISOString();
  }
  const res = await fetch(`${REST}/testimonials?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers(true), Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`could not update (${res.status})`);
};

/** A testimonial is publishable only when consent and approval both hold. */
export const isPublishable = (t: Pick<Testimonial, 'consent_status' | 'approval_status'>) =>
  t.consent_status === 'granted' && t.approval_status === 'approved';
