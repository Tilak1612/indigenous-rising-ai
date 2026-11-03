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
| indigenous business grant matching funds, owner equity requirements | `/guides/indigenous-funding-equity-requirements` | Teaches terms and arithmetic, plus five lenders' published equity rules, approved by the owner on PR #275 and quoted from each lender's page. |
| indigenous business funding application rejected | `/guides/indigenous-funding-application-mistakes` | New. Neutral gaps, no invented rejection statistics. |
| one page business plan template | `/templates/one-page-business-plan` | New. |
| cash flow forecast template, indigenous business cash flow template | `/templates/cash-flow-forecast` | New. Working spreadsheet with formulas. |
| community impact statement business plan, indigenous business plan community impact | `/templates/community-impact-statement` | New. Evidence and projection kept apart. |
| indigenous business plan template, indigenous business plan example | `/indigenous-business-plan-template` | Refreshed: title, and a worked example for one fictional business that the four templates share. |
| subvention / financement entreprise autochtone, plan affaires entreprise autochtone | `/fr/financement-entreprise-autochtone`, `/fr/plan-affaires-entreprise-autochtone` | Published from the drafts on the owner's go-ahead, without native review yet. Both say the product itself is in English. |
| indigenous business plan funding, business plan grant indigenous | `/guides/business-plan-funding` | Six institutions' published terms, each quoted from its own page on 2 November 2026. States that 75 percent is not a general rule. |
| fundica alternative indigenous business, upmetrics alternative indigenous entrepreneurs | `/fundica-alternative`, `/upmetrics-alternative` | Added in the follow-up. Facts read from each competitor's own site on 2 November 2026; each page concedes where they are stronger first. |
| indigenous business funding yukon / nwt, inuit business funding nunavut, province terms | `/funding/<province>` | Already owned by the 13 region pages, so no duplicate guides were added. |
| indigenous business plan example | `/templates/indigenous-business-plan-examples` | Three fictional plans (services, tourism, retail) in the six sections. |
| indigenous community business funding vs entrepreneur grants | `/guides/choosing-funding-business-or-community` | Applicant-first decision guide quoting the AEP, CORP and LEDSP pages (3 Nov 2026). |
| indigenous business loan documents | `/guides/funding-document-checklist-by-lender` | Ten lenders' published document lists in a matrix and in their own words. |
| Yukon, NWT, Nunavut, New Brunswick, Nova Scotia local sources | `/funding/<province>` "Local lenders and supports" | Source-reviewed on 3 Nov 2026 and added to the region pages rather than as competing guides. |

AEO: each of the nine tools, templates and guides carries three or four visible questions and answers, emitted as FAQPage JSON-LD from the same module (`src/data/resourceFaqs.ts`).

Every new page is prerendered, in the sitemap and llms.txt, linked from the
footer's "Tools & templates" column, and linked in context from the region and
type pages ("Before you apply") and the plan template.

## P0 refreshes (3 November 2026)

| Plan item | What changed |
|---|---|
| Alberta, BC, Ontario, women and Métis guides | Rewritten programme by programme from each funder's own page, read 3 Nov 2026, with a visible Sources list (74 URLs, all returning 200). Each separates individual from community applicants. Removed programmes that do not exist as described (an "Alberta Indigenous Business Investment Fund", a PrairiesCan Indigenous women's programme, the Ontario loan guarantee described as a small-business guarantee, "BC Indian Business and Investment Council" services). Added IFI service-area tables, dated intake status, a Métis ID and residency table, and a women's comparison of grant shares by institution. |
| Funding checklist post | Print button with tick boxes, and each step links to the tool or official list that does it. |
| AEP and IESP programme pages | Each links to its how-to article and back. Futurpreneur re-read: "collateral-free", not "equity-free"; the IESP record, seed and every blog mention now match. |
| EDO page | Adds the live, free handouts (checklist, sample plans, document matrix, calculator). Roadmap section unchanged. |
| Blog index and posts | Cards and posts show "Reviewed <date>" only where a post was re-reviewed; dates no longer shift a day in Canadian time zones. The 2025 titles stay, because they are true for posts not yet reviewed. |
| BC rendering check | The prerendered page had 926 words in `<main>`; it renders. Separately, every post's numbered lists, bold text and leading bullets rendered as raw markdown; fixed in `src/lib/blogBlocks.ts`. |
| Search Console baseline | `docs/seo-reports/gsc-baseline-2026-11-03.md`. |

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
| Separate Yukon, NWT, Nunavut, New Brunswick, Nova Scotia guides | The source review is done, and its findings are on the region pages. A separate URL would compete with `/funding/<province>` for the same searches; split only if Search Console shows the region page failing a distinct query. |
| `/guides/indigenous-business-data-sovereignty-questions` | The privacy policy names OpenAI only for funding matching, while the member assistant (OpenAI) and site assistant (Anthropic) also process messages. The privacy wording must be updated by the owner first. |
| `/for-indigenous-business-advisors` | The plan says to build it only after advisor interviews show a need distinct from EDOs. |
| `/guides/funding-program-changes` | Needs an ongoing verification owner for a dated change log. |
| More programme profiles (NRT, TACC, AIIC, NADF, Métis lenders) | 23 researched records are unpublished pending owner review in `/admin`. Publishing them adds their pages automatically. |

## Measurement

Track, per the plan: non-branded impressions and clicks for each owner page,
calculator and template usage, outbound clicks to funders and lenders, and
free account sign-ups from these pages. Record a Search Console baseline for
the new URLs in the first week after launch.
