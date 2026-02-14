import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

interface TrackingRequest {
  trackingNumber: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine content type
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    let fullName: string;
    let email: string;
    let requestType: string;
    let details: string;
    let phone: string | undefined;
    let verificationMethod: string | undefined;
    let userAgent: string | undefined;
    let file: File | null = null;

    if (isMultipart) {
      // Handle FormData (file upload)
      const formData = await req.formData();
      fullName = formData.get('fullName') as string;
      email = formData.get('email') as string;
      requestType = formData.get('requestType') as string;
      details = formData.get('details') as string;
      phone = (formData.get('phone') as string) || undefined;
      verificationMethod = (formData.get('verificationMethod') as string) || undefined;
      userAgent = (formData.get('userAgent') as string) || undefined;
      const fileEntry = formData.get('file');
      if (fileEntry && fileEntry instanceof File && fileEntry.size > 0) {
        file = fileEntry;
      }
    } else {
      // Handle JSON
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

      fullName = body.fullName;
      email = body.email;
      requestType = body.requestType;
      details = body.details;
      phone = body.phone;
      verificationMethod = body.verificationMethod;
      userAgent = body.userAgent;
    }

    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Rate limiting: 3 per minute
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

    // Rate limiting: 10 per hour
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
    if (!fullName || !email || !requestType || !details) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-side length validation
    if (email.length > 255 || fullName.length > 100 || 
        details.length > 1000 || (phone && phone.length > 20)) {
      return new Response(
        JSON.stringify({ error: 'One or more fields exceed maximum length' }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request type
    const validRequestTypes = ['access', 'correction', 'deletion', 'portability', 'consent_withdrawal', 'objection'] as const;
    if (!validRequestTypes.includes(requestType as any)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request type. Must be one of: access, correction, deletion, portability, consent_withdrawal, or objection' }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle file upload server-side using service role key
    let filePath: string | null = null;
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }),
          { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.' }),
          { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      filePath = `verification/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('data-request-documents')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to upload verification document.' }),
          { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('File uploaded:', filePath);
    }

    console.log('Creating data request for:', email);

    const { data: dataRequest, error: insertError } = await supabase
      .from('data_requests')
      .insert({
        full_name: fullName,
        email: email.toLowerCase().trim(),
        request_type: requestType,
        description: details,
        phone: phone,
        verification_method: verificationMethod,
        ip_address: clientIp,
        user_agent: userAgent || req.headers.get('user-agent') || 'unknown',
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
          emailId: 'data-request-confirmation',
          message: {
            to: email,
            from: 'privacy@indigenousrising.ai',
          },
          customProperties: {
            tracking_number: dataRequest.tracking_number,
            request_type: requestType,
            full_name: fullName,
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
    }

    // Send notification to Privacy Officer
    try {
      const officerEmailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId: 'data-request-notification',
          message: {
            to: 'privacy@indigenousrising.ai',
            from: 'system@indigenousrising.ai',
          },
          customProperties: {
            tracking_number: dataRequest.tracking_number,
            request_type: requestType,
            full_name: fullName,
            email: email,
            details: details,
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
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: dataRequest.tracking_number,
        message: 'Your data request has been submitted successfully. Please save your tracking number.',
      }),
      { status: 200, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Data request error:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });
    
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
