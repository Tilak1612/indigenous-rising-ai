import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { readAccessToken } from '@/lib/auth-storage';

// Stable query key — shared across all components calling useSubscription
export const SUBSCRIPTION_QUERY_KEY = 'subscription-status';

interface SubscriptionData {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

// Hard timeout so the subscription check can never hang the app.
// On timeout we default to unsubscribed — safe and matches the edge
// function's own fallback behaviour.
const SUBSCRIPTION_TIMEOUT_MS = 6000;

async function fetchSubscriptionStatus(): Promise<SubscriptionData> {
  // Read token directly from localStorage instead of calling
  // supabase.auth.getSession() which is known to hang in this project.
  const accessToken = readAccessToken();

  if (!accessToken) {
    return { subscribed: false, product_id: null, subscription_end: null };
  }

  const fallback: SubscriptionData = {
    subscribed: false,
    product_id: null,
    subscription_end: null,
  };

  try {
    const invokePromise = supabase.functions.invoke('check-subscription', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
      setTimeout(
        () => resolve({ data: null, error: new Error('check-subscription timed out') }),
        SUBSCRIPTION_TIMEOUT_MS
      );
    });

    const result = await Promise.race([invokePromise, timeoutPromise]);
    const { data, error } = result as { data: SubscriptionData | null; error: Error | null };

    if (error) {
      console.warn('[useSubscription]', error.message, '— defaulting to unsubscribed');
      return fallback;
    }

    return {
      subscribed: data?.subscribed ?? false,
      product_id: data?.product_id ?? null,
      subscription_end: data?.subscription_end ?? null,
    };
  } catch (err) {
    console.warn('[useSubscription] fetch threw:', err, '— defaulting to unsubscribed');
    return fallback;
  }
}

export const useSubscription = () => {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: [SUBSCRIPTION_QUERY_KEY, user?.id],
    queryFn: fetchSubscriptionStatus,
    // Only run when a user is signed in
    enabled: !!user,
    // Cache result for 5 minutes — matches our polling interval
    staleTime: 5 * 60 * 1000,
    // Refresh when user returns to the tab (handles post-checkout flow)
    refetchOnWindowFocus: true,
    // One retry on failure — avoid hammering a failing edge function
    retry: 1,
    // On failure, fall back to unsubscribed (safe default — worse to grant access than deny it)
    // Note: this means a Stripe outage shows paying users as free — see ARCH notes
  });

  return {
    subscribed: data?.subscribed ?? false,
    product_id: data?.product_id ?? null,
    subscription_end: data?.subscription_end ?? null,
    loading: isLoading,
    refreshSubscription: refetch,
  };
};
