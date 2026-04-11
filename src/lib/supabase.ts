import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// External Supabase project: indigenousrising-prod
const EXTERNAL_SUPABASE_URL = 'https://upxojfcdtmqtcvgbjsym.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweG9qZmNkdG1xdGN2Z2Jqc3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzAwMDgsImV4cCI6MjA4NzU0NjAwOH0.tAaSqKPPy8nfj6u8lby5Fmuqdiy1CezxnSUpWfA2yP0';

// Do NOT pass `storage: localStorage` here — referencing localStorage at module-eval
// time can throw in non-browser contexts (SSR, workers, restricted incognito modes),
// breaking every file that transitively imports this module. The Supabase client
// defaults to localStorage in browsers and gracefully falls back to in-memory storage
// elsewhere, which is the behavior we want.
export const supabase = createClient<Database>(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

if (typeof window !== 'undefined') {
  console.log('[supabase] client initialised for', EXTERNAL_SUPABASE_URL);
}
