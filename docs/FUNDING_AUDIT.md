# Funding Navigator audit (Phase 0)

Audited 2026-10-26 against `origin/main` a58114d, the production Supabase
project `upxojfcdtmqtcvgbjsym` (ca-central-1) and https://www.indigenousrising.ai.
Every count below was read from the live database or the repo on that date.

## Stack (verified from the repo)

| Layer | What is actually there |
|---|---|
| Frontend | Vite 5 + React 18, TypeScript strict, React Router 6, Tailwind + shadcn/ui, SSR prerender (`scripts/prerender.mjs`) of a fixed `MARKETING` route list |
| Backend | Supabase Postgres + Auth + Storage + 17 Edge Functions (Deno); RLS on every member table; service-role key only inside functions |
| Migrations | 40 append-only SQL files in `supabase/migrations`, applied with the Supabase MCP `apply_migration` |
| Billing | Stripe (CAD) via `create-checkout`, `customer-portal`, `check-subscription`, `stripe-webhook`; tiers free / growth / pro / enterprise derived from the Stripe price id |
| Email | Resend; `send-funding-digest` (weekly, Friday 14:00 UTC, pg_cron `funding-digest-friday`) reads only `public.sendable_grants`; CASL double opt-in in `subscribe-funding-alerts` / `confirm-funding-alert-subscription` |
| AI | OpenAI gpt-4o-mini inside `match-funding-opportunities` (fit score + one sentence only; eligibility is rules-based); `ai-assistant` and `site-assistant` have **no access to the grants table** |
| Cron | pg_cron 1.6 + pg_net; jobs: `funding-digest-friday`, `account-deletion-purge-daily`. `check-funding-freshness` is deployed but **not scheduled** |
| Search | None server-side. `/funding` loads 20 rows client-side and filters in memory |
| Analytics | GA4 via `src/utils/analytics.ts` (`trackEvent`), consent-aware |
| Errors | No error-tracking SDK |
| Hosting / CI | Vercel (deploys on merge to `main`); GitHub Actions `ci.yml` (typecheck, build, vitest, prerender gate), `deploy-functions.yml` (deploys an explicit list of functions on push to `main`) |
| Staging | No Supabase branch. Vercel preview deployments are the only staging and they point at production Supabase |
| Admin | `/admin` (role `admin` in `public.user_roles` via `has_role()`), tabs: newsletter, data requests, testimonials, content. **No funding tab.** `user_roles` has 0 admin rows |
| Mobile | `mobile/` Expo app reads the same `grants` table (read-only), PR #248 merged |

## The funding data model today

`public.grants` is the single catalogue table (RLS: anon + authenticated may
read rows where `is_published = true`; nobody can write through PostgREST).

Columns: id, name, funder, description, amount_min, amount_max, amount_currency,
deadline, is_recurring, recurrence_notes, provinces[], industries[],
business_stages[], eligibility_notes, application_url, is_published,
last_verified, source_url, source_published_date, verification_status
(unverified | verified | needs_review | retired), verified_by, applicant_types[],
verification_notes, funding_type (grant | loan | contribution | loan_guarantee |
mixed | varies …), is_repayable, identity_criteria[], ownership_min_pct.

Supporting tables (all RLS-scoped to `auth.uid()`): `funding_saved_matches`
(status: interested | applied | pending | awarded | declined | withdrawn),
`funding_applications` + `funding_readiness_items` (readiness workspace,
behind `VITE_FEATURE_READINESS_WORKSPACE`), `grant_applications` (+ versions),
`funding_match_cache`, `funding_match_runs`, `grant_alerts_subscribers`,
`email_log`, `email_suppressions`.

Views/functions: `grant_is_sendable(grant, window_days=90)` and
`sendable_grants` (published AND verified AND last_verified within 90 days AND
source_url present). This is the only source the digest may read.

### Live inventory (2026-10-26)

| Measure | Count |
|---|---|
| Rows in `grants` | 17, all published |
| `verification_status = 'verified'` | **0** (so `sendable_grants` is empty and the weekly digest sends nothing) |
| `last_verified` set | 11 (dates 2026-09-26 / 2026-09-28) |
| `needs_review` (dead or bot-blocked links) | 6 |
| Rows with a fixed `deadline` | 0 (every row is `is_recurring = true`) |
| Rows with a verified amount | 5 |
| Rows whose `application_url` is a funder **homepage** rather than a programme page | 10 of 17 |
| Distinct funders | 16 |
| Provinces/territories with at least one region-specific programme | AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT (via 7 national rows + 10 regional rows) |
| Saved matches / applications / readiness items in production | 0 / 0 / 0 |
| Match runs / cache rows | 4 / 5 |
| Confirmed alert subscribers | 1 |
| Profiles | 6 |

Known-bad rows (from `verification_notes`):
- Ontario Indigenous Economic Development Fund: `application_url` 404 since 2026-08-26.
- Strategic Partnerships Initiative (ISC): 404 since 2026-08-26.
- däna Näye Ventures: `source_url` is `danenaye.com` (misspelled); the real domain is **dananaye.com** and it loads.
- CanExport SMEs, Nunavut Business Credit Corporation, ITAC: bot-blocked (403 / timeout) to automated checks, not proven dead.

## What works

- Public `/funding` lists published rows with province + industry filters,
  shows amount, deadline/rolling, verification freshness, and one external button.
- Prerender puts the inventory into static HTML (ItemList JSON-LD + no-JS list)
  with a committed snapshot fallback; CI gate `check-prerender.mjs`.
- `/dashboard/funding/matches`: rules-based criteria (province, sector, stage,
  identity, ownership) computed in code and shown on every tier; LLM adds only a
  fit score and a sentence; quotas 3 / 50 / unlimited; 24 h cache; per-minute
  rate limit; profile fields sent to OpenAI limited to what `/privacy` discloses.
- Saved matches, readiness workspace (flagged), grant application drafts, tasks,
  documents all exist with RLS.
- Weekly digest is gated on verified rows, HTML-escaped, idempotent, suppression
  aware. `check-funding-freshness` exists but is unscheduled.
- `docs/SPEC_funding_alerts.md`, `docs/SPEC_ai_funding_matching.md`,
  `src/data/fundingStats.ts` (dated transparency page) exist.

## What is broken or incomplete

1. **`/funding/:id` renders mock data.** `src/pages/FundingDetail.tsx` reads
   `src/lib/funding-data.ts`, a three-row hard-coded array with 2025 deadlines
   and invented amounts ("Indigenous Business Development Fund $50,000"). Any
   real grant id 404s; `/funding/1` shows a fabricated programme. Not
   prerendered, not in the sitemap.
2. **`FundingList.tsx` / `FundingFilters.tsx`** are mock components with a
   placeholder "fit score" and `alert()`; unused by routes but still in the tree.
3. **No programme detail page for real rows**, no slug, no canonical URL, so
   nothing to link from blog posts or AI answers.
4. **Apply button goes to the funder homepage** for 10 of 17 rows, labelled
   "Apply on funder's site". Several of those funders have no online application
   at all (AEP, IFIs, AIIC: contact the lender). Label and destination do not
   match the brief's "most specific verified destination" rule.
5. **`application_url` is NOT NULL** so a homepage was forced into it even when
   no apply page exists. There is no `link_type`.
6. **Zero verified rows** → the digest has sent nothing since 2026-08-26 and
   `sendable_grants` is empty; no admin UI exists to set `verification_status`,
   so verification requires a migration.
7. **`/dashboard/funding` is paywalled** (`!subscribed` → upgrade card) while
   `plans.ts` lists "Funding opportunity browser" as a FREE feature and the
   sidebar shows the AI badge on it. Free users get the public page only.
8. **Dashboard Funding page filters** use category/region strings that do not
   exist in the data (`'All Provinces'`, `'Atlantic Provinces'`, category =
   funding_type), so most filters silently return nothing.
9. **No deadlines anywhere** → the deadline ladder (30/14/7/3/1) has nothing to
   run on; no `opens_at`, no intake status, no round history.
10. **No link-health automation**: the two link checks (2026-08-26, 2026-09-28)
    were done by hand and recorded in migrations.
11. **No provider entity**: funder is free text; 16 funders, no type
    (government / IFI / lender / nonprofit), no region, no directory flag.
12. **No admin funding management**, no review queue, no change events, no
    source snapshots, no outbound-click analytics, no broken-link report.
13. **Matching gaps**: no "closed / not yet open" state; `applicant_types` is
    empty on every row so organisation-only programmes (ABO, Ontario ICCGP,
    AIOC) can be matched to individual entrepreneurs; no "required documents".
14. **AI assistant has no funding grounding**; it can be asked about funding and
    answers from the model alone.
15. **Mobile app** reads `grants` directly and shows `verification_status`
    chips; any column rename would break it (additive changes only).

## Security / privacy observations

- RLS is correct on every user table checked (`auth.uid() = user_id`).
- `grants` has no write policy for any client role; all writes are migrations
  or service role. Keep it that way for publication.
- `match-funding-opportunities` sends territory, industry, stage, description,
  funding purpose and target amount to OpenAI (US). `/privacy` discloses this.
  `community_name` and `nation` are never sent. Do not widen.
- `grant_applications` policies are on role `public`; they still test
  `auth.uid()` so anon cannot read, but new tables should target
  `authenticated` explicitly.
- `data_requests` admin access was fixed in #249; `user_roles` still has no
  admin, so `/admin` is unreachable until one is granted.

## Tooling available for this work

Verified in session: Supabase MCP (SQL, migrations, logs), Vercel MCP (read;
env-var listing is 403 for this token), GitHub via `gh`, gstack headless
browser (`$B`) for reading funder pages (Aside not installed), GSC MCP,
vitest, no Playwright in the repo (`scripts/verify-authenticated-journey.mjs`
is a custom Node harness). WebFetch is blocked on this network for `.gc.ca`,
`.gov.*`, `bdc.ca`, `nacca.ca`.
