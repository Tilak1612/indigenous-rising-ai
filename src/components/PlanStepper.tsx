import React, { useState, useEffect } from 'react';
import useAICopilot from '@/hooks/useAICopilot';
import { trackEvent } from '@/lib/analytics';
import { exportBankReadyPDF } from '@/lib/planExport';

const STEPS = [
  'Vision',
  'Community Impact',
  'Revenue',
  'Operations',
  'Seven Generations',
  'Governance'
];

const STORAGE_KEY = 'plan-draft-v1';

const PlanStepper: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { rewriteSection } = useAICopilot();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAnswers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const step = STEPS[index];

  return (
    <div className="bg-white/4 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">Step {index + 1} of {STEPS.length}</p>
          <h2 className="text-xl font-semibold">{step}</h2>
        </div>

        <div className="text-sm text-white/70">Progress: {Math.round(((index + 1) / STEPS.length) * 100)}%</div>
      </div>

      <textarea
        value={answers[step] || ''}
        onChange={(e) => setAnswers({ ...answers, [step]: e.target.value })}
        className="w-full bg-transparent border border-white/10 rounded-md p-3 min-h-[120px] text-white"
        placeholder={`Write your ${step.toLowerCase()}...`}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={async () => {
            const text = answers[step] || '';
            const rewritten = await rewriteSection(step, text);
            setAnswers({ ...answers, [step]: rewritten });
            trackEvent('ai_copilot_used', { step });
          }}
          className="px-3 py-2 bg-emerald-500 rounded-md text-white text-sm"
        >
          Use AI co-pilot
        </button>

        <button
          onClick={() => exportBankReadyPDF(answers)}
          className="px-3 py-2 bg-indigo-600 rounded-md text-white text-sm"
        >
          Export bank-ready PDF
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="px-3 py-2 bg-white/6 rounded-md text-white/90 text-sm disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={() => {
              setIndex((i) => Math.min(STEPS.length - 1, i + 1));
              trackEvent('plan_section_completed', { step });
            }}
            className="px-3 py-2 bg-white/8 rounded-md text-white text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanStepper;
