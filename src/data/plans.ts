// Single source of truth for the four pricing plans, consumed by BOTH the
// /pricing page (PricingSection) and the homepage teaser (LandingV2). Keeping
// the feature lists, names, prices, and flags here means the two surfaces can
// never drift apart again. `key` is the internal/Stripe plan key — do not change
// it (PricingSection's checkout + STRIPE_PRICES are keyed on it).

export interface PlanFeature {
  text: string;
  /** false = planned/coming-soon (rendered with the ◐ marker). */
  available: boolean;
}

export interface PlanInfo {
  key: 'Maadaadiziwin' | 'Ogichidaakwe' | 'Bimaadiziwin' | 'Gimishoomis';
  name: string;        // display label
  tagline: string;     // short subtitle
  priceLabel: string;  // '$0' / '$49' / '$149' / "Let's talk"
  period: string;      // 'forever' / 'per month' / '' (custom)
  popular: boolean;    // featured (Growth)
  comingSoon: boolean; // not yet purchasable (Professional)
  features: PlanFeature[];
}

const freeFeatures: PlanFeature[] = [
  { text: 'Indigenous business planning assistant (auto-saved)', available: true },
  { text: 'Funding opportunity browser', available: true },
  { text: 'Community forum and resource library', available: true },
  { text: 'OCAP®-aligned data handling, stored in Canada', available: true },
  // No i18n library is installed and there are no French routes, so this is
  // planned, not available. (The dashboard language menu is also inert.)
  { text: 'Interface in English & French', available: false },
  { text: 'Full data export at any time', available: true },
  { text: 'Email support', available: true },
  { text: '3 AI funding matches per month', available: true },
  // Nothing in the app computes a health score — searched the whole codebase.
  { text: 'Business health score', available: false },
];

const growthFeatures: PlanFeature[] = [
  { text: 'Everything in Free', available: true },
  { text: 'Priority email support', available: true },
  { text: 'Cultural competency training programs', available: true },
  { text: 'AI-powered funding navigator (50 matches/month)', available: true },
  { text: 'Grant writing assistant', available: false },
  // Email only: send-funding-digest is live with CASL double opt-in. There is
  // no SMS integration anywhere in the codebase, so "+ SMS" was a claim about
  // a channel that cannot send.
  { text: 'Funding deadline alerts by email', available: true },
  // The impact export produces JSON, and the analytics page itself says
  // "coming in a future release" — so a quarterly PDF is planned.
  { text: 'Quarterly impact report', available: false },
  // Real, but it is a checklist workspace the user fills in — not a generator.
  { text: 'Application readiness checklists', available: true },
];

const professionalFeatures: PlanFeature[] = [
  { text: 'Everything in Growth', available: true },
  { text: 'Multi-entity support (up to 3 businesses)', available: false },
  { text: 'Quarterly business review with our team', available: true },
  // Planned, and without the "50+" count: no directory, dataset or
  // integration with Indigenous Financial Institutions exists in the product,
  // so the number could not be substantiated either.
  { text: 'Indigenous Financial Institution connections', available: false },
  { text: 'Priority phone and chat support', available: true },
  { text: 'Cohort matching with peers in your stage and industry', available: false },
  // The live business planner has six sections (Vision & Mission, Market
  // Analysis, Products/Services, Operations, Financial Projections, Community
  // Impact) — no seven-generation canvas among them.
  { text: 'Seven-generation planning canvas', available: false },
];

const nationsFeatures: PlanFeature[] = [
  { text: 'Everything in Professional', available: true },
  { text: 'Unlimited business entities', available: true },
  { text: "White-label platform with your Nation's branding", available: false },
  { text: 'OCAP® data governance console', available: false },
  { text: 'Government reporting module (ISC, AANDC formats)', available: false },
  { text: "Custom AI training on your community's data", available: false },
  { text: 'Dedicated account manager', available: true },
  { text: 'On-site training programs', available: true },
  { text: '24/7 priority support', available: true },
];

/** Feature lists keyed by internal plan key (used by PricingSection). */
export const PLAN_FEATURES: Record<PlanInfo['key'], PlanFeature[]> = {
  Maadaadiziwin: freeFeatures,
  Ogichidaakwe: growthFeatures,
  Bimaadiziwin: professionalFeatures,
  Gimishoomis: nationsFeatures,
};

/** Ordered plans for rendering (used by the homepage teaser). */
export const PLANS: PlanInfo[] = [
  { key: 'Maadaadiziwin', name: 'Free', tagline: 'For getting started.', priceLabel: '$0', period: 'forever', popular: false, comingSoon: false, features: freeFeatures },
  { key: 'Ogichidaakwe', name: 'Growth', tagline: 'For businesses that are scaling.', priceLabel: '$49', period: 'per month', popular: true, comingSoon: false, features: growthFeatures },
  { key: 'Bimaadiziwin', name: 'Professional', tagline: 'For established businesses.', priceLabel: '$149', period: 'per month', popular: false, comingSoon: false, features: professionalFeatures },
  { key: 'Gimishoomis', name: 'Nations & Organizations', tagline: 'For communities & support orgs.', priceLabel: "Let's talk", period: '', popular: false, comingSoon: false, features: nationsFeatures },
];
