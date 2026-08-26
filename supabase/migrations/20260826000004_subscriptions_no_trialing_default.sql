-- subscriptions.status defaulted to 'trialing', which GRANTS PAID ENTITLEMENT.
--
-- match-funding-opportunities decides entitlement with:
--     status === 'active' || status === 'trialing'
-- so any row inserted without an explicit status silently became a paid
-- subscriber. Proven against production in a rolled-back transaction: an
-- INSERT omitting status produced status='trialing' and the entitlement
-- expression returned true.
--
-- It is also semantically wrong. The product sells a free-forever plan with no
-- trial, so 'trialing' describes a state this business does not have.
--
-- Latent today only because stripe-webhook always sets status explicitly from
-- Stripe. It becomes real the moment any other code path inserts a row — a
-- backfill, an admin tool, a future import — and the failure mode is silent
-- free access to paid tiers, which is the same class of bug as the RLS
-- self-provisioning hole closed in migration 20260817000002.
--
-- Fix: drop the default. status is nullable, and NULL matches neither 'active'
-- nor 'trialing', so a row that forgets to set it is correctly NOT entitled.
-- Fail closed, not open.
--
-- No existing row is changed: there are 0 rows in subscriptions, and this only
-- alters the column default.

alter table public.subscriptions alter column status drop default;

comment on column public.subscriptions.status IS
  'Stripe subscription status, set explicitly by stripe-webhook. Deliberately has NO DEFAULT: entitlement checks treat both ''active'' and ''trialing'' as paid, so a defaulted value would grant paid access to any row that forgot to set it. NULL is the safe, non-entitling state.';
