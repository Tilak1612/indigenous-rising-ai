import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const app = readFileSync('src/App.tsx', 'utf8');

// The floating accessibility gear was hidden on phones in #189, then removed
// everywhere on request. Unmounted rather than CSS-hidden: the component's
// mount effect re-applies settings a visitor saved earlier (text size,
// contrast), and with no UI left to change them a stored 130% text size
// would be stuck forever.
describe('the accessibility toolbar is fully unmounted', () => {
  test('App neither imports nor renders it', () => {
    expect(app).not.toMatch(/import AccessibilityToolbar/);
    expect(app).not.toMatch(/<AccessibilityToolbar/);
  });

  test('nothing else mounts it either', () => {
    // the component file itself stays for an easy revert
    expect(existsSync('src/components/AccessibilityToolbar.tsx')).toBe(true);
    const { execSync } = require('node:child_process');
    const out = execSync(
      // match real usage (JSX tag or import), not the explanatory comment
      "grep -rlE '<AccessibilityToolbar|import AccessibilityToolbar' src --include='*.tsx' | grep -v 'components/AccessibilityToolbar' | grep -v '__tests__' || true",
      { encoding: 'utf8' }
    ).trim();
    expect(out, `still mounted in: ${out}`).toBe('');
  });
});
