import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * Every edge function's gateway JWT setting is pinned in supabase/config.toml.
 *
 * Without an entry, `supabase functions deploy` uses its default (on), which
 * silently changed site-assistant's setting on 2026-11-03 and has been
 * rejecting the Friday digest: pg_cron sends the vault secret, a plain string,
 * as the bearer token, and the gateway answered 401
 * UNAUTHORIZED_INVALID_JWT_FORMAT before send-funding-digest ever ran.
 */
const config = readFileSync('supabase/config.toml', 'utf8');
const fns = readdirSync('supabase/functions', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name);

const setting = (fn: string): string | undefined =>
  new RegExp(`\\[functions\\.${fn}\\][^\\[]*?verify_jwt\\s*=\\s*(true|false)`).exec(config)?.[1];

describe('edge function gateway auth', () => {
  test.each(fns)('%s has an explicit verify_jwt', (fn) => {
    expect(setting(fn), `${fn} has no [functions.${fn}] verify_jwt entry`).toMatch(/^(true|false)$/);
  });

  test.each(fns.filter((fn) => readFileSync(`supabase/functions/${fn}/index.ts`, 'utf8').includes('CRON_SECRET')))(
    '%s checks CRON_SECRET itself, so the gateway check is off',
    (fn) => {
      expect(setting(fn)).toBe('false');
    },
  );
});
