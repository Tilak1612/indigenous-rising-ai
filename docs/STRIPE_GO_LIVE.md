# Stripe Go-Live Checklist — Indigenous Rising AI

Everything needed to turn on real billing. Items marked **OWNER** must be done by
Tilak in the Stripe + Supabase dashboards (they involve secrets / account access).
Items marked **CLAUDE** are code changes I make once you send me the values.

- **Currency:** CAD only
- **Checkout mode:** `subscription` (server-side Checkout Session → redirect; no
  client-side publishable key is used, so nothing Stripe-related is needed in Vercel)
- **Supabase project ref:** `fsqjgexjkjicwlzcgweu`
- **Live site origin:** https://www.indigenousrising.ai

---

## 1. Products & Prices  (OWNER → then CLAUDE wires the IDs)

Create **2 products**, each with **a monthly and an annual** recurring price, in the
**same mode (Test or Live)** as the secret key you put in Supabase.

| Product | Plan key (internal) | Price | Cycle | Status |
|---|---|---|---|---|
| Growth | `Ogichidaakwe` | **$49 CAD / mo** | monthly | ✅ already wired (`price_1SSRqgS23MQcIdnrGDAHGF4C`) |
| Growth | `Ogichidaakwe` | **$470 CAD / yr** | annual | ⛔ NEED `price_…` |
| Professional | `Bimaadiziwin` | **$149 CAD / mo** | monthly | ⛔ NEED `price_…` |
| Professional | `Bimaadiziwin` | **$1,430 CAD / yr** | annual | ⛔ NEED `price_…` |

> Nations & Organizations is "Let's talk" (sales-led) — **no Stripe price needed.**
> Free (Maadaadiziwin) is $0 — no Stripe.

**Send me these 3 price IDs** and I'll drop them into `STRIPE_PRICES` in
`src/components/PricingSection.tsx` and ship:

```
Growth   annual  : price_________________
Pro      monthly : price_________________
Pro      annual  : price_________________
```

(If you set different amounts than above, tell me — I'll also update the displayed
prices in `src/data/plans.ts` so the cards match Stripe exactly.)

---

## 2. Secrets in Supabase Edge Functions  (OWNER)

Set these in **Supabase → Project → Edge Functions → Secrets** (NOT in Vercel).
The functions read them via `Deno.env.get(...)`.

| Secret | Used by | Where to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | create-checkout, customer-portal, check-subscription, stripe-webhook | Stripe → Developers → API keys → **Secret key** (`sk_live_…` for live) |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook (signature verification) | Generated when you create the webhook endpoint in step 3 (`whsec_…`) |

⚠️ The secret key's mode (test vs live) **must match** the mode the price IDs were
created in. Don't mix `sk_test_…` with live `price_…`.

---

## 3. Webhook endpoint  (OWNER)

Stripe → Developers → **Webhooks** → Add endpoint.

- **Endpoint URL:**
  `https://fsqjgexjkjicwlzcgweu.supabase.co/functions/v1/stripe-webhook`
- **Events to send** (the handler already implements all of these):
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- After creating it, copy the **Signing secret** (`whsec_…`) into
  `STRIPE_WEBHOOK_SECRET` (step 2).

---

## 4. Customer Portal  (OWNER)

Stripe → Settings → Billing → **Customer portal** → activate. This powers the
`customer-portal` edge function (the "Manage billing / cancel" flow).

Recommended toggles:
- Allow customers to **cancel** subscriptions
- Allow **switching plans** between Growth ↔ Professional (and monthly ↔ annual)
- Allow updating **payment method**
- Show **invoice history**

---

## 5. Business settings  (OWNER, before going live)

- Activate the Stripe account (business details, bank account for payouts)
- Set the account/statement descriptor (what shows on customers' card statements)
- Confirm **CAD** as the price currency on every price
- Tax: decide if you're charging GST/HST. If yes, enable **Stripe Tax** (or set tax
  rates) — tell me if you want tax collection wired into checkout, it's a small change.

---

## What is NOT needed
- ❌ No `VITE_STRIPE_PUBLISHABLE_KEY` (checkout is server-side redirect, not Stripe.js)
- ❌ No Stripe env vars in Vercel
- ❌ No code change for Nations/Free plans

---

## Hand-off summary — the 3 things to send me
1. **Growth annual** `price_…`
2. **Professional monthly** `price_…`
3. **Professional annual** `price_…`

Plus confirm: **STRIPE_SECRET_KEY** and **STRIPE_WEBHOOK_SECRET** are set in Supabase,
the **webhook endpoint** is live, and the **Customer Portal** is activated.

Once I have the 3 price IDs I wire them in, run tsc + build, and ship a PR — billing
goes live on the next deploy.
