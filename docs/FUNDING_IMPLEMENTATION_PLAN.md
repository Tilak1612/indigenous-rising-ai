# Funding Navigator implementation plan

Branch `feat/funding-directory`. One PR per numbered slice when a slice is
independently shippable; otherwise one PR with ordered commits. Statuses are
tracked in `docs/FUNDING_PROGRESS.md`.

## Slice 1. Schema (additive)
Migration `20261026000001_funding_directory_schema.sql`
- `funding_providers` (slug, name, provider_type, region, website, is_directory, notes)
- `grants` += slug (unique, generated for existing rows), provider_id, apply_url,
  apply_link_type, application_method, program_category, intake_status,
  opens_at, closes_at (mirrors deadline), timezone, matching_funds_required,
  matching_funds_notes, eligible_expenses[], documents_required[],
  application_steps[], eligibility_exclusions, repayment_terms,
  entrepreneur_age_min/max, business_age_max_months, revenue_max,
  source_evidence jsonb, verification_confidence, schema_version, published_at,
  reviewer_notes.
- `funding_program_rounds`, `funding_verification_events`, `funding_link_checks`,
  `funding_review_queue`, `funding_link_reports`, `funding_outbound_clicks`.
- Admin RLS on `grants` (select all / insert / update) and the new tables;
  public select on rounds for published grants; anon insert on link reports
  (rate-limited by a trigger on count per hour) and on outbound clicks (counter
  table keyed by grant + day, no user id).
- `funding_saved_matches.status` CHECK extended additively with
  eligibility_review, preparing_documents, ready_to_apply, submitted_externally,
  under_review.
- Backfill: slugs, provider rows from `funder`, `apply_link_type = 'program_page'`
  where application_url = source_url, `'directory'`/`'contact'` where the
  2026-09-28 notes say no online application exists.

## Slice 2. Catalogue research + seed
Migration `20261026000002_funding_catalogue_2026_10.sql`: corrections to the 17
rows (links, link types, applicant types, evidence) and new rows inserted
**unpublished** (`is_published = false`, `verification_status = 'unverified'`
or `'needs_review'`), each with `source_evidence` quotes and the fetch date.
`docs/FUNDING_SOURCE_CATALOGUE.md` lists every source, what was read, and what
could not be read (bot-blocked).

## Slice 3. Public directory
- `src/lib/funding-links.ts`, `src/lib/funding-catalog.ts` (PostgREST query
  builder, URL ↔ filter state, status derivation, types).
- `PublicFunding.tsx`: search, multi-select province / type / stage / sector /
  applicant / identity, amount band, deadline, verified-only, accepting-only,
  pagination, result count, empty state, disclaimer, cards with the official
  link button labelled by type, Save (login required).
- `src/pages/FundingProgram.tsx` at `/funding/:slug` (DB-backed), sections per
  the brief, similar programmes, JSON-LD FinancialProduct, breadcrumbs.
- `src/pages/FundingRegion.tsx` for the 13 regions and 2 type pages.
- Route titles, prerender MARKETING entries (static) + dynamic programme and
  region routes, sitemap, footer links, homepage link.
- Delete the mock files.

## Slice 4. Edge functions
- `check-funding-links` (new) + cron weekly; `check-funding-freshness` cron
  daily (internal email only); `deploy-functions.yml` updated.
- `match-funding-opportunities`: applicant_types, intake status, five states,
  apply link in response, `not_assessed` list.
- `ai-assistant`: grounding block.

## Slice 5. Dashboard
- `/dashboard/funding` free; filters driven by real columns; link engine.
- Matches page: state badges, apply link type, next step.
- Saved matches: new stages, deadlines list (`/dashboard/funding/deadlines`).
- Readiness workspace: seed items from `documents_required`.

## Slice 6. Admin
- `src/components/admin/FundingManagement.tsx` tab in `/admin`.

## Slice 7. Tests, docs, release report
- vitest units + guards; `docs/FUNDING_TEST_PLAN.md`, `FUNDING_SECURITY.md`,
  `FUNDING_DEPLOYMENT.md`, `FUNDING_RELEASE_REPORT.md`.

## Deferred (documented, not started)
- Deadline reminder ladder emails (needs rounds with real dates).
- Application export to DOCX/PDF beyond the existing plan export.
- French interface.
- Supabase staging branch (owner decision; costs money).

## Release gates
typecheck, lint, vitest, build + prerender gate green; migration applied with
no published-row change; browser smoke on the Vercel preview; owner merges.
