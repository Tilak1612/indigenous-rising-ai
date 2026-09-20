import { describe, test, expect, vi, beforeEach } from 'vitest';
vi.mock('@/lib/supabase', () => ({ supabase: { auth: {} }, SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon' }));
import { fetchEnabledProviders, resetProviderCache, PROVIDER_LABEL } from '@/lib/auth-providers';

/**
 * A provider button that the backend cannot service fails on click, so the
 * Microsoft button is driven by the project's own settings endpoint: it
 * appears the moment external.azure flips true, with no redeploy.
 */
beforeEach(() => { resetProviderCache(); vi.unstubAllGlobals(); });

const settings = (external: Record<string, boolean>) =>
  vi.fn(async () => ({ ok: true, json: async () => ({ external }) }));

describe('provider detection', () => {
  test('today: Google enabled, Microsoft not', async () => {
    vi.stubGlobal('fetch', settings({ google: true, azure: false }));
    await expect(fetchEnabledProviders()).resolves.toEqual({ google: true, azure: false });
  });

  test('Microsoft appears once azure is enabled', async () => {
    vi.stubGlobal('fetch', settings({ google: true, azure: true }));
    await expect(fetchEnabledProviders()).resolves.toEqual({ google: true, azure: true });
  });

  test('a network failure never invents a provider', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await expect(fetchEnabledProviders()).resolves.toEqual({ google: true, azure: false });
  });

  test('a non-200 never invents a provider', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })));
    await expect(fetchEnabledProviders()).resolves.toEqual({ google: true, azure: false });
  });

  test('the settings endpoint is asked only once per load', async () => {
    const f = settings({ google: true, azure: true });
    vi.stubGlobal('fetch', f);
    await Promise.all([fetchEnabledProviders(), fetchEnabledProviders(), fetchEnabledProviders()]);
    expect(f).toHaveBeenCalledTimes(1);
  });

  test('labels say "Continue with", per the brand spec', () => {
    expect(PROVIDER_LABEL.google).toBe('Continue with Google');
    expect(PROVIDER_LABEL.azure).toBe('Continue with Microsoft');
  });
});
