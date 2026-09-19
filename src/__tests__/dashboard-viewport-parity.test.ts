import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

/**
 * Every dashboard feature must be reachable on desktop, tablet and phone.
 *
 * Measured with the harness (npm run dev:harness) in headless Chrome at
 * 1280x800, 768x1024 (touch) and 375x812 (touch, mobile), for the free, growth
 * and enterprise tiers, on every dashboard route, with every tab and header
 * menu opened: the only feature missing at any width was the header Upgrade
 * button, hidden below 640px by `hidden sm:flex`, so free users on phones had
 * no upgrade entry in the header.
 *
 * jsdom has no layout, so this guards the cause rather than the symptom: a
 * dashboard page or layout may not hide a control at a breakpoint. The sidebar
 * primitive is the one exception — below 768px it moves its items into a
 * drawer opened by the header trigger (verified: 21/21 items on every width).
 */
const read = (p: string) => readFileSync(p, 'utf8');
const BREAKPOINT_HIDE = /(?:^|["'`\s])(?:hidden (?:sm|md|lg|xl|2xl):(?:flex|block|inline|inline-flex|inline-block|grid|table)|(?:sm|md|lg|xl|2xl):hidden|max-(?:sm|md|lg|xl):hidden)(?=["'`\s])/;

const files = execSync(
  "git ls-files 'src/pages/dashboard/*.tsx' 'src/components/dashboard/*.tsx' src/pages/Dashboard.tsx",
  { encoding: 'utf8' },
).trim().split('\n').filter(Boolean);

describe('dashboard features are not hidden by screen size', () => {
  test('the sweep covers the dashboard', () => {
    expect(files.length).toBeGreaterThan(30);
    expect(files).toContain('src/components/dashboard/DashboardLayout.tsx');
  });

  for (const f of files) {
    test(`${f} hides nothing at a breakpoint`, () => {
      const code = read(f).replace(/\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        // A text-only label hidden on phones is fine when its control stays
        // visible and named (e.g. the icon-only Upgrade button).
        .replace(/<span className="hidden (?:sm|md|lg):inline">[^<{]*<\/span>/g, '');
      const hit = code.split('\n').find((l) => BREAKPOINT_HIDE.test(l));
      expect(hit, `${f} hides content by breakpoint — give phones an equivalent control`).toBeUndefined();
    });
  }

  test('the header Upgrade link exists at every width, with a name when icon-only', () => {
    const layout = read('src/components/dashboard/DashboardLayout.tsx');
    const m = /<Button size="sm" asChild className="([^"]+)">\s*<Link to="\/pricing" aria-label="Upgrade your plan">/.exec(layout);
    expect(m, 'header Upgrade link not found, or it lost its accessible name').not.toBeNull();
    expect(m![1]).toMatch(/h-11 w-11/); // 44px on phones
    expect(m![1]).not.toMatch(/(^|\s)hidden(\s|$)/);
  });
});

describe('touch targets measured under 24px are fixed at the source', () => {
  // WCAG 2.2 SC 2.5.8 (AA): 24x24 CSS px minimum. Measured on touch widths:
  // funding Save 20px wide, checklist Dismiss 16px, editor toolbar 18px
  // (flexbox shrank the 32px buttons on a phone instead of wrapping).
  test('funding Save is 44px', () => {
    const src = read('src/pages/dashboard/Funding.tsx');
    const btn = /aria-pressed=\{opp\.saved\}[\s\S]*?className="([^"]+)"/.exec(src)?.[1] ?? '';
    expect(btn).toMatch(/h-11 w-11/);
  });

  test('checklist Dismiss is 44px', () => {
    const src = read('src/components/dashboard/GettingStartedChecklist.tsx');
    const btn = /className="([^"]+)"\s*\n\s*aria-label="Dismiss checklist"/.exec(src)?.[1] ?? '';
    expect(btn).toMatch(/h-11 w-11/);
  });

  test('the editor toolbar wraps instead of squeezing its buttons', () => {
    const src = read('src/components/dashboard/RichTextToolbar.tsx');
    expect(src).toMatch(/"flex flex-wrap items-center/);
    expect(src).not.toMatch(/className="h-8 w-8 p-0"/);
  });
});
