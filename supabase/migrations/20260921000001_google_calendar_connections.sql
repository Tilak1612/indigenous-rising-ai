-- Google Calendar integration: one connection per user.
-- Tokens are AES-256-GCM encrypted server-side (Vercel function); never plaintext.
create table if not exists public.google_calendar_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  google_email text,
  calendar_id text,
  scope text,
  encrypted_tokens text,
  status text not null default 'connected' check (status in ('connected','disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_calendar_connections enable row level security;

drop policy if exists "gcal_select_own" on public.google_calendar_connections;
drop policy if exists "gcal_insert_own" on public.google_calendar_connections;
drop policy if exists "gcal_update_own" on public.google_calendar_connections;
drop policy if exists "gcal_delete_own" on public.google_calendar_connections;

create policy "gcal_select_own" on public.google_calendar_connections
  for select to authenticated using (user_id = (select auth.uid()));
create policy "gcal_insert_own" on public.google_calendar_connections
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "gcal_update_own" on public.google_calendar_connections
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "gcal_delete_own" on public.google_calendar_connections
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on public.google_calendar_connections from anon;
grant select, insert, update, delete on public.google_calendar_connections to authenticated;
