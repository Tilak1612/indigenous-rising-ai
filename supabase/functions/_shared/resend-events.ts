// supabase/functions/_shared/resend-events.ts
//
// Pure helpers for the resend-webhook function. No Deno APIs and no network,
// so src/__tests__/resend-webhook.test.ts imports this file directly.
//
// Privacy: Indigenous Rising stores recipients only as recipient_hash, the
// same unsalted SHA-256 of trim().toLowerCase() that send-funding-digest
// writes to email_log and checks in email_suppressions. Nothing here returns
// a raw address, a subject, or a bounce message (which can quote the address).

/** Resend webhooks are account-wide; only mail sent from this domain is handled. */
export const SENDING_DOMAIN = "indigenousrising.ai";

/** The events the Resend endpoint is registered for. Anything else is ignored. */
export const HANDLED_EVENTS = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
  "email.suppressed",
] as const;
export type HandledEvent = (typeof HANDLED_EVENTS)[number];

/** Values allowed by the email_suppressions.reason check constraint that this webhook writes. */
export type SuppressionReason = "hard_bounce" | "complaint";

/** Values allowed by the email_log.status check constraint. */
export type EmailLogStatus = "queued" | "sent" | "delivered" | "bounced" | "complained" | "failed" | "suppressed";

/** "Name <a@b.com>" or "a@b.com" → "a@b.com", trimmed and lower-cased. */
export function emailAddressOf(value: string): string {
  return (value.match(/<([^>]+)>/)?.[1] ?? value).trim().toLowerCase();
}

export async function recipientHash(email: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(emailAddressOf(email)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type ResendWebhookEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string | string[];
    subject?: string;
    tags?: unknown;
    bounce?: { type?: string; subType?: string; message?: string };
    failed?: { reason?: string };
    suppressed?: { type?: string; message?: string };
  };
};

export type ClassifiedEvent =
  | { kind: "ignore"; reason: "other_domain" | "unhandled_event" }
  | {
      kind: "record";
      eventType: HandledEvent;
      emailId: string | null;
      fromDomain: string;
      recipients: string[];
      bounceType: string | null;
      bounceSubtype: string | null;
      failedReason: string | null;
      suppressedType: string | null;
      /** Set when the recipients must never be emailed again. */
      suppress: SuppressionReason | null;
      /** Status to move the matching email_log row to, if any. */
      logStatus: EmailLogStatus | null;
    };

/**
 * Decide what a verified Resend event means for Indigenous Rising.
 *
 * email.bounced carries bounce.type "Permanent" or "Temporary"; only Permanent
 * (or no type, which Resend's event definition treats as permanent) suppresses.
 * email.suppressed means Resend refused to send because the address is already
 * on its suppression list; its suppressed.type says whether that came from a
 * bounce or a complaint, and the local list mirrors it.
 */
export function classifyResendEvent(evt: ResendWebhookEvent, domain = SENDING_DOMAIN): ClassifiedEvent {
  const d = evt.data ?? {};
  const from = emailAddressOf(String(d.from ?? ""));
  if (!from.endsWith(`@${domain}`)) return { kind: "ignore", reason: "other_domain" };

  const type = String(evt.type ?? "");
  if (!(HANDLED_EVENTS as readonly string[]).includes(type)) return { kind: "ignore", reason: "unhandled_event" };
  const eventType = type as HandledEvent;

  const recipients = (Array.isArray(d.to) ? d.to : [d.to])
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map(emailAddressOf);
  const bounceType = d.bounce?.type ?? null;
  const permanentBounce = eventType === "email.bounced" && (bounceType ?? "Permanent") === "Permanent";
  const suppressedType = d.suppressed?.type ?? null;

  let suppress: SuppressionReason | null = null;
  if (eventType === "email.complained") suppress = "complaint";
  else if (permanentBounce) suppress = "hard_bounce";
  else if (eventType === "email.suppressed") suppress = suppressedType?.toLowerCase() === "complaint" ? "complaint" : "hard_bounce";

  const logStatus: EmailLogStatus | null =
    eventType === "email.sent" ? "sent"
    : eventType === "email.delivered" ? "delivered"
    : eventType === "email.bounced" ? (permanentBounce ? "bounced" : null)
    : eventType === "email.complained" ? "complained"
    : eventType === "email.failed" ? "failed"
    : eventType === "email.suppressed" ? "suppressed"
    : null; // delivery_delayed is not a terminal state and has no email_log status

  return {
    kind: "record",
    eventType,
    emailId: d.email_id ?? null,
    fromDomain: domain,
    recipients,
    bounceType,
    bounceSubtype: d.bounce?.subType ?? null,
    failedReason: d.failed?.reason ?? null,
    suppressedType,
    suppress,
    logStatus,
  };
}

/**
 * The email_log statuses a row may move from when the webhook reports `next`.
 * Webhooks can arrive out of order (delivered before sent, sent after a
 * bounce), so a status only moves forward: queued → sent → delivered →
 * a terminal outcome. A complaint can follow delivery; nothing overwrites a
 * terminal outcome.
 */
export function statusesBefore(next: EmailLogStatus): EmailLogStatus[] {
  switch (next) {
    case "sent": return ["queued"];
    case "delivered": return ["queued", "sent"];
    case "bounced": return ["queued", "sent", "delivered"]; // a bounce can arrive after delivery
    case "failed":
    case "suppressed": return ["queued", "sent"];
    case "complained": return ["queued", "sent", "delivered"];
    default: return [];
  }
}

/** Short, address-free reason for email_log.error. */
export function logErrorFor(c: Extract<ClassifiedEvent, { kind: "record" }>): string | null {
  if (c.eventType === "email.bounced") return `bounce:${c.bounceType ?? "Permanent"}${c.bounceSubtype ? `/${c.bounceSubtype}` : ""}`;
  if (c.eventType === "email.failed") return `failed:${(c.failedReason ?? "unknown").slice(0, 200)}`;
  if (c.eventType === "email.suppressed") return `provider_suppressed:${c.suppressedType ?? "unknown"}`;
  if (c.eventType === "email.complained") return "complaint";
  return null;
}
