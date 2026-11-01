# CLAUDE.md — Indigenous Rising AI

## Product
- **Indigenous Rising AI** — AI business support for Indigenous entrepreneurs
  and First Nations economic development: funding discovery and matching,
  business planning, community growth tools.
- Stage: production. Live: https://www.indigenousrising.ai
- Support: help@indigenousrising.ai
- Partners referenced in copy: NACCA, CCIB, AFN, ISC, MNC, ITK.

## Cultural and data guardrails (highest priority)
- Built on **OCAP** principles — Ownership, Control, Access, Possession.
  Community and member data belongs to the community. Never export, aggregate,
  or reuse it for another purpose without an explicit consented path.
- Never claim endorsement, partnership, or affiliation with a Nation,
  organization, or program that is not documented. Do not add a logo or a partner
  name on your own initiative.
- Funding information is decision support, not an eligibility determination or
  an application guarantee. Keep program source links and freshness dates
  visible — `check-funding-freshness` exists for that reason; stale funding data
  must be labelled, never silently shown as current.
- Write respectfully and specifically: no pan-Indigenous generalizations, no
  invented statistics, no appropriated visual motifs.

## Stack
Vite + React 18 with SSR prerender · TypeScript strict · React Router 6 ·
Tailwind + shadcn/ui · Supabase (Auth, RLS, Postgres — Canadian region, 17 Edge
Functions, 38 migrations) · Stripe (CAD) · dompurify · recharts · Vitest ·
Vercel + Speed Insights.

## Repo map
- `src/pages`, `src/components`, `src/hooks`, `src/lib`, `src/integrations`,
  `src/__tests__`
- `supabase/functions/` — `match-funding-opportunities`,
  `check-funding-freshness`, `send-funding-digest`,
  `subscribe-funding-alerts` / `confirm-` / `unsubscribe-`,
  `newsletter-subscribe` / `-unsubscribe`, `submit-contact`,
  `submit-data-request`, `submit-career-application`, `create-checkout`,
  `customer-portal`, `check-subscription`, `stripe-webhook`, `ai-assistant`,
  `site-assistant`
- `seed/`, `brand/`, `tests/`, `docs/`, `.harness/`
- `mobile/` — Expo (React Native) iOS/Android app, its own `package.json`.
  Same Supabase project, tables and Edge Functions as the web; no duplicate
  backend. Run its commands from inside `mobile/` (see `mobile/README.md`).
  Plans are sold on the web only; the app shows subscription status read-only.

## Commands
```
npm run dev
npm run dev:harness
npm run lint
npm run typecheck            # tsc --noEmit
npm run test                 # vitest
npm run build                # vite build + SSR + prerender
npm run verify:auth-journey
```

## Email and privacy rules
- CASL applies: double opt-in via `confirm-funding-alert-subscription`, a working
  unsubscribe in every digest, and no sending to unconfirmed addresses.
- `submit-data-request` is a privacy obligation — do not change its retention or
  response behaviour without flagging it.
- Sanitize all user-generated and program-sourced HTML with dompurify.

## Supabase rules
Append-only, timestamped migrations; RLS on every member/community-facing table,
tested with two accounts; service-role key only in Edge Functions.

## Definition of done
Files changed; lint + typecheck + vitest results; unverified items; migrations,
env vars, or cron changes needed.

## Product iteration directive (owner request, 2026-11-01)

> Look at the site first, then innovate. Think about the user experience and think outside the box. Make one bold change that improves conversions or the look and feel, not a small tweak. Use any tool you have. You must ship a change every time.

Apply this directive to authorized product-iteration work, not to every read-only
question, audit, or instruction-maintenance task. Agent-team setup remains the
current priority; recording this direction does not start an automatic redesign.

- Inspect the actual site and relevant user flow first, including mobile, and
  record evidence of the friction or opportunity. If access is blocked, report
  that limitation rather than claiming the site was inspected.
- Choose one bold, coherent, testable improvement rather than unrelated tweaks.
  State the hypothesis, capture an available baseline, and propose a success
  metric and validation method. Label missing analytics honestly; never invent
  conversion lift, customers, testimonials, capabilities, or measured results.
- Check active branches, PRs, ownership and release holds before starting. Reuse
  matching work rather than duplicating it; do not disturb held work or unrelated
  changes. Preserve all existing domain, privacy, security and honesty rules.
- Validate the affected experience: accessibility (keyboard, focus, contrast,
  reduced motion), mobile/responsive layout, relevant end-to-end flows, and
  regressions. Run applicable repository checks; report passed, failed, skipped
  and unverified checks separately. Never bypass a failing gate to claim success.
- For this product-iteration directive, "ship" means a tested branch / draft-PR
  deliverable until applicable merge/deploy approval and release gates are met.
  This scoped boundary takes precedence over any general auto-push convention
  for this work. Do not push directly to main, merge, enable auto-merge, deploy
  production, or release to an app store merely to satisfy "every time".
  If blocked, deliver the evidence and exact blocker instead of a broken change.
- "Use any tool" means tools already authorized for this task. It does not
  authorize new keys/accounts, paid services, third-party outreach, changes to
  global Claude permissions/authentication, or overwriting existing instructions.
- Preserve native companion-app payment restrictions and store-review holds.
  No IAP additions, native purchase/billing links or purchase steering, blanket
  Solo-plan removal, revocation of legacy entitlements/access, or app-store-policy
  regressions. Pricing/payment/entitlement changes require their own explicit
  authorization and applicable review; conversion goals do not override them.
