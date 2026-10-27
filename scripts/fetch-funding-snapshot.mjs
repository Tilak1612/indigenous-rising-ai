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

// Publishable anon key: the same fallback src/lib/supabase.ts ships in the bundle.
const URL_BASE = process.env.VITE_SUPABASE_URL || 'https://upxojfcdtmqtcvgbjsym.supabase.co';
const KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9qZmNkdG1xdGN2Z2Jqc3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzAwMDgsImV4cCI6MjA4NzU0NjAwOH0.tAaSqKPPy8nfj6u8lby5Fmuqdiy1CezxnSUpWfA2yP0';

if (!URL_BASE || !KEY) {
  console.error(
    'funding:snapshot needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the environment.',
  );
  process.exit(1);
}

// Same list as PROGRAM_COLUMNS in src/lib/funding-catalog.ts and
// FUNDING_COLUMNS in scripts/prerender.mjs, so the fallback can seed the
// programme pages as well as the /funding list.
const COLUMNS = [
  'id', 'slug', 'name', 'funder', 'description', 'funding_type', 'is_repayable',
  'amount_min', 'amount_max', 'amount_currency', 'deadline', 'opens_at', 'is_recurring',
  'recurrence_notes', 'intake_status', 'provinces', 'industries', 'business_stages',
  'applicant_types', 'identity_criteria', 'ownership_min_pct', 'entrepreneur_age_min',
  'entrepreneur_age_max', 'business_age_max_months', 'revenue_max', 'program_category',
  'eligibility_notes', 'eligibility_exclusions', 'matching_funds_required',
  'matching_funds_notes', 'eligible_expenses', 'documents_required', 'application_steps',
  'repayment_terms', 'source_url', 'application_url', 'apply_url', 'apply_link_type',
  'application_method', 'last_verified', 'verification_status', 'verification_confidence',
  'source_published_date', 'source_evidence', 'updated_at',
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
