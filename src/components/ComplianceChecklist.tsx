import React, { useState, useEffect } from 'react';

const CHECKS = [
  { id: 'pipeda', label: 'PIPEDA' },
  { id: 'casl', label: 'CASL' },
  { id: 'aoda', label: 'AODA' },
  { id: 'ocap', label: 'OCAP' },
  { id: 'trc', label: 'TRC-aligned' }
];

const ComplianceChecklist: React.FC = () => {
  const [status, setStatus] = useState<Record<string, 'green' | 'yellow' | 'red'>>({});

  useEffect(() => {
    const raw = localStorage.getItem('compliance-status-v1');
    if (raw) setStatus(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem('compliance-status-v1', JSON.stringify(status));
  }, [status]);

  const cycle = (id: string) => {
    const current = status[id] || 'red';
    const next = current === 'red' ? 'yellow' : current === 'yellow' ? 'green' : 'red';
    setStatus({ ...status, [id]: next });
  };

  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Compliance Checklist</h3>
      <p className="text-sm text-white/70">Track PIPEDA, CASL, AODA, OCAP, and TRC alignment with quick status indicators.</p>

      <div className="mt-3 space-y-2">
        {CHECKS.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-2 bg-white/6 rounded-md">
            <div>
              <p className="font-medium">{c.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status[c.id] === 'green' ? 'bg-success' : status[c.id] === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`} />
              <button onClick={() => cycle(c.id)} className="px-2 py-1 bg-white/6 rounded-md text-white/90 text-sm">Cycle status</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ComplianceChecklist;
