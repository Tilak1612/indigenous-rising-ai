import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * The bare domain must send every path to the www host, including the root.
 *
 * Measured on production 2026-09-28:
 *   https://indigenousrising.ai/funding  ->  308 to www   (correct)
 *   https://indigenousrising.ai/         ->  200          (wrong)
 *
 * The bare root served a byte-identical copy of the www homepage — 96,551 bytes
 * on both — so the site's most important page existed on two hosts at once. The
 * canonical tag pointed at www, which is why this was survivable, but a
 * canonical is a hint and a 301 is an instruction, and every other path on the
 * bare host already used the instruction.
 *
 * Cause: the catch-all "/:path*" rule does not match the root path, so "/" fell
 * through to being served normally. An explicit "/" rule fixes it, and must sit
 * BEFORE the catch-all because Vercel applies the first matching redirect.
 */
type Redirect = {
  source: string;
  has?: Array<{ type: string; value: string }>;
  destination: string;
  permanent?: boolean;
};

const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as { redirects: Redirect[] };
const onBareHost = (r: Redirect) =>
  (r.has ?? []).some((h) => h.type === 'host' && h.value === 'indigenousrising.ai');

describe('the bare domain redirects to the canonical www host', () => {
  test('the root has its own rule — the catch-all does not cover it', () => {
    const root = config.redirects.find((r) => r.source === '/' && onBareHost(r));
    expect(root, 'no bare-host rule for "/"').toBeDefined();
    expect(root!.destination).toBe('https://www.indigenousrising.ai/');
  });

  test('the root redirect is permanent, like the rest', () => {
    const root = config.redirects.find((r) => r.source === '/' && onBareHost(r));
    expect(root!.permanent).toBe(true);
  });

  test('the root rule precedes the catch-all, or it never fires', () => {
    const rootIndex = config.redirects.findIndex((r) => r.source === '/' && onBareHost(r));
    const catchAllIndex = config.redirects.findIndex((r) => r.source === '/:path*' && onBareHost(r));
    expect(rootIndex).toBeGreaterThanOrEqual(0);
    expect(catchAllIndex).toBeGreaterThanOrEqual(0);
    expect(rootIndex).toBeLessThan(catchAllIndex);
  });

  test('the catch-all still covers every other path', () => {
    const catchAll = config.redirects.find((r) => r.source === '/:path*' && onBareHost(r));
    expect(catchAll).toBeDefined();
    expect(catchAll!.destination).toBe('https://www.indigenousrising.ai/:path*');
  });

  test('no bare-host rule points back at the bare host, which would loop', () => {
    for (const r of config.redirects.filter(onBareHost)) {
      expect(r.destination, `${r.source} would loop`).toMatch(/^https:\/\/www\.indigenousrising\.ai/);
    }
  });
});
