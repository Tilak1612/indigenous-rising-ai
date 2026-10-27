// ============================================================================
// Indigenous Rising AI · check-funding-links
// ============================================================================
// Weekly link-health check for the funding catalogue. For every PUBLISHED
// programme it fetches the source page and, when different, the apply page,
// records the result in funding_link_checks, and:
//
//   * a DEAD link (HTTP 404/410, or a DNS failure) flips the row to
//     verification_status = 'needs_review', opens a review-queue item and
//     writes a verification event. The public card then says a person is
//     reviewing it instead of sending someone to a 404.
//   * a BLOCKED response (403, 429, 503, a timeout) is recorded and NOT acted
//     on. Government sites and Cloudflare fronts block automated requests;
//     that is not evidence the programme is gone. docs/FUNDING_SOURCE_HEALTH.md
//     explains the verdicts.
//   * a passed deadline on a row still marked 'open' sets intake_status to
//     'closed' (a date is a fact) and opens a review item so a person can
//     look for the next intake.
//
// It never marks anything 'verified' and never publishes or unpublishes a
// row: both stay human decisions. One request per URL, 1.5 s apart, a
// descriptive User-Agent, GET (many hosts refuse HEAD), 15 s timeout, at most
// 80 URLs per run. Authorised by the same CRON_SECRET as the other scheduled
// functions.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const UA = "IndigenousRisingLinkCheck/1.0 (+https://www.indigenousrising.ai/funding; help@indigenousrising.ai)";
const MAX_URLS = Number(Deno.env.get("FUNDING_LINK_CHECK_MAX") ?? "80");
const DELAY_MS = 1500;
const TIMEOUT_MS = 15_000;

type Verdict = "ok" | "redirected" | "dead" | "blocked" | "error";

interface GrantRow {
  id: string; slug: string; name: string; source_url: string | null; apply_url: string | null;
  application_url: string; verification_status: string; intake_status: string; deadline: string | null;
}

async function checkUrl(url: string): Promise<{ status: number | null; finalUrl: string | null; verdict: Verdict; error: string | null }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html,*/*" }, signal: ac.signal });
    // Read and discard a little of the body so the connection closes cleanly.
    try { await res.body?.cancel(); } catch { /* ignore */ }
    const status = res.status;
    const finalUrl = res.url && res.url !== url ? res.url : null;
    if (status === 404 || status === 410) return { status, finalUrl, verdict: "dead", error: null };
    if (status === 403 || status === 429 || status === 503 || status === 401) return { status, finalUrl, verdict: "blocked", error: null };
    if (status >= 200 && status < 400) return { status, finalUrl, verdict: finalUrl ? "redirected" : "ok", error: null };
    return { status, finalUrl, verdict: "error", error: `HTTP ${status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (ac.signal.aborted) return { status: null, finalUrl: null, verdict: "blocked", error: "timeout" };
    const dns = /dns|failed to lookup|name or service not known|nodename nor servname|ENOTFOUND/i.test(msg);
    return { status: null, finalUrl: null, verdict: dns ? "dead" : "error", error: msg.slice(0, 300) };
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || (req.headers.get("Authorization") || "") !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data: rows, error } = await supabase
    .from("grants")
    .select("id,slug,name,source_url,apply_url,application_url,verification_status,intake_status,deadline")
    .eq("is_published", true)
    .order("updated_at", { ascending: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const summary = { checked: 0, ok: 0, redirected: 0, dead: 0, blocked: 0, error: 0, flagged: 0, closed: 0 };
  let budget = MAX_URLS;

  for (const g of (rows ?? []) as GrantRow[]) {
    // Deadline integrity does not need the network.
    if (g.deadline && g.deadline < today && g.intake_status === "open") {
      await supabase.from("grants").update({ intake_status: "closed" }).eq("id", g.id);
      await supabase.from("funding_review_queue").insert({ grant_id: g.id, reason: "deadline_passed", severity: "medium", payload: { deadline: g.deadline } });
      await supabase.from("funding_verification_events").insert({ grant_id: g.id, event_type: "status_changed", summary: `Deadline ${g.deadline} passed; intake set to closed by the link checker`, details: { deadline: g.deadline } });
      summary.closed++;
    }

    const targets: Array<{ kind: "source" | "apply"; url: string }> = [];
    const source = g.source_url || g.application_url;
    if (source) targets.push({ kind: "source", url: source });
    if (g.apply_url && g.apply_url !== source) targets.push({ kind: "apply", url: g.apply_url });

    let deadKinds: string[] = [];
    for (const t of targets) {
      if (budget-- <= 0) break;
      const r = await checkUrl(t.url);
      summary.checked++;
      summary[r.verdict]++;
      await supabase.from("funding_link_checks").insert({
        grant_id: g.id, kind: t.kind, url: t.url, status_code: r.status, final_url: r.finalUrl,
        ok: r.verdict === "ok" || r.verdict === "redirected", verdict: r.verdict, error: r.error,
      });
      if (r.verdict === "dead") deadKinds.push(t.kind);
      await sleep(DELAY_MS);
    }

    if (deadKinds.length && g.verification_status !== "needs_review" && g.verification_status !== "retired") {
      await supabase.from("grants").update({ verification_status: "needs_review" }).eq("id", g.id);
      await supabase.from("funding_review_queue").insert({ grant_id: g.id, reason: "dead_link", severity: "high", payload: { kinds: deadKinds } });
      await supabase.from("funding_verification_events").insert({ grant_id: g.id, event_type: "automated_link_check", summary: `Dead ${deadKinds.join(" and ")} link found by the weekly check; status set to needs_review`, details: { kinds: deadKinds } });
      summary.flagged++;
    }
    if (budget <= 0) break;
  }

  return new Response(JSON.stringify({ ok: true, date: today, ...summary }), { status: 200, headers: { "Content-Type": "application/json" } });
});
