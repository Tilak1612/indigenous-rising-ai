import { AI_MATCHING_DISCLOSURE, AI_MATCHING_FIELDS, daysUntil, formatAmount, formatDeadline, humanize, runMatching } from './funding';

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

describe('humanize', () => {
  test('snake_case enum to sentence case', () => expect(humanize('loan_guarantee')).toBe('Loan guarantee'));
  test('single word', () => expect(humanize('grant')).toBe('Grant'));
  test('empty', () => expect(humanize(null)).toBe(''));
});

describe('quota responses never put purchase copy in the app', () => {
  beforeEach(() => callFunction.mockReset());

  // The exact body match-funding-opportunities returns when a free plan runs
  // out (HTTP 429 with quota_exceeded): its `error` text and `upgrade_url`
  // are written for the website.
  const serverQuotaBody = {
    error: 'You have used your 3 free matches this month. Upgrade to Ogichidaakwe for more.',
    quota_exceeded: true,
    upgrade_url: '/pricing',
    tier: 'free',
  };

  test('429 + quota_exceeded is quota, not rate limiting, and shows neutral copy', async () => {
    callFunction.mockResolvedValue({ status: 429, data: serverQuotaBody });
    const out = await runMatching();
    expect(out).toEqual({ kind: 'quota-exceeded', message: 'You have used all your AI matches for this month.' });
  });

  test('neither the upgrade text nor the upgrade URL reaches the outcome', async () => {
    callFunction.mockResolvedValue({ status: 429, data: serverQuotaBody });
    const text = JSON.stringify(await runMatching());
    expect(text).not.toMatch(/upgrade|pricing|ogichidaakwe/i);
  });
});

describe('AI matching disclosure matches what the edge function sends', () => {
  test('lists exactly the profileSummary fields', () => {
    // Read the function source rather than restating its fields, so a field
    // added there without updating the disclosure fails here.
    // No @types/node in this package, so type the two Node APIs used here.
    const { readFileSync } = jest.requireActual('fs') as { readFileSync: (p: string, enc: 'utf8') => string };
    const libDir = (expect.getState().testPath as string).replace(/[\\/][^\\/]+$/, '');
    const src = readFileSync(`${libDir}/../../../supabase/functions/match-funding-opportunities/index.ts`, 'utf8');
    const block = src.match(/const profileSummary = \{([\s\S]*?)\};/);
    expect(block).not.toBeNull();
    const keys = [...(block as RegExpMatchArray)[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]);
    expect(keys).toEqual(['territory', 'industry', 'business_stage', 'description', 'funding_purpose', 'target_funding_amount_cad']);
    // description and funding_purpose are the profile's free-text fields, sent as written.
    expect(block?.[1]).toMatch(/description: profile\.business_description,/);
    expect(block?.[1]).toMatch(/funding_purpose: profile\.funding_purpose,/);
    expect(AI_MATCHING_FIELDS).toEqual([
      'Territory',
      'Industry',
      'Business stage',
      'Business description',
      'Funding purpose',
      'Target funding amount',
    ]);
    expect(src).toMatch(/fetch\('https:\/\/api\.openai\.com\/v1\/chat\/completions'/);
    expect(AI_MATCHING_DISCLOSURE).toMatch(/territory, industry, business stage, business description, funding purpose and target funding amount/);
    expect(AI_MATCHING_DISCLOSURE).toMatch(/api\.openai\.com/);
    expect(AI_MATCHING_DISCLOSURE).toMatch(/sent exactly as you wrote them/);
    expect(AI_MATCHING_DISCLOSURE).toMatch(/do not put names, contact details or other private identifiers in them/);
    // No unverified guarantees: no region claim, no redaction claim, no blanket "never sent".
    expect(AI_MATCHING_DISCLOSURE).not.toMatch(/United States|U\.S\.|redact|anonymi|never sent/i);
    expect(AI_MATCHING_DISCLOSURE).toMatch(/we have not confirmed where/);
  });
});
