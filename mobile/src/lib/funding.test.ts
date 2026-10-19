import { daysUntil, formatAmount, formatDeadline, runMatching } from './funding';

jest.mock('./api', () => ({ callFunction: jest.fn() }));
jest.mock('./supabase', () => ({ supabase: {} }));

const { callFunction } = jest.requireMock('./api') as { callFunction: jest.Mock };

describe('formatAmount', () => {
  test('range', () => expect(formatAmount(5000, 25000)).toBe('$5,000 – $25,000'));
  test('single value', () => expect(formatAmount(null, 99999)).toBe('Up to $99,999'));
  test('equal min and max is not a range', () => expect(formatAmount(1000, 1000)).toBe('Up to $1,000'));
  test('unknown', () => expect(formatAmount(null, null)).toBe('Amount varies'));
});

describe('formatDeadline', () => {
  test('parses the date as local, not UTC (no off-by-one)', () => {
    expect(formatDeadline('2026-03-31')).toBe('Mar 31, 2026');
  });
  test('rolling intake when recurring and no date', () => expect(formatDeadline(null, true)).toBe('Rolling intake'));
  test('no fixed deadline otherwise', () => expect(formatDeadline(null, false)).toBe('No fixed deadline'));
});

describe('daysUntil', () => {
  test('null for no deadline', () => expect(daysUntil(null)).toBeNull());
  test('today is 0', () => {
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    expect(daysUntil(iso)).toBe(0);
  });
});

describe('runMatching maps the edge function response to an outcome', () => {
  beforeEach(() => callFunction.mockReset());

  test('results', async () => {
    callFunction.mockResolvedValue({ status: 200, data: { matches: [], tier: 'free', matches_remaining_this_month: 2 } });
    expect((await runMatching()).kind).toBe('results');
  });

  test('profile incomplete wins over status', async () => {
    callFunction.mockResolvedValue({ status: 400, data: { matches: [], missing_fields: ['province'] } });
    expect(await runMatching()).toEqual({ kind: 'profile-incomplete', missing: ['province'] });
  });

  test('402 is quota exceeded', async () => {
    callFunction.mockResolvedValue({ status: 402, data: { matches: [], quota_exceeded: true, message: 'Used up' } });
    expect(await runMatching()).toEqual({ kind: 'quota-exceeded', message: 'Used up' });
  });

  test('429 is rate limited', async () => {
    callFunction.mockResolvedValue({ status: 429, data: { matches: [], rate_limited: true } });
    expect((await runMatching()).kind).toBe('rate-limited');
  });

  test('other errors surface the message', async () => {
    callFunction.mockResolvedValue({ status: 500, data: { matches: [], error: 'boom' } });
    expect(await runMatching()).toEqual({ kind: 'error', message: 'boom' });
  });
});
