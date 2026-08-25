-- Add stripe_price_id so tier can be derived from the PRICE the customer
-- bought rather than by keyword-matching the opaque Stripe product id.
--
-- Bug this enables the fix for: deriveTier() in match-funding-opportunities
-- resolved tier with
--     pid.includes('professional') || pid.includes('bimaadiziwin') || pid.includes('149')
-- against `subscription.items.data[0].price.product` — a Stripe *product* id
-- (`prod_<random>`), which never contains those keywords. Every paying
-- customer therefore fell through to 'growth', so a Professional subscriber
-- ($149/mo, sold as UNLIMITED matches) silently received the Growth quota of
-- 50/month. Latent only because no completed subscription exists yet; it would
-- fire the moment the Stripe webhook is registered and someone buys Pro.
--
-- The price id is the identifier checkout actually controls (create-checkout
-- resolves plan+cycle to one of four known price ids), so it is the correct
-- key for tier. This column lets the webhook persist it; deriveTier matches it
-- exactly and keeps the product-substring path only as a fallback for legacy
-- rows / demo accounts.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_price_id text;

COMMENT ON COLUMN public.subscriptions.stripe_price_id IS
  'Stripe Price id of the purchased line item (price.id, not price.product). '
  'Canonical key for tier resolution — see match-funding-opportunities '
  'deriveTier(). Written by stripe-webhook via service_role.';
