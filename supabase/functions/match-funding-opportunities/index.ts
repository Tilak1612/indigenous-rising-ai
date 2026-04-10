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
  updated_at: string;
}

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
  eligibility: 'yes' | 'no' | 'maybe';
  fit_score?: number;
  explanation?: string;
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
  // Only the fields that affect matching
  const relevant = JSON.stringify({
    territory: profile.territory,
    industry: profile.industry,
    business_stage: profile.business_stage,
    employees: profile.employees,
    target_funding_amount: profile.target_funding_amount,
    funding_purpose: profile.funding_purpose,
  });
  return sha256(relevant);
}

type Tier = 'free' | 'growth' | 'pro' | 'enterprise';

function deriveTier(subscribed: boolean, productId: string | null): Tier {
  if (!subscribed) return 'free';
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

async function callOpenAi(
  apiKey: string,
  profile: Profile,
  grant: Grant,
): Promise<{ verdict: LlmVerdict; inputTokens: number; outputTokens: number } | null> {
  const profileSummary = {
    territory: profile.territory,
    industry: profile.industry,
    business_stage: profile.business_stage,
    business_name: profile.business_name,
    description: profile.business_description,
    bio: profile.bio,
    employees: profile.employees,
    target_funding_amount_cad: profile.target_funding_amount,
    funding_purpose: profile.funding_purpose,
  };

  const grantSummary = {
    name: grant.name,
    funder: grant.funder,
    description: grant.description,
    amount_range_cad: {
      min: grant.amount_min,
      max: grant.amount_max,
    },
    deadline: grant.deadline,
    is_recurring: grant.is_recurring,
    eligible_provinces: grant.provinces,
    eligible_industries: grant.industries.length > 0 ? grant.industries : 'any',
    eligible_business_stages: grant.business_stages.length > 0 ? grant.business_stages : 'any',
    eligibility_notes: grant.eligibility_notes,
  };

  const systemPrompt = 'You are an expert on Indigenous business funding programs in Canada. Given an entrepreneur profile and a grant program, assess eligibility and fit. Be honest — if the profile clearly does not fit, say "no". If it fits well, say "yes". If unclear or partial fit, say "maybe". Return valid JSON only with keys: eligibility (yes/no/maybe), fit_score (0-100 integer), explanation (1-2 plain English sentences, max 200 characters). Never hallucinate eligibility criteria — only use what is provided.';

  const userPrompt = `PROFILE:\n${JSON.stringify(profileSummary, null, 2)}\n\nGRANT:\n${JSON.stringify(grantSummary, null, 2)}\n\nReturn JSON only.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
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

    if (!response.ok) {
      const errText = await response.text();
      console.error('[MATCH] OpenAI error:', response.status, errText);
      return null;
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const eligibility = ['yes', 'no', 'maybe'].includes(parsed.eligibility) ? parsed.eligibility : 'maybe';
    const fitScore = Math.max(0, Math.min(100, Math.round(Number(parsed.fit_score) || 0)));
    const explanation = String(parsed.explanation || '').slice(0, 220);

    return {
      verdict: {
        eligibility: eligibility as 'yes' | 'no' | 'maybe',
        fit_score: fitScore,
        explanation,
      },
      inputTokens: body?.usage?.prompt_tokens ?? 0,
      outputTokens: body?.usage?.completion_tokens ?? 0,
    };
  } catch (err) {
    console.error('[MATCH] OpenAI fetch threw:', err);
    return null;
  }
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    // 1. Auth — require user JWT
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

    // Verify the JWT using the anon-key client (standard supabase pattern)
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    const userId = userData.user.id;

    // Admin client for DB writes
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 2. Profile fetch
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id, territory, industry, business_stage, business_name, business_description, bio, employees, target_funding_amount, funding_purpose')
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
        JSON.stringify({
          error: 'Complete your profile to find matches',
          missing_fields: missing,
        }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Tier check
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('status, stripe_product_id')
      .eq('user_id', userId)
      .maybeSingle();

    const isActiveSub = subscription?.status === 'active' || subscription?.status === 'trialing';
    const tier = deriveTier(!!isActiveSub, subscription?.stripe_product_id ?? null);
    const quota = QUOTA_BY_TIER[tier];
    const topN = TOP_N_BY_TIER[tier];

    // 4. Monthly quota check
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
            error: tier === 'free'
              ? `You have used your ${quota} free matches this month. Upgrade to Ogichidaakwe for more.`
              : `You have reached your monthly match limit of ${quota}.`,
            quota_exceeded: true,
            upgrade_url: '/pricing',
            tier,
          }),
          { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Per-minute rate limit (3/min, all tiers)
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

    // 6. Profile hash
    const profileHash = await computeProfileHash(profile as Profile);

    // 7. Rules-based shortlist
    const territoryCode = territoryToCode(profile.territory);
    const today = new Date().toISOString().split('T')[0];

    let shortlistQuery = admin
      .from('grants')
      .select('*')
      .eq('is_published', true)
      .or(`deadline.gte.${today},is_recurring.eq.true,deadline.is.null`);

    if (territoryCode) {
      shortlistQuery = shortlistQuery.contains('provinces', [territoryCode]);
    }

    const { data: rawShortlist, error: shortlistErr } = await shortlistQuery
      .order('deadline', { ascending: true, nullsFirst: false })
      .limit(30);

    if (shortlistErr) {
      console.error('[MATCH] Shortlist query error:', shortlistErr);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch grants' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Additional filters in JS: industry overlap, business_stage overlap, amount fit
    const shortlist = (rawShortlist || []).filter((g: Grant) => {
      // Industry: grant with no industries matches everyone; otherwise must contain user's industry
      if (g.industries.length > 0 && profile.industry && !g.industries.includes(profile.industry)) {
        return false;
      }
      // Business stage: same semantics
      if (g.business_stages.length > 0 && profile.business_stage && !g.business_stages.includes(profile.business_stage)) {
        return false;
      }
      // Amount: if user specified a target and grant has an explicit minimum, target must be >= min
      if (
        profile.target_funding_amount != null &&
        g.amount_min != null &&
        profile.target_funding_amount < g.amount_min
      ) {
        return false;
      }
      return true;
    }).slice(0, 20);

    if (shortlist.length === 0) {
      // Log the empty run (counts toward quota — intentional, matches user intent)
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

    // 8. Cache lookup
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
        cacheByGrant.set(row.grant_id, {
          eligibility: row.eligibility,
          fit_score: row.fit_score,
          explanation: row.explanation,
        });
      }
    }

    // 9. LLM call for cache misses
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const llmResults = new Map<string, LlmVerdict>();
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let llmFailureCount = 0;

    const missingGrants = shortlist.filter((g: Grant) => !cacheByGrant.has(g.id));

    if (missingGrants.length > 0 && !openAiKey) {
      // No API key — degrade gracefully. Return rules shortlist with "maybe" for everything.
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
      // Sequential calls (could parallelize with Promise.all, but 20 concurrent is aggressive for rate limits)
      for (const g of missingGrants) {
        const result = await callOpenAi(openAiKey, profile as Profile, g);
        if (result) {
          llmResults.set(g.id, result.verdict);
          totalInputTokens += result.inputTokens;
          totalOutputTokens += result.outputTokens;
        } else {
          // Fallback for this single grant
          llmResults.set(g.id, {
            eligibility: 'maybe',
            fit_score: 50,
            explanation: 'AI scoring was unavailable for this grant. It matched your profile on rules alone.',
          });
          llmFailureCount += 1;
        }
      }
    }

    // 10. Cache write for successful LLM results only
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
      const { error: cacheErr } = await admin
        .from('funding_match_cache')
        .upsert(cacheInserts, { onConflict: 'user_id,grant_id,profile_hash' });
      if (cacheErr) {
        console.error('[MATCH] Cache write error:', cacheErr);
      }
    }

    // 11. Log the run
    await admin.from('funding_match_runs').insert({
      user_id: userId,
      grant_count: shortlist.length,
      llm_input_tokens: totalInputTokens,
      llm_output_tokens: totalOutputTokens,
      cache_hits: cacheByGrant.size,
      source: 'user',
    });

    // 12. Merge cache + LLM results, sort, truncate
    const scored = shortlist.map((g: Grant) => {
      const fromCache = cacheByGrant.get(g.id);
      const fromLlm = llmResults.get(g.id);
      const verdict = fromCache ?? fromLlm ?? {
        eligibility: 'maybe' as const,
        fit_score: 50,
        explanation: 'Matched on profile alone.',
      };
      return { grant: g, verdict };
    });

    scored.sort((a, b) => b.verdict.fit_score - a.verdict.fit_score);
    const top = scored.slice(0, topN);

    // 13. Tier-aware response
    const matches: MatchResponse[] = top.map(({ grant, verdict }) => {
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
        eligibility: verdict.eligibility,
      };
      if (tier !== 'free') {
        base.fit_score = verdict.fit_score;
        base.explanation = verdict.explanation;
      }
      return base;
    });

    // Compute remaining after this run
    let remaining: number | null = null;
    if (quota !== null) {
      // We just inserted one row, so use the count + 1
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
