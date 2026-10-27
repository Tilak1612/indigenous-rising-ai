/**
 * Official link engine for funding programmes.
 *
 * Every programme card and detail page shows ONE primary outbound button, and
 * the button must describe where it actually goes. A funder homepage is never
 * labelled "Apply": 10 of the 17 original records pointed at a homepage, and
 * several of those funders have no online application at all (the Aboriginal
 * Entrepreneurship Program is applied for through a local lender). The
 * database stores the most specific verified destination in `apply_url` and
 * says what kind of page it is in `apply_link_type`; this module turns that
 * into a label and a safe anchor.
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

export const APPLY_LINK_TYPES = [
  'application_form',
  'application_instructions',
  'program_page',
  'directory',
  'contact',
] as const;
export type ApplyLinkType = (typeof APPLY_LINK_TYPES)[number];

export interface LinkSource {
  id?: string;
  apply_url?: string | null;
  apply_link_type?: string | null;
  source_url?: string | null;
  application_url?: string | null;
}

export interface OfficialLink {
  url: string;
  /** Button text. Says what the destination is, never more. */
  label: string;
  /** One sentence shown under the button on the detail page. */
  description: string;
  type: ApplyLinkType;
  kind: 'apply' | 'source';
}

const LABELS: Record<ApplyLinkType, { label: string; description: string }> = {
  application_form: {
    label: 'Apply on the official website',
    description: 'Opens the funder\u2019s own application page. Indigenous Rising AI is not part of the application.',
  },
  application_instructions: {
    label: 'Read the application instructions',
    description: 'Opens the funder\u2019s page that explains how to apply (forms, documents and where to send them).',
  },
  program_page: {
    label: 'View the official program page',
    description: 'Opens the funder\u2019s programme page. Application details are on that site.',
  },
  directory: {
    label: 'Find your local Indigenous lender',
    description: 'This programme is applied for through a local Indigenous Financial Institution or Métis Capital Corporation. Opens the directory of lenders.',
  },
  contact: {
    label: 'Contact the funding organization',
    description: 'This funder takes applications by contact, not online. Opens their site so you can reach them.',
  },
};

export const isApplyLinkType = (v: unknown): v is ApplyLinkType =>
  typeof v === 'string' && (APPLY_LINK_TYPES as readonly string[]).includes(v);

/** Only http(s) destinations are ever rendered as outbound links. */
export function isSafeExternalUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * The primary outbound link for a programme, or null when the record has no
 * usable destination at all (then the UI says so instead of guessing).
 */
export function officialLink(g: LinkSource): OfficialLink | null {
  const type: ApplyLinkType = isApplyLinkType(g.apply_link_type) ? g.apply_link_type : 'program_page';
  const candidates: Array<{ url: string | null | undefined; kind: 'apply' | 'source'; type: ApplyLinkType }> = [
    { url: g.apply_url, kind: 'apply', type },
    { url: g.source_url, kind: 'source', type: 'program_page' },
    { url: g.application_url, kind: 'source', type: 'program_page' },
  ];
  for (const c of candidates) {
    if (isSafeExternalUrl(c.url)) {
      return { url: c.url, kind: c.kind, type: c.type, ...LABELS[c.type] };
    }
  }
  return null;
}

/** The "official source" link: always the programme/source page, never the form. */
export function sourceLink(g: LinkSource): { url: string; label: string } | null {
  const url = [g.source_url, g.application_url].find(isSafeExternalUrl);
  return url ? { url, label: 'Official source' } : null;
}

/**
 * Aggregate click counter. Fire-and-forget; never blocks navigation and
 * never sends who clicked (the RPC takes only the grant id and the kind).
 */
export function recordOfficialClick(grantId: string | undefined, kind: 'apply' | 'source'): void {
  if (!grantId || typeof fetch !== 'function') return;
  try {
    void fetch(`${SUPABASE_URL}/rest/v1/rpc/record_funding_click`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_grant_id: grantId, p_kind: kind }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* analytics must never break the click */
  }
}
