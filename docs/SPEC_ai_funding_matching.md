# Spec: AI-Powered Funding Matching (Roadmap #2)

> **Status:** Ready for architecture review, not yet ready for implementation
> **Estimated effort:** 1–2 weeks of focused work
> **Dependencies:** Roadmap #1 (`grants` table must exist with verified, published rows). OpenAI API key. Existing `profiles` table from Phase 4.

---

## 1. Why this feature

Free → Paid conversion is the entire purpose of this feature. The pricing page already lists "AI-powered funding navigator (500+ programs)" as the headline benefit of the Growth tier — this builds the actual thing.

It also unlocks four downstream features:
- **#3 Grant Writing Assistant** — needs "which grants is this user eligible for" as input
- **#5 IFI Connection Engine** — same thing, scoped to financial institutions
- **Grant Success Predictor** — uses match results + historical outcomes
- **Application Status Tracking** — applies to grants the user has matched with

So this is foundational, not standalone. The cost-and-architecture decisions made here will shape every subsequent AI feature.

---

## 2. What the user experiences

### Anonymous visitor on `/funding`
No change from current state. Browses public grant list, sees "Get free email alerts" CTA. **Matching is gated behind auth** (no anonymous matching) because the matching algorithm needs profile data.

### Free user (Maadaadiziwin)
- Logs in, goes to `/dashboard/funding`
- New section: "Your matches"
- Button: "Find my matches" — runs the matching engine
- Sees up to **3 matches per calendar month** (hard cap, resets on the 1st)
- Each match shows: grant name, funder, amount range, deadline, eligibility (yes/no/maybe), one-line "why it fits"
- After 3 uses: "You've used your 3 free matches this month. Upgrade to Ogichidaakwe for unlimited matching." → CTA to /pricing

### Growth user (Ogichidaakwe, $49/mo)
- Same UI, no monthly cap
- Each match additionally shows: detailed eligibility breakdown, application checklist preview, deadline countdown, "Save for later" button
- New page: `/dashboard/funding/matches` — saved matches with status (interested / applied / awarded / declined)

### Professional user (Bimaadiziwin, $149/mo)
- Same as Growth + multi-entity matching (when multi-entity ships)
- For now, identical to Growth tier

### Enterprise user (Gimishoomis)
- Same as Professional + custom rules (e.g., only show grants for a specific Nation)
- Out of scope for v1, marked "coming soon" in tier

---

## 3. Architecture decisions (these need your input before code)

This is where the spec differs from #1 — the cost and quality tradeoffs are real and reversible only with effort.

### Decision 3.1 — How to do the matching

| Option | Approach | Pros | Cons |
|---|---|---|---|
| **A: Pure rules** | SQL queries with array overlap on provinces/industries/stages, plus amount range filter | Free, deterministic, fast (~50ms), no LLM cost ever | No nuance — can't tell that "construction" entrepreneur in Yukon should get a Yukon-specific construction grant ranked above an AB construction grant. Can't write explanations. |
| **B: Pure LLM** | Send user profile + entire grants list to GPT-4o, ask which match | Maximum nuance, can explain reasoning, handles edge cases | $$$ — at 17 grants today, ~$0.005 per match. At 500 grants when DB grows, ~$0.10 per match. Slow (3-8s). Hits token limits. |
| **C: Hybrid (recommended)** | Rules filter to top 10–20 candidates, LLM scores and explains those | Best of both: ~$0.001 per match, deterministic shortlist, AI nuance on the small set | Two-step pipeline; slightly more code |

**Recommendation: C — Hybrid.** Rules give a deterministic shortlist of 10–20 grants in 50ms. LLM scores those 20 with reasoning in ~2 seconds at ~$0.001 per call. Total: ~$0.001 per match. Caching cuts that further.

### Decision 3.2 — Which LLM model

| Model | Input | Output | Per-match cost (~3K in / 1K out) | Quality for this use case |
|---|---|---|---|---|
| **GPT-4o-mini** | $0.15/1M | $0.60/1M | **~$0.001** | Good — handles eligibility reasoning well, occasionally misses subtle requirements |
| **GPT-4o** | $2.50/1M | $10/1M | ~$0.018 | Excellent, but ~16x cost |
| **Claude 3.5 Haiku** | $0.80/1M | $4/1M | ~$0.007 | Mid-range, similar quality to 4o-mini |
| **Local embeddings** | free | free | $0 | Similarity score only, no explanation |

**Recommendation: GPT-4o-mini.** At ~$0.001 per uncached match, even unrealistic worst-case usage is cheap (10K matches/month = $10/month). Quality is good enough for "does this profile fit this grant" reasoning. We can A/B against GPT-4o later if quality is insufficient.

**Open question for you:** Are you OK adding OpenAI as a vendor (you may already use them for the AI Copilot), or do you want to use Anthropic (Claude) instead? This affects which API key to provision and which SDK to integrate. The architecture is identical either way.

### Decision 3.3 — Cost ceiling and rate limits

The math at 1,000 paying users:

| Scenario | Match runs | Uncached cost | With 80% cache hit | Annual cost |
|---|---|---|---|---|
| **Free tier** | 100 users × 3 matches × $0.001 | $0.30/mo | $0.06/mo | $0.72/year |
| **Growth tier (avg)** | 1000 × 10 matches × $0.001 | $10/mo | $2/mo | $24/year |
| **Growth tier (heavy)** | 1000 × 50 matches × $0.001 | $50/mo | $10/mo | $120/year |
| **Worst-case abuse** | 1 user × 1000 matches × $0.001 | $1/mo per user | n/a | depends on rate limit |

This is **not a financially threatening feature** — even at heavy usage, total LLM cost is ~$10–50/month at 1000 paying users. The far bigger risk is **abuse loops** (a user clicking "find matches" 1000 times to game the system or exhaust your budget out of spite).

**Recommended limits:**
- **Free tier:** Hard cap of **3 matches per calendar month per user**. Server-side check, not client-side. Resets on the 1st.
- **Growth tier:** Soft cap of **50 matches per month** with toast warning at 40, hard block at 50. Resets on the 1st.
- **Professional/Enterprise:** No cap.
- **All tiers:** Rate limit of **3 matches per minute** per user (prevents click-spam abuse).
- **Cache TTL:** 24 hours per (user_id, profile_hash, grant_id) tuple. If user updates profile, cache invalidates automatically (different hash). If grant gets updated, cache invalidates automatically (we'll include grant `updated_at` in the cache key).

### Decision 3.4 — Free vs paid boundary (the conversion lever)

The pricing page already lists this distinction. Specific implementation:

| Feature | Free (Maadaadiziwin) | Growth (Ogichidaakwe) | Professional (Bimaadiziwin) |
|---|---|---|---|
| Run matching | ✅ 3/month cap | ✅ 50/month cap | ✅ Unlimited |
| See match results | ✅ Top 5 | ✅ Top 20 | ✅ Top 20 |
| Eligibility yes/no | ✅ | ✅ | ✅ |
| AI explanation ("why this fits you") | ❌ | ✅ | ✅ |
| Detailed eligibility breakdown | ❌ | ✅ | ✅ |
| Save matches for later | ❌ | ✅ | ✅ |
| Application status tracking | ❌ | ✅ | ✅ |
| Deadline countdown alerts | ❌ | ✅ (email) | ✅ (email + SMS — coming soon) |
| Multi-entity matching | ❌ | ❌ | ✅ (when multi-entity ships) |

**The wedge:** Free users see results — they're not blind. They just don't get the explanations or the save/track flow. This creates curiosity ("why did this grant match?") that converts.

### Decision 3.5 — Profile data needed for matching

Already in `profiles` table (Phase 4 migration):
- ✅ `territory` (province) — used for `provinces && grant.provinces`
- ✅ `industry` — used for `industry = ANY(grant.industries)`
- ✅ `business_name` — context for LLM
- ✅ `year_founded` — used to compute business stage
- ✅ `employees` — context for LLM
- ✅ `business_description` — used by LLM for fit analysis
- ✅ `bio` — used by LLM for entrepreneur context

Need to **add** to `profiles`:
- `business_stage` ENUM('ideation', 'startup', 'early-stage', 'growth', 'established') — used for `business_stage = ANY(grant.business_stages)`. Could compute from year_founded, but explicit is better.
- `target_funding_amount` INTEGER (optional) — used to filter by amount range. Privacy-safe (no revenue disclosure required).
- `funding_purpose` TEXT (optional, max 500 chars) — free text "what would you use the funding for". Used by LLM.

**These three additions are non-breaking** — all nullable. Existing users get matches with whatever profile data they have; the matching engine handles missing data gracefully.

---

## 4. Database schema

Two new tables. Apply via Supabase MCP `apply_migration`.

### 4.1 Extend `profiles`

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_stage TEXT
    CHECK (business_stage IS NULL OR business_stage IN ('ideation','startup','early-stage','growth','established')),
  ADD COLUMN IF NOT EXISTS target_funding_amount INTEGER,
  ADD COLUMN IF NOT EXISTS funding_purpose TEXT;
```

### 4.2 `funding_match_runs` — track usage quota

```sql
CREATE TABLE IF NOT EXISTS public.funding_match_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  grant_count INTEGER NOT NULL,
  llm_input_tokens INTEGER,
  llm_output_tokens INTEGER,
  cache_hits INTEGER DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('user', 'cron', 'api'))
);

ALTER TABLE public.funding_match_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own match runs"
  ON public.funding_match_runs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role only inserts (edge function)
CREATE INDEX idx_match_runs_user_month ON public.funding_match_runs(user_id, run_at);
```

This table is the source of truth for the monthly cap. To check "has this user used their 3 free matches this month?":

```sql
SELECT count(*) FROM public.funding_match_runs
WHERE user_id = $1
  AND run_at >= date_trunc('month', CURRENT_DATE);
```

### 4.3 `funding_match_cache` — LLM result cache

```sql
CREATE TABLE IF NOT EXISTS public.funding_match_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  profile_hash TEXT NOT NULL,
  grant_updated_at TIMESTAMPTZ NOT NULL,
  eligibility TEXT NOT NULL CHECK (eligibility IN ('yes','no','maybe')),
  fit_score SMALLINT NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
  explanation TEXT NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours') NOT NULL,
  UNIQUE (user_id, grant_id, profile_hash)
);

ALTER TABLE public.funding_match_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own cached matches"
  ON public.funding_match_cache FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_match_cache_lookup ON public.funding_match_cache(user_id, grant_id, profile_hash);
CREATE INDEX idx_match_cache_expiry ON public.funding_match_cache(expires_at);
```

`profile_hash` is a SHA-256 of the relevant profile fields (territory, industry, business_stage, employees, target_funding_amount, funding_purpose). When the user updates their profile, the hash changes and the cache misses, forcing a fresh LLM call. When the grant updates, `grant_updated_at` mismatches and the cache misses.

### 4.4 `funding_saved_matches` — Growth tier "save for later"

```sql
CREATE TABLE IF NOT EXISTS public.funding_saved_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grant_id UUID NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested','applied','pending','awarded','declined','withdrawn')),
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, grant_id)
);

ALTER TABLE public.funding_saved_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their saved matches"
  ON public.funding_saved_matches FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 5. Edge function: `match-funding-opportunities`

One function does it all. POST request, JWT-required (the user must be authenticated).

**Request body:** empty (the function reads `user_id` from the JWT and `profile` from the DB)

**Response:**
```json
{
  "matches": [
    {
      "grant_id": "uuid",
      "name": "Indigenous Entrepreneur Startup Program",
      "funder": "Futurpreneur Canada",
      "amount_min": 20000,
      "amount_max": 60000,
      "deadline": null,
      "is_recurring": true,
      "application_url": "https://...",
      "fit_score": 87,
      "eligibility": "yes",
      "explanation": "You match this grant strongly because..."
    }
  ],
  "matches_remaining_this_month": 2,
  "tier": "free"
}
```

**Algorithm:**

1. **Auth check** — read JWT, get `user_id`. If invalid, 401.
2. **Profile fetch** — `SELECT * FROM profiles WHERE id = user_id`. Required fields: `territory`, `industry`, `business_stage`. If any missing, return `400 {"error": "Complete your profile to find matches", "missing_fields": [...]}`.
3. **Tier check** — `SELECT subscribed, product_id FROM subscriptions WHERE user_id = user_id`. Determine tier: free / growth / pro.
4. **Quota check** — for free tier, count rows in `funding_match_runs` for this user this month. If ≥ 3, return `429 {"error": "Free tier limit reached", "upgrade_url": "/pricing"}`.
5. **Rate limit check** — count rows in `funding_match_runs` for this user in last 1 minute. If ≥ 3, return `429 {"error": "Slow down — 3 matches per minute max"}`.
6. **Profile hash** — compute SHA-256 of `(territory, industry, business_stage, employees, target_funding_amount, funding_purpose)`.
7. **Rules-based shortlist** — query `grants` table:
   ```sql
   SELECT * FROM grants
   WHERE is_published = TRUE
     AND (deadline IS NULL OR deadline >= CURRENT_DATE OR is_recurring = TRUE)
     AND ($territory = ANY(provinces) OR cardinality(provinces) = 0)
     AND ($industry = ANY(industries) OR cardinality(industries) = 0)
     AND ($business_stage = ANY(business_stages) OR cardinality(business_stages) = 0)
     AND (
       target_funding_amount IS NULL OR amount_min IS NULL OR target_funding_amount >= amount_min
     )
   ORDER BY deadline ASC NULLS LAST
   LIMIT 20;
   ```
8. **Cache lookup** — for each candidate, check `funding_match_cache`:
   ```sql
   SELECT * FROM funding_match_cache
   WHERE user_id = $1 AND grant_id = $2
     AND profile_hash = $3 AND grant_updated_at = $4
     AND expires_at > now();
   ```
9. **LLM call (cache misses only)** — for each cache miss, call OpenAI with:
   ```
   System: You are an expert on Indigenous business funding in Canada. Score how well this profile fits this grant. Return JSON only.
   User: PROFILE: {...} GRANT: {...} Return: {"eligibility": "yes|no|maybe", "fit_score": 0-100, "explanation": "1-2 sentences in plain English, max 200 chars"}
   ```
   Use `response_format: {type: "json_object"}` for guaranteed JSON.
10. **Cache write** — insert each LLM result into `funding_match_cache` with TTL.
11. **Run log** — insert one row into `funding_match_runs` with token usage and cache hit count.
12. **Sort + truncate** — sort by `fit_score DESC`, take top 5 (free) or top 20 (paid).
13. **Tier-aware response** — for free tier, omit `explanation` and `fit_score` (just yes/no eligibility). For paid, include everything.

**Error handling:**
- OpenAI rate-limited → return cached results only, no error
- OpenAI down → return rules-based shortlist with placeholder eligibility ("maybe"), no error
- DB error → 500 with generic message

**Cost guard:** if a single LLM call returns > 500 tokens (pathological), truncate the explanation server-side. Hard cap on output tokens at the API level (`max_tokens: 200`).

---

## 6. Frontend

### 6.1 New page: `src/pages/dashboard/FundingMatches.tsx`

**Route:** `/dashboard/funding/matches` (auth required)

Layout:
- DashboardLayout wrapper (existing pattern)
- Header: "Your funding matches"
- Profile completeness check — if missing fields, show "Complete your profile" CTA before allowing matching
- "Find my matches" button — calls `match-funding-opportunities` edge function
- Results grid: cards similar to `/funding`, but with fit_score badge, eligibility yes/no/maybe, and (paid only) explanation
- Quota indicator at top: "3/3 free matches used this month" (free) or "12/50 used this month" (growth)
- Save button on each card (paid only)

### 6.2 Update `src/pages/dashboard/Funding.tsx`

Add a "Find my matches" CTA card at the top that links to `/dashboard/funding/matches`. Keep the existing public grants browser as the secondary view.

### 6.3 Update `src/pages/dashboard/Profile.tsx`

Add three new fields:
- "Business stage" dropdown (ideation/startup/early-stage/growth/established)
- "Target funding amount" number input (optional)
- "What would you use the funding for?" textarea (max 500 chars, optional)

Wire these to the new `profiles` columns. Pre-existing save handler already writes to profiles table — just add the new fields to the form data.

### 6.4 New page: `src/pages/dashboard/SavedMatches.tsx` (Growth tier only)

**Route:** `/dashboard/funding/saved`

Shows the user's saved matches with status pipeline (interested → applied → pending → awarded/declined). Drag-and-drop columns or simple status dropdown per row. ProtectedRoute with `requirePaid={true}`.

### 6.5 Update `src/App.tsx`

Add 2 routes:
```tsx
const FundingMatches = lazy(() => import("./pages/dashboard/FundingMatches"));
const SavedMatches = lazy(() => import("./pages/dashboard/SavedMatches"));

<Route path="/dashboard/funding/matches" element={<ProtectedRoute><FundingMatches /></ProtectedRoute>} />
<Route path="/dashboard/funding/saved" element={<ProtectedRoute requirePaid><SavedMatches /></ProtectedRoute>} />
```

### 6.6 Update pricing page

In `PricingSection.tsx`, flip these features from `available: false` to `available: true`:
- Maadaadiziwin: "3 AI funding matches per month" → ✅
- Ogichidaakwe: "AI-powered funding navigator (500+ programs)" → ✅
- Ogichidaakwe: "Application checklist generator" → ✅ (we'll deliver a basic version with this feature)

This is the "ship the feature, then update the marketing" step. **Do not flip these flags until the feature is verified working in production.**

---

## 7. OpenAI integration

Add `OPENAI_API_KEY` to Supabase Edge Function secrets (manual user step, same as the Resend key).

Example call from inside the edge function:

```typescript
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    max_tokens: 200,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You are an expert on Indigenous business funding...' },
      { role: 'user', content: `PROFILE: ${JSON.stringify(profile)}\n\nGRANT: ${JSON.stringify(grant)}\n\nReturn JSON: {eligibility: "yes|no|maybe", fit_score: 0-100, explanation: "..."}` },
    ],
  }),
});
```

**Privacy note:** OpenAI will see the user's profile data (territory, industry, business stage, business description, funding purpose). This is **personal information under PIPEDA**. The privacy policy must disclose this third-party processor before launch. Add a one-line update to `/privacy`:

> "We use OpenAI's API (GPT-4o-mini model) to generate funding opportunity recommendations. Your profile data is sent to OpenAI only when you click 'Find my matches'. OpenAI does not retain data sent via API for training."

---

## 8. Acceptance criteria

1. New user signs up → profile shows "Complete your profile to find matches"
2. User completes profile (territory, industry, business stage minimum) → "Find my matches" button enables
3. Free user clicks "Find my matches" → sees top 5 matches with eligibility yes/no, no explanations
4. Free user clicks again 2 more times → 4th attempt shows "You've used your 3 free matches this month" + upgrade CTA
5. Growth user clicks "Find my matches" → sees top 20 matches with full explanations and fit scores
6. Growth user saves a match → appears in `/dashboard/funding/saved` with status "interested"
7. Growth user updates status to "applied" → persists in `funding_saved_matches`
8. Same user runs matching again with same profile → returns from cache (verify in `funding_match_runs.cache_hits > 0`)
9. User updates profile (changes industry) → next match call misses cache, computes fresh
10. Total cost for 1000 free matches stays under $5 (verify via `funding_match_runs.llm_input_tokens` totals)
11. Anonymous request to `match-funding-opportunities` returns 401
12. Free tier user makes 4 requests in 1 minute → 4th returns 429
13. RLS: user A cannot read user B's match runs, cache, or saved matches
14. Pricing page features flipped from "coming soon" to "available today"
15. `npx tsc --noEmit && npm run lint && npm test -- --run && npm run build` all pass

---

## 9. Out of scope (deferred)

- **Grant Writing Assistant** — separate roadmap item (#3). Generates grant application drafts. Requires this feature as input.
- **Grant Success Predictor** — separate item. Requires historical application outcome data we don't have.
- **Document Checklist Generator** — separate item, but a basic v1 (pulls from grant.eligibility_notes) ships with this feature.
- **Multi-entity matching** — Professional tier feature, requires multi-entity support which doesn't exist yet.
- **Match digest emails** — "we found 3 new matches for you this week" — could leverage the Stage 4 cron infrastructure from #1, but defer to a follow-up.
- **A/B testing different LLM models** — start with 4o-mini, optimize later.
- **Embeddings-based similarity** — could supplement the rules-based shortlist, but defer until we have more grants in the DB.

---

## 10. Implementation order (recommended, 5 stages)

**Stage 1 — DB schema + profile extension** (~2 hours)
- Apply migration: extend profiles, create funding_match_runs, funding_match_cache, funding_saved_matches
- Update Profile.tsx to add 3 new fields
- Verify with manual SQL inserts

**Stage 2 — Edge function** (~4 hours)
- Build `match-funding-opportunities` end-to-end
- Test with curl + manual JWT
- Verify cache hits/misses behave correctly

**Stage 3 — FundingMatches.tsx page** (~3 hours)
- Build the matches dashboard page
- Wire to edge function
- Handle all 4 UI states: loading, success, quota-exceeded, profile-incomplete
- Add route to App.tsx

**Stage 4 — SavedMatches.tsx + status tracking** (~3 hours)
- Build saved matches page (Growth tier only)
- Save/update/delete actions
- Add route with `requirePaid={true}` guard

**Stage 5 — Pricing page flip + privacy disclosure + smoke test** (~1 hour)
- Flip 3 features from `available: false` to `available: true` in PricingSection.tsx
- Add OpenAI disclosure to `/privacy`
- End-to-end smoke test: free user, growth user, profile changes, cache hits

**Total: ~13 hours of focused work, spread across 1-2 weeks of calendar time depending on review pace.**

---

## 11. Files this feature touches

**New files:**
- `supabase/migrations/<timestamp>_funding_matching.sql`
- `supabase/functions/match-funding-opportunities/index.ts`
- `src/pages/dashboard/FundingMatches.tsx`
- `src/pages/dashboard/SavedMatches.tsx`

**Modified files:**
- `src/pages/dashboard/Profile.tsx` — 3 new form fields
- `src/pages/dashboard/Funding.tsx` — add "Find my matches" CTA
- `src/components/PricingSection.tsx` — flip 3 features to available
- `src/pages/PrivacyPolicy.tsx` — add OpenAI disclosure
- `src/App.tsx` — 2 new routes

**Supabase secrets to add:**
- `OPENAI_API_KEY` (manual user step, dashboard-only)

---

## 12. Open questions for you

These need answers before I write code. None are blocking the spec — they're blocking implementation.

1. **OpenAI vs Anthropic?** I recommend OpenAI GPT-4o-mini for cost. If you have a strong preference for Claude or already have an Anthropic account, say so — same architecture, different SDK.

2. **Privacy policy update** — are you OK with me adding a one-line OpenAI disclosure to `/privacy`, or do you want to write it yourself / run it past legal first?

3. **Free tier cap** — 3 matches/month feels right to me, but you might know your funnel better. Higher cap = better Free experience but slower conversion to paid. Lower cap = aggressive paywall. Sticking with 3 unless you say otherwise.

4. **Growth tier cap** — 50 matches/month is generous. Some users may legitimately want more (consultants helping multiple clients). I'll add the soft warning at 40 and hard block at 50, but tell me if you want 100 or unlimited.

5. **Should anonymous users see a teaser?** Right now, matching is gated behind login. We could let anonymous users run 1 demo match (with hardcoded sample profile) just to see the UI. Adds complexity but might convert better. Default = no, gated behind login.

6. **Profile completeness check** — what's the minimum required to run a match? My default: territory + industry + business_stage. Stricter (require employees + bio) = better matches but more drop-off. Looser (just territory) = worse matches but more conversions. Default sticks unless you say otherwise.

When you've answered these (or said "use your defaults"), say **"start #2 stage 1"** and I'll begin building.
