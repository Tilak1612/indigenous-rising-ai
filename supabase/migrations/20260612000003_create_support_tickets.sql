-- Support tickets: users create and track their own support requests.
-- Owner-scoped RLS (user_id = auth.uid()). Staff responses/status changes are
-- handled out-of-band (service role / admin) for now; users can create, view,
-- and close their own tickets.
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets (user_id, created_at desc);

alter table public.support_tickets enable row level security;

create policy "own_select" on public.support_tickets
  for select using (user_id = auth.uid());
create policy "own_insert" on public.support_tickets
  for insert with check (user_id = auth.uid());
create policy "own_update" on public.support_tickets
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own_delete" on public.support_tickets
  for delete using (user_id = auth.uid());

-- keep updated_at fresh on status changes
create or replace function public.touch_support_tickets_updated_at()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists support_tickets_touch on public.support_tickets;
create trigger support_tickets_touch before update on public.support_tickets
  for each row execute function public.touch_support_tickets_updated_at();
