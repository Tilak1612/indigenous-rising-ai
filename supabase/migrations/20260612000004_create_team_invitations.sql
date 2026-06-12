-- Team invitations the account owner wants to add. Owner-scoped RLS
-- (owner_id = auth.uid()). This records intended invitations; broader org-wide
-- shared access is a separate feature. No fabricated members.
create table if not exists public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin','member','viewer')),
  status text not null default 'pending' check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now()
);
create unique index if not exists team_invitations_owner_email_idx
  on public.team_invitations (owner_id, lower(email));

alter table public.team_invitations enable row level security;

create policy "own_select" on public.team_invitations
  for select using (owner_id = auth.uid());
create policy "own_insert" on public.team_invitations
  for insert with check (owner_id = auth.uid());
create policy "own_update" on public.team_invitations
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own_delete" on public.team_invitations
  for delete using (owner_id = auth.uid());
