import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <main className="py-6 px-0">
        <div className="max-w-7xl mx-auto">
          <section className="mb-6">
            <div className="rounded-lg bg-white/3 p-4">
              <p className="text-sm text-white/80">Welcome to your dashboard.</p>
              <p className="mt-1 text-lg font-medium">Get started with your top actions.</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white/3 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Activity feed</h3>
                <p className="text-sm text-white/70 mt-2">No recent activity — get started.</p>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/6">
                <p className="text-sm text-white/70">Funding matches</p>
                <p className="mt-1 text-2xl font-semibold text-white">3</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Dashboard;
