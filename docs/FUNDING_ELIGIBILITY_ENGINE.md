# Eligibility engine

`supabase/functions/match-funding-opportunities` computes eligibility in code.
The model (gpt-4o-mini) only writes a fit score and one sentence for records
the rules allow, and only on paid tiers.

## Criteria (one per dimension the record actually states)

| Criterion | Profile field | Status rule |
|---|---|---|
| Province / territory | `territory` | met if the code is in `provinces` (omitted when the programme is national) |
| Sector | `industry` | met if in `industries` (omitted when empty) |
| Business stage | `business_stage` | met if in `business_stages` |
| Identity | `indigenous_identity` | `prefer_not_to_say` and `multiple` are **unknown**, never unmet |
| Applicant type | `entity_type` | sole proprietorship / partnership / corporation / co-op → individual or business; nation-owned / development corporation → community-owned business, community, organization; non-profit → not-for-profit, organization; null → unknown |
| Business age | `year_founded` | months operating (counted from 1 July of that year) ≤ `business_age_max_months` |
| Entrepreneur age | none | always **unknown**: the profile does not hold a date of birth and should not |
| Ownership | `indigenous_ownership_pct` | ≥ `ownership_min_pct` |

## States

| State | Rule |
|---|---|
| `closed` | `intake_status = closed` or `deadline` in the past (also excluded from the shortlist) |
| `not_yet_open` | `intake_status = not_yet_open` |
| `likely_ineligible` | any criterion unmet |
| `needs_more_information` | no unmet, at least one unknown |
| `potential_match` | every stated criterion met |

Results are ordered by state first, fit score second. Every response carries
`criteria`, `state`, `next_step`, `not_assessed`, the canonical `slug`, the
typed official link (`apply_url`, `apply_link_type`, `source_url`),
`intake_status` and `documents_required` on every tier. Fit score and the
model sentence remain paid-tier fields. No numeric eligibility probability is
ever shown.

Quotas and rate limits are unchanged: free 3 runs/month (top 5), growth 50
(top 20), pro and enterprise unlimited, 3 runs/minute, 24 h cache keyed on a
hash of the profile fields that matter.
