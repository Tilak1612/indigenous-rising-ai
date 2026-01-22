import React, { useState } from 'react';
import FundingFilters from '@/components/FundingFilters';
import FundingList from '@/components/FundingList';
import FundingProfile from '@/components/FundingProfile';

const FundingPage: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Funding Navigator</h1>
          <p className="text-sm text-muted-foreground mt-1">Find grants, loans, and equity opportunities tailored to your profile.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="space-y-4">
            <FundingProfile />
            <FundingFilters onChange={(f) => setFilters(f)} />
          </aside>

          <div className="lg:col-span-3">
            <FundingList filters={filters} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default FundingPage;
