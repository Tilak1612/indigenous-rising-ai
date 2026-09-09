import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');
const nav = read('src/components/Navigation.tsx');
const shell = read('src/components/dashboard/DashboardLayout.tsx');
const checklist = read('src/components/dashboard/GettingStartedChecklist.tsx');

// Findings from an authenticated sweep of 11 dashboard routes x 10 widths
// (320-1920) against production, plus /pricing where a free account lands.
describe('marketing header at tablet widths', () => {
  test('the centred desktop nav waits for lg', () => {
    // It is absolutely centred, so at 768px it sat on top of the logo:
    // measured live, logo right edge 218px vs "Platform" left edge 167px —
    // a 51px overlap with 44px of vertical intersection.
    expect(nav).toMatch(/hidden lg:flex items-center gap-8 absolute left-1\/2/);
    expect(nav).not.toMatch(/hidden md:flex items-center gap-8 absolute/);
  });

  test('the whole desktop cluster moves together, so tablet keeps the menu button', () => {
    // If any cluster item stays md while the rest go lg, tablet shows a
    // half-header; if the menu button goes md:hidden it vanishes at 768
    // with nothing to replace it.
    expect(nav).not.toMatch(/hidden md:inline-flex/);
    const menuBtn = /aria-controls="mobile-navigation"[\s\S]{0,200}?className="([^"]+)"/.exec(nav)?.[1] ?? '';
    expect(menuBtn).toContain('lg:hidden');
    expect(menuBtn).toMatch(/min-w-\[44px\] min-h-\[44px\]/);
    // the collapsible panel must match the button's breakpoint
    expect(nav).toMatch(/"lg:hidden overflow-hidden border-t/);
  });
});

describe('dashboard shell controls', () => {
  test('the icon-only header triggers have names', () => {
    expect(shell).toMatch(/aria-label="Change language"/);
    expect(shell).toMatch(/aria-label="Account menu"/);
  });

  test('the sidebar trigger is target-sized, not the 28px shadcn default', () => {
    expect(shell).toMatch(/<SidebarTrigger className="h-11 w-11" \/>/);
  });
});

describe('getting-started checklist toggles', () => {
  test('each toggle is named after its item and exposes pressed state', () => {
    expect(checklist).toMatch(/aria-label=\{`Mark "\$\{item\.title\}" as /);
    expect(checklist).toMatch(/aria-pressed=\{isComplete\}/);
  });

  test('the hit area is 44px while the visual circle stays 24px', () => {
    expect(checklist).toMatch(/h-11 w-11 -m-2\.5/);
    expect(checklist).toMatch(/aria-hidden="true"[\s\S]{0,200}h-6 w-6 rounded-full/);
  });
});

describe('no placeholder-only inputs on flagged screens', () => {
  const cases: Array<[string, RegExp]> = [
    ['src/pages/dashboard/Tasks.tsx', /aria-label="Task title"/],
    ['src/pages/dashboard/Tasks.tsx', /aria-label="Notes \(optional\)"/],
    ['src/pages/dashboard/Resources.tsx', /aria-label="Search resources"/],
    ['src/pages/dashboard/Forum.tsx', /aria-label="Search discussions"/],
    ['src/pages/dashboard/Assistant.tsx', /aria-label="Ask the assistant a question"/],
    ['src/pages/dashboard/Settings.tsx', /htmlFor="account-email"/],
    ['src/pages/dashboard/Settings.tsx', /id="account-email"/],
    ['src/pages/dashboard/Settings.tsx', /aria-label="Account ID"/],
    ['src/pages/dashboard/Settings.tsx', /aria-label=\{showCurrentPassword \? 'Hide current password' : 'Show current password'\}/],
    ['src/pages/dashboard/Settings.tsx', /aria-label=\{showNewPassword \? 'Hide new password' : 'Show new password'\}/],
  ];
  for (const [file, pattern] of cases) {
    test(`${file.split('/').pop()} — ${pattern.source.slice(0, 40)}`, () => {
      expect(read(file)).toMatch(pattern);
    });
  }
});
