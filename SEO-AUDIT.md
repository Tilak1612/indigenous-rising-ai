# SEO, AEO, GEO and AI Search Audit — indigenousrising.ai

**Date:** 16 September 2026 (supersedes the 15 September pass; that version is in this file's git history)
**Scope:** traditional search (Google, Bing, Yahoo, DuckDuckGo), AI answer engines (ChatGPT Search, Copilot, Claude, Perplexity, Gemini), structured data, entity clarity, crawler access, analytics attribution, conversion measurement.
**Method:** every finding was measured against production, the build output, or vendor documentation before being changed, then re-measured on production after deploy. Anything not measured is labelled as an assumption. Nothing in this document is a ranking or AI-inclusion guarantee.

---

## Contents

1. [Summary](#1-summary)
2. [Initial problems found](#2-initial-problems-found)
3. [Changes implemented](#3-changes-implemented)
4. [Technical SEO status](#4-technical-seo-status)
5. [Google readiness](#5-google-readiness)
6. [Bing and Microsoft readiness](#6-bing-and-microsoft-readiness)
7. [ChatGPT Search readiness](#7-chatgpt-search-readiness)
8. [AI crawler access status](#8-ai-crawler-access-status)
9. [Schema implementation](#9-schema-implementation)
10. [Keyword-to-page map](#10-keyword-to-page-map)
11. [Conversational query map](#11-conversational-query-map)
12. [Entity map](#12-entity-map)
13. [Internal linking strategy](#13-internal-linking-strategy)
14. [Content gaps](#14-content-gaps)
15. [Local, SaaS and ecommerce SEO status](#15-local-saas-and-ecommerce-seo-status)
16. [AEO opportunities](#16-aeo-opportunities)
17. [GEO and AI visibility opportunities](#17-geo-and-ai-visibility-opportunities)
18. [AI visibility monitoring](#18-ai-visibility-monitoring)
19. [Analytics and conversion measurement](#19-analytics-and-conversion-measurement)
20. [Remaining technical issues](#20-remaining-technical-issues)
21. [Owner decisions and actions](#21-owner-decisions-and-actions)
22. [30 / 60 / 90-day plan](#22-30--60--90-day-plan)
23. [Regression guards](#23-regression-guards)
24. [Honest limitations](#24-honest-limitations)

---

## 1. Summary

**What the business is.** Indigenous Rising AI is a web platform that helps First Nations, Inuit and Métis entrepreneurs in Canada find funding, build a business plan and access business training, designed around OCAP® principles with data stored in Canada. National SaaS; no physical location. Plans: Free $0, Growth $49/mo, Professional $149/mo (CAD), Nations & Organizations custom.

**Where it started.** The 15 September pass had already fixed the foundations: real 404s, a robots.txt that applied to Google, FAQ answers in the HTML, one title and one head-tag owner per route, single-copy structured data, a 72-URL sitemap. This pass found that several things *looked* correct and were not.

**What this pass found and fixed — 12 pull requests, all merged, all verified on production:**

| PR | Fix |
|---|---|
| [#199](https://github.com/Tilak1612/indigenous-rising-ai/pull/199) | **7 conversion events never reached GA4** — they imported a stub that wrote to localStorage and sent nothing; two tests certified the stub's queue as "records analytics" |
| [#200](https://github.com/Tilak1612/indigenous-rising-ai/pull/200) | **Analytics ignored the cookie banner**, and consent could not be withdrawn (the settings button cleared a key nothing read) — Consent Mode v2 now honours the choice |
| [#201](https://github.com/Tilak1612/indigenous-rising-ai/pull/201) | **robots.txt let OAI-SearchBot, ChatGPT-User and PerplexityBot crawl tokenised `/unsubscribe` and `/funding/confirm` links** |
| [#202](https://github.com/Tilak1612/indigenous-rising-ai/pull/202) | Nations plan advertised unbuilt "Unlimited business entities" ✓ while the table below said Planned |
| [#203](https://github.com/Tilak1612/indigenous-rising-ai/pull/203) | Factual entity definition; `featureList` derived from live plans; homepage no longer promises "manage your growth" (module is Coming soon) |
| [#204](https://github.com/Tilak1612/indigenous-rising-ai/pull/204) | `/llms.txt`, generated from the sitemap, plans and entity facts |
| [#205](https://github.com/Tilak1612/indigenous-rising-ai/pull/205) | `/impact` and `/success-stories` descriptions promised more than the pages deliver; `WebPage` schema given one owner; dead schema exports with false claims deleted |
| [#206](https://github.com/Tilak1612/indigenous-rising-ai/pull/206) | IndexNow for Bing and partners |
| [#207](https://github.com/Tilak1612/indigenous-rising-ai/pull/207) | Sessions and conversions attributed to AI assistants and search engines |
| [#208](https://github.com/Tilak1612/indigenous-rising-ai/pull/208) | **Every landing counted two page views** (measured: 2 `page_view` hits per load) |
| [#209](https://github.com/Tilak1612/indigenous-rising-ai/pull/209) | **Production `/faq` served a NUL byte** — a React 18.3.1 streaming bug; stripped, and CI now fails on any NUL |
| [#210](https://github.com/Tilak1612/indigenous-rising-ai/pull/210) | IndexNow state never persisted, so the first three deploys resubmitted all 72 URLs — fixed |

**Production state after deploy (measured 16 Sep, all 72 sitemap URLs):** every URL 200 · one canonical and one description each · 0 noindex in the sitemap · 0 pages with NUL bytes · 0 duplicate schema types on any page · 21/21 marketing pages have a `WebPage` node matching their meta description · consent default and single page-view config on every page · robots.txt, llms.txt, IndexNow key and manifest served · unknown URLs return 404.

**Tests:** 540 passing across 68 files. Every new assertion was mutation-tested (a deliberate regression was introduced and confirmed to fail it). Four guards initially passed vacuously and were strengthened — see §23.

---

## 2. Initial problems found

Severity: **Critical** blocks indexing, leaks private URLs, breaks legal promises, or corrupts measurement. **High** misleads users or engines. **Medium** is an optimisation.

### Critical

| # | Problem | Evidence |
|---|---|---|
| C1 | **AI answer engines were allowed into tokenised private links.** Under RFC 9309 a crawler obeys only the group naming it. The `OAI-SearchBot`, `ChatGPT-User` and `PerplexityBot` groups carried a shorter hand-copied Disallow list, so they could fetch `/unsubscribe?token=…`, `/funding/confirm?token=…`, `/funding/unsubscribe?token=…` and `/onboarding` | RFC 9309 resolver run against the live file: *"OAI-SearchBot may fetch private /unsubscribe?token=abc"* |
| C2 | **Analytics ignored the cookie choice.** `/cookies` says analytics cookies "Require your consent". GA4 loaded unconditionally with no Consent Mode; "Essential Only" was stored and never read | `index.html`, `CookieConsent.tsx` |
| C3 | **Consent could not be withdrawn.** "Manage Cookie Settings" removed `cookieConsent`; the banner reads `cookie-consent` | `CookiePolicy.tsx` line 427 |
| C4 | **The organic conversion funnel was empty.** `signup_cta_click`, `pricing_plan_selected`, `form_start`, `form_submitted`, `funding_application_started`, `impact_log_submitted`, `training_continue` all imported `src/lib/analytics.ts` — a stub ("Placeholder: in production POST…") | source; tests mocked the stub |
| C5 | **Landing page views double-counted.** `send_page_view: true` plus a manual `page_view` on mount | production: 2 `page_view` collect hits for one load of `/pricing`; an in-app navigation sent 1 |

### High

| # | Problem | Evidence |
|---|---|---|
| H1 | **NUL byte in production HTML.** `/faq` footer served `OCAP\0®`. Cause: React 18.3.1 `writeStringChunk` flushes its whole 2048-byte buffer when a multi-byte character does not fit, leaving a zero byte before it. Tools and crawlers can treat such a page as binary — `grep` did | production `/faq`: 1 NUL; reproduced in a test |
| H2 | **Structured data and snippets claimed unbuilt capabilities.** Homepage hero, meta, og and twitter descriptions: "…and manage your growth" while Growth & Data Tools reads Coming soon. Nations card: "Unlimited business entities ✓" | `LandingV2.tsx`, `prerender.mjs`, `plans.ts` |
| H3 | **Snippets promised what pages don't deliver.** `/impact`: "Track and report the community impact of your business" on a page stating nothing tracks impact yet. `/success-stories`: "Stories … shared with permission" for examples the page labels illustrative | prerender route descriptions vs page copy |
| H4 | **`WebPage` schema had three authors.** Injected client-side from each component's description prop (different from the meta description on every page), defaulting to "harmonizing traditional knowledge with modern business tools"; `/pricing` hand-typed a third | `MetaTags.tsx`, `StructuredData.tsx`, `Pricing.tsx` |
| H5 | **Dead schema one import from shipping.** Unused exports described a "Business analytics dashboard" (unbuilt) and "Grant tracking system" | `StructuredData.tsx` |
| H6 | Organization description made a claim about traditional knowledge the product cannot support, and that the site assistant is instructed never to make | `index.html` |

### Medium

| # | Problem |
|---|---|
| M1 | No `llms.txt` (optional; see §17 for what it is and is not) |
| M2 | No IndexNow — Bing, whose index Copilot draws on, learned about changes only by recrawling |
| M3 | No way to attribute sessions or conversions to AI assistants; GA4 files them under generic referral |
| M4 | Answer-engine tokens documented by vendors today (`Claude-SearchBot`, `Claude-User`, `Perplexity-User`, `DuckAssistBot`) were not named in the policy (allowed via `*`, but unstated) |
| M5 | `SoftwareApplication` had no `featureList` or `audience`, so machines had to infer what the product does and for whom |
| M6 | Several blog posts are linked only from the blog index (§13) |

### Problems I introduced during this pass, caught and fixed

Recorded because they show where the process is weak:

- **#199** first deleted the stub while three **dynamic** `import('@/lib/analytics')` calls still used it — my search matched only static imports. Would have failed `vite build`. The local run reported "2 test files failed | 438 passed" and I pushed without gating on it. Fixed before merge.
- **#206** used `actions/cache` for IndexNow state. It does not work on `deployment_status` events, so **216 URL submissions** went to Bing across three deploys (all HTTP 200). Found by reading production run logs; fixed in #210.
- A description with an apostrophe broke `prerender.mjs` syntax; a guard matched its own explanatory comment; a mutation broke file syntax and reported "no tests" instead of a failure. All caught before commit.

---

## 3. Changes implemented

### Crawler policy (#201)
Every answer-engine group repeats the full private Disallow list. Named retrieval tokens: `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `DuckAssistBot`. Search engines have no named group, so they follow `*`. **Training policy unchanged**: `GPTBot`, `Google-Extended`, `CCBot`, `anthropic-ai`, `ClaudeBot` stay `Disallow: /`.

### Consent and analytics (#199, #200, #207, #208)
- Consent Mode v2 defaults in `index.html` before `gtag('config')`: storage **denied** unless the stored choice opted in. GA4 still receives cookieless pings, so analytics is kept, not removed.
- `src/lib/cookie-consent.ts` owns the key, the mapping, `consent update`, and expiring existing `_ga` cookies on refusal. The banner saves through it; `/cookies` withdraws through it.
- All 7 dead events now call the gtag sender. The stub is deleted and its localStorage queue cleared from visitors' browsers.
- Every event carries `traffic_source` and `traffic_medium`; `ai_referral` fires once per session for AI-assistant arrivals. Only the classification is stored, never the referrer URL.
- `send_page_view: false`: one page view per landing.

### Entity and structured data (#202, #203, #205)
- One product definition (`src/data/entityFacts.ts`) used by the Organization node and `llms.txt`.
- `SoftwareApplication` gains `featureList` **derived from `plans.ts`** (only rows marked available on Free and Growth), `audience` (`BusinessAudience`), `isAccessibleForFree`.
- `WebPage` written by the prerender for every indexable marketing route from the same title and clipped description as the meta tags; client-side copy removed.
- Roadmap claims removed from hero, meta, og, twitter, Nations card, `/impact` and `/success-stories` descriptions. Guards tie each phrase to the module's `live` flag.

### Discovery (#204, #206, #210)
- `/llms.txt` generated at build from sitemap entries (indexable only), `plans.ts` and entity facts: definition, audience, funding disclaimer, OCAP® trademark notice in the site's existing wording, plans, available today, planned, pages, guides, contact and crawling policy.
- IndexNow: the build writes `indexnow-manifest.json` (content hash per URL, ignoring scripts and asset names; verified identical across clean builds); on each successful **Production** deploy a workflow submits only added, changed and removed URLs. State is a workflow artifact; missing state records a baseline and submits nothing.

### Rendering integrity (#209)
`src/lib/render-stream.ts` strips NUL bytes from server-rendered HTML; `check-prerender.mjs` (CI) fails any page containing one. A test reproduces the React bug and fails if a React upgrade fixes it, so the workaround can be removed.

---

## 4. Technical SEO status

Measured on production, 16 September 2026, all 72 sitemap URLs.

| Area | Status |
|---|---|
| Crawlability | ✅ robots.txt identical to repo; public pages allowed; private and tokenised paths blocked for every non-training bot (resolver-tested) |
| Indexability | ✅ 72 sitemap URLs, all 200, none `noindex`; `/auth`, `/signup`, `/track-request` `noindex` and absent from sitemap |
| Canonicals | ✅ exactly one self-referencing canonical per page, `www` host |
| Status codes | ✅ unknown URLs 404; apex → `www` 308; `http` apex takes two hops (Vercel TLS upgrade, cannot be collapsed) |
| Redirects | ✅ legacy aliases and trailing slashes 308 (from 15 Sep pass) |
| Titles / descriptions | ✅ one each, distinct, ≤60 chars titles, sentence-complete descriptions (CI `check-prerender`) |
| Headings | ✅ one H1, no skipped levels (15 Sep pass, guarded) |
| JavaScript rendering | ✅ every sitemap URL ships ≥200 words of non-JS content (CI); FAQ answers in HTML |
| HTML integrity | ✅ 0 NUL bytes (was 1 on `/faq`); CI-enforced |
| Structured data | ✅ parses on all 72 pages; 0 duplicate types per page (§9) |
| hreflang | ✅ correctly absent — single-language site; add only when real French pages exist |
| Pagination / faceted navigation | N/A — no paginated or filtered public listings are indexable |
| Image SEO | ✅ AVIF/WebP with fallbacks, dimensions set, lazy below the fold (15 Sep pass) |
| Core Web Vitals | ✅ lab: TTFB 22 ms, FCP ~240 ms, CLS 0 (15 Sep). **Lighthouse and field INP not measured** |
| Mobile | ✅ no horizontal overflow at 320–1920px (earlier sweep) |
| Security headers | ✅ CSP, HSTS present (unchanged) |

---

## 5. Google readiness

| Requirement | Status |
|---|---|
| Googlebot access | ✅ follows `*`; public pages allowed. Edge probe with Googlebot UA: 200, full content (not proof real Googlebot passes — see §8) |
| Search Console verification | ✅ preserved: `google-site-verification` meta tag and `googleeec1cfed4e1b49f9.html` untouched |
| Sitemap | ✅ `/sitemap.xml`, 72 canonical indexable URLs, referenced in robots.txt |
| Structured data | ✅ Organization, WebSite (site name), SoftwareApplication, WebPage, BreadcrumbList, BlogPosting, FAQPage |
| AI Overviews / AI Mode | ✅ governed by Googlebot and snippet controls. No special files required, per Google. `Google-Extended` blocking does **not** affect them |
| Gemini app grounding | ⚠️ **opted out** — `Google-Extended` is blocked, which Google documents as covering grounding in the Gemini app and Vertex AI. Owner decision (§21) |
| Helpful content | ✅ snippets and schema no longer claim unbuilt features |
| Rich results | FAQ rich results were retired in Search (May 2026); FAQPage kept for machine-readability only. HowTo deprecated; not used |

**Needs your access:** submit the sitemap in Search Console; URL-inspect `/`, `/faq`, one blog post; check the site name; watch Core Web Vitals field data.

---

## 6. Bing and Microsoft readiness

| Requirement | Status |
|---|---|
| Bingbot access | ✅ follows `*`; edge probe with bingbot UA: 200, full content |
| Sitemap | ✅ same 72 URLs |
| IndexNow | ✅ live. Key file served; Bing returned **HTTP 200**. After #210, production logged *"recorded a baseline of 72 URLs, submitted nothing"* and saved the state artifact; the next deploy should restore it and submit only changed URLs |
| Copilot | Copilot answers are widely reported to draw on the Bing index (Microsoft documentation not confirmed). Bing's `NOCACHE`/`NOARCHIVE` controls are not used, so content is eligible |
| Bing Webmaster Tools | ❌ not verified — no `BingSiteAuth.xml` or `msvalidate.01`. Fastest route: import the site from Google Search Console |

---

## 7. ChatGPT Search readiness

| Check | Status |
|---|---|
| `OAI-SearchBot` (ChatGPT search results) | ✅ allowed on public pages; blocked from private and tokenised paths (was leaking — fixed) |
| `ChatGPT-User` (user-initiated fetches) | ✅ same rules. OpenAI states robots.txt "may not apply" to user-initiated fetches |
| `GPTBot` (training) | 🔒 blocked — **owner's existing preference, unchanged**. Independent of search visibility |
| Edge / WAF | ✅ probe with OAI-SearchBot UA: 200, full content, no checkpoint. Vercel lists `oai-searchbot` and `chatgpt-user` as verified bots |
| Content extractability | ✅ static HTML, one H1, FAQ answers present, crisp definition in schema and llms.txt |
| Attribution | ✅ `utm_source=chatgpt.com` (documented by OpenAI) classified as `chatgpt` / `ai_assistant` |
| Propagation | OpenAI documents ~24 hours for robots.txt changes to apply |

---

## 8. AI crawler access status

Tokens and purposes from vendor documentation (OpenAI, Anthropic, Perplexity, Google, Apple, DuckDuckGo, Common Crawl, Meta). **Edge column:** HTTP status for a request carrying that user-agent from a non-vendor IP on 16 Sep — it shows no challenge was active, **not** that real vendor traffic is admitted.

| Crawler | Purpose | robots.txt | Edge probe | Notes |
|---|---|---|---|---|
| Googlebot | Search, AI Overviews, AI Mode | ✅ allowed (via `*`) | 200 | |
| Bingbot | Bing search; Copilot (reported) | ✅ allowed (via `*`) | 200 | |
| DuckDuckBot | DuckDuckGo search | ✅ allowed (via `*`) | — | |
| Applebot | Siri / Spotlight / Safari | ✅ allowed (via `*`) | — | |
| OAI-SearchBot | ChatGPT search | ✅ public only | 200 | leak fixed |
| ChatGPT-User | user-initiated fetch | ✅ public only | 200 | may not honour robots.txt |
| Claude-SearchBot | Claude search | ✅ public only | 200 | now named |
| Claude-User | user-initiated fetch | ✅ public only | — | now named |
| PerplexityBot | Perplexity search | ✅ public only | 200 | leak fixed |
| Perplexity-User | user-initiated fetch | ✅ public only | — | Perplexity says it "generally disregards" robots.txt |
| DuckAssistBot | DuckDuckGo AI answers | ✅ public only | 200 | now named |
| GPTBot | OpenAI training | 🔒 blocked | 200 | robots-only block |
| ClaudeBot | Anthropic training | 🔒 blocked | — | |
| anthropic-ai | legacy Anthropic token | 🔒 blocked | — | no longer listed by Anthropic |
| Google-Extended | Gemini training **and Gemini app grounding** | 🔒 blocked | — | see §21 |
| CCBot | Common Crawl (widely used for training) | 🔒 blocked | — | |
| Applebot-Extended | Apple model training opt-out | ⚠️ **allowed via `*`** | — | not in the owner's block list |
| meta-externalagent | Meta AI training / indexing | ⚠️ **allowed via `*`** | — | not in the owner's block list |

**Blocked by authentication:** `/dashboard`, `/admin`, `/onboarding` (and robots-disallowed). **Blocked by JavaScript challenge:** none at time of test — but the Vercel Security Checkpoint was active on 15 Sep (403 to non-browser clients) and was likely triggered by audit traffic. Vercel documents that Attack Mode and Bot Protection let verified bots through, and lists all the search and answer engines above. **Its separate "AI bots" managed ruleset is off by default; if set to Deny it blocks them even though they are verified. Please confirm in the Vercel Firewall dashboard.**

---

## 9. Schema implementation

Measured on production (count of pages carrying each type; no page carries any type twice):

| Type | Pages | Source | Notes |
|---|---|---|---|
| Organization | 72 | `index.html` | `@id #organization`, shared definition, `areaServed` Canada, support and privacy contact points |
| WebSite | 72 | `index.html` | `@id #website`, `alternateName`, `publisher` → Organization |
| SoftwareApplication | 1 (home) | prerender | `@id #software`, `provider` → Organization, AggregateOffer CAD $0–149 (3 offers), derived `featureList`, `audience`, `isAccessibleForFree` |
| WebPage | 21 | prerender | `isPartOf` → WebSite, `about` → Organization; name and description equal the meta tags |
| BreadcrumbList | 61 | prerender | generated from the same rules as the visible trail |
| BlogPosting | 51 | prerender | `publisher` → `#organization` |
| FAQPage | 12 (+ homepage) | prerender: grants hub and 11 posts; the homepage FAQ is added client-side | Q&A visible on page; no rich result expected |

**Deliberately not declared** (not published on the site, so not asserted): `sameAs`, `founder`, `legalName`, `address`, `foundingDate`, ratings, reviews, awards, customers. **Not used:** HowTo (deprecated), Product (SaaS plans are covered by `SoftwareApplication` offers), LocalBusiness (no physical premises), VideoObject (no indexable video content).

---

## 10. Keyword-to-page map

No search-volume data was available: priorities are intent-based judgements, not measurements. One primary intent per page to avoid cannibalization.

| Page | Primary intent | Primary cluster | Next action (CTA) |
|---|---|---|---|
| `/` | transactional / brand | indigenous business funding platform; indigenous rising ai | Start free account |
| `/guides/indigenous-business-grants` | commercial pillar | **indigenous business grants canada**; indigenous business funding canada | Find funding / start free |
| `/funding` | transactional | find indigenous business funding; indigenous grants database | Browse, then match |
| `/plan` | transactional | indigenous business plan builder / template | Start a plan |
| `/pricing` | transactional | indigenous rising ai pricing | Choose plan |
| `/funding/alerts` | transactional | indigenous funding alerts; grant deadline alerts | Subscribe (double opt-in) |
| `/training` | commercial | indigenous business training online | Enrol |
| `/demo` | transactional | book a demo (Nations, organizations) | Book demo |
| `/impact` | commercial, **Coming soon** | community impact tracking | Read what is live today |
| `/faq` | informational | how does indigenous rising ai work; is my data stored in canada | Start free |
| `/data-rights`, `/privacy`, `/compliance` | trust | OCAP® data sovereignty software; PIPEDA | Contact / data request |
| Blog (51 posts) | informational | province, Métis, Inuit, women, youth, AFI, procurement, tax, certification topics | Contextual link to hub, `/funding` or `/plan` |

**Cannibalization — still needs your decision (unchanged from 15 Sep):**

| Competing pages | Query | Recommendation |
|---|---|---|
| `/guides/indigenous-business-grants` vs `/blog/ultimate-guide-indigenous-business-grants-canada-2025` | indigenous business grants canada | Hub owns it: consolidate the post with a 301, or narrow it to "how the funding system works" |
| `/blog/aboriginal-capital-corporations-complete-guide-canada` vs `/blog/indigenous-financial-institutions-community-banking-partners` | aboriginal financial institutions | Merge, or differentiate clearly (ACCs are a type of AFI) |
| `/blog/how-to-write-winning-indigenous-business-plan-funding` vs `/plan` | indigenous business plan | Fine (informational vs tool); already cross-linked |

---

## 11. Conversational query map

How people ask assistants, mapped to the page that should answer and whether the answer exists today.

| Conversational query | Answering page | Answer on page today? |
|---|---|---|
| "Where can a First Nations entrepreneur in Canada find business grants?" | `/guides/indigenous-business-grants` | ✅ |
| "Is there software that matches Indigenous businesses to funding programs?" | `/`, `/funding` | ✅ (matching is informational; confirm with funder) |
| "How much does Indigenous Rising AI cost?" | `/pricing`, `/faq` | ✅ |
| "Does Indigenous Rising AI store data in Canada?" | `/faq`, `/data-rights` | ✅ |
| "Is Indigenous Rising AI OCAP certified?" | `/compliance`, `llms.txt` | ✅ — designed around OCAP®, **not certified**, not affiliated with FNIGC |
| "How do I write a business plan for an Aboriginal Financial Institution loan?" | `/plan`, business-plan post | ⚠️ partial — lender expectations not documented (gap #1) |
| "What funding is available for Métis businesses?" | Métis posts | ✅ distinction-specific posts exist |
| "What funding is there for Inuit businesses in Nunavut?" | Inuit post | ⚠️ thin versus Inuit-specific lenders (gap #4) |
| "How do I apply for the Aboriginal Entrepreneurship Program?" | AEP post | ⚠️ procedure detail is the gap (gap #2) |
| "What is OCAP and what does it mean for my business software?" | `/data-rights`, blog | ⚠️ no plain-language explainer for business owners (gap #5) |
| "Can a Nation or economic development office use this?" | `/pricing` (Nations), `/demo` | ⚠️ no dedicated audience page |
| "Does it have a grant writing assistant?" | `/pricing`, `llms.txt` | ✅ correctly answered as **planned, not available** |

---

## 12. Entity map

```
Organization  Indigenous Rising AI  (#organization)
 ├─ url, logo, areaServed: Canada
 ├─ contactPoint: help@ (support), privacy@ (privacy)
 ├─ publisher of → WebSite  Indigenous Rising AI / "Indigenous Rising"  (#website)
 ├─ provider of  → SoftwareApplication  Indigenous Rising AI  (#software)
 │                  ├─ category: BusinessApplication · Web
 │                  ├─ audience: First Nations, Inuit and Métis entrepreneurs and businesses in Canada
 │                  ├─ offers: CAD $0–$149, 3 priced plans (Nations custom, unpriced)
 │                  └─ featureList: 10 live capabilities, derived from plans.ts
 ├─ about of     → WebPage × 21 (isPartOf #website)
 └─ publisher of → BlogPosting × 51
```

**Missing entity signals (owner must supply — nothing is inferred):** legal entity name, founder or team, official social profiles for `sameAs`, founding date, and a mailing address (also required by CASL in commercial email; the funding digest refuses to send without `COMPANY_POSTAL_ADDRESS`). Brand consistency is good on-site: "Indigenous Rising AI" everywhere, `alternateName` "Indigenous Rising".

---

## 13. Internal linking strategy

**Current state (measured in the build):** the footer links the grants hub, `/funding`, `/plan`, `/impact` and `/funding/alerts` from all 72 pages; the hub links `/funding` and `/plan`; `/funding` links the hub; the business-plan post links `/plan`; the "ultimate guide" post links the hub.

**Weakness:** several posts are linked only from the blog index — e.g. `indigenous-healthcare-wellness-business-canada-2025`, `indigenous-intellectual-property-protection-canada-2025`, `indigenous-cannabis-business-canada-2025-legal-guide`, `indigenous-real-estate-development-canada-2025`, `indigenous-food-business-canada-restaurant-catering-2025`.

**Strategy (not implemented in this pass — editorial work):**
- **Hub ↔ spokes:** the grants hub links out to each province, distinction (First Nations / Métis / Inuit) and audience post; each spoke links back with descriptive anchors ("Indigenous business grants across Canada").
- **Industry posts → funding and plan:** healthcare, food, tourism, real-estate, cannabis posts link to `/funding` and `/plan` from where they discuss financing, not in a boilerplate block.
- **Trust pages → product:** `/data-rights` and `/compliance` link to the FAQ answers they support.
- **Anchors:** descriptive and varied; no exact-match repetition.

---

## 14. Content gaps

Grounded in a SERP review of 8 core queries (non-Google engine; indicative). Aggregators (helloDarwin) and government pages dominate; most "template" results are 2018–2019 PDFs.

1. **Lender-ready business plan template on `/plan`** — section-by-section guidance for the six real planner sections, and what AFIs ask for. Confirm with 2–3 AFIs; do not guess.
2. **How to apply for the Aboriginal Entrepreneurship Program** — the delivery-partner route, documents, equity contribution, timelines.
3. **Find your AFI or Métis Capital Corporation** — explain the types and link NACCA's directory rather than copying it.
4. **Inuit business funding** — Inuit-specific lenders and CanNor partners, not First Nations framing reused.
5. **OCAP® for business owners** — plain language, FNIGC's own wording and links, what "stored in Canada" does and does not mean. Never "OCAP-certified".
6. **Nations and economic development officers** — what the platform does for them today versus planned, with a demo CTA.
7. **Freshness** — ~30 posts carry "2025". Verify amounts and deadlines against funders and add a visible "last verified" date. **Do not change dates to look new.**

**Deliberately not built:** per-program `/funding/<id>` pages (17 records, 1 with a `last_verified` date — thin, unverified funding pages are a trust and spam-policy risk); city or province doorway pages; comparison pages against named competitors (no verified, current competitor facts available).

---

## 15. Local, SaaS and ecommerce SEO status

**Local SEO — not applicable.** National online service with no public premises, address or phone. No LocalBusiness schema, Google Business Profile or city pages; province-level *funding* content is informational and legitimate. Do not generate location doorway pages.

**SaaS SEO — active.** Architecture: home → pricing / funding / plan / training → grants hub → blog → FAQ / trust pages. Live versus planned is now consistent across pricing cards, comparison table, homepage modules, structured data, `llms.txt` and the site assistant's corpus (guarded by `plan-claims-verified.test.ts`). **Gaps:** no audience page for Nations and support organizations; no integrations or documentation pages (none exist to describe); no comparison content.

**Ecommerce SEO — not applicable.** Subscriptions via Stripe Checkout; no product catalogue.

---

## 16. AEO opportunities

Answer engines quote direct answers to specific questions. In priority order:

1. **Definition first on key pages.** The shared definition now leads the schema and `llms.txt`; a one-sentence visible definition near the top of `/`, `/funding` and `/plan` would let assistants quote the page itself.
2. **Answer the §11 ⚠️ questions** on their pages, each opening with a 1–2 sentence answer followed by detail.
3. **"Live today vs planned" as a visible, dated section** on `/pricing` or `/faq`. Assistants are asked what the product does; a dated list is the most quotable truthful answer, and it already exists as data.
4. **Funding answers with source and date.** Every amount or deadline sentence carries the funder link and "last verified" date — the most defensible thing an assistant can cite.
5. **Keep FAQs real.** Build from support emails and demo questions; no bulk FAQ generation.

---

## 17. GEO and AI visibility opportunities

- **Information gain.** Top results are aggregators and government pages. The platform can add what they lack: one place that compares First Nations, Métis and Inuit options side by side; primary-source links with verification dates; plain-language OCAP® for entrepreneurs.
- **Citable evidence.** Once real, consented stories and aggregate platform data exist, publish them with method and date. Do not publish before then.
- **Authorship and E-E-A-T.** Posts are authored by "Indigenous Rising AI Team". Named authors with real bios, and a named Indigenous reviewer for culturally situated content, would materially help. **Never create profiles for people who don't exist.**
- **llms.txt — expectations.** A proposal, not a standard. Google says no special AI text files are needed, and no AI vendor has confirmed its crawlers read it. It is a cheap, accurate map; no ranking effect is claimed.
- **Digital authority (earned, not bought):** NACCA and the AFI network; CCIB; Métis Capital Corporations; Cando / Virtual EDO; Futurpreneur; university Indigenous-business LibGuides (once the template and OCAP® explainer exist); Business Link Alberta and provincial navigators; NationTalk / Windspeaker / APTN for genuine news only; AFOA Canada. Directory listings only where eligibility is genuinely met. No paid links, no invented press.

---

## 18. AI visibility monitoring

AI answers vary by session, location and time; treat results as samples, not rankings.

**Prompt set** — run monthly in ChatGPT (search on), Perplexity, Copilot, Gemini and Claude (web search on), in a clean session, from Canada:

1. What tools help First Nations entrepreneurs in Canada find business funding?
2. Where can a Métis business owner find grants or loans?
3. Is there a funding database for Inuit businesses?
4. What is a good business plan template for an Aboriginal Financial Institution loan?
5. What software stores Indigenous business data in Canada and follows OCAP principles?
6. What is Indigenous Rising AI and how much does it cost?
7. Does Indigenous Rising AI have a grant writing assistant? *(correct answer: planned, not available)*
8. How do I apply for the Aboriginal Entrepreneurship Program?
9. What funding is available for Indigenous women entrepreneurs in Canada?
10. How can a First Nation economic development office track funding deadlines?

**Record per prompt:** mentioned (y/n) · cited URL · accuracy (correct / outdated / wrong) · competitors named. **Fix at the source when an answer is wrong** (page copy, schema, `llms.txt`), never by chasing a single response.

**Pair with GA4:** `ai_referral` events and `traffic_medium = ai_assistant` on conversions (§19).

---

## 19. Analytics and conversion measurement

| Conversion | Event | Status |
|---|---|---|
| Signup CTA click (by placement) | `signup_cta_click` | ✅ now sent (was dead) |
| Account created | `sign_up` | ✅ |
| Plan selected (and where it led) | `pricing_plan_selected` | ✅ now sent (was dead) |
| Contact form start / submit | `form_start`, `form_submitted` | ✅ now sent (was dead) |
| Demo | `DemoCta` funnel, `BookDemo` | ✅ |
| Newsletter | `NewsletterSignup` | ✅ |
| Funding application started | `funding_application_started` | ✅ now sent (was dead) |
| AI assistant arrival | `ai_referral` | ✅ new |
| Source on every event | `traffic_source`, `traffic_medium` | ✅ new |

**Attribution reliability:** only ChatGPT's `utm_source=chatgpt.com` is vendor-documented. Referrer hostnames for Perplexity, Copilot, Gemini and Claude are commonly observed, not documented; many AI visits carry no referrer and count as direct. **Treat AI numbers as a floor.**

**Expect in GA4 from 16 Sep:** fewer page views (double count removed, #208); fewer cookied users (declined visitors no longer tracked, #200); conversion events appearing for the first time (#199). Annotate the date.

**GA4 setup needed (your access):** register `traffic_source`, `traffic_medium` and `ai_source` as event-scoped custom dimensions; mark `sign_up` and `ai_referral` as key events; optionally add an "AI assistants" custom channel group.

---

## 20. Remaining technical issues

| Issue | Severity | Note |
|---|---|---|
| **`site-assistant` edge function not deployed** | High | The live chatbot still tells visitors Professional includes unbuilt features. The corrected corpus is in `main`. Deploy was blocked by tool permissions: `supabase functions deploy site-assistant --project-ref upxojfcdtmqtcvgbjsym --no-verify-jwt` |
| **Funding digest can never send** | High (product) | `check-funding-freshness` has no cron schedule; 1 of 17 grants verified; `sendable_grants` returns 0 rows. "Funding deadline alerts by email" is advertised as available |
| IndexNow restored-state run | Low | Baseline confirmed on production (artifact 10464470602). Confirm the next deploy logs "Restored manifest artifact" |
| Blog posts dated 2025 | Medium | Verify facts; add "last verified" dates |
| Several posts linked only from the blog index | Medium | §13 |
| React 18.3.1 NUL bug | Low (mitigated) | Workaround in place; remove after upgrading to a fixed React |
| Lighthouse / field INP | Unknown | Not measured |
| Edge-function deploy workflow | Medium | Fails every run: `SUPABASE_ACCESS_TOKEN` repo secret unset |

---

## 21. Owner decisions and actions

**Decisions (yours — not changed):**
1. **`Google-Extended`**: blocking it opts pages out of Gemini app grounding, not just training. Keep for sovereignty, or allow for Gemini visibility.
2. **`Applebot-Extended` and `meta-externalagent`**: training-related tokens currently allowed via `*`. Add them to the block list if the "block training crawlers" policy should cover them.
3. **Cannibalization** (§10).
4. **Scheduling `check-funding-freshness`** — turns on the funding digest, which starts sending real email.
5. **Nations plan human commitments** — "24/7 priority support", "dedicated account manager", "on-site training": confirm the team can honour them.
6. **`/training` "Monthly live sessions"** — confirm they run.
7. **`/success-stories`** — titled as stories, contains illustrative examples. Rename or `noindex` until real, consented stories exist.

**Actions needing your access:**
1. Deploy `site-assistant` (command in §20).
2. Google Search Console: submit sitemap; URL-inspect `/`, `/faq`, a post; check site name.
3. Bing Webmaster Tools: import from Search Console; submit sitemap.
4. Vercel Firewall: confirm Attack Challenge Mode is off, and the "AI bots" managed ruleset is not set to Deny.
5. GA4: custom dimensions, key events, date annotation (§19).
6. Publish entity facts if you want them declared: legal name, founder/team, official social profiles, mailing address.
7. Add the `SUPABASE_ACCESS_TOKEN` repo secret.

---

## 22. 30 / 60 / 90-day plan

### 30 days
1. Owner actions 1–5 above (deploy chatbot, Search Console, Bing, Vercel firewall check, GA4).
2. Decide the three cannibalization cases; implement redirects or differentiation.
3. Add visible one-sentence definitions and a dated "live today vs planned" section (§16).
4. Refresh the 10 highest-traffic funding posts with verified figures and "last verified" dates.
5. Contextual links to the weakly linked posts (§13).
6. First AI-visibility baseline with the §18 prompt set; run Lighthouse.
7. Confirm the next IndexNow run restores its state artifact and submits only changed URLs.

### 60 days
8. Content gaps 1–3: lender-ready plan template, AEP application guide, AFI / MCC finder.
9. Nations and economic development audience page (live versus planned, demo CTA).
10. OCAP® for business owners explainer, reviewed by an Indigenous advisor.
11. Named authors and reviewers where real people agree to be named.
12. Begin authority outreach: NACCA, CCIB, Cando, Futurpreneur.
13. Verify the funding database; schedule `check-funding-freshness` once decided.

### 90 days
14. Inuit-specific funding guide; remaining 2025-dated posts refreshed.
15. French content for `/pricing`, `/funding` and a Québec funding guide, written natively, with `hreflang` only then.
16. Reconsider per-program funding pages if and only if records have verified descriptions, eligibility, amounts, deadlines and sources.
17. Second AI-visibility run; compare mentions and accuracy with the baseline.
18. Re-run this audit (live crawl, schema, crawler resolver, analytics events) and diff against this document.

---

## 23. Regression guards

All run in CI (`npm test`, plus `check-prerender` on the build output).

| Guard | Protects |
|---|---|
| `robots-policy.test.ts` | RFC 9309 resolver: answer engines never reach private paths and match `*` publicly; search engines unnamed; training bots blocked |
| `analytics-consent.test.tsx` | executes the head script: consent defaults per stored choice, default before config, single page-view source; banner and withdrawal behaviour |
| `conversion-events.test.ts`, `FundingList.test`, `ImpactLogForm.test` | events reach the gtag sender; no static or dynamic stub import |
| `traffic-source.test.ts` | classification, anchored hosts, Gemini ≠ Google, no raw referrer stored, source on events |
| `entity-facts.test.ts` | `featureList` only live self-serve rows; Organization description equals the shared definition |
| `plan-claims-verified.test.ts` | nothing unbuilt advertised; roadmap phrases tied to `live` flags; descriptions match page reality |
| `seo-schema-single-source.test.ts` | one owner per schema type; `WebPage` from the meta tags' own inputs; no false claims in component code |
| `llms-txt.test.ts` | shape, nothing planned listed as available, sitemap-only pages |
| `indexnow.test.ts` | hash stability, diff, payload, status handling, real CLI with stubbed fetch, state persistence, baseline on missing state |
| `render-stream-nul.test.tsx` | reproduces the React NUL bug; pipeline output never contains NUL |
| `check-prerender.mjs` | every sitemap URL: distinct title and description, ≥200 words, **no NUL** |
| earlier suites | indexation, on-page, title parity, breadcrumbs (15 Sep pass) |

**Guards that first passed vacuously and were strengthened:** the robots test masked the leak behind an earlier `/auth` failure (split into its own test); the IndexNow hash test only renamed a `src` attribute (added an inline per-build script); the React NUL reproduction did not reproduce at first (React only buffers chunks of ≤682 characters); the IndexNow tests never covered state persistence between runs (the production bug in #210).

---

## 24. Honest limitations

- **No Search Console, Bing Webmaster, rank-tracker or backlink data.** No impression, click, ranking or link baseline exists in this document.
- **SERP review was indicative** — from a non-Google engine; AI Overview presence was not observable.
- **Crawler edge probes used spoofed user-agents** from a non-vendor IP. They show no challenge was active; they cannot prove real vendor bots are admitted.
- **Referrer hostnames for AI assistants are not vendor-documented**, except ChatGPT's `utm_source`.
- **No Lighthouse score or field INP**; lab metrics only (15 Sep).
- **Structured data** validated by parsing and duplicate checks on production — not Google's Rich Results Test.
- **No real-device testing** in this pass.
- **The authenticated app** is intentionally excluded from search and was not optimized.
- **Nothing here guarantees rankings or inclusion in AI answers.** The goal is to be crawlable, accurate, attributable and worth citing.
