export const SUBSCRIPTION_QUERY_KEY = 'subscription-status';

// Tier is switchable for measurement: localStorage['harness-tier'] =
// 'free' | 'growth' (default) | 'enterprise'. Free-only UI (the Upgrade button)
// and enterprise-only nav cannot be measured otherwise.
function harnessTier(): 'free' | 'growth' | 'enterprise' {
  try {
    const t = localStorage.getItem('harness-tier');
    if (t === 'free' || t === 'enterprise') return t;
  } catch {
    // storage unavailable — fall through to the default
  }
  return 'growth';
}

export const useSubscription = () => {
  const tier = harnessTier();
  return {
    subscribed: tier !== 'free',
    plan: tier === 'free' ? 'free' : tier,
    planName: tier === 'free' ? 'Free' : tier === 'enterprise' ? 'Nations & Organizations' : 'Growth',
    product_id: tier === 'enterprise' ? 'demo_enterprise' : null,
    price_id: null,
    status: tier === 'free' ? 'inactive' : 'active',
    loading: false, isLoading: false, currentPeriodEnd: null,
    cancelAtPeriodEnd: false, refetch: () => {},
  };
};
