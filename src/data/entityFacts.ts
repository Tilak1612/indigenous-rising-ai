/**
 * Machine-readable facts about the product, for structured data.
 *
 * AI answer engines and Google read JSON-LD to decide what a site is, who it
 * serves and what it does. Everything here must be true today and visible on
 * the site. In particular the feature list is DERIVED from plans.ts, so a
 * planned capability can never be declared as a product feature: the same
 * `available` flag that renders "coming soon" on /pricing keeps it out.
 */
import { PLAN_FEATURES } from './plans';

/** The one-sentence definition used for the Organization and product nodes. */
export const PRODUCT_DEFINITION =
  'Indigenous Rising AI is a web platform that helps First Nations, Inuit and Métis entrepreneurs in Canada find funding, build a business plan and access business training, designed around OCAP® principles with data stored in Canada.';

export const PRODUCT_AUDIENCE = 'First Nations, Inuit and Métis entrepreneurs and businesses in Canada';

/**
 * Software capabilities a visitor can use today on the self-serve plans
 * (Free and Growth). Excludes plan-inheritance rows and human support
 * commitments, which are not product features.
 */
export function liveFeatureList(): string[] {
  const rows = [...PLAN_FEATURES.Maadaadiziwin, ...PLAN_FEATURES.Ogichidaakwe];
  const out: string[] = [];
  for (const f of rows) {
    if (!f.available) continue;
    if (/^Everything in /i.test(f.text)) continue;
    if (/support/i.test(f.text)) continue;
    if (!out.includes(f.text)) out.push(f.text);
  }
  return out;
}
