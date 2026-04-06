import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Stable query key — shared across all components calling useSubscription
export const SUBSCRIPTION_QUERY_KEY = 'subscription-status';

interface SubscriptionData {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

async function fetchSubscriptionStatus(): Promise<SubscriptionData> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    return { subscribed: false, product_id: null, subscription_end: null };
  }

  const { data, error } = await supabase.functions.invoke('check-subscription', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) throw error;

  return {
    subscribed: data?.subscribed ?? false,
    product_id: data?.product_id ?? null,
    subscription_end: data?.subscription_end ?? null,
  };
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
