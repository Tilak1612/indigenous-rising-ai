// ============================================================================
// Indigenous Rising AI · check-funding-freshness   (NEW — NOT DEPLOYED)
// ============================================================================
// Daily internal alert. Counts published programmes that no funding email may
// use, because they are unverified or past the verification window.
//
// This is the other half of the gate. The gate stops bad data going out; this
// tells the team that it is stopping things, so "no alerts went out" is never
// mistaken for "there was nothing to send".
//
// Sends Resend template 52 · Internal · Funding data needs verification.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const WINDOW = Number(Deno.env.get("FUNDING_VERIFICATION_WINDOW_DAYS") ?? "90");

serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || (req.headers.get("Authorization") || "") !== `Bearer ${cronSecret}`)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const internalTo = Deno.env.get("INTERNAL_ALERT_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!internalTo || !resendKey)
    return new Response(JSON.stringify({ error: "not configured" }), { status: 503 });

  // Allow-list: an internal alert must never be addressable at an outside domain.
  if (!/@indigenousrising\.ai$/i.test(internalTo))
    return new Response(JSON.stringify({ error: "internal alias must be @indigenousrising.ai" }), { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } });

  const { data: rows } = await supabase
    .from("grants").select("id,last_verified,verification_status").eq("is_published", true);

  const all = rows ?? [];
  const cutoff = new Date(Date.now() - WINDOW * 86_400_000).toISOString().slice(0, 10);
  const neverVerified = all.filter((g: any) => !g.last_verified).length;
  const stale = all.filter((g: any) =>
    !g.last_verified || g.last_verified < cutoff || g.verification_status !== "verified").length;
  const dates = all.map((g: any) => g.last_verified).filter(Boolean).sort();

  if (stale === 0)
    return new Response(JSON.stringify({ ok: true, stale: 0 }), { status: 200 });

  const today = new Date().toISOString().slice(0, 10);
  const key = `internal-funding-stale:${today}`;   // one alert per day, whatever the retry count

  const { error: insErr } = await supabase.from("email_log").insert({
    idempotency_key: key, template_key: "internal-funding-stale",
    recipient_hash: "internal", status: "queued",
  });
  if (insErr) {
    if (insErr.code === "23505")
      return new Response(JSON.stringify({ ok: true, note: "already alerted today" }), { status: 200 });
    throw insErr;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json",
               "Idempotency-Key": key },
    body: JSON.stringify({
      from: "Indigenous Rising AI <help@indigenousrising.ai>",
      to: [internalTo],
      template: {
        alias: "52-internal-funding-data-needs-verification",
        variables: {
          published_total: String(all.length),
          stale_count: String(stale),
          never_verified_count: String(neverVerified),
          oldest_verified_date: dates[0] ?? "never",
          verification_window_days: String(WINDOW),
          internal_console_url:
            "https://supabase.com/dashboard/project/upxojfcdtmqtcvgbjsym/editor",
        },
      },
    }),
  });

  await supabase.from("email_log")
    .update({ status: res.ok ? "sent" : "failed", sent_at: new Date().toISOString() })
    .eq("idempotency_key", key);

  return new Response(JSON.stringify({ ok: res.ok, published: all.length, stale, neverVerified }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
