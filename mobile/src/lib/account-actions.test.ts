/**
 * Account actions against a recording fake of supabase-js. Nothing here talks
 * to a network: every query is captured and answered from the test, so these
 * check what the app asks for, never what the real database does.
 */
import { cancelAccountDeletion, exportMyData, fetchSubscription, getDeletionRequest, requestAccountDeletion } from './account';
import { exportFileName, shareDataExport } from './data-export';

type Call = { table: string; ops: [string, ...unknown[]][] };
type Result = { data: unknown; error: { message: string } | null };

const mockCalls: Call[] = [];
let mockAnswer: (c: Call) => Result = () => ({ data: null, error: null });

function mockBuilder(table: string) {
  const call: Call = { table, ops: [] };
  mockCalls.push(call);
  const settle = () => Promise.resolve(mockAnswer(call));
  const b: Record<string, unknown> = {};
  for (const op of ['select', 'insert', 'delete', 'upsert', 'eq', 'order', 'limit']) {
    b[op] = (...args: unknown[]) => {
      call.ops.push([op, ...args]);
      return b;
    };
  }
  for (const op of ['single', 'maybeSingle']) {
    b[op] = () => {
      call.ops.push([op]);
      return settle();
    };
  }
  b.then = (ok: (r: Result) => unknown, bad: (e: unknown) => unknown) => settle().then(ok, bad);
  return b;
}

jest.mock('./supabase', () => ({ supabase: { from: (t: string) => mockBuilder(t) } }));
jest.mock('./api', () => ({ callFunction: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => {
  const written: { uri: string; contents: string }[] = [];
  class File {
    uri: string;
    constructor(dir: { uri: string }, name: string) {
      this.uri = `${dir.uri}/${name}`;
    }
    write(contents: string) {
      written.push({ uri: this.uri, contents });
    }
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } }, __written: written };
});

const { callFunction } = jest.requireMock('./api') as { callFunction: jest.Mock };
const Sharing = jest.requireMock('expo-sharing') as { isAvailableAsync: jest.Mock; shareAsync: jest.Mock };
const fs = jest.requireMock('expo-file-system') as { __written: { uri: string; contents: string }[] };

beforeEach(() => {
  mockCalls.length = 0;
  fs.__written.length = 0;
  mockAnswer = () => ({ data: null, error: null });
  callFunction.mockReset();
  Sharing.isAvailableAsync.mockReset();
  Sharing.shareAsync.mockReset();
});

describe('account deletion: schedule, read, cancel', () => {
  test('scheduling inserts only the user and source; the 30-day date comes from the database', async () => {
    mockAnswer = () => ({ data: { requested_at: '2026-11-01T00:00:00Z', scheduled_for: '2026-12-01T00:00:00Z' }, error: null });
    const r = await requestAccountDeletion('u1');
    expect(r.scheduled_for).toBe('2026-12-01T00:00:00Z');
    expect(mockCalls).toEqual([
      {
        table: 'account_deletion_requests',
        ops: [['insert', { user_id: 'u1', source: 'app' }], ['select', 'requested_at,scheduled_for'], ['single']],
      },
    ]);
  });

  test('scheduling never touches auth, profiles or any purge path', async () => {
    mockAnswer = () => ({ data: { requested_at: 'x', scheduled_for: 'y' }, error: null });
    await requestAccountDeletion('u1');
    expect(mockCalls.map((c) => c.table)).toEqual(['account_deletion_requests']);
    expect(mockCalls[0].ops.map((o) => o[0])).not.toContain('delete');
  });

  test('a refused insert (for example a second request) surfaces the error', async () => {
    mockAnswer = () => ({ data: null, error: { message: 'duplicate key value' } });
    await expect(requestAccountDeletion('u1')).rejects.toThrow('duplicate key value');
  });

  test('reading the pending request is scoped to the user', async () => {
    mockAnswer = () => ({ data: null, error: null });
    await expect(getDeletionRequest('u1')).resolves.toBeNull();
    expect(mockCalls[0]).toEqual({
      table: 'account_deletion_requests',
      ops: [['select', 'requested_at,scheduled_for'], ['eq', 'user_id', 'u1'], ['maybeSingle']],
    });
  });

  test('cancelling deletes only the request row for this user', async () => {
    await cancelAccountDeletion('u1');
    expect(mockCalls).toEqual([{ table: 'account_deletion_requests', ops: [['delete'], ['eq', 'user_id', 'u1']] }]);
  });

  test('a failed cancel surfaces the error', async () => {
    mockAnswer = () => ({ data: null, error: { message: 'permission denied' } });
    await expect(cancelAccountDeletion('u1')).rejects.toThrow('permission denied');
  });
});

describe('subscription status is read-only', () => {
  test('reads check-subscription and the subscriptions row; writes nothing', async () => {
    callFunction.mockResolvedValue({ status: 200, data: { subscribed: true } });
    mockAnswer = () => ({
      data: { plan_name: 'Ogichidaakwe', status: 'active', current_period_end: '2026-12-01', cancel_at_period_end: false },
      error: null,
    });
    await expect(fetchSubscription()).resolves.toEqual({
      subscribed: true,
      plan_name: 'Ogichidaakwe',
      status: 'active',
      current_period_end: '2026-12-01',
      cancel_at_period_end: false,
    });
    expect(callFunction).toHaveBeenCalledTimes(1);
    expect(callFunction.mock.calls[0][0]).toBe('check-subscription');
    const opNames = mockCalls.flatMap((c) => c.ops.map((o) => o[0]));
    for (const write of ['insert', 'upsert', 'delete']) expect(opNames).not.toContain(write);
  });

  test('an unreachable function means free, as on the web', async () => {
    callFunction.mockRejectedValue(new Error('offline'));
    mockAnswer = () => ({ data: null, error: null });
    await expect(fetchSubscription()).resolves.toMatchObject({ subscribed: false, plan_name: null });
  });
});

describe('data export', () => {
  const rows = (c: Call): Result => {
    if (c.table === 'profiles') return { data: { id: 'u1', full_name: 'Test' }, error: null };
    if (c.table === 'business_plans') return { data: [{ id: 'p1' }], error: null };
    if (c.table === 'funding_saved_matches') return { data: [{ id: 's1' }], error: null };
    return { data: null, error: null };
  };

  test('exports the profile, plans and saved funding, each scoped to the user', async () => {
    mockAnswer = rows;
    const doc = JSON.parse(await exportMyData('u1'));
    expect(doc.profile).toEqual({ id: 'u1', full_name: 'Test' });
    expect(doc.business_plans).toEqual([{ id: 'p1' }]);
    expect(doc.saved_funding).toEqual([{ id: 's1' }]);
    expect(mockCalls.map((c) => [c.table, c.ops.find((o) => o[0] === 'eq')])).toEqual([
      ['profiles', ['eq', 'id', 'u1']],
      ['business_plans', ['eq', 'user_id', 'u1']],
      ['funding_saved_matches', ['eq', 'user_id', 'u1']],
    ]);
  });

  test('writes the file to the cache and opens the share sheet', async () => {
    mockAnswer = rows;
    Sharing.isAvailableAsync.mockResolvedValue(true);
    const now = new Date('2026-11-01T12:00:00Z');
    const r = await shareDataExport('u1', now);
    expect(r).toEqual({ kind: 'shared', uri: 'file:///cache/indigenous-rising-export-2026-11-01.json' });
    expect(fs.__written).toHaveLength(1);
    expect(JSON.parse(fs.__written[0].contents).profile.id).toBe('u1');
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///cache/indigenous-rising-export-2026-11-01.json', {
      mimeType: 'application/json',
      dialogTitle: 'Export my data',
    });
  });

  test('no share sheet: the file is written but nothing is shared', async () => {
    mockAnswer = rows;
    Sharing.isAvailableAsync.mockResolvedValue(false);
    const r = await shareDataExport('u1', new Date('2026-11-01T12:00:00Z'));
    expect(r.kind).toBe('unavailable');
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  test('file name is dated', () => expect(exportFileName(new Date('2027-01-05T23:00:00Z'))).toBe('indigenous-rising-export-2027-01-05.json'));
});
