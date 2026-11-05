import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  classifyResendEvent,
  emailAddressOf,
  HANDLED_EVENTS,
  logErrorFor,
  recipientHash,
  statusesBefore,
  type ResendWebhookEvent,
} from '../../supabase/functions/_shared/resend-events';

/**
 * The Resend webhook records delivery events for mail sent from
 * indigenousrising.ai, moves email_log forward, and suppresses addresses that
 * hard-bounce or complain. The Resend account is shared, so events for other
 * products' domains must be ignored, and recipients are only stored hashed.
 */
const fn = readFileSync('supabase/functions/resend-webhook/index.ts', 'utf8');
const sql = readFileSync('supabase/migrations/20261104000001_resend_email_events.sql', 'utf8');
const script = readFileSync('scripts/resend-webhook-setup.sh', 'utf8');
const config = readFileSync('supabase/config.toml', 'utf8');

const evt = (type: string, data: ResendWebhookEvent['data'] = {}): ResendWebhookEvent => ({
  type,
  created_at: '2026-11-04T12:00:00.000Z',
  data: { email_id: 'em_1', from: 'Indigenous Rising AI <funding@indigenousrising.ai>', to: ['Person@Example.com'], subject: 'S', ...data },
});

describe('classifyResendEvent', () => {
  test('ignores mail from other products on the shared account', () => {
    expect(classifyResendEvent(evt('email.bounced', { from: 'Navlyt <support@navlyt.com>' }))).toEqual({ kind: 'ignore', reason: 'other_domain' });
    // A lookalike subdomain or suffix is not our domain.
    expect(classifyResendEvent(evt('email.sent', { from: 'x@mail.indigenousrising.ai.evil.com' })).kind).toBe('ignore');
    expect(classifyResendEvent(evt('email.sent', { from: 'x@notindigenousrising.ai' })).kind).toBe('ignore');
  });

  test('ignores event types the endpoint is not registered for', () => {
    expect(classifyResendEvent(evt('email.opened'))).toEqual({ kind: 'ignore', reason: 'unhandled_event' });
    expect(classifyResendEvent(evt('contact.created'))).toEqual({ kind: 'ignore', reason: 'unhandled_event' });
  });

  test('handles exactly the seven requested events', () => {
    expect([...HANDLED_EVENTS]).toEqual([
      'email.sent', 'email.delivered', 'email.delivery_delayed', 'email.bounced',
      'email.complained', 'email.failed', 'email.suppressed',
    ]);
    for (const t of HANDLED_EVENTS) expect(classifyResendEvent(evt(t)).kind).toBe('record');
  });

  test('suppresses permanent bounces and complaints, not temporary bounces or delays', () => {
    const s = (e: ResendWebhookEvent) => {
      const c = classifyResendEvent(e);
      return c.kind === 'record' ? c.suppress : 'ignored';
    };
    expect(s(evt('email.bounced', { bounce: { type: 'Permanent', subType: 'General' } }))).toBe('hard_bounce');
    expect(s(evt('email.bounced', {}))).toBe('hard_bounce');
    expect(s(evt('email.bounced', { bounce: { type: 'Temporary' } }))).toBeNull();
    expect(s(evt('email.complained'))).toBe('complaint');
    expect(s(evt('email.suppressed', { suppressed: { type: 'complaint' } }))).toBe('complaint');
    expect(s(evt('email.suppressed', { suppressed: { type: 'bounce' } }))).toBe('hard_bounce');
    expect(s(evt('email.delivery_delayed'))).toBeNull();
    expect(s(evt('email.delivered'))).toBeNull();
    expect(s(evt('email.failed', { failed: { reason: 'reached_daily_quota' } }))).toBeNull();
  });

  test('maps each event to an email_log status allowed by its check constraint', () => {
    const st = (e: ResendWebhookEvent) => {
      const c = classifyResendEvent(e);
      return c.kind === 'record' ? c.logStatus : 'ignored';
    };
    expect(st(evt('email.sent'))).toBe('sent');
    expect(st(evt('email.delivered'))).toBe('delivered');
    expect(st(evt('email.delivery_delayed'))).toBeNull();
    expect(st(evt('email.bounced', { bounce: { type: 'Temporary' } }))).toBeNull();
    expect(st(evt('email.bounced', { bounce: { type: 'Permanent' } }))).toBe('bounced');
    expect(st(evt('email.complained'))).toBe('complained');
    expect(st(evt('email.failed'))).toBe('failed');
    expect(st(evt('email.suppressed'))).toBe('suppressed');
  });

  test('normalises recipients and returns no subject or bounce message', () => {
    const c = classifyResendEvent(evt('email.bounced', { to: 'Person <Person@Example.com>', bounce: { type: 'Permanent', message: 'person@example.com does not exist' } }));
    expect(c.kind).toBe('record');
    if (c.kind !== 'record') return;
    expect(c.recipients).toEqual(['person@example.com']);
    expect(JSON.stringify(c)).not.toMatch(/does not exist/);
    expect(c).not.toHaveProperty('subject');
    expect(logErrorFor(c)).toBe('bounce:Permanent');
  });
});

describe('email_log status only moves forward', () => {
  test('out-of-order events cannot undo a terminal outcome', () => {
    expect(statusesBefore('sent')).toEqual(['queued']);
    expect(statusesBefore('delivered')).not.toContain('bounced');
    expect(statusesBefore('bounced')).toContain('delivered'); // late bounce after delivery
    expect(statusesBefore('complained')).toContain('delivered');
    for (const terminal of ['bounced', 'complained', 'failed', 'suppressed'] as const) {
      for (const next of ['sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed'] as const) {
        expect(statusesBefore(next)).not.toContain(terminal);
      }
    }
  });
});

describe('recipientHash', () => {
  test('matches the sha256(lower(trim(email))) used by email_log and email_suppressions', async () => {
    // printf 'bounced@resend.dev' | shasum -a 256
    expect(await recipientHash('  Bounced@Resend.dev ')).toBe(await recipientHash('bounced@resend.dev'));
    expect(await recipientHash('bounced@resend.dev')).toBe('e70b0e932b7b3340c924b67254bd4bc31441a4a19fb2b3b6deb8354ca0236a5c');
    expect(emailAddressOf('A <B@C.io>')).toBe('b@c.io');
  });
});

describe('resend-webhook function', () => {
  test('verifies the Svix signature with RESEND_WEBHOOK_SECRET before doing anything', () => {
    expect(fn).toMatch(/import \{ Webhook \} from "npm:svix@\d+\.\d+\.\d+"/);
    expect(fn).toMatch(/Deno\.env\.get\("RESEND_WEBHOOK_SECRET"\)/);
    expect(fn).toMatch(/new Webhook\(secret\)\.verify\(raw,/);
    expect(fn.indexOf('.verify(raw')).toBeLessThan(fn.indexOf('.from("resend_email_events")'));
    expect(fn).toMatch(/status: 401/);
  });

  test('is idempotent on svix-id and skips side effects for a repeat', () => {
    expect(fn).toMatch(/onConflict: "svix_id", ignoreDuplicates: true/);
    expect(fn).toMatch(/duplicate: true/);
    expect(fn.indexOf('duplicate: true')).toBeLessThan(fn.indexOf('.from("email_suppressions")'));
  });

  test('never stores raw addresses, subjects or bounce messages', () => {
    expect(fn).not.toMatch(/recipient:\s/);
    expect(fn).not.toMatch(/from_address|subject:|payload: evt\b|bounce\??\.message|data\??\.subject|data\??\.to\b/);
    expect(fn).toMatch(/recipient_hashes: hashes/);
  });

  test('has verify_jwt pinned off, because Resend sends no JWT', () => {
    expect(config).toMatch(/\[functions\.resend-webhook\]\s*\nverify_jwt = false/);
  });
});

describe('resend_email_events migration', () => {
  test('is additive, keyed by svix_id, and service-role only', () => {
    expect(sql).toMatch(/create table if not exists public\.resend_email_events/);
    expect(sql).toMatch(/svix_id\s+text primary key/);
    expect(sql).toMatch(/alter table public\.resend_email_events enable row level security/);
    expect(sql).toMatch(/revoke all on public\.resend_email_events from anon, authenticated/);
    expect(sql).toMatch(/alter table public\.email_suppressions enable row level security/);
    expect(sql).toMatch(/revoke all on public\.email_suppressions from anon, authenticated/);
    expect(sql).not.toMatch(/create policy/i);
    expect(sql).not.toMatch(/\b(drop|truncate|delete)\b/i);
  });

  test('has no column for a raw address or subject', () => {
    expect(sql).not.toMatch(/^\s+(recipient|to_address|from_address|subject)\s/m);
    expect(sql).toMatch(/recipient_hashes text\[\]/);
  });
});

describe('setup script', () => {
  test('reads every secret with a hidden prompt and never echoes one', () => {
    expect(script).toMatch(/read -rsp "\$prompt" value/);
    expect(script).not.toMatch(/echo "?\$\{?(RESEND_API_KEY|RESEND_WEBHOOK_SECRET|SUPABASE_SERVICE_ROLE_KEY)/);
    // Keys go in mode-600 header files, not on the curl command line.
    expect(script).not.toMatch(/-H "Authorization: Bearer \$\{?RESEND_API_KEY/);
    expect(script).toMatch(/supabase secrets set --env-file/);
  });

  test('never edits or deletes webhooks on the shared account, and refuses duplicates', () => {
    expect(script).not.toMatch(/(PATCH|PUT|DELETE) \/webhooks/);
    expect(script).toMatch(/Not creating a duplicate/);
    expect(script).toContain('https://${PROJECT_REF}.supabase.co');
    expect(script).toContain('PROJECT_REF="upxojfcdtmqtcvgbjsym"');
  });

  test('tests the three Resend sandbox addresses from an indigenousrising.ai sender', () => {
    expect(script).toContain('TEST_TO=("delivered@resend.dev" "bounced@resend.dev" "complained@resend.dev")');
    expect(script).toMatch(/FROM="Indigenous Rising AI <help@\$\{DOMAIN\}>"/);
  });
});
