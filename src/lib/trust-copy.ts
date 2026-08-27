/**
 * Single source of truth for the governance sentences that appear on more
 * than one surface.
 *
 * The sign-up screen shows a data-residency line; /canadian-compliance shows
 * the same claim in full. If those two ever drift, the product is making two
 * different promises about the same thing — on a platform whose entire
 * positioning is data sovereignty, that is the worst possible inconsistency.
 *
 * Every string here is EXISTING copy lifted verbatim from
 * src/pages/CanadianCompliance.tsx. Nothing here was newly drafted: the
 * governance wording is Tilak's to write, and the Trust Center copy is still
 * pending. When that page ships, this module is the one place to update, and
 * trust-copy.test.ts fails if a surface stops matching it.
 */

/** Verbatim from the "Canadian Data Residency" section. */
export const DATA_RESIDENCY_LINE =
  'All user data is stored exclusively on Canadian servers, subject to Canadian jurisdiction.';

/** Verbatim from the OCAP® section and the FAQ answer. */
export const OCAP_ALIGNMENT_LINE =
  'OCAP® is a registered trademark of the First Nations Information Governance Centre; we are designed around it, not certified by it.';
