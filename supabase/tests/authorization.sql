-- Cross-user authorization test for every table holding member data.
--
--   psql "$SUPABASE_DB_URL" -f supabase/tests/authorization.sql
--
-- Creates two synthetic users, gives user A a row in each table, then asks as
-- user B: can I read it, change it, delete it? Every answer must be no. It
-- also checks A can still see A's own row, so a "0 rows" result cannot pass
-- because the insert silently failed.
--
-- The whole run is one transaction that ends in ROLLBACK: no account is
-- created, no production row is touched. Nothing here modifies a policy or a
-- SECURITY DEFINER function — it only exercises them.
begin;

create temp table rls_results(
  area text, check_name text, expected text, actual text, pass boolean
) on commit drop;

do $$
declare
  a uuid := '00000000-0000-4000-8000-00000000000a';
  b uuid := '00000000-0000-4000-8000-00000000000b';
  grant_id uuid;
  app_id uuid;
  n bigint;
  claims_a text;
  claims_b text;
begin
  claims_a := json_build_object('sub', a, 'role', 'authenticated', 'email', 'rls-a@example.invalid')::text;
  claims_b := json_build_object('sub', b, 'role', 'authenticated', 'email', 'rls-b@example.invalid')::text;

  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@example.invalid', 'x', now(), now(), now()),
         (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@example.invalid', 'x', now(), now(), now())
  on conflict (id) do nothing;

  select id into grant_id from public.grants limit 1;

  insert into public.profiles (id) values (a) on conflict (id) do nothing;
  insert into public.business_plans (user_id, title) values (a, 'A plan');
  insert into public.documents (user_id, name, storage_path) values (a, 'a.pdf', a || '/a.pdf');
  insert into public.tasks (user_id, title) values (a, 'A task');
  insert into public.notifications (user_id, message) values (a, 'A notification');
  insert into public.support_tickets (user_id, subject, description) values (a, 'A subject', 'A description');
  insert into public.user_preferences (user_id) values (a) on conflict do nothing;
  insert into public.ai_chat_sessions (user_id) values (a);
  insert into public.business_profiles (user_id) values (a) on conflict do nothing;
  insert into public.team_invitations (owner_id, email) values (a, 'invitee@example.invalid');
  insert into public.grant_applications (user_id, grant_name) values (a, 'A grant application');
  if grant_id is not null then
    insert into public.funding_saved_matches (user_id, grant_id) values (a, grant_id);
    insert into public.funding_applications (user_id, grant_id) values (a, grant_id) returning id into app_id;
    insert into public.funding_readiness_items (application_id, user_id, kind, label)
      values (app_id, a, 'eligibility', 'A readiness item');
  end if;
  insert into storage.objects (bucket_id, name, owner) values ('documents', a || '/private.pdf', a);

  -- ---- as user B: every private row must be invisible -------------------
  perform set_config('request.jwt.claims', claims_b, true);
  perform set_config('role', 'authenticated', true);

  -- reads
  execute 'select count(*) from public.profiles where id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('profiles', 'B reads A profile', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.business_plans where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('business plans', 'B reads A plans', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.documents where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('documents', 'B reads A documents', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.tasks where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('notes and tasks', 'B reads A tasks', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.notifications where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('notifications', 'B reads A notifications', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.support_tickets where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('account information', 'B reads A support tickets', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.user_preferences where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('account information', 'B reads A preferences', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.ai_chat_sessions where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('AI chat', 'B reads A chat sessions', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.business_profiles where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('business profile', 'B reads A business profile', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.team_invitations where owner_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('cross-organization', 'B reads A team invitations', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.grant_applications where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('applications', 'B reads A grant applications', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.funding_saved_matches where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('saved opportunities', 'B reads A saved matches', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.funding_applications where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('funding matches', 'B reads A funding applications', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.funding_readiness_items where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('applications', 'B reads A readiness items', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from storage.objects where bucket_id = ''documents'' and owner = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('uploaded files', 'B reads A uploaded file', '0', n::text, n = 0);
  perform set_config('role', 'authenticated', true);

  -- writes: B must not be able to change or destroy A's rows
  begin
    execute 'update public.business_plans set title = ''hijacked'' where user_id = $1' using a;
    get diagnostics n = row_count;
  exception when insufficient_privilege then n := 0;
  end;
  perform set_config('role', 'none', true);
  insert into rls_results values ('business plans', 'B updates A plan', '0 rows', n::text || ' rows', n = 0);
  perform set_config('role', 'authenticated', true);

  begin
    execute 'delete from public.documents where user_id = $1' using a;
    get diagnostics n = row_count;
  exception when insufficient_privilege then n := 0;
  end;
  perform set_config('role', 'none', true);
  insert into rls_results values ('documents', 'B deletes A document', '0 rows', n::text || ' rows', n = 0);
  perform set_config('role', 'authenticated', true);

  begin
    execute 'insert into public.tasks (user_id, title) values ($1, ''planted by B'')' using a;
    get diagnostics n = row_count;
  exception when others then n := 0;
  end;
  perform set_config('role', 'none', true);
  insert into rls_results values ('notes and tasks', 'B writes a row owned by A', '0 rows', n::text || ' rows', n = 0);

  -- ---- as user A: the data really is there (so 0 above is not vacuous) ---
  perform set_config('request.jwt.claims', claims_a, true);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.business_plans where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('control', 'A reads A own plan', '1', n::text, n = 1);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from public.documents where user_id = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('control', 'A reads A own document', '1', n::text, n = 1);
  perform set_config('role', 'authenticated', true);

  execute 'select count(*) from storage.objects where bucket_id = ''documents'' and owner = $1' into n using a;
  perform set_config('role', 'none', true);
  insert into rls_results values ('control', 'A reads A own uploaded file', '1', n::text, n = 1);

  perform set_config('request.jwt.claims', '', true);
end $$;

select area, check_name, expected, actual, case when pass then 'PASS' else 'FAIL' end as result
from rls_results order by pass, area, check_name;

select count(*) filter (where not pass) as failures, count(*) as checks from rls_results;

rollback;
