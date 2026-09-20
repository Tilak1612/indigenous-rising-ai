import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  PASSWORD_MIN_LENGTH, PASSWORD_RULES, passwordMeetsPolicy, describeServerPasswordError,
} from '@/lib/password-policy';

/**
 * Probed against this project's live auth endpoint with a 1-character password
 * (no configuration can accept one), which returned:
 *
 *   code 422, error_code "weak_password"
 *   "Password should be at least 8 characters. Password should contain at
 *    least one character of each: abcdefghijklmnopqrstuvwxyz,
 *    ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=[]{};':\"|<>?,./`~.
 *    Password is known to be weak and easy to guess, please choose a
 *    different one."
 *    reasons: ["length", "characters", ...]
 *
 * So the server requires length + lowercase + uppercase + digit + symbol, and
 * leaked-password protection is on. The client asked for 8 characters and
 * nothing else.
 */
const SERVER_ERROR = 'Password should be at least 8 characters. Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=[]{};\':"|<>?,./`~.';

describe('the client policy is the server policy', () => {
  test('minimum length matches what the server said', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(SERVER_ERROR).toContain(`at least ${PASSWORD_MIN_LENGTH} characters`);
  });

  test('every character class the server demands is checked here', () => {
    const ids = PASSWORD_RULES.map((r) => r.id);
    for (const id of ['length', 'lower', 'upper', 'digit', 'symbol']) expect(ids).toContain(id);
  });

  test.each([
    ['password', false, 'lowercase only — the old rule let this through'],
    ['password1', false, 'no uppercase, no symbol'],
    ['Password1', false, 'no symbol'],
    ['Pass1!', false, 'too short'],
    ['Password1!', true, 'meets every rule'],
    ['Nib3n-wa-Miigwech!', true, 'a long passphrase with a symbol'],
  ])('%s -> %s (%s)', (value, ok) => {
    expect(passwordMeetsPolicy(value)).toBe(ok);
  });

  test('the sign-up form validates with this policy, not a bare length', () => {
    const src = readFileSync('src/pages/Auth.tsx', 'utf8');
    const schema = /const signupSchema = z\.object\(\{[\s\S]*?\}\)/.exec(src)?.[0] ?? '';
    expect(schema).toMatch(/refine\(passwordMeetsPolicy/);
    expect(schema).not.toMatch(/password: z\.string\(\)\.min\(8/);
  });

  test('the requirements are shown before submitting, not after', () => {
    const src = readFileSync('src/pages/Auth.tsx', 'utf8');
    expect(src).toMatch(/PASSWORD_RULES\.map/);
    expect(src).toMatch(/aria-label="Password requirements"/);
    expect(src, 'the old understated helper text is back').not.toMatch(/Password must be at least 8 characters long/);
  });
});

describe('server rejections are readable', () => {
  test('the raw character-class dump becomes one sentence', () => {
    const out = describeServerPasswordError(SERVER_ERROR);
    expect(out).toMatch(/at least 8 characters/);
    expect(out).toMatch(/lowercase letter, an uppercase letter, a number and a symbol/);
    expect(out).not.toContain('abcdefghijklmnopqrstuvwxyz');
  });

  test('a breached password says exactly that — it is not a rules problem', () => {
    // Supabase leaked-password protection is enabled on this project.
    const out = describeServerPasswordError(`${SERVER_ERROR} Password is known to be weak and easy to guess, please choose a different one.`);
    expect(out).toMatch(/appeared in a known data breach/i);
  });

  test('unrelated errors pass through untouched', () => {
    expect(describeServerPasswordError('Email rate limit exceeded')).toBe('Email rate limit exceeded');
  });
});
