import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));
import { trackEvent } from '@/utils/analytics';
import {
  trackSignupCta,
  trackPricingPlanSelected,
  trackFormStart,
  trackFormSubmitted,
} from '../conversion-events';

const read = (p: string) => readFileSync(p, 'utf8');

describe('conversion event helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  test('signup CTA carries its placement, and a plan only when there is one', () => {
    trackSignupCta('hero');
    expect(trackEvent).toHaveBeenCalledWith('signup_cta_click', { placement: 'hero' });
    trackSignupCta('pricing_card', 'Maadaadiziwin');
    expect(trackEvent).toHaveBeenCalledWith('signup_cta_click', {
      placement: 'pricing_card',
      plan: 'Maadaadiziwin',
    });
  });

  test('plan selection records where the click actually led', () => {
    trackPricingPlanSelected('Ogichidaakwe', 'monthly', 'checkout');
    expect(trackEvent).toHaveBeenCalledWith('pricing_plan_selected', {
      plan: 'Ogichidaakwe',
      billing: 'monthly',
      outcome: 'checkout',
    });
  });

  test('form events name the form', () => {
    trackFormStart('contact');
    trackFormSubmitted('contact');
    expect(trackEvent).toHaveBeenNthCalledWith(1, 'form_start', { form: 'contact' });
    expect(trackEvent).toHaveBeenNthCalledWith(2, 'form_submitted', { form: 'contact' });
  });
});

describe('the helpers send to GA4, not to a stub', () => {
  // These helpers used to import trackEvent from src/lib/analytics.ts — a stub
  // that wrote to localStorage and never sent anything. Every test above still
  // passed, because they mocked that stub: they proved the helper called
  // *something*, not that the event reached GA4. So signup_cta_click,
  // pricing_plan_selected, form_start and form_submitted never arrived.
  test('conversion-events imports the gtag sender', () => {
    const helper = read('src/lib/conversion-events.ts');
    expect(helper).toMatch(/import \{ trackEvent \} from '@\/utils\/analytics';/);
  });

  test('the sender it imports actually calls gtag', () => {
    const sender = read('src/utils/analytics.ts');
    const body = /export const trackEvent = \([\s\S]*?\n\};/.exec(sender)?.[0] ?? '';
    expect(body, 'trackEvent not found in src/utils/analytics.ts').not.toBe('');
    expect(body).toMatch(/window\.gtag\('event', eventName/);
  });

  test('the non-sending stub is gone and nothing imports it', () => {
    expect(() => read('src/lib/analytics.ts')).toThrow();
    const out = (() => {
      try {
        // Static AND dynamic imports: FundingList and ImpactLogForm used
        // import('@/lib/analytics'), which a from-only pattern missed.
        return execSync(`git grep -lE "['\\"]@/lib/analytics['\\"]" -- src ':(exclude)*__tests__*'`, { encoding: 'utf8' });
      } catch { return ''; }
    })();
    expect(out.trim()).toBe('');
  });
});

describe('the call sites are actually wired', () => {
  const landing = read('src/pages/LandingV2.tsx');
  const nav = read('src/components/Navigation.tsx');
  const pricing = read('src/components/PricingSection.tsx');
  const contact = read('src/pages/Contact.tsx');

  test('every signup CTA placement fires with its own label', () => {
    for (const [src, placement] of [
      [landing, 'landing_nav'],
      [landing, 'hero'],
      [landing, 'footer_cta'],
      [nav, 'nav'],
      [nav, 'nav_mobile'],
      [pricing, 'pricing_card'],
    ] as const) {
      expect(src, `missing trackSignupCta('${placement}')`).toMatch(
        new RegExp(`trackSignupCta\\('${placement}'`),
      );
    }
  });

  test('the mobile nav link does not count Dashboard clicks as signups', () => {
    expect(nav).toMatch(/if \(!user\) trackSignupCta\('nav_mobile'\)/);
  });

  test('every pricing outcome branch is recorded', () => {
    for (const outcome of ['signup', 'already_free', 'contact_sales', 'no_price', 'checkout']) {
      expect(pricing, `missing outcome '${outcome}'`).toContain(`'${outcome}')`);
    }
  });

  test('the contact form tracks start once and submit only on success', () => {
    expect(contact).toMatch(/onFocusCapture=\{onFormStart\}/);
    expect(contact).toMatch(/if \(formStarted\.current\) return;/);
    // form_submitted must sit in the success path, after the invoke error check
    const submitted = contact.indexOf("trackFormSubmitted('contact')");
    const errorCheck = contact.indexOf('if (error) throw error;');
    expect(submitted).toBeGreaterThan(errorCheck);
    expect(errorCheck).toBeGreaterThan(-1);
  });

  test('no funnel event reuses the sign_up outcome event name', () => {
    // sign_up fires on account creation in Auth; a click event with the same
    // name would double-count the funnel.
    const helper = read('src/lib/conversion-events.ts');
    expect(helper).not.toMatch(/trackEvent\('sign_up'/);
  });
});
