# Funding directory test plan

| Area | Test | Where |
|---|---|---|
| Filter state ↔ URL | round trip, junk rejection, length cap | `src/__tests__/funding-catalog.test.ts` |
| PostgREST query | published-only, empty-array semantics, overlap vs in-list, operator escaping, deadline windows, verified/accepting flags | same |
| Status derivation | closed wins, passed deadline never open, days-left, rolling, unknown | same |
| Amount and type wording | no invented $0, "From", range, repayable contribution wording | same |
| Link engine | label per type, Apply only for forms, fallback to source, unsafe URLs refused, click RPC payload | `src/__tests__/funding-links.test.ts` |
| Freshness visible | card renders `formatFreshness`, amber for unverified, every page uses the card | `src/pages/__tests__/funding-freshness.test.ts` |
| Static HTML | inventory in `/funding`, ItemList, verification text, no invented amount | `src/__tests__/funding-crawlability.test.ts` |
| Titles | every prerendered route has a ≤ 60-char unique title | `seo-title-parity.test.ts` |
| Breadcrumb parity | prerender route names = component route names | `seo-schema-single-source.test.ts` |
| Internal links | every sitemap URL (incl. 17 programme + 15 region pages) linked from a prerendered page | `internal-linking.test.ts` |
| Prerender gate | 200+ words, distinct title/description per sitemap URL | `scripts/check-prerender.mjs` (CI) |
| RLS | anon/non-admin cannot write grants or read audit tables; unpublished rows hidden; click RPC counts; report trigger opens one review item | production SQL in a rolled-back transaction, 2026-10-26 (FUNDING_SECURITY.md) |

Browser smoke (gstack headless browser against the Vercel preview after the
PR is opened): `/funding` loads with 17 cards, filters change the URL and the
count, a region page lists regional then national programmes, a programme
page shows the typed official button and the evidence block, `/funding/<uuid>`
redirects to the slug.

Not covered yet: Deno unit tests for the edge functions (no Deno test runner
in CI), e-mail deadline ladder (not built), admin UI (slice 6).
