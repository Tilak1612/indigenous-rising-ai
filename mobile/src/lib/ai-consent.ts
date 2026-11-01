import AsyncStorage from '@react-native-async-storage/async-storage';

import { runMatching, type MatchOutcome } from './funding';

/**
 * Consent for AI matching, asked in the app before the first request and
 * again whenever AI_CONSENT_VERSION changes (bump it when the fields, provider
 * or wording in AI_MATCHING_DISCLOSURE change).
 *
 * Stored on this device, per account. Earlier use of matching (on the web or
 * in an older build) is not treated as consent: with no stored decision for
 * this version, the answer is "not asked".
 *
 * This gates the app only. The match-funding-opportunities function does not
 * check it, and the website has its own flow.
 */
export const AI_CONSENT_VERSION = '2026-11-01';

export type AiConsent = 'granted' | 'declined' | null;

const key = (userId: string) => `ira.aiMatchingConsent.${userId}`;

export async function getAiConsent(userId: string): Promise<AiConsent> {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    if (!raw) return null;
    const v = JSON.parse(raw) as { version?: string; decision?: string };
    if (v.version !== AI_CONSENT_VERSION) return null;
    return v.decision === 'granted' || v.decision === 'declined' ? v.decision : null;
  } catch {
    return null;
  }
}

async function record(userId: string, decision: 'granted' | 'declined') {
  await AsyncStorage.setItem(key(userId), JSON.stringify({ version: AI_CONSENT_VERSION, decision, at: new Date().toISOString() }));
}

export type MatchingStep = MatchOutcome | { kind: 'consent-required' } | { kind: 'declined' };

/** "Find my matches": runs only with a granted decision for this version. */
export async function findMatches(userId: string): Promise<MatchingStep> {
  const consent = await getAiConsent(userId);
  if (consent === 'declined') return { kind: 'declined' };
  if (consent !== 'granted') return { kind: 'consent-required' };
  return runMatching();
}

export async function allowAndFindMatches(userId: string): Promise<MatchingStep> {
  if (!userId) return { kind: 'consent-required' };
  await record(userId, 'granted');
  return runMatching();
}

export async function declineAiMatching(userId: string): Promise<MatchingStep> {
  if (userId) await record(userId, 'declined');
  return { kind: 'declined' };
}

/** Withdraws a decision: the next "Find my matches" asks again. */
export async function resetAiConsent(userId: string): Promise<void> {
  if (userId) await AsyncStorage.removeItem(key(userId));
}
