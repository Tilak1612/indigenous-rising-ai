#!/usr/bin/env node
/**
 * Refresh scripts/data/funding-snapshot.json from the live grants table.
 *
 * The prerender fetches live data at build time and falls back to this file.
 * Keeping the fallback close to reality is what makes the fallback safe, so
 * this is the command to run after the funding inventory changes.
 *
 * Uses the publishable anon key, which already ships in the client bundle —
 * nothing secret passes through here.
 *
 *   npm run funding:snapshot
 */
import { writeFileSync } from 'node:fs';

const URL_BASE = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!URL_BASE || !KEY) {
  console.error(
    'funding:snapshot needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the environment.',
  );
  process.exit(1);
}

const COLUMNS = [
  'name',
  'funder',
  'description',
  'amount_min',
  'amount_max',
  'amount_currency',
  'is_recurring',
  'recurrence_notes',
  'provinces',
  'application_url',
  'last_verified',
].join(',');

const res = await fetch(
  `${URL_BASE}/rest/v1/grants?select=${COLUMNS}&is_published=eq.true&order=name.asc`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
);

if (!res.ok) {
  console.error(`funding:snapshot failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const rows = await res.json();
if (!Array.isArray(rows) || rows.length === 0) {
  console.error('funding:snapshot refused to write an empty snapshot.');
  process.exit(1);
}

writeFileSync(
  'scripts/data/funding-snapshot.json',
  JSON.stringify({ capturedOn: new Date().toISOString().slice(0, 10), rows }, null, 2) + '\n',
);
console.log(`funding:snapshot wrote ${rows.length} programmes.`);
