import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

/**
 * Which external providers GoTrue will actually service, read at runtime from
 * the project's own settings endpoint.
 *
 * A button for a provider that is not enabled fails on click, so Microsoft
 * appears only once `external.azure` is true — i.e. the moment the Entra app
 * is registered and the provider is switched on in Supabase, with no code
 * change or redeploy. Google is enabled today.
 */
export type ProviderId = 'google' | 'azure';

let cache: Promise<Record<ProviderId, boolean>> | null = null;

export function fetchEnabledProviders(): Promise<Record<ProviderId, boolean>> {
  if (cache) return cache;
  cache = (async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_ANON_KEY },
      });
      if (!res.ok) throw new Error(`settings ${res.status}`);
      const body = (await res.json()) as { external?: Record<string, boolean> };
      return {
        google: body.external?.google === true,
        azure: body.external?.azure === true,
      };
    } catch {
      // Network failure must not hide the provider that is known to work:
      // Google stays offered, Microsoft stays hidden until confirmed.
      return { google: true, azure: false };
    }
  })();
  return cache;
}

/** Test seam. */
export function resetProviderCache(): void {
  cache = null;
}

export const PROVIDER_LABEL: Record<ProviderId, string> = {
  google: 'Continue with Google',
  azure: 'Continue with Microsoft',
};
