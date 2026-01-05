import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

const Analytics: React.FC = () => {
  const { subscribed, loading } = useSubscription();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-neutral-900 text-white py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Impact Analytics</h1>
        {!subscribed ? (
          <div className="bg-white/5 p-4 rounded-lg">Advanced analytics are available to paid subscribers only.</div>
        ) : (
          <section className="bg-white/5 p-4 rounded-lg">Advanced analytics dashboard placeholder.</section>
        )}
      </div>
    </main>
  );
};

export default Analytics;
