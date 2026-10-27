-- Weekly link-health check for the funding catalogue.
--
-- Calls the check-funding-links edge function every Monday at 09:15 UTC with
-- the same vault-held secret the Friday digest uses. The function records
-- every result in funding_link_checks and only ever moves a row to
-- needs_review (never to verified, never published/unpublished). It sends no
-- email, so scheduling it is a data-quality job, not a communication.
--
-- check-funding-freshness (the daily internal "N rows are stale" email) is
-- deliberately NOT scheduled here: it emails a person every day until the
-- catalogue is verified, which is the owner's call. The one-liner to enable
-- it is in docs/FUNDING_DEPLOYMENT.md.

do $$
begin
  perform cron.unschedule('funding-link-check-weekly');
exception when others then
  null;
end $$;

select cron.schedule(
  'funding-link-check-weekly',
  '15 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://upxojfcdtmqtcvgbjsym.supabase.co/functions/v1/check-funding-links',
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
  $$
);
