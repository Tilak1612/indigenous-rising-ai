import { trackEvent } from '@/lib/analytics';

/**
 * Conversion-funnel events, alongside the demo funnel in DemoCta.
 *
 * Named for the click, not the outcome: `sign_up` (fired on account creation
 * in Auth) already covers the outcome, so a CTA click event with the same
 * name would double-count the funnel. Placements mirror DemoCta's vocabulary
 * so the two funnels line up in analysis.
 */
export type SignupCtaPlacement =
  | 'nav'
  | 'nav_mobile'
  | 'landing_nav'
  | 'hero'
  | 'pricing_card'
  | 'footer_cta';

export function trackSignupCta(placement: SignupCtaPlacement, plan?: string): void {
  trackEvent('signup_cta_click', plan ? { placement, plan } : { placement });
}

export function trackPricingPlanSelected(plan: string, billing: string, outcome: string): void {
  // `outcome` records where the click actually led (signup, checkout,
  // contact_sales, already_free, no_price) — a click on a plan card is not
  // one funnel step but five different ones.
  trackEvent('pricing_plan_selected', { plan, billing, outcome });
}

/** Fire once per mount, on the first interaction with any field. */
export function trackFormStart(form: string): void {
  trackEvent('form_start', { form });
}

export function trackFormSubmitted(form: string): void {
  trackEvent('form_submitted', { form });
}
