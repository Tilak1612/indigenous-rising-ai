import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Read from environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).
// The anon key is client-safe (designed to be public) but using env vars
// allows rotation without a code deploy.
const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Do NOT pass `storage: localStorage` here — referencing localStorage at module-eval
// time can throw in non-browser contexts (SSR, workers, restricted incognito modes),
// breaking every file that transitively imports this module. The Supabase client
// defaults to localStorage in browsers and gracefully falls back to in-memory storage
// elsewhere, which is the behavior we want.
//
// Config choices explained:
// - persistSession: session survives page reloads via localStorage
// - autoRefreshToken: client silently refreshes JWT before expiry
// - detectSessionInUrl: false — we are NOT an OAuth provider callback; disabling
//   this prevents the client from trying to parse URL fragments on every load,
//   which avoids a code path that has been observed to hang getSession() on
//   first load when the cached token is present. Must be explicitly false,
//   the default is true which breaks our use case.
// - flowType: 'pkce' — deterministic auth flow; avoids legacy implicit flow paths
// - storageKey: pin the exact localStorage key so there's no ambiguity
export { EXTERNAL_SUPABASE_URL as SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY as SUPABASE_ANON_KEY };

export const supabase = createClient<Database>(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    storageKey: 'sb-upxojfcdtmqtcvgbjsym-auth-token',
  },
});
