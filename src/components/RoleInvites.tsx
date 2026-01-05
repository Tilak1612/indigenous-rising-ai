import React, { useState } from 'react';

const RoleInvites: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Advisor');

  const sendInvite = () => {
    // Placeholder: in production, call API to send invite and manage roles
    alert(`Invite sent to ${email} as ${role} (placeholder)`);
    setEmail('');
  };

  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Invite Roles</h3>
      <p className="text-sm text-white/70">Invite Elders, council, or advisors with granular permissions.</p>

      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full mt-2 bg-transparent border border-white/10 rounded-md p-2" />

      <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-2 bg-transparent border border-white/10 rounded-md p-2">
        <option>Advisor</option>
        <option>Elder</option>
        <option>Council</option>
        <option>Viewer</option>
      </select>

      <div className="mt-3">
        <button onClick={sendInvite} className="px-3 py-2 bg-emerald-500 rounded-md text-white">Send invite</button>
      </div>
    </section>
  );
};

export default RoleInvites;
