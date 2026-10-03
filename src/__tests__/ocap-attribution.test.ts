import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * Wherever the site explains OCAP®, it must name FNIGC.
 *
 * The keyword plan asked for a dedicated "What is OCAP?" page whose stated
 * purpose was to "become the answer-engine citation for the topic". That page
 * was not built, for two reasons that are worth recording here rather than in a
 * commit nobody re-reads:
 *
 *   1. It would be the FOURTH place on this site answering the same question —
 *      the homepage FAQ, the OCAP resource, and the data-sovereignty page all
 *      already do. A fourth would cannibalise them, which is the defect this
 *      codebase has spent several PRs removing.
 *   2. Writing the canonical definition of a First Nations governance framework
 *      so that AI assistants quote US instead of FNIGC is the wrong thing for a
 *      software vendor to do. fnigc.ca also returns 403 to automated requests,
 *      so it could only have been written from memory.
 *
 * What IS owed is that every place we do explain OCAP® credits its source. This
 * asserts that.
 */
const explainers = [
  'src/components/FAQSection.tsx',
  'src/components/resources/ResourcePreviewModal.tsx',
  'src/pages/DataSovereignty.tsx',
];

const FNIGC = /First Nations Information Governance Centre|FNIGC/;

describe('every OCAP explanation credits FNIGC', () => {
  test.each(explainers)('%s names the source', (file) => {
    let src: string;
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      // DataSovereignty ships on its own branch; skip rather than fail here.
      return;
    }
    if (!/OCAP/.test(src)) return;
    expect(src, `${file} explains OCAP® without naming FNIGC`).toMatch(FNIGC);
  });

  test('the homepage FAQ points readers to the authority, not only at us', () => {
    const faq = readFileSync('src/components/FAQSection.tsx', 'utf8');
    expect(faq).toMatch(FNIGC);
    expect(faq).toMatch(/not certified/i);
  });

  test('no file anywhere explains the four principles without crediting FNIGC', () => {
    const roots = ['src/components', 'src/pages', 'src/data'];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`;
        if (e.isDirectory()) {
          if (e.name !== '__tests__') walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(e.name)) continue;
        const src = readFileSync(full, 'utf8');
        // Naming the four principles in a card title is a LABEL, not an
        // explanation. The first version of this check flagged the
        // certifications and resources listings for exactly that, and neither
        // owes a citation — the certifications page already says "Training
        // isn't live yet" and issues no certificate. An explanation is a file
        // that DEFINES the principles, so require definitional phrasing too.
        const namesThem = /Ownership,\s*Control,\s*Access[, ]+and\s*Possession/i.test(src);
        const defines = /stands for|principles developed|is a framework|are .{0,30}principles/i.test(src);
        const explains = namesThem && defines;
        if (explains && !FNIGC.test(src)) offenders.push(full);
      }
    };
    roots.forEach(walk);
    expect(offenders, `explain OCAP® without crediting FNIGC: ${offenders.join(', ')}`).toEqual([]);
  });
});
