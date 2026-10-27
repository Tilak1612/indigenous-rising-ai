# Funding source health

How the catalogue is kept honest after publication.

## Verdicts from the weekly link check (`check-funding-links`)

| Verdict | When | Effect |
|---|---|---|
| `ok` | 2xx on the same URL | recorded only |
| `redirected` | 2xx after a redirect | recorded with `final_url`; a person decides whether to update the stored URL |
| `dead` | 404, 410, or DNS failure | `verification_status` → `needs_review`; review-queue item (`dead_link`, high); verification event. The public page shows "an automated check flagged a link on this record" |
| `blocked` | 401, 403, 429, 503, or timeout | recorded only. Government and Cloudflare-fronted sites block automated reads; this is not evidence the page is gone |
| `error` | anything else | recorded only |

A passed `deadline` on a row still marked `open` sets `intake_status` to
`closed` and opens a `deadline_passed` review item.

The checker never sets `verified`, never publishes or unpublishes, and never
changes a URL. It runs Mondays 09:15 UTC (`funding-link-check-weekly`), one
request per URL with a 1.5 s pause and a descriptive User-Agent, at most 80
URLs per run.

## Freshness

`sendable_grants` only includes rows that are `verified`, read within 90
days and carry a source URL. The weekly digest reads nothing else. The public
pages show "Details last verified <date>" or "Details not yet verified" on
every card. `check-funding-freshness` counts stale rows and can email the
team daily; it is deployed but unscheduled (owner decision; see
FUNDING_DEPLOYMENT.md).

## Review queue reasons

`dead_link`, `blocked_link`, `deadline_passed`, `source_changed`,
`user_report` (from the public "Report a problem" form, one open item per
programme per day), `new_record` (every row inserted by research), `needs_terms_check`, `other`.

## What "verified" means

A person has read the funder's page, confirmed the material fields (type,
amount, eligibility, intake, apply link) and set `verification_status =
'verified'` in `/admin`. `last_verified` records when the page was last read
(by a person or by research); `verification_confidence` records how much of
the record is supported by quoted evidence (`high` = every material field is
quoted; `medium` = description and link confirmed, some fields missing from the
source; `low` = home page only).
