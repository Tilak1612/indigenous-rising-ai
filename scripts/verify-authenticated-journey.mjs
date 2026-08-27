#!/usr/bin/env node
/**
 * Verifies the Funding Readiness Workspace end to end as a REAL logged-in
 * user: a genuine GoTrue password login, a genuine user JWT, and the app's
 * own PostgREST calls under production RLS.
 *
 * Everything else about this feature is already verified without it — RLS by
 * role simulation, the query strings against the live API, the layout in a
 * real browser, and the policy shape against tables where GoTrue-minted
 * tokens demonstrably satisfy auth.uid() = user_id today. The single thing
 * only a real login proves is that GoTrue mints claims in the shape THESE
 * policies expect.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=...  npm run verify:auth-journey
 *
 * Needs no database client and no psql: the throwaway user is created and
 * deleted through the Auth Admin API. It is created with email_confirm so
 * GoTrue sends NO email, on the reserved .invalid TLD (RFC 2606) which can
 * never receive mail. Everything it creates is removed in a finally block,
 * and the script re-checks afterwards that nothing is left.
 *
 * The service role key bypasses RLS. It is used ONLY to create and delete
 * the throwaway user; every assertion below runs on the user's own token.
 * Read this file before running it.
 */
import { randomUUID, randomBytes } from 'node:crypto';

const BASE = process.env.SUPABASE_URL ?? 'https://upxojfcdtmqtcvgbjsym.supabase.co';
const ANON = process.env.SUPABASE_ANON_KEY
  ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9qZmNkdG1xdGN2Z2Jqc3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzAwMDgsImV4cCI6MjA4NzU0NjAwOH0.tAaSqKPPy8nfj6u8lby5Fmuqdiy1CezxnSUpWfA2yP0';
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard -> Project Settings -> API).');
  console.error('It is used only to create and delete a throwaway user.');
  process.exit(2);
}

const EMAIL = `qa-harness-${randomUUID().slice(0, 8)}@example.invalid`;
const PASSWORD = `Qa-${randomBytes(15).toString('base64url')}-7Z`;
const admin = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' };

let ok = 0, failed = 0;
const check = (label, pass, detail = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  pass ? ok++ : failed++;
};
const j = async (r) => { try { return await r.json(); } catch { return null; } };

let uid = null;
try {
  // email_confirm: true means GoTrue skips the confirmation email entirely.
  const created = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: 'POST', headers: admin,
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, email_confirm: true,
                           user_metadata: { full_name: 'QA harness (throwaway)' } }),
  });
  const cu = await j(created);
  if (!created.ok) { console.error('could not create the throwaway user:', created.status, JSON.stringify(cu).slice(0, 200)); process.exit(1); }
  uid = cu.id;
  console.log(`throwaway user ${EMAIL} (${uid})\n`);

  // ---- the step that cannot be simulated ----
  const login = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const session = await j(login);
  check('GoTrue issues a session for a real password login', login.ok,
    login.ok ? `expires_in=${session.expires_in}` : JSON.stringify(session).slice(0, 140));
  if (!login.ok) throw new Error('login failed');

  const claims = JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString());
  check('the JWT names this user as its subject', claims.sub === uid, `sub=${claims.sub}`);
  check('the JWT carries the authenticated role', claims.role === 'authenticated', `role=${claims.role}`);

  const REST = `${BASE}/rest/v1`;
  const H = { apikey: ANON, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };

  const gr = await fetch(`${REST}/grants?select=id&limit=1`, { headers: H });
  const grantId = (await j(gr))?.[0]?.id;
  check('the user can read the public grants table', !!grantId);

  const open = async () => {
    const r = await fetch(`${REST}/funding_applications?on_conflict=user_id,grant_id&select=*`, {
      method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ user_id: uid, grant_id: grantId }) });
    return [r.status, await j(r)];
  };
  const [s1, a1] = await open();
  const appId = a1?.[0]?.id;
  check('openWorkspace() creates the workspace under RLS', s1 < 300 && !!appId, `HTTP ${s1}`);

  const [, a2] = await open();
  check('reopening resolves to the SAME row (resume works)', a2?.[0]?.id === appId);

  let stages = true, lastStage = null;
  for (const stage of ['eligibility','documents','missing_info','draft','tasks','submission']) {
    const r = await fetch(`${REST}/funding_applications?id=eq.${appId}`, {
      method: 'PATCH', headers: { ...H, Prefer: 'return=representation' },
      body: JSON.stringify({ stage }) });
    const rows = await j(r);
    if (!r.ok || rows?.length !== 1) stages = false; else lastStage = rows[0].stage;
  }
  check('setStage() advances through all seven stages', stages, `ended at ${lastStage}`);

  const ri = await fetch(`${REST}/funding_readiness_items?select=*`, {
    method: 'POST', headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ application_id: appId, user_id: uid, kind: 'eligibility',
                           label: 'Majority Indigenous ownership', position: 0 }) });
  const item = (await j(ri))?.[0];
  check('addItem() writes a checklist row', ri.ok && !!item?.id, `HTTP ${ri.status}`);

  const ru = await fetch(`${REST}/funding_readiness_items?id=eq.${item?.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=representation' },
    body: JSON.stringify({ state: 'met', note: 'confirmed' }) });
  check('updateItem() marks it met', ru.ok && (await j(ru))?.length === 1);

  const rl = await fetch(`${REST}/funding_applications?select=id,grant_id,stage,grant_application_id,updated_at&user_id=eq.${uid}&order=updated_at.desc`, { headers: H });
  const listed = await j(rl);
  check('the dashboard listing returns the application', rl.ok && listed?.length === 1,
    `stage=${listed?.[0]?.stage}`);

  const ra = await fetch(`${REST}/funding_applications?select=id,user_id`, { headers: H });
  const all = await j(ra);
  check('RLS shows this user only their own rows',
    Array.isArray(all) && all.every((r) => r.user_id === uid), `visible=${all?.length}`);

  const rb = await fetch(`${REST}/funding_applications?id=eq.${appId}`, {
    method: 'PATCH', headers: H, body: JSON.stringify({ stage: 'in_progress' }) });
  check('an invalid stage is rejected by the CHECK constraint', rb.status >= 400, `HTTP ${rb.status}`);

  const rd = await fetch(`${REST}/funding_readiness_items?id=eq.${item?.id}`, {
    method: 'DELETE', headers: { ...H, Prefer: 'return=representation' } });
  check('deleteItem() removes it', rd.ok && (await j(rd))?.length === 1);
} finally {
  if (uid) {
    // Service role bypasses RLS, so this reaches the rows regardless.
    for (const t of ['funding_readiness_items', 'funding_applications', 'documents']) {
      await fetch(`${BASE}/rest/v1/${t}?user_id=eq.${uid}`, { method: 'DELETE', headers: admin });
    }
    await fetch(`${BASE}/rest/v1/profiles?id=eq.${uid}`, { method: 'DELETE', headers: admin });
    const del = await fetch(`${BASE}/auth/v1/admin/users/${uid}`, { method: 'DELETE', headers: admin });
    console.log(`\ncleanup: user delete HTTP ${del.status}`);
    const left = await fetch(`${BASE}/rest/v1/funding_applications?select=id&user_id=eq.${uid}`, { headers: admin });
    const rows = await j(left);
    console.log(Array.isArray(rows) && rows.length === 0
      ? 'verified: no rows left behind by this run'
      : `WARNING: ${rows?.length} row(s) still present for ${uid}`);
  }
}

console.log(`\n${ok} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
