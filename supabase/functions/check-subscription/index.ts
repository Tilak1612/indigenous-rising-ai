import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  'https://www.indigenousrising.ai',
  'https://indigenousrising.ai',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : 'https://www.indigenousrising.ai';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not set - returning unsubscribed");
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header");
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user?.email) {
      logStep("Auth error or no email", { error: userError?.message });
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    // ── Demo-account override ────────────────────────────────────────────────
    // Lets a sales/demo account show paid features without a real Stripe
    // subscription. Deliberately conservative:
    //   * OFF unless DEMO_ACCOUNT_EMAILS is set (no env var = normal billing).
    //   * Matched against the SERVER-VERIFIED email from auth.getUser(), so a
    //     client cannot spoof it by editing a request body or header.
    //   * Grants read-style access only — it never creates a Stripe customer,
    //     never charges, and never writes to the subscriptions table.
    //   * DEMO_PRODUCT_TIER picks what the UI shows: "enterprise" unlocks the
    //     enterprise nav, anything else maps to the normal paid tier.
    // Remove the env var to instantly revoke the demo's access.
    const demoEmails = (Deno.env.get("DEMO_ACCOUNT_EMAILS") ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (demoEmails.length > 0 && demoEmails.includes((user.email ?? "").toLowerCase())) {
      const tier = (Deno.env.get("DEMO_PRODUCT_TIER") ?? "paid").toLowerCase();
      // getTierFromSubscription() reads this string: "…enterprise"/"…gimishoomis"
      // => enterprise tier, otherwise paid.
      const productId = tier === "enterprise" ? "demo_enterprise" : "demo_paid";
      const subscriptionEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      logStep("DEMO ACCOUNT override applied", { email: user.email, productId });
      return new Response(
        JSON.stringify({ subscribed: true, product_id: productId, subscription_end: subscriptionEnd }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(
        JSON.stringify({ subscribed: false, product_id: null, subscription_end: null }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId: string | null = null;
    let subscriptionEnd: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      logStep("Active subscription", { productId, subscriptionEnd });
    } else {
      logStep("No active subscription");
    }

    return new Response(
      JSON.stringify({ subscribed: hasActiveSub, product_id: productId, subscription_end: subscriptionEnd }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(
      JSON.stringify({ subscribed: false, product_id: null, subscription_end: null }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
    );
  }
});
