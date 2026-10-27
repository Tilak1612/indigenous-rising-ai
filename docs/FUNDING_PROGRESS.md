# Funding Navigator progress

Statuses: Not Started · In Progress · Implemented · Tested · Verified · Blocked · Deployed.
Evidence is recorded before an item is marked Verified.

| Item | Status | Evidence |
|---|---|---|
| Phase 0 audit (`FUNDING_AUDIT.md`, `FUNDING_GAP_ANALYSIS.md`, plan) | Verified | counts from production SQL, 2026-10-26 |
| Slice 1 schema migration | Deployed | applied to production 2026-10-26; RLS checks in `FUNDING_SECURITY.md` |
| Slice 2 catalogue research + seed | Deployed | 56 source reads logged in `FUNDING_SOURCE_CATALOGUE.md`; 35 providers, 17 corrected, 21 new unpublished rows |
| Slice 3 public directory, programme and region pages | Tested | vitest 100 files / 970 tests; build + prerender gate green (123 routes, 119 sitemap URLs); awaiting preview smoke |
| Slice 4 edge functions (link checker, matcher states, grounded assistant) | Implemented | deploys on merge via `deploy-functions.yml`; no Deno runner in CI |
| Slice 5 dashboard (free browse, deadlines, states, stages, readiness seeding) | Implemented | tsc/lint clean on changed files |
| Slice 6 admin Funding tab | Implemented | needs an admin role to exercise |
| Slice 7 tests + docs | Implemented | this folder |
| Weekly link check cron (migration 3) | Blocked | apply after `check-funding-links` is deployed (post-merge) |
| Publication of the 21 new records | Blocked | owner review in `/admin` |
| Production deploy | Blocked | owner merges PR #266 (`main` auto-deploys) |
| Deadline reminder emails, DOCX export, French | Not Started | roadmap |
