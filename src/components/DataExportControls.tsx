import React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const DataExportControls: React.FC = () => {
  const exportData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be signed in to export data');
      return;
    }

    const [profileResult, subResult] = await Promise.all([
      supabase.from('profiles').select('id, email, full_name, created_at, updated_at').eq('id', user.id).single(),
      supabase.from('subscriptions').select('stripe_product_id, status, current_period_start, current_period_end').eq('user_id', user.id).maybeSingle(),
    ]);

    const data = {
      exportDate: new Date().toISOString(),
      profile: profileResult.data ?? { email: user.email },
      subscription: subResult.data ?? null,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'indigenous-rising-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const requestDeletion = () => {
    toast.info('To request account deletion, please contact help@indigenousrising.ai with subject "Data Deletion Request".');
  };

  return (
    <section className="bg-white/4 p-4 rounded-md space-y-3">
      <h3 className="font-medium">Export & Deletion</h3>
      <p className="text-sm text-white/70">Export your data or request deletion in accordance with data rights.</p>

      <div className="flex items-center gap-2 mt-3">
        <button onClick={exportData} className="px-3 py-2 bg-indigo-600 rounded-md text-white">Export data</button>
        <button onClick={requestDeletion} className="px-3 py-2 bg-red-600 rounded-md text-white">Request deletion</button>
      </div>
    </section>
  );
};

export default DataExportControls;
