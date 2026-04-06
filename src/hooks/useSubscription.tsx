import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  loading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        loading: false,
      });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      // If no valid session token, don't call the edge function
      if (!accessToken) {
        setStatus({
          subscribed: false,
          product_id: null,
          subscription_end: null,
          loading: false,
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;

      setStatus({
        subscribed: data?.subscribed || false,
        product_id: data?.product_id || null,
        subscription_end: data?.subscription_end || null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        loading: false,
      });
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();

    // Poll every 5 minutes — avoids hammering Stripe API with a call per user per minute
    const interval = setInterval(checkSubscription, 300000);

    // Refresh immediately when the user returns to this tab (e.g. after completing checkout)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSubscription();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSubscription]);

  return {
    ...status,
    refreshSubscription: checkSubscription,
  };
};
