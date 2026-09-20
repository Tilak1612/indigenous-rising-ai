import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * What the site claims about data leaving Canada must match what the code does.
 *
 * Verified 2026-09-20. Storage really is Canadian: the Supabase project is
 * ca-central-1 (database, storage, backups). But the FAQ said we "never
 * transfer data outside Canada without explicit consent", while the platform
 * calls api.openai.com (funding matching), api.resend.com and api.hubapi.com
 * (email), Stripe (payments) and Google Analytics — all outside Canada.
 */
const faq = readFileSync('src/components/FAQSection.tsx', 'utf8');
const assistant = readFileSync('supabase/functions/site-assistant/index.ts', 'utf8');

describe('the residency claim is accurate', () => {
  test('no absolute "never leaves Canada" promise', () => {
    for (const [name, src] of [['FAQ', faq], ['site assistant', assistant]] as const) {
      expect(src, `${name} promises data never leaves Canada`).not.toMatch(/never transfer data outside Canada/i);
      expect(src, `${name} claims storage AND processing are exclusively Canadian`)
        .not.toMatch(/All data is stored exclusively on Canadian servers/i);
    }
  });

  test('storage is still stated plainly — that part is true', () => {
    expect(faq).toMatch(/stored on Canadian servers/i);
    expect(assistant).toMatch(/stored on Canadian servers/i);
  });

  test('the processing that happens elsewhere is named, not hidden', () => {
    for (const [name, src] of [['FAQ', faq], ['site assistant', assistant]] as const) {
      expect(src, `${name} does not mention processing outside Canada`).toMatch(/outside Canada/i);
      expect(src, `${name} does not name the AI provider`).toMatch(/OpenAI/);
    }
  });

  test('and the limit on it is stated: no identity, community, name or contacts', () => {
    for (const src of [faq, assistant]) {
      expect(src).toMatch(/identity, community, name and contact details are never sent/i);
    }
  });
});
