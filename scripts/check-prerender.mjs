// CI gate for P0-1: every sitemap URL must ship real, non-JS-dependent content.
//
// Runs against the BUILD OUTPUT (dist/), not a live server, so it fails a PR
// before a regression can reach production. Checks exactly what a crawler sees
// in the initial HTML response.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MIN_WORDS = 200;

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (html, re) => (html.match(re)?.[1] ?? '').trim();

const sitemapPath = path.join(DIST, 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  console.error('[check-prerender] dist/sitemap.xml missing — run the build first');
  process.exit(1);
}

const sitemap = await readFile(sitemapPath, 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error('[check-prerender] sitemap contains no URLs');
  process.exit(1);
}

const home = await readFile(path.join(DIST, 'index.html'), 'utf8');
const homeTitle = tag(home, /<title>([^<]*)<\/title>/i);
const homeDesc = tag(home, /<meta name="description" content="([^"]*)"/i);

const failures = [];
for (const url of urls) {
  const route = new URL(url).pathname;
  const file = path.join(DIST, route.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) { failures.push(`${route} — no prerendered file`); continue; }

  const html = await readFile(file, 'utf8');
  const title = tag(html, /<title>([^<]*)<\/title>/i);
  const desc = tag(html, /<meta name="description" content="([^"]*)"/i);
  const words = textOf(html).split(' ').filter(Boolean).length;

  if (!title) failures.push(`${route} — empty <title>`);
  else if (route !== '/' && title === homeTitle) failures.push(`${route} — title duplicates the homepage`);
  if (!desc) failures.push(`${route} — empty meta description`);
  else if (route !== '/' && desc === homeDesc) failures.push(`${route} — description duplicates the homepage`);
  // A truncated description forfeits control of the search snippet.
  if (/[.…]{3}$|…$/.test(desc)) failures.push(`${route} — meta description is truncated`);
  if (words < MIN_WORDS) failures.push(`${route} — only ${words} words of body content (min ${MIN_WORDS})`);

  // P0-2: canonical must match the URL the page is actually served from, on the
  // canonical host. Both hosts returned 200 with identical content before the
  // edge 301 was added, which split signals across two effective domains.
  const canonical = tag(html, /<link rel="canonical" href="([^"]*)"/i);
  if (!canonical) failures.push(`${route} — no canonical tag`);
  else if (canonical !== url) failures.push(`${route} — canonical is ${canonical}, expected ${url}`);
  else if (!canonical.startsWith('https://www.')) failures.push(`${route} — canonical is not on the canonical host`);
}

if (failures.length) {
  console.error(`\n[check-prerender] ${failures.length} failure(s) across ${urls.length} sitemap URLs:\n`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`[check-prerender] OK — ${urls.length} sitemap URLs: distinct title + description, >=${MIN_WORDS} words each.`);
