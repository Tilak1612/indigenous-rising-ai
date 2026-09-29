/**
 * Published figures for /guides/indigenous-business-funding-statistics.
 *
 * Every number here was read from the live grants table on the asOf date, and
 * the verification counts come from a programme-by-programme check against each
 * funder's own website on the same day.
 *
 * This file is the single source for the page. It is hard-coded rather than
 * queried at render time on purpose: the page makes a dated claim ("as of 28
 * September 2026"), and a dated claim that silently changes underneath itself
 * is worse than one that is explicitly stale. Update this file when the
 * inventory is re-checked, and move asOf with it.
 *
 * The honest part is the point. No other source publishes per-programme
 * verification status for Canadian Indigenous business funding, including the
 * aggregators with far larger catalogues. Saying "6 of 17 could not be
 * verified, and here is exactly why" is the differentiator — not the count.
 */
export const FUNDING_STATS = {
  asOf: '2026-09-28',
  asOfLabel: '28 September 2026',

  /** Programmes published in the Funding Navigator. */
  total: 17,
  /** Distinct funding organisations behind them. */
  funders: 16,

  /** Checked against the funder's own page and carrying a verification date. */
  verified: 11,
  /** Could not be verified — see unverifiedReasons. */
  unverified: 6,

  /** Programmes that state a maximum amount we could trace to the funder. */
  statesAmount: 5,
  lowestCeiling: 50000,
  highestCeiling: 250000000,

  /** Programmes with a fixed application deadline. */
  withDeadline: 0,
  /** Programmes that are rolling intake. */
  rolling: 17,
} as const;

export type UnverifiedReason = {
  reason: string;
  count: number;
  detail: string;
};

/** Why each unverified programme could not be confirmed. */
export const UNVERIFIED_REASONS: UnverifiedReason[] = [
  {
    reason: 'The funder page returned 404',
    count: 2,
    detail:
      'Two programme pages have been dead since at least August 2026. We searched for replacements and could not find them with confidence, and pointing people at the wrong programme is worse than admitting a link is dead.',
  },
  {
    reason: 'The funder site blocked an automated request',
    count: 3,
    detail:
      'Three sites returned a 403 or timed out for an automated check. That is bot protection, not evidence the programme has ended, so we have not marked them dead and have not changed any figure on them. They need a person to open them in an ordinary browser.',
  },
  {
    reason: 'The funder domain no longer resolves',
    count: 1,
    detail:
      'One organisation’s website does not load on any variant we tried. We have not guessed a replacement address.',
  },
];

/** Findings from the September 2026 verification pass. */
export const VERIFICATION_FINDINGS: string[] = [
  'Four programmes carried a maximum of $250,000 that no funder publishes anywhere. That figure is the federal Aboriginal Entrepreneurship Program ceiling for community businesses, and it had been applied to unrelated lenders. All four were removed.',
  'One programme displayed its minimum as though it were its maximum, because only a lower bound had been recorded. The card read "Up to $20,000,000" for a programme that starts at $20 million and runs to $250 million.',
  'The main federal programme had no amount recorded at all, so it displayed as "Amount varies".',
  'Two funder links were dead and one domain had disappeared entirely.',
];
