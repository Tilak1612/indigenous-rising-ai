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
  // Same capability, worded differently on the Nations card — escaped the
  // first sweep because it matched on the text, not the capability.
  { label: 'unlimited business entities (Nations)', planText: 'Unlimited business entities', pattern: 'business_entities|multiEntity|entitySwitcher' },
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

describe('live-vs-roadmap labels match the product', () => {
  test('a module is only badged "Live today" if it exists', () => {
    // All four module cards carried a hardcoded "Live today" badge. Growth &
    // Data Tools is not built: nothing tracks revenue, customers or goals, and
    // /dashboard/analytics says "Impact Analytics — Coming Soon".
    const growth = /title: 'Growth & Data Tools',([\s\S]*?)\},/.exec(landing)?.[1] ?? '';
    expect(growth).toMatch(/live: false/);
    for (const t of ['Funding Navigator', 'Business Planning Assistant', 'Training & Certification']) {
      const block = new RegExp(`title: '${t}',([\\s\\S]{0,200})`).exec(landing)?.[1] ?? '';
      expect(block, `${t} has no live flag`).toMatch(/live: true/);
    }
    // the badge must read from the flag, not be hardcoded
    expect(landing).toMatch(/m\.live \? 'Live today' : 'Coming soon'/);
  });

  test('no summary of the product claims growth management while that module is unbuilt', () => {
    // The homepage hero, meta description, og:description and twitter:description
    // all said "…access training, and manage your growth — all in one place"
    // while the Growth & Data Tools card on the same page read "Coming soon".
    const growth = /title: 'Growth & Data Tools',([\s\S]*?)\},/.exec(landing)?.[1] ?? '';
    if (/live: false/.test(growth)) {
      for (const [name, src] of [['landing', landing], ['prerender', read('scripts/prerender.mjs')], ['index.html', read('index.html')]] as const) {
        expect(src, `${name} still promises to manage your growth`).not.toMatch(/manage your growth/i);
      }
    }
  });

  test('page descriptions do not promise more than the page delivers', () => {
    const prerender = read('scripts/prerender.mjs');
    const desc = (route: string) =>
      new RegExp(`\\{ p: '${route.replace(/\//g, '\\/')}', t: '[^']*', d: '([^']*)'`).exec(prerender)?.[1] ?? '';

    // /impact: the page says nothing tracks impact yet. Its description said
    // "Track and report the community impact of your Indigenous business".
    expect(read('src/pages/PublicImpact.tsx')).toMatch(/Nothing in the app tracks/);
    expect(desc('/impact')).toMatch(/^Coming soon/);

    // /success-stories: the gallery says its examples are illustrative. The
    // description called them "Stories from Indigenous entrepreneurs growing
    // their businesses … shared with permission" — real, consented outcomes.
    expect(read('src/components/SuccessGallery.tsx')).toMatch(/illustrative/);
    const stories = desc('/success-stories');
    expect(stories.length).toBeGreaterThan(40);
    expect(stories).toMatch(/illustrative/i);
    expect(stories).not.toMatch(/shared with permission|growing their businesses with/i);
  });

  test('the FAQ no longer says all four modules are live', () => {
    expect(landing).not.toMatch(/All four modules[^']*are live/);
    expect(landing).toMatch(/Three modules are live today/);
  });

  test('revenue, customer and goal tracking really is unbuilt', () => {
    // If this starts failing, the feature shipped — flip live to true and
    // update the module copy and the /impact page.
    expect(implementationExists('business_metrics|revenue_entries|growth_goals|goalTracker')).toBe(false);
  });

  test('the impact page does not promise tracking today', () => {
    const impact = read('src/pages/PublicImpact.tsx');
    expect(impact).toMatch(/coming soon/i);
    expect(impact, 'CTA still promises to start tracking').not.toMatch(/Start Tracking Impact/);
    expect(impact, 'signed-in CTA still lands on the Coming Soon screen')
      .not.toMatch(/to="\/dashboard\/analytics"/);
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
    // In-app too: the matches page told free users an upgrade meant
    // "unlimited matching"; Growth is capped at 50 a month.
    expect(read('src/pages/dashboard/FundingMatches.tsx')).not.toMatch(/unlimited match/i);
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
