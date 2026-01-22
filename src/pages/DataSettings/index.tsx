import React from 'react';
import DataRights from '@/components/DataRights';
import DataExportControls from '@/components/DataExportControls';
import RoleInvites from '@/components/RoleInvites';
import ComplianceChecklist from '@/components/ComplianceChecklist';

const DataSettingsPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">Data & Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage data rights, invites, exports, and compliance status.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <DataRights />
            <DataExportControls />
          </div>

          <aside className="space-y-4">
            <RoleInvites />
            <ComplianceChecklist />
          </aside>
        </section>
      </div>
    </main>
  );
};

export default DataSettingsPage;
