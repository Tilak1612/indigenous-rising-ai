import React from 'react';

const ImpactReport: React.FC = () => {
  const generate = () => {
    // Placeholder logic: in production, generate PDF/report aligned with TRC and funder templates
    const logs = JSON.parse(localStorage.getItem('impact-logs-v1') || '[]');
    const report = { generatedAt: new Date().toISOString(), logs };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'impact-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Impact Report</h3>
      <p className="text-sm text-white/70">Auto-generate reports aligned to TRC calls and typical funder expectations.</p>
      <button onClick={generate} className="mt-3 px-3 py-2 bg-indigo-600 rounded-md text-white">Generate report</button>
    </div>
  );
};

export default ImpactReport;
