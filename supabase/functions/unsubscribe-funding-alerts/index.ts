import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CASL: 1-click unsubscribe. Called by the React /funding/unsubscribe page
// via supabase.functions.invoke(). The page reads the token from the URL
// query string and posts it to this function.

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
      // Don't reveal whether the token exists — always return success
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    // CASL: immediate effect, no delay
    await supabase
      .from('grant_alerts_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('unsubscribe_token', token);

    console.log('[FUNDING-UNSUBSCRIBE] Processed token:', token.substring(0, 8) + '...');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[FUNDING-UNSUBSCRIBE] Error:', message);
    // Always return success — never reveal internal state
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
