/**
 * Mirrors the CHECK constraint on public.funding_saved_matches.status.
 *
 * Writing any value outside this set makes Postgres reject the row with
 * funding_saved_matches_status_check. That is exactly what shipped: the
 * Funding page upserted status 'saved', which is not a member, so every
 * save on that page failed and the UI reverted to unsaved. Mocked tests
 * could not catch it because a mock accepts any string; the constraint
 * lives in the database, so the allowed set has to be stated here and
 * asserted against, never re-typed as a literal at the call site.
 *
 * Keep in sync with the migration that defines the constraint.
 */
export const SAVED_MATCH_STATUSES = [
  'interested',
  'applied',
  'pending',
  'awarded',
  'declined',
  'withdrawn',
] as const;

export type SavedMatchStatus = (typeof SAVED_MATCH_STATUSES)[number];

/** Status applied when a user saves a match they have not yet acted on. */
export const DEFAULT_SAVED_STATUS: SavedMatchStatus = 'interested';

export const isSavedMatchStatus = (v: unknown): v is SavedMatchStatus =>
  typeof v === 'string' && (SAVED_MATCH_STATUSES as readonly string[]).includes(v);
