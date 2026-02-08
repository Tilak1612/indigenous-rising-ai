import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import DashboardLayout from '@/components/DashboardLayout';

const Analytics: React.FC = () => {
  const { subscribed, loading } = useSubscription();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <DashboardLayout>
      <main className="py-6 px-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Impact Analytics</h1>
          {!subscribed ? (
            <div className="bg-white/5 p-4 rounded-lg">Advanced analytics are available to paid subscribers only.</div>
          ) : (
            <section className="bg-white/5 p-4 rounded-lg">Advanced analytics dashboard placeholder.</section>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Analytics;
