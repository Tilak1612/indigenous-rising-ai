-- Roadmap #1 Stage 4: Schedule the weekly funding-digest cron job.
-- Uses Supabase pg_cron + pg_net + supabase_vault.
--
-- ARCHITECTURE
-- ============
-- 1. pg_cron fires every Friday at 14:00 UTC
-- 2. The cron job reads `funding_digest_cron_secret` from supabase_vault
-- 3. pg_net sends an HTTPS POST to the send-funding-digest edge function
--    with `Authorization: Bearer <secret>` and an empty JSON body
-- 4. The edge function compares the bearer token to `CRON_SECRET` env var
--    and runs the digest if it matches
--
-- SETUP REQUIREMENT
-- =================
-- After this migration runs, the user MUST:
-- 1. Open Supabase dashboard → Database → Vault
-- 2. Find `funding_digest_cron_secret` and reveal its value
-- 3. Copy it
-- 4. Go to Project Settings → Edge Functions → Secrets
-- 5. Add a secret named `CRON_SECRET` with the value from step 3
--
-- Until that one-time copy is done, the cron will fire but the function
-- will return 503 ("Service not configured"). The vault secret never
-- appears in any commit, log, or chat — only in the user's dashboard.

-- ============================================================
-- Enable the extensions (idempotent)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================================
-- Generate and store the cron secret in supabase_vault
-- ============================================================
-- The value is generated server-side via gen_random_bytes — never
-- transmitted, never logged, never visible to any client until the
-- user explicitly reveals it in the dashboard.
DO $$
DECLARE
  existing_id UUID;
  generated_value TEXT;
BEGIN
  SELECT id INTO existing_id
  FROM vault.secrets
  WHERE name = 'funding_digest_cron_secret';

  IF existing_id IS NULL THEN
    generated_value := encode(gen_random_bytes(32), 'hex');
    PERFORM vault.create_secret(
      generated_value,
      'funding_digest_cron_secret',
      'Bearer token for the weekly funding-digest cron job. Must match CRON_SECRET in Edge Function secrets.'
    );
  END IF;
END $$;

-- ============================================================
-- Schedule the cron job
-- ============================================================
-- Friday 14:00 UTC = Friday 10:00 EDT (DST) / 09:00 EST (standard time).
-- One-hour drift across DST changes is acceptable; a fixed UTC schedule
-- is simpler than computing local time.
SELECT cron.unschedule('funding-digest-friday')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'funding-digest-friday');

SELECT cron.schedule(
  'funding-digest-friday',
  '0 14 * * 5',
  $cron$
  SELECT net.http_post(
    url := 'https://upxojfcdtmqtcvgbjsym.supabase.co/functions/v1/send-funding-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'funding_digest_cron_secret'
        LIMIT 1
      )
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $cron$
);
