/**
 * The password rules this project's Supabase auth actually enforces.
 *
 * Probed against the live endpoint (a 1-character password, which no
 * configuration can accept):
 *
 *   "Password should be at least 8 characters. Password should contain at
 *    least one character of each: abc…, ABC…, 0123456789, !@#$%…
 *    Password is known to be weak and easy to guess…"
 *
 * The client asked only for 8 characters and told people "at least 8
 * characters long", so a password like "password1" passed validation here and
 * was then rejected by the server with that raw string. These rules are the
 * same list, stated up front.
 *
 * The final sentence of that error is Supabase's leaked-password protection
 * (HaveIBeenPwned) — enabled on this project, and deliberately NOT reproduced
 * here: only the server can decide it.
 */
export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (v) => v.length >= PASSWORD_MIN_LENGTH },
  { id: 'lower', label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'upper', label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'digit', label: 'A number', test: (v) => /[0-9]/.test(v) },
  { id: 'symbol', label: 'A symbol (! ? @ # $ …)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function unmetPasswordRules(value: string): PasswordRule[] {
  return PASSWORD_RULES.filter((r) => !r.test(value));
}

export function passwordMeetsPolicy(value: string): boolean {
  return unmetPasswordRules(value).length === 0;
}

/**
 * Turn GoTrue's raw weak_password string into something a person can act on.
 * Its own wording lists every character class inline, which reads as noise.
 */
export function describeServerPasswordError(message: string): string {
  if (!/weak|password should be/i.test(message)) return message;
  if (/known to be weak|pwned|breach/i.test(message)) {
    return 'That password has appeared in a known data breach. Please choose a different one.';
  }
  return `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a lowercase letter, an uppercase letter, a number and a symbol.`;
}
