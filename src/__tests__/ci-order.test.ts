import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * CI must build before it tests.
 *
 * Some tests assert on the BUILT output in dist/ - prerendered HTML, the sitemap,
 * structured data - and are wrapped in describe.runIf(existsSync('dist/...')) so
 * they skip when it is absent. With the Test step before Build, dist/ never
 * existed in CI, so every one of them was silently skipped there and only ran on
 * a developer's machine.
 *
 * That is not hypothetical. The /signup page shipped the wrong heading to
 * production while a test asserting the right one sat in the repo, never
 * executing where it mattered. A guard that does not run is not a guard.
 *
 * This pins the order so a tidy-up cannot quietly put it back.
 */
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const stepIndex = (name: string) => ci.indexOf(`- name: ${name}`);

describe('CI builds before it tests', () => {
  test('both steps exist, or the ordering check is vacuous', () => {
    expect(stepIndex('Build')).toBeGreaterThan(-1);
    expect(stepIndex('Test')).toBeGreaterThan(-1);
  });

  test('Build comes before Test', () => {
    expect(stepIndex('Build'), 'Test runs before Build - built-output tests skip in CI').toBeLessThan(
      stepIndex('Test'),
    );
  });

  test('the prerender verification still runs after the build', () => {
    expect(stepIndex('Verify prerendered content')).toBeGreaterThan(stepIndex('Build'));
  });

  test('the reason is written down next to the order', () => {
    expect(ci).toMatch(/Build BEFORE test/);
  });
});
