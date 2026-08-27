/**
 * An in-memory stand-in for the PostgREST endpoints the readiness
 * workspace uses.
 *
 * This enforces the real CHECK constraints and the real UNIQUE
 * (user_id, grant_id). That matters: a plain vi.fn() mock accepts any
 * payload, which is precisely how a status value that Postgres rejects
 * shipped to production and broke the Funding page's Save button. A test
 * double that accepts everything can only prove the code ran, never that
 * the database would have taken it.
 */

export const STAGE_VALUES = [
  'match', 'eligibility', 'documents', 'missing_info',
  'draft', 'tasks', 'submission', 'submitted',
];
export const ITEM_STATE_VALUES = ['met', 'unmet', 'unknown'];
export const ITEM_KIND_VALUES = ['eligibility', 'missing_info', 'submission'];

type Row = Record<string, unknown>;

export type FakeDb = {
  funding_applications: Row[];
  funding_readiness_items: Row[];
  grants: Row[];
  documents: Row[];
};

export const emptyDb = (): FakeDb => ({
  funding_applications: [],
  funding_readiness_items: [],
  grants: [],
  documents: [],
});

class CheckViolation extends Error {}

const assertStage = (v: unknown) => {
  if (v !== undefined && !STAGE_VALUES.includes(String(v))) {
    throw new CheckViolation(`funding_applications_stage_check: ${String(v)}`);
  }
};
const assertItem = (r: Row) => {
  if (r.state !== undefined && !ITEM_STATE_VALUES.includes(String(r.state))) {
    throw new CheckViolation(`funding_readiness_items_state_check: ${String(r.state)}`);
  }
  if (r.kind !== undefined && !ITEM_KIND_VALUES.includes(String(r.kind))) {
    throw new CheckViolation(`funding_readiness_items_kind_check: ${String(r.kind)}`);
  }
};

let seq = 0;
const nextId = (p: string) => `${p}-${++seq}`;
export const resetIds = () => { seq = 0; };

/** Parses the subset of PostgREST filter syntax the app actually sends. */
const matches = (row: Row, params: URLSearchParams): boolean => {
  for (const [key, raw] of params) {
    if (['select', 'order', 'on_conflict'].includes(key)) continue;
    if (raw.startsWith('eq.')) {
      if (String(row[key]) !== raw.slice(3)) return false;
    } else if (raw.startsWith('in.')) {
      const set = raw.slice(3).replace(/^\(|\)$/g, '').split(',');
      if (!set.includes(String(row[key]))) return false;
    }
  }
  return true;
};

/**
 * Installs a fetch stand-in over the given database. Returns a counter of
 * requests by method so a test can assert, for example, that opening a
 * second workspace issued no document upload.
 */
export const installFakeRest = (db: FakeDb) => {
  const calls: { method: string; url: string; body?: unknown }[] = [];

  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input), 'https://example.test');
    const table = url.pathname.split('/rest/v1/')[1]?.split('?')[0] ?? '';
    const method = (init?.method ?? 'GET').toUpperCase();
    const params = url.searchParams;
    const body = init?.body ? JSON.parse(String(init.body)) as Row : undefined;
    calls.push({ method, url: url.toString(), body });

    // 204 must carry a null body: `new Response(body, {status:204})`
    // throws "Response with null body status cannot have body", which a
    // caller sees as a failed request rather than a successful write.
    const ok = (payload: unknown, status = 200) =>
      status === 204
        ? new Response(null, { status })
        : new Response(JSON.stringify(payload), {
            status, headers: { 'Content-Type': 'application/json' },
          });

    const rows = db[table as keyof FakeDb];
    if (!rows) return new Response('no such table', { status: 404 });

    try {
      if (method === 'GET') {
        return ok(rows.filter((r) => matches(r, params)));
      }

      if (method === 'POST') {
        const prefer = String((init?.headers as Record<string, string> | undefined)?.Prefer ?? '');
        if (table === 'funding_applications') {
          assertStage(body?.stage);
          // UNIQUE (user_id, grant_id) — merge-duplicates must return the
          // SAME row, which is what makes leave-and-resume work.
          const existing = rows.find(
            (r) => r.user_id === body?.user_id && r.grant_id === body?.grant_id,
          );
          if (existing) {
            if (!prefer.includes('merge-duplicates')) {
              return new Response('duplicate key', { status: 409 });
            }
            return ok([existing], 200);
          }
          const created: Row = {
            id: nextId('app'), stage: 'match', grant_application_id: null,
            updated_at: new Date(0).toISOString(), ...body,
          };
          rows.push(created);
          return ok([created], 201);
        }
        if (table === 'funding_readiness_items') {
          assertItem(body ?? {});
          const created: Row = {
            id: nextId('item'), state: 'unknown', document_id: null,
            note: null, position: 0, ...body,
          };
          rows.push(created);
          return ok([created], 201);
        }
        return ok([body], 201);
      }

      if (method === 'PATCH') {
        if (table === 'funding_applications') assertStage(body?.stage);
        if (table === 'funding_readiness_items') assertItem(body ?? {});
        let n = 0;
        for (const r of rows) {
          if (matches(r, params)) { Object.assign(r, body); n++; }
        }
        return n ? ok([], 204) : ok([], 200);
      }

      if (method === 'DELETE') {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (matches(rows[i], params)) rows.splice(i, 1);
        }
        return ok([], 204);
      }
    } catch (err) {
      if (err instanceof CheckViolation) {
        // Shape mirrors a real PostgREST constraint rejection.
        return new Response(
          JSON.stringify({ code: '23514', message: err.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
      throw err;
    }
    return new Response('unsupported', { status: 405 });
  };

  return { fetchImpl, calls };
};
