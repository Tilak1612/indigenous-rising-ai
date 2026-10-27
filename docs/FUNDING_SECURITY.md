# Funding directory security and privacy

- **Catalogue writes**: no client role can insert, update or delete `grants`
  except users with the `admin` role (`user_roles`), checked by
  `has_role()` inside RLS. Verified in production on 2026-10-26: anon and a
  signed-in non-admin updated 0 rows and were refused inserts (42501).
- **Unpublished rows**: invisible to anon and non-admin (0 rows returned).
- **Audit tables** (`funding_link_checks`, `funding_review_queue`,
  `funding_verification_events`, `funding_outbound_clicks`): admin read only;
  written by migrations, the link checker (service role) and the report
  trigger.
- **Public inputs**: broken-link reports accept only a grant id, a URL (≤ 2048)
  and a message (≤ 500) for published grants, rate-limited in a SECURITY
  DEFINER trigger (10 per grant per hour, 100 per hour). Clicks are counted
  through an RPC that stores only grant id, day and kind.
- **Outbound links**: only `http(s)` URLs are rendered; `rel="noopener
  noreferrer nofollow"`, `target="_blank"`. No redirect tracking and no user
  data in the URL.
- **Search**: free text is stripped of PostgREST operator characters before it
  reaches the query (tested); array filters are built from allow-listed
  vocabularies only.
- **Model calls**: see FUNDING_AI_ARCHITECTURE.md; identity, ownership,
  community and Nation never leave the database for a model call.
- **Analytics**: GA4 events carry grant id and link type, never eligibility
  attributes.
- **Not changed**: `data_requests`, alerts subscriber tables, the digest gate.
