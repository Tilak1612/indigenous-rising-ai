import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

/**
 * The funding inventory must reach crawlers that do not run JavaScript.
 *
 * /funding fetches its programmes client-side, so the prerendered HTML carried
 * the page furniture and NOT ONE programme name. Measured against production on
 * 2026-10-02: zero occurrences of "Futurpreneur", "Aboriginal Entrepreneurship"
 * or "BDC" in 41KB of markup. The product's core inventory — the thing the site
 * exists to surface — was invisible to every crawler that does not execute JS,
 * which includes most AI answer engines.
 *
 * The prerender now fetches the live rows, falls back to a committed snapshot,
 * and emits both an ItemList and a no-JS list. These assert the pieces that
 * make that safe rather than merely present.
 */
const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const SNAPSHOT = 'scripts/data/funding-snapshot.json';

describe('the snapshot fallback exists and is usable', () => {
  const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));

  test('it holds a plausible number of programmes', () => {
    expect(Array.isArray(snap.rows)).toBe(true);
    expect(snap.rows.length).toBeGreaterThanOrEqual(10);
  });

  test('it records when it was captured, so staleness is visible', () => {
    expect(snap.capturedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('every row carries the fields the page and schema need', () => {
    for (const r of snap.rows) {
      expect(r.name, 'a row has no name').toBeTruthy();
      expect(r.funder, `${r.name} has no funder`).toBeTruthy();
      expect(r, `${r.name} has no last_verified key`).toHaveProperty('last_verified');
    }
  });

  test('no row states an amount without a currency', () => {
    for (const r of snap.rows) {
      if (r.amount_max || r.amount_min) {
        expect(r.amount_currency, `${r.name} states an amount with no currency`).toBeTruthy();
      }
    }
  });
});

describe('the prerender degrades safely rather than shipping an empty page', () => {
  test('it prefers live data', () => {
    expect(prerender).toMatch(/rest\/v1\/grants\?select=/);
    expect(prerender).toMatch(/is_published=eq\.true/);
  });

  test('a missing env var falls back to the snapshot instead of failing', () => {
    expect(prerender).toMatch(/no Supabase env; using funding snapshot/);
  });

  test('a failed or empty fetch falls back too', () => {
    expect(prerender).toMatch(/live funding fetch failed/);
    expect(prerender).toMatch(/empty result/);
  });

  test('the fetch cannot hang the build forever', () => {
    expect(prerender).toMatch(/AbortSignal\.timeout\(/);
  });

  test('only the publishable anon key is used — no service role', () => {
    expect(prerender).toMatch(/VITE_SUPABASE_ANON_KEY/);
    expect(prerender).not.toMatch(/SERVICE_ROLE/i);
  });

  test('the no-JS list is injected outside the React root, so hydration cannot mismatch', () => {
    expect(prerender).toMatch(/route\.bodyExtra/);
    expect(prerender).toMatch(/replace\('<\/body>'/);
  });
});

const built = 'dist/funding/index.html';
// CI runs the test step BEFORE the build, so dist/ does not exist there.
// describe.runIf only skips the tests inside - the describe BODY still runs at
// collection time, so an unguarded readFileSync here throws ENOENT and fails the
// whole file. That is exactly what failed CI on this PR's first push.
describe.runIf(existsSync(built))('the built /funding carries the inventory', () => {
  const html = existsSync(built) ? readFileSync(built, 'utf8') : '';
  const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));

  test('programme names appear in the static HTML', () => {
    // The exact failure this fixes: these returned zero on production.
    for (const needle of ['Futurpreneur', 'Aboriginal Entrepreneurship', 'BDC']) {
      expect(html, `${needle} missing from static HTML`).toContain(needle);
    }
  });

  test('an ItemList is emitted with every programme', () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
    const lists = blocks
      .flatMap((m) => {
        try {
          const d = JSON.parse(m[1]);
          return Array.isArray(d) ? d : [d];
        } catch {
          return [];
        }
      })
      .filter((n) => n && n['@type'] === 'ItemList');
    expect(lists.length, 'no ItemList on /funding').toBe(1);
    const list = lists[0];
    expect(list.itemListElement.length).toBe(snap.rows.length);
    expect(list.numberOfItems).toBe(list.itemListElement.length);
    expect(list.itemListElement.map((i: { position: number }) => i.position)).toEqual(
      list.itemListElement.map((_: unknown, i: number) => i + 1),
    );
  });

  test('every JSON-LD block on the page parses', () => {
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
      expect(() => JSON.parse(m[1]), 'invalid JSON-LD on /funding').not.toThrow();
    }
  });

  test('no "undefined" leaked into the schema from an optional field', () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
    for (const m of blocks) expect(m[1]).not.toContain('undefined');
  });

  test('each programme shows whether it has been verified', () => {
    const verified = (html.match(/Details last verified/g) ?? []).length;
    const unverified = (html.match(/Details not yet verified/g) ?? []).length;
    expect(verified + unverified).toBe(snap.rows.length);
  });

  test('no amount is stated that the snapshot does not carry', () => {
    // Guards against the page inventing a figure the funder never published.
    const stated = snap.rows.filter((r: { amount_max: number | null }) => r.amount_max).length;
    const varies = (html.match(/Amount varies/g) ?? []).length;
    expect(varies).toBe(snap.rows.length - stated);
  });
});
