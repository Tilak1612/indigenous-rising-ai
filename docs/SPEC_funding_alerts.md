# Spec: Funding Deadline Calendar with Email Alerts (Roadmap #1)

> **Status:** Ready for implementation
> **Estimated effort:** 3–5 days of focused work
> **Dependencies:** Resend (already configured), Supabase Edge Functions, existing patterns from `submit-career-application`

---

## 1. Why this feature

This is the **wedge feature** in the post-launch roadmap. It is the smallest, fastest, lowest-risk thing we can build that:

1. Gives free visitors immediate, tangible value (a real list of upcoming Indigenous business funding opportunities, filtered by their province and industry)
2. Captures a verified email list of our exact target market (Indigenous entrepreneurs + EDC staff) at near-zero marginal cost
3. Creates a natural upgrade hook to the paid tier (immediate alerts, profile-based eligibility scoring, status tracking, document checklists are all gated to Growth/Pro)
4. Generates organic word-of-mouth — nobody else in the market provides a free, automated, Canada-wide Indigenous funding alert system

The goal is **not** revenue from this feature directly. The goal is to build a mailing list of validated Indigenous entrepreneurs that converts to paid tiers over time.

---

## 2. Decisions already made

| Question | Answer |
|---|---|
| Starter data source | ~75 publicly-known programs as a structured seed; team verifies each row (sets `last_verified` from null to today) before it goes live |
| Alert frequency (free) | Weekly digest, Friday morning ET |
| Alert frequency (paid) | Immediate alerts (within 1 hour of new grant added or deadline crossing 14/30/7-day thresholds) — gated to Growth tier, not in this spec |
| Free vs. paid boundary | Free = browse + weekly digest filtered by province/industry. Paid (Growth/Pro) = personalised eligibility scoring, status tracking, document checklists, immediate alerts |
| Email From address | `funding@indigenousrising.ai` (Resend domain `indigenousrising.ai` already verified) |
| Email template | Plain HTML for v1, design pass later |
| CASL compliance | **Hard requirement.** Double opt-in, explicit consent checkbox (unchecked by default), consent record (timestamp + IP + UA), 1-click unsubscribe in every email, immediate effect |

---

## 3. Database schema

Two new tables. Apply via Supabase MCP `apply_migration` or `supabase db push`.

### 3.1 `grants`

```sql
CREATE TABLE IF NOT EXISTS public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  funder TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_min INTEGER,
  amount_max INTEGER,
  amount_currency TEXT NOT NULL DEFAULT 'CAD',
  deadline DATE,
  is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
  recurrence_notes TEXT,
  provinces TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  business_stages TEXT[] NOT NULL DEFAULT '{}',
  eligibility_notes TEXT,
  application_url TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  last_verified DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;

-- Public read of published grants only — anon and authenticated
CREATE POLICY "Anyone can read published grants" ON public.grants
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE);

-- Indexes
CREATE INDEX idx_grants_published_deadline ON public.grants(is_published, deadline) WHERE is_published = TRUE;
CREATE INDEX idx_grants_provinces ON public.grants USING GIN (provinces);
CREATE INDEX idx_grants_industries ON public.grants USING GIN (industries);

CREATE TRIGGER update_grants_updated_at
  BEFORE UPDATE ON public.grants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

**Notes:**
- `provinces` is a TEXT[] of 2-letter codes: `AB BC MB NB NL NS NT NU ON PE QC SK YT`
- `industries` should match the existing list in `src/pages/dashboard/Profile.tsx` (Agriculture & Forestry, Arts & Crafts, Construction, etc.) — keep them in sync
- `business_stages` ∈ `{ideation, startup, early-stage, growth, established}`
- `is_published = FALSE` by default — seed data ships unpublished, team verifies and flips the bit
- `last_verified` is the date a human last confirmed the grant is still active and the URL still works. NULL means never verified — must not be visible to users.

### 3.2 `grant_alerts_subscribers`

```sql
CREATE TABLE IF NOT EXISTS public.grant_alerts_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  provinces TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE NOT NULL,
  confirmation_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  unsubscribe_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  consent_given BOOLEAN NOT NULL,
  consent_ip TEXT,
  consent_user_agent TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  last_digest_sent_at TIMESTAMPTZ
);

ALTER TABLE public.grant_alerts_subscribers ENABLE ROW LEVEL SECURITY;

-- No direct anon/authenticated access — only edge functions via service role
-- (subscribers manage their subscription via tokens validated server-side)

CREATE INDEX idx_grant_alerts_active ON public.grant_alerts_subscribers(is_active, last_digest_sent_at) WHERE is_active = TRUE;
CREATE INDEX idx_grant_alerts_confirmation_token ON public.grant_alerts_subscribers(confirmation_token);
CREATE INDEX idx_grant_alerts_unsubscribe_token ON public.grant_alerts_subscribers(unsubscribe_token);
```

---

## 4. Edge functions

All in `supabase/functions/`. All follow the existing pattern from `submit-career-application` (CORS allowlist via `getCorsHeaders(req)`, Resend via `RESEND_API_KEY` secret, Supabase service role for DB writes).

### 4.1 `subscribe-funding-alerts/index.ts` — POST, public (no JWT)

**Purpose:** Public form submits email + filters + consent. Server validates, generates confirmation token, sends double-opt-in email.

**Request body:**
```json
{
  "email": "user@example.com",
  "provinces": ["ON", "BC"],
  "industries": ["Construction", "Hospitality & Tourism"],
  "consent": true
}
```

**Validation:**
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, max 255 chars
- `provinces`: array of 1–13 entries, each ∈ Canada province/territory codes
- `industries`: array of 1–17 entries from the canonical list
- `consent` must be `true` (CASL — return 400 if false)
- Rate limit: 3 attempts per IP per minute, 10 per hour (use the same `submit-contact` pattern)

**Behavior:**
- If email exists and `is_active = TRUE`: return `200 {"success": true, "message": "You are already subscribed."}` (don't reveal whether the email exists to prevent enumeration)
- If email exists and `is_active = FALSE`: regenerate `confirmation_token`, update `provinces`, `industries`, `consent_*`, `subscribed_at = now()`, send confirmation email
- If email is new: insert row with `is_active = FALSE`, send confirmation email
- Confirmation email contains link: `https://www.indigenousrising.ai/funding/confirm?token=<token>`

**Response (success):** `200 {"success": true}`

**Response (error):** `400` for validation, `429` for rate limit, `500` for server errors. Generic error messages — never leak internal state.

### 4.2 `confirm-funding-alert-subscription/index.ts` — GET, public (no JWT)

**Purpose:** Public link from confirmation email. Validates token, activates subscription, returns rendered HTML page (not JSON — the user clicks this from their inbox and lands here directly).

**Query param:** `?token=<uuid>`

**Behavior:**
- If token invalid → return HTML 404 page with link back to `/funding/alerts`
- If token expired (>48 hours from `subscribed_at` AND `is_active = FALSE`) → return HTML 410 page with link to resubscribe
- If valid → set `is_active = TRUE`, `confirmed_at = now()`, return HTML success page with "Welcome to Indigenous Rising AI Funding Alerts. Your first digest will arrive Friday morning."

**Response:** Always `text/html`, never JSON. Success page is a self-contained HTML document with the same green/gradient styling as the marketing site (no React, no Tailwind — inline CSS).

### 4.3 `unsubscribe-funding-alerts/index.ts` — GET, public (no JWT)

**Purpose:** 1-click unsubscribe from email footer. CASL requires this to work without login, without confirmation page, without additional clicks.

**Query param:** `?token=<uuid>`

**Behavior:**
- Set `is_active = FALSE`, `unsubscribed_at = now()`
- Return HTML success page: "You have been unsubscribed from Indigenous Rising AI Funding Alerts. Sorry to see you go. You can resubscribe any time at indigenousrising.ai/funding/alerts."
- If token invalid → still return success HTML (don't reveal whether the token exists)

**Response:** Always `text/html`.

### 4.4 `send-funding-digest/index.ts` — POST, JWT required (cron-only)

**Purpose:** Weekly Friday digest. Cron-triggered. Iterates active subscribers, builds personalised digest, sends via Resend.

**Authorization:** Require a shared secret in `Authorization: Bearer <CRON_SECRET>` header. Set `CRON_SECRET` in Supabase secrets. Reject all other callers with 401.

**Selection logic per subscriber:**

```sql
SELECT * FROM grants
WHERE is_published = TRUE
  AND (deadline >= CURRENT_DATE OR is_recurring = TRUE)
  AND provinces && $subscriber_provinces  -- array overlap
  AND (
    industries && $subscriber_industries  -- array overlap
    OR cardinality(industries) = 0        -- grants with no industry restriction match all
  )
ORDER BY deadline ASC NULLS LAST
LIMIT 10;
```

**Per-subscriber send rules:**
- Skip if `last_digest_sent_at >= now() - interval '6 days'` (dedup safety net)
- Skip if 0 matching grants
- Send via Resend
- On success, update `last_digest_sent_at = now()`
- On failure, log and continue (don't update `last_digest_sent_at` so it retries next week)

**Cron schedule:** Friday 10:00 AM ET = 14:00 UTC (15:00 UTC during EDT). Use either:
- Supabase pg_cron extension: `SELECT cron.schedule('send-funding-digest', '0 14 * * 5', $$ SELECT net.http_post(...) $$)` — preferred
- External scheduler (GitHub Actions cron, Vercel Cron, EasyCron) hitting the function

**Response:** `200 {"sent": <count>, "skipped": <count>, "failed": <count>}`

---

## 5. Email templates (plain HTML)

All emails sent via Resend. From: `Indigenous Rising AI Funding <funding@indigenousrising.ai>`. Reply-To: `help@indigenousrising.ai`.

### 5.1 Confirmation email

**Subject:** `Confirm your Indigenous Rising AI funding alerts subscription`

**Body (HTML):**
- Header: "Welcome — please confirm your subscription"
- Body paragraph: "You requested weekly funding alerts for Indigenous businesses in [provinces] in the [industries] sector(s). Click the button below to confirm your email and start receiving alerts every Friday morning."
- Confirmation button (anchor styled as button) → `https://www.indigenousrising.ai/funding/confirm?token=<token>`
- "If you did not request this, you can safely ignore this email — no further messages will be sent."
- Footer: business name, mailing address (Toronto territory acknowledgment from Footer.tsx), CASL-compliant sender info

### 5.2 Weekly digest

**Subject:** `New Indigenous business funding — week of <Month DD, YYYY>`

**Body (HTML):**
- Header: "Indigenous Rising AI — Funding Alerts"
- Intro: "Here are this week's funding opportunities for [provinces] in [industries]:"
- For each grant (max 10):
  - Name (h3)
  - Funder
  - Amount range (e.g. "$5,000 – $250,000 CAD") or "Amount varies"
  - Deadline (e.g. "Deadline: March 31, 2026 — 48 days left") or "Rolling intake"
  - 1–2 sentence description
  - "Apply on funder's site →" button → `application_url`
- Footer: "You're receiving this because you subscribed to weekly funding alerts at indigenousrising.ai" + 1-click unsubscribe link → `https://www.indigenousrising.ai/funding/unsubscribe?token=<unsubscribe_token>`
- CASL-compliant sender info: business name, mailing address

---

## 6. Frontend

### 6.1 New page: `src/pages/FundingAlerts.tsx`

**Route:** `/funding/alerts` (public, no auth)

**Layout:**
- `Navigation` header
- Hero: "Free weekly funding alerts for Indigenous entrepreneurs" + 1-line subhead
- Form (uses `react-hook-form` + `zod` like Careers.tsx):
  - Email input (required, validated)
  - Province multi-select (required, at least 1) — use existing Select pattern
  - Industry multi-select (required, at least 1) — same `industries` array as Profile.tsx
  - CASL consent checkbox (required, unchecked by default): "I consent to receive weekly funding opportunity emails from Indigenous Rising AI. I understand I can unsubscribe at any time."
  - Submit button → POST to `subscribe-funding-alerts` edge function
- Below form: "What you'll get" bullet list (3 bullets max — be honest about what's in the digest)
- `Footer`
- `MetaTags` with self-referential canonical (auto via `useLocation`)

### 6.2 New page: `src/pages/FundingAlertConfirm.tsx`

**Route:** `/funding/confirm` (public, no auth)

Reads `?token=` from URL via `useSearchParams`, calls `confirm-funding-alert-subscription` edge function on mount (in a `useEffect`), displays loading → success or error state.

### 6.3 New page: `src/pages/FundingAlertUnsubscribe.tsx`

**Route:** `/funding/unsubscribe` (public, no auth)

Same pattern as confirm. Reads `?token=`, calls unsubscribe function, displays success state.

> **Note:** Confirm/Unsubscribe could be handled either by edge functions returning HTML directly, or by React pages that call edge functions. The React-page approach is more consistent with the rest of the site (uses Navigation/Footer, MetaTags, Tailwind styling). Recommended.

### 6.4 Update `src/pages/PublicFunding.tsx` and/or `src/components/FundingSection.tsx`

Replace the hardcoded opportunities array with a Supabase query:

```typescript
const { data: grants } = await supabase
  .from('grants')
  .select('*')
  .eq('is_published', true)
  .or('deadline.gte.' + new Date().toISOString().split('T')[0] + ',is_recurring.eq.true')
  .order('deadline', { ascending: true, nullsFirst: false })
  .limit(20);
```

Add filter UI: province dropdown + industry dropdown (client-side filter on the result set, since we're fetching at most 20).

Each grant card shows:
- Name (h3)
- Funder
- Amount range badge
- Deadline with "X days left" badge (use existing `deriveStatus` pattern from `Funding.tsx`)
- Province tags
- Industry tags
- "Apply on funder site →" button → `application_url` (opens in new tab, `rel="noopener noreferrer"`)

Add a prominent "Get free email alerts" CTA card linking to `/funding/alerts`.

### 6.5 Update `src/App.tsx`

Add three lazy-loaded routes:

```tsx
const FundingAlerts = lazy(() => import("./pages/FundingAlerts"));
const FundingAlertConfirm = lazy(() => import("./pages/FundingAlertConfirm"));
const FundingAlertUnsubscribe = lazy(() => import("./pages/FundingAlertUnsubscribe"));

// Inside Routes:
<Route path="/funding/alerts" element={<Suspense fallback={<PageSkeleton />}><FundingAlerts /></Suspense>} />
<Route path="/funding/confirm" element={<Suspense fallback={<PageSkeleton />}><FundingAlertConfirm /></Suspense>} />
<Route path="/funding/unsubscribe" element={<Suspense fallback={<PageSkeleton />}><FundingAlertUnsubscribe /></Suspense>} />
```

### 6.6 Update CSP in `vercel.json`

Add `https://*.supabase.co` to `connect-src` if not already present (it is — verified during the security headers commit). No CSP change needed.

---

## 7. Seed data

**Approach:** Produce ~75 grants from publicly known programs as a structured INSERT statement (or CSV imported via Supabase dashboard). All rows ship with `is_published = FALSE` and `last_verified = NULL`. The team must verify each row before flipping `is_published` to TRUE.

**Sources to draw from (verify each before publishing):**

| Source | Programs |
|---|---|
| **NACCA / IFI network** | 50+ regional Indigenous Financial Institution loan programs |
| **ISC (federal)** | Aboriginal Entrepreneurship Program, Strategic Partnerships Initiative, Lands and Economic Development Services Program |
| **Futurpreneur** | Indigenous Entrepreneur Startup Program (loans + mentorship for 18–39) |
| **BDC** | BDC Indigenous Entrepreneur Loan |
| **Alberta** | Alberta Indigenous Opportunities Corporation, ATB Financial Indigenous Banking |
| **British Columbia** | BC Indigenous Business Development Loan Program, NEDC, AFOA BC programs |
| **Saskatchewan** | Saskatchewan Indian Equity Foundation, Métis Economic Development Fund |
| **Manitoba** | Louis Riel Capital Corporation, Manitoba Indigenous Economic Development |
| **Ontario** | Ontario Aboriginal Loan Guarantee Program, NACCA-Ontario partners |
| **Quebec** | SOCCA Indigenous Investment Fund, FNQLEDC programs |
| **Atlantic** | Ulnooweg Development Group, Atlantic Canada Opportunities Agency Indigenous programs |
| **Territories** | NWT Métis Nation programs, Nunavut Business Credit Corporation, Yukon Indigenous business support |

**CRITICAL:** Claude (or any AI) producing the seed data is a **scaffold for verification, not a source of truth**. AI training data has a cutoff and program details (deadlines, amounts, eligibility, URLs) drift fast. Every single seed row must be verified by a human against the funder's current website before `is_published` is set to TRUE. This is the same trust rule that fixed the audit findings about expired training dates and stale funding deadlines.

---

## 8. CASL compliance checklist

CASL (Canada's Anti-Spam Legislation) governs all commercial electronic messages sent to Canadian recipients. The funding digest is a commercial electronic message. These requirements are non-negotiable:

- [ ] Explicit consent checkbox on signup form (unchecked by default, required to submit)
- [ ] Consent timestamp + IP + user agent stored in `grant_alerts_subscribers.consent_*` columns
- [ ] Double opt-in: confirmation email required before `is_active = TRUE` (no pre-checked boxes, no implied consent)
- [ ] Sender clearly identified in every email: business name + mailing address in footer
- [ ] Subject line not misleading
- [ ] From address recognisable: `Indigenous Rising AI Funding <funding@indigenousrising.ai>`
- [ ] 1-click unsubscribe link in every email
- [ ] Unsubscribe takes effect immediately (set `is_active = FALSE` on click, no "5 business days" delay)
- [ ] Unsubscribed users not included in any future digest (selection query checks `is_active = TRUE`)
- [ ] Consent records retained for at least 3 years after last contact (do not delete `grant_alerts_subscribers` rows on unsubscribe — set `is_active = FALSE` and `unsubscribed_at`)

---

## 9. Acceptance criteria

1. Anonymous visitor lands on `/funding`, sees the new public grant calendar with at least 5 verified grants (`is_published = TRUE`, `last_verified IS NOT NULL`)
2. Visitor can filter by province and industry, and the list updates client-side
3. Visitor clicks "Get free email alerts", lands on `/funding/alerts`, fills the form (email + ON + Construction + consent checked), submits
4. Within 60 seconds, confirmation email arrives in inbox from `funding@indigenousrising.ai` with subject `Confirm your Indigenous Rising AI funding alerts subscription`
5. Visitor clicks the confirmation link, lands on `/funding/confirm?token=<token>`, sees "Subscription confirmed" success message
6. Database row in `grant_alerts_subscribers` shows `is_active = TRUE`, `confirmed_at IS NOT NULL`, `consent_given = TRUE`, `consent_ip` and `consent_user_agent` populated
7. Friday morning at 10:00 AM ET, the cron triggers `send-funding-digest`. The visitor receives a digest email with up to 10 grants matching ON + Construction
8. Each grant in the digest links to the funder's site with `target="_blank" rel="noopener noreferrer"`
9. Footer of digest contains 1-click unsubscribe link
10. Visitor clicks unsubscribe, lands on `/funding/unsubscribe?token=<token>`, sees success message
11. Database row shows `is_active = FALSE`, `unsubscribed_at IS NOT NULL`. Row is **not** deleted (CASL retention)
12. The visitor does not receive next Friday's digest
13. Visitor re-subscribes with the same email → flow works (confirmation regenerated, eventually re-activates)
14. Direct query of `grant_alerts_subscribers` from anon Supabase client returns 0 rows (RLS blocks)
15. `npx tsc --noEmit && npm run lint && npm test -- --run && npm run build` all pass
16. No new lint warnings, no new test failures

---

## 10. Out of scope (deferred to later roadmap items)

These features are referenced in the value report but **must not** ship with this feature. They belong to later roadmap items:

- **Personalised eligibility scoring** (matches against user's stage/team size/etc.) → roadmap #2 (AI funding matching)
- **Application status tracking** (applied/pending/awarded/declined per grant) → roadmap #2
- **Document checklist generator** → roadmap #2
- **Grant writing assistant** → roadmap #3
- **Immediate alerts** (within 1 hour of new grant or deadline crossing thresholds) → roadmap #2 (paid tier feature)
- **Admin UI for adding/editing grants** → use Supabase dashboard table editor for now; build admin UI later if needed
- **Multi-language digest** → EN only for v1; FR follows when content team translates
- **SMS alerts** → email only for v1
- **Logged-in user auto-subscribe from profile** → separate flow, ship after v1 stabilises
- **Grant Success Predictor** → requires historical application data we don't have yet

---

## 11. Implementation order (recommended)

1. **DB schema** — apply both migrations via Supabase MCP, verify in dashboard
2. **Seed data** — produce ~75 INSERT statements with `is_published = FALSE`, run in production
3. **Edge function: subscribe-funding-alerts** — deploy + test with curl
4. **Edge function: confirm-funding-alert-subscription** — deploy + test the full subscribe → email → confirm loop
5. **Edge function: unsubscribe-funding-alerts** — deploy + test the unsubscribe link
6. **Edge function: send-funding-digest** — deploy with cron secret, test with manual POST first
7. **Frontend: FundingAlerts.tsx + FundingAlertConfirm.tsx + FundingAlertUnsubscribe.tsx** — build the 3 new pages, wire to edge functions
8. **Frontend: update PublicFunding.tsx** — replace hardcoded list with Supabase query, add filters, add CTA to alerts page
9. **Cron schedule** — set up pg_cron or external scheduler to hit `send-funding-digest` weekly
10. **Team verification pass** — review all 75 seed grants, set `last_verified` and `is_published = TRUE` for verified rows
11. **End-to-end test** — execute every acceptance criterion from §9
12. **QA gate** — `tsc && lint && test && build` all green
13. **Commit + push** — single feature commit or staged commits per layer

---

## 12. Files this feature touches

**New files:**
- `supabase/migrations/<timestamp>_funding_alerts.sql`
- `supabase/functions/subscribe-funding-alerts/index.ts`
- `supabase/functions/confirm-funding-alert-subscription/index.ts`
- `supabase/functions/unsubscribe-funding-alerts/index.ts`
- `supabase/functions/send-funding-digest/index.ts`
- `src/pages/FundingAlerts.tsx`
- `src/pages/FundingAlertConfirm.tsx`
- `src/pages/FundingAlertUnsubscribe.tsx`
- `seed/grants_starter.sql` (or CSV) — the 75-grant scaffold

**Modified files:**
- `src/App.tsx` — 3 new routes
- `src/pages/PublicFunding.tsx` — replace hardcoded list with Supabase query + filters + CTA
- `src/components/FundingSection.tsx` (homepage) — same query refresh if it currently uses hardcoded data

**Supabase secrets to add:**
- `CRON_SECRET` (random string, used to authenticate cron → `send-funding-digest`)
