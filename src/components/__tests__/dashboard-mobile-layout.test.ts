import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Guards for horizontal-overflow defects measured in a real browser at
// 375x812 across all 25 dashboard routes. jsdom has no layout engine, so
// these assert the class contracts the measurements proved matter; the
// pixel numbers in the comments came from the browser, not from here.

describe('the dashboard content pane can shrink below its content', () => {
  test('SidebarInset sets min-w-0', () => {
    const src = readFileSync('src/components/ui/sidebar.tsx', 'utf8');
    const start = src.indexOf('const SidebarInset');
    expect(start).toBeGreaterThan(-1);
    const block = src.slice(start, start + 1200);
    // Comments are stripped first. An earlier version of this test matched
    // min-w-0 anywhere in the block and so matched the source comment that
    // explains the fix — removing the actual class still passed.
    const code = block.replace(/\/\/[^\n]*/g, '');
    const classArgs = [...code.matchAll(/"([^"]*)"/g)].map((m) => m[1]).join(' ');
    // A flex item's automatic minimum size is its min-content width, so
    // without this the pane refuses to shrink and the whole dashboard
    // scrolls sideways. Measured 535px on a 375px viewport.
    expect(classArgs, 'SidebarInset must keep min-w-0 in its class list')
      .toMatch(/\bmin-w-0\b/);
  });
});

const dashboardFiles = () =>
  readdirSync('src/pages/dashboard')
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join('src/pages/dashboard', f));

describe('tab strips fit a 375px viewport', () => {
  test('no dashboard page renders a bare TabsList with 4+ tabs', () => {
    const offenders: string[] = [];
    for (const file of dashboardFiles()) {
      const src = readFileSync(file, 'utf8');
      // A bare <TabsList> is inline-flex and sized by its triggers, so with
      // enough tabs it exceeds the viewport and pushes the page wide.
      // Measured: Compliance 392px, Resources 439px against ~278px available.
      if (!src.includes('<TabsList>')) continue;
      const triggers = (src.match(/<TabsTrigger/g) ?? []).length;
      if (triggers >= 4) offenders.push(`${file} (${triggers} tabs)`);
    }
    expect(offenders).toEqual([]);
  });

  test('the wrapping fix is present where it was applied', () => {
    for (const file of ['src/pages/dashboard/Compliance.tsx', 'src/pages/dashboard/Resources.tsx']) {
      const src = readFileSync(file, 'utf8');
      const m = /<TabsList className="([^"]*)"/.exec(src);
      expect(m, `${file} lost its TabsList className`).not.toBeNull();
      expect(m![1], `${file} must let its tab strip wrap`).toMatch(/flex-wrap/);
      expect(m![1], `${file} must allow the strip to grow taller when it wraps`).toMatch(/h-auto/);
    }
  });
});
