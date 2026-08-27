import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * OCAP® is a registered mark of the First Nations Information Governance
 * Centre, which is the body that delivers OCAP® training. A vendor cannot
 * self-declare compliance with it, and there is no third-party certification
 * behind the claim.
 *
 * "OCAP® compliant" appeared in nine places across pricing, FAQ, plan data,
 * feature data, careers and the dashboard nav, while /compliance already used
 * careful "aligned with, not certified" wording. This pins every surface to the
 * careful wording.
 */
const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '__tests__' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|html)$/.test(e)) out.push(p);
  }
  return out;
};

const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('OCAP® language is alignment, never compliance or certification', () => {
  test('no source file claims OCAP compliance or certification', () => {
    const offenders: string[] = [];
    for (const f of [...walk('src'), 'index.html']) {
      const text = stripComments(readFileSync(f, 'utf8'));
      // Allowed: the explicit "not a third-party certification" disclaimer, and
      // the self-assessment page's own framing.
      for (const m of text.matchAll(/OCAP[®]?[-\s]?(compliant|certified|compliance)/gi)) {
        const around = text.slice(Math.max(0, m.index! - 130), m.index! + 130);
        if (/not a third-party certification|self-assessment|not affiliated/i.test(around)) continue;
        offenders.push(`${f}: "${m[0]}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
