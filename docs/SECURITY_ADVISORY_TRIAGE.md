# Dependency advisory triage

## react-router / react-router-dom — 2 moderate, NOT upgrading

**Advisory:** Open redirect via backslash in `<Link>` and `useNavigate`
(CVE-2025-68470 bypass).
**Available fix:** `react-router-dom@7.18.2` — a **major, breaking** upgrade.
**Decision: not applying.** Re-triage if the conditions below change.

### Why

The vulnerability requires a **user-controlled navigation target** — a value
that reaches `<Link to={…}>` or `navigate(…)` from a URL parameter, form field,
or API response. This application has none.

Audited every non-literal navigation target in `src/`:

| Site | Source of the target | User-controlled? |
|---|---|---|
| `FeatureCard.tsx:55` `navigate(to)` | `to` prop; its only caller builds `` `/features/${feature.slug}` `` from a hardcoded feature list | No |
| `GlobalSearch.tsx:94` `navigate(result.url)` | hardcoded mock array of six literal paths — **and the component was orphaned**; deleted in this change | No |

There is also no `?redirect=` / `?next=` / `?returnTo=` pattern anywhere: the
only `URLSearchParams` reads are `?billing=` on the pricing page (compared
against the literal `'monthly'`, never navigated to) and outbound query
building for Supabase REST calls.

So the exploit path does not exist here, while a major React Router upgrade
touches every route in the app — poor risk/reward against an unreachable issue.

### Re-triage this decision if any of these become true

* Any `navigate()` or `<Link to>` starts taking a value from a URL parameter,
  form input, or API response — a post-login `?redirect=` is the classic case.
* React Router publishes a **non-breaking** patch for a v6 line.
* The advisory is re-scored above moderate, or a new one lands that does not
  depend on user-controlled targets.

Last reviewed: 2026-08-26.
