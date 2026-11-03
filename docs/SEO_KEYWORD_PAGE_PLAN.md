# Keyword and page plan: what shipped, what waits

Source: *Indigenous Rising: Competitors, Keywords and Page Plan* (OpenSEO
research, keyword panels October 2025 to September 2026). This file maps each
plan item to the page that now owns it, and records why some items were not
built yet. No traffic or ranking forecast is made here, matching the plan's own
limits.

## One owner per keyword cluster

| Cluster | Owner page | Notes |
|---|---|---|
| indigenous business grants, aboriginal business grants | `/funding/indigenous-business-grants` | Title now "Indigenous Business Grants and Contributions in Canada". `/guides/indigenous-business-grants` stays the navigation hub, the long blog guide stays the explainer. |
| indigenous business loans, small business loans | `/funding/indigenous-business-loans` | Title now "Indigenous Business Loans in Canada: Compare Lenders", distinct from the blog post "Indigenous Business Loans in Canada". |
| indigenous financial institutions (near me), indigenous lenders by province, nacca funding | `/indigenous-financial-institutions-directory` | New. 22 lenders from the catalogue, NACCA linked first as the full list. |
| business loan calculator | `/tools/business-loan-calculator` | New. User-entered rate only, zero-rate and ordinary amortization tested. |
| indigenous startup cost calculator, grant budget template canada, indigenous funding application budget | `/tools/startup-cost-calculator` and `/templates/funding-project-budget` | New. Calculator for working out the gap, spreadsheet for the application. |
| indigenous business grant matching funds, owner equity requirements | `/guides/indigenous-funding-equity-requirements` | New. Teaches terms and arithmetic. No lender ratio is asserted (see deferred). |
| indigenous business funding application rejected | `/guides/indigenous-funding-application-mistakes` | New. Neutral gaps, no invented rejection statistics. |
| one page business plan template | `/templates/one-page-business-plan` | New. |
| cash flow forecast template, indigenous business cash flow template | `/templates/cash-flow-forecast` | New. Working spreadsheet with formulas. |
| community impact statement business plan, indigenous business plan community impact | `/templates/community-impact-statement` | New. Evidence and projection kept apart. |
| indigenous business plan template, indigenous business plan example | `/indigenous-business-plan-template` | Refreshed: title, and a worked example for one fictional business that the four templates share. |
| indigenous business funding yukon / nwt, inuit business funding nunavut, province terms | `/funding/<province>` | Already owned by the 13 region pages, so no duplicate guides were added. |

Every new page is prerendered, in the sitemap and llms.txt, linked from the
footer's "Tools & templates" column, and linked in context from the region and
type pages ("Before you apply") and the plan template.

## Accuracy fixes from the plan

- The blog index and two posts claimed the directory searches "hundreds of
  programs", and one post claimed "we've worked with hundreds of Indigenous
  entrepreneurs". Both were unsupported and are replaced with what the directory
  actually does.
- Directory counts: the homepage finder counts programmes *accepting
  applications* and the directory counts *published* programmes. Both come from
  the same live table; they measure different things.

## Deliberately not built yet

| Plan item | Why it waits |
|---|---|
| Lender-specific equity ratios on the equity guide | The plan requires human review of each lender example. The guide links each lender instead. |
| `/guides/business-plan-funding` | Requires verifying each programme's business-plan support terms first. |
| Separate Yukon, NWT, Nunavut, New Brunswick, Nova Scotia guides | Region pages already exist at `/funding/<province>`. The plan says to split only with distinct local sources and search evidence. |
| Fundica and Upmetrics comparisons | P2, needs competitor feature verification. |
| French pages | Needs native-language validation and a localized product journey. |
| Blog refreshes for Alberta, BC, Ontario, women, Métis guides | Each needs programme-by-programme re-verification; titles were left alone to avoid colliding with the `/funding/<province>` owners. |
| More programme profiles (NRT, TACC, AIIC, NADF, Métis lenders) | 23 researched records are unpublished pending owner review in `/admin`. Publishing them adds their pages automatically. |

## Measurement

Track, per the plan: non-branded impressions and clicks for each owner page,
calculator and template usage, outbound clicks to funders and lenders, and
free account sign-ups from these pages. Record a Search Console baseline for
the new URLs in the first week after launch.
