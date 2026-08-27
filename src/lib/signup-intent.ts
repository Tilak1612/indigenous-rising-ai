/**
 * Signup intent — the plan a visitor chose and the campaign that brought them.
 *
 * Every top-of-funnel CTA previously pointed at a bare /auth, which defaulted
 * to SIGN-IN (`useState(true)`). A new visitor clicking "Start free account"
 * landed on a login form and had to notice a secondary toggle before they could
 * register, and whichever pricing card they clicked was forgotten at the auth
 * wall along with any UTM parameters.
 *
 * Intent survives the email-verification round trip, which is a full page load
 * from a different origin, so it is persisted in sessionStorage rather than
 * held in memory or component state.
 */
export type PlanKey = 'Maadaadiziwin' | 'Ogichidaakwe' | 'Bimaadiziwin' | 'Gimishoomis';

export interface SignupIntent {
  plan?: PlanKey;
  billing?: 'monthly' | 'annual';
  campaign?: Record<string, string>;
  capturedAt: string;
}

const KEY = 'ir-signup-intent';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ref'];

/** Reads campaign parameters off any URL — call on first landing, not just at /auth. */
export function readCampaign(search: string): Record<string, string> {
  const p = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 200); // bound it; this is attacker-supplied text
  }
  return out;
}

export function saveSignupIntent(next: Omit<SignupIntent, 'capturedAt'>): void {
  try {
    const existing = readSignupIntent();
    const merged: SignupIntent = {
      // Campaign is sticky: a later plan click must not wipe the source that
      // brought the visitor in.
      campaign: { ...(existing?.campaign ?? {}), ...(next.campaign ?? {}) },
      plan: next.plan ?? existing?.plan,
      billing: next.billing ?? existing?.billing,
      capturedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Private mode / storage disabled — signup still works, context is just lost.
  }
}

export function readSignupIntent(): SignupIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SignupIntent) : null;
  } catch {
    return null;
  }
}

export function clearSignupIntent(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* no-op */ }
}

/** Builds the signup URL for a CTA, carrying plan + billing in the query string. */
export function signupHref(plan?: PlanKey, billing?: 'monthly' | 'annual'): string {
  const p = new URLSearchParams();
  if (plan) p.set('plan', plan);
  if (billing) p.set('billing', billing);
  const qs = p.toString();
  return `/signup${qs ? `?${qs}` : ''}`;
}
