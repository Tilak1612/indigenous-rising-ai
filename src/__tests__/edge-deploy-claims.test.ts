import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * No edge function may carry a banner claiming it is not deployed.
 *
 * send-funding-digest/index.ts opened with "PROPOSED REPLACEMENT — NOT
 * DEPLOYED" for weeks after it had in fact shipped. The deployed copy fetched
 * from Supabase was byte-identical to the repo, and it went live on 2026-08-26
 * in the same deploy run that created check-funding-freshness — so the repo was
 * telling every reader that the unsafe predecessor (which interpolated
 * unescaped grant fields into email and ignored last_verified) was still the
 * live one. A comment like that is worse than no comment: it invites someone to
 * "fix" a problem that is already fixed, or to re-deploy the old behaviour.
 *
 * Only a BANNER is flagged — a comment line that is nothing but the claim.
 * Prose that explains deploy history, including the header above that quotes
 * the old banner verbatim, is exactly what should be encouraged.
 */
const FN_DIR = 'supabase/functions';

/** Strips comment punctuation so a banner line reduces to its bare claim. */
const bare = (line: string) =>
  line.replace(/^\s*(\/\/|\/\*+|\*+\/?|#)\s*/, '').replace(/[\s*/=—–_-]+$/, '').trim();

/** A line that asserts, on its own, that this code is not live. */
const BANNER =
  /^(PROPOSED REPLACEMENT|DRAFT|WIP)?[\s—–-]*(NOT|NEVER)\s+DEPLOYED$|^PROPOSED REPLACEMENT$|^NOT (YET )?(LIVE|IN PRODUCTION)$/i;

const sources = (): string[] => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts')) out.push(p);
    }
  };
  walk(FN_DIR);
  return out;
};

describe('edge functions do not claim to be undeployed', () => {
  const files = sources();

  test('the sweep actually reaches the edge functions', () => {
    // Guards against the walk silently finding nothing and passing vacuously.
    expect(files.length).toBeGreaterThanOrEqual(15);
    expect(files).toContain('supabase/functions/send-funding-digest/index.ts');
  });

  for (const file of files) {
    test(`${file.replace(FN_DIR + '/', '')} has no "not deployed" banner`, () => {
      const offenders = readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ n: i + 1, claim: bare(line) }))
        .filter(({ claim }) => BANNER.test(claim));
      expect(
        offenders,
        `${file} claims it is not deployed at line(s) ${offenders.map((o) => o.n).join(', ')}. ` +
          `If it really is undeployed, deploy it or delete it — do not ship a misleading banner.`,
      ).toEqual([]);
    });
  }

  test('the header that explains the old banner is allowed to quote it', () => {
    // The fix itself must not trip the guard, or the next person deletes the
    // explanation to get CI green.
    const header = readFileSync('supabase/functions/send-funding-digest/index.ts', 'utf8');
    expect(header).toMatch(/PROPOSED\s*\n?\s*\/\/ REPLACEMENT — NOT DEPLOYED"|"PROPOSED\s+REPLACEMENT — NOT DEPLOYED"/);
  });
});
