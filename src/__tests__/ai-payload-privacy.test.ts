import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * What leaves Canada for AI funding matching must match what /privacy says
 * leaves Canada.
 *
 * Found 2026-09-20: the policy disclosed "territory, industry, business stage,
 * description, and funding purpose" and stated no identifying information is
 * sent. The function also sent business_name, bio, employees, entity_type,
 * indigenous_ownership_pct and self_declared_identity — the last two being the
 * identity of an Indigenous person or business, to a US processor, on a
 * platform built around OCAP®.
 *
 * Identity and ownership are not needed by the model: eligibility is decided
 * in evaluateCriteria() by rules in code.
 */
const fn = readFileSync('supabase/functions/match-funding-opportunities/index.ts', 'utf8');
const policy = readFileSync('src/pages/PrivacyPolicy.tsx', 'utf8');

const payload = (() => {
  const m = /const profileSummary = \{([\s\S]*?)\n {2}\};/.exec(fn);
  if (!m) throw new Error('profileSummary not found in the matcher');
  return m[1];
})();
const fields = [...payload.matchAll(/^\s{4}([a-z_]+):/gm)].map((m) => m[1]);

describe('the AI payload is the disclosed payload', () => {
  test('it sends only the fields the privacy policy names', () => {
    expect(fields.sort()).toEqual(
      ['business_stage', 'description', 'funding_purpose', 'industry', 'target_funding_amount_cad', 'territory'],
    );
  });

  test('no Indigenous identity or ownership share is sent', () => {
    for (const field of ['self_declared_identity', 'indigenous_identity', 'indigenous_ownership_pct']) {
      expect(payload, `${field} must not leave the country for a fit score`).not.toContain(field);
    }
  });

  test('no name, contact detail or community is sent', () => {
    for (const field of ['business_name', 'email', 'phone', 'full_name', 'community_name', 'nation', 'bio']) {
      expect(payload, `${field} is identifying or community data`).not.toContain(field);
    }
  });

  test('eligibility is still decided in code, where it can be audited', () => {
    // This is why dropping identity costs nothing.
    expect(fn).toMatch(/function evaluateCriteria/);
    expect(fn).toMatch(/grant\.identity_criteria/);
    expect(fn).toMatch(/ownership_min_pct/);
  });

  test('the policy still describes this feature, and the two agree', () => {
    const disclosure = /Third-Party Processors for AI Features[\s\S]{0,900}/.exec(policy)?.[0] ?? '';
    expect(disclosure, 'the AI disclosure has gone from /privacy').not.toBe('');
    for (const word of ['territory', 'industry', 'business stage', 'description', 'funding purpose']) {
      expect(disclosure.toLowerCase()).toContain(word);
    }
    expect(disclosure).toMatch(/only when you click/i);
  });
});
