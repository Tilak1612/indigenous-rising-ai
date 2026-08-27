/**
 * Build-time feature flags.
 *
 * Vite inlines import.meta.env at build time, so a flag is fixed per
 * deploy — this is a release gate, not a runtime toggle. Absent or any
 * value other than 'true' means off, so a missing env var fails closed.
 */
const on = (v: unknown) => v === 'true' || v === true;

export const FLAGS = {
  /**
   * Funding Readiness Workspace (P0-3). Off falls back to match-only
   * behaviour: the Saved Matches list with no workspace entry points.
   */
  readinessWorkspace: on(import.meta.env.VITE_FEATURE_READINESS_WORKSPACE),
} as const;

export type FlagName = keyof typeof FLAGS;
