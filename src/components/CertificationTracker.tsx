import React from 'react';

const CertificationTracker: React.FC = () => {
  const certifications = [
    { id: 'ibcp', name: 'IBCP', progress: 45, requirements: 'Modules, capstone, community review' },
    { id: 'ccai', name: 'CCAI', progress: 10, requirements: 'Foundations, mentorship, assessment' }
  ];

  return (
    <div className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Certification Tracker</h3>
      <p className="text-sm text-white/70">Track requirements, % complete, and deadlines.</p>

      <div className="space-y-2 mt-2">
        {certifications.map((c) => (
          <div key={c.id} className="p-3 bg-white/6 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-white/70">{c.requirements}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{c.progress}%</div>
                <div className="text-sm text-white/70">Deadline: TBD</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationTracker;
