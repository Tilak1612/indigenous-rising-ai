-- Tables the deployed submit-contact / newsletter-subscribe / submit-data-request
-- edge functions write to. They were missing, so those 3 public forms failed at
-- the DB layer (function 500 on insert). Schemas match exactly what each function
-- uses. RLS deny-by-default: functions run with the service role (bypasses RLS);
-- no client (anon/authenticated) direct access. Same pattern as webhook_events.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  phone text,
  message text not null,
  ip_address text,
  user_agent text,
  status text not null default 'new',
  submitted_at timestamptz not null default now()
);
create index if not exists contact_submissions_ip_time_idx
  on public.contact_submissions (ip_address, submitted_at desc);
alter table public.contact_submissions enable row level security;

create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  ip_address text,
  user_agent text,
  confirmation_token text,
  unsubscribe_token text not null default replace(gen_random_uuid()::text, '-', ''),
  is_active boolean not null default false,
  confirmed_at timestamptz,
  subscribed_at timestamptz not null default now()
);
create index if not exists newsletter_conf_token_idx on public.newsletter_subscriptions (confirmation_token);
create index if not exists newsletter_unsub_token_idx on public.newsletter_subscriptions (unsubscribe_token);
create index if not exists newsletter_ip_time_idx on public.newsletter_subscriptions (ip_address, subscribed_at desc);
alter table public.newsletter_subscriptions enable row level security;

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  request_type text not null,
  description text,
  phone text,
  verification_method text,
  ip_address text,
  user_agent text,
  tracking_number text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 12)),
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists data_requests_tracking_idx on public.data_requests (tracking_number);
create index if not exists data_requests_ip_time_idx on public.data_requests (ip_address, submitted_at desc);
alter table public.data_requests enable row level security;
