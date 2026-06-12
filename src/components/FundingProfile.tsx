import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'funding-profile-v1';

const FundingProfile: React.FC = () => {
  const [profile, setProfile] = useState({ name: '', province: 'All', industry: 'All', requestedAmount: 10000 });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setProfile(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Funding Profile</h3>
      <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Business name" className="w-full mt-1 bg-transparent border border-white/10 rounded-md p-2" />

      <div className="grid grid-cols-2 gap-2">
        <select value={profile.province} onChange={(e) => setProfile({ ...profile, province: e.target.value })} className="bg-transparent border border-white/10 rounded-md p-2">
          <option>All</option>
          <option>Ontario</option>
          <option>Quebec</option>
          <option>British Columbia</option>
          <option>Alberta</option>
        </select>

        <select value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} className="bg-transparent border border-white/10 rounded-md p-2">
          <option>All</option>
          <option>Arts</option>
          <option>Eco-tourism</option>
          <option>Technology</option>
          <option>Wellness</option>
        </select>
      </div>

      <input type="number" value={profile.requestedAmount} onChange={(e) => setProfile({ ...profile, requestedAmount: Number(e.target.value) })} className="w-full mt-1 bg-transparent border border-white/10 rounded-md p-2" />

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 bg-success rounded-md text-white text-sm" onClick={() => alert('Profile saved')}>Save profile</button>
        <button className="px-3 py-1 bg-white/6 rounded-md text-white/90 text-sm" onClick={() => { localStorage.removeItem(STORAGE_KEY); setProfile({ name: '', province: 'All', industry: 'All', requestedAmount: 10000 }); }}>Reset</button>
      </div>
    </div>
  );
};

export default FundingProfile;
