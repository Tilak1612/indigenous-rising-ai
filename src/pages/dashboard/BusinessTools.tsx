import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const BusinessTools: React.FC = () => {
  const { subscribed, product_id, loading } = useSubscription();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4">Business Planning Assistant</h1>
        <p className="mb-4 text-muted-foreground">Access planning templates, checklists and guided prompts tailored to your stage.</p>

        <section className="bg-muted p-4 rounded-lg border"> 
          <h2 className="text-xl font-semibold">Your plan access</h2>
          <p className="mt-2">Subscription: {subscribed ? 'Paid' : 'Free'}</p>
          {product_id && <p className="text-sm text-muted-foreground">Product: {product_id}</p>}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default BusinessTools;
