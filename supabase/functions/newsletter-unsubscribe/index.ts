import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      console.log('Invalid or missing token provided');
      return new Response(
        JSON.stringify({ error: 'Invalid unsubscribe token' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Find subscription by unsubscribe token
    const { data: subscription, error: fetchError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active, email')
      .eq('unsubscribe_token', token)
      .single();

    if (fetchError || !subscription) {
      console.log('Subscription not found for token:', token);
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if already unsubscribed
    if (!subscription.is_active) {
      console.log('Subscription already inactive for:', subscription.email);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'You are already unsubscribed from our newsletter.' 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Update subscription to inactive
    const { error: updateError } = await supabase
      .from('newsletter_subscriptions')
      .update({ is_active: false })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Failed to update subscription:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to unsubscribe' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Successfully unsubscribed:', subscription.email);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "You have been successfully unsubscribed from our newsletter. We're sorry to see you go!" 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
