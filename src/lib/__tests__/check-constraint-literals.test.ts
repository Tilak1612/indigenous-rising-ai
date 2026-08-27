import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Sweeps every client write for values Postgres would reject.
 *
 * This generalises a real production bug: the Funding page upserted
 * status 'saved' into funding_saved_matches, which the column's CHECK
 * constraint does not allow, so every save failed and the UI reverted.
 * Mocked tests could not catch it — a mock accepts any string, and the
 * constraint lives in the database.
 *
 * The allowed sets below are transcribed from production:
 *   select conrelid::regclass, pg_get_constraintdef(oid)
 *   from pg_constraint where contype = 'c'
 *     and pg_get_constraintdef(oid) ilike '%= ANY%';
 * Keep in sync when a constraint changes.
 */
const CONSTRAINTS: Record<string, Record<string, string[]>> = {
  ai_chat_messages:        { role: ['user', 'assistant', 'system'] },
  business_plans:          { plan_type: ['startup', 'expansion', 'community', 'social_enterprise'],
                             status: ['draft', 'in_progress', 'completed', 'shared'] },
  cirnac_reports:          { status: ['draft', 'in_progress', 'submitted', 'accepted'] },
  email_consent:           { basis: ['express', 'implied_business_relationship'],
                             consent_type: ['marketing', 'product_education', 'summaries', 'newsletter'] },
  email_log:               { status: ['queued', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed'] },
  email_suppressions:      { reason: ['hard_bounce', 'complaint', 'manual', 'unsubscribe_all', 'deleted'] },
  funding_match_cache:     { eligibility: ['yes', 'no', 'maybe'] },
  funding_match_runs:      { source: ['user', 'cron', 'api'] },
  funding_saved_matches:   { status: ['interested', 'applied', 'pending', 'awarded', 'declined', 'withdrawn'] },
  grant_applications:      { status: ['draft', 'in_progress', 'submitted', 'approved', 'rejected'] },
  grants:                  { funding_type: ['grant', 'loan', 'loan_guarantee', 'mixed', 'varies'],
                             verification_status: ['unverified', 'verified', 'needs_review', 'retired'] },
  profiles:                { business_stage: ['ideation', 'startup', 'early-stage', 'growth', 'established'],
                             entity_type: ['sole_proprietorship', 'partnership', 'corporation', 'co_operative',
                                           'nation_owned', 'development_corporation', 'non_profit'],
                             indigenous_identity: ['first_nations', 'metis', 'inuit', 'multiple', 'prefer_not_to_say'] },
  subscriptions:           { status: ['active', 'trialing', 'past_due', 'canceled', 'incomplete',
                                       'incomplete_expired', 'unpaid', 'paused'] },
  support_tickets:         { priority: ['low', 'medium', 'high', 'urgent'],
                             status: ['open', 'in_progress', 'resolved', 'closed'] },
  team_invitations:        { role: ['admin', 'member', 'viewer'], status: ['pending', 'accepted', 'revoked'] },
};

/**
 * Whole-identifier match. A bare src.includes('profiles') also matches
 * 'business_profiles', which made the sweep attribute OnboardingWizard's
 * option lists to public.profiles and report two violations that were not
 * real: business_profiles carries no CHECK constraints at all.
 */
const referencesTable = (src: string, table: string) =>
  new RegExp('(?<![A-Za-z0-9_])' + table + '(?![A-Za-z0-9_])').test(src);

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === '__tests__' ? [] : walk(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });

/**
 * A union type (`status: 'open' | 'closed'`) and a log line
 * (`'status:', response.status`) both look like a payload to a naive
 * regex. All three hits in the first run of this sweep were of those two
 * shapes, so they are excluded explicitly rather than by loosening the
 * check.
 */
const isDeclarationOrLog = (line: string, matchEnd: number, src: string) => {
  if (/^\s*(\/\/|\*)/.test(line)) return true;
  if (/\b(interface|type)\b/.test(line)) return true;
  if (/console\.(log|error|warn|info|debug)/.test(line)) return true;
  // A union type continues with " | " after the literal.
  return /^\s*\|/.test(src.slice(matchEnd, matchEnd + 4));
};

describe('no client write sends a value Postgres would reject', () => {
  test('every constrained literal is a member of its allowed set', () => {
    const violations: string[] = [];
    for (const file of walk('src')) {
      const src = readFileSync(file, 'utf8');
      const lines = src.split('\n');
      for (const [table, cols] of Object.entries(CONSTRAINTS)) {
        if (!referencesTable(src, table)) continue;
        for (const [col, allowed] of Object.entries(cols)) {
          const re = new RegExp(`\\b${col}\\s*:\\s*'([^']+)'`, 'g');
          for (const m of src.matchAll(re)) {
            const idx = m.index ?? 0;
            const lineNo = src.slice(0, idx).split('\n').length;
            const line = lines[lineNo - 1] ?? '';
            if (isDeclarationOrLog(line, idx + m[0].length, src)) continue;
            if (allowed.includes(m[1])) continue;
            violations.push(
              `${file}:${lineNo}  ${table}.${col} = '${m[1]}'  (allowed: ${allowed.join(', ')})`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  test('the sweep actually inspects the tables it claims to', () => {
    // Guards against the whole thing passing because nothing matched.
    const covered = Object.keys(CONSTRAINTS).filter((t) =>
      walk('src').some((f) => readFileSync(f, 'utf8').includes(t)));
    expect(covered.length, 'no constrained table is referenced anywhere in src/')
      .toBeGreaterThan(3);
  });
});

/**
 * The sweep above only sees `col: 'value'`. A component can just as easily
 * hold its options in a union type or a `{ value: 'x' }` array — which is
 * exactly how SavedMatches declares its six statuses. Those are the values
 * the UI can actually send, so they are checked too.
 *
 * A union counts as "for" a constrained column when it already overlaps
 * that column's allowed set; a member outside the set is then a value the
 * database would reject.
 */
const unionMembers = (decl: string) =>
  [...decl.matchAll(/'([^']+)'/g)].map((m) => m[1]);

describe('option lists cannot drift from the constraint', () => {
  test('no union or value-list adds a member Postgres would reject', () => {
    const violations: string[] = [];
    for (const file of walk('src')) {
      const src = readFileSync(file, 'utf8');
      const tables = Object.keys(CONSTRAINTS).filter((t) => referencesTable(src, t));
      if (!tables.length) continue;

      const candidates: { label: string; members: string[]; line: number }[] = [];
      // type Status = 'interested' | 'applied' | ...
      for (const m of src.matchAll(/type\s+(\w+)\s*=\s*((?:\s*'[^']+'\s*\|?)+)/g)) {
        candidates.push({ label: `type ${m[1]}`, members: unionMembers(m[2]),
          line: src.slice(0, m.index).split('\n').length });
      }
      // const X = [{ value: 'interested', ... }, ...]
      for (const m of src.matchAll(/const\s+(\w+)[^=]*=\s*\[([\s\S]{0,900}?)\];/g)) {
        const members = [...m[2].matchAll(/value:\s*'([^']+)'/g)].map((v) => v[1]);
        if (members.length >= 2) {
          candidates.push({ label: `const ${m[1]}`, members,
            line: src.slice(0, m.index).split('\n').length });
        }
      }

      for (const cand of candidates) {
        for (const table of tables) {
          for (const [col, allowed] of Object.entries(CONSTRAINTS[table])) {
            const overlap = cand.members.filter((v) => allowed.includes(v));
            // Two or more shared members means this list is describing that
            // column, not coincidentally sharing a word.
            if (overlap.length < 2) continue;
            const strays = cand.members.filter((v) => !allowed.includes(v));
            if (strays.length) {
              // Concatenation, not a nested template literal: CLAUDE.md
              // forbids nesting backticks, and doing it here is what made
              // this file fail to parse with "Unterminated string constant".
              const quoted = strays.map((v) => "'" + v + "'").join(', ');
              violations.push(
                file + ':' + cand.line + '  ' + cand.label +
                ' feeds ' + table + '.' + col +
                ' but adds ' + quoted +
                ' (allowed: ' + allowed.join(', ') + ')');
            }
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
