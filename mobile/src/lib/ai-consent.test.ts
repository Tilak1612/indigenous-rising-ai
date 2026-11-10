/**
 * The AI-matching consent gate. callFunction is the only path to the edge
 * function that calls OpenAI, so "no AI request" is checked as "callFunction
 * was never called". AsyncStorage is the package's own in-memory Jest mock.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AI_CONSENT_VERSION, allowAndFindMatches, declineAiMatching, findMatches, getAiConsent, resetAiConsent } from './ai-consent';
import { fetchGrants, fetchSavedMatches, setSaved } from './funding';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('./api', () => ({ callFunction: jest.fn() }));
jest.mock('./supabase', () => {
  // Minimal chain for the catalogue and saved-programme reads and writes.
  const result = { data: [], error: null };
  const chain: Record<string, unknown> = {};
  for (const op of ['select', 'eq', 'order', 'upsert', 'delete']) chain[op] = () => chain;
  chain.then = (ok: (r: unknown) => unknown) => Promise.resolve(result).then(ok);
  return { supabase: { from: jest.fn(() => chain) } };
});

const { callFunction } = jest.requireMock('./api') as { callFunction: jest.Mock };
const { supabase } = jest.requireMock('./supabase') as { supabase: { from: jest.Mock } };

const RESULTS = { status: 200, data: { matches: [], tier: 'free', matches_remaining_this_month: 2 } };

beforeEach(async () => {
  await AsyncStorage.clear();
  callFunction.mockReset();
  callFunction.mockResolvedValue(RESULTS);
  supabase.from.mockClear();
});

describe('before any decision', () => {
  test('Find my matches asks first and sends nothing', async () => {
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'consent-required' });
    expect(callFunction).not.toHaveBeenCalled();
  });

  test('earlier use is not consent: an unversioned or old-version record asks again', async () => {
    await AsyncStorage.setItem('ira.aiMatchingConsent.u1', JSON.stringify({ decision: 'granted' }));
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'consent-required' });
    await AsyncStorage.setItem('ira.aiMatchingConsent.u1', JSON.stringify({ version: '2020-01-01', decision: 'granted' }));
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'consent-required' });
    await AsyncStorage.setItem('ira.aiMatchingConsent.u1', 'not json');
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'consent-required' });
    expect(callFunction).not.toHaveBeenCalled();
  });

  test('no signed-in user: nothing is recorded or sent', async () => {
    await expect(allowAndFindMatches('')).resolves.toEqual({ kind: 'consent-required' });
    await expect(getAiConsent('')).resolves.toBeNull();
    expect(callFunction).not.toHaveBeenCalled();
  });
});

describe('decline', () => {
  test('records the decision and sends nothing, then or later', async () => {
    await expect(declineAiMatching('u1')).resolves.toEqual({ kind: 'declined' });
    await expect(getAiConsent('u1')).resolves.toBe('declined');
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'declined' });
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'declined' });
    expect(callFunction).not.toHaveBeenCalled();
  });

  test('is per account', async () => {
    await declineAiMatching('u1');
    await expect(getAiConsent('u2')).resolves.toBeNull();
  });
});

describe('allow', () => {
  test('records the decision and sends exactly one match request', async () => {
    await expect(allowAndFindMatches('u1')).resolves.toEqual({ kind: 'results', data: RESULTS.data });
    expect(callFunction).toHaveBeenCalledTimes(1);
    // runMatching posts no body of its own: the function reads the profile
    // server-side and sends the six profileSummary fields (funding.test.ts).
    expect(callFunction).toHaveBeenCalledWith('match-funding-opportunities');
    const stored = JSON.parse((await AsyncStorage.getItem('ira.aiMatchingConsent.u1')) as string);
    expect(stored).toMatchObject({ version: AI_CONSENT_VERSION, decision: 'granted' });
  });

  test('later runs go straight through, one request each', async () => {
    await allowAndFindMatches('u1');
    await findMatches('u1');
    await findMatches('u1');
    expect(callFunction).toHaveBeenCalledTimes(3);
  });

  test('withdrawing asks again before the next request', async () => {
    await allowAndFindMatches('u1');
    await resetAiConsent('u1');
    await expect(findMatches('u1')).resolves.toEqual({ kind: 'consent-required' });
    expect(callFunction).toHaveBeenCalledTimes(1);
  });

  test('changing a decline to allow sends only after allow', async () => {
    await declineAiMatching('u1');
    await findMatches('u1');
    expect(callFunction).not.toHaveBeenCalled();
    await allowAndFindMatches('u1');
    expect(callFunction).toHaveBeenCalledTimes(1);
  });
});

describe('browsing does not depend on AI consent', () => {
  test('catalogue, saved programmes and save/unsave work after a decline, with no AI request', async () => {
    await declineAiMatching('u1');
    await expect(fetchGrants()).resolves.toEqual([]);
    await expect(fetchSavedMatches()).resolves.toEqual([]);
    await expect(setSaved('u1', 'g1', true)).resolves.toBeUndefined();
    await expect(setSaved('u1', 'g1', false)).resolves.toBeUndefined();
    expect(supabase.from.mock.calls.map((c) => c[0])).toEqual([
      'grants',
      'funding_saved_matches',
      'funding_saved_matches',
      'funding_saved_matches',
    ]);
    expect(callFunction).not.toHaveBeenCalled();
  });
});
