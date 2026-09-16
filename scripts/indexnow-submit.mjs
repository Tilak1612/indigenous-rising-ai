#!/usr/bin/env node
// Post-deploy IndexNow submission. Run by .github/workflows/indexnow.yml after
// a successful Production deployment. See scripts/indexnow.mjs for the design.
//
//   node scripts/indexnow-submit.mjs --prev <path> --out <path>
//        [--on-missing baseline|submit-all] [--dry-run]
//
// --prev        manifest saved by the previous accepted submission (may not exist)
// --out         where to write the live manifest once this submission succeeds
// --on-missing  what to do when there is no previous manifest. Default
//               "baseline": record the live manifest and submit nothing. A
//               missing state file (first run, expired artifact, a failed
//               restore) must never turn into a resubmission of every URL —
//               which is exactly what happened on the first three production
//               deploys, when actions/cache silently could not restore on
//               deployment_status events. Use "submit-all" deliberately, once.
//
// Exit codes: 0 = submitted, nothing to submit, or a transient problem that
// the next deploy will retry (the live manifest is then NOT saved, so the diff
// is recomputed next time). 1 = a configuration error that needs a human
// (key rejected, bad request) — failing loudly beats silently never notifying.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  INDEXNOW_KEY, HOST, ENDPOINT, diffManifests, buildPayload, classifyResponse,
} from './indexnow.mjs';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
};
const prevPath = arg('--prev');
const outPath = arg('--out');
const dryRun = process.argv.includes('--dry-run');
const onMissing = arg('--on-missing') ?? 'baseline';
const site = `https://${HOST}`;

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'indigenousrising-indexnow/1.0' } });
  return { status: res.status, text: await res.text() };
}

async function main() {
  if (!prevPath || !outPath) {
    console.error('usage: indexnow-submit.mjs --prev <path> --out <path> [--dry-run]');
    process.exit(1);
  }

  // The key file must be live before engines can verify a submission.
  const keyFile = await fetchText(`${site}/${INDEXNOW_KEY}.txt`).catch((e) => ({ status: 0, text: String(e) }));
  if (keyFile.status !== 200 || keyFile.text.trim() !== INDEXNOW_KEY) {
    console.warn(`::warning::IndexNow key file not served correctly (status ${keyFile.status}); skipping. Vercel bot protection may be challenging this runner.`);
    return;
  }

  const live = await fetchText(`${site}/indexnow-manifest.json`).catch((e) => ({ status: 0, text: String(e) }));
  let next;
  try {
    if (live.status !== 200) throw new Error(`status ${live.status}`);
    next = JSON.parse(live.text);
  } catch (e) {
    console.warn(`::warning::Could not read the live IndexNow manifest (${e.message}); skipping.`);
    return;
  }

  const prev = prevPath && existsSync(prevPath) ? JSON.parse(await readFile(prevPath, 'utf8')) : null;
  if (!prev && onMissing !== 'submit-all') {
    await writeFile(outPath, JSON.stringify(next, null, 2) + '\n');
    console.log(`No previous manifest: recorded a baseline of ${Object.keys(next).length} URLs, submitted nothing.`);
    return;
  }
  if (!prev) console.log('No previous manifest: --on-missing submit-all, submitting every URL once.');
  const { added, changed, removed, urls } = diffManifests(prev ?? {}, next);
  console.log(`added ${added.length}, changed ${changed.length}, removed ${removed.length}`);
  for (const u of urls) console.log(`  ${u}`);

  if (urls.length === 0) {
    await writeFile(outPath, JSON.stringify(next, null, 2) + '\n');
    console.log('Nothing changed; no submission.');
    return;
  }

  const payload = buildPayload(urls);
  if (dryRun) {
    console.log('--dry-run: would POST', JSON.stringify({ ...payload, urlList: `${payload.urlList.length} URLs` }));
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const verdict = classifyResponse(res.status);
  if (verdict.ok) {
    await writeFile(outPath, JSON.stringify(next, null, 2) + '\n');
    console.log(`IndexNow accepted ${payload.urlList.length} URL(s) (HTTP ${res.status}).`);
    return;
  }
  if (verdict.retry) {
    console.warn(`::warning::IndexNow HTTP ${res.status}: ${verdict.reason}. Manifest not saved; will retry next deploy.`);
    return;
  }
  console.error(`::error::IndexNow HTTP ${res.status}: ${verdict.reason}`);
  process.exit(1);
}

main().catch((e) => {
  console.warn(`::warning::IndexNow submission skipped: ${e.message}`);
});
