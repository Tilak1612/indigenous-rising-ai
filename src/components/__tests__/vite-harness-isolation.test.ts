import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The harness stubs authentication. That is safe only while it stays
// unreachable from anything that ships, so the isolation is enforced rather
// than assumed.

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((e) => {
    const full = join(dir, e);
    return statSync(full).isDirectory() ? walk(full) : /\.tsx?$/.test(e) ? [full] : [];
  });

describe('the auth-stubbing harness cannot reach a build', () => {
  test('no file under src/ references it', () => {
    const offenders = walk('src').filter((f) =>
      /\.harness|vite\.harness\.config/.test(readFileSync(f, 'utf8')) && !f.endsWith('vite-harness-isolation.test.ts'),
    );
    expect(offenders).toEqual([]);
  });

  test('the production vite config does not alias the stubs', () => {
    const prod = readFileSync('vite.config.ts', 'utf8');
    expect(prod).not.toMatch(/\.harness/);
  });

  test('the harness config still aliases both auth hooks', () => {
    // If an alias were dropped the harness would render the real hooks,
    // bounce off ProtectedRoute, and silently measure a redirect page.
    const cfg = readFileSync('vite.harness.config.ts', 'utf8');
    expect(cfg).toMatch(/useAuth/);
    expect(cfg).toMatch(/useSubscription/);
    expect(cfg, 'cwd must stay pinned or tailwind emits almost no utilities')
      .toMatch(/process\.chdir/);
  });

  test('the build script does not use the harness config', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts.build).not.toMatch(/harness/);
    expect(pkg.scripts['dev:harness']).toMatch(/vite\.harness\.config\.ts/);
  });
});
