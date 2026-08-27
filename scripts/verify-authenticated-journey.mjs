#!/usr/bin/env node
/**
 * Verifies the Funding Readiness Workspace end to end as a REAL logged-in
 * user: a genuine GoTrue password login, a genuine user JWT, and the app's
 * own PostgREST calls under production RLS.
 *
 * Everything else about this feature has been verified without it —
 * RLS by role simulation, query strings against the live API, layout in a
 * browser. The one thing only a real login proves is that GoTrue issues a
 * token whose claims satisfy the policies as written.
 *
 *   SUPABASE_DB_URL=...  # postgres connection string (service access)
 *   node scripts/verify-authenticated-journey.mjs
 *
 * It creates a throwaway user on the reserved .invalid TLD (RFC 2606, can
 * never receive mail), created via SQL rather than the signup API so no
 * confirmation email is sent. It deletes the user and every row it created
 * in a finally block, and prints what it removed.
 *
 * Requires `psql` on PATH. Read it before running it.
 */
import { execFileSync } from 'node:child_process';
import { randomUUID, randomBytes } from 'node:crypto';

const URL_BASE = process.env.SUPABASE_URL ?? 'https://upxojfcdtmqtcvgbjsym.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY;
const DB = process.env.SUPABASE_DB_URL;
if (!ANON || !DB) {
  console.error('Set SUPABASE_ANON_KEY and SUPABASE_DB_URL first.');
  process.exit(2);
}

const EMAIL = `qa-harness-${randomUUID().slice(0, 8)}@example.invalid`;
const PASSWORD = `Qa-${randomBytes(12).toString('base64url')}-1A`;
const sql = (q) => execFileSync('psql', [DB, '-At', '-c', q], { encoding: 'utf8' }).trim();

let ok = 0, failed = 0;
const check = (label, pass, detail = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  pass ? ok++ : failed++;
};

try {
  sql(`create extension if not exists pgcrypto;`);
  const uid = sql(`
    with nu as (
      insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),
        'authenticated','authenticated','${EMAIL}',
        crypt('${PASSWORD}', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"QA harness"}'::jsonb, now(), now())
      returning id, email)
    insert into auth.identities (id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at)
    select gen_random_uuid(), nu.id,
      json_build_object('sub', nu.id::text, 'email', nu.email, 'email_verified', true)::jsonb,
      'email', nu.id::text, now(), now(), now()
    from nu returning user_id;`);

  // A real login. This is the step that cannot be simulated.
  const login = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const session = await login.json();
  check('GoTrue issues a session for a real password login', login.ok,
    login.ok ? `expires_in=${session.expires_in}` : JSON.stringify(session).slice(0, 120));
  if (!login.ok) throw new Error('login failed');

  const claims = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString());
  check('the JWT names this user as the subject', claims.sub === uid, `sub=${claims.sub}`);
  check('the JWT carries the authenticated role', claims.role === 'authenticated');

  const REST = `${URL_BASE}/rest/v1`;
  const H = { apikey: ANON, Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json' };
  const grantId = sql(`select id from public.grants limit 1;`);

  // The app's own calls, verbatim from src/lib/readiness.ts.
  const open = async () => {
    const r = await fetch(`${REST}/funding_applications?on_conflict=user_id,grant_id&select=*`, {
      method: 'POST',
      headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ user_id: uid, grant_id: grantId }) });
    return [r.status, await r.json()];
  };
  const [s1, a1] = await open();
  check('openWorkspace() creates the workspace', s1 < 300 && a1[0]?.id, `HTTP ${s1}`);
  const appId = a1[0]?.id;

  const [, a2] = await open();
  check('reopening resolves to the SAME row (resume works)', a2[0]?.id === appId);

  let stagesOk = true;
  for (const stage of ['eligibility','documents','missing_info','draft','tasks','submission']) {
    const r = await fetch(`${REST}/funding_applications?id=eq.${appId}`, {
      method: 'PATCH', headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify({ stage }) });
    const rows = await r.json();
    if (!r.ok || !Array.isArray(rows) || rows.length !== 1) stagesOk = false;
  }
  check('setStage() advances through all seven stages', stagesOk);

  const rItem = await fetch(`${REST}/funding_readiness_items?select=*`, {
    method: 'POST', headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ application_id: appId, user_id: uid,
      kind: 'eligibility', label: 'Majority Indigenous ownership', position: 0 }) });
  const item = (await rItem.json())[0];
  check('addItem() writes a checklist row', rItem.ok && !!item?.id, `HTTP ${rItem.status}`);

  const rUpd = await fetch(`${REST}/funding_readiness_items?id=eq.${item.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ state: 'met', note: 'confirmed' }) });
  check('updateItem() marks it met', rUpd.ok && (await rUpd.json()).length === 1);

  const rList = await fetch(
    `${REST}/funding_applications?select=id,grant_id,stage,grant_application_id,updated_at&user_id=eq.${uid}&order=updated_at.desc`,
    { headers: H });
  const listed = await rList.json();
  check('the dashboard lists the application', rList.ok && listed.length === 1,
    `stage=${listed[0]?.stage}`);

  // Isolation, from the other direction: this user must not see anyone else's.
  const rAll = await fetch(`${REST}/funding_applications?select=id,user_id`, { headers: H });
  const all = await rAll.json();
  check('RLS shows this user only their own rows',
    Array.isArray(all) && all.every((r) => r.user_id === uid), `visible=${all.length}`);

  const rBad = await fetch(`${REST}/funding_applications?id=eq.${appId}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ stage: 'in_progress' }) });
  check('an invalid stage is rejected by the CHECK constraint', rBad.status >= 400,
    `HTTP ${rBad.status}`);

  const rDel = await fetch(`${REST}/funding_readiness_items?id=eq.${item.id}`, {
    method: 'DELETE', headers: { ...H, Prefer: 'return=representation' } });
  check('deleteItem() removes it', rDel.ok && (await rDel.json()).length === 1);
} finally {
  const removed = sql(`
    with t as (select id from auth.users where email = '${EMAIL}'),
    a as (delete from public.funding_readiness_items where user_id in (select id from t) returning 1),
    b as (delete from public.funding_applications  where user_id in (select id from t) returning 1),
    c as (delete from public.documents             where user_id in (select id from t) returning 1),
    d as (delete from public.profiles              where id      in (select id from t) returning 1),
    e as (delete from auth.identities              where user_id in (select id from t) returning 1),
    f as (delete from auth.users                   where id      in (select id from t) returning 1)
    select concat_ws(' ', 'items='||(select count(*) from a), 'apps='||(select count(*) from b),
      'docs='||(select count(*) from c), 'profiles='||(select count(*) from d),
      'identities='||(select count(*) from e), 'users='||(select count(*) from f));`);
  console.log(`\ncleanup removed: ${removed}`);
  const left = sql(`select count(*) from auth.users where email like '%@example.invalid';`);
  console.log(left === '0' ? 'no fixture users remain' : `WARNING: ${left} fixture user(s) still present`);
}

console.log(`\n${ok} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
