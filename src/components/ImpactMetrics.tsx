import React, { useState } from 'react';

type Metric = {
  id: string;
  name: string;
  value: number | string;
  description?: string;
};

const DEFAULT_METRICS: Metric[] = [
  { id: 'jobs', name: 'Jobs Created', value: 0, description: 'Number of paid positions' },
  { id: 'youth', name: 'Youth Engagement', value: 0, description: 'Youth participants in programs' },
  { id: 'language', name: 'Language Revitalization', value: 'N/A', description: 'Programs supporting language' },
  { id: 'wellness', name: 'Wellness Programs', value: 0, description: 'Wellness initiatives supported' }
];

const ImpactMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>(DEFAULT_METRICS);
  const [customName, setCustomName] = useState('');

  const addCustom = () => {
    if (!customName.trim()) return;
    setMetrics((m) => [...m, { id: `custom-${Date.now()}`, name: customName.trim(), value: 0 }]);
    setCustomName('');
  };

  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Impact Metrics</h2>
        <p className="text-sm text-white/70">Prebuilt metrics with option to add custom ones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.id} className="p-3 bg-white/6 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{m.name}</p>
                {m.description && <p className="text-sm text-white/70">{m.description}</p>}
              </div>
              <div className="text-2xl font-semibold">{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Add custom metric" className="flex-1 bg-transparent border border-white/10 rounded-md p-2" />
        <button onClick={addCustom} className="px-3 py-1 bg-success rounded-md text-white text-sm">Add</button>
      </div>
    </section>
  );
};

export default ImpactMetrics;
