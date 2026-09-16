// IndexNow: tell participating search engines (Bing, Yandex, Seznam, Naver,
// Yep, among others) which public URLs changed in a production deploy.
//
// What it does NOT do: Google does not participate in IndexNow, and a
// submission is a hint, not a guarantee of crawling, indexing or ranking.
//
// How it avoids spamming engines — they ask for CHANGED URLs only:
//   1. The build writes dist/indexnow-manifest.json: { url: hash of the page's
//      meaningful content } for every sitemap URL. Scripts and hashed asset
//      filenames are excluded, so a rebuild with identical content hashes the same.
//   2. On a successful Production deploy, .github/workflows/indexnow.yml fetches
//      the live manifest, compares it with the one saved from the previous
//      deploy, and submits added, changed and removed URLs (the protocol asks
//      for removed URLs too, so engines drop the 404s).
//
// The key is public by design: engines verify ownership by fetching
// https://www.indigenousrising.ai/<key>.txt, which must contain the key.
import { createHash } from 'node:crypto';

export const INDEXNOW_KEY = 'e1a2b90a2a4fd8da552704554fa7416e';
export const HOST = 'www.indigenousrising.ai';
export const ENDPOINT = 'https://www.bing.com/indexnow';
const MAX_URLS = 10000; // protocol limit per request

/** Hash what a reader or crawler would consider the page's content. */
export function contentHash(html) {
  const pick = (re) => (re.exec(html)?.[1] ?? '').trim();
  const title = pick(/<title>([\s\S]*?)<\/title>/i);
  const description = pick(/<meta name="description" content="([^"]*)"/i);
  const canonical = pick(/<link rel="canonical" href="([^"]*)"/i);
  const robots = pick(/<meta name="robots" content="([^"]*)"/i);
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1].trim()).join('\n');
  const body = (/<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256')
    .update([title, description, canonical, robots, jsonLd, body].join('\n--field--\n'))
    .digest('hex');
}

/** URLs to notify: added or changed in next, or removed since prev. */
export function diffManifests(prev, next) {
  const added = [];
  const changed = [];
  const removed = [];
  for (const [url, hash] of Object.entries(next)) {
    if (!(url in prev)) added.push(url);
    else if (prev[url] !== hash) changed.push(url);
  }
  for (const url of Object.keys(prev)) if (!(url in next)) removed.push(url);
  return { added, changed, removed, urls: [...added, ...changed, ...removed] };
}

export function buildPayload(urls, { key = INDEXNOW_KEY, host = HOST } = {}) {
  const own = urls.filter((u) => {
    try { return new URL(u).host === host; } catch { return false; }
  });
  return {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: own.slice(0, MAX_URLS),
  };
}

/** Interpret an IndexNow response per the protocol documentation. */
export function classifyResponse(status) {
  if (status === 200 || status === 202) return { ok: true, retry: false };
  if (status === 429) return { ok: false, retry: true, reason: 'rate limited; try again on the next deploy' };
  if (status === 400) return { ok: false, retry: false, reason: 'bad request format' };
  if (status === 403) return { ok: false, retry: false, reason: 'key not valid; is the key file live?' };
  if (status === 422) return { ok: false, retry: false, reason: 'URLs do not belong to the host, or key mismatch' };
  return { ok: false, retry: true, reason: `unexpected status ${status}` };
}
