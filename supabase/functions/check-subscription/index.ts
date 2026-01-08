import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      ...securityHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    console.log("[CHECK-SUBSCRIPTION] Function started");

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[CHECK-SUBSCRIPTION] Missing backend configuration");
      return jsonResponse({ error: "Server misconfiguration" }, 500);
    }

    // Use ANON key + Authorization header (works reliably in backend functions)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const token = authHeader.replace("Bearer ", "");

    // Validate token by fetching the user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      console.warn("[CHECK-SUBSCRIPTION] Unauthorized:", userError?.message);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const email = userData.user.email;

    console.log("[CHECK-SUBSCRIPTION] User authenticated:", email);

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecretKey) {
      console.error("[CHECK-SUBSCRIPTION] Missing STRIPE_SECRET_KEY");
      return jsonResponse({ error: "Billing is not configured" }, 500);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      console.log("[CHECK-SUBSCRIPTION] No customer found");
      return jsonResponse({ subscribed: false }, 200);
    }

    const customerId = customers.data[0].id;
    console.log("[CHECK-SUBSCRIPTION] Customer found:", customerId);

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
      console.log("[CHECK-SUBSCRIPTION] Active subscription found:", {
        subscriptionId: subscription.id,
        productId,
        endDate: subscriptionEnd,
      });
    } else {
      console.log("[CHECK-SUBSCRIPTION] No active subscription found");
    }

    return jsonResponse(
      {
        subscribed: hasActiveSub,
        product_id: productId,
        subscription_end: subscriptionEnd,
      },
      200,
    );
  } catch (error: any) {
    console.error("[CHECK-SUBSCRIPTION] Error:", error?.message || error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
