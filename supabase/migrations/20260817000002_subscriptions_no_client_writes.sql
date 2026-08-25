-- CRITICAL: any signed-in user could grant themselves a paid plan for free.
--
-- public.subscriptions had an RLS policy
--     "Users can insert own subscriptions"  INSERT  WITH CHECK (auth.uid() = user_id)
-- and `authenticated` holds the INSERT grant, so PostgREST accepted:
--
--     POST /rest/v1/subscriptions
--     { "user_id": "<own uid>", "status": "active",
--       "stripe_product_id": "<any product>" }
--
-- match-funding-opportunities derives the user's tier straight from this table
-- (status in ('active','trialing') + stripe_product_id → quota, result count,
-- fit scores and explanations), so a forged row unlocked Professional-tier AI
-- funding matching with no payment. Settings' billing panel and
-- DataExportControls read the same row, so the forged plan also displayed as
-- genuine in the UI.
--
-- Reproduced against production inside a rolled-back transaction: the insert
-- succeeded and returned status='active' for a real profile id.
--
-- subscriptions is webhook-owned state. stripe-webhook writes it with the
-- service_role key, which bypasses RLS, so removing every client write path
-- costs nothing. No client code inserts into this table (verified: the only
-- client references are .select() in Settings.tsx and DataExportControls.tsx).

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;

-- Defence in depth: even if a permissive policy is added back by mistake, the
-- table-level grant is gone, so the write is refused.
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;

-- Users keep read access to their own subscription — that policy is unchanged:
--   "Users can view own subscriptions" SELECT USING (auth.uid() = user_id)

COMMENT ON TABLE public.subscriptions IS
  'Stripe subscription state. WRITTEN ONLY by the stripe-webhook edge function '
  'via service_role. Clients have SELECT on their own row and no write path — '
  'granting one lets users self-provision paid tiers (see migration '
  '20260817000002).';
