import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

/**
 * Every capability advertised as INCLUDED must exist in the product.
 *
 * Four surfaces sold the same unbuilt features: the pricing cards
 * (src/data/plans.ts), the "Compare Plans" table, the homepage FAQ, and the
 * site assistant's corpus — which meant the chatbot told visitors that
 * Professional includes an "IFI Connection Engine (50+ Indigenous Financial
 * Institutions)" and a "Grant Success Predictor". Growth is purchasable at
 * $49/month, so this was billing people against a feature list, not marketing
 * polish.
 *
 * Each entry below was checked against the whole codebase. `pattern` is how an
 * implementation would show up; if one ever appears, this test fails and tells
 * you to flip the flag — the guard works in both directions.
 */
const read = (p: string) => readFileSync(p, 'utf8');
const plans = read('src/data/plans.ts');
const pricing = read('src/components/PricingSection.tsx');
const landing = read('src/pages/LandingV2.tsx');
const assistant = read('supabase/functions/site-assistant/index.ts');

/** Files that only TALK about features (marketing copy, plan data, prompts). */
const COPY_ONLY =
  "':(!)src/data/plans.ts' ':(exclude)src/components/PricingSection.tsx' " +
  "':(exclude)src/pages/LandingV2.tsx' ':(exclude)supabase/functions/site-assistant/*' " +
  "':(exclude)src/data/blogPost*' ':(exclude)*__tests__*' ':(exclude)*.test.*' ':(exclude)src/pages/Careers.tsx'";

const implementationExists = (pattern: string): boolean => {
  try {
    const out = execSync(
      `git grep -lIE ${JSON.stringify(pattern)} -- 'src' 'supabase' ${COPY_ONLY}`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return out.length > 0;
  } catch {
    return false; // git grep exits non-zero when there are no matches
  }
};

const NOT_BUILT: Array<{ label: string; planText: string; pattern: string }> = [
  { label: 'business health score', planText: 'Business health score', pattern: 'healthScore|health_score|businessHealth' },
  { label: 'French interface', planText: 'Interface in English & French', pattern: 'i18next|useTranslation|react-intl' },
  { label: 'grant writing assistant', planText: 'Grant writing assistant', pattern: 'grantWriter|grant_writing|GrantWriting' },
  { label: 'quarterly impact report', planText: 'Quarterly impact report', pattern: 'quarterlyReport|impactReportPdf|impact_report_pdf' },
  { label: 'multi-entity support', planText: 'Multi-entity support', pattern: 'business_entities|multiEntity|entitySwitcher' },
  { label: 'IFI connections', planText: 'Indigenous Financial Institution connections', pattern: 'ifiConnection|ifi_connection|financial_institutions' },
  { label: 'cohort matching', planText: 'Cohort matching', pattern: 'cohortMatch|cohort_matching|cohorts' },
  { label: 'seven-generation canvas', planText: 'Seven-generation planning canvas', pattern: 'sevenGeneration|seven_generation' },
  { label: 'white-label', planText: 'White-label platform', pattern: 'whiteLabel|white_label' },
  { label: 'OCAP governance console', planText: 'OCAP® data governance console', pattern: 'governanceConsole|governance_console' },
  { label: 'government reporting module', planText: 'Government reporting module', pattern: 'governmentReport|isc_report|aandc' },
];

describe('nothing unbuilt is advertised as included', () => {
  for (const item of NOT_BUILT) {
    test(`${item.label}: marked planned, and still unbuilt`, () => {
      // 1. The plan data must mark it planned (renders as "◐ … coming soon").
      const line = plans.split('\n').find((l) => l.includes(item.planText));
      expect(line, `no plan entry mentions "${item.planText}"`).toBeTruthy();
      expect(line, `"${item.label}" is advertised as available`).toContain('available: false');

      // 2. If someone implemented it, this flag is now wrong in the other
      //    direction — say so instead of quietly understating the product.
      expect(
        implementationExists(item.pattern),
        `"${item.label}" looks implemented now (matched /${item.pattern}/) — flip available to true and update the comparison table + assistant corpus`,
      ).toBe(false);
    });
  }

  test('the pricing cards distinguish planned features from included ones', () => {
    // These cards rendered <Check> for every feature regardless of the flag —
    // a check mark beside the Buy button for capabilities still in build.
    const block = /plan\.features\.map\(\(feature, idx\) => \(([\s\S]*?)\)\)\}/.exec(pricing)?.[1] ?? '';
    expect(block.length).toBeGreaterThan(50);
    expect(block, 'cards ignore feature.available').toMatch(/feature\.available \?/);
    expect(block, 'planned state is not stated in text').toMatch(/coming soon/);
  });

  test('the comparison table shows no check mark for a planned capability', () => {
    for (const feature of ['Interface in English & French', 'Grant writing assistant', 'Multi-entity support',
      'Indigenous Financial Institution connections', 'OCAP® governance console', 'White-label platform']) {
      const row = new RegExp(`\\{ feature: '${feature.replace(/[()®&]/g, (c) => '\\' + c)}'([^}]*)\\}`).exec(pricing)?.[1];
      expect(row, `no comparison row for "${feature}"`).toBeTruthy();
      expect(row, `"${feature}" still shows a check mark`).not.toMatch(/'✓'/);
    }
  });
});

describe('claims the product must never make', () => {
  test('nothing predicts grant success', () => {
    // A feature named for predicting grant success implies approval odds.
    // Removed outright rather than relabelled.
    for (const [name, src] of [['plans', plans], ['pricing', pricing], ['landing', landing], ['assistant', assistant]] as const) {
      expect(src, `${name} promises to predict grant success`).not.toMatch(/success predictor|predict.{0,20}(approval|success rate)/i);
    }
  });

  test('no SMS alerts are promised — there is no SMS integration', () => {
    expect(implementationExists('twilio|messagebird|sendSms|sms_send')).toBe(false);
    // Scoped to the advertised feature strings — the files explain in comments
    // why SMS was removed, which is not a promise.
    const planFeatures = [...plans.matchAll(/\{ text: ['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const f of planFeatures) expect(f, 'a plan feature promises SMS').not.toMatch(/\bSMS\b/);
    const corpus = /const PLANS_TEXT = \[([\s\S]*?)\]\.join/.exec(assistant)?.[1] ?? '';
    expect(corpus.length).toBeGreaterThan(100);
    expect(corpus, 'the assistant corpus promises SMS').not.toMatch(/\bSMS\b/);
  });

  test('unlimited matching is not promised to Growth on any surface', () => {
    expect(assistant).not.toMatch(/unlimited AI funding|unlimited matching/i);
    expect(landing).not.toMatch(/unlimited AI funding matches/i);
  });

  test('the homepage FAQ does not name unbuilt features as paid inclusions', () => {
    const faq = /What do I get when I sign up\?', a: '([^']*)'/.exec(landing)?.[1] ?? '';
    expect(faq.length).toBeGreaterThan(50);
    for (const claim of ['IFI Connection Engine', 'grant writing assistant', 'unlimited']) {
      expect(faq, `FAQ still sells "${claim}"`).not.toContain(claim);
    }
  });

  test('certificates are labelled the same way everywhere', () => {
    // The homepage calls issued certificates roadmap; /training said you could
    // earn them today.
    expect(read('src/pages/Training.tsx')).toMatch(/coming soon/i);
    expect(landing).toMatch(/roadmap.{0,80}certificates of completion/is);
  });

  test('the assistant corpus names the planned set explicitly', () => {
    expect(assistant).toMatch(/PLANNED, NOT AVAILABLE TODAY/);
    // and states the real quota rather than "unlimited"
    expect(assistant).toMatch(/50 matches per month|50 per month/);
  });

  test('Professional is described accurately — it IS purchasable', () => {
    // Both Stripe price IDs are wired (STRIPE_PRICES) and docs/STRIPE_GO_LIVE.md
    // lists them, so nothing may call it a waitlist. A stale comment in
    // StructuredData.tsx did, which had understated the schema price range.
    expect(pricing).toMatch(/Bimaadiziwin: \{[\s\S]*?monthly: 'price_/);
    expect(assistant, 'assistant calls Professional a waitlist').not.toMatch(/waitlist/i);
    expect(read('src/components/StructuredData.tsx')).not.toMatch(/waitlisted \(not yet buyable\)/);
  });
});
