import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

interface ContactRequest {
  full_name: string;
  email: string;
  subject: string;
  phone?: string;
  message: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { full_name, email, subject, phone, message }: ContactRequest = await req.json();

    // Validate input
    if (!full_name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP and user agent
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Rate limiting: Check submissions per minute (3 per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentMinute } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('ip_address', ip_address)
      .gte('submitted_at', oneMinuteAgo);

    if (recentMinute && recentMinute.length >= 3) {
      console.warn('Rate limit exceeded (per minute):', ip_address);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
        { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check submissions per hour (10 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentHour } = await supabase
      .from('contact_submissions')
      .select('id')
      .eq('ip_address', ip_address)
      .gte('submitted_at', oneHourAgo);

    if (recentHour && recentHour.length >= 10) {
      console.warn('Rate limit exceeded (per hour):', ip_address);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Legacy check using database function for backwards compatibility
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_contact_rate_limit', { _ip_address: ip_address });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway - we have inline checks above
    }

    if (rateLimitCheck === false) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert contact submission
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        full_name,
        email,
        subject,
        phone: phone || null,
        message,
        ip_address,
        user_agent,
        status: 'new',
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact form' }),
        { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Contact form submitted successfully:', { email, subject });

    return new Response(
      JSON.stringify({ success: true, message: 'Contact form submitted successfully' }),
      { status: 200, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in submit-contact function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
