import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * The chatbot is called "Ask Agent".
 *
 * The name lives in two places that must agree: the widget's labels, and the
 * edge function's system prompt, which is what the bot says when someone
 * asks who it is. Renaming only the UI would leave it introducing itself by
 * the old name — the label and the answer would contradict each other.
 *
 * "Indigenous Rising AI" is the PRODUCT and is deliberately untouched.
 */
const widget = readFileSync('src/components/marketing/SiteAssistant.tsx', 'utf8');
const fn = readFileSync('supabase/functions/site-assistant/index.ts', 'utf8');

// Matches the old agent name but never the product name it is a suffix of.
const bareOldName = /(?<!Indigenous )Rising AI/g;

describe('the chatbot is named Ask Agent', () => {
  test('the launcher shows and announces the new name', () => {
    expect(widget).toContain('>Ask Agent</span>');
    expect(widget).toMatch(/aria-label="Ask Agent about Indigenous Rising AI"/);
  });

  test('the open panel is titled and labelled Ask Agent', () => {
    expect(widget).toMatch(/aria-label="Ask Agent"/);
    expect(widget).toMatch(/>Ask Agent<\/p>/);
  });

  test('the widget carries no trace of the old agent name', () => {
    expect(widget.match(bareOldName) ?? []).toEqual([]);
  });

  test('the product name still appears, for context', () => {
    // The launcher's accessible name says what the agent is about; stripping
    // the product would leave a screen reader with a bare "Ask Agent".
    expect(widget).toContain('Indigenous Rising AI');
  });

  test('the bot introduces itself by the same name', () => {
    // Otherwise the button says one thing and the answer says another.
    expect(fn).toMatch(/You are "Ask Agent"/);
    expect(fn.match(bareOldName) ?? []).toEqual([]);
  });

  test('the internal message role is untouched', () => {
    // role: 'assistant' is the transcript schema, not a display name.
    expect(widget).toMatch(/role: 'user' \| 'assistant'/);
    expect(widget).toMatch(/role: 'assistant'/);
  });
});
