import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Guards for horizontal-overflow defects measured in a real browser across
// 7 viewports (320/375/414/768/1024/1280 and 812x375 landscape) over all 45
// routes. jsdom has no layout engine, so each case asserts that the exact
// class string the fix introduced is still present; deleting the fix removes
// the string and fails the test. The pixel figures came from the browser.

const cases: Array<[file: string, fixedClasses: string, why: string]> = [
  ['src/pages/dashboard/BusinessPlanner.tsx',
   'flex flex-wrap items-center justify-between gap-3 pt-4 border-t',
   'Previous/Next row overflowed at 320px (sw=337)'],
  ['src/pages/dashboard/Team.tsx',
   'flex min-w-0 items-center gap-4',
   'a long owner email would not shrink at 320px (sw=334)'],
  ['src/pages/dashboard/Team.tsx',
   'min-w-0 truncate font-medium',
   'the email needs to truncate rather than set the row width'],
  ['src/pages/dashboard/Integrations.tsx',
   'flex min-w-0 items-center gap-4',
   'the description pushed Connect off-screen at 320px (sw=353)'],
  ['src/pages/dashboard/Integrations.tsx',
   'size="sm" className="shrink-0">Connect<',
   'the Connect button must not be squeezed instead'],
  ['src/pages/dashboard/Compliance.tsx',
   'flex flex-wrap items-center gap-2',
   'the status badge overflowed at 320px (sw=340)'],
  ['src/pages/dashboard/Tasks.tsx',
   'flex flex-col sm:flex-row sm:flex-wrap gap-3',
   'the Add task row overflowed at 768px (sw=812)'],
  ['src/pages/dashboard/Templates.tsx',
   'flex flex-wrap gap-2',
   'Preview/Download could not shrink at 768px (sw=783)'],
  ['src/pages/dashboard/Resources.tsx',
   'flex flex-wrap items-center gap-2 ml-auto',
   'the action group overflowed at 768px (sw=802)'],
  ['src/pages/dashboard/Resources.tsx',
   'min-w-0 flex-1',
   'the text column set the card minimum width at 768px'],
  ['src/pages/Training.tsx',
   'flex flex-wrap gap-3',
   'Manage/Refresh needed ~370px, overflowed at 320 and 375'],
  ['src/pages/PublicFunding.tsx',
   'h-auto max-w-full whitespace-normal py-3',
   'a 303px nowrap CTA inside a 264px card at 320px'],
];

describe('rows measured overflowing keep their fix', () => {
  for (const [file, fixedClasses, why] of cases) {
    test(`${file.split('/').pop()} — ${why}`, () => {
      expect(readFileSync(file, 'utf8'),
        `${file} no longer contains "${fixedClasses}"`).toContain(fixedClasses);
    });
  }
});
