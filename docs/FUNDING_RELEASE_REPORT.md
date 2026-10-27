# Funding Navigator release report (2026-10-26)

Scope delivered on branch `feat/funding-directory` (PR #266). Counts are
from the production database and the branch build on 2026-10-26/27.

## Blocking finding outside this scope
Production (deployment `a58114d`, 2026-10-25) throws `Cannot access 'O'
before initialization` in the `form-vendor` chunk and React never mounts:
sign-in, signup, the dashboard and every client-side route are dead on the
live site. Cause: a chunk cycle created when `@sentry/react` (#250) matched
the react-vendor rule. Fix: PR #267 (own `sentry-vendor` chunk, exact react
matcher, CI chunk-cycle gate), verified in a real browser. **Merge #267
first.** PR #266 carries the same fix so its preview mounts.

## Public pages implemented
`/funding` (filters, search, URL state, pagination, A–Z index), 17
`/funding/<slug>` programme pages, 13 province/territory pages, 2 type pages
(loans, grants), legacy `/funding/<uuid>` redirect. All prerendered: 123
static routes, sitemap 86 → 119 URLs, every page ≥ 200 words with a distinct
title and description.

## Dashboard pages implemented
`/dashboard/funding` (free browse, real filters, Save on Growth; fabricated
stats removed), `/dashboard/funding/matches` (five rules-based states, next
step, documents, typed official link), `/dashboard/funding/saved` (11-stage
superset), `/dashboard/funding/deadlines` (new), readiness workspace seeding
from the funder's document list.

## Existing modules reused
`grants` table and RLS, `funding_saved_matches`, `funding_applications` +
readiness items, `tasks`, `documents`, `grant_alerts_subscribers` + digest,
`match-funding-opportunities`, `ai-assistant`, `check-funding-freshness`,
prerender + sitemap + llms.txt + IndexNow pipeline, GA4 events, admin role.

## Database
New entities: `funding_providers`, `funding_program_rounds`,
`funding_verification_events`, `funding_link_checks`, `funding_review_queue`,
`funding_link_reports`, `funding_outbound_clicks`; 26 new columns on `grants`;
`record_funding_click()` RPC; report rate-limit trigger. Migrations
`20261026000001` and `20261026000002` applied to production; `20261026000003`
(weekly link-check cron) to apply after merge.

## Catalogue
| Measure | Before | After |
|---|---|---|
| Programme records | 17 | 40 (17 published, 23 unpublished awaiting review) |
| Providers (typed, with region) | 0 | 35 |
| Published rows linked to a provider | 0 | 17 of 17 |
| Published rows with a typed official link | 0 | 17 (directory 2, application instructions 3, contact 5, programme page 7) |
| Published rows with quoted source evidence | 0 | 12 |
| Rows re-read on 2026-10-26 | 0 | 12 published + 21 new |
| Dead links on published rows | 2 | 0 (Ontario IEDF and däna Näye repaired) |
| Rows `verified` | 0 | 0 (human sign-off, now possible in /admin) |
| Rounds recorded | 0 | 2 (Ontario IEDF 2025 streams, closed) |
| Review-queue items | 0 | 23 open (`new_record`) |
| Provinces/territories with a region page | 0 | 13 |

Sources read: 56 (see `FUNDING_SOURCE_CATALOGUE.md`); blocked or dead: 7
(CanExport, ITAC, Nunavut SBSP, NBCC, CanNor, AIIC SEAP page, Apeetogosan);
wrong domain found: 1 (BBDC); misspelled domain fixed: 1.

## Official links checked
All 17 published source and apply URLs were opened on 2026-10-26; 3 remain
`needs_review` because the host blocks automated reads (not because the
page is gone). The weekly checker takes over after merge.

## Edge functions
`check-funding-links` (new), `match-funding-opportunities` (applicant type,
business age, five states, next step, typed link), `ai-assistant` (grounded
in up to 8 verified records for the user's territory with source URLs).
Deployed on merge by `deploy-functions.yml`. No Deno unit tests (no runner
in CI); logic documented in `FUNDING_ELIGIBILITY_ENGINE.md`.

## Admin
`/admin` → Funding: catalogue table and editor, publish/unpublish, mark
verified (note required), review queue, link checks, reports, click counts.
Needs an `admin` row in `user_roles` (none exists yet; SQL in #249).

## Tests
- vitest: 100 files / 970 tests passing on the branch after the public
  pages (final run after the dashboard commit recorded in the PR).
- New: `funding-catalog.test.ts` (23), `funding-links.test.ts` (12),
  rewritten `Funding.render.test.tsx` (8); guards updated for freshness,
  crawlability, constraint transcripts, viewport parity.
- Build + `check-prerender` + `check-chunk-cycles` green.
- Production RLS checks (rolled back): non-admin cannot write grants or
  read audit tables; unpublished rows hidden; click RPC and report trigger
  behave.
- Browser smoke on the Vercel preview: `/funding` renders 17 cards with
  typed buttons and freshness lines, region page shows regional then national
  programmes, programme page shows evidence block and report form. Client
  interactions could not be verified on the preview until #267 lands
  (the preview inherits the production chunk cycle); the rebuilt preview
  will be re-checked.

## Email, analytics, deployment
- Weekly digest unchanged (still gated on `verified`); deadline reminder
  ladder not built (no dated intakes yet).
- GA4 events: `funding_official_link_click`; aggregate click counters in
  the database.
- No production deploy performed (owner merges `main`).

## Unresolved blockers (owner)
1. Merge #267 (production outage), then #266.
2. Apply `20261026000003` after the function deploys.
3. Grant an admin role; review and publish the 21 new records.
4. Decide on the daily stale-catalogue email schedule.
5. Second research pass for Quebec, Atlantic, Inuit regions and sector
   programmes (list in `FUNDING_SOURCE_CATALOGUE.md`).
