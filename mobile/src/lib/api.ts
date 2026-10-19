import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from './supabase';

const DEFAULT_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
  }
}

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Call a Supabase Edge Function with the signed-in user's token and return the
 * parsed JSON body for any status. The web app bypasses supabase-js here too:
 * the matcher returns meaningful bodies on 402/429 (quota, rate limit) and the
 * SDK hides those behind an opaque error.
 */
export async function callFunction<T>(
  name: string,
  body: Record<string, unknown> = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ status: number; data: T }> {
  const token = await accessToken();
  if (!token) throw new ApiError('Not signed in', 401, null);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      throw new ApiError(`Unreadable response (HTTP ${res.status})`, res.status, null);
    }
    return { status: res.status, data };
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('Request timed out', 0, null);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** PostgREST request with the user's token. Used where the web app uses it too. */
export async function rest<T>(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const token = (await accessToken()) ?? SUPABASE_ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: init.method ?? 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* no body */
    }
    throw new ApiError(`HTTP ${res.status}`, res.status, body);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
