import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

const BusinessTools: React.FC = () => {
  const { subscribed, product_id, loading } = useSubscription();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Business Planning Assistant</h1>
        <p className="mb-4 text-muted-foreground">Access planning templates, checklists and guided prompts tailored to your stage.</p>

        <section className="bg-muted p-4 rounded-lg border"> 
          <h2 className="text-xl font-semibold">Your plan access</h2>
          <p className="mt-2">Subscription: {subscribed ? 'Paid' : 'Free'}</p>
          {product_id && <p className="text-sm text-muted-foreground">Product: {product_id}</p>}
        </section>
      </div>
    </main>
  );
};

export default BusinessTools;
