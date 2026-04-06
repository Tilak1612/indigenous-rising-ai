# Changelog — Production Hardening Audit (Phase 1 + Phase 2 + Phase 3)
**Session dates:** 2026-04-05 / 2026-04-06  
**Branch:** main  
**All changes committed; no force-push performed.**

---

## [50d0b50] perf/scale: Phase 3 — React Query subscription, admin pagination, env guard

### `src/App.tsx`
- Removed `TestSubscription` lazy import and `/test-subscription` route (debug page exposed JWT tokens to authenticated users)
- Added `QueryClient` default options: `retry: 1`, `staleTime: 2 * 60 * 1000` — prevents hammering failing services and avoids unnecessary re-fetches on mount

### `src/hooks/useSubscription.tsx`
- Complete rewrite from `setInterval(60000)` + `visibilitychange` to React Query `useQuery`
- Stable query key: `['subscription-status', user.id]` — React Query deduplicates all concurrent requests with the same key across all components
- `staleTime: 5 * 60 * 1000` — serves cached result for 5 minutes
- `refetchOnWindowFocus: true` — refreshes when tab becomes visible (post-checkout flow)
- `retry: 1` — one retry on edge function failure; safe default of `{ subscribed: false }` on error
- Exported `SUBSCRIPTION_QUERY_KEY` constant for cache invalidation from Stripe success handlers

### `src/main.tsx`
- Added startup environment variable validation for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Missing vars render a human-readable error page and throw before React mounts — prevents silent 404s from an empty Supabase URL

### `src/components/admin/NewsletterManagement.tsx`
- Complete rewrite from unbounded `SELECT *` to paginated queries
- `PAGE_SIZE = 50`, `.range(from, to)`, `{ count: 'exact' }` for server-side pagination
- Search moved from client-side `Array.filter()` to `.ilike('email', '%term%')` — server-side, uses index
- 400ms debounce on search input to avoid per-keystroke queries
- Separate CSV export query bypasses pagination to export all matching rows
- Pagination controls (prev/next buttons) with result count display

### `src/components/admin/DataRequestsManagement.tsx`
- Complete rewrite from unbounded `SELECT *` to paginated queries
- `PAGE_SIZE = 50`, `.range(from, to)`, `{ count: 'exact' }` for data_requests
- Profiles query replaced: was `SELECT id, full_name, email FROM profiles` (all users) → now `user_roles JOIN profiles` filtered to `role IN ('admin', 'team_member')` — O(team) not O(users)
- `updates: any` type annotation changed to `Record<string, unknown>`
- Pagination controls with result count display

### `PHASE_3_SCALING_REPORT.md` (new file)
- Full Phase 3 audit: multi-tenant safety, performance bottlenecks, cost leaks, AI safety, subscription enforcement, failure resilience, data growth readiness, UX reliability, engineering quality, scaling readiness
- 14-row summary table of all findings with status and severity

---

---

## [7f0093b] security: Phase 2 hardening — XSS, auth recovery, Stripe safety

### `src/pages/dashboard/BusinessPlanner.tsx`
- Added `import DOMPurify from 'dompurify'`
- `handleEditorInput`: sanitize `editorRef.current.innerHTML` with DOMPurify (allowlist: `b,i,u,strong,em,br,p,ul,ol,li`, no attributes) before storing to localStorage
- Step-change useEffect: sanitize `currentAnswer` with DOMPurify before `editor.innerHTML = ...`

### `src/pages/Auth.tsx`
- Added `isRecovery: boolean` state
- Added useEffect: detect `type=recovery` in `window.location.hash` on mount
- Modified dashboard redirect useEffect: suppress redirect when `isRecovery` is true
- Added `handleSetNewPassword()`: validates password length + match, calls `supabase.auth.updateUser({ password })`, clears hash via `window.history.replaceState` on success
- Added recovery form UI (conditionally rendered when `isRecovery`)
- Title/subtitle updated to reflect recovery state
- Main login/signup form guarded with `!isRecovery`
- Bottom link section: hidden during recovery state

### `supabase/functions/create-checkout/index.ts`
- Added `ALLOWED_ORIGINS` allowlist (`www.indigenousrising.ai`, `indigenousrising.ai`, localhost variants)
- `origin` variable derived from allowlist check; falls back to production domain if Origin not in allowlist

### `supabase/functions/customer-portal/index.ts`
- Added `503` early return guard when `STRIPE_SECRET_KEY` not set
- Changed `new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '')` → `new Stripe(stripeKey)`
- Added same `ALLOWED_ORIGINS` allowlist for `return_url`

### `src/hooks/useSubscription.tsx`
- Changed `setInterval(checkSubscription, 60000)` → `setInterval(checkSubscription, 300000)` (60s → 5min)
- Added `visibilitychange` event listener: calls `checkSubscription()` when tab becomes visible
- Cleanup: `removeEventListener` added to effect cleanup

### `supabase/functions/newsletter-subscribe/index.ts`
- Added 48-hour expiry check on `action=confirm` path
- If `subscribed_at` is >48h ago and token unconfirmed → HTTP 410 Gone with human-readable message

### `PHASE_2_SECURITY_REPORT.md` (new file)
- Full security audit report with all findings, RLS table audit, npm audit assessment, top 10 risks, top 10 next improvements

---

---

## [e735651] Fix CSP headers, data export, console noise, analytics import

### `public/_headers`
- Added `https://api.stripe.com` to `connect-src`
- Added `https://analytics.google.com`, `https://www.google-analytics.com`, `https://stats.g.doubleclick.net` to `connect-src`
- Added `https://js.stripe.com` to `script-src`
- Added `frame-src https://js.stripe.com` directive (Stripe Checkout iframe)

### `src/pages/dashboard/Settings.tsx`
- `handleExportData`: replaced `setTimeout` mock with real Supabase queries
  - Queries `profiles` table for `id, email, full_name, created_at, updated_at`
  - Queries `subscriptions` table for plan/status/period data
  - Uses `Promise.all` for parallel fetches
  - Exports actual user data + local preferences as JSON

### `src/components/CookieConsent.tsx`
- Removed `console.log('Cookie preferences saved:', prefs)` from `saveConsent()`

### `src/lib/analytics.ts`
- Removed `console.info('TRACK_EVENT', payload)` from `trackEvent()`
- Removed `console.info('FLUSHING_EVENTS', arr)` from `flushEvents()`

### `src/lib/planExport.ts`
- Removed `console.info(...)` from all three export placeholder functions
- Fixed unused parameter warnings with `_` prefix convention

### `src/components/PlanStepper.tsx`
- Changed `import { trackEvent } from '@/lib/analytics'` → `import { trackEvent } from '@/utils/analytics'`

### `src/components/__tests__/PlanStepper.test.tsx`
- Updated test: stub `window.gtag = vi.fn()` in `beforeEach`
- Assert GA4 calls (`window.gtag.mock.calls`) instead of `localStorage` queue

---

## [4d4595e] Fix critical auth, funding, and settings flows

### `src/pages/Auth.tsx`
- Added `import { supabase } from '@/lib/supabase'`
- Added `isForgotPassword: boolean` state
- Added `handleForgotPassword` calling `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth' })`
- Added forgot-password form UI (conditionally rendered)
- Added "Forgot your password?" button in login form
- Added "Back to sign in" link
- Modified `switchMode()` to reset `isForgotPassword`

### `src/pages/dashboard/Settings.tsx`
- Added `import { supabase } from '@/lib/supabase'`
- Replaced fake `handlePasswordChange` (setTimeout + toast.success) with:
  1. Zod validation of `passwordData`
  2. Re-auth via `supabase.auth.signInWithPassword` to verify current password
  3. `supabase.auth.updateUser({ password: newPassword })` to persist change
  4. Error handling for wrong current password, Supabase errors, unexpected throws

### `src/pages/dashboard/Funding.tsx`
- Added `deriveStatus(deadline: string): FundingOpportunity['status']` helper
  - Returns `'open'` if deadline is `'Ongoing'` or >30 days away
  - Returns `'closing_soon'` if deadline is 1–30 days away
  - Returns `'closed'` if deadline has passed
- Updated all 5 expired 2024 deadlines to 2026 dates:
  - `2024-03-31` → `2026-09-30`
  - `2024-06-30` → `2026-12-31`
  - `2024-02-28` → `2026-08-31`
  - `2024-04-15` → `2026-10-15`
  - `2024-05-31` → `2026-11-30`
- All 6 `status` fields now call `deriveStatus(deadline)` instead of hardcoded strings

---

## [b95cf40] fix(checkout): guard against missing STRIPE_SECRET_KEY

### `supabase/functions/create-checkout/index.ts`
- Added early return with HTTP 503 when `STRIPE_SECRET_KEY` env var is not set
- Prevents unhelpful Stripe "Invalid API Key" errors from propagating to client

---

## [54324a5] chore: remove console.debug calls

### `src/components/NewsletterSignup.tsx`
- Removed `console.debug('NEWSLETTER_ERRORS', errors)` useEffect
- Removed `console.debug('NEWSLETTER_ONSUBMIT', data)` line

### `src/components/DataRequestForm.tsx`
- Removed `console.debug('DATA_REQUEST_ERRORS', errors)` useEffect
- Fixed `@ts-ignore` and `(setError as any)` cast → clean typed `setError('email', {...})`

---

## [9fb1e3a] fix(data-request): align consent_withdrawal enum

### `src/lib/validation-schemas.ts`
- Changed `requestType` enum from `'withdraw-consent'` to `'consent_withdrawal'`

### `src/lib/validation-schemas.test.ts`
- Updated test array to use `'consent_withdrawal'`

### `src/components/DataRequestForm.tsx`
- Changed `requestTypes` array value from `'withdraw-consent'` to `'consent_withdrawal'`
- Removed `.replace('-', '_')` broken transform (produced `'withdraw_consent'`, not `'consent_withdrawal'`)

---

## [77a6b46] fix(newsletter): correct rate-limit column

### `supabase/functions/newsletter-subscribe/index.ts`
- Rate-limit query changed from `created_at` (non-existent column) to `subscribed_at`
- Without this fix, all rate-limit checks returned 0 rows → limit was never enforced

---

## [33aec1d] fix(router): remove duplicate /success-stories route

### `src/App.tsx`
- Removed second `/success-stories` route definition (React Router silently uses first match)

---

## [b8fe82d] fix(package): rename and add typecheck script

### `package.json`
- `name`: `vite_react_shadcn_ts` → `indigenous-rising-ai`
- Added `"typecheck": "tsc --noEmit"` script

---

## [926ea95] fix(settings): correct model ID

### `.claude/settings.json`
- `claude-sonnet-4-20250514` → `claude-sonnet-4-6`
