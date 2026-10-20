import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

/**
 * Self-serve account deletion is a store requirement (Apple 5.1.1(v), Google
 * Play's Data safety deletion URL). These checks keep the pieces in step: the
 * migration that performs it, the Settings card that starts it, the public
 * page that describes it, and the policy wording that promises it.
 */
const read = (p: string) => readFileSync(p, 'utf8');
const migration = 'supabase/migrations/20261020000001_account_deletion_requests.sql';

describe('the database side exists and is scoped', () => {
  const sql = existsSync(migration) ? read(migration) : '';
  test('migration present', () => expect(sql.length).toBeGreaterThan(500));
  test('one request per user, RLS on, own-row policies only', () => {
    expect(sql).toMatch(/account_deletion_requests[\s\S]*user_id\s+uuid primary key references auth\.users/);
    expect(sql).toMatch(/enable row level security/);
    for (const verb of ['select', 'insert', 'delete']) expect(sql).toMatch(new RegExp(`for ${verb} to authenticated`));
    expect(sql).not.toMatch(/for update/);
  });
  test('a 30-day grace period is enforced in the insert policy', () => {
    expect(sql).toMatch(/scheduled_for >= now\(\) \+ interval '29 days'/);
  });
  test('community content is anonymised, not destroyed, before the user row goes', () => {
    expect(sql).toMatch(/community_posts\s+alter column user_id drop not null/);
    expect(sql).toMatch(/display_name = '\[account removed\]'/);
    expect(sql.indexOf("display_name = '[account removed]'")).toBeLessThan(sql.indexOf('delete from auth.users'));
  });
  test('the purge runs on a schedule and cannot be called by clients', () => {
    expect(sql).toMatch(/cron\.schedule\(\s*'account-deletion-purge-daily'/);
    expect(sql).toMatch(/revoke all on function public\.purge_due_account_deletions\(\) from public, anon, authenticated/);
  });
});

describe('the product offers it where the stores look', () => {
  test('Settings no longer sends users to email; it schedules deletion itself', () => {
    const s = read('src/pages/dashboard/Settings.tsx');
    expect(s).not.toContain('subject=Account%20deletion%20request');
    expect(s).toContain('<AccountDeletionCard');
  });
  test('the card requires a typed confirmation and shows the grace period', () => {
    const c = read('src/components/dashboard/AccountDeletionCard.tsx');
    expect(c).toMatch(/typed !== 'DELETE'/);
    expect(c).toContain('Cancel deletion');
  });
  test('the mobile app schedules and cancels through the same table', () => {
    const a = read('mobile/src/lib/account.ts');
    expect(a).toMatch(/from\('account_deletion_requests'\)[\s\S]*insert\(\{ user_id: userId, source: 'app' \}\)/);
    const s = read('mobile/src/app/(tabs)/settings.tsx');
    expect(s).not.toContain('Email a deletion request');
    expect(s).toContain('Cancel deletion');
  });
});

describe('the public page and the policy say the same thing', () => {
  test('/account-deletion is routed, titled, prerendered and linked', () => {
    expect(read('src/App.tsx')).toContain('path="/account-deletion"');
    expect(read('src/data/routeTitles.ts')).toContain("'/account-deletion'");
    expect(read('scripts/prerender.mjs')).toContain("p: '/account-deletion'");
    expect(read('src/components/Footer.tsx')).toContain("to: '/account-deletion'");
  });
  test('the page describes the grace period, the email fallback and what is kept', () => {
    const p = read('src/pages/AccountDeletion.tsx');
    expect(p).toMatch(/30 days/);
    expect(p).toContain('help@indigenousrising.ai');
    expect(p).toMatch(/\[account removed\]/);
    expect(p).toMatch(/7 years/);
  });
  test('the privacy policy no longer promises a 7-year hold on account information', () => {
    const p = read('src/pages/PrivacyPolicy.tsx');
    expect(p).not.toContain('Until account deletion plus 7 years');
    expect(p).toMatch(/30-day grace period/);
  });
});
