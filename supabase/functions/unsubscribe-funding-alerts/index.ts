import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CASL: 1-click unsubscribe. Must work via direct GET from email link with no
// confirmation page, no login. Returns HTML directly so the user lands on a
// success page in their browser without needing the React app.

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

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | Indigenous Rising AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #f8faf9; color: #1a1a1a; margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; max-width: 480px; width: 90%; padding: 48px 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); text-align: center; }
    h1 { color: #279b65; font-size: 28px; margin: 0 0 16px; }
    p { font-size: 16px; line-height: 1.6; color: #444; margin: 0 0 16px; }
    a { color: #279b65; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    .footer { margin-top: 32px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <p><a href="https://www.indigenousrising.ai/funding">← Back to Indigenous Rising AI</a></p>
    <div class="footer">Indigenous Rising AI Business Support Platform</div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token')?.trim();

    if (!token) {
      return new Response(
        htmlPage('Unsubscribed', 'You have been unsubscribed. You will not receive any further funding alert emails.'),
        { status: 200, headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Set is_active = false (CASL: immediate effect, no delay)
    // Don't reveal whether the token exists — always return success
    await supabase
      .from('grant_alerts_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('unsubscribe_token', token);

    console.log('[FUNDING-UNSUBSCRIBE] Processed token:', token.substring(0, 8) + '...');

    return new Response(
      htmlPage(
        'You have been unsubscribed',
        'Sorry to see you go. You will not receive any further funding alert emails. You can resubscribe any time at indigenousrising.ai/funding/alerts.'
      ),
      { status: 200, headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[FUNDING-UNSUBSCRIBE] Error:', message);
    // Even on error, show success page — never reveal internal state
    return new Response(
      htmlPage('Unsubscribed', 'Your unsubscribe request has been processed.'),
      { status: 200, headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
});
