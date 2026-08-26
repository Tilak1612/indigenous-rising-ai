-- ============================================================================
-- Indigenous Rising AI · funding verification + lifecycle email
-- PROPOSED — NOT APPLIED. No pricing, plan limit or auth behaviour is touched.
-- ============================================================================
--
-- WHY THIS EXISTS
-- ---------------
-- As of 2026-08-26, public.grants holds 17 rows. All 17 are is_published = true.
-- Sixteen have last_verified IS NULL. The seventeenth was verified 2026-04-10,
-- 138 days ago. All 17 have deadline IS NULL and is_recurring = true, which is
-- exactly the shape that passes the current digest filter.
--
-- send-funding-digest therefore emails all 17 unverified programmes, with dollar
-- amounts and "Apply on funder's site" links, to every confirmed subscriber.
-- The gate below is what stops that.
-- ============================================================================

-- 1. Verification fields the brief requires and the table does not have -------
alter table public.grants
  add column if not exists source_url            text,   -- canonical programme page
  add column if not exists source_published_date date,   -- date the provider published/updated it
  add column if not exists verification_status   text not null default 'unverified'
      check (verification_status in ('unverified','verified','needs_review','retired')),
  add column if not exists verified_by           uuid,   -- who checked it
  add column if not exists applicant_types       text[] default '{}',
  add column if not exists verification_notes    text;

comment on column public.grants.source_url is
  'The provider''s own page for this programme. application_url may be a deep link into a form; source_url is the page a person should read before applying.';
comment on column public.grants.verification_status is
  'A human set this. Automated scraping may set needs_review; only a person sets verified.';

-- Backfill source_url from the existing application_url so nothing is lost.
update public.grants set source_url = application_url where source_url is null;

-- 2. THE GATE ----------------------------------------------------------------
-- Single definition of "safe to email", used by the digest, by every funding
-- template, and by the staleness alert. One definition, so they cannot drift.
create or replace function public.grant_is_sendable(g public.grants, window_days int default 90)
-- APPLIED AS STABLE, not IMMUTABLE. Postgres does not verify volatility
-- labels, and this function calls current_date (STABLE). Labelled IMMUTABLE it
-- could be constant-folded and cached, freezing the 90-day freshness window.
returns boolean language sql stable as $$
  select g.is_published
     and g.verification_status = 'verified'
     and g.last_verified is not null
     and g.last_verified >= (current_date - window_days)
     and g.source_url is not null
$$;

create or replace view public.sendable_grants as
  select * from public.grants g where public.grant_is_sendable(g);

comment on view public.sendable_grants is
  'The ONLY source a funding email may read from. Selecting from public.grants directly in an email path is a bug.';

-- 3. Deadline integrity ------------------------------------------------------
-- A programme may have a deadline OR be genuinely rolling, not neither-and-both.
-- Today every row is is_recurring = true with a null deadline, which is why the
-- deadline-reminder ladder has nothing to run on.
alter table public.grants
  add constraint grants_deadline_or_recurring
  check (deadline is not null or is_recurring = true) not valid;
-- NOT VALID so existing rows are not rejected; validate once deadlines are filled.

-- 4. Email log + idempotency -------------------------------------------------
create table if not exists public.email_log (
  id              uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  template_key    text not null,
  template_alias  text,
  user_id         uuid,
  recipient_hash  text not null,          -- sha256(lower(trim(email))), never the address
  status          text not null default 'queued'
      check (status in ('queued','sent','delivered','bounced','complained','failed','suppressed')),
  resend_id       text,
  error           text,
  related_grant_id uuid references public.grants(id) on delete cascade,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists email_log_recipient_idx on public.email_log (recipient_hash, created_at desc);
create index if not exists email_log_grant_idx on public.email_log (related_grant_id) where related_grant_id is not null;

create table if not exists public.email_suppressions (
  recipient_hash text primary key,
  reason         text not null check (reason in ('hard_bounce','complaint','manual','unsubscribe_all','deleted')),
  source         text,
  created_at     timestamptz not null default now()
);

-- 5. Notification preferences ------------------------------------------------
-- user_preferences.notifications is an untyped jsonb. These are the categories
-- the lifecycle programs actually switch on. Security, billing and data-rights
-- email is deliberately absent: it cannot be turned off.
comment on column public.user_preferences.notifications is
  'Expected keys: opportunity_alerts, deadlines, product_education, summaries, collaboration, marketing. Security, billing and data-rights email is not switchable and must never consult this column.';

alter table public.user_preferences
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists timezone text not null default 'America/Toronto',
  add column if not exists quiet_hours_start time,
  add column if not exists quiet_hours_end time;
create unique index if not exists user_preferences_unsub_idx on public.user_preferences (unsubscribe_token);

-- 6. Consent ledger ----------------------------------------------------------
-- grant_alerts_subscribers already does CASL double opt-in properly
-- (is_active default false, consent_given, consent_ip, consent_user_agent,
-- confirmation_token). This generalises it to account-based email.
create table if not exists public.email_consent (
  id             uuid primary key default gen_random_uuid(),
  recipient_hash text not null,
  consent_type   text not null check (consent_type in ('marketing','product_education','summaries','newsletter')),
  granted        boolean not null,
  basis          text not null check (basis in ('express','implied_business_relationship')),
  source         text not null,
  consent_ip     text,
  consent_user_agent text,
  occurred_at    timestamptz not null default now()
);
create index if not exists email_consent_lookup on public.email_consent (recipient_hash, consent_type, occurred_at desc);
comment on table public.email_consent is
  'Append-only. CASL requires proof of consent and a record of how it was obtained. Never UPDATE a row; insert a new one.';

-- 7. RLS ---------------------------------------------------------------------
alter table public.email_log          enable row level security;
alter table public.email_suppressions enable row level security;
alter table public.email_consent      enable row level security;
-- Service role only. No client policy is created for suppressions or consent.
create policy email_log_read_own on public.email_log
  for select using (user_id = auth.uid());
