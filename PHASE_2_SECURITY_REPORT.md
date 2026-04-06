# Phase 2 Security Report — Indigenous Rising AI
**Date:** 2026-04-06  
**Scope:** Security, reliability, data integrity, billing safety, abuse prevention, observability  
**Method:** Full static audit of all source files, edge functions, RLS migrations, and dependency graph

---

## Fixes Implemented

### SEC-1 — Stored XSS via BusinessPlanner contenteditable (CRITICAL)

**File:** [src/pages/dashboard/BusinessPlanner.tsx](src/pages/dashboard/BusinessPlanner.tsx)

**Vulnerability:** The business plan editor used a `contenteditable` div. User-authored rich text was saved to localStorage as raw HTML (`editorRef.current.innerHTML`). On load, this was rehydrated with `editor.innerHTML = currentAnswer` — injecting unescaped HTML directly into the DOM. An attacker could type `<img src=x onerror="...">` in the editor, save it, and have it execute on every page load for that user.

DOMPurify was already installed and used elsewhere (`src/lib/sanitize.ts`) but was not applied here.

**Fix:** Added `DOMPurify.sanitize()` with an allowlist of safe rich-text tags (`b, i, u, strong, em, br, p, ul, ol, li`, no attributes) at both the input handler (before storing to localStorage) and the DOM injection (before setting `innerHTML`).

---

### SEC-2 — Password Recovery Flow Broken: Token Not Handled (CRITICAL)

**File:** [src/pages/Auth.tsx](src/pages/Auth.tsx)

**Vulnerability:** Phase 1 added `supabase.auth.resetPasswordForEmail(email)` to send reset emails. But no handler existed for when users clicked the link. Supabase sends users back to `/auth#access_token=...&type=recovery`. The page showed the login form. Users could not complete password recovery.

**Fix:** Added `isRecovery` state. On mount, detect `type=recovery` in `window.location.hash`. Show a "Set New Password" form. Call `supabase.auth.updateUser({ password })` to persist the new password. After success, clear the hash (`window.history.replaceState`) to prevent re-triggering, reset `isRecovery`, and show success message. The user redirect to `/dashboard` on auth state change is suppressed during recovery mode.

---

### SEC-3 — customer-portal: Empty Stripe Key Passed to SDK (HIGH)

**File:** [supabase/functions/customer-portal/index.ts](supabase/functions/customer-portal/index.ts)

**Vulnerability:** `new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', ...)` — if the env var is missing, an empty string is passed to the Stripe SDK. Stripe then makes API calls with an invalid key, returning opaque authentication errors that obscure the real problem and may panic in unexpected ways.

**Fix:** Added early `503` return with `'Payment service not configured'` error message when `STRIPE_SECRET_KEY` is not set — matching the pattern already applied to `create-checkout`.

---

### SEC-4 — Checkout/Portal: Stripe Redirect URLs Trusted Attacker-Controlled Origin (HIGH)

**Files:** [supabase/functions/create-checkout/index.ts](supabase/functions/create-checkout/index.ts), [supabase/functions/customer-portal/index.ts](supabase/functions/customer-portal/index.ts)

**Vulnerability:** Both functions used `req.headers.get('origin') || 'http://localhost:8080'` to construct Stripe `success_url`, `cancel_url`, and `return_url`. The `Origin` header is attacker-controlled. A malicious request with `Origin: https://evil.com` would redirect users post-checkout to `https://evil.com/?checkout=success`. This is a Stripe redirect hijacking attack — attacker captures the session context that lives in the success URL.

**Fix:** Added `ALLOWED_ORIGINS` allowlist. Origin is only used if it matches the production domain or known dev origins; otherwise falls back to `https://www.indigenousrising.ai`.

---

### REL-1 — Subscription Check: Stripe API Hammered Every 60 Seconds (MEDIUM)

**File:** [src/hooks/useSubscription.tsx](src/hooks/useSubscription.tsx)

**Vulnerability:** `setInterval(checkSubscription, 60000)` — every logged-in user triggers a Stripe API call + Supabase `getUser` call every 60 seconds. At 100 concurrent users, this produces 100 Stripe API calls per minute, 24/7. Stripe's standard rate limit is 100 requests/second (6000/min) but at scale this creates unnecessary cost, Stripe API usage, and could trigger rate limits. More importantly: the check is unnecessary between sessions — subscription status only changes when Stripe fires a webhook.

**Fix:** Changed polling interval from 60s to 300s (5 minutes). Added `visibilitychange` listener: when the user returns to the tab (after completing checkout in a new tab), subscription status is refreshed immediately. This handles the post-checkout flow correctly while dramatically reducing Stripe API load.

---

### REL-2 — Newsletter Confirmation Tokens Never Expire (MEDIUM)

**File:** [supabase/functions/newsletter-subscribe/index.ts](supabase/functions/newsletter-subscribe/index.ts)

**Vulnerability:** Confirmation tokens issued at subscription time had no expiry. A token sent months ago remained valid forever. This creates stale token risk and violates best-practice email confirmation flows (CASL compliance expects timely confirmation).

**Fix:** Added 48-hour expiry check during confirmation. If `subscribed_at` is more than 48 hours ago and the token hasn't been confirmed, return HTTP 410 Gone with an actionable error: "Confirmation link has expired. Please subscribe again."

---

## Findings Not Fixed — Architecture-Level Risks

### ARCH-1 — Webhook User Lookup Uses `auth.admin.listUsers()` (HIGH)

**File:** [supabase/functions/stripe-webhook/index.ts:98](supabase/functions/stripe-webhook/index.ts)

On `checkout.session.completed`, the webhook calls `supabaseClient.auth.admin.listUsers()` to find a user by email — loading ALL users into memory. This:
- Returns max 1000 users per page (default) — silently misses users if the list is longer
- Gets slower with user growth
- Creates potential timeout on large user bases

**Correct approach:** Query the `profiles` table by email directly (`SELECT id FROM profiles WHERE email = $1`) — O(1) indexed lookup, no admin API needed, no pagination concern. Requires a migration to add a unique index on `profiles.email` if not already present.

**Why not fixed now:** This change touches webhook payment logic — high blast radius if incorrect. Requires testing with actual Stripe events. Flagged for dedicated engineering.

---

### ARCH-2 — BusinessPlanner: All Data in localStorage, Never Persisted (HIGH)

**File:** [src/pages/dashboard/BusinessPlanner.tsx](src/pages/dashboard/BusinessPlanner.tsx)

Indigenous entrepreneurs' business plans — including financial projections, market strategy, and community impact statements — are stored only in `localStorage`. This means:
- Lost on browser data clear
- Not synced across devices
- Not backed up
- Not associated with the user account
- Accessible to any script on the page (before the XSS fix above)

**Correct approach:** Persist to a `business_plans` Supabase table with `user_id` + RLS (user can read/write own plan only). The auto-save hook is already in place — it just needs to write to Supabase instead of localStorage.

**Why not fixed now:** Requires a new migration, new table, RLS policies, and changes to the save/load hooks. The XSS risk in localStorage was fixed. The data loss risk is a product architecture decision.

---

### ARCH-3 — Admin Page: Client-Side Role Enforcement Only for UI (MEDIUM)

**File:** [src/pages/Admin.tsx](src/pages/Admin.tsx)

The admin page renders based on `isAdmin` from React context. `isAdmin` is derived client-side from a `user_roles` query. The actual data (newsletter subscribers, data requests) is protected by Supabase RLS with `has_role()` — so unauthorized users cannot read data via PostgREST. However:
- The admin UI briefly renders before role is confirmed (during `loading` state)
- A race condition between `getSession()` and `checkUserRole()` could briefly show the admin UI to a non-admin

**Correct approach:** Add a loading guard: don't render admin content until `loading === false && isAdmin`. Add route protection that redirects to `/` if `!loading && !isAdmin`.

---

### ARCH-4 — webhook_events Stores Full Stripe Payload Including PII (MEDIUM)

**File:** [supabase/functions/stripe-webhook/index.ts:76](supabase/functions/stripe-webhook/index.ts)

```typescript
payload: event as any
```

The full raw Stripe event is stored in `webhook_events.payload` (JSONB). Stripe events for `checkout.session.completed` include customer email, name, and payment method details. This is compliant with storing in Canada region via Supabase, but:
- The payload column grows unboundedly
- If webhook_events is ever exposed (even by future misconfiguration), it contains payment PII
- OCAP principle of data minimization suggests only storing what's needed

**Correct approach:** Store only `event.type`, `event.id`, `event.created`, and a sanitized summary — not the full payload. Or implement a retention policy to delete processed events after 30 days.

---

### ARCH-5 — All Edge Functions: Wildcard CORS (LOW-MEDIUM)

**Finding:** All edge functions use `'Access-Control-Allow-Origin': '*'`. For authenticated endpoints (`create-checkout`, `customer-portal`, `check-subscription`), this means any website can trigger cross-origin requests. Auth is enforced via bearer token — but an XSS attack on any domain could exfiltrate tokens and call these endpoints.

**For the stripe-webhook specifically:** Webhooks are server-to-server. The CORS headers are irrelevant to Stripe but advertise the endpoint accepts browser requests. Should either remove CORS headers from stripe-webhook entirely or restrict to the app's own origin.

**Correct approach:** Lock authenticated endpoints to `Access-Control-Allow-Origin: https://www.indigenousrising.ai`. Public endpoints (newsletter, contact, data-request) can remain `*`.

---

## npm Audit — Vulnerability Assessment

**Result:** 9 high, 0 critical (run date: 2026-04-06)

| Package | Severity | Exploitable in this app? |
|---|---|---|
| `react-router` / `@remix-run/router` | HIGH (XSS via open redirect) | Low — no user-controlled `navigate()` or `<Link to>` values found |
| `rollup` | HIGH (path traversal) | **No** — build tool only, not shipped to users |
| `lodash` | HIGH (prototype pollution) | Low — lodash is a transitive dep of `recharts`, not used directly |
| `flatted` | HIGH (DoS) | Low — transitive dep of `eslint`, not in prod bundle |
| `glob` / `minimatch` / `picomatch` | HIGH | **No** — all are dev/build tools, not in prod bundle |

**Action taken:** No packages updated — all exploitable vectors are either not present in application code or are dev-only tools. The react-router vulnerability warrants a planned upgrade to react-router v7 to eliminate it, but forced upgrade during an audit sprint risks breaking router behavior.

**Recommended:** Schedule `npm update react-router react-router-dom @remix-run/router` and run full regression in a dedicated sprint.

---

## RLS Policy Audit Results

All policies audited against the 10 migration files:

| Table | Anon INSERT | Anon SELECT | Anon UPDATE | Auth SELECT | Auth UPDATE | Admin |
|---|---|---|---|---|---|---|
| `profiles` | via trigger | own row | own row | — | — | — |
| `user_roles` | ✘ | ✘ | ✘ | ✘ | ✘ | ✅ full |
| `subscriptions` | ✘ | own row | ✘ | own row | ✘ | service role |
| `webhook_events` | ✘ | ✘ | ✘ | ✘ | ✘ | admin SELECT, service role ALL |
| `newsletter_subscriptions` | ✅ | ✘ (dropped) | ✘ (dropped) | ✘ | ✘ | admin ALL |
| `data_requests` | ✅ | ✘ (dropped) | ✘ | admin/team | admin/team | ✅ full |
| `contact_submissions` | ✅ | ✘ | ✘ | ✘ | ✘ | admin ALL |
| `content_sections` | ✘ | ✅ public | ✘ | ✘ | ✘ | admin ALL |
| `data-request-documents` (storage) | ✘ | ✘ | — | ✘ | — | admin/team |

The early over-permissive policies (anon SELECT/UPDATE on newsletter_subscriptions, anon SELECT on data_requests, anon upload/download on storage) were all correctly addressed in migrations 20251212, 20260106, and 20260214. **The RLS posture is sound** assuming migrations are applied.

---

## Top 10 Production Risks (Remaining)

| Rank | Risk | Impact | Likelihood |
|---|---|---|---|
| 1 | Webhook `listUsers()` misses users after 1000 — subscription never activates | Payment failure for users > 1000 | Low now, certain at scale |
| 2 | BusinessPlanner data loss (localStorage only) | Loss of hours of work for paying users | Medium — any browser clear |
| 3 | react-router XSS CVE in dependency | Potential XSS if app evolves to use user-controlled navigation | Low — not currently triggered |
| 4 | Admin race condition briefly shows admin UI to loading non-admin | Data exposure risk window | Very low |
| 5 | webhook_events grows indefinitely with full PII payloads | Storage cost + PII risk surface | Certain over time |
| 6 | Edge functions have wildcard CORS | Amplifies blast radius of any future XSS | Low |
| 7 | Profile save handlers still fake (Settings.tsx notifications/privacy) | User believes preferences are saved; they aren't | Medium — UX trust |
| 8 | No structured error tracking (Sentry/Bugsnag) | Silent failures in production invisible until user reports | Medium |
| 9 | Phone number placeholder `1-800-XXX-XXXX` in 3 legal pages | Legal/compliance credibility issue | Medium |
| 10 | No session invalidation on password change | Old sessions remain valid after password update | Low — Supabase default |

---

## Top 10 Next Engineering Improvements

1. **Migrate BusinessPlanner to Supabase** — persist plans with user_id + RLS, replace localStorage auto-save
2. **Fix webhook `listUsers()` → profiles email lookup** — required before user base exceeds 1000
3. **Schedule react-router v7 upgrade** — eliminate open redirect XSS CVE cleanly
4. **Add Sentry (or equivalent)** — add `Sentry.init()` in main.tsx; instrument edge function error paths; free tier sufficient
5. **Admin page loading guard** — gate admin content on `!loading && isAdmin` to eliminate race condition
6. **Implement session invalidation on password change** — call `supabase.auth.signOut({ scope: 'others' })` after `updateUser` in Settings.tsx
7. **Stripe webhook: store sanitized event payload only** — or add a 30-day retention cron to delete processed events
8. **Replace fake notification/privacy/language save handlers** — persist to user_preferences or profiles table
9. **Fix phone number placeholders** — add real contact number or compliance contact email in PrivacyPolicy, Terms, AccessibilityStatement
10. **Lock CORS on authenticated edge functions** — restrict to production domain; stripe-webhook should have no CORS headers

---

## Final QA Gate (Phase 2)

```
npx tsc --noEmit    → 0 errors
npm test -- --run   → 76/76 passing
npm run lint        → 0 warnings
npm run build       → ✓ built successfully
```
