import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Roadmap #2 Stage 2: hybrid rules + LLM funding matcher.
// See docs/SPEC_ai_funding_matching.md for full feature spec.
//
// Flow:
//   1. Auth → user_id from JWT
//   2. Profile fetch (required: territory, industry, business_stage)
//   3. Tier check (free / growth / pro / enterprise)
//   4. Monthly quota check (free: 3, growth: 50, pro+: unlimited)
//   5. Per-minute rate limit (3/min all tiers)
//   6. Profile hash for cache key
//   7. Rules-based shortlist from grants table (SQL)
//   8. Cache lookup per candidate
//   9. LLM call for cache misses (GPT-4o-mini, JSON mode, max 200 tokens)
//  10. Cache write with 24h TTL
//  11. Log run in funding_match_runs with token + cache telemetry
//  12. Sort by fit_score, truncate per tier (free: top 5, paid: top 20)
//  13. Tier-aware response (free omits fit_score + explanation)

const ALLOWED_ORIGINS = [
  'https://www.indigenousrising.ai',
  'https://indigenousrising.ai',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.indigenousrising.ai';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface Profile {
  id: string;
  territory: string | null;
  industry: string | null;
  business_stage: string | null;
  business_name: string | null;
  business_description: string | null;
  bio: string | null;
  employees: string | null;
  target_funding_amount: number | null;
  funding_purpose: string | null;
  indigenous_identity: string | null;
  indigenous_ownership_pct: number | null;
  entity_type: string | null;
  year_founded: string | null;
}

interface Grant {
  id: string;
  name: string;
  funder: string;
  description: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  is_recurring: boolean;
  recurrence_notes: string | null;
  provinces: string[];
  industries: string[];
  business_stages: string[];
  eligibility_notes: string | null;
  application_url: string;
  funding_type: string;
  is_repayable: boolean | null;
  identity_criteria: string[] | null;
  ownership_min_pct: number | null;
  verification_status: string;
  updated_at: string;
  // Directory columns (migration 20261026000001).
  slug: string;
  source_url: string | null;
  apply_url: string | null;
  apply_link_type: string;
  applicant_types: string[] | null;
  intake_status: string;
  entrepreneur_age_min: number | null;
  entrepreneur_age_max: number | null;
  business_age_max_months: number | null;
  documents_required: string[] | null;
}

// The five states the brief asks for. Computed from the rules-based criteria
// and the intake status, never from the model; the model only adds a fit
// sentence to a potential match.
type MatchState = 'potential_match' | 'needs_more_information' | 'likely_ineligible' | 'closed' | 'not_yet_open';

interface LlmVerdict {
  eligibility: 'yes' | 'no' | 'maybe';
  fit_score: number;
  explanation: string;
}

interface MatchResponse {
  grant_id: string;
  name: string;
  funder: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  is_recurring: boolean;
  application_url: string;
  // Whether the money must be paid back. 11 of 17 catalogue records are
  // repayable financing, so this must reach the card — see migration
  // 20260825000002.
  funding_type: string;
  is_repayable: boolean | null;
  // Deterministic, rules-based criteria. Free on every tier — this is the
  // honest core of the page and must never sit behind a paywall.
  criteria: Criterion[];
  // 'needs_review' means an automated check found the funder link dead or
  // unreachable. The programme is still real — we surface it with a warning
  // rather than silently sending someone to a 404.
  verification_status: string;
  eligibility: 'yes' | 'no' | 'maybe';
  fit_score?: number;
  explanation?: string;
  // Directory fields: the canonical page, the most specific official link
  // (typed so the UI never labels a homepage "Apply"), intake and documents.
  slug: string;
  source_url: string | null;
  apply_url: string | null;
  apply_link_type: string;
  intake_status: string;
  state: MatchState;
  next_step: string;
  not_assessed: string[];
  documents_required: string[];
}

const PROVINCE_NAME_TO_CODE: Record<string, string> = {
  'Alberta': 'AB',
  'British Columbia': 'BC',
  'Manitoba': 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Nova Scotia': 'NS',
  'Northwest Territories': 'NT',
  'Nunavut': 'NU',
  'Ontario': 'ON',
  'Prince Edward Island': 'PE',
  'Quebec': 'QC',
  'Saskatchewan': 'SK',
  'Yukon': 'YT',
};

function territoryToCode(territory: string | null): string | null {
  if (!territory) return null;
  if (territory.length === 2) return territory.toUpperCase();
  return PROVINCE_NAME_TO_CODE[territory] ?? null;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function computeProfileHash(profile: Profile): Promise<string> {
  const relevant = JSON.stringify({
    territory: profile.territory,
    industry: profile.industry,
    business_stage: profile.business_stage,
    employees: profile.employees,
    target_funding_amount: profile.target_funding_amount,
    funding_purpose: profile.funding_purpose,
    indigenous_identity: profile.indigenous_identity,
    indigenous_ownership_pct: profile.indigenous_ownership_pct,
    entity_type: profile.entity_type,
  });
  return sha256(relevant);
}

type Tier = 'free' | 'growth' | 'pro' | 'enterprise';

// Canonical price id -> tier. These are the same four price ids create-checkout
// resolves plan+cycle to (env-overridable, identical fallbacks), so the tier a
// customer receives always matches the price they actually bought — regardless
// of billing cycle (a plan's monthly and annual price map to the same tier).
const PRICE_TIER: Record<string, Tier> = {
  [Deno.env.get('STRIPE_GROWTH_MONTHLY_PRICE_ID') ?? 'price_1TieC4AVTgSOk7kNi0635mvd']: 'growth',
  [Deno.env.get('STRIPE_GROWTH_ANNUAL_PRICE_ID') ?? 'price_1Ti443AVTgSOk7kNewKcPh6Q']: 'growth',
  [Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') ?? 'price_1Ti47xAVTgSOk7kNvfZdLbr8']: 'pro',
  [Deno.env.get('STRIPE_PRO_ANNUAL_PRICE_ID') ?? 'price_1Ti49bAVTgSOk7kNjT1wTOIp']: 'pro',
};

// Prefer the price id (exact, checkout-controlled). productId is a fallback for
// legacy rows written before stripe_price_id existed and for demo accounts,
// whose synthetic product ids DO contain these keywords by design.
function deriveTier(subscribed: boolean, priceId: string | null, productId: string | null): Tier {
  if (!subscribed) return 'free';
  if (priceId && PRICE_TIER[priceId]) return PRICE_TIER[priceId];
  const pid = (productId || '').toLowerCase();
  if (pid.includes('enterprise') || pid.includes('gimishoomis')) return 'enterprise';
  if (pid.includes('professional') || pid.includes('bimaadiziwin') || pid.includes('149')) return 'pro';
  return 'growth';
}

const QUOTA_BY_TIER: Record<Tier, number | null> = {
  free: 3,
  growth: 50,
  pro: null,
  enterprise: null,
};

const TOP_N_BY_TIER: Record<Tier, number> = {
  free: 5,
  growth: 20,
  pro: 20,
  enterprise: 20,
};

// A single eligibility criterion, evaluated in CODE — never by the model.
// Anything that could change whether a person applies for money is computed by
// rules that can be audited and explained, not generated.
interface Criterion {
  label: string;
  status: 'met' | 'unmet' | 'unknown';
}

const IDENTITY_LABEL: Record<string, string> = {
  first_nations: 'First Nations',
  metis: 'Métis',
  inuit: 'Inuit',
};

const APPLICANT_LABEL: Record<string, string> = {
  individual: 'individual entrepreneur', business: 'business', community_business: 'community-owned business',
  community: 'Nation or community', organization: 'Indigenous organization', nonprofit: 'not-for-profit',
  institution: 'learning institution',
};

/** Which applicant_types values a profile's entity_type can satisfy; null when unknown. */
function applicantKindsFor(entityType: string | null): string[] | null {
  switch (entityType) {
    case 'sole_proprietorship': return ['individual', 'business'];
    case 'partnership':
    case 'corporation':
    case 'co_operative': return ['business', 'individual'];
    case 'nation_owned':
    case 'development_corporation': return ['community_business', 'community', 'organization'];
    case 'non_profit': return ['nonprofit', 'organization'];
    default: return null;
  }
}

function monthsOperating(yearFounded: string | null): number | null {
  if (!yearFounded) return null;
  const y = Number.parseInt(yearFounded, 10);
  if (!Number.isFinite(y) || y < 1900 || y > new Date().getUTCFullYear()) return null;
  const now = new Date();
  // Only the year is stored, so count from 1 July of that year: the midpoint
  // keeps the error under six months either way.
  return Math.max(0, (now.getUTCFullYear() - y) * 12 + (now.getUTCMonth() + 1) - 7);
}

function deriveState(grant: Grant, criteria: Criterion[], today: string): MatchState {
  if (grant.intake_status === 'closed' || (grant.deadline && grant.deadline < today)) return 'closed';
  if (grant.intake_status === 'not_yet_open') return 'not_yet_open';
  if (criteria.some((c) => c.status === 'unmet')) return 'likely_ineligible';
  if (criteria.some((c) => c.status === 'unknown')) return 'needs_more_information';
  return 'potential_match';
}

const STATE_ORDER: Record<MatchState, number> = { potential_match: 0, needs_more_information: 1, not_yet_open: 2, likely_ineligible: 3, closed: 4 };

function nextStepFor(state: MatchState, grant: Grant, criteria: Criterion[]): string {
  const unknown = criteria.filter((c) => c.status === 'unknown').map((c) => c.label);
  switch (state) {
    case 'potential_match':
      return grant.apply_link_type === 'directory'
        ? 'Contact the Indigenous Financial Institution serving your region; it takes the application.'
        : grant.apply_link_type === 'contact'
          ? 'Contact the funder to confirm current terms and request an application.'
          : 'Read the official programme page, confirm the current terms, then save this programme to start a readiness checklist.';
    case 'needs_more_information':
      return `Add the missing details to your profile so these can be assessed: ${unknown.join('; ')}.`;
    case 'likely_ineligible':
      return 'One or more stated criteria are not met. Only the funder decides eligibility; confirm with them if you think your situation differs.';
    case 'not_yet_open':
      return 'This intake has not opened yet. Save the programme to be told when it does.';
    case 'closed':
      return 'This intake is closed. Save the programme to be told when it reopens.';
  }
}

function labelIdentities(keys: string[]): string {
  return keys.map((k) => IDENTITY_LABEL[k] ?? k).join(', ');
}

// Returns one Criterion per dimension the record actually states. A dimension
// the grant does not restrict is omitted entirely (there is nothing to meet).
// A dimension the grant restricts but the profile has not supplied is
// 'unknown' — surfaced as "not assessed", never silently treated as a pass.
function evaluateCriteria(profile: Profile, grant: Grant): Criterion[] {
  const out: Criterion[] = [];

  // Province / territory
  if (grant.provinces && grant.provinces.length > 0 && grant.provinces.length < 13) {
    const code = territoryToCode(profile.territory);
    out.push({
      label: `Operating in ${grant.provinces.join(', ')}`,
      status: !code ? 'unknown' : grant.provinces.includes(code) ? 'met' : 'unmet',
    });
  }

  // Industry
  if (grant.industries && grant.industries.length > 0) {
    out.push({
      label: `Sector: ${grant.industries.join(', ')}`,
      status: !profile.industry
        ? 'unknown'
        : grant.industries.includes(profile.industry) ? 'met' : 'unmet',
    });
  }

  // Business stage
  if (grant.business_stages && grant.business_stages.length > 0 && grant.business_stages.length < 5) {
    out.push({
      label: `Business stage: ${grant.business_stages.join(', ')}`,
      status: !profile.business_stage
        ? 'unknown'
        : grant.business_stages.includes(profile.business_stage) ? 'met' : 'unmet',
    });
  }

  // Identity. 'prefer_not_to_say' is deliberately treated as 'unknown', never
  // 'unmet' — declining to state identity must never read as a rejection.
  if (grant.identity_criteria && grant.identity_criteria.length > 0) {
    const declared = profile.indigenous_identity;
    let status: Criterion['status'];
    if (!declared || declared === 'prefer_not_to_say') {
      status = 'unknown';
    } else if (declared === 'multiple') {
      // More than one identity — we don't know which, so we can't rule it out.
      status = 'unknown';
    } else {
      status = grant.identity_criteria.includes(declared) ? 'met' : 'unmet';
    }
    out.push({ label: `Open to ${labelIdentities(grant.identity_criteria)}`, status });
  }

  // Applicant type. A programme that only funds Nations, community-owned
  // businesses or organisations must never read as a match for a sole
  // proprietor; the entity type on the profile decides which side of that
  // line the user is on. Entity types that are ambiguous stay 'unknown'.
  if (grant.applicant_types && grant.applicant_types.length > 0) {
    const kinds = applicantKindsFor(profile.entity_type);
    out.push({
      label: `Applicant type: ${grant.applicant_types.map((a) => APPLICANT_LABEL[a] ?? a).join(', ')}`,
      status: !kinds ? 'unknown' : kinds.some((k) => grant.applicant_types!.includes(k)) ? 'met' : 'unmet',
    });
  }

  // Business age (months operating), from the profile's year founded.
  if (grant.business_age_max_months !== null && grant.business_age_max_months !== undefined) {
    const months = monthsOperating(profile.year_founded);
    out.push({
      label: `Business operating ${grant.business_age_max_months} months or less`,
      status: months === null ? 'unknown' : months <= grant.business_age_max_months ? 'met' : 'unmet',
    });
  }

  // Entrepreneur age. The profile does not hold a date of birth (and should
  // not need to), so this is always surfaced as "not assessed".
  if (grant.entrepreneur_age_min != null || grant.entrepreneur_age_max != null) {
    const range = grant.entrepreneur_age_min != null && grant.entrepreneur_age_max != null
      ? `${grant.entrepreneur_age_min} to ${grant.entrepreneur_age_max}`
      : grant.entrepreneur_age_min != null ? `${grant.entrepreneur_age_min} or older` : `up to ${grant.entrepreneur_age_max}`;
    out.push({ label: `Entrepreneur aged ${range}`, status: 'unknown' });
  }

  // Ownership threshold
  if (grant.ownership_min_pct !== null && grant.ownership_min_pct !== undefined) {
    const pct = profile.indigenous_ownership_pct;
    out.push({
      label: `At least ${grant.ownership_min_pct}% Indigenous ownership`,
      status: pct === null || pct === undefined
        ? 'unknown'
        : pct >= grant.ownership_min_pct ? 'met' : 'unmet',
    });
  }

  return out;
}

async function callOpenAi(
  apiKey: string,
  profile: Profile,
  grant: Grant,
): Promise<{ verdict: LlmVerdict; inputTokens: number; outputTokens: number } | null> {
  // What is sent to the model. community_name and nation are DELIBERATELY
  // ABSENT and must never be added: a community's name is its own, and it does
  // not go to a third-party model. Identity is sent only as the coarse
  // self-declared category (and omitted entirely for prefer_not_to_say), which
  // is what program criteria are written against.
  // EXACTLY what /privacy discloses for this feature: "territory, industry,
  // business stage, description, and funding purpose", plus the target amount
  // the same sentence's feature depends on. Nothing else leaves the country
  // for this call.
  //
  // Removed 2026-09-20 after an audit compared this payload with the policy:
  // business_name, bio, employees, entity_type, indigenous_ownership_pct and
  // self_declared_identity were all being sent and none was disclosed. The
  // last two are the identity of an Indigenous person or business going to a
  // US processor — on a platform built around OCAP®.
  //
  // Nothing is lost. Identity and ownership decide ELIGIBILITY, and that is
  // computed here in evaluateCriteria() by auditable rules; the model only
  // writes a fit score and a sentence of explanation, which these five fields
  // support on their own. community_name and nation were already excluded and
  // remain so.
  const profileSummary = {
    territory: profile.territory,
    industry: profile.industry,
    business_stage: profile.business_stage,
    description: profile.business_description,
    funding_purpose: profile.funding_purpose,
    target_funding_amount_cad: profile.target_funding_amount,
  };

  const grantSummary = {
    name: grant.name,
    funder: grant.funder,
    description: grant.description,
    amount_range_cad: { min: grant.amount_min, max: grant.amount_max },
    deadline: grant.deadline,
    is_recurring: grant.is_recurring,
    eligible_provinces: grant.provinces,
    eligible_industries: grant.industries.length > 0 ? grant.industries : 'any',
    eligible_business_stages: grant.business_stages.length > 0 ? grant.business_stages : 'any',
    eligibility_notes: grant.eligibility_notes,
  };

  const systemPrompt = 'You are an expert on Indigenous business funding programs in Canada. Given an entrepreneur profile and a grant program, assess eligibility and fit. Be honest — if the profile clearly does not fit, say "no". If it fits well, say "yes". If unclear or partial fit, say "maybe". Return valid JSON only with keys: eligibility (yes/no/maybe), fit_score (0-100 integer), explanation (1-2 plain English sentences, max 200 characters). Never hallucinate eligibility criteria — only use what is provided.';

  const userPrompt = `PROFILE:\n${JSON.stringify(profileSummary, null, 2)}\n\nGRANT:\n${JSON.stringify(grantSummary, null, 2)}\n\nReturn JSON only.`;

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 200,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    console.error('[MATCH-OPENAI] fetch threw:', msg);
    return null;
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error('[MATCH-OPENAI] non-2xx response:', response.status, errText.substring(0, 500));
    return null;
  }

  let body: { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  try {
    body = await response.json();
  } catch (parseErr) {
    console.error('[MATCH-OPENAI] response JSON parse failed:', parseErr);
    return null;
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    console.error('[MATCH-OPENAI] no content in response');
    return null;
  }

  let parsed: { eligibility?: string; fit_score?: number; explanation?: string };
  try {
    parsed = JSON.parse(content);
  } catch (parseErr) {
    console.error('[MATCH-OPENAI] content JSON parse failed:', parseErr);
    return null;
  }

  const eligibility = ['yes', 'no', 'maybe'].includes(parsed.eligibility ?? '') ? parsed.eligibility! : 'maybe';
  const fitScore = Math.max(0, Math.min(100, Math.round(Number(parsed.fit_score) || 0)));
  const explanation = String(parsed.explanation || '').slice(0, 220);

  return {
    verdict: { eligibility: eligibility as 'yes' | 'no' | 'maybe', fit_score: fitScore, explanation },
    inputTokens: body?.usage?.prompt_tokens ?? 0,
    outputTokens: body?.usage?.completion_tokens ?? 0,
  };
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid session', detail: userErr?.message ?? 'no user' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id, territory, industry, business_stage, business_name, business_description, bio, employees, target_funding_amount, funding_purpose, indigenous_identity, indigenous_ownership_pct, entity_type, year_founded')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found. Complete your profile to find matches.' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const missing: string[] = [];
    if (!profile.territory) missing.push('territory');
    if (!profile.industry) missing.push('industry');
    if (!profile.business_stage) missing.push('business_stage');
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Complete your profile to find matches', missing_fields: missing }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const { data: subscription } = await admin
      .from('subscriptions')
      .select('status, stripe_price_id, stripe_product_id')
      .eq('user_id', userId)
      .maybeSingle();

    const isActiveSub = subscription?.status === 'active' || subscription?.status === 'trialing';
    const tier = deriveTier(
      !!isActiveSub,
      subscription?.stripe_price_id ?? null,
      subscription?.stripe_product_id ?? null,
    );
    const quota = QUOTA_BY_TIER[tier];
    const topN = TOP_N_BY_TIER[tier];

    if (quota !== null) {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count: monthlyUsage } = await admin
        .from('funding_match_runs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('run_at', monthStart.toISOString());

      if ((monthlyUsage ?? 0) >= quota) {
        return new Response(
          JSON.stringify({
            error: tier === 'free' ? `You have used your ${quota} free matches this month. Upgrade to Ogichidaakwe for more.` : `You have reached your monthly match limit of ${quota}.`,
            quota_exceeded: true,
            upgrade_url: '/pricing',
            tier,
          }),
          { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount } = await admin
      .from('funding_match_runs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('run_at', oneMinuteAgo);

    if ((recentCount ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: 'Slow down — 3 matches per minute max', rate_limited: true }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const profileHash = await computeProfileHash(profile as Profile);
    const territoryCode = territoryToCode(profile.territory);
    const today = new Date().toISOString().split('T')[0];

    let shortlistQuery = admin
      .from('grants')
      .select('*')
      .eq('is_published', true)
      .neq('intake_status', 'closed')
      .or(`deadline.gte.${today},is_recurring.eq.true,deadline.is.null`);

    if (territoryCode) {
      shortlistQuery = shortlistQuery.contains('provinces', [territoryCode]);
    }

    const { data: rawShortlist, error: shortlistErr } = await shortlistQuery
      .order('deadline', { ascending: true, nullsFirst: false })
      .limit(30);

    if (shortlistErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch grants' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const shortlist = (rawShortlist || []).filter((g: Grant) => {
      if (g.industries.length > 0 && profile.industry && !g.industries.includes(profile.industry)) return false;
      if (g.business_stages.length > 0 && profile.business_stage && !g.business_stages.includes(profile.business_stage)) return false;
      if (profile.target_funding_amount != null && g.amount_min != null && profile.target_funding_amount < g.amount_min) return false;
      return true;
    }).slice(0, 20);

    if (shortlist.length === 0) {
      await admin.from('funding_match_runs').insert({
        user_id: userId,
        grant_count: 0,
        llm_input_tokens: 0,
        llm_output_tokens: 0,
        cache_hits: 0,
        source: 'user',
      });
      return new Response(
        JSON.stringify({
          matches: [],
          tier,
          matches_remaining_this_month: quota !== null ? quota - 1 : null,
          message: 'No grants match your current profile. Try broadening your industry or stage.',
        }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const grantIds = shortlist.map((g: Grant) => g.id);
    const { data: cacheRows } = await admin
      .from('funding_match_cache')
      .select('grant_id, profile_hash, grant_updated_at, eligibility, fit_score, explanation, expires_at')
      .eq('user_id', userId)
      .in('grant_id', grantIds)
      .eq('profile_hash', profileHash);

    const nowMs = Date.now();
    const cacheByGrant = new Map<string, { eligibility: 'yes' | 'no' | 'maybe'; fit_score: number; explanation: string }>();
    for (const row of cacheRows || []) {
      const expired = new Date(row.expires_at).getTime() < nowMs;
      const grant = shortlist.find((g: Grant) => g.id === row.grant_id);
      if (!grant) continue;
      const grantFresh = new Date(row.grant_updated_at).getTime() === new Date(grant.updated_at).getTime();
      if (!expired && grantFresh) {
        cacheByGrant.set(row.grant_id, { eligibility: row.eligibility, fit_score: row.fit_score, explanation: row.explanation });
      }
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    const llmResults = new Map<string, LlmVerdict>();
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let llmFailureCount = 0;

    const missingGrants = shortlist.filter((g: Grant) => !cacheByGrant.has(g.id));

    if (missingGrants.length > 0 && !openAiKey) {
      console.warn('[MATCH] OPENAI_API_KEY not set — returning rules shortlist with fallback verdicts');
      for (const g of missingGrants) {
        llmResults.set(g.id, {
          eligibility: 'maybe',
          fit_score: 50,
          explanation: 'AI scoring is temporarily unavailable. This grant matched your profile on rules alone.',
        });
      }
      llmFailureCount = missingGrants.length;
    } else if (missingGrants.length > 0 && openAiKey) {
      for (const g of missingGrants) {
        const result = await callOpenAi(openAiKey, profile as Profile, g);
        if (result) {
          llmResults.set(g.id, result.verdict);
          totalInputTokens += result.inputTokens;
          totalOutputTokens += result.outputTokens;
        } else {
          llmResults.set(g.id, {
            eligibility: 'maybe',
            fit_score: 50,
            explanation: 'AI scoring was unavailable for this grant. It matched your profile on rules alone.',
          });
          llmFailureCount += 1;
        }
      }
    }

    const cacheInserts = Array.from(llmResults.entries())
      .filter(([, v]) => v.explanation !== 'AI scoring is temporarily unavailable. This grant matched your profile on rules alone.' && v.explanation !== 'AI scoring was unavailable for this grant. It matched your profile on rules alone.')
      .map(([grantId, verdict]) => {
        const grant = shortlist.find((g: Grant) => g.id === grantId)!;
        return {
          user_id: userId,
          grant_id: grantId,
          profile_hash: profileHash,
          grant_updated_at: grant.updated_at,
          eligibility: verdict.eligibility,
          fit_score: verdict.fit_score,
          explanation: verdict.explanation,
        };
      });

    if (cacheInserts.length > 0) {
      await admin.from('funding_match_cache').upsert(cacheInserts, { onConflict: 'user_id,grant_id,profile_hash' });
    }

    await admin.from('funding_match_runs').insert({
      user_id: userId,
      grant_count: shortlist.length,
      llm_input_tokens: totalInputTokens,
      llm_output_tokens: totalOutputTokens,
      cache_hits: cacheByGrant.size,
      source: 'user',
    });

    const scored = shortlist.map((g: Grant) => {
      const fromCache = cacheByGrant.get(g.id);
      const fromLlm = llmResults.get(g.id);
      const verdict = fromCache ?? fromLlm ?? { eligibility: 'maybe' as const, fit_score: 50, explanation: 'Matched on profile alone.' };
      return { grant: g, verdict };
    });

    // Rules first, model second: a potential match always outranks a record
    // the rules say the user does not qualify for, whatever the fit score.
    const withState = scored.map((s) => {
      const criteria = evaluateCriteria(profile, s.grant);
      const state = deriveState(s.grant, criteria, today);
      return { ...s, criteria, state };
    });
    withState.sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state] || b.verdict.fit_score - a.verdict.fit_score);
    const top = withState.slice(0, topN);

    const matches: MatchResponse[] = top.map(({ grant, verdict, criteria, state }) => {
      const base: MatchResponse = {
        grant_id: grant.id,
        name: grant.name,
        funder: grant.funder,
        amount_min: grant.amount_min,
        amount_max: grant.amount_max,
        amount_currency: grant.amount_currency,
        deadline: grant.deadline,
        is_recurring: grant.is_recurring,
        application_url: grant.application_url,
        funding_type: grant.funding_type,
        is_repayable: grant.is_repayable,
        criteria,
        verification_status: grant.verification_status,
        eligibility: state === 'likely_ineligible' ? 'no' : state === 'potential_match' ? verdict.eligibility : 'maybe',
        slug: grant.slug,
        source_url: grant.source_url,
        apply_url: grant.apply_url,
        apply_link_type: grant.apply_link_type,
        intake_status: grant.intake_status,
        state,
        next_step: nextStepFor(state, grant, criteria),
        not_assessed: criteria.filter((c) => c.status === 'unknown').map((c) => c.label),
        documents_required: grant.documents_required ?? [],
      };
      if (tier !== 'free') {
        base.fit_score = verdict.fit_score;
        base.explanation = verdict.explanation;
      }
      return base;
    });

    let remaining: number | null = null;
    if (quota !== null) {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count } = await admin
        .from('funding_match_runs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('run_at', monthStart.toISOString());
      remaining = Math.max(0, quota - (count ?? 0));
    }

    return new Response(
      JSON.stringify({
        matches,
        tier,
        matches_remaining_this_month: remaining,
        cache_hits: cacheByGrant.size,
        llm_failures: llmFailureCount,
      }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[MATCH] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to compute matches. Please try again.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});