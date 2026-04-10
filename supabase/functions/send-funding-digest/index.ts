import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Cron-only function. Expects Authorization: Bearer <CRON_SECRET>.
// Iterates active subscribers, builds personalised digest, sends via Resend.

interface Grant {
  id: string;
  name: string;
  funder: string;
  description: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  is_recurring: boolean;
  recurrence_notes: string | null;
  provinces: string[];
  industries: string[];
  application_url: string;
}

interface Subscriber {
  id: string;
  email: string;
  provinces: string[];
  industries: string[];
  unsubscribe_token: string;
}

function formatAmount(grant: Grant): string {
  if (!grant.amount_min && !grant.amount_max) return 'Amount varies';
  const fmt = (n: number) => '$' + n.toLocaleString('en-CA');
  if (grant.amount_min && grant.amount_max && grant.amount_min !== grant.amount_max) {
    return `${fmt(grant.amount_min)} – ${fmt(grant.amount_max)} ${grant.amount_currency}`;
  }
  return `Up to ${fmt(grant.amount_max ?? grant.amount_min ?? 0)} ${grant.amount_currency}`;
}

function formatDeadline(grant: Grant): string {
  if (grant.is_recurring && !grant.deadline) {
    return grant.recurrence_notes || 'Rolling intake';
  }
  if (!grant.deadline) return 'No deadline listed';
  const deadline = new Date(grant.deadline);
  const today = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = deadline.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  if (daysLeft < 0) return formatted;
  if (daysLeft === 0) return `${formatted} — closes today`;
  if (daysLeft === 1) return `${formatted} — 1 day left`;
  return `${formatted} — ${daysLeft} days left`;
}

function buildDigestHtml(subscriber: Subscriber, grants: Grant[]): string {
  const unsubUrl = `https://www.indigenousrising.ai/funding/unsubscribe?token=${subscriber.unsubscribe_token}`;
  const todayFormatted = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  const grantBlocks = grants.map((g) => `
    <div style="border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: #fafafa;">
      <h3 style="margin: 0 0 4px; color: #279b65; font-size: 18px;">${g.name}</h3>
      <p style="margin: 0 0 12px; color: #666; font-size: 14px;">${g.funder}</p>
      <p style="margin: 0 0 8px; font-size: 14px; line-height: 1.5; color: #333;">${g.description}</p>
      <table style="width: 100%; font-size: 13px; color: #555; margin: 12px 0;">
        <tr><td style="padding: 2px 0; width: 80px;"><strong>Amount:</strong></td><td>${formatAmount(g)}</td></tr>
        <tr><td style="padding: 2px 0;"><strong>Deadline:</strong></td><td>${formatDeadline(g)}</td></tr>
      </table>
      <a href="${g.application_url}" target="_blank" rel="noopener noreferrer"
         style="display: inline-block; background: #279b65; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Apply on funder's site →
      </a>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a; background: #f8faf9;">
  <div style="background: white; padding: 32px; border-radius: 16px;">
    <h1 style="color: #279b65; font-size: 24px; margin: 0 0 8px;">Indigenous Rising AI — Funding Alerts</h1>
    <p style="color: #666; font-size: 14px; margin: 0 0 24px;">Week of ${todayFormatted}</p>
    <p style="font-size: 16px; line-height: 1.6;">
      Here are this week's funding opportunities matching your selected provinces (<strong>${subscriber.provinces.join(', ')}</strong>)
      and industries (<strong>${subscriber.industries.join(', ')}</strong>):
    </p>
    ${grantBlocks}
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />
    <p style="font-size: 13px; color: #888; line-height: 1.5;">
      You're receiving this because you subscribed to weekly funding alerts at indigenousrising.ai.
      <br />
      <a href="${unsubUrl}" style="color: #279b65;">Unsubscribe with one click</a>
    </p>
    <p style="font-size: 12px; color: #888; line-height: 1.5; margin-top: 16px;">
      Indigenous Rising AI Business Support Platform<br />
      Traditional Territory of the Anishinaabe, Toronto, ON, Canada<br />
      help@indigenousrising.ai
    </p>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  // Auth: require shared cron secret
  const authHeader = req.headers.get('Authorization') || '';
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (!cronSecret) {
    console.error('[FUNDING-DIGEST] CRON_SECRET not configured');
    return new Response(
      JSON.stringify({ error: 'Service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    console.error('[FUNDING-DIGEST] RESEND_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Get all active subscribers, dedup window: skip if last digest sent < 6 days ago
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
    const { data: subscribers, error: subError } = await supabase
      .from('grant_alerts_subscribers')
      .select('id, email, provinces, industries, unsubscribe_token, last_digest_sent_at')
      .eq('is_active', true)
      .or(`last_digest_sent_at.is.null,last_digest_sent_at.lt.${sixDaysAgo}`);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, skipped: 0, failed: 0, message: 'No subscribers due for digest' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[FUNDING-DIGEST] Processing', subscribers.length, 'subscribers');

    const today = new Date().toISOString().split('T')[0];

    for (const sub of subscribers) {
      try {
        // Find grants matching subscriber's provinces and industries
        const { data: grants } = await supabase
          .from('grants')
          .select('*')
          .eq('is_published', true)
          .or(`deadline.gte.${today},is_recurring.eq.true`)
          .overlaps('provinces', sub.provinces)
          .order('deadline', { ascending: true, nullsFirst: false })
          .limit(20);

        // Filter for industry overlap (Postgres `&&` doesn't work cleanly via PostgREST .or chaining;
        // we filter in JS, then take top 10)
        const matched = (grants || []).filter((g: Grant) => {
          if (!g.industries || g.industries.length === 0) return true;
          return g.industries.some((i) => sub.industries.includes(i));
        }).slice(0, 10);

        if (matched.length === 0) {
          skipped++;
          continue;
        }

        const html = buildDigestHtml(sub as Subscriber, matched as Grant[]);
        const todayFormatted = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Indigenous Rising AI Funding <funding@indigenousrising.ai>',
            to: [sub.email],
            reply_to: 'help@indigenousrising.ai',
            subject: `New Indigenous business funding — week of ${todayFormatted}`,
            html,
          }),
        });

        if (!emailResponse.ok) {
          const errText = await emailResponse.text();
          console.error('[FUNDING-DIGEST] Resend error for', sub.email, ':', errText);
          failed++;
          continue;
        }

        // Mark as sent
        await supabase
          .from('grant_alerts_subscribers')
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq('id', sub.id);

        sent++;
      } catch (perSubError: unknown) {
        const msg = perSubError instanceof Error ? perSubError.message : String(perSubError);
        console.error('[FUNDING-DIGEST] Per-subscriber error:', msg);
        failed++;
      }
    }

    console.log(`[FUNDING-DIGEST] Done — sent: ${sent}, skipped: ${skipped}, failed: ${failed}`);

    return new Response(
      JSON.stringify({ sent, skipped, failed }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[FUNDING-DIGEST] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Digest send failed', sent, skipped, failed }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
