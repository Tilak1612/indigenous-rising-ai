import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// The readiness tables rely on the same policy expression that is already
// demonstrably satisfied by GoTrue-minted user JWTs in this project:
//
//   business_plans and user_preferences have RLS enabled, zero insert paths
//   that do not require auth.uid(), no server-side writer anywhere in the
//   repo, and a browser writer that sends the stored session access_token.
//   Both hold rows owned by real, email-confirmed accounts. Those rows
//   could not exist unless a real GoTrue token satisfied
//   auth.uid() = user_id.
//
// That inference only carries over while the new policies keep the same
// shape, so the shape is pinned here.

const migration = readFileSync(
  'supabase/migrations/20260827000001_funding_readiness_workspace.sql', 'utf8');

describe('readiness policies match the pattern proven in production', () => {
  for (const table of ['funding_applications', 'funding_readiness_items']) {
    test(`${table} is scoped by auth.uid() = user_id`, () => {
      const block = migration.slice(migration.indexOf(`ON public.${table} FOR ALL`));
      expect(block, `${table} has no FOR ALL policy`).not.toBe('');
      // TO authenticated, not TO public: anon must never reach these rows.
      expect(block.slice(0, 200)).toMatch(/FOR ALL TO authenticated/);
      // USING governs read/update visibility.
      expect(block.slice(0, 300)).toMatch(/USING \(auth\.uid\(\) = user_id\)/);
      // WITH CHECK governs insert/update writes. Without it a user could
      // write rows owned by someone else.
      expect(block.slice(0, 300)).toMatch(/WITH CHECK \(auth\.uid\(\) = user_id\)/);
    });
  }

  test('RLS is enabled on both tables', () => {
    for (const table of ['funding_applications', 'funding_readiness_items']) {
      expect(migration).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    }
  });

  test('no policy grants a write path that skips auth.uid()', () => {
    // e.g. a "service role can manage" ALL policy USING (true) would open
    // an insert path that the proven pattern does not have.
    const policyBodies = migration.split('CREATE POLICY').slice(1);
    expect(policyBodies.length).toBeGreaterThan(0);
    for (const body of policyBodies) {
      const head = body.slice(0, 320);
      expect(head, `a policy omits auth.uid(): ${head.slice(0, 90)}`).toMatch(/auth\.uid\(\)/);
      expect(head, `a policy uses USING (true): ${head.slice(0, 90)}`).not.toMatch(/USING \(true\)/);
    }
  });
});
