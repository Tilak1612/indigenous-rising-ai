import React, { useMemo } from 'react';

type Opportunity = {
  id: string;
  title: string;
  province: string;
  industry: string;
  amount: number;
  type: string;
  description?: string;
};

const MOCK_OPPS: Opportunity[] = [
  { id: '1', title: 'Arts Support Grant', province: 'Ontario', industry: 'Arts', amount: 5000, type: 'Grant', description: 'Support for Indigenous artists.' },
  { id: '2', title: 'Eco-Tourism Seed Fund', province: 'British Columbia', industry: 'Eco-tourism', amount: 25000, type: 'Loan', description: 'Seed capital for land-based tourism.' },
  { id: '3', title: 'Digital Skills Equity', province: 'All', industry: 'Technology', amount: 10000, type: 'Grant', description: 'Grow digital businesses.' }
];

const computeFitScore = (profile: Record<string, any>, opp: Opportunity) => {
  // simple heuristic placeholder
  let score = 50;
  if (!profile) return score;
  if (profile.industry && profile.industry !== 'All' && profile.industry === opp.industry) score += 20;
  if (profile.province && profile.province !== 'All' && (profile.province === opp.province || opp.province === 'All')) score += 15;
  if (opp.amount <= (profile.requestedAmount || 999999)) score += 10;
  return Math.min(100, score);
};

const FundingList: React.FC<{ filters?: Record<string, any> }> = ({ filters = {} }) => {
  const fundingProfile = useMemo(() => {
    const raw = localStorage.getItem('funding-profile-v1');
    return raw ? JSON.parse(raw) : { industry: 'All', province: 'All', requestedAmount: 10000 };
  }, []);

  const results = useMemo(() => {
    return MOCK_OPPS.filter((o) => {
      if (filters.province && filters.province !== 'All' && o.province !== filters.province && o.province !== 'All') return false;
      if (filters.industry && filters.industry !== 'All' && o.industry !== filters.industry) return false;
      if (filters.minAmount && o.amount < (filters.minAmount || 0)) return false;
      if (filters.type && filters.type !== 'All' && o.type !== filters.type) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Opportunities</h2>
        <p className="text-sm text-white/70">Showing {results.length} matches — Fit score shown per your profile</p>
      </div>

      {results.map((opp) => (
        <div key={opp.id} className="bg-white/4 p-4 rounded-md flex items-start justify-between">
          <div>
            <h3 className="font-medium">{opp.title}</h3>
            <p className="text-sm text-white/70 mt-1">{opp.description}</p>
            <p className="text-sm text-white/60 mt-1">{opp.province} • {opp.type} • ${opp.amount.toLocaleString()}</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-white/70">Fit score</div>
            <div className="mt-2 text-2xl font-semibold">{computeFitScore(fundingProfile, opp)}%</div>
            <button
              className="mt-3 px-3 py-1 bg-emerald-500 rounded-md text-white text-sm"
              onClick={() => {
                try {
                  // record analytics
                  import('@/lib/analytics').then((m) => m.trackEvent('funding_application_started', { opportunityId: opp.id, title: opp.title }));
                } catch {}
                alert('Open application workspace (placeholder)');
              }}
            >
              Start application
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FundingList;
