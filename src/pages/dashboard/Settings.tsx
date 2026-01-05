import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-neutral-900 text-white py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
        <section className="bg-white/5 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="mt-2">Email: {user?.email}</p>
        </section>
        <section className="bg-white/5 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Preferences</h2>
          <p className="mt-2">Manage language, notifications and connected accounts here.</p>
        </section>
      </div>
    </main>
  );
};

export default Settings;
