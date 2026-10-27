# Funding dashboard

| Route | Tier | What changed |
|---|---|---|
| `/dashboard/funding` | free | Was paywalled with fabricated stats ("$2.1M available", "85% avg match score") and filters on non-existent values. Now the same catalogue, filters and cards as the public directory, with Save for Growth and above. |
| `/dashboard/funding/matches` | free (3/month), Growth (50) | Cards show the rules-based state (Potential match / Needs more information / Likely ineligible / Not yet open / Closed), the next step, the documents the funder lists, a Details link to the programme page and the typed official button. |
| `/dashboard/funding/saved` | Growth | Stage list is the superset: interested, checking eligibility, preparing documents, ready to apply, applied, submitted on the funder's site, under review, pending, awarded, declined, withdrawn. Stages are the user's own report. |
| `/dashboard/funding/deadlines` | free (new) | Saved programmes with closing dates (soonest first), the user's funding tasks, saved rolling programmes, and every dated intake in the directory. |
| `/dashboard/funding/readiness/<grantId>` | Growth | The missing-info stage can seed its checklist from the funder's `documents_required` list in one click. |
| `/dashboard/documents`, `/dashboard/tasks`, `/dashboard/plan` | unchanged | linked from programme pages and the deadlines view |

Not built (documented as roadmap): email deadline ladder (30/14/7/3/1 days),
application export beyond the existing plan export, cohort or peer features.
