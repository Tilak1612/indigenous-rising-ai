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
        if (!src.includes(table)) continue;
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
