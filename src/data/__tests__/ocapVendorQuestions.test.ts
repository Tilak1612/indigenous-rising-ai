import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { VENDOR_QUESTIONS, FNIGC_URL } from '../ocapVendorQuestions';

/**
 * /guides/what-is-ocap must signpost FNIGC rather than replace them.
 *
 * The page exists to answer the informational query, but OCAP® belongs to the
 * First Nations Information Governance Centre and fnigc.ca returns 403 to
 * automated requests — so the four principles are NOT defined here. The page's
 * own contribution is vendor evaluation, which is ours to write.
 *
 * These assertions hold that line mechanically.
 */
const page = readFileSync('src/pages/WhatIsOcap.tsx', 'utf8');

describe('the page signposts FNIGC instead of substituting for them', () => {
  test('it does not define the four principles', () => {
    // Expanding the acronym is fine and already sitewide. Explaining what each
    // principle MEANS is what belongs to FNIGC.
    expect(page).not.toMatch(/###?\s*Ownership/);
    expect(page).not.toMatch(/Ownership\s*[—-]\s*(?:communities|First Nations)\s+\w+\s+own/i);
    expect(page).not.toMatch(/principles mean|each principle|the four pillars/i);
  });

  test('it says plainly that the principles are not ours to restate', () => {
    expect(page).toMatch(/not going to paraphrase them here/i);
    expect(page).toMatch(/not ours to take/i);
  });

  test('FNIGC is linked, and appears before the first internal CTA', () => {
    expect(page).toContain('FNIGC_URL');
    const fnigcAt = page.indexOf('FNIGC_URL');
    const firstInternalCta = page.indexOf('<Link');
    expect(fnigcAt, 'FNIGC must come before our own links').toBeLessThan(firstInternalCta);
  });

  test('the FNIGC link points at fnigc.ca', () => {
    expect(FNIGC_URL).toMatch(/^https:\/\/fnigc\.ca/);
  });
});

describe('the vendor questions are the page’s own contribution', () => {
  test('there are enough of them to be useful', () => {
    expect(VENDOR_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  });

  test('each question carries why it matters, what to watch for, and our answer', () => {
    for (const q of VENDOR_QUESTIONS) {
      expect(q.why.length, `${q.question}: no rationale`).toBeGreaterThan(60);
      expect(q.watchFor.length, `${q.question}: nothing to watch for`).toBeGreaterThan(40);
      expect(q.ourAnswer.length, `${q.question}: no answer from us`).toBeGreaterThan(60);
    }
  });

  test('at least one of our own answers is unflattering', () => {
    // A vendor checklist whose author scores full marks on its own questions is
    // worthless. Something here must concede a limit.
    const answers = VENDOR_QUESTIONS.map((q) => q.ourAnswer).join(' ').toLowerCase();
    expect(answers).toMatch(/nobody|not canadian|ask us|no certification|as it does at every vendor/);
  });

  test('the certification answer concedes we hold none', () => {
    const cert = VENDOR_QUESTIONS.find((q) => /certified/i.test(q.question));
    expect(cert, 'no question about certification').toBeDefined();
    expect(cert!.ourAnswer).toMatch(/nobody/i);
    expect(cert!.ourAnswer).toMatch(/no certification|not been assessed|hold no/i);
  });

  test('the residency answer names the region, not just the country', () => {
    const res = VENDOR_QUESTIONS.find((q) => /stored/i.test(q.question));
    expect(res!.ourAnswer).toContain('ca-central-1');
  });
});

describe('the route is registered', () => {
  test.each(['src/App.tsx', 'src/data/routeTitles.ts', 'scripts/prerender.mjs'])(
    '%s carries it',
    (f) => expect(readFileSync(f, 'utf8')).toContain('/guides/what-is-ocap'),
  );
});
