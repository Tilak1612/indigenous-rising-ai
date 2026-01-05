import React from 'react';

const DataExportControls: React.FC = () => {
  const exportData = () => {
    const data = { message: 'This is a placeholder export of your data.' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const requestDeletion = () => {
    // In production this would create a request for admins and follow a compliance flow.
    alert('Data deletion request submitted (placeholder)');
  };

  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Export & Deletion</h3>
      <p className="text-sm text-white/70">Export your data or request deletion in accordance with data rights.</p>

      <div className="flex items-center gap-2 mt-3">
        <button onClick={exportData} className="px-3 py-2 bg-indigo-600 rounded-md text-white">Export data</button>
        <button onClick={requestDeletion} className="px-3 py-2 bg-red-600 rounded-md text-white">Request deletion</button>
      </div>
    </section>
  );
};

export default DataExportControls;
