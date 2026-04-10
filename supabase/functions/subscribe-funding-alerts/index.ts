import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_ORIGINS = [
  'https://www.indigenousrising.ai',
  'https://indigenousrising.ai',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://www.indigenousrising.ai';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const VALID_PROVINCES = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

const VALID_INDUSTRIES = [
  'Agriculture & Forestry','Arts & Crafts','Construction','Consulting','Education',
  'Energy & Mining','Finance & Insurance','Food & Beverage','Healthcare',
  'Hospitality & Tourism','Information Technology','Manufacturing',
  'Professional Services','Real Estate','Retail','Transportation','Other',
];

interface SubscribeRequest {
  email: string;
  provinces: string[];
  industries: string[];
  consent: boolean;
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.error('[FUNDING-SUBSCRIBE] RESEND_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const body: SubscribeRequest = await req.json();
    const { email, provinces, industries, consent } = body;

    // CASL: consent required
    if (consent !== true) {
      return new Response(
        JSON.stringify({ error: 'Consent is required to subscribe' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Validate provinces
    if (!Array.isArray(provinces) || provinces.length === 0 || provinces.length > 13) {
      return new Response(
        JSON.stringify({ error: 'Select at least one province or territory' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    if (!provinces.every((p) => VALID_PROVINCES.includes(p))) {
      return new Response(
        JSON.stringify({ error: 'Invalid province or territory' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Validate industries
    if (!Array.isArray(industries) || industries.length === 0 || industries.length > 17) {
      return new Response(
        JSON.stringify({ error: 'Select at least one industry' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    if (!industries.every((i) => VALID_INDUSTRIES.includes(i))) {
      return new Response(
        JSON.stringify({ error: 'Invalid industry' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate limit: 3 attempts per IP per minute, 10 per hour
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentMinute } = await supabase
      .from('grant_alerts_subscribers')
      .select('id')
      .eq('consent_ip', ipAddress)
      .gte('subscribed_at', oneMinuteAgo);

    if (recentMinute && recentMinute.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again in a minute.' }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentHour } = await supabase
      .from('grant_alerts_subscribers')
      .select('id')
      .eq('consent_ip', ipAddress)
      .gte('subscribed_at', oneHourAgo);

    if (recentHour && recentHour.length >= 10) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Check existing subscription
    const { data: existing } = await supabase
      .from('grant_alerts_subscribers')
      .select('id, is_active')
      .eq('email', normalizedEmail)
      .maybeSingle();

    let confirmationToken: string;

    if (existing && existing.is_active) {
      // Already active — return success without revealing whether the email exists
      console.log('[FUNDING-SUBSCRIBE] Already active:', normalizedEmail);
      return new Response(
        JSON.stringify({ success: true, message: 'Check your inbox to confirm your subscription.' }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    if (existing) {
      // Inactive — regenerate token, update preferences, resend confirmation
      confirmationToken = crypto.randomUUID();
      const { error: updateError } = await supabase
        .from('grant_alerts_subscribers')
        .update({
          provinces,
          industries,
          confirmation_token: confirmationToken,
          consent_given: true,
          consent_ip: ipAddress,
          consent_user_agent: userAgent,
          subscribed_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('[FUNDING-SUBSCRIBE] Update error:', updateError);
        throw updateError;
      }
    } else {
      // New subscription
      confirmationToken = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from('grant_alerts_subscribers')
        .insert({
          email: normalizedEmail,
          provinces,
          industries,
          confirmation_token: confirmationToken,
          consent_given: true,
          consent_ip: ipAddress,
          consent_user_agent: userAgent,
        });

      if (insertError) {
        console.error('[FUNDING-SUBSCRIBE] Insert error:', insertError);
        throw insertError;
      }
    }

    const confirmUrl = `https://www.indigenousrising.ai/funding/confirm?token=${confirmationToken}`;

    const html = `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
  <h1 style="color: #279b65; font-size: 24px; margin-bottom: 16px;">Confirm your funding alerts subscription</h1>
  <p style="font-size: 16px; line-height: 1.6;">
    You requested weekly funding alerts for Indigenous businesses in
    <strong>${provinces.join(', ')}</strong> in the
    <strong>${industries.join(', ')}</strong> sector(s).
  </p>
  <p style="font-size: 16px; line-height: 1.6;">
    Click the button below to confirm your email and start receiving alerts every Friday morning.
  </p>
  <p style="margin: 32px 0;">
    <a href="${confirmUrl}" style="display: inline-block; background: #279b65; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Confirm subscription</a>
  </p>
  <p style="font-size: 14px; color: #666; line-height: 1.5;">
    Or paste this link into your browser:<br />
    <span style="word-break: break-all;">${confirmUrl}</span>
  </p>
  <p style="font-size: 14px; color: #666; line-height: 1.5; margin-top: 32px;">
    If you did not request this, you can safely ignore this email — no further messages will be sent.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
  <p style="font-size: 12px; color: #888; line-height: 1.5;">
    Indigenous Rising AI Business Support Platform<br />
    Traditional Territory of the Anishinaabe, Toronto, ON, Canada<br />
    help@indigenousrising.ai
  </p>
</body></html>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Indigenous Rising AI Funding <funding@indigenousrising.ai>',
        to: [normalizedEmail],
        reply_to: 'help@indigenousrising.ai',
        subject: 'Confirm your Indigenous Rising AI funding alerts subscription',
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error('[FUNDING-SUBSCRIBE] Resend error:', errText);
      // Don't fail the request — the row is saved and we can resend later
      return new Response(
        JSON.stringify({ success: true, warning: 'Subscription saved but confirmation email may be delayed' }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[FUNDING-SUBSCRIBE] Confirmation email sent to', normalizedEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Check your inbox to confirm your subscription.' }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[FUNDING-SUBSCRIBE] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to process subscription. Please try again.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
