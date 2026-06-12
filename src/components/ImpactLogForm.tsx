import React, { useState } from 'react';

const ImpactLogForm: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [jobs, setJobs] = useState(0);
  const [youth, setYouth] = useState(0);

  const submit = () => {
    const entry = { date: new Date().toISOString(), summary, jobs, youth };
    const existing = JSON.parse(localStorage.getItem('impact-logs-v1') || '[]');
    existing.unshift(entry);
    localStorage.setItem('impact-logs-v1', JSON.stringify(existing));
    setSummary('');
    setJobs(0);
    setYouth(0);
    try {
      import('@/lib/analytics').then((m) => m.trackEvent('impact_log_submitted', { jobs, youth }));
    } catch {}
    alert('Impact log saved (placeholder)');
  };

  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Monthly Impact Log</h2>
        <p className="text-sm text-white/70">Quick form for stories, counts, and photos</p>
      </div>

      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Share a story or summary of this month's impact" className="w-full bg-transparent border border-white/10 rounded-md p-3 min-h-[120px]" />

      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={jobs} onChange={(e) => setJobs(Number(e.target.value))} className="bg-transparent border border-white/10 rounded-md p-2" placeholder="Jobs created" />
        <input type="number" value={youth} onChange={(e) => setYouth(Number(e.target.value))} className="bg-transparent border border-white/10 rounded-md p-2" placeholder="Youth participants" />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={submit} className="px-3 py-2 bg-success rounded-md text-white">Log this month</button>
        <button onClick={() => alert('Upload photos feature placeholder')} className="px-3 py-2 bg-white/6 rounded-md text-white/90">Add photos</button>
      </div>
    </section>
  );
};

export default ImpactLogForm;
