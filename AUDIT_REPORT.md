# Audit Report — Indigenous Rising AI
**Date:** 2026-04-05  
**Auditor:** Claude Code (claude-sonnet-4-6)  
**Scope:** Full production-hardening audit — security, correctness, data integrity, UI behaviour

---

## Methodology

Six-phase structured audit:

1. **Discovery** — enumerate all source files, edge functions, migrations, config
2. **Static validation** — typecheck (`tsc --noEmit`), lint (`eslint`), test suite (`vitest`)
3. **Deep code audit** — manual review of every file in scope
4. **Fix implementation** — critical → high → medium priority order
5. **QA pass** — re-run all checks after each batch
6. **Final validation** — full suite clean, reports generated

---

## Findings Summary

| Priority | ID | File | Issue | Status |
|---|---|---|---|---|
| CRITICAL | C-1 | `src/pages/dashboard/Settings.tsx` | Password change was a fake `setTimeout` — no Supabase call made | Fixed |
| CRITICAL | C-2 | `src/pages/Auth.tsx` | No forgot-password flow existed | Fixed |
| HIGH | H-1 | `src/pages/dashboard/Funding.tsx` | All 5 deadline dates expired (2024); status hardcoded | Fixed |
| HIGH | H-2 | `public/_headers` | CSP `connect-src` missing GA4 and Stripe — blocked in prod | Fixed |
| HIGH | H-3 | `src/pages/dashboard/Settings.tsx` | Data export contained only localStorage mock, not real user data | Fixed |
| MEDIUM | M-1 | `CookieConsent.tsx`, `lib/analytics.ts`, `lib/planExport.ts` | `console.log`/`console.info` left in production paths | Fixed |
| MEDIUM | M-2 | `src/components/PlanStepper.tsx` | Analytics imported from dead localStorage module instead of GA4 | Fixed |
| (prev) | P-1 | `supabase/functions/newsletter-subscribe/index.ts` | Rate-limit query used `created_at` (non-existent) → bypassed | Fixed (prior session) |
| (prev) | P-2 | `src/lib/validation-schemas.ts` + `DataRequestForm.tsx` | `withdraw-consent` → broken transform → `withdraw_consent` ≠ DB enum `consent_withdrawal` | Fixed (prior session) |
| (prev) | P-3 | `src/components/NewsletterSignup.tsx` + `DataRequestForm.tsx` | `console.debug` calls leaked to test output | Fixed (prior session) |
| (prev) | P-4 | `supabase/functions/create-checkout/index.ts` | Empty string passed to Stripe when `STRIPE_SECRET_KEY` missing | Fixed (prior session) |
| (prev) | P-5 | `src/App.tsx` | Duplicate `/success-stories` route (silent first-match win) | Fixed (prior session) |
| (prev) | P-6 | `.claude/settings.json` | Wrong model ID `claude-sonnet-4-20250514` | Fixed (prior session) |
| (prev) | P-7 | `package.json` | Generic name `vite_react_shadcn_ts`; missing `typecheck` script | Fixed (prior session) |

---

## Critical Findings Detail

### C-1 — Fake Password Change (Settings.tsx)

**Impact:** Users believed their password was changed. It was not. Zero Supabase calls made.

**Root cause:** Handler used `await new Promise(resolve => setTimeout(resolve, 800))` with `toast.success` — simulating success without any network call.

**Fix:** Re-authenticate with `supabase.auth.signInWithPassword` to verify current password, then `supabase.auth.updateUser({ password: newPassword })`.

---

### C-2 — No Forgot Password Flow (Auth.tsx)

**Impact:** Users locked out of accounts had no self-service recovery path.

**Root cause:** The component had no `isForgotPassword` state or handler. No `supabase.auth.resetPasswordForEmail` call existed anywhere in the frontend.

**Fix:** Added `isForgotPassword` state, `handleForgotPassword` calling `supabase.auth.resetPasswordForEmail` with `redirectTo: window.location.origin + '/auth'`, and full UI (form, back link, "Forgot your password?" button).

---

## High Findings Detail

### H-1 — Expired Funding Deadlines (Funding.tsx)

**Impact:** Indigenous entrepreneurs saw `status: 'open'` funding opportunities with deadlines in 2024. Misleading — could cause missed real opportunities and wasted application effort.

**Root cause:** Deadlines hardcoded as 2024 strings; status fields hardcoded as string literals (`'open'`).

**Fix:** Updated all 5 expired deadlines to 2026. Added `deriveStatus(deadline: string)` helper that computes `open | closing_soon | closed` from actual date arithmetic. All `status` fields now call `deriveStatus(deadline)`.

---

### H-2 — CSP Blocks GA4 and Stripe (public/_headers)

**Impact:** In production (Vercel with `_headers` enforced), GA4 events fail silently; Stripe Checkout iframe is blocked.

**Root cause:** `connect-src` only included `*.supabase.co` and `api.hubapi.com`.

**Fix:** Added to `connect-src`: `https://api.stripe.com`, `https://analytics.google.com`, `https://www.google-analytics.com`, `https://stats.g.doubleclick.net`. Added `https://js.stripe.com` to `script-src` and new `frame-src` directive.

---

### H-3 — Data Export Contains Only Mock Data (Settings.tsx)

**Impact:** OCAP™ compliance risk — users invoking "Export My Data" received only their current UI preferences from `localStorage`, not their actual Supabase profile or subscription data.

**Root cause:** Handler used `await new Promise(resolve => setTimeout(resolve, 2000))` then serialised the local React state.

**Fix:** Query `profiles` table (`id, email, full_name, created_at, updated_at`) and `subscriptions` table (`stripe_product_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at`) via `Promise.all`. Export includes both DB records and local preferences.

---

## Medium Findings Detail

### M-1 — Console Noise in Production

Three files had `console.log`/`console.info` calls that fire in production bundles:

- `CookieConsent.tsx:69` — `console.log('Cookie preferences saved:', prefs)` logged consent choices on every save
- `lib/analytics.ts:25` — `console.info('TRACK_EVENT', payload)` logged every analytics call
- `lib/analytics.ts:35` — `console.info('FLUSHING_EVENTS', arr)` logged the full event queue on flush
- `lib/planExport.ts:3,16,20` — `console.info(...)` in all three export placeholder functions

All removed.

---

### M-2 — PlanStepper Imports Dead Analytics Module

**Impact:** No events fired to GA4 when users completed business plan steps. The `@/lib/analytics` module only wrote to a `localStorage` queue that was never flushed to any endpoint.

**Root cause:** `PlanStepper.tsx` imported `trackEvent` from `@/lib/analytics` (localStorage queue placeholder) instead of `@/utils/analytics` (GA4 via `window.gtag`).

**Fix:** Changed import to `@/utils/analytics`. Updated `PlanStepper.test.tsx` to stub `window.gtag` and assert GA4 calls.

---

## Out of Scope / Not Fixed

The following were observed but not fixed — they require product decisions or larger refactors:

| File | Issue | Reason not fixed |
|---|---|---|
| `src/pages/dashboard/Profile.tsx` | All 3 save handlers are `setTimeout` simulations | Requires knowing which profile fields map to which Supabase columns; no migration confirms them beyond `full_name` |
| `src/components/DataExportControls.tsx` | Uses `alert()` placeholder | Needs product decision on export format/endpoint |
| `src/components/RoleInvites.tsx` | Uses `alert()` placeholder | Needs product decision on invite system |
| `src/hooks/useAICopilot.ts` | Returns mock text | Requires real AI backend integration |
| `eslint.config.js` | `no-unused-vars: off`, `no-explicit-any: off`, `ban-ts-comment: off` | Fixing would require touching many files; log for future sprint |

---

## Final QA Results

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ 0 errors |
| `eslint .` | ✅ 0 warnings |
| `vitest --run` | ✅ 76/76 passing |
| `vite build` | ✅ Built in 6.10s |
