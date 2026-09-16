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
