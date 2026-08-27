import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  SAVED_MATCH_STATUSES,
  DEFAULT_SAVED_STATUS,
  isSavedMatchStatus,
} from '../funding-status';

describe('saved match status', () => {
  test('the default status is a member of the constrained set', () => {
    // 'saved' shipped as the default and is NOT in the set, so Postgres
    // rejected every write from the Funding page.
    expect(SAVED_MATCH_STATUSES).toContain(DEFAULT_SAVED_STATUS);
    expect(isSavedMatchStatus('saved')).toBe(false);
  });

  test('the set matches the database CHECK constraint exactly', () => {
    // Verified against production:
    //   CHECK (status = ANY (ARRAY['interested','applied','pending',
    //                              'awarded','declined','withdrawn']))
    expect([...SAVED_MATCH_STATUSES].sort()).toEqual(
      ['applied', 'awarded', 'declined', 'interested', 'pending', 'withdrawn'],
    );
  });
});

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === '__tests__' || entry === 'node_modules' ? [] : walk(full);
    }
    return /\.tsx?$/.test(entry) ? [full] : [];
  });

describe('no call site retypes a status literal', () => {
  test('every funding_saved_matches write uses the shared constant', () => {
    const offenders: string[] = [];
    for (const file of walk('src')) {
      const src = readFileSync(file, 'utf8');
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (!line.includes('funding_saved_matches')) return;
        // Only the payload window of a write to THIS table. A file-wide
        // scan false-positives on unrelated status fields (grant status
        // 'open', eligibility 'met', and `response.status)`).
        const window = lines.slice(i, i + 12).join('\n');
        for (const m of window.matchAll(/status:\s*'([^']+)'/g)) {
          offenders.push(`${file}:${i + 1} status: '${m[1]}'`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
