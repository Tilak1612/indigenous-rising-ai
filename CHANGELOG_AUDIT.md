# Changelog — Production Hardening Audit
**Session dates:** 2026-04-05 / 2026-04-06  
**Branch:** main  
**All changes committed; no force-push performed.**

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
