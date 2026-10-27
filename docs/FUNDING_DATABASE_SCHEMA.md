# Funding database schema

Additive extension of the original `grants` table (migrations
`20261026000001`, `20261026000002`, `20261026000003`). Existing columns and
the public read policy are unchanged.

## `grants` (programme records)

| Column | Type | Notes |
|---|---|---|
| `slug` | text, unique, not null | canonical URL `/funding/<slug>`; generated from the name |
| `provider_id` | uuid → `funding_providers` | |
| `apply_url` | text | most specific verified destination; null = no online application |
| `apply_link_type` | `application_form` · `application_instructions` · `program_page` · `directory` · `contact` | decides the button label |
| `application_method` | `online` · `email` · `through_lender` · `contact` · `referral` · `unknown` | |
| `program_category` | text[] | purposes (startup, expansion, …) |
| `intake_status` | `open` · `rolling` · `closed` · `not_yet_open` · `unknown` | |
| `opens_at` / `deadline` | date | current intake; history in rounds |
| `intake_timezone` | text | default America/Toronto |
| `matching_funds_required` / `matching_funds_notes` | bool / text | |
| `eligible_expenses`, `documents_required`, `application_steps` | text[] | |
| `eligibility_exclusions`, `repayment_terms` | text | |
| `entrepreneur_age_min/max`, `business_age_max_months`, `revenue_max` | numbers | structured rules the matcher evaluates |
| `source_evidence` | jsonb `[{field, quote, url, fetched_at}]` | shown on the detail page |
| `verification_confidence` | `high` · `medium` · `low` · `none` | |
| `schema_version` | smallint (2) | |
| `published_at` | timestamptz | |
| `funding_type` | now also allows `contribution` and `equity` | |

Pre-existing: name, funder, description, amount_min/max, amount_currency,
is_recurring, recurrence_notes, provinces[], industries[], business_stages[],
applicant_types[], identity_criteria[], ownership_min_pct, eligibility_notes,
application_url, source_url, source_published_date, is_published,
last_verified, verification_status, verified_by, verification_notes.

## New tables

- `funding_providers` (slug, name, provider_type, regions[], website, is_directory, notes): public read, admin write.
- `funding_program_rounds` (grant_id, label, opens_at, closes_at, status, source_url, evidence): public read for published grants, admin write.
- `funding_verification_events` (grant_id, event_type, actor, summary, details): admin read, admin/service insert.
- `funding_link_checks` (grant_id, kind, url, status_code, final_url, ok, verdict, error): admin read, service write.
- `funding_review_queue` (grant_id, reason, severity, payload, status, resolved_by, resolution): admin all.
- `funding_link_reports` (grant_id, url, message): anon/auth insert on published grants only, guarded to 10/grant/hour and 100/hour; admin read.
- `funding_outbound_clicks` (grant_id, day, link_kind, clicks): counters only, written through `record_funding_click(uuid, text)`; admin read.
- `funding_saved_matches.status` now also allows `eligibility_review`, `preparing_documents`, `ready_to_apply`, `submitted_externally`, `under_review`; plus `external_reference` and `applied_at`.

## Policies added on `grants`

Admins (`has_role(auth.uid(),'admin')`) may select all rows, insert and update.
No delete policy: retire with `verification_status = 'retired'` and
`is_published = false`.

## Cron

`funding-link-check-weekly` (Mon 09:15 UTC) → `check-funding-links`.
Existing: `funding-digest-friday`, `account-deletion-purge-daily`.
