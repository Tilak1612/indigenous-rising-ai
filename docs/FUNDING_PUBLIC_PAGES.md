# Funding public pages

| Route | Page | Source of truth |
|---|---|---|
| `/funding` | Directory: search, multi-select filters (province, type, applicant, identity, stage, purpose, sector, amount band, deadline window, verified-only, accepting-only), URL state, 12 per page, A–Z index, region/type links, disclaimer | `src/pages/PublicFunding.tsx`, `src/lib/funding-catalog.ts` |
| `/funding/<slug>` | Programme page: overview, who may / may not qualify, amount and terms, eligible expenses, how to apply, documents, deadline, source + quoted evidence, report a problem, similar programmes, Save (Growth) | `src/pages/FundingProgram.tsx` |
| `/funding/<province-slug>` (13) | Regional then national programmes for one province or territory | `src/pages/FundingRegion.tsx` |
| `/funding/indigenous-business-loans`, `/funding/indigenous-business-grants` | Type pages | same |
| `/funding/<uuid>` | Redirects old links to the slug | `src/pages/FundingSlug.tsx` |
| `/funding/alerts`, `/confirm`, `/unsubscribe` | unchanged | |

## Cards (`FundingProgramCard`)
Type badge (contribution repayability spelled out), intake badge (closes
date + days left, rolling, closed, unknown), name linking to the programme
page, funder, description, amount ("Amount not published" when the funder
publishes none), region, who-may-qualify line (identity, applicant type, age,
ownership), freshness line (amber when unverified), View details, and the one
official button whose label follows `apply_link_type`.

## Official link labels
`application_form` → Apply on the official website · `application_instructions`
→ Read the application instructions · `program_page` → View the official
program page · `directory` → Find your local Indigenous lender · `contact` →
Contact the funding organization. No other label exists; a missing or unsafe
URL renders a notice instead of a button.

## Static HTML
`scripts/prerender.mjs` fetches the published rows with the full column list,
seeds `globalThis.__IR_FUNDING__`, and renders every page with real content;
programme pages carry FinancialProduct + WebPage + BreadcrumbList JSON-LD. All
32 funding URLs are in the sitemap, `llms.txt` and the IndexNow manifest.
Titles come from `src/data/routeTitles.ts` (region/type pages) or
`programPageTitle()` (programmes), all ≤ 60 characters.

## Disclaimers
Shown on the directory, every programme page and the region pages:
Indigenous Rising AI is independent of every funder and of government, does
not administer programmes, does not take applications, and nothing shown is
an eligibility decision.
