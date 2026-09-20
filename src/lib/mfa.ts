import { supabase } from '@/lib/supabase';

/**
 * Two-factor challenge at sign-in.
 *
 * Settings can enrol a TOTP factor (TwoFactorSettings), but nothing ever asked
 * for a code when signing in: the session stayed at aal1 and the factor
 * protected nothing. Supabase issues an aal1 session on password sign-in and
 * only raises it to aal2 after a challenge, so the check belongs on every path
 * that creates a session — password and OAuth alike.
 */
export interface MfaRequirement {
  required: boolean;
  factorId?: string;
}

export async function mfaRequirement(): Promise<MfaRequirement> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) return { required: false };
    if (data.nextLevel !== 'aal2' || data.nextLevel === data.currentLevel) return { required: false };

    const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
    if (factorError) return { required: false };
    // listFactors() returns verified factors in `totp`.
    const factor = factors?.totp?.[0];
    if (!factor) return { required: false };
    return { required: true, factorId: factor.id };
  } catch {
    // Never lock someone out because the check itself failed.
    return { required: false };
  }
}

export async function verifyMfaCode(factorId: string, code: string): Promise<{ error: string | null }> {
  const clean = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return { error: 'Enter the 6-digit code from your authenticator app.' };
  try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: clean });
    if (error) {
      return { error: /invalid|incorrect/i.test(error.message) ? 'That code was not accepted. Codes expire every 30 seconds — try the current one.' : error.message };
    }
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not verify that code.' };
  }
}
