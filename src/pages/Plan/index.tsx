import React from 'react';
import PlanStepper from '@/components/PlanStepper';
import PlanTemplates from '@/components/PlanTemplates';

const PlanPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Business Planning Assistant</h1>
          <p className="text-sm text-muted-foreground mt-1">Guided steps, templates, and AI copilots to help create your plan.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <PlanStepper />
          </div>

          <aside className="space-y-4">
            <div className="bg-muted p-4 rounded-lg border">
              <h3 className="font-medium">Templates</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose a sector template to start faster.</p>
            </div>

            <PlanTemplates />
          </aside>
        </section>
      </div>
    </main>
  );
};

export default PlanPage;
