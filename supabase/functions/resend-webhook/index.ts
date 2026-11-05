// resend-webhook: receives Resend delivery events (Svix-signed) for
// indigenousrising.ai.
//
// For each verified event from an @indigenousrising.ai sender:
//   * one row in public.resend_email_events, keyed by svix-id, so a retried
//     delivery of the same message is recorded once and its effects run once;
//   * the matching public.email_log row (by resend_id) moves forward to the
//     reported status, never backwards;
//   * permanent bounces, complaints and Resend-side suppressions add the
//     recipient to public.email_suppressions, which send-funding-digest checks.
//
// Recipients are stored only as recipient_hash. The payload kept is an
// allow-listed subset with no addresses, subject or bounce message.
//
// verify_jwt = false (supabase/config.toml): Resend cannot send a Supabase JWT;
// the Svix signature, checked against RESEND_WEBHOOK_SECRET, authenticates it.
// Resend webhooks are account-wide, so mail from other domains is ignored.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Webhook } from "npm:svix@1.42.0";

import {
  classifyResendEvent,
  logErrorFor,
  recipientHash,
  statusesBefore,
  type ResendWebhookEvent,
} from "../_shared/resend-events.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const log = (event: string, fields: Record<string, unknown> = {}) => console.log(JSON.stringify({ event, ...fields }));

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!secret) {
    log("resend_webhook_misconfigured", { reason: "RESEND_WEBHOOK_SECRET not set" });
    return new Response("not configured", { status: 500 });
  }

  const raw = await req.text();
  const svixId = req.headers.get("svix-id") ?? "";
  let evt: ResendWebhookEvent;
  try {
    evt = new Webhook(secret).verify(raw, {
      "svix-id": svixId,
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    }) as ResendWebhookEvent;
  } catch {
    return new Response("invalid signature", { status: 401 });
  }

  const c = classifyResendEvent(evt);
  if (c.kind === "ignore") return Response.json({ ignored: c.reason });

  const hashes = await Promise.all(c.recipients.map(recipientHash));

  // Idempotent on the Svix message id: Resend retries deliver the same id.
  // An already-seen id returns no row, and its side effects are skipped.
  const { data: inserted, error } = await supabase
    .from("resend_email_events")
    .upsert(
      {
        svix_id: svixId,
        event_type: c.eventType,
        resend_email_id: c.emailId,
        from_domain: c.fromDomain,
        recipient_hashes: hashes,
        bounce_type: c.bounceType,
        bounce_subtype: c.bounceSubtype,
        failed_reason: c.failedReason,
        suppressed_type: c.suppressedType,
        payload: {
          type: evt.type ?? null,
          created_at: evt.created_at ?? null,
          email_id: c.emailId,
          tags: evt.data?.tags ?? null,
        },
        occurred_at: evt.created_at ?? null,
      },
      { onConflict: "svix_id", ignoreDuplicates: true },
    )
    .select("svix_id");
  if (error) {
    log("resend_event_insert_failed", { svix_id: svixId, error: error.message });
    return new Response("db error", { status: 500 }); // non-2xx makes Resend retry
  }
  if (!inserted || inserted.length === 0) {
    log("resend_event_duplicate", { svix_id: svixId, type: c.eventType });
    return Response.json({ ok: true, duplicate: true });
  }

  if (c.logStatus && c.emailId) {
    const from = statusesBefore(c.logStatus);
    const { error: logErr } = await supabase
      .from("email_log")
      .update({ status: c.logStatus, error: logErrorFor(c) })
      .eq("resend_id", c.emailId)
      .in("status", from);
    if (logErr) log("email_log_update_failed", { svix_id: svixId, error: logErr.message });
  }

  let suppressed = 0;
  if (c.suppress) {
    for (const h of hashes) {
      const { error: supErr } = await supabase.from("email_suppressions").upsert(
        { recipient_hash: h, reason: c.suppress, source: `resend_webhook:${c.eventType}:${svixId}` },
        { onConflict: "recipient_hash", ignoreDuplicates: true },
      );
      if (supErr) {
        log("suppression_insert_failed", { svix_id: svixId, error: supErr.message });
        // The event row exists, so a retry would be skipped as a duplicate.
        // Remove it so Resend's retry runs the suppression again.
        await supabase.from("resend_email_events").delete().eq("svix_id", svixId);
        return new Response("db error", { status: 500 });
      }
      suppressed++;
    }
  }

  log("resend_event_recorded", { svix_id: svixId, type: c.eventType, suppressed });
  return Response.json({ ok: true, suppressed });
});
