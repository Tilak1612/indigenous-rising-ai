-- Resend delivery events for mail sent from indigenousrising.ai, written by the
-- resend-webhook edge function with the service role.
--
-- Additive and idempotent: safe to run on a database that already has
-- email_suppressions (created in 20260826000001) and safe to run twice.
--
-- Privacy: recipients are stored only as recipient_hash (SHA-256 of the
-- trimmed, lower-cased address, as in email_log and email_suppressions). No
-- address, subject or bounce message is stored. Both tables are service-role
-- only: RLS on, no policies, no anon or authenticated grants.

create table if not exists public.resend_email_events (
  svix_id          text primary key,            -- idempotency key: Resend retries reuse it
  event_type       text not null check (event_type in (
                     'email.sent','email.delivered','email.delivery_delayed','email.bounced',
                     'email.complained','email.failed','email.suppressed')),
  resend_email_id  text,
  from_domain      text not null check (from_domain = 'indigenousrising.ai'),
  recipient_hashes text[] not null default '{}',
  bounce_type      text,
  bounce_subtype   text,
  failed_reason    text,
  suppressed_type  text,
  payload          jsonb not null default '{}'::jsonb,  -- allow-listed: type, created_at, email_id, tags
  occurred_at      timestamptz,
  received_at      timestamptz not null default now()
);
create index if not exists resend_email_events_email_idx on public.resend_email_events (resend_email_id);
create index if not exists resend_email_events_type_idx on public.resend_email_events (event_type, received_at desc);
create index if not exists resend_email_events_recipients_idx on public.resend_email_events using gin (recipient_hashes);

alter table public.resend_email_events enable row level security;
revoke all on public.resend_email_events from anon, authenticated;

-- Already present in production; repeated here so a fresh database gets the
-- same table, and so the access rules are stated next to the webhook that
-- writes it.
create table if not exists public.email_suppressions (
  recipient_hash text primary key,
  reason         text not null check (reason in ('hard_bounce','complaint','manual','unsubscribe_all','deleted')),
  source         text,
  created_at     timestamptz not null default now()
);
alter table public.email_suppressions enable row level security;
revoke all on public.email_suppressions from anon, authenticated;

-- The webhook moves email_log rows by resend_id.
create index if not exists email_log_resend_id_idx on public.email_log (resend_id) where resend_id is not null;
