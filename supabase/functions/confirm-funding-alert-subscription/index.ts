import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// This function is invoked by the React /funding/confirm page via supabase.functions.invoke().
// JSON in, JSON out — the React page renders the success/error UI.

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

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const token = (body?.token as string | undefined)?.trim();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing confirmation token' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    const { data: subscriber, error: fetchError } = await supabase
      .from('grant_alerts_subscribers')
      .select('id, is_active, subscribed_at, confirmed_at')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (fetchError || !subscriber) {
      return new Response(
        JSON.stringify({ error: 'Invalid confirmation link', code: 'invalid_token' }),
        { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Already confirmed
    if (subscriber.is_active && subscriber.confirmed_at) {
      return new Response(
        JSON.stringify({ success: true, alreadyConfirmed: true }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Token expired (>48h after subscribed_at)
    const tokenAge = Date.now() - new Date(subscriber.subscribed_at).getTime();
    if (tokenAge > FORTY_EIGHT_HOURS) {
      return new Response(
        JSON.stringify({ error: 'Confirmation link has expired', code: 'expired_token' }),
        { status: 410, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // Activate subscription
    const { error: updateError } = await supabase
      .from('grant_alerts_subscribers')
      .update({
        is_active: true,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('[FUNDING-CONFIRM] Update error:', updateError);
      throw updateError;
    }

    console.log('[FUNDING-CONFIRM] Activated subscriber:', subscriber.id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[FUNDING-CONFIRM] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Failed to confirm subscription' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
