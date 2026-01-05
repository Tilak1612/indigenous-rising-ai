import React from 'react';

type Props = {
  stage: 'Starting' | 'Growing' | 'Scaling' | string;
  topActions: string[];
  progress: number; // 0-100
};

const JourneyCard: React.FC<Props> = ({ stage, topActions, progress }) => {
  return (
    <section className="bg-gradient-to-r from-indigo-600/30 to-emerald-600/20 p-6 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">Journey stage</p>
          <h2 className="text-2xl font-semibold">{stage}</h2>
          <p className="text-sm text-white/70 mt-2">Top actions</p>
          <ul className="mt-2 space-y-1">
            {topActions.slice(0, 3).map((a, i) => (
              <li key={i} className="text-sm text-white">
                • {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-40">
          <p className="text-sm text-white/70">Progress to next milestone</p>
          <div className="mt-2 bg-white/6 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-emerald-400"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-white">{progress}%</p>
        </div>
      </div>
    </section>
  );
};

export default JourneyCard;
