import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import DashboardLayout from '@/components/DashboardLayout';

const BusinessTools: React.FC = () => {
  const { subscribed, product_id, loading } = useSubscription();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <DashboardLayout>
      <main className="py-6 px-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Business Planning Assistant</h1>
          <p className="mb-4">Access planning templates, checklists and guided prompts tailored to your stage.</p>

          <section className="bg-white/5 p-4 rounded-lg"> 
            <h2 className="text-xl font-semibold">Your plan access</h2>
            <p className="mt-2">Subscription: {subscribed ? 'Paid' : 'Free'}</p>
            {product_id && <p className="text-sm text-white/70">Product: {product_id}</p>}
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default BusinessTools;
