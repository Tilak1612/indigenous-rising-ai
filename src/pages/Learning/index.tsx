import React from 'react';
import MyLearning from '@/components/MyLearning';
import CertificationTracker from '@/components/CertificationTracker';
import { useAuth } from '@/hooks/useAuth';

const LearningPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Learning & Certification</h1>
          <p className="text-sm text-muted-foreground mt-1">My Learning, enrollments, and certification tracking.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MyLearning />
          </div>

          <aside className="space-y-4">
            <div className="bg-muted p-4 rounded-md border">
              <h3 className="font-medium">Ogichidaakwe Discount</h3>
              <p className="text-sm text-muted-foreground mt-1">Members on the Ogichidaakwe plan see a 20% discount on course pricing.</p>
            </div>

            <CertificationTracker />
          </aside>
        </section>
      </div>
    </main>
  );
};

export default LearningPage;
