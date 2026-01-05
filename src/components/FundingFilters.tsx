import React, { useState, useEffect } from 'react';

type Props = {
  onChange?: (filters: Record<string, any>) => void;
};

const provinces = ['All', 'Ontario', 'Quebec', 'British Columbia', 'Alberta'];
const industries = ['All', 'Arts', 'Eco-tourism', 'Technology', 'Wellness'];

const FundingFilters: React.FC<Props> = ({ onChange }) => {
  const [province, setProvince] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [minAmount, setMinAmount] = useState('0');
  const [type, setType] = useState('All');

  useEffect(() => {
    onChange?.({ province, industry, minAmount: Number(minAmount), type });
  }, [province, industry, minAmount, type, onChange]);

  return (
    <div className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Filters</h3>

      <div>
        <label className="text-sm text-white/70">Province</label>
        <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full mt-1 bg-transparent border border-white/10 rounded-md p-2">
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm text-white/70">Industry</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full mt-1 bg-transparent border border-white/10 rounded-md p-2">
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm text-white/70">Min amount</label>
        <input type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="w-full mt-1 bg-transparent border border-white/10 rounded-md p-2" />
      </div>

      <div>
        <label className="text-sm text-white/70">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 bg-transparent border border-white/10 rounded-md p-2">
          <option>All</option>
          <option>Grant</option>
          <option>Loan</option>
          <option>Equity</option>
        </select>
      </div>
    </div>
  );
};

export default FundingFilters;
