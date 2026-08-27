export const SUBSCRIPTION_QUERY_KEY = 'subscription-status';
export const useSubscription = () => ({
  subscribed: true, plan: 'growth', planName: 'Growth', status: 'active',
  loading: false, isLoading: false, currentPeriodEnd: null,
  cancelAtPeriodEnd: false, refetch: () => {},
});
