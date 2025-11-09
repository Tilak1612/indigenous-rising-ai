import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ConfirmRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'subscribe';

    // Handle email confirmation
    if (action === 'confirm') {
      const { token }: ConfirmRequest = await req.json();
      
      console.log('Confirming subscription with token:', token);

      // Find subscription by confirmation token
      const { data: subscription, error: fetchError } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('confirmation_token', token)
        .single();

      if (fetchError || !subscription) {
        console.error('Subscription not found:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Invalid confirmation token' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (subscription.confirmed_at) {
        return new Response(
          JSON.stringify({ message: 'Email already confirmed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update subscription as confirmed
      const { error: updateError } = await supabase
        .from('newsletter_subscriptions')
        .update({ 
          confirmed_at: new Date().toISOString(),
          is_active: true 
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }

      // Add contact to HubSpot
      try {
        const hubspotResponse = await fetch('https://api.hubapi.com/contacts/v1/contact', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: [
              { property: 'email', value: subscription.email },
              { property: 'newsletter_opt_in', value: true },
            ],
          }),
        });

        if (!hubspotResponse.ok) {
          const errorText = await hubspotResponse.text();
          console.error('HubSpot API error:', errorText);
        } else {
          console.log('Contact added to HubSpot successfully');
        }
      } catch (hubspotError) {
        console.error('Error adding to HubSpot:', hubspotError);
        // Continue anyway - subscription is confirmed even if HubSpot fails
      }

      // Send welcome email via HubSpot
      try {
        const emailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId: 'welcome-newsletter', // You'll need to create this template in HubSpot
            message: {
              to: subscription.email,
              from: 'hello@indigenousrising.ai',
            },
          }),
        });

        if (!emailResponse.ok) {
          console.error('HubSpot welcome email error:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }

      return new Response(
        JSON.stringify({ message: 'Email confirmed successfully!' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle new subscription
    const { email, ipAddress, userAgent }: SubscribeRequest = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing newsletter subscription for:', email);

    // Check for existing subscription
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      if (existing.is_active && existing.confirmed_at) {
        return new Response(
          JSON.stringify({ error: 'This email is already subscribed' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Resend confirmation if not confirmed yet
      if (!existing.confirmed_at) {
        const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/newsletter-subscribe?action=confirm`;
        
        try {
          await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hubspotApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailId: 'confirm-newsletter', // You'll need to create this template in HubSpot
              message: {
                to: email,
                from: 'hello@indigenousrising.ai',
              },
              customProperties: {
                confirmation_link: `${confirmationUrl}&token=${existing.confirmation_token}`,
              },
            }),
          });
        } catch (error) {
          console.error('Error sending confirmation email:', error);
        }

        return new Response(
          JSON.stringify({ 
            message: 'Confirmation email resent! Please check your inbox.' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new subscription with confirmation token
    const confirmationToken = crypto.randomUUID();
    
    const { data: newSubscription, error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: email.toLowerCase().trim(),
        ip_address: ipAddress,
        user_agent: userAgent,
        confirmation_token: confirmationToken,
        is_active: false, // Will be activated after confirmation
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      throw insertError;
    }

    console.log('Subscription created:', newSubscription.id);

    // Send confirmation email via HubSpot
    const confirmationUrl = `${supabaseUrl}/functions/v1/newsletter-subscribe?action=confirm`;
    
    try {
      const emailResponse = await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId: 'confirm-newsletter', // Create this template in HubSpot
          message: {
            to: email,
            from: 'hello@indigenousrising.ai',
          },
          customProperties: {
            confirmation_link: `${confirmationUrl}&token=${confirmationToken}`,
          },
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('HubSpot email error:', errorText);
        throw new Error('Failed to send confirmation email');
      }

      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Delete the subscription if email fails
      await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', newSubscription.id);
      
      throw new Error('Failed to send confirmation email. Please try again.');
    }

    return new Response(
      JSON.stringify({ 
        message: 'Please check your email to confirm your subscription!',
        requiresConfirmation: true 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in newsletter-subscribe function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
