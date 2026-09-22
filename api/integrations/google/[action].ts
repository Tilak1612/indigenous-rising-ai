/**
 * Google Calendar integration: Vercel Function (Web-standard handler).
 * Routes: /api/integrations/google/{start|callback|finalize|status|disconnect|events}
 *
 * Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (server-only),
 *      VITE_SUPABASE_URL (or SUPABASE_URL), and the Supabase anon/publishable key.
 *
 * Tokens never reach the browser in plaintext. They are AES-256-GCM encrypted
 * with a key derived from GOOGLE_CLIENT_SECRET and stored in
 * public.google_calendar_connections under RLS (owner-only), written with the
 * signed-in user's own Supabase JWT. No service-role key is needed.
 * If GOOGLE_CLIENT_SECRET is rotated, users simply reconnect.
 */
import crypto from "node:crypto";

const APP_NAME = "Indigenous Rising";
const SETTINGS_PATH = "/dashboard/settings";
const CALLBACK_PATH = "/api/integrations/google/callback";
const SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.app.created",
];
const TABLE = "google_calendar_connections";
const NONCE_COOKIE = "gcal_oauth_nonce";
const PENDING_COOKIE = "gcal_oauth_pending";

// ---------- env ----------
function env() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const missing = Object.entries({ GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, SUPABASE_URL: supabaseUrl, SUPABASE_ANON_KEY: supabaseKey })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { clientId, clientSecret, supabaseUrl, supabaseKey, missing };
}

// ---------- helpers ----------
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string) {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}
function keyFrom(secret: string, purpose: string) {
  return crypto.createHash("sha256").update(`gcal-v1:${purpose}:${secret}`).digest();
}
function sign(payload: object, secret: string) {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const mac = b64url(crypto.createHmac("sha256", keyFrom(secret, "state")).update(body).digest());
  return `${body}.${mac}`;
}
function verify<T>(token: string, secret: string): T | null {
  const [body, mac] = (token || "").split(".");
  if (!body || !mac) return null;
  const expected = b64url(crypto.createHmac("sha256", keyFrom(secret, "state")).update(body).digest());
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(fromB64url(body).toString("utf8")) as T;
  } catch {
    return null;
  }
}
function encrypt(plain: string, secret: string) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", keyFrom(secret, "tokens"), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return `v1.${b64url(iv)}.${b64url(c.getAuthTag())}.${b64url(enc)}`;
}
function decrypt(blob: string, secret: string) {
  const [v, iv, tag, enc] = (blob || "").split(".");
  if (v !== "v1") throw new Error("bad_ciphertext");
  const d = crypto.createDecipheriv("aes-256-gcm", keyFrom(secret, "tokens"), fromB64url(iv));
  d.setAuthTag(fromB64url(tag));
  return Buffer.concat([d.update(fromB64url(enc)), d.final()]).toString("utf8");
}
function cookies(req: Request) {
  const out: Record<string, string> = {};
  (req.headers.get("cookie") || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function setCookie(name: string, value: string, maxAge: number, secure: boolean) {
  return `${name}=${encodeURIComponent(value)}; Path=/api/integrations/google; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
function origin(req: Request) {
  const u = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || u.host;
  const proto = req.headers.get("x-forwarded-proto") || u.protocol.replace(":", "");
  return `${proto}://${host}`;
}
function bearer(req: Request) {
  const h = req.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
}

// ---------- supabase (as the signed-in user) ----------
async function getUser(jwt: string, e: ReturnType<typeof env>) {
  if (!jwt) return null;
  const r = await fetch(`${e.supabaseUrl}/auth/v1/user`, { headers: { apikey: e.supabaseKey!, authorization: `Bearer ${jwt}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.id ? { id: u.id as string } : null;
}
function rest(e: ReturnType<typeof env>, jwt: string) {
  const base = `${e.supabaseUrl}/rest/v1/${TABLE}`;
  const headers = { apikey: e.supabaseKey!, authorization: `Bearer ${jwt}`, "content-type": "application/json" };
  return {
    async get(userId: string) {
      const r = await fetch(`${base}?user_id=eq.${userId}&select=*`, { headers });
      if (!r.ok) throw new Error(`db_read_${r.status}`);
      const rows = await r.json();
      return rows[0] || null;
    },
    async upsert(row: Record<string, unknown>) {
      const r = await fetch(`${base}?on_conflict=user_id`, {
        method: "POST",
        headers: { ...headers, prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(row),
      });
      if (!r.ok) throw new Error(`db_write_${r.status}: ${await r.text()}`);
    },
    async remove(userId: string) {
      const r = await fetch(`${base}?user_id=eq.${userId}`, { method: "DELETE", headers });
      if (!r.ok) throw new Error(`db_delete_${r.status}`);
    },
  };
}

// ---------- google ----------
async function tokenRequest(params: Record<string, string>) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data.error || `token_${r.status}`);
    (err as any).code = data.error;
    throw err;
  }
  return data as { access_token: string; expires_in: number; refresh_token?: string; scope?: string; id_token?: string };
}
async function googleEmail(accessToken: string) {
  const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${accessToken}` } });
  if (!r.ok) return null;
  return ((await r.json()).email as string) || null;
}
async function ensureCalendar(accessToken: string, existingId?: string | null) {
  if (existingId) {
    const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(existingId)}`, { headers: { authorization: `Bearer ${accessToken}` } });
    if (r.ok) return existingId;
  }
  const r = await fetch("https://www.googleapis.com/calendar/v3/calendars", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ summary: APP_NAME, description: `Events created by ${APP_NAME}` }),
  });
  if (!r.ok) throw new Error(`calendar_create_${r.status}: ${await r.text()}`);
  return (await r.json()).id as string;
}

/** Returns a valid access token for the user's stored connection, refreshing if needed. */
async function accessTokenFor(row: any, e: ReturnType<typeof env>, db: ReturnType<typeof rest>) {
  const tokens = JSON.parse(decrypt(row.encrypted_tokens, e.clientSecret!));
  if (tokens.access_token && tokens.expires_at && tokens.expires_at - 60_000 > Date.now()) return tokens.access_token as string;
  try {
    const t = await tokenRequest({
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
      client_id: e.clientId!,
      client_secret: e.clientSecret!,
    });
    const next = { ...tokens, access_token: t.access_token, expires_at: Date.now() + t.expires_in * 1000 };
    await db.upsert({ user_id: row.user_id, encrypted_tokens: encrypt(JSON.stringify(next), e.clientSecret!), status: "connected", updated_at: new Date().toISOString() });
    return t.access_token;
  } catch (err: any) {
    if (err.code === "invalid_grant") {
      await db.upsert({ user_id: row.user_id, status: "disconnected", updated_at: new Date().toISOString() });
      const e2 = new Error("reconnect_required");
      (e2 as any).status = 409;
      throw e2;
    }
    throw err;
  }
}

// ---------- actions ----------
async function start(req: Request) {
  const e = env();
  if (e.missing.length) return json({ error: "not_configured", missing: e.missing }, 503);
  const user = await getUser(bearer(req), e);
  if (!user) return json({ error: "unauthorized" }, 401);
  const nonce = b64url(crypto.randomBytes(16));
  const state = sign({ uid: user.id, nonce, exp: Date.now() + 10 * 60_000 }, e.clientSecret!);
  const redirectUri = origin(req) + CALLBACK_PATH;
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: e.clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  }).toString();
  const secure = redirectUri.startsWith("https://");
  return json({ url: url.toString() }, 200, { "set-cookie": setCookie(NONCE_COOKIE, nonce, 600, secure) });
}

async function callback(req: Request) {
  const e = env();
  const back = (status: string) => {
    const secure = origin(req).startsWith("https://");
    const headers = new Headers({ location: `${SETTINGS_PATH}?google=${status}`, "cache-control": "no-store" });
    headers.append("set-cookie", setCookie(NONCE_COOKIE, "", 0, secure));
    return { headers, secure };
  };
  if (e.missing.length) {
    const { headers } = back("not_configured");
    return new Response(null, { status: 302, headers });
  }
  const u = new URL(req.url);
  if (u.searchParams.get("error")) {
    const { headers } = back("denied");
    return new Response(null, { status: 302, headers });
  }
  const st = verify<{ uid: string; nonce: string; exp: number }>(u.searchParams.get("state") || "", e.clientSecret!);
  const cookieNonce = cookies(req)[NONCE_COOKIE];
  if (!st || st.exp < Date.now() || !cookieNonce || cookieNonce !== st.nonce) {
    const { headers } = back("invalid_state");
    return new Response(null, { status: 302, headers });
  }
  try {
    const t = await tokenRequest({
      grant_type: "authorization_code",
      code: u.searchParams.get("code") || "",
      client_id: e.clientId!,
      client_secret: e.clientSecret!,
      redirect_uri: origin(req) + CALLBACK_PATH,
    });
    const pending = encrypt(
      JSON.stringify({
        uid: st.uid,
        exp: Date.now() + 10 * 60_000,
        tokens: { access_token: t.access_token, refresh_token: t.refresh_token, expires_at: Date.now() + t.expires_in * 1000, scope: t.scope },
      }),
      e.clientSecret!,
    );
    const { headers, secure } = back("finish");
    headers.append("set-cookie", setCookie(PENDING_COOKIE, pending, 600, secure));
    return new Response(null, { status: 302, headers });
  } catch {
    const { headers } = back("token_error");
    return new Response(null, { status: 302, headers });
  }
}

async function finalize(req: Request) {
  const e = env();
  if (e.missing.length) return json({ error: "not_configured", missing: e.missing }, 503);
  const jwt = bearer(req);
  const user = await getUser(jwt, e);
  if (!user) return json({ error: "unauthorized" }, 401);
  const secure = origin(req).startsWith("https://");
  const clear = setCookie(PENDING_COOKIE, "", 0, secure);
  const raw = cookies(req)[PENDING_COOKIE];
  if (!raw) return json({ error: "nothing_pending" }, 400, { "set-cookie": clear });
  let pending: any;
  try {
    pending = JSON.parse(decrypt(raw, e.clientSecret!));
  } catch {
    return json({ error: "invalid_pending" }, 400, { "set-cookie": clear });
  }
  if (pending.uid !== user.id || pending.exp < Date.now()) return json({ error: "invalid_pending" }, 400, { "set-cookie": clear });

  const db = rest(e, jwt);
  const existing = await db.get(user.id).catch(() => null);
  let tokens = pending.tokens;
  // Google only returns refresh_token on first consent; keep the previous one if absent.
  if (!tokens.refresh_token && existing?.encrypted_tokens) {
    try {
      tokens = { ...tokens, refresh_token: JSON.parse(decrypt(existing.encrypted_tokens, e.clientSecret!)).refresh_token };
    } catch {
      /* ignore */
    }
  }
  if (!tokens.refresh_token) return json({ error: "no_refresh_token" }, 400, { "set-cookie": clear });

  const email = await googleEmail(tokens.access_token);
  const calendarId = await ensureCalendar(tokens.access_token, existing?.calendar_id);
  await db.upsert({
    user_id: user.id,
    google_email: email,
    calendar_id: calendarId,
    scope: tokens.scope || SCOPES.join(" "),
    encrypted_tokens: encrypt(JSON.stringify(tokens), e.clientSecret!),
    status: "connected",
    updated_at: new Date().toISOString(),
  });
  return json({ connected: true, email, calendarId }, 200, { "set-cookie": clear });
}

async function status(req: Request) {
  const e = env();
  if (e.missing.length) return json({ configured: false, connected: false, missing: e.missing });
  const jwt = bearer(req);
  const user = await getUser(jwt, e);
  if (!user) return json({ error: "unauthorized" }, 401);
  const row = await rest(e, jwt).get(user.id);
  return json({
    configured: true,
    connected: row?.status === "connected",
    email: row?.google_email || null,
    calendarId: row?.calendar_id || null,
    needsReconnect: row?.status === "disconnected",
  });
}

async function disconnect(req: Request) {
  const e = env();
  if (e.missing.length) return json({ error: "not_configured" }, 503);
  const jwt = bearer(req);
  const user = await getUser(jwt, e);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = rest(e, jwt);
  const row = await db.get(user.id);
  if (row?.encrypted_tokens) {
    try {
      const t = JSON.parse(decrypt(row.encrypted_tokens, e.clientSecret!));
      const token = t.refresh_token || t.access_token;
      if (token) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" });
    } catch {
      /* best effort */
    }
  }
  await db.remove(user.id);
  return json({ connected: false });
}

/** POST {summary, description?, start, end, timeZone?}: creates an event in the app-owned calendar. */
async function events(req: Request) {
  const e = env();
  if (e.missing.length) return json({ error: "not_configured" }, 503);
  const jwt = bearer(req);
  const user = await getUser(jwt, e);
  if (!user) return json({ error: "unauthorized" }, 401);
  const db = rest(e, jwt);
  const row = await db.get(user.id);
  if (!row || row.status !== "connected") return json({ error: "not_connected" }, 409);
  const body = await req.json().catch(() => ({}));
  if (!body.summary || !body.start || !body.end) return json({ error: "summary, start and end are required" }, 400);
  try {
    const at = await accessTokenFor(row, e, db);
    const tz = body.timeZone || "America/Vancouver";
    const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(row.calendar_id)}/events`, {
      method: "POST",
      headers: { authorization: `Bearer ${at}`, "content-type": "application/json" },
      body: JSON.stringify({
        summary: String(body.summary).slice(0, 300),
        description: body.description ? String(body.description).slice(0, 8000) : undefined,
        start: { dateTime: body.start, timeZone: tz },
        end: { dateTime: body.end, timeZone: tz },
      }),
    });
    const data = await r.json();
    if (!r.ok) return json({ error: "google_error", detail: data?.error?.message }, 502);
    return json({ id: data.id, htmlLink: data.htmlLink });
  } catch (err: any) {
    return json({ error: err.message || "failed" }, err.status || 500);
  }
}

// ---------- router ----------
function action(req: Request) {
  return new URL(req.url).pathname.replace(/\/+$/, "").split("/").pop();
}
async function safe(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (err: any) {
    console.error("[google-calendar]", err?.message);
    return json({ error: "internal_error" }, 500);
  }
}

export async function GET(req: Request) {
  const a = action(req);
  if (a === "callback") return safe(() => callback(req));
  if (a === "status") return safe(() => status(req));
  return json({ error: "not_found" }, 404);
}

export async function POST(req: Request) {
  const a = action(req);
  if (a === "start") return safe(() => start(req));
  if (a === "finalize") return safe(() => finalize(req));
  if (a === "disconnect") return safe(() => disconnect(req));
  if (a === "events") return safe(() => events(req));
  return json({ error: "not_found" }, 404);
}
