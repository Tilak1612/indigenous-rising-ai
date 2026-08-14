import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    console.log('[CREATE-CHECKOUT] Function started');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('[CREATE-CHECKOUT] STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error('User not authenticated or email not available');
    }

    console.log('[CREATE-CHECKOUT] User authenticated:', user.email);

    // ── Server-side price resolution (never trust the browser) ──────────────
    // Previously the client sent a raw Stripe priceId and we charged it
    // verbatim — meaning any authenticated user could POST an arbitrary price
    // ID and check out at any price that exists in the Stripe account. The
    // client now sends only identifiers (plan + billing) and the server maps
    // them to an approved Price ID.
    //
    // Price IDs come from env so they are never in client code and can differ
    // per environment; the literals are the current production fallbacks.
    const PRICES: Record<string, { monthly: string; annual: string }> = {
      // Growth — $49/mo · $470/yr CAD (20% saving)
      Ogichidaakwe: {
        monthly: Deno.env.get('STRIPE_GROWTH_MONTHLY_PRICE_ID') ?? 'price_1TieC4AVTgSOk7kNi0635mvd',
        annual: Deno.env.get('STRIPE_GROWTH_ANNUAL_PRICE_ID') ?? 'price_1Ti443AVTgSOk7kNewKcPh6Q',
      },
      // Professional — $149/mo · $1,430/yr CAD (20% saving)
      Bimaadiziwin: {
        monthly: Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') ?? 'price_1Ti47xAVTgSOk7kNvfZdLbr8',
        annual: Deno.env.get('STRIPE_PRO_ANNUAL_PRICE_ID') ?? 'price_1Ti49bAVTgSOk7kNjT1wTOIp',
      },
    };
    // Every price the server is willing to charge. Used to validate the legacy
    // priceId path so an older cached frontend keeps working but still cannot
    // charge an arbitrary amount.
    const ALLOWED = new Set(Object.values(PRICES).flatMap((p) => [p.monthly, p.annual]));

    const body = await req.json().catch(() => ({}));
    const { plan, billing, priceId: legacyPriceId } = body ?? {};

    let priceId: string | undefined;

    if (plan || billing) {
      const cycle = billing === 'annual' ? 'annual' : 'monthly';
      const entry = PRICES[plan as string];
      if (!entry) {
        return new Response(
          JSON.stringify({ error: 'Unknown plan' }),
          { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      priceId = entry[cycle];
      console.log('[CREATE-CHECKOUT] Resolved server-side:', { plan, billing: cycle, priceId });
    } else if (legacyPriceId) {
      // Legacy path: accept only prices on the allow-list.
      if (!ALLOWED.has(legacyPriceId)) {
        console.warn('[CREATE-CHECKOUT] Rejected non-allow-listed priceId:', legacyPriceId);
        return new Response(
          JSON.stringify({ error: 'Invalid plan selection' }),
          { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      priceId = legacyPriceId;
      console.log('[CREATE-CHECKOUT] Legacy priceId (allow-listed):', priceId);
    }

    if (!priceId) {
      throw new Error('A plan is required');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-08-27.basil',
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('[CREATE-CHECKOUT] Existing customer found:', customerId);
    } else {
      console.log('[CREATE-CHECKOUT] No existing customer, will create during checkout');
    }

    // Validate origin against known production domains to prevent redirect hijacking
    const ALLOWED_ORIGINS = [
      'https://www.indigenousrising.ai',
      'https://indigenousrising.ai',
      'http://localhost:8080',
      'http://localhost:5173',
    ];
    const requestOrigin = req.headers.get('origin') || '';
    const origin = ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : 'https://www.indigenousrising.ai';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // GST/HST is calculated by Stripe Tax based on the customer's billing
      // address. Requires Stripe Tax to be registered/enabled in the dashboard
      // (Settings → Tax) — once registered, Stripe applies the correct rate;
      // until then, Stripe charges 0% but the field is harmless to leave on.
      automatic_tax: { enabled: true },
      // Required when automatic_tax is enabled so Stripe can determine the
      // customer's tax jurisdiction.
      customer_update: customerId ? { address: 'auto', name: 'auto' } : undefined,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=canceled`,
    });

    console.log('[CREATE-CHECKOUT] Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[CREATE-CHECKOUT] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
