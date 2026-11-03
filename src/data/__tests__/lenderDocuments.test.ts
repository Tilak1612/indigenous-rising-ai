import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LENDER_DOCS, DOC_TYPES, NO_PUBLISHED_LIST, countMarked } from '../lenderDocuments';

const page = readFileSync('src/pages/guides/LenderDocuments.tsx', 'utf8');

describe('lender document matrix', () => {
  test('every lender has a mark for every document type, a source and quotes', () => {
    for (const l of LENDER_DOCS) {
      for (const d of DOC_TYPES) expect(['Y', 'C', '-'], `${l.id}.${d.id}`).toContain(l.marks[d.id]);
      expect(l.url, l.id).toMatch(/^https:\/\//);
      expect(l.items.length, l.id).toBeGreaterThanOrEqual(3);
    }
  });

  test('the identity pattern stated on the page matches the matrix', () => {
    expect(countMarked('identity')).toBe(LENDER_DOCS.length - 1);
    expect(LENDER_DOCS.find((l) => l.id === 'futurpreneur')!.marks.identity).toBe('-');
  });

  test('no lender figures are published, only documents', () => {
    const all = JSON.stringify(LENDER_DOCS);
    expect(all).not.toMatch(/\$\d{2,3},\d{3}|maximum of \$|Maximum loan/);
  });

  test('blank cells are explained as not named, not as not required', () => {
    expect(page).toMatch(/not named in the source we read, not that the lender will not want it/);
    expect(NO_PUBLISHED_LIST.length).toBeGreaterThan(0);
  });
});
