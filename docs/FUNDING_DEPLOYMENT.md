# Funding directory deployment

## Already applied to production (2026-10-26, via the Supabase MCP)

1. `20261026000001_funding_directory_schema.sql`
2. `20261026000002_funding_catalogue_2026_10.sql` (no row published)

## Applied with this PR's merge

- Vercel builds `main`; the prerender fetches the live published rows.
- `deploy-functions.yml` deploys `check-funding-links`, `match-funding-opportunities`
  and `ai-assistant` on push to `main` (functions path filter).
- `20261026000003_funding_link_check_cron.sql` schedules the weekly link check
  (apply after the function is deployed so the first run does not 404):

```bash
cd ~/indigenous-rising-ai && supabase db query --linked -f supabase/migrations/20261026000003_funding_link_check_cron.sql
```

## Owner decisions

- Publish reviewed records in `/admin` → Funding (needs an `admin` row in
  `user_roles`; SQL in PR #249).
- Daily stale-catalogue email (sends to `INTERNAL_ALERT_EMAIL` every day while
  rows are unverified):

```sql
select cron.schedule('funding-freshness-daily', '0 7 * * *',
  $$ SELECT net.http_post(url := 'https://upxojfcdtmqtcvgbjsym.supabase.co/functions/v1/check-funding-freshness',
     headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='funding_digest_cron_secret' LIMIT 1)),
     body := '{}'::jsonb) $$);
```

## Rollback

All schema changes are additive; the old pages read the old columns. To hide
the new pages without a deploy, unpublish nothing: the region and programme
pages render from published rows only.
