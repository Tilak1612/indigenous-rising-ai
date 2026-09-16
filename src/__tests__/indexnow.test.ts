import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error — plain ESM script, no type declarations
import { INDEXNOW_KEY, HOST, contentHash, diffManifests, buildPayload, classifyResponse } from '../../scripts/indexnow.mjs';

const page = (body: string, extra = '') =>
  `<!doctype html><html><head><title>T</title><meta name="description" content="D" />${extra}</head>` +
  `<body><div id="root">${body}</div><script type="module" src="/assets/index-AAAA.js"></script></body></html>`;

describe('IndexNow key', () => {
  test('has a valid format and is served from public/<key>.txt', () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-zA-Z0-9-]{8,128}$/);
    const file = `public/${INDEXNOW_KEY}.txt`;
    expect(existsSync(file), `${file} missing — engines cannot verify ownership`).toBe(true);
    expect(readFileSync(file, 'utf8')).toBe(INDEXNOW_KEY);
  });
});

describe('contentHash only changes when content does', () => {
  test('a rebuild that only renames hashed assets hashes the same', () => {
    const a = page('<h1>Pricing</h1>');
    const b = a.replace('index-AAAA.js', 'index-BBBB.js');
    expect(contentHash(b)).toBe(contentHash(a));
  });

  test('inline script contents that vary per build are ignored', () => {
    // A src attribute disappears with its tag anyway; inline script TEXT does
    // not, so this is the case the script-stripping step exists for.
    const withBuild = (id: string) => page(`<h1>Pricing</h1><script>window.__BUILD__ = "${id}";</script>`);
    expect(contentHash(withBuild('build-2'))).toBe(contentHash(withBuild('build-1')));
  });

  test('visible text, title, description and structured data all count', () => {
    const base = contentHash(page('<h1>Pricing</h1>'));
    expect(contentHash(page('<h1>Pricing, updated</h1>'))).not.toBe(base);
    expect(contentHash(page('<h1>Pricing</h1>').replace('<title>T</title>', '<title>U</title>'))).not.toBe(base);
    expect(contentHash(page('<h1>Pricing</h1>').replace('content="D"', 'content="E"'))).not.toBe(base);
    expect(contentHash(page('<h1>Pricing</h1>', '<script type="application/ld+json">{"a":1}</script>'))).not.toBe(base);
  });
});

describe('diffManifests', () => {
  test('reports added, changed and removed URLs, and nothing unchanged', () => {
    const prev = { 'https://x/a': '1', 'https://x/b': '2', 'https://x/gone': '3' };
    const next = { 'https://x/a': '1', 'https://x/b': '9', 'https://x/new': '4' };
    const d = diffManifests(prev, next);
    expect(d.added).toEqual(['https://x/new']);
    expect(d.changed).toEqual(['https://x/b']);
    expect(d.removed).toEqual(['https://x/gone']);
    expect(d.urls).not.toContain('https://x/a');
  });
});

describe('buildPayload', () => {
  test('protocol shape, own host only', () => {
    const p = buildPayload([`https://${HOST}/pricing`, 'https://evil.example/x', 'not a url']);
    expect(p).toEqual({
      host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: [`https://${HOST}/pricing`],
    });
  });
});

describe('classifyResponse', () => {
  test('success, retryable and fatal statuses', () => {
    expect(classifyResponse(200).ok).toBe(true);
    expect(classifyResponse(202).ok).toBe(true);
    expect(classifyResponse(429)).toMatchObject({ ok: false, retry: true });
    for (const s of [400, 403, 422]) expect(classifyResponse(s)).toMatchObject({ ok: false, retry: false });
  });
});

/**
 * Runs the real CLI with fetch stubbed, to check the state machine: the
 * manifest is saved ONLY when the submission is accepted (or nothing changed),
 * so a failed or rate-limited submission is retried on the next deploy.
 */
describe('indexnow-submit.mjs behaviour', () => {
  const site = `https://${HOST}`;
  const liveManifest = { [`${site}/`]: 'h1', [`${site}/pricing`]: 'h2' };

  function run(opts: { prev?: object; keyStatus?: number; postStatus?: number }) {
    const dir = mkdtempSync(join(tmpdir(), 'indexnow-'));
    const prev = join(dir, 'prev.json');
    const out = join(dir, 'next.json');
    const log = join(dir, 'posts.json');
    if (opts.prev) writeFileSync(prev, JSON.stringify(opts.prev));
    const stub = join(dir, 'stub.mjs');
    writeFileSync(stub, `
      import { writeFileSync } from 'node:fs';
      const posts = [];
      globalThis.fetch = async (url, init = {}) => {
        const u = String(url);
        const reply = (status, body) => ({ status, text: async () => body });
        if (u.endsWith('${INDEXNOW_KEY}.txt')) return reply(${opts.keyStatus ?? 200}, '${INDEXNOW_KEY}');
        if (u.endsWith('/indexnow-manifest.json')) return reply(200, ${JSON.stringify(JSON.stringify(liveManifest))});
        if (init.method === 'POST') {
          posts.push(JSON.parse(init.body));
          writeFileSync(${JSON.stringify(log)}, JSON.stringify(posts));
          return reply(${opts.postStatus ?? 200}, '');
        }
        return reply(404, '');
      };`);
    const r = spawnSync(process.execPath, ['--import', stub, 'scripts/indexnow-submit.mjs', '--prev', prev, '--out', out], { encoding: 'utf8' });
    const posts = existsSync(log) ? JSON.parse(readFileSync(log, 'utf8')) : [];
    return { code: r.status, saved: existsSync(out), posts, stdout: r.stdout + r.stderr };
  }

  test('first run submits every URL once and saves the manifest', () => {
    const r = run({});
    expect(r.code).toBe(0);
    expect(r.posts).toHaveLength(1);
    expect(r.posts[0].urlList.sort()).toEqual(Object.keys(liveManifest).sort());
    expect(r.saved).toBe(true);
  });

  test('nothing changed → no request at all', () => {
    const r = run({ prev: liveManifest });
    expect(r.posts).toHaveLength(0);
    expect(r.code).toBe(0);
  });

  test('only the changed URL is submitted', () => {
    const r = run({ prev: { ...liveManifest, [`${site}/pricing`]: 'old' } });
    expect(r.posts[0].urlList).toEqual([`${site}/pricing`]);
  });

  test('rate limited → not saved, so the next deploy retries', () => {
    const r = run({ postStatus: 429 });
    expect(r.code).toBe(0);
    expect(r.saved).toBe(false);
  });

  test('key rejected → fails loudly and saves nothing', () => {
    const r = run({ postStatus: 403 });
    expect(r.code).toBe(1);
    expect(r.saved).toBe(false);
  });

  test('key file not live yet → skips without submitting', () => {
    const r = run({ keyStatus: 404 });
    expect(r.posts).toHaveLength(0);
    expect(r.saved).toBe(false);
    expect(r.code).toBe(0);
  });
});

describe('wiring', () => {
  test('the build writes the manifest from the sitemap entries', () => {
    expect(readFileSync('scripts/prerender.mjs', 'utf8')).toMatch(/await writeIndexNowManifest\(sitemap\);/);
  });

  test('the workflow runs only after a successful Production deploy, with no secrets', () => {
    const wf = readFileSync('.github/workflows/indexnow.yml', 'utf8');
    expect(wf).toMatch(/on:\s*\n\s*deployment_status:/);
    expect(wf).toMatch(/github\.event\.deployment_status\.state == 'success'/);
    expect(wf).toMatch(/github\.event\.deployment\.environment == 'Production'/);
    expect(wf).not.toMatch(/secrets\./);
    expect(wf).toMatch(/permissions:\s*\n\s*contents: read/);
  });
});
