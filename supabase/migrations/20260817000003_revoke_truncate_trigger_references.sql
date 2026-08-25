-- Defence in depth: strip TRUNCATE / TRIGGER / REFERENCES from the two public
-- API roles on every table in `public`.
--
-- These come from Supabase's default `GRANT ALL ON ALL TABLES IN SCHEMA public
-- TO anon, authenticated`. RLS does NOT gate TRUNCATE — row-level policies are
-- irrelevant to it — so the grant meant `authenticated` could empty any table
-- outright. Confirmed against production in a rolled-back transaction:
--
--     set local role authenticated;
--     truncate table public.subscriptions;   -- succeeded
--
-- Not reachable from the browser today: PostgREST maps REST verbs to
-- SELECT/INSERT/UPDATE/DELETE only and never emits TRUNCATE, and there is no
-- SECURITY INVOKER function that truncates. So this is a latent privilege
-- rather than a live exploit — but it is one SQL-injection bug, one careless
-- helper function, or one exposed connection string away from being a
-- data-destruction primitive, and no client needs any of the three privileges.
--
-- TRIGGER (attach arbitrary triggers) and REFERENCES (create FKs against a
-- table, which can be used to probe values) are removed for the same reason.
--
-- SELECT / INSERT / UPDATE / DELETE are untouched, so every existing RLS policy
-- and all application behaviour is unchanged. service_role and postgres keep
-- everything.

REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public
  FROM anon, authenticated;

-- Apply the same shape to tables created later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM anon, authenticated;
