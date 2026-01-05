import React from 'react';

const TEMPLATES = [
  { key: 'arts', name: 'Arts & Cultural Enterprises' },
  { key: 'eco-tourism', name: 'Eco-tourism & Land-Based Services' },
  { key: 'tech', name: 'Technology & Digital Services' },
  { key: 'wellness', name: 'Wellness & Traditional Healing' }
];

const PlanTemplates: React.FC = () => {
  return (
    <div className="space-y-3">
      {TEMPLATES.map((t) => (
        <div key={t.key} className="bg-white/4 p-3 rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="text-sm text-white/70">Template tailored to sector needs.</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-emerald-500 rounded-md text-white text-sm">Use template</button>
            <button className="px-3 py-1 bg-white/6 rounded-md text-white/90 text-sm">Preview</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanTemplates;
