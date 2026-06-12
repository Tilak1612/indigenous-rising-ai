-- Foundational tables for the remaining dashboard features (Business Profile,
-- Document Library, Calendar/tasks, Notifications, AI chat, version history,
-- audit logs) + a private documents Storage bucket. Owner-scoped RLS on every
-- user table (user_id = auth.uid()); audit_logs is read-own/admin, no client
-- writes. Verified live: cross-user insert is denied (403).

create table if not exists public.business_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  organization_type text,
  province text,
  sector text,
  stage text,
  ownership_type text,
  employee_count text,
  revenue_range text,
  funding_needs jsonb default '[]'::jsonb,
  goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists documents_user_idx on public.documents (user_id, created_at desc);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  task_type text not null default 'task',
  due_date timestamptz,
  status text not null default 'todo',
  related_type text,
  related_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user_due_idx on public.tasks (user_id, due_date);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'info',
  title text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_msgs_session_idx on public.ai_chat_messages (session_id, created_at);

create table if not exists public.business_plan_versions (
  id uuid primary key default gen_random_uuid(),
  business_plan_id uuid not null references public.business_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb,
  summary text,
  version_number int,
  created_at timestamptz not null default now()
);
create index if not exists bp_versions_idx on public.business_plan_versions (business_plan_id, created_at desc);

create table if not exists public.grant_application_versions (
  id uuid primary key default gen_random_uuid(),
  grant_application_id uuid not null references public.grant_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content jsonb,
  summary text,
  version_number int,
  created_at timestamptz not null default now()
);
create index if not exists ga_versions_idx on public.grant_application_versions (grant_application_id, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_user_idx on public.audit_logs (user_id, created_at desc);

do $$
declare t text;
begin
  foreach t in array array[
    'business_profiles','documents','tasks','notifications',
    'ai_chat_sessions','ai_chat_messages','business_plan_versions','grant_application_versions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($f$create policy "own_select" on public.%I for select using (user_id = auth.uid())$f$, t);
    execute format($f$create policy "own_insert" on public.%I for insert with check (user_id = auth.uid())$f$, t);
    execute format($f$create policy "own_update" on public.%I for update using (user_id = auth.uid())$f$, t);
    execute format($f$create policy "own_delete" on public.%I for delete using (user_id = auth.uid())$f$, t);
  end loop;
end $$;

alter table public.audit_logs enable row level security;
create policy "audit_read_own_or_admin" on public.audit_logs for select
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values ('documents','documents', false)
on conflict (id) do nothing;

create policy "docs_read_own" on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs_insert_own" on storage.objects for insert
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs_update_own" on storage.objects for update
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "docs_delete_own" on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
