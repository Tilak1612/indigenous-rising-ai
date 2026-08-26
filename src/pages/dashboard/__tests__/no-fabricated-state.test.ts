import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Truthfulness guards for the dashboard.
 *
 * Four dashboard pages shipped invented state as if it were the user's own:
 * fake API keys, integrations marked connected that nobody authorised, a
 * certification marked complete with a downloadable certificate, and six
 * hardcoded funding opportunities carrying fabricated match scores and
 * deadlines on the PAID Funding Navigator.
 *
 * All four were fixed. Nothing prevented them being written in the first
 * place, and there were zero tests across 23 dashboard pages — which is why
 * they survived. These assertions fail if any of it comes back.
 */

const DIR = join(process.cwd(), 'src/pages/dashboard');
const read = (f: string) => readFileSync(join(DIR, f), 'utf8');
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('dashboard shows no fabricated state', () => {
  test('Certifications claims no course is complete and offers no certificate', () => {
    const s = stripComments(read('Certifications.tsx'));
    // Match assignments (trailing comma), not the type union that declares
    // these as valid states.
    expect(s).not.toMatch(/status:\s*'completed'\s*,/);
    expect(s).not.toMatch(/status:\s*'in_progress'\s*,/);
    expect(s).not.toMatch(/certificate:\s*true/);
    expect(s).not.toMatch(/completedModules:\s*[1-9]/);
  });

  test('Integrations marks nothing as connected', () => {
    const s = stripComments(read('Integrations.tsx'));
    expect(s).not.toMatch(/connected:\s*true/);
  });

  test('ApiAccess ships no API keys', () => {
    const s = stripComments(read('ApiAccess.tsx'));
    // No key-shaped literals, and no mock key list.
    expect(s).not.toMatch(/ir_(live|test)_sk_/);
    expect(s).not.toMatch(/mockApiKeys/);
  });

  test('Funding Navigator asserts no match score and hardcodes no opportunities', () => {
    const s = stripComments(read('Funding.tsx'));
    // A fit percentage with no criteria behind it is the thing that was wrong.
    expect(s).not.toMatch(/matchScore/);
    // It must read the verified catalogue, not a page-local copy.
    expect(s).toMatch(/from\('grants'\)/);
    expect(s).not.toMatch(/saved:\s*true/);
  });

  test('Compliance asserts no completed OCAP requirement and issues no certificate', () => {
    const s = stripComments(read('Compliance.tsx'));
    expect(s).not.toMatch(/status:\s*'complete'\s*,/);
    expect(s).not.toMatch(/ComplianceCertificate/);
    expect(s).not.toMatch(/Export Certificate/);
  });
});

describe('dashboard pages are responsive', () => {
  test('no page header squeezes a title beside its buttons on mobile', () => {
    const offenders: string[] = [];
    for (const f of readdirSync(DIR).filter((f) => f.endsWith('.tsx'))) {
      const lines = read(f).split('\n');
      lines.forEach((line, i) => {
        if (
          line.includes('flex items-center justify-between') &&
          !line.includes('flex-wrap') &&
          !line.includes('sm:') &&
          lines.slice(i, i + 6).join('\n').includes('<h1')
        ) {
          offenders.push(`${f}:${i + 1}`);
        }
      });
    }
    // A title + description sharing a non-wrapping row with action buttons is
    // crushed into a narrow column at 375px. Stack it: flex-col ... sm:flex-row
    expect(offenders).toEqual([]);
  });
});
