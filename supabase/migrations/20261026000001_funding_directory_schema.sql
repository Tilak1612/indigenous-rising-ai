-- Funding Directory, slice 1: additive schema.
--
-- Everything here is additive. No existing column is renamed or dropped, no
-- row is published or unpublished, and the public read policy on grants is
-- unchanged (anon and authenticated still see only is_published = true). The
-- mobile app and the digest keep working on the columns they already read.
--
-- What this adds and why (see docs/FUNDING_GAP_ANALYSIS.md):
--   * funding_providers      the funder as an entity (type, region, directory?)
--   * grants.*               slug for a canonical URL, the most specific
--                            verified destination (apply_url + apply_link_type),
--                            intake status and dates, applicant/age/revenue
--                            rules, required documents, and the source
--                            evidence behind every material field
--   * funding_program_rounds one row per intake, so a closed round is history
--                            rather than an overwritten deadline
--   * funding_verification_events, funding_link_checks, funding_review_queue
--                            the audit trail the brief asks for, written by
--                            admins and by the link checker
--   * funding_link_reports   "report a broken link" from the public page
--   * funding_outbound_clicks aggregate counts only, no user id
--   * admin policies         admins can manage the catalogue from /admin
--                            instead of by migration

-- ---------------------------------------------------------------------------
-- 1. Providers
-- ---------------------------------------------------------------------------
create table if not exists public.funding_providers (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  provider_type text not null default 'other'
    check (provider_type in ('federal','provincial','territorial',
      'indigenous_government','ifi','metis_capital_corporation',
      'crown_corporation','nonprofit','lender','other')),
  -- Province/territory codes the provider serves; empty means national.
  regions       text[] not null default '{}',
  website       text,
  -- true for NACCA-style directories and lender networks: a provider you are
  -- sent to find a lender through, not a programme you apply to.
  is_directory  boolean not null default false,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.funding_providers enable row level security;
create policy "Anyone can read funding providers"
  on public.funding_providers for select to anon, authenticated using (true);
create policy "Admins manage funding providers"
  on public.funding_providers for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create trigger update_funding_providers_updated_at
  before update on public.funding_providers
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 2. grants: new columns
-- ---------------------------------------------------------------------------
alter table public.grants
  add column if not exists slug text,
  add column if not exists provider_id uuid references public.funding_providers(id) on delete set null,
  -- The most specific verified destination. NULL means "no online application
  -- exists"; the UI then falls back to source_url with a label that says so.
  add column if not exists apply_url text,
  add column if not exists apply_link_type text not null default 'program_page'
    check (apply_link_type in ('application_form','application_instructions',
      'program_page','directory','contact')),
  add column if not exists application_method text not null default 'unknown'
    check (application_method in ('online','email','through_lender','contact',
      'referral','unknown')),
  -- Funding purposes, e.g. {startup, expansion, equipment, export}.
  add column if not exists program_category text[] not null default '{}',
  add column if not exists intake_status text not null default 'unknown'
    check (intake_status in ('open','rolling','closed','not_yet_open','unknown')),
  add column if not exists opens_at date,
  add column if not exists intake_timezone text not null default 'America/Toronto',
  add column if not exists matching_funds_required boolean,
  add column if not exists matching_funds_notes text,
  add column if not exists eligible_expenses text[] not null default '{}',
  add column if not exists documents_required text[] not null default '{}',
  add column if not exists application_steps text[] not null default '{}',
  add column if not exists eligibility_exclusions text,
  add column if not exists repayment_terms text,
  add column if not exists entrepreneur_age_min smallint,
  add column if not exists entrepreneur_age_max smallint,
  add column if not exists business_age_max_months integer,
  add column if not exists revenue_max integer,
  -- [{field, quote, url, fetched_at}] — the exact text a material value was
  -- read from. Public, so the detail page can show "source says".
  add column if not exists source_evidence jsonb not null default '[]'::jsonb,
  add column if not exists verification_confidence text not null default 'none'
    check (verification_confidence in ('high','medium','low','none')),
  add column if not exists schema_version smallint not null default 2,
  add column if not exists published_at timestamptz;

comment on column public.grants.deadline is
  'Closing date of the current intake. NULL with is_recurring = true means rolling. History lives in funding_program_rounds.';
comment on column public.grants.apply_url is
  'Most specific verified destination (see apply_link_type). NULL when the funder has no online application; fall back to source_url.';

-- Slugs for existing rows: lower-case, accents folded for the letters that
-- occur in the catalogue, everything else collapsed to hyphens.
update public.grants
   set slug = trim(both '-' from regexp_replace(
         lower(translate(name, 'äàáâãåéèêëíìîïóòôõöúùûüçñÄÀÁÂÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜÇÑ',
                               'aaaaaaeeeeiiiiooooouuuucnAAAAEEEEIIIIOOOOUUUUCN')),
         '[^a-z0-9]+', '-', 'g'))
 where slug is null;
-- Disambiguate any collision deterministically by created_at order.
with d as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as n
    from public.grants)
update public.grants g set slug = g.slug || '-' || d.n
  from d where d.id = g.id and d.n > 1;
alter table public.grants alter column slug set not null;
create unique index if not exists grants_slug_key on public.grants(slug);

-- Default the new columns from what the rows already say.
update public.grants set published_at = coalesce(published_at, created_at) where is_published;
update public.grants set intake_status = 'rolling' where intake_status = 'unknown' and is_recurring and deadline is null;
update public.grants set intake_status = 'open'    where intake_status = 'unknown' and deadline is not null and deadline >= current_date;
update public.grants set intake_status = 'closed'  where intake_status = 'unknown' and deadline is not null and deadline <  current_date;
-- Every existing application_url is a programme page or a homepage, never a
-- form (checked row by row on 2026-09-28 and 2026-10-26). Record that honestly;
-- slice 2 sets the more specific types per row.
update public.grants set apply_url = application_url, apply_link_type = 'program_page'
 where apply_url is null;
update public.grants set verification_confidence = 'medium'
 where last_verified is not null and verification_confidence = 'none';

create index if not exists idx_grants_published_intake
  on public.grants(is_published, intake_status, deadline);
create index if not exists idx_grants_program_category on public.grants using gin (program_category);
create index if not exists idx_grants_applicant_types  on public.grants using gin (applicant_types);
create index if not exists idx_grants_identity_criteria on public.grants using gin (identity_criteria);

-- Admins manage the catalogue. No delete policy on purpose: retire instead.
create policy "Admins can read all grants"
  on public.grants for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can insert grants"
  on public.grants for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update grants"
  on public.grants for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 3. Rounds (intake history)
-- ---------------------------------------------------------------------------
create table if not exists public.funding_program_rounds (
  id          uuid primary key default gen_random_uuid(),
  grant_id    uuid not null references public.grants(id) on delete cascade,
  label       text not null,                      -- e.g. "2026 intake", "Economic Diversification Grant 2025"
  opens_at    date,
  closes_at   date,
  timezone    text not null default 'America/Toronto',
  status      text not null default 'unknown'
    check (status in ('open','closed','not_yet_open','unknown')),
  source_url  text,
  evidence    jsonb not null default '[]'::jsonb,
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_funding_program_rounds_grant on public.funding_program_rounds(grant_id, closes_at desc);
alter table public.funding_program_rounds enable row level security;
create policy "Anyone can read rounds of published grants"
  on public.funding_program_rounds for select to anon, authenticated
  using (exists (select 1 from public.grants g where g.id = grant_id and g.is_published));
create policy "Admins manage rounds"
  on public.funding_program_rounds for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 4. Audit trail: verification events, link checks, review queue
-- ---------------------------------------------------------------------------
create table if not exists public.funding_verification_events (
  id          uuid primary key default gen_random_uuid(),
  grant_id    uuid not null references public.grants(id) on delete cascade,
  event_type  text not null check (event_type in ('checked','link_repaired',
    'terms_corrected','published','unpublished','status_changed',
    'automated_link_check','created','edited')),
  actor       uuid references auth.users(id) on delete set null,   -- null = system
  summary     text not null,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_funding_verification_events_grant on public.funding_verification_events(grant_id, created_at desc);
alter table public.funding_verification_events enable row level security;
create policy "Admins read verification events"
  on public.funding_verification_events for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins write verification events"
  on public.funding_verification_events for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create table if not exists public.funding_link_checks (
  id           uuid primary key default gen_random_uuid(),
  grant_id     uuid not null references public.grants(id) on delete cascade,
  kind         text not null check (kind in ('source','apply')),
  url          text not null,
  status_code  integer,
  final_url    text,
  ok           boolean not null,
  -- 'dead' (404/410/DNS) is the only verdict that flips a row to needs_review.
  -- 'blocked' (403/429/timeout) is bot blocking, not evidence the page is gone.
  verdict      text not null check (verdict in ('ok','dead','blocked','error','redirected')),
  error        text,
  checked_at   timestamptz not null default now()
);
create index if not exists idx_funding_link_checks_grant on public.funding_link_checks(grant_id, checked_at desc);
alter table public.funding_link_checks enable row level security;
create policy "Admins read link checks"
  on public.funding_link_checks for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create table if not exists public.funding_review_queue (
  id           uuid primary key default gen_random_uuid(),
  grant_id     uuid references public.grants(id) on delete cascade,
  reason       text not null check (reason in ('dead_link','blocked_link',
    'deadline_passed','source_changed','user_report','new_record',
    'needs_terms_check','other')),
  severity     text not null default 'medium' check (severity in ('low','medium','high')),
  payload      jsonb not null default '{}'::jsonb,
  status       text not null default 'open' check (status in ('open','resolved','dismissed')),
  resolved_by  uuid references auth.users(id) on delete set null,
  resolution   text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index if not exists idx_funding_review_queue_open on public.funding_review_queue(status, created_at desc);
alter table public.funding_review_queue enable row level security;
create policy "Admins manage review queue"
  on public.funding_review_queue for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 5. Public inputs: broken-link reports and outbound click counts
-- ---------------------------------------------------------------------------
create table if not exists public.funding_link_reports (
  id          uuid primary key default gen_random_uuid(),
  grant_id    uuid not null references public.grants(id) on delete cascade,
  url         text not null check (length(url) <= 2048),
  message     text check (message is null or length(message) <= 500),
  created_at  timestamptz not null default now()
);
alter table public.funding_link_reports enable row level security;
-- Anyone may report a link on a PUBLISHED grant; nobody but admins may read.
create policy "Anyone can report a broken link"
  on public.funding_link_reports for insert to anon, authenticated
  with check (exists (select 1 from public.grants g where g.id = grant_id and g.is_published));
create policy "Admins read link reports"
  on public.funding_link_reports for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Abuse guard: at most 10 reports per grant per hour, 100 overall per hour.
create or replace function public.funding_link_reports_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.funding_link_reports
       where grant_id = new.grant_id and created_at > now() - interval '1 hour') >= 10
     or (select count(*) from public.funding_link_reports
       where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'Too many reports right now. Please try again later.' using errcode = 'P0001';
  end if;
  -- Open one review item per grant per day, not one per report.
  insert into public.funding_review_queue (grant_id, reason, severity, payload)
  select new.grant_id, 'user_report', 'medium', jsonb_build_object('url', new.url)
   where not exists (select 1 from public.funding_review_queue q
                      where q.grant_id = new.grant_id and q.reason = 'user_report'
                        and q.status = 'open' and q.created_at > now() - interval '1 day');
  return new;
end $$;
drop trigger if exists funding_link_reports_guard on public.funding_link_reports;
create trigger funding_link_reports_guard
  before insert on public.funding_link_reports
  for each row execute function public.funding_link_reports_guard();

-- Aggregate counters only. No user id, no IP, no referrer: the brief's
-- analytics rule is that sensitive eligibility attributes never leak, and a
-- per-click row keyed to a person is exactly the kind of record that could.
create table if not exists public.funding_outbound_clicks (
  grant_id  uuid not null references public.grants(id) on delete cascade,
  day       date not null default current_date,
  link_kind text not null check (link_kind in ('apply','source')),
  clicks    integer not null default 0,
  primary key (grant_id, day, link_kind)
);
alter table public.funding_outbound_clicks enable row level security;
create policy "Admins read outbound click counts"
  on public.funding_outbound_clicks for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.record_funding_click(p_grant_id uuid, p_kind text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_kind not in ('apply','source') then return; end if;
  if not exists (select 1 from public.grants where id = p_grant_id and is_published) then return; end if;
  insert into public.funding_outbound_clicks (grant_id, day, link_kind, clicks)
  values (p_grant_id, current_date, p_kind, 1)
  on conflict (grant_id, day, link_kind) do update set clicks = public.funding_outbound_clicks.clicks + 1;
end $$;
revoke all on function public.record_funding_click(uuid, text) from public;
grant execute on function public.record_funding_click(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Application tracking stages (additive superset)
-- ---------------------------------------------------------------------------
alter table public.funding_saved_matches drop constraint if exists funding_saved_matches_status_check;
alter table public.funding_saved_matches add constraint funding_saved_matches_status_check
  check (status in ('interested','eligibility_review','preparing_documents',
    'ready_to_apply','applied','submitted_externally','under_review','pending',
    'awarded','declined','withdrawn'));
alter table public.funding_saved_matches
  add column if not exists external_reference text check (external_reference is null or length(external_reference) <= 120),
  add column if not exists applied_at date;

-- ---------------------------------------------------------------------------
-- 7. Admin read of alert subscribers count is NOT added: subscriber emails stay
--    inside the edge functions. (Documented so nobody adds it in passing.)
-- ---------------------------------------------------------------------------
