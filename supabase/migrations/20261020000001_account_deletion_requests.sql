-- Self-serve account deletion with a 30-day grace period.
--
-- A signed-in user inserts one row for themselves; the account keeps working
-- for 30 days and the row can be deleted (cancelling) by signing in. A daily
-- pg_cron job hard-deletes accounts whose scheduled_for has passed. Every
-- user-owned table already cascades from auth.users; community posts and
-- comments are anonymised first so other members' threads stay readable.
-- Payment records live in Stripe and are kept as Canadian tax law requires.

create table if not exists public.account_deletion_requests (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  requested_at  timestamptz not null default now(),
  scheduled_for timestamptz not null default (now() + interval '30 days'),
  source        text not null default 'web' check (source in ('web', 'app', 'email'))
);

alter table public.account_deletion_requests enable row level security;

create policy "Users can view own deletion request"
  on public.account_deletion_requests for select to authenticated
  using (auth.uid() = user_id);

-- The user may only schedule their own deletion, and never sooner than the
-- grace period; there is no update policy, so the date cannot be edited.
create policy "Users can request own deletion"
  on public.account_deletion_requests for insert to authenticated
  with check (auth.uid() = user_id and scheduled_for >= now() + interval '29 days');

create policy "Users can cancel own deletion"
  on public.account_deletion_requests for delete to authenticated
  using (auth.uid() = user_id);

-- Community content outlives the account, with the author removed.
alter table public.community_posts    alter column user_id drop not null;
alter table public.community_comments alter column user_id drop not null;

create or replace function public.purge_due_account_deletions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  purged integer := 0;
begin
  for r in
    select user_id, requested_at from public.account_deletion_requests
    where scheduled_for <= now()
  loop
    update public.community_posts
       set user_id = null, display_name = '[account removed]'
     where user_id = r.user_id;
    update public.community_comments
       set user_id = null, display_name = '[account removed]'
     where user_id = r.user_id;
    insert into public.audit_logs (user_id, action, entity_type, entity_id, metadata)
    values (null, 'account_deleted', 'user', r.user_id::text,
            jsonb_build_object('requested_at', r.requested_at, 'purged_at', now()));
    -- Cascades remove the profile, plans, documents, saved funding, matches,
    -- tasks, tickets, notifications, chats, calendar connection, identities,
    -- sessions and the request row itself.
    delete from auth.users where id = r.user_id;
    purged := purged + 1;
  end loop;
  return purged;
end;
$$;

revoke all on function public.purge_due_account_deletions() from public, anon, authenticated;

do $$
begin
  perform cron.unschedule('account-deletion-purge-daily');
exception when others then
  null;
end $$;

select cron.schedule(
  'account-deletion-purge-daily',
  '15 3 * * *',
  $$select public.purge_due_account_deletions();$$
);
