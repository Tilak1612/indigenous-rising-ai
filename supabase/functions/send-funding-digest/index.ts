// ============================================================================
// Indigenous Rising AI · send-funding-digest
// PROPOSED REPLACEMENT — NOT DEPLOYED
// ============================================================================
//
// WHAT CHANGES, AND WHY
// ---------------------
// The live version selects grants like this:
//
//     .eq('is_published', true)
//     .or(`deadline.gte.${today},is_recurring.eq.true`)
//
// It never looks at last_verified. Right now 16 of 17 published grants have
// never been verified and the 17th was verified 138 days ago, and every one of
// them is is_recurring = true — so all 17 pass, and all 17 are being emailed
// weekly with amounts and apply links.
//
// This version reads from public.sendable_grants, which is verified-only. With
// today's data that returns zero rows and the digest sends nothing. That is the
// correct behaviour: no email is better than a stale funding amount that sends
// someone to a programme that has changed or closed.
//
// Also changed:
//   * HTML-escapes grant fields (the live version interpolates name, funder and
//     description straight into the template).
//   * Shows each programme's last-verified date, so the reader can judge it.
//   * Links to source_url — the provider's own page — not just a form deep link.
//   * Writes an idempotency-keyed row to email_log before sending.
//   * Checks email_suppressions.
//   * Refuses to send to real addresses outside production.
//   * Uses a real mailing address for CASL, not a territorial acknowledgement.
//     A land acknowledgement may still belong in the email — that is a decision
//     for the Indigenous Rising team and its reviewers, not a substitute for the
//     postal address CASL requires.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const VERIFICATION_WINDOW_DAYS = Number(Deno.env.get("FUNDING_VERIFICATION_WINDOW_DAYS") ?? "90");

interface Grant {
  id: string; name: string; funder: string; description: string;
  amount_min: number | null; amount_max: number | null; amount_currency: string;
  deadline: string | null; is_recurring: boolean; recurrence_notes: string | null;
  provinces: string[]; industries: string[];
  source_url: string; application_url: string; last_verified: string;
}
interface Subscriber {
  id: string; email: string; provinces: string[]; industries: string[];
  unsubscribe_token: string;
}

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

async function sha256Hex(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s.trim().toLowerCase()));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

const fmtAmount = (g: Grant) => {
  if (!g.amount_min && !g.amount_max) return "Amount varies";
  const f = (n: number) => "$" + n.toLocaleString("en-CA");
  if (g.amount_min && g.amount_max && g.amount_min !== g.amount_max)
    return `${f(g.amount_min)} – ${f(g.amount_max)} ${g.amount_currency}`;
  return `Up to ${f(g.amount_max ?? g.amount_min ?? 0)} ${g.amount_currency}`;
};

const fmtDeadline = (g: Grant) => {
  if (g.is_recurring && !g.deadline) return esc(g.recurrence_notes || "Rolling intake");
  if (!g.deadline) return "No closing date listed";
  const d = new Date(g.deadline);
  const left = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  const s = d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  if (left < 0) return s;
  if (left === 0) return `${s} — closes today`;
  if (left === 1) return `${s} — 1 day left`;
  return `${s} — ${left} days left`;
};

// Brand: cream ground, deep green, ochre and terracotta from the mark.
const GREEN = "#135038", CREAM = "#F9F2E6", INK = "#1A2A22", MUTED = "#5A6B60",
      HAIR = "#E3D9C6", SURFACE = "#F4EBDB", AMBER = "#DF9319", TERRA = "#D95026";

function buildHtml(sub: Subscriber, grants: Grant[], address: string) {
  const unsub = `https://www.indigenousrising.ai/funding/unsubscribe?token=${encodeURIComponent(sub.unsubscribe_token)}`;
  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  const blocks = grants.map((g) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
<tr><td bgcolor="${SURFACE}" style="background-color:${SURFACE};border-radius:10px;padding:20px;">
  <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:${GREEN};">${esc(g.name)}</p>
  <p style="margin:0 0 12px;font-size:13px;color:${MUTED};">${esc(g.funder)}</p>
  <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:${INK};">${esc(g.description)}</p>
  <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">Amount: <span style="color:${INK};font-weight:600;">${fmtAmount(g)}</span></p>
  <p style="margin:0 0 4px;font-size:13px;color:${MUTED};">Closes: <span style="color:${INK};font-weight:600;">${fmtDeadline(g)}</span></p>
  <p style="margin:0 0 14px;font-size:13px;color:${MUTED};">We last checked this against the provider's page on <span style="color:${INK};font-weight:600;">${esc(g.last_verified)}</span></p>
  <a href="${esc(g.source_url)}" style="display:inline-block;background:${GREEN};color:${CREAM};font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;text-decoration:none;">Read the programme details</a>
</td></tr></table>`).join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CREAM}" style="background-color:${CREAM};width:100%;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;">
<tr><td style="padding:0 4px 18px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;"><tr>
   <td width="34" height="4" bgcolor="${GREEN}" style="font-size:0;line-height:0;">&nbsp;</td>
   <td width="22" height="4" bgcolor="${AMBER}" style="font-size:0;line-height:0;">&nbsp;</td>
   <td width="14" height="4" bgcolor="${TERRA}" style="font-size:0;line-height:0;">&nbsp;</td>
   <td width="22" height="4" bgcolor="${AMBER}" style="font-size:0;line-height:0;">&nbsp;</td>
   <td width="34" height="4" bgcolor="${GREEN}" style="font-size:0;line-height:0;">&nbsp;</td>
  </tr></table>
  <p style="margin:0;font-size:17px;font-weight:700;color:${GREEN};">Indigenous Rising AI</p>
</td></tr>
<tr><td bgcolor="#FFFFFF" style="background-color:#ffffff;border:1px solid ${HAIR};border-radius:14px;padding:32px;">
  <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:${GREEN};">Funding worth a look</h1>
  <p style="margin:0 0 20px;font-size:13px;color:${MUTED};">Week of ${today}</p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:${INK};">
    Programmes matching the provinces and industries you chose. Everything here has been
    checked against the provider's own page in the last ${VERIFICATION_WINDOW_DAYS} days —
    anything we could not verify is not in this email.
  </p>
  ${blocks}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 0;">
  <tr><td bgcolor="${SURFACE}" style="background-color:${SURFACE};border-radius:8px;padding:16px 18px;">
    <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">
      Programme details can change without notice. Being listed here is not an eligibility
      decision and not a guarantee of funding. Indigenous Rising AI does not administer these
      programmes and has no part in their decisions. Confirm all requirements, amounts and
      dates with the provider before you apply.
    </p>
  </td></tr></table>
</td></tr>
<tr><td style="padding:20px 4px 0;">
  <p style="margin:0 0 8px;font-size:12px;color:${MUTED};">You are getting this because you confirmed a subscription to funding alerts at indigenousrising.ai.</p>
  <p style="margin:0 0 8px;font-size:12px;color:${MUTED};">${esc(address)}</p>
  <p style="margin:0;font-size:12px;color:${MUTED};"><a href="${unsub}" style="color:${MUTED};">Unsubscribe in one click</a></p>
</td></tr>
</table></td></tr></table>`;
}

serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) return new Response(JSON.stringify({ error: "not configured" }), { status: 503 });
  if ((req.headers.get("Authorization") || "") !== `Bearer ${cronSecret}`)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const address = Deno.env.get("COMPANY_POSTAL_ADDRESS") ?? "";
  const env = Deno.env.get("APP_ENV") ?? "development";
  if (!resendKey) return new Response(JSON.stringify({ error: "no email key" }), { status: 503 });
  if (!address) {
    // CASL requires a mailing address in every commercial message. Refuse rather
    // than send without one.
    return new Response(JSON.stringify({ error: "COMPANY_POSTAL_ADDRESS not set" }), { status: 503 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } });

  let sent = 0, skipped = 0, failed = 0, suppressed = 0;

  const sixDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString();
  const { data: subs } = await supabase
    .from("grant_alerts_subscribers")
    .select("id,email,provinces,industries,unsubscribe_token,last_digest_sent_at")
    .eq("is_active", true)                       // double opt-in already enforced here
    .is("unsubscribed_at", null)
    .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${sixDaysAgo}`);

  if (!subs?.length)
    return new Response(JSON.stringify({ sent, skipped, failed, note: "no subscribers due" }), { status: 200 });

  const isoWeek = new Date().toISOString().slice(0, 10);

  for (const sub of subs as Subscriber[]) {
    try {
      // ---- verified grants only ------------------------------------------
      const { data: grants } = await supabase
        .from("sendable_grants")                 // the view, never the table
        .select("*")
        .overlaps("provinces", sub.provinces)
        .order("last_verified", { ascending: false })
        .limit(20);

      const matched = (grants ?? []).filter((g: Grant) =>
        !g.industries?.length || g.industries.some((i) => sub.industries.includes(i))
      ).slice(0, 10);

      if (!matched.length) { skipped++; continue; }   // send nothing rather than something stale

      const recipientHash = await sha256Hex(sub.email);

      const { data: sup } = await supabase.from("email_suppressions")
        .select("reason").eq("recipient_hash", recipientHash).maybeSingle();
      if (sup) { suppressed++; continue; }

      // ---- idempotency: one digest per subscriber per week -----------------
      const key = `funding-digest:${sub.id}:${isoWeek}`;
      const { error: insErr } = await supabase.from("email_log").insert({
        idempotency_key: key, template_key: "funding-digest",
        recipient_hash: recipientHash, status: "queued",
      });
      if (insErr) { if (insErr.code === "23505") { skipped++; continue; } throw insErr; }

      let to = sub.email;
      if (env !== "production") {
        const sink = Deno.env.get("EMAIL_TEST_RECIPIENT");
        if (!sink) {
          await supabase.from("email_log").update({ status: "suppressed", error: "non_prod_no_sink" })
            .eq("idempotency_key", key);
          skipped++; continue;
        }
        to = sink;
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json",
                   "Idempotency-Key": key },
        body: JSON.stringify({
          from: "Indigenous Rising AI <funding@indigenousrising.ai>",
          reply_to: "help@indigenousrising.ai",
          to: [to],
          subject: `Funding worth a look — week of ${new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}`,
          html: buildHtml(sub, matched as Grant[], address),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        await supabase.from("email_log")
          .update({ status: "failed", error: `resend_${res.status}` }).eq("idempotency_key", key);
        failed++; continue;
      }

      await supabase.from("email_log")
        .update({ status: "sent", resend_id: body.id, sent_at: new Date().toISOString() })
        .eq("idempotency_key", key);
      await supabase.from("grant_alerts_subscribers")
        .update({ last_digest_sent_at: new Date().toISOString() }).eq("id", sub.id);
      sent++;
    } catch (_e) { failed++; }
  }

  return new Response(JSON.stringify({ sent, skipped, failed, suppressed }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
});
