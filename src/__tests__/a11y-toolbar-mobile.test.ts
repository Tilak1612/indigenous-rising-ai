import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const toolbar = readFileSync('src/components/AccessibilityToolbar.tsx', 'utf8');

// On phones the gear stacked under the Ask Agent launcher as a second
// floating control. Hidden below md; tablet and desktop keep it.
describe('the accessibility toolbar is desktop/tablet chrome', () => {
  test('the trigger is hidden below md and flex again above it', () => {
    const btn = /aria-label="Open accessibility toolbar"[\s\S]{0,400}/.exec(toolbar)?.[0] ?? '';
    const cls = /className="([^"]+)"[\s\S]*?aria-label="Open accessibility toolbar"/.exec(toolbar)?.[1] ?? '';
    expect(cls).toContain('hidden md:inline-flex');
  });

  test('the panel matches the trigger breakpoint', () => {
    // otherwise a panel opened on desktop survives a resize below md with
    // its only re-open control gone
    expect(toolbar).toMatch(/Card className="hidden md:block fixed bottom-20/);
  });

  test('the trigger keeps its accessible name', () => {
    expect(toolbar).toMatch(/aria-label="Open accessibility toolbar"/);
    expect(toolbar).toMatch(/aria-label="Close accessibility toolbar"/);
  });
});
