import React from 'react';

const DataRights: React.FC = () => {
  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <h2 className="text-lg font-semibold">Data Rights</h2>
      <p className="text-sm text-white/70">Where your data lives, what OCAP means, and how to control it.</p>

      <div className="mt-3 space-y-2">
        <p className="text-sm">Data location: <strong>Canada</strong></p>
        <p className="text-sm">OCAP: Ownership, Control, Access, Possession — your community retains rights over data use.</p>
        <p className="text-sm">Controls: export, request deletion, manage sharing permissions for invited roles.</p>
      </div>
    </section>
  );
};

export default DataRights;
