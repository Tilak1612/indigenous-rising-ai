# Stripe Go-Live Status — Indigenous Rising AI

Status of the billing rollout. Most of it is **done** (Stripe dashboard config +
code). What remains is **owner-only** (secrets + account activation).

- **Currency:** CAD only
- **Checkout mode:** `subscription` (server-side Checkout Session → redirect; no
  client-side publishable key, so nothing Stripe-related is needed in Vercel)
- **Production Supabase project:** `upxojfcdtmqtcvgbjsym`
  (this is what the live frontend + edge functions + webhook use — confirmed via
  `src/lib/supabase.ts` fallback URL)
- **Stripe account:** `acct_1STFMxAVTgSOk7kN` (Live mode, CAD)
- **Live site:** https://www.indigenousrising.ai

> ⚠️ **Heads-up:** `supabase/config.toml` has `project_id = "fsqjgexjkjicwlzcgweu"`,
> which is **NOT** the production project. Production is `upxojfcdtmqtcvgbjsym`.
> Pointing tooling at the `config.toml` ref already caused the webhook to be
> created against the wrong project once. Before running any `supabase` CLI
> command (`db push`, `functions deploy`), target `upxojfcdtmqtcvgbjsym`
> explicitly, or update `config.toml` if `fsqjgexjkjicwlzcgweu` is truly stale.

---

## ✅ Done

### Products & Prices (Live, CAD) — all 4 wired in `src/components/PricingSection.tsx`
| Product | Cycle | Amount | Price ID |
|---|---|---|---|
| Growth | Monthly | $49/mo | `price_1SSRqgS23MQcIdnrGDAHGF4C` |
| Growth | Yearly | $470/yr | `price_1Ti443AVTgSOk7kNewKcPh6Q` |
| Professional | Monthly | $149/mo | `price_1Ti47xAVTgSOk7kNvfZdLbr8` |
| Professional | Yearly | $1,430/yr | `price_1Ti49bAVTgSOk7kNjT1wTOIp` |

Free and Nations & Organizations intentionally have **no** Stripe price.

### Webhook — `we_1Ti4G3AVTgSOk7kNthMck5uw` (Active)
- URL: `https://upxojfcdtmqtcvgbjsym.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_succeeded`,
  `invoice.payment_failed`

### Customer Portal — `bpc_1Ti4IVAVTgSOk7kNuZ…` (Active)
Cancel ✓ · Switch plans (all 4 prices) ✓ · Update payment method ✓ · Invoice history ✓

### Code & DB (shipped — PR #64, commit `9e1fe5b`)
- `STRIPE_PRICES` map: all 4 cycles wired.
- `create-checkout` (edge fn v2): `automatic_tax: { enabled: true }`,
  `billing_address_collection: 'required'`, `customer_update: { address:'auto', name:'auto' }`,
  `tax_id_collection: { enabled: true }`.
- `stripe-webhook` (edge fn v2): race-hardened upsert on `stripe_subscription_id`.
- DB migration `subscriptions_stripe_webhook_alignment`: added `stripe_product_id`,
  `cancel_at_period_end`, partial unique index on `stripe_subscription_id`, all 8
  Stripe statuses in the status check, lookup indexes.

---

## ⛔ Remaining — OWNER ONLY (before the first real charge)

### 1. Set 2 secrets in Supabase → project `upxojfcdtmqtcvgbjsym` → Edge Functions → Secrets
| Secret | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret key** (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → `we_1Ti4G3AVTgSOk7kNthMck5uw` → **Reveal** signing secret (`whsec_…`) |

*(Supabase, NOT Vercel.)*

### 2. Activate the Stripe account for live payments
Settings → Business: business details, **bank account** for payouts, **statement descriptor**.

### 3. (Optional) Stripe Tax for GST/HST
Settings → Tax → register. Code is already wired for `automatic_tax`; until you
register, Stripe charges **0%** safely (no broken checkouts, just no tax collected).

---

## 🧪 Test plan (after the 2 secrets are set)

1. https://www.indigenousrising.ai/pricing → sign in → **Growth Monthly** → checkout.
2. Test card `4242 4242 4242 4242`, any future expiry / CVC / postal.
3. Confirm all three:
   - Browser redirects back to `/?checkout=success`
   - A row appears in `public.subscriptions` (project `upxojfcdtmqtcvgbjsym`) with the
     right `stripe_customer_id`, `stripe_subscription_id`, `status='active'`
   - Stripe → Webhooks → endpoint shows **200s** on `checkout.session.completed`,
     `customer.subscription.updated`, `invoice.payment_succeeded`
4. Repeat once with **Professional Annual** (validates 2nd product + annual cycle).
5. Optional: dashboard → manage subscription → confirm the Customer Portal opens and
   lets you switch/cancel.

---

## Quick reference
| Thing | Value |
|---|---|
| Stripe account | `acct_1STFMxAVTgSOk7kN` |
| Webhook endpoint | `we_1Ti4G3AVTgSOk7kNthMck5uw` |
| Webhook URL | `https://upxojfcdtmqtcvgbjsym.supabase.co/functions/v1/stripe-webhook` |
| Customer Portal config | `bpc_1Ti4IVAVTgSOk7kNuZ…` |
| Prod Supabase project | `upxojfcdtmqtcvgbjsym` |
| Latest main commit | `9e1fe5b` (PR #64) |
| Needed from owner | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in Supabase; account activation |
