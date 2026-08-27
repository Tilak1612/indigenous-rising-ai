/**
 * Funding Readiness Workspace — stage model and persistence.
 *
 * Threads the seven readiness stages into one resumable record per
 * (user, program). Three stages already had working implementations and
 * are linked to rather than rebuilt:
 *
 *   documents -> public.documents + the private 'documents' bucket
 *   tasks     -> public.tasks, related_type='funding_application'
 *   draft     -> public.grant_applications (+ _versions)
 *
 * All I/O is direct-fetch with the user's token, matching Documents.tsx
 * and Tasks.tsx (the supabase-js query path can hang on this project).
 * RLS scopes every row to auth.uid() on both read and write.
 */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';

const REST = `${SUPABASE_URL}/rest/v1`;

export const authHeaders = (json = false): Record<string, string> => {
  const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
  const h: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
  };
  if (json) h['Content-Type'] = 'application/json';
  return h;
};

/** Mirrors the CHECK constraint on funding_applications.stage. */
export const STAGES = [
  'match',
  'eligibility',
  'documents',
  'missing_info',
  'draft',
  'tasks',
  'submission',
  'submitted',
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  match: 'Match',
  eligibility: 'Eligibility',
  documents: 'Documents',
  missing_info: 'Missing info',
  draft: 'Draft',
  tasks: 'Deadlines',
  submission: 'Submission',
  submitted: 'Submitted',
};

/** The seven working stages. 'submitted' is a terminal state, not a step. */
export const WORKING_STAGES = STAGES.filter((s) => s !== 'submitted');

export const stageIndex = (s: Stage) => STAGES.indexOf(s);

export const ITEM_STATES = ['met', 'unmet', 'unknown'] as const;
export type ItemState = (typeof ITEM_STATES)[number];

export const ITEM_KINDS = ['eligibility', 'missing_info', 'submission'] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export type ReadinessItem = {
  id: string;
  application_id: string;
  kind: ItemKind;
  label: string;
  state: ItemState;
  document_id: string | null;
  note: string | null;
  position: number;
};

export type FundingApplication = {
  id: string;
  grant_id: string;
  stage: Stage;
  grant_application_id: string | null;
  updated_at: string;
};

/**
 * Resolves the workspace for (user, grant), creating it on first visit.
 * The UNIQUE (user_id, grant_id) constraint plus merge-duplicates is what
 * makes "leave and come back" return the same row rather than a duplicate,
 * so progress is never silently forked.
 */
export const openWorkspace = async (
  userId: string,
  grantId: string,
): Promise<FundingApplication> => {
  const res = await fetch(
    `${REST}/funding_applications?on_conflict=user_id,grant_id&select=*`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(true),
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ user_id: userId, grant_id: grantId }),
    },
  );
  if (!res.ok) throw new Error(`could not open workspace (${res.status})`);
  const rows = (await res.json()) as FundingApplication[];
  if (!rows.length) throw new Error('workspace upsert returned no row');
  return rows[0];
};

export const listApplications = async (
  userId: string,
): Promise<FundingApplication[]> => {
  const res = await fetch(
    `${REST}/funding_applications?select=id,grant_id,stage,grant_application_id,updated_at` +
      `&user_id=eq.${userId}&order=updated_at.desc`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`could not list applications (${res.status})`);
  return (await res.json()) as FundingApplication[];
};

export const setStage = async (applicationId: string, stage: Stage): Promise<void> => {
  const res = await fetch(`${REST}/funding_applications?id=eq.${applicationId}`, {
    method: 'PATCH',
    headers: { ...authHeaders(true), Prefer: 'return=minimal' },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error(`could not save stage (${res.status})`);
};

export const listItems = async (applicationId: string): Promise<ReadinessItem[]> => {
  const res = await fetch(
    `${REST}/funding_readiness_items?select=*&application_id=eq.${applicationId}` +
      `&order=kind.asc,position.asc`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`could not load checklist (${res.status})`);
  return (await res.json()) as ReadinessItem[];
};

export const addItem = async (
  applicationId: string,
  userId: string,
  kind: ItemKind,
  label: string,
  position: number,
): Promise<ReadinessItem> => {
  const res = await fetch(`${REST}/funding_readiness_items?select=*`, {
    method: 'POST',
    headers: { ...authHeaders(true), Prefer: 'return=representation' },
    body: JSON.stringify({
      application_id: applicationId,
      user_id: userId,
      kind,
      label,
      position,
    }),
  });
  if (!res.ok) throw new Error(`could not add item (${res.status})`);
  const rows = (await res.json()) as ReadinessItem[];
  return rows[0];
};

export const updateItem = async (
  itemId: string,
  patch: Partial<Pick<ReadinessItem, 'state' | 'note' | 'document_id' | 'label'>>,
): Promise<void> => {
  const res = await fetch(`${REST}/funding_readiness_items?id=eq.${itemId}`, {
    method: 'PATCH',
    headers: { ...authHeaders(true), Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`could not update item (${res.status})`);
};

export const deleteItem = async (itemId: string): Promise<void> => {
  const res = await fetch(`${REST}/funding_readiness_items?id=eq.${itemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`could not remove item (${res.status})`);
};

/**
 * Readiness is the share of checklist items explicitly marked met. Items
 * left 'unknown' count against readiness on purpose: an unanswered
 * eligibility question is not a satisfied one, and showing it as progress
 * would overstate how ready an application actually is.
 */
export const readinessPercent = (items: ReadinessItem[]): number => {
  if (!items.length) return 0;
  const met = items.filter((i) => i.state === 'met').length;
  return Math.round((met / items.length) * 100);
};
