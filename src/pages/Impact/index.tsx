import React from 'react';
import ImpactMetrics from '@/components/ImpactMetrics';
import ImpactLogForm from '@/components/ImpactLogForm';
import ImpactReport from '@/components/ImpactReport';

const ImpactPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Community Impact Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">Track jobs, youth engagement, language, wellness, and environmental indicators.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <ImpactMetrics />
            <ImpactLogForm />
          </div>

          <aside className="space-y-4">
            <ImpactReport />
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ImpactPage;
