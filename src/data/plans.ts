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
  { text: 'OCAP® compliant data handling, stored in Canada', available: true },
  { text: 'Multi-language interface (EN, FR — more rolling out)', available: true },
  { text: 'Full data export at any time', available: true },
  { text: 'Email support', available: true },
  { text: '3 AI funding matches per month', available: true },
  { text: 'Business health score', available: true },
];

const growthFeatures: PlanFeature[] = [
  { text: 'Everything in Free', available: true },
  { text: 'Priority email support', available: true },
  { text: 'Cultural competency training programs', available: true },
  { text: 'AI-powered funding navigator (unlimited matches)', available: true },
  { text: 'Grant writing assistant', available: true },
  { text: 'Funding deadline alerts (email + SMS)', available: true },
  { text: 'Quarterly impact report PDF', available: true },
  { text: 'Application checklist generator', available: true },
];

const professionalFeatures: PlanFeature[] = [
  { text: 'Everything in Growth', available: true },
  { text: 'Multi-entity support (up to 3 businesses)', available: true },
  { text: 'Quarterly business review with our team', available: true },
  { text: 'IFI Connection Engine (50+ Indigenous Financial Institutions)', available: true },
  { text: 'Priority phone and chat support', available: true },
  { text: 'Cohort matching with peers in your stage and industry', available: true },
  { text: 'Grant Success Predictor', available: true },
  { text: '7-generation planning canvas', available: true },
];

const nationsFeatures: PlanFeature[] = [
  { text: 'Everything in Professional', available: true },
  { text: 'Unlimited business entities', available: true },
  { text: "White-label platform with your Nation's branding", available: true },
  { text: 'OCAP® data governance console', available: true },
  { text: 'Government reporting module (ISC, AANDC formats)', available: true },
  { text: "Custom AI training on your community's data", available: true },
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
