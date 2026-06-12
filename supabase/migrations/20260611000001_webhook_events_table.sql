-- Audit log for Stripe webhook events, written by the stripe-webhook edge
-- function via the service role. The function already inserted/updated here,
-- but the table did not exist (writes failed silently). This creates it.
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

comment on table public.webhook_events is
  'Audit log of Stripe webhook events (written by the stripe-webhook edge function via service role). RLS denies all client access; only service_role, which bypasses RLS, reads/writes.';

create index if not exists webhook_events_created_at_idx
  on public.webhook_events (created_at desc);

-- Deny all client (anon/authenticated) access. The stripe-webhook function uses
-- the service_role key, which bypasses RLS, so it can still read/write. Matches
-- the project's deny-by-default posture for internal tables.
alter table public.webhook_events enable row level security;
