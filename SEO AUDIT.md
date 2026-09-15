# SEO Audit — indigenousrising.ai

**Date:** 15 September 2026
**Scope:** full production audit and implementation — crawl/indexation, on-page, structured data, internal linking, keyword architecture, content gaps, Core Web Vitals, mobile, AI-search readiness.
**Method:** every finding was measured against production (or a Vercel preview deployment) before being changed, then re-measured after. Anything not measured is labelled as an assumption.

Shipped in two pull requests:

| PR | What |
|---|---|
| [#192](https://github.com/Tilak1612/indigenous-rising-ai/pull/192) | Real 404s, duplicate-URL redirects, robots.txt that actually applies to Google |
| [#193](https://github.com/Tilak1612/indigenous-rising-ai/pull/193) | Titles, FAQ answers, structured data, head-tag ownership, internal links, heading order, image dimensions |

---

## 1. Issues discovered

### Critical — blocked or corrupted indexing

| # | Issue | Evidence |
|---|---|---|
| C1 | **Soft 404 on every unknown URL.** `vercel.json` rewrote `/(.*)` → `index.html`, so any mistyped or stale URL returned **HTTP 200 with the homepage HTML** | `/this-page-does-not-exist` → 200; `/blog/not-a-real-post` → 200 |
| C2 | **robots.txt protected nothing from Google.** A crawler obeys only the most specific group naming it. A `User-agent: Googlebot / Allow: /` group (plus Bingbot and three social-bot groups) made those crawlers **ignore every `Disallow`** in the `*` group — `/dashboard`, `/admin`, `/api/` included | group structure in `public/robots.txt` |
| C3 | **FAQ answers did not exist in the page.** Radix Accordion renders `children: isOpen && children`, so a closed panel contains nothing — not hidden, absent. All **15 answers on `/faq`** were missing from the static HTML *and* from the rendered DOM; the homepage FAQ shipped **1 of 10** | `role="region"` panels present, text length 0 |
| C4 | **`/auth` and `/signup` were `Disallow`ed while carrying `noindex`.** Blocking a page stops Google reading its `noindex`, so they can persist as bare "indexed, though blocked by robots.txt" URLs — and they are linked from all 72 pages | robots.txt vs prerendered `<meta robots>` |

### High — ranking and presentation

| # | Issue | Evidence |
|---|---|---|
| H1 | **Titles truncated on 56 of 72 pages.** 49 of 51 blog titles exceeded ~60 characters *before* the ` \| Indigenous Rising AI` suffix | longest was 123 chars |
| H2 | **Two different titles per page.** The prerendered `<title>` and the one Helmet set after hydration differed on **12 of 23** marketing routes. Google indexes the rendered one | e.g. static "Frequently asked questions" vs rendered "Frequently Asked Questions"; "Terms of Service \| …" vs "Terms of Service - …" |
| H3 | **Duplicate head tags after hydration.** Prerendered tags were not handed to Helmet, so it appended rather than replaced: **two canonicals, two descriptions, two og:titles** in the rendered DOM, sometimes with different values | rendered-DOM audit, 9 routes |
| H4 | **Duplicate structured data.** `/demo` carried two `BreadcrumbList` entities; the grants hub and every blog post carried two each of `BreadcrumbList`, `FAQPage`, `BlogPosting` — prerender and React page both emitted them | rendered-DOM audit |
| H5 | **Fabricated dates in `WebPage` schema.** `datePublished` defaulted to `"2025-01-01"` on every page and `dateModified` to *the visitor's current date* — telling Google every page changed on every crawl | `StructuredData.tsx` |
| H6 | **`SearchAction` pointing at a route that does not exist** (`/search?q=`), which now returns a real 404. Google also retired the sitelinks search box in Nov 2024 | `StructuredData.tsx` |
| H7 | **Wrong support address in `Organization` schema** — `support@indigenousrising.ai`; the real address is `help@` | `index.html`, `StructuredData.tsx` |
| H8 | **`SoftwareApplication` on every page**, plus a second, conflicting copy on the homepage (one advertising a single $0 offer, the other $0–49) | `index.html` + React |
| H9 | **Orphan pages.** `/plan` and `/impact` had no inbound internal links at all (reachable only from the sitemap); `/funding` had 2 | link graph over all 72 pages |
| H10 | **Duplicate URL variants served 200.** `/pricing/` (trailing slash) and the client-side-only aliases `/learning`, `/v1`, `/landing-v2`, `/login`, `/signin` all returned 200 with homepage HTML instead of redirecting | HTTP probes |

### Medium

| # | Issue | Evidence |
|---|---|---|
| M1 | Heading levels skipped on 9 pages (h1→h3 on 7, h2→h4 on 2) | static-HTML heading audit |
| M2 | Content images without `width`/`height` (blog cards, success gallery, hero poster) — layout-shift risk | 3 pages |
| M3 | `src/lib/seo.ts` description truncation had drifted from the prerender's, so hydration replaced complete sentences with `…` fragments | code comparison |
| M4 | `/terms` description was 68 characters and differed from the rendered one | crawl |
| M5 | Self-referential `hreflang` (`en-ca` + `x-default`) on a single-language site; `fr-CA` claimed in `WebSite` schema with no French pages | code |
| M6 | `theme-color` was `#059669`, not the brand green `#124C3B` | `index.html` |
| M7 | Legacy no-op meta (`revisit-after`, `geo.*`) and orphaned `og:image:width/height` | `MetaTags.tsx` |

### Low / informational

- `http://indigenousrising.ai` takes **two hops** to the canonical URL (http→https, then apex→www). The first hop is Vercel's forced TLS upgrade and cannot be collapsed in `vercel.json`. Left as-is.
- `/PRICING` (wrong case) returned 200; now 404. Nobody links it.
- `foundingDate: "2025"` in `Organization` schema — provenance unverified. **Left in place, flagged for you to confirm or remove.**
- `public/404.html` was a GitHub Pages redirect shim that would have turned every 404 into a JS redirect to the homepage. Removed.
- `Crawl-delay: 1` retained (ignored by Google, honoured by Bing).

---

## 2. Changes implemented

### Crawl and indexation (#192)
- **Scoped SPA rewrites** to the client-only route families (`/dashboard`, `/admin`, `/onboarding`, `/unsubscribe`, `/funding/*`, `/features/*`, `/community/*`). Prerendered pages are served from the filesystem first; everything else falls through to a new prerendered **`dist/404.html`** (`noindex, follow`, no canonical, links onward to the grants guide, funding, blog, pricing, contact).
- `404.html` is the **full SPA shell**, so a client-only route ever missed from the rewrite list still renders correctly for users — only its status code would be wrong. A test fails the build if any `<Route path>` is neither prerendered, redirected, nor rewritten.
- `trailingSlash: false`, plus permanent edge redirects for `/learning`, `/v1`, `/landing-v2`, `/login`, `/signin`.
- **robots.txt:** removed the five crawler-specific groups that were silently overriding the `Disallow` rules; un-blocked `/auth` and `/signup` so Google can read their `noindex`; added the tokenised `/funding/confirm`, `/funding/unsubscribe` and `/onboarding`. **The AI-crawler sovereignty policy is unchanged** (retrieval engines allowed on public pages, bulk training crawlers blocked).
- Verified every externally-emitted URL individually before scoping the rewrites: Stripe `success_url`/`cancel_url`/`return_url`, Supabase auth callbacks, and the email links in `subscribe-funding-alerts` and `send-funding-digest`.

### On-page and structured data (#193)
- **FAQ answers are in the page.** Replaced the accordion that unmounted them; every answer now renders and closed ones use the `hidden` attribute. Fixed the same bug on the homepage FAQ. This also repaired `aria-controls` pointing at a non-existent element.
- **One title per route.** `src/data/routeTitles.ts` is the single source; 22 page components and both `/auth` states import it, and the prerender loads the same module through esbuild. Every entry ≤60 characters.
- **Short blog titles.** `src/data/blogSeoTitles.ts` gives each post a ≤60-character search title for `<title>`/`og:title` only — H1s, URLs and slugs unchanged. `pageTitle()` appends the site name only when it still fits.
- **One owner per head tag.** The prerender writes title, description, canonical, robots, og:* and twitter:* for every prerendered route, unmarked; the page components emit none of them (93 meta tags removed from 10 files). Pages that must stay out of the index keep their own `noindex`.
  - *Why unmarked:* marking tags `data-rh` hands them to react-helmet-async, which **deletes** marked tags the current page does not re-emit. Measured on a preview: that left `/pricing` with **no canonical at all** and `/pricing` + `/community` with no `og:title`. Missing is worse than duplicated.
- **Structured data:** one entity per type per page. Fabricated dates removed; `SearchAction` and the `fr-CA` claim removed; `help@` corrected; `SoftwareApplication` emitted once, on the homepage, with offers matching live pricing (Free $0, Growth $49 — Nations is custom-quoted, so not priced); `WebSite` gained `@id`, `alternateName` and `publisher` for Google's site-name feature; `BlogPosting.publisher` gained its logo.
- **Breadcrumbs:** the component renders the visible trail with microdata and no longer emits JSON-LD; the prerender builds `BreadcrumbList` from a mirror of the component's own rules, so the markup matches the visible trail (`/funding/alerts` correctly gets three levels). **Eight more routes gained a static BreadcrumbList.** A test fails if the two rule sets drift.
- **Grants-hub FAQ:** the visible Q&A and the `FAQPage` markup were separate copies that had already drifted in wording. Extracted to `src/data/grantsHubFaqs.ts`, read by both.
- **Internal links:** `/funding`, `/plan`, `/impact` and `/funding/alerts` added to the footer — now linked from all 72 pages.
- Heading order fixed on 9 pages (same CSS classes, so nothing looks different); footer headings start at h2. Image dimensions added. `theme-color` corrected. Description truncation unified.

### Files changed
`vercel.json` · `public/robots.txt` · `public/404.html` (deleted) · `index.html` · `scripts/prerender.mjs` · `scripts/check-prerender.mjs` · `src/lib/seo.ts` · `src/components/MetaTags.tsx` · `src/components/StructuredData.tsx` · `src/components/Breadcrumbs.tsx` · `src/components/FAQSection.tsx` · `src/components/Footer.tsx` · `src/components/SuccessGallery.tsx` · `src/components/media/AmbientVideo.tsx` · `src/data/routeTitles.ts` (new) · `src/data/blogSeoTitles.ts` (new) · `src/data/grantsHubFaqs.ts` (new) · `src/data/blogPosts.ts` · 22 page components · 5 new test files

---

## 3. Pages optimized

All **72 indexable URLs**. Specifically:

- **24 marketing routes** — title, description, canonical, robots, og/twitter, breadcrumb, heading order
- **51 blog posts** — short search titles, single-copy `BlogPosting`/`BreadcrumbList`/`FAQPage`, publisher logo
- **`/faq`** — 15 answers made indexable
- **homepage** — 10 FAQ answers made indexable, single `SoftwareApplication`, site-name signals
- **`/plan`, `/impact`, `/funding`, `/funding/alerts`** — de-orphaned
- **404** — now a real 404 with a useful page

---

## 4. Keyword map

Search-volume data was not available, so queries are ranked by intent and commercial value, not volume. **Assumption, not measurement.**

### Primary intent per page (prevents cannibalization)

| Page | Primary intent | Target cluster |
|---|---|---|
| `/` | Transactional | indigenous business funding platform, indigenous grant finder |
| `/guides/indigenous-business-grants` | Commercial pillar | **indigenous business grants canada**, indigenous business funding canada |
| `/funding` | Transactional | find indigenous business funding, indigenous grants database |
| `/plan` | Transactional | indigenous business plan builder/template |
| `/pricing` | Transactional | indigenous rising ai pricing |
| `/impact` | Commercial (Nations/EDOs) | community impact tracking, indigenous economic development reporting |
| `/funding/alerts` | Transactional | indigenous funding alerts, grant deadline alerts |
| `/training` | Commercial | indigenous business training online |
| `/demo` | Transactional | book a demo |
| Blog | Informational | everything below |

### By intent (selected, highest-value marked ★)

**Transactional / commercial:** ★indigenous business grants canada · ★indigenous business funding canada · ★indigenous grant finder tool · indigenous business loans canada · non-repayable indigenous business contributions · ★indigenous business plan template · grant tracking software first nations · indigenous economic development software

**Informational:** ★how to apply for the aboriginal entrepreneurship program · ★futurpreneur indigenous entrepreneur startup program · indigenous growth fund how to apply · bdc indigenous entrepreneur loan · equity contribution for an indigenous business loan · how to write a business plan for an AFI loan · what is an aboriginal financial institution

**Location:** first nations business grants alberta / bc / ontario / saskatchewan / manitoba · indigenous business grants atlantic canada · inuit business funding nunavut · indigenous business grants nwt / yukon · métis business funding by province · financement entreprise autochtone québec (FR)

**Problem-aware:** why was my indigenous business loan denied · do I need Indian status for indigenous business funding · starting a business on reserve · section 87 and business income · OCAP principles explained · data stored in canada business software

**Industry:** indigenous tourism / agriculture / fisheries / construction / cannabis / clean energy / tech business funding

**Audience:** indigenous women entrepreneurs funding · indigenous youth entrepreneur grants · indigenous veterans business support · two-spirit and LGBTQ+ indigenous entrepreneurs

**Role-based (Nations/AFIs):** first nation economic development officer tools · LEDSP funding · strategic partnerships initiative · band-owned business funding · aboriginal financial institution portfolio tools

### Cannibalization to resolve (not yet actioned — needs your call)

| Pages competing | Same query | Recommendation |
|---|---|---|
| `/guides/indigenous-business-grants` **and** `/blog/ultimate-guide-indigenous-business-grants-canada-2025` | indigenous business grants canada | The hub should own it. Either consolidate the post into the hub with a 301, or narrow the post to "how the funding system works" and have it link up to the hub. Both currently target the same query with similar content. |
| `/blog/aboriginal-capital-corporations-complete-guide-canada` **and** `/blog/indigenous-financial-institutions-community-banking-partners` | aboriginal financial institutions | Overlapping topics (ACCs are a type of AFI). Merge, or differentiate clearly. |
| `/blog/how-to-write-winning-indigenous-business-plan-funding` **and** `/plan` | indigenous business plan | Fine as-is (informational vs tool), but the post should link prominently to `/plan`. |

---

## 5. New content opportunities

The blog already covers most of the obvious gaps (51 posts spanning provinces, Métis, Inuit, women, youth, AFIs, tax, certification, procurement), so **the priority is consolidation and freshness, not volume.** Genuine gaps, in priority order:

1. **Indigenous business plan template (HTML, on `/plan`)** — the strongest gap: results for this query are 2018–2019 PDFs. Needs section-by-section guidance for the six real sections including Community Impact, plus what AFIs typically ask for (confirm with 2–3 AFIs; do not guess).
2. **"How to apply for the Aboriginal Entrepreneurship Program"** — ISC's own page is thin on procedure; the IFI/MCC route, documents, equity contribution and timelines are winnable.
3. **"Find your Aboriginal Financial Institution or Métis Capital Corporation"** — explain the types and link NACCA's directory rather than copying it.
4. **Northern/Inuit funding guide** — must be Inuit-specific (CanNor delivery partners), not First Nations framing reused.
5. **Economic development officer resource hub** — supports the Nations plan; LEDSP/SPI/CEDI overviews, deadline-tracking workflows.
6. **OCAP® and data sovereignty for business software** — what OCAP® is (link FNIGC), what `ca-central-1` does and does not mean. **Never write "OCAP-certified"** — no public FNIGC certification scheme for software exists; keep "aligned with" and describe the concrete controls.
7. **Registering as an Indigenous business: CCIB CIB vs the ISC Indigenous Business Directory, and the 5% procurement target.**
8. **French: "Financement pour entrepreneurs autochtones au Québec"** — written natively, not machine-translated.

**Rules for all of the above:** name specific Nations, organizations and programs; never "Indigenous people believe…"; no invented statistics or approval odds; show a reviewer and a "last verified" date; have Indigenous advisors review culturally-situated content.

### Deliberately NOT built

**Per-program pages at `/funding/<id>`.** The data does not support them yet: **17 published programs, 0 marked `verified`, descriptions averaging 168 characters.** Pages like that would be thin, programmatic pages of unverified funding information — the exact scaled-content pattern Google's spam policies target, and a trust risk on funding facts. Revisit once each record has a verified description, eligibility summary, amounts, deadline and source URL with a last-verified date. `/funding/:id` is currently linked from nowhere, so nothing is orphaned or broken in the meantime.

**New `FAQPage` markup.** Google retired FAQ rich results in Search on **7 May 2026** (documentation removed 15 June 2026). Existing markup is kept because the Q&A is useful on-page and machine-readable for AI answer engines, but it earns no rich result and none was added for that purpose.

**HowTo schema** — deprecated since 2023; not used.

---

## 6. Core Web Vitals, mobile, images

Measured on production (desktop 1440, mobile 375, headless Chrome, cold cache):

| Metric | Desktop | Mobile |
|---|---|---|
| TTFB | 22 ms | 22 ms |
| FCP | 244 ms | 232 ms |
| CLS | **0** | **0** |
| Transfer (first load) | 119 KB | — |

- No render-blocking hero video: `AmbientVideo` fails closed to a poster image under reduced-motion, below 768px, on Save-Data, and until scrolled into view.
- Imagery is AVIF/WebP with JPEG fallbacks and per-width sources; below-the-fold images lazy-load, the LCP hero image does not.
- Mobile: 72 routes previously swept at 320/375/390/430/768/820/1024/1280/1440/1920 with no horizontal overflow; the accessibility and launcher fixes in #189–#191 landed before this audit.
- **Not measured: Lighthouse scores.** The 90+ target is an assumption — the field metrics above are strong, but Lighthouse was not run in this pass. Run it from Chrome DevTools or PageSpeed Insights for a scored report.

---

## 7. AI search readiness

- `robots.txt` deliberately allows retrieval/answer engines (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`) on public content while blocking bulk training crawlers (`GPTBot`, `CCBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`). **This is a sovereignty decision and was left exactly as it was.**
  - Note: `Google-Extended` does not affect Google Search or AI Overviews (those use Googlebot), so AI Overview eligibility is unaffected.
- Every one of the 72 URLs ships real, non-JS-dependent content (≥200 words) — enforced in CI by `scripts/check-prerender.mjs`.
- The FAQ fix materially improves extractability: 25 question/answer pairs that were absent from the DOM are now present as text.
- Entity clarity: `Organization` + `WebSite` with `@id`, `alternateName`, `publisher`, `knowsAbout`, and `areaServed: Canada`.
- Google's own guidance (May 2026) states there are no special requirements for AI features and that **Search does not use `llms.txt`** — so none was added.

---

## 8. Commands run and results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | 0 errors, 2 pre-existing warnings (react-refresh export shape in `trust/index.tsx`, untouched) |
| `npm run build` | passes — 76 static files (24 marketing + 51 blog + 404), sitemap 72 URLs |
| `node scripts/check-prerender.mjs` | OK — 72 URLs, distinct title + description, ≥200 words each |
| `npx vitest run` (SEO suites) | 100 tests passing across 14 files; **44 new SEO guards** added |
| Mutation testing | 18 mutations introduced across the new guards; **all 18 caught** |
| Static crawl (72 URLs) | 200s, no duplicate titles/descriptions, no broken internal links, no invalid JSON-LD |
| Rendered-DOM audit (23 routes, preview) | all clean: one canonical, description, robots, og:title each; no duplicate schema; no title drift; FAQ answers present |
| Live HTTP probes (#192, production) | unknown URL → 404; `/blog/<fake>` → 404; `/pricing/` → 308; `/learning` → 308; `/dashboard` → 200; dynamic routes → 200 |
| Live verification (#193, production, real browser) | `/faq`, `/pricing`, `/terms`, `/impact` and a blog post each show exactly one canonical, description, robots and og:title, no `data-rh`, and the shared titles; FAQ answers visible |

---

## 9. Remaining external actions (need your access)

1. **Google Search Console** — I have no access. Please:
   - Submit `https://www.indigenousrising.ai/sitemap.xml` and confirm 72 URLs discovered.
   - Use **Removals → Outdated content** / re-crawl for any URL previously indexed as a soft 404.
   - Check **Pages → "Indexed, though blocked by robots.txt"** — `/auth` and `/signup` were in that state; they can now be read and dropped correctly.
   - Verify the **site name** shows as "Indigenous Rising AI" (Appearance → Site names).
   - Watch **Experience → Core Web Vitals** field data over the next 28 days.
   - Check the **generative-AI performance report** for AI Overview/AI Mode impressions.
2. **Bing Webmaster Tools** — submit the same sitemap (significant Canadian share).
3. **Confirm or remove `foundingDate: "2025"`** in the Organization schema — I could not verify it and will not assert it.
4. **`SUPABASE_ACCESS_TOKEN`** repo secret — still unset; the edge-function deploy workflow has failed every run (unrelated to SEO but blocking).
5. **Content refresh for 2025-dated posts** — ~30 posts carry "2025" in the title and body. Their *search titles* are now year-free, but the content needs verification against current program amounts and deadlines, with a visible "last verified" date. This is a factual-accuracy task, not a find-and-replace: **do not bulk-change 2025 → 2026.**
6. **Decide the cannibalization cases** in §4.
7. **Lighthouse run** for a scored performance number.

---

## 9b. URGENT — Vercel Security Checkpoint is currently active on production

Near the end of this audit, `https://www.indigenousrising.ai` began returning **HTTP 403 with a "Vercel Security Checkpoint"** page to non-browser clients. Most likely triggered by the volume of automated requests this audit made.

**What is verified:**
- A **real browser passes the challenge** and the site loads normally (confirmed in Chromium: `/faq` rendered with the correct title and all answers visible). Ordinary visitors are very likely unaffected.
- `curl` and headless Chrome both get 403 ("Failed to verify your browser, Code 29").
- Vercel's own documentation says Attack Mode "challenges browser traffic **while allowing known bots**" / "allowing known legitimate bots through", so **Googlebot should not be challenged**.

**What is NOT verified (assumption):** that Googlebot is in fact passing. That needs Search Console.

**Please do this:**
1. Vercel dashboard → project → **Firewall**: check whether **Attack Challenge Mode** is on. If it was enabled automatically or by this traffic and you do not need it, turn it off (`vercel firewall attack-mode disable --yes`). *I did not change it — it is a security setting and yours to decide.*
2. Search Console → **URL Inspection → Test live URL** on `/`, `/faq` and one blog post. A pass confirms Googlebot is not being challenged; a fetch failure means the mode must be disabled or Googlebot allow-listed.
3. If it stays on, re-check after it expires (CLI-enabled Attack Mode lasts 1h/6h/24h; dashboard-enabled stays until disabled).

---

## 10. Backlink and authority opportunities

Earned, not bought — paid guest posts and link insertions are explicitly targeted by Google's site-reputation-abuse policy.

| Target | Legitimate route |
|---|---|
| **NACCA** and the AFI network (All Nations Trust, AIIC, Waubetek, Ulnooweg, TRICORP) | Offer free Nations/AFI accounts or a pilot; AFIs link tools that help applicants arrive loan-ready |
| **CCIB** | Membership, Tools for Indigenous Business partnership, event participation, member-directory profile |
| **Métis Capital Corporations** (LRCC, MFCBC, MVDF, SMEDCO, Apeetogosan) | Co-create Métis-specific business-plan guidance |
| **Cando / Virtual EDO** | Present at the Cando conference; offer tools to EDO certification cohorts; resource listings |
| **Futurpreneur** | Resource/partner listing — its IESP requires a business plan, so `/plan` fits |
| **University Indigenous business LibGuides** (UCalgary, UAlberta, CBU Purdy Crawford, Dalhousie) | Request inclusion once the business-plan template and OCAP explainer are substantive; LibGuides link free, non-promotional resources |
| **Business Link Alberta**, Ontario Indigenous Business Navigator, FedDev guides | Resource-page outreach for the free tier |
| **NationTalk, Windspeaker/AMMSA, APTN, Indigenomics** | Real news only (launches, AFI partnerships) — no invented data stories |
| **AFOA Canada** | Workshop at their national conference |
| **Directories** | CCIB CIB directory and the ISC Indigenous Business Directory **only if the ownership/control criteria are genuinely met** |

---

## 11. Priority plan

### Next 30 days
1. Search Console + Bing actions in §9 (you).
2. Resolve the three cannibalization cases (§4) — the grants-hub vs ultimate-guide overlap is the highest-value single fix.
3. Content-refresh the top 10 funding posts by traffic with verified figures and a visible "last verified" date.
4. Expand `/plan` into the business-plan template page (gap #1) — it is already de-orphaned and has a matching title.
5. Confirm/remove `foundingDate`.
6. Run Lighthouse; fix anything under 90 that is not architectural.

### Days 30–60
7. Write gaps #2–#4 (AEP application guide, AFI/MCC finder, Northern/Inuit guide).
8. Build the EDO resource hub supporting the Nations plan.
9. Start the backlink outreach in §10, beginning with NACCA/CCIB/Cando where a product offer is the hook.
10. Verify the funding database: add verified descriptions, eligibility, amounts, deadlines and source URLs. **Only then** reconsider per-program pages.
11. Add a `lastmod` to marketing sitemap entries (currently only blog posts carry one).

### Days 60–90
12. Ship per-program pages **if and only if** the data passes the quality bar in §5.
13. French content: `/pricing`, `/funding`, and the Québec funding guide, written natively, with correct `hreflang` (the self-referential version was removed; it returns properly when real alternates exist).
14. Re-run the full audit (static crawl + rendered-DOM audit + HTTP probes) and compare against this document.
15. Review AI-answer-engine citations for the FAQ and guide pages now that the answers are extractable.

---

## 12. Regression guards added

These fail CI, so the fixes cannot silently rot:

| Test | Guards |
|---|---|
| `seo-indexation.test.ts` | no catch-all rewrite; every `<Route>` prerendered/redirected/rewritten; trailing-slash setting; legacy aliases; no crawler-specific robots group; noindex pages not blocked; AI-crawler policy intact |
| `seo-on-page.test.ts` | title lengths; seoTitle coverage/uniqueness; prerender is the only source of head tags; FAQ answers in the DOM; no invented dates; no SearchAction; correct support address; single `SoftwareApplication`; image dimensions; footer links; heading order |
| `seo-schema-single-source.test.ts` | one emitter per schema type; breadcrumb rule maps cannot drift; grants-hub FAQ single source; canonical/robots ownership; noindex pages keep theirs |
| `seo-title-parity.test.ts` | every prerendered route has a shared title; no page hardcodes one; all ≤60 chars; unique |
| `check-prerender.mjs` (existing) | every sitemap URL ships ≥200 words of non-JS content with a distinct title and description |

---

## 13. Honest limitations

- **No Search Console, Bing, or third-party rank/backlink data** was available, so there is **no ranking, impression, click, or backlink baseline** in this document. Keyword priorities are intent-based judgements, not volume-based.
- **Search-results analysis is indicative, not authoritative** — gathered via a non-Google search tool, so competitor positions should be re-checked in a Canadian rank tracker.
- **No Lighthouse score.** Field metrics were measured; the 90+ target is unverified.
- **Real-device testing** (iOS Safari, Android Chrome) was not performed in this pass.
- Structured data was validated by parsing and by type/duplicate checks in the rendered DOM — **not** through Google's Rich Results Test, which needs a browser session.
- The dashboard (authenticated app) is intentionally `noindex`/disallowed and was not optimized for search.
