# Competitor-Driven SEO Upgrade — indigenousrising.ai

**Research source:** OpenSEO MCP (DataForSEO backend), location 2124 (Canada), language `en`.
**Date:** 21 September 2026
**OpenSEO project:** `ce9c7cdd-0583-48af-b1f4-4c6c4112faee`
**Shipped in:** PR #216 (`11564a3`), merged to `main`, live on production and verified.

---

## 1. Baseline

| Metric | Value |
|---|---|
| Our organic keywords | **1** |
| Our organic traffic | **17** |
| Blog posts | 51 → **53** |
| Sitemap URLs | 72 → **74** |

The site is starting from effectively zero non-branded organic presence. That is the
single most important fact in this report: it rules out competing on head terms and
makes low-difficulty long-tail the only rational entry point.

---

## 2. Every competitor analyzed

`find_serp_competitors` returned **empty** for this domain — there is no set of sites
competing with us across a shared keyword footprint, because we have almost no footprint.
Competitors were therefore identified by reading **live SERPs** for each target term.

### 2.1 The only comparable content competitor

| Domain | Organic traffic | Organic keywords | What they are |
|---|---|---|---|
| **grantcompass.ca** | 2,112 | 1,906 | Canadian grant aggregator / content site. The only site in the category whose model resembles ours. |

### 2.2 Government pages (dominate most SERPs)

| Domain | Role |
|---|---|
| `sac-isc.gc.ca` / `isc-sac.gc.ca` | Indigenous Services Canada — owns the AEP program page |
| `canada.ca` | Federal program and policy pages |
| `alberta.ca`, `saskatchewan.ca`, `www2.gov.bc.ca` | Provincial program pages |
| `feddev-ontario.canada.ca`, `news.ontario.ca` | Regional development agency / announcements |

### 2.3 Funders and Aboriginal Financial Institutions

| Domain | Role |
|---|---|
| `nacca.ca` | National Aboriginal Capital Corporations Association — administers AEP |
| `nadf.org` | Nishnawbe Aski Development Fund |
| `antco.ca` | Aboriginal Business Development Centre network |
| `aiic.ca` | Aboriginal Investment / Indigenous capital |
| `bdc.ca` | Business Development Bank of Canada |
| `futurpreneur.ca` | Futurpreneur — Indigenous Entrepreneur Startup Program |
| `ccib.ca` | Canadian Council for Indigenous Business |
| `fnbc.ca` | First Nations Bank of Canada |
| `bcafn.ca` | BC Assembly of First Nations |

### 2.4 Other

| Domain | Role |
|---|---|
| `guides.library.ualberta.ca` | University library research guide — ranks on several informational terms |

### 2.5 SERP feature observation

**AI Overviews appeared on 6 of the 8 SERPs checked.** In a category where the top
organic results are government pages, the practical competition for attention is the AI
Overview, not position 4. That pushed the content design toward passage-level citability:
short attributed statements, explicit dollar figures, named institutions, and a visible
verification date.

---

## 3. Every keyword discovered (30 saved to the OpenSEO project)

All figures from OpenSEO/DataForSEO, Canada, September 2026. Saved and re-read back from
the project to confirm.

### 3.1 Off-reserve cluster — **SELECTED**

| Keyword | Volume | KD | Intent |
|---|---|---|---|
| off-reserve indigenous funding | 260 | 2 | Informational |
| off-reserve indigenous funding application | 110 | 1 | Transactional |
| off-reserve indigenous funding 2025 | 90 | 0 | Informational |
| off-reserve indigenous funding eligibility | 50 | 1 | Informational |
| off reserve benefits | 50 | 0 | Informational |
| **Cluster total** | **560** | **0–2** | |

### 3.2 Aboriginal Entrepreneurship Program cluster — **SELECTED**

| Keyword | Volume | KD | Intent |
|---|---|---|---|
| aboriginal entrepreneurship program | 210 | 7 | Informational |
| aboriginal entrepreneurship program access to capital | 90 | 4 | Navigational |
| **Cluster total** | **300** | **4–7** | |

### 3.3 Métis cluster — **SELECTED (retitle)**

| Keyword | Volume | KD | Intent |
|---|---|---|---|
| métis business grants | 170 | 5 | Informational |
| métis business grants alberta | 90 | 0 | Informational |
| métis business grants canada | 20 | 15 | Informational |
| manitoba métis business grants | 20 | 0 | Informational |
| **Cluster total** | **300** | **0–15** | |

### 3.4 Procurement cluster — **SELECTED (retitle)**

| Keyword | Volume | KD | Intent |
|---|---|---|---|
| indigenous procurement | 140 | 0 | Navigational |
| procurement strategy for indigenous business | 70 | 15 | Informational |
| indigenous procurement canada | 50 | 22 | Informational |
| psib canada | 30 | 14 | Informational |
| **Cluster total** | **290** | **0–22** | |

### 3.5 Provincial cluster — **PARTIALLY SELECTED**

| Keyword | Volume | KD | Decision |
|---|---|---|---|
| indigenous small business grants ontario | 50 | 21 | **Selected** — Ontario post retitled |
| indigenous business grants ontario | 50 | 32 | **Selected** — same page, secondary |
| indigenous business grants bc | 50 | 7 | Deferred — post exists, retitle not yet needed |
| indigenous small business grants bc | 30 | 0 | Deferred |
| indigenous business grants alberta | 50 | 15 | Deferred |
| indigenous business grants manitoba | 40 | 17 | Deferred |

### 3.6 Head and adjacent terms — **REJECTED (see §4)**

| Keyword | Volume | KD | Intent |
|---|---|---|---|
| indigenous business grants | 390 | 20 | Informational |
| free aboriginal grants for starting a business in canada | 140 | 7 | Informational |
| indigenous grants canada | 110 | 30 | Informational |
| indigenous business directory canada | 110 | 26 | Informational |
| indigenous grants for small business | 50 | 36 | Informational |
| indigenous business grants canada | 50 | 39 | Commercial |
| indigenous business loans | 40 | 42 | Commercial |
| list of indigenous businesses in canada | 40 | 25 | Informational |
| aboriginal grants for starting a business | 20 | 15 | Informational |

---

## 4. Keywords rejected, and why

| Keyword(s) | Volume | Why rejected |
|---|---|---|
| **indigenous business directory canada**, **list of indigenous businesses in canada** | 110, 40 | **We do not operate a business directory.** Building a page for these would be a thin page promising something the product does not do. This is the single largest volume we deliberately walked away from. |
| **indigenous business loans**, **indigenous business grants canada**, **indigenous grants for small business** | 40, 50, 50 | KD 36–42 against government and bank domains, from a 1-keyword base. Not winnable this year; revisit once the low-KD cluster has earned authority. |
| **free aboriginal grants for starting a business in canada** | 140 | The word "free" sets an expectation the honest answer cannot meet — most AEP capital is delivered by IFIs as financing, not grants. Targeting it would require either misleading copy or a page that disappoints every visitor. Covered honestly inside the non-repayable-contributions post instead. |
| **indigenous business grants** (head, 390) | 390 | KD 20 head term already partially served by existing posts. No new page: adding one would cannibalize the existing funding guides. |
| **off-reserve indigenous funding 2025** | 90 | Selected as a cluster member but **deliberately kept out of the title.** Year-stamped titles read as stale from 2026 onward; the post carries a verification date instead. |
| Provincial BC / Alberta / Manitoba variants | 30–50 each | Posts already exist and rank-target these. Retitling all of them in one pass would be an untested bulk change; deferred to a measured second pass. |
| `[competitor] vs` / `[competitor] alternative` pages | — | **See §8.** No SaaS competitor ranks in this category at all. |

---

## 5. Keyword-to-URL map

One primary intent per URL. No two pages target the same primary keyword.

| URL | Primary keyword | Vol | KD | Secondary |
|---|---|---|---|---|
| `/blog/off-reserve-indigenous-business-funding-canada` **(new)** | off-reserve indigenous funding | 260 | 2 | application (110), eligibility (50), off reserve benefits (50) |
| `/blog/aboriginal-entrepreneurship-program-how-to-apply` **(new)** | aboriginal entrepreneurship program | 210 | 7 | AEP access to capital (90) |
| `/blog/metis-specific-business-funding-economic-development-programs` | métis business grants | 170 | 5 | alberta (90), canada (20), manitoba (20) |
| `/blog/procurement-ready-corporate-indigenous-partnership-opportunities` | indigenous procurement | 140 | 0 | PSIB canada (30), procurement strategy (70) |
| `/blog/ontario-indigenous-business-funding-programs-grants-support` | indigenous small business grants ontario | 50 | 21 | indigenous business grants ontario (50) |
| `/funding` | Funding Navigator — conversion target for every funding-intent post | — | — | — |

---

## 6. New pages created

### 6.1 `/blog/off-reserve-indigenous-business-funding-canada`

**Title (49 chars):** "Off-Reserve Indigenous Business Funding in Canada"
6 sections, ~9 min read, 4 FAQs.

The question "does living off reserve disqualify me?" gets asked constantly because the
federal pages **do not address residency at all** — and silence is not a yes. The post
says that plainly, then resolves it with attributed facts.

Every figure is attributed to the funder's own page with a visible verification date
(21 September 2026):

- **AEP:** up to **$99,999** (individual), up to **$250,000** (community). Delivered by
  IFIs and MCCs. ISC's own instruction: "contact your local IFI or MCC directly".
  ISC's own caveat: "Eligibility varies between IFIs and MCCs". ISC page last updated
  2024-04-10.
- **NACCA:** "more than 50 Indigenous Financial Institutions", 54,500 loans disbursed.
- **Futurpreneur IESP:** up to **$75,000**, ages 18–39, under two years trading, up to
  two years of 1:1 mentorship. The one program whose page says
  **"including those on or off reserve"** outright.

It also routes **income-assistance** searchers away — a meaningful share of "off-reserve
funding" search intent is people looking for social assistance, not business capital, and
sending them into loan applications helps nobody.

### 6.2 `/blog/aboriginal-entrepreneurship-program-how-to-apply`

**Title (49 chars):** "Aboriginal Entrepreneurship Program: How to Apply"
6 sections, ~8 min read, 4 FAQs.

Most competing pages stop at the headline dollar figure. The fact that actually determines
whether someone gets funded is **who decides** — and it is not Ottawa. The post is built
around that: no central federal form, no national deadline, rolling applications, decision
made at the IFI/MCC, criteria that differ by institution.

Both posts state explicitly that nothing in them is an eligibility decision, and that terms
must be confirmed with the institution.

---

## 7. Existing pages optimized

`<title>` and `og:title` only. **H1 and body copy unchanged** — no existing content or
ranking signal was disturbed.

| Slug | Before | After | Target |
|---|---|---|---|
| `metis-specific-…` | "Métis Business Funding and Development Programs" | **"Métis Business Grants and Funding in Canada"** | métis business grants (170) |
| `ontario-indigenous-…` | "Ontario Indigenous Business Funding and Grants" | **"Indigenous Business Grants in Ontario"** | indigenous ... grants ontario (50) |
| `procurement-ready-…` | "Indigenous Procurement: Getting Partnership-Ready" | **"Indigenous Procurement in Canada: PSIB and the 5% Target"** | indigenous procurement (140), PSIB (30) |

The Métis and procurement retitles swap a paraphrase for the phrase people actually type.
"Funding and Development Programs" and "Getting Partnership-Ready" are internal language;
"grants" and "PSIB" are search language.

---

## 8. Competitor gaps addressed — and one part of the brief deliberately not done

### Gaps addressed

| Gap | How |
|---|---|
| Government pages state rules but never answer "what do I do first" | Both new posts are ordered procedures ending in a specific first phone call |
| ISC never addresses off-reserve residency | Addressed head-on, including naming the silence as the problem |
| No page explains that the AEP decision is made at the institution, not federally | This is the spine of the AEP post |
| Funder pages scatter amounts across PDFs | Amounts consolidated, each attributed, each dated |
| AI Overviews on 6/8 SERPs | Short attributed passages, named institutions, explicit figures, FAQPage schema |

### Not done, deliberately

The brief asked for **"[competitor] alternative"** and **"[competitor] vs"** pages.

**There is no SaaS competitor ranking anywhere in this category.** The competitive set is
government program pages, funders/AFIs, and one aggregator. A "vs" page would have to
invent a rival or compare our product to Indigenous Services Canada, which is not a
competitor — it is the funder we cite. Under the brief's own instruction ("only create
these pages when they are factually supportable and useful"), these were not created.

---

## 9. Internal links added

Two-way and **additive** — no existing `relatedPosts` entry was removed.

| Post | Before | After |
|---|---|---|
| 1 — Complete funding guide | `2, 8, 9, 51` | `2, 8, 9, 51, **52**, **53**` |
| 2 — Funding readiness | `1, 12, 8` | `1, 12, 8, **53**` |
| 8 — Non-repayable contributions | `1, 2, 9` | `1, 2, 9, **52**` |
| 9 — Indigenous financial institutions | `1, 8, 2, 51` | `1, 8, 2, 51, **53**` |
| **52 (new)** | — | `1, 2, 43` |
| **53 (new)** | — | `1, 2, 52` |

An earlier draft of this change truncated `relatedPosts` to four entries and silently
dropped `51` from two posts. Caught before commit and reverted — removing working internal
links to make room for new ones is a net loss.

Both new posts also link contextually into `/funding` (the Funding Navigator) via their CTA.

---

## 10. Technical fixes completed

| Fix | Detail |
|---|---|
| Sitemap | 72 → **74** URLs, both new posts included |
| `llms.txt` | 72 → **74** URLs |
| IndexNow manifest | 72 → **74** URLs |
| Prerender | 51 → **53** static blog files; both new posts render server-side |
| Canonicals | Both new URLs emit self-referencing canonicals — verified on production |
| Schema | Both emit `BlogPosting`, `BreadcrumbList`, `FAQPage`, `Organization`, `WebPage`, `ImageObject` — verified on production |
| Title length | Both new titles are 49 chars; the site suffix is correctly omitted where appending it would exceed 60 |
| Category routing | New posts assigned `"Funding Guides"` / `"How-To Guides"` so `GrantsHub` links them |

### Two defects found and fixed while doing this work

1. **`blogSeoTitles.ts` named a guard file that does not exist.** Its header said
   "Guarded by `src/__tests__/seo-titles.test.ts`" — no such file. The real guard is
   `seo-on-page.test.ts`. Corrected. (The guard itself is sound: mutation-tested with
   over-long, duplicated and missing entries — all three fail it.)

2. **`signup-prerender.test.ts` had been failing silently.** It asserted the built
   `/signup` contains "Create an Account"; the heading was renamed to "Create your free
   account" during the auth refresh. It went unnoticed because that block only runs when
   `dist/` exists, i.e. after a build. **The page itself is fine** — it carries
   "Step 1 of 2" and no "Welcome Back". Fixed, and the assertion now checks the heading
   *ternary* in `Auth.tsx`, because the same literal also appears on the "switch to sign
   up" link and a plain substring check was vacuous (confirmed by mutation).

Also fixed a `no-regex-spaces` lint error left on `main` by `f914068`.

---

## 11. Quick-win keywords (highest value per unit of effort)

Ranked by volume ÷ difficulty, restricted to things we can honestly serve.

| Rank | Keyword | Vol | KD | Status |
|---|---|---|---|---|
| 1 | off-reserve indigenous funding | 260 | 2 | **Shipped** |
| 2 | indigenous procurement | 140 | 0 | **Shipped** (retitle) |
| 3 | off-reserve indigenous funding application | 110 | 1 | **Shipped** |
| 4 | métis business grants alberta | 90 | 0 | **Shipped** (secondary) |
| 5 | off-reserve indigenous funding 2025 | 90 | 0 | **Shipped** (body, not title) |
| 6 | aboriginal entrepreneurship program access to capital | 90 | 4 | **Shipped** |
| 7 | métis business grants | 170 | 5 | **Shipped** (retitle) |
| 8 | aboriginal entrepreneurship program | 210 | 7 | **Shipped** |
| 9 | indigenous business grants bc | 50 | 7 | **Open** — post exists, needs retitle |
| 10 | indigenous small business grants bc | 30 | 0 | **Open** |
| 11 | off reserve benefits | 50 | 0 | **Open** — different intent, needs its own treatment |
| 12 | manitoba métis business grants | 20 | 0 | **Open** |

---

## 12. Backlink opportunities

None of these were pursued in this pass — link acquisition is outreach, not a code change,
and needs your sign-off before anyone is contacted.

| Target | Why it is plausible |
|---|---|
| **NACCA IFI member sites** (50+ institutions) | Our posts send readers *to* them and tell readers to call them. A resource-page link is a natural ask. |
| **Friendship Centres / urban Indigenous orgs** | The off-reserve post is directly useful to their clients, including the income-assistance routing. |
| **University library guides** (`guides.library.ualberta.ca` ranks in this category) | These guides link out to plain-language funding explainers. |
| **Provincial Métis governing bodies** | For the Métis funding post. |
| **CCIB / regional economic development orgs** | Member-resource listings. |
| **grantcompass.ca** | The one comparable site — worth studying their referring domains for a gap list. |

**Do not** approach any Nation, organization or program in a way that implies partnership
or endorsement. A link is a link; it is not an affiliation, and our copy must not imply one.

---

## 13. Remaining SEO opportunities

### Content
1. **Retitle the remaining provincial posts** (BC, Alberta, Manitoba, Saskatchewan) on the
   same evidence pattern — ~170/mo combined at KD 0–17. Deferred only because bulk
   retitling in one pass is untested.
2. **"off reserve benefits" (50/mo, KD 0)** is a distinct intent — benefits, not business
   funding. It deserves either its own honest page or a clear routing section, not a
   keyword bolted onto a funding post.
3. **Refresh the year-stamped posts.** Several titles said "2025". Those were stripped from
   titles, but the underlying content still needs a factual refresh — re-dating a title
   without updating the content would be the dishonest version of this fix.
4. **Build out the two new posts into full clusters** with supporting articles now that the
   pillars exist.

### Technical
5. **Submit the two new URLs to Google Search Console and Bing.** IndexNow will pick up
   Bing/Yandex automatically from the manifest; **Google does not participate in IndexNow**
   and needs manual submission. *(Owner action — needs your GSC access.)*
6. **GA4 custom dimensions** for blog → `/funding` → signup attribution, so the next pass
   can be measured on conversions rather than rankings.

7. **Resolve the head-term cannibalization** between `/guides/indigenous-business-grants`
   and `/blog/ultimate-guide-indigenous-business-grants-canada-2025` — see §15.

### Blocked on you (I cannot do these)
8. **OpenSEO project context could not be written.** `save_keywords` worked (30 keywords
   stored and verified), but `update_project_context`, `get_keyword_metrics` and
   `get_audit_pages`'s `limit` all reject their own arguments — the tool schemas are
   untyped (`{"type":"object"}`), so the MCP bridge serializes arrays and numbers as
   strings and the server refuses them. Same cause capped the re-audit at 50 pages instead
   of 100. This is a bug in the OpenSEO MCP schema definitions, not in the data. The
   context I would have written is reproduced in §14 for you to paste in.
9. Several MCP servers in this session need authorization before use (including
   `plugin:openseo:openseo`, Ahrefs, Similarweb, GitHub). Authorize via claude.ai connector
   settings or `/mcp` in an interactive session.

---

## 14. OpenSEO project context (could not be written via MCP — paste manually)

**Business overview:** Indigenous Rising AI — Canadian SaaS for Indigenous entrepreneurs,
First Nations / Métis / Inuit communities, and economic development organizations. Four
LIVE modules: Funding Navigator, Business Planning Assistant, Training and Certification,
Growth and Data Tools. Free to start, no credit card. Data stored in Canada
(Supabase ca-central-1). Built on OCAP principles.

**Current goal:** Grow non-branded organic entry from a near-zero base (1 keyword,
17 traffic, Sept 2026). Own the long-tail, low-difficulty informational clusters that
government and funder pages answer poorly; route that traffic to the free Funding
Navigator signup. Blog is the primary surface — 53 posts, all prerendered with
BlogPosting + BreadcrumbList + FAQPage schema.

**Positioning:** The competitive set is not other SaaS. Live SERPs are dominated by
government program pages and funders/AFIs. `find_serp_competitors` returns empty. The only
comparable content site is grantcompass.ca. AI Overviews appear on ~6 of 8 target SERPs,
so passage-level citability and explicit attribution matter more than link volume. Our
differentiator: government pages state a program's rules but never answer the practical
question — who actually decides, what do I do first, does my situation qualify. We answer
that, always attributed to the funder's own page with a visible verification date.

**Writing preferences:** Every funding figure, eligibility rule and deadline must be
attributed to the funder's own page and carry a visible verification date. Never assert
eligibility, guarantee funding, invent a program/deadline/amount, or imply Indigenous
Rising administers a government program. No pan-Indigenous generalizations, no invented
statistics, no appropriated visual motifs. Do not describe OCAP alignment as OCAP
certification. Do not present roadmap functionality as live. No keyword stuffing, no thin
or duplicate pages, no copying competitor content. Titles ≤60 chars including the
" | Indigenous Rising AI" suffix; the on-page H1 keeps the article's full title.

---

## 15. Post-implementation OpenSEO re-audit

**Audit ID:** `22900f2b-7be6-464e-9d43-d6264de19dc8` · run 21 Sept 2026, 20:25 UTC · completed in 52s.

| Result | Value |
|---|---|
| Pages crawled | **50** |
| Issues found | **0** |
| HTTP status | 200 on every page |
| Indexable | true on every page |
| In sitemap | true on every page |
| Slowest response | 224 ms (`/blog/indigenous-tourism-…`) |

The empty issue list is a real result, not an empty response — the same audit returned full
per-page data for all 50 pages (titles, meta descriptions, word counts, internal link
counts, response times).

### Two caveats, stated plainly

1. **The crawl capped at 50 pages, not 74.** `maxCrawlPages: 100` was passed but the
   OpenSEO MCP tool schema is untyped, so the number was serialized as a string and
   ignored; the audit fell back to its 50-page default. **The two new posts were therefore
   not in this crawl.** They were verified directly against production instead — both
   return 200 with the correct `<title>`, self-referencing canonical, and full
   `BlogPosting` / `BreadcrumbList` / `FAQPage` schema (see §16).

2. **All three retitles were independently confirmed by the crawler**, which is the useful
   part of this audit — a third-party fetch, not my own:
   - `metis-specific-…` → "Métis Business Grants and Funding in Canada" ✅
   - `ontario-indigenous-…` → "Indigenous Business Grants in Ontario | Indigenous Rising AI" ✅
   - `procurement-ready-…` → "Indigenous Procurement in Canada: PSIB and the 5% Target" ✅

### One finding the audit surfaced that is worth acting on

**Pre-existing cannibalization on the head term.** Two pages target "indigenous business
grants" (390/mo, KD 20) as their primary:

| URL | Title | Words | Internal links |
|---|---|---|---|
| `/guides/indigenous-business-grants` | "Indigenous Business Grants & Funding in Canada" | 1,735 | 56 |
| `/blog/ultimate-guide-indigenous-business-grants-canada-2025` | "Indigenous Business Grants in Canada: The Complete Guide" | 1,630 | 30 |

These are near-identical in intent, length and title. The guide is clearly the intended
pillar (56 internal links vs 30). **I did not change this** — re-pointing a pillar page's
targeting is a larger decision than a title tweak, it touches a page with significant
existing link equity, and the brief's instruction is to preserve existing SEO value.

**Recommended fix, for your call:** keep `/guides/indigenous-business-grants` on the head
term, and re-angle the blog post onto a distinct long-tail primary (for example
"free aboriginal grants for starting a business in canada", 140/mo KD 7 — handled
honestly) with a canonical or prominent link up to the guide. This predates the current
work; it is not a regression from PR #216.

---

## 16. Verification

| Check | Result |
|---|---|
| `npm run lint` | 0 errors (2 pre-existing `react-refresh` warnings) |
| `npm run typecheck` | Clean |
| `npx vitest run` | **79 files, 664 tests, all passing** |
| `npm run build` | Clean; 78 static files, sitemap 74 URLs |
| CI (`verify`, Vercel) | Pass |
| Production — new URLs | Both HTTP 200, correct `<title>`, canonical, and full schema |
| Production — retitles | All three serving the new titles |
| Production — sitemap | 74 `<loc>` entries |

### Guardrails held

- No fabricated program, amount, deadline, eligibility rule, testimonial, statistic,
  partnership or Nation relationship.
- Every figure attributed to the funder's own page with a visible verification date.
- No eligibility asserted; both posts state they are not eligibility decisions.
- No design, branding, functionality or conversion flow changed.
- No keyword stuffing; no thin or duplicate pages; no competitor content copied; no
  irrelevant high-volume keyword targeted (see §4 — the directory terms were the
  temptation and were refused).
- No existing internal link removed.
