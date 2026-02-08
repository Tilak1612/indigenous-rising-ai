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

interface DataRequestPayload {
  fullName: string;
  email: string;
  requestType: string;
  details: string;
  phone?: string;
  verificationMethod?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface TrackingRequest {
  trackingNumber: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'submit';

    // Handle request tracking
    if (action === 'track' || req.method === 'POST') {
      const body = await req.json();
      
      // Check if this is a tracking request
      if ('trackingNumber' in body) {
        const { trackingNumber } = body as TrackingRequest;
        
        console.log('Tracking request:', trackingNumber);

        if (!trackingNumber || trackingNumber.length !== 12) {
          return new Response(
            JSON.stringify({ error: 'Invalid tracking number' }),
            { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: request, error } = await supabase
          .from('data_requests')
          .select('*')
          .eq('tracking_number', trackingNumber)
          .single();

        if (error || !request) {
          return new Response(
            JSON.stringify({ error: 'Request not found' }),
            { status: 404, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Return sanitized request info (exclude sensitive fields)
        const sanitizedRequest = {
          tracking_number: request.tracking_number,
          request_type: request.request_type,
          status: request.status,
          submitted_at: request.submitted_at,
          completed_at: request.completed_at,
        };

        return new Response(
          JSON.stringify({ request: sanitizedRequest }),
          { status: 200, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Otherwise, handle new data request submission
      const payload = body as DataRequestPayload;

      // Get client IP
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       payload.ipAddress || 
                       'unknown';

      // Rate limiting: Check submissions per minute (3 per minute)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const { data: recentMinute } = await supabase
        .from('data_requests')
        .select('id')
        .eq('ip_address', clientIp)
        .gte('submitted_at', oneMinuteAgo);

      if (recentMinute && recentMinute.length >= 3) {
        console.warn('Rate limit exceeded (per minute):', clientIp);
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
          { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Rate limiting: Check submissions per hour (10 per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentHour } = await supabase
        .from('data_requests')
        .select('id')
        .eq('ip_address', clientIp)
        .gte('submitted_at', oneHourAgo);

      if (recentHour && recentHour.length >= 10) {
        console.warn('Rate limit exceeded (per hour):', clientIp);
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate required fields
      if (!payload.fullName || !payload.email || !payload.requestType || !payload.details) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Server-side length validation
      if (payload.email.length > 255 || payload.fullName.length > 100 || 
          payload.details.length > 1000 || (payload.phone && payload.phone.length > 20)) {
        return new Response(
          JSON.stringify({ error: 'One or more fields exceed maximum length' }),
          { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email address' }),
          { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate request type with strict allowlist
      const validRequestTypes = ['access', 'correction', 'deletion', 'portability', 'consent_withdrawal', 'objection'] as const;
      if (!validRequestTypes.includes(payload.requestType as any)) {
        return new Response(
          JSON.stringify({ error: 'Invalid request type. Must be one of: access, correction, deletion, portability, consent_withdrawal, or objection' }),
          { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Creating data request for:', payload.email);

      // Create data request in database
      const { data: dataRequest, error: insertError } = await supabase
        .from('data_requests')
        .insert({
          full_name: payload.fullName,
          email: payload.email.toLowerCase().trim(),
          request_type: payload.requestType,
          description: payload.details,
          phone: payload.phone,
          verification_method: payload.verificationMethod,
          ip_address: clientIp,
          user_agent: payload.userAgent || req.headers.get('user-agent') || 'unknown',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating data request:', insertError);
        throw insertError;
      }

      console.log('Data request created:', dataRequest.id, 'Tracking:', dataRequest.tracking_number);

      // Send confirmation email to user
      try {
        const userEmailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId: 'data-request-confirmation', // Create this template in HubSpot
            message: {
              to: payload.email,
              from: 'privacy@indigenousrising.ai',
            },
            customProperties: {
              tracking_number: dataRequest.tracking_number,
              request_type: payload.requestType,
              full_name: payload.fullName,
            },
          }),
        });

        if (!userEmailResponse.ok) {
          const errorText = await userEmailResponse.text();
          console.error('HubSpot user email error:', errorText);
        } else {
          console.log('Confirmation email sent to user');
        }
      } catch (emailError) {
        console.error('Error sending user confirmation email:', emailError);
        // Continue anyway
      }

      // Send notification email to Privacy Officer
      try {
        const officerEmailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId: 'data-request-notification', // Create this template in HubSpot
            message: {
              to: 'privacy@indigenousrising.ai',
              from: 'system@indigenousrising.ai',
            },
            customProperties: {
              tracking_number: dataRequest.tracking_number,
              request_type: payload.requestType,
              full_name: payload.fullName,
              email: payload.email,
              details: payload.details,
              submitted_at: dataRequest.submitted_at,
            },
          }),
        });

        if (!officerEmailResponse.ok) {
          const errorText = await officerEmailResponse.text();
          console.error('HubSpot officer email error:', errorText);
        } else {
          console.log('Notification email sent to Privacy Officer');
        }
      } catch (emailError) {
        console.error('Error sending officer notification email:', emailError);
        // Continue anyway
      }

      return new Response(
        JSON.stringify({
          success: true,
          tracking_number: dataRequest.tracking_number,
          message: 'Your data request has been submitted successfully. Please save your tracking number.',
        }),
        { status: 200, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback return for unhandled cases
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    // Log full error details server-side for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Data request error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
    // Return sanitized error message to client
    const isKnownError = errorMessage?.includes('rate limit') || 
                         errorMessage?.includes('Invalid') ||
                         errorMessage?.includes('not found');
    
    return new Response(
      JSON.stringify({ 
        error: isKnownError ? errorMessage : 'An error occurred processing your data request. Please try again or contact our privacy officer at privacy@indigenousrising.ai.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
