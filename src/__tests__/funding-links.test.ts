import { describe, test, expect, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'anon' }));

import { officialLink, sourceLink, isSafeExternalUrl, recordOfficialClick } from '@/lib/funding-links';

describe('officialLink picks the most specific verified destination and labels it honestly', () => {
  test('a directory-type programme never says "Apply"', () => {
    const l = officialLink({ apply_url: 'https://nacca.ca/ifis', apply_link_type: 'directory', source_url: 'https://www.sac-isc.gc.ca/x' });
    expect(l?.url).toBe('https://nacca.ca/ifis');
    expect(l?.label).toBe('Find your local Indigenous lender');
    expect(l?.label).not.toMatch(/apply/i);
  });
  test('an application form is the only type labelled Apply', () => {
    expect(officialLink({ apply_url: 'https://funder.ca/apply', apply_link_type: 'application_form' })?.label).toBe('Apply on the official website');
    expect(officialLink({ apply_url: 'https://funder.ca/', apply_link_type: 'program_page' })?.label).toBe('View the official program page');
    expect(officialLink({ apply_url: 'https://funder.ca/', apply_link_type: 'contact' })?.label).toBe('Contact the funding organization');
  });
  test('falls back to the source page as a programme page when apply_url is missing', () => {
    const l = officialLink({ apply_url: null, apply_link_type: 'application_form', source_url: 'https://funder.ca/program' });
    expect(l).toMatchObject({ url: 'https://funder.ca/program', type: 'program_page', kind: 'source' });
  });
  test('unknown link types degrade to program_page, never to Apply', () => {
    expect(officialLink({ apply_url: 'https://funder.ca/', apply_link_type: 'something_new' })?.type).toBe('program_page');
  });
  test('returns null when nothing is a safe http(s) URL', () => {
    expect(officialLink({ apply_url: 'javascript:alert(1)', source_url: 'mailto:x@y.ca', application_url: '' })).toBeNull();
  });
});

describe('isSafeExternalUrl', () => {
  test.each(['https://a.ca', 'http://a.ca/x?y=1'])('accepts %s', (u) => expect(isSafeExternalUrl(u)).toBe(true));
  test.each(['javascript:x', 'data:text/html,x', 'ftp://a', '', null, undefined, 'not a url'])('rejects %s', (u) => expect(isSafeExternalUrl(u)).toBe(false));
});

describe('sourceLink', () => {
  test('prefers source_url and never the apply form', () => {
    expect(sourceLink({ source_url: 'https://s.ca', application_url: 'https://a.ca', apply_url: 'https://form.ca' })?.url).toBe('https://s.ca');
  });
});

describe('recordOfficialClick', () => {
  test('posts only the grant id and kind, never a user identifier', () => {
    const calls: Array<[string, RequestInit]> = [];
    vi.stubGlobal('fetch', (url: string, init: RequestInit) => { calls.push([url, init]); return Promise.resolve(new Response('')); });
    recordOfficialClick('11111111-1111-1111-1111-111111111111', 'apply');
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toMatch(/rpc\/record_funding_click$/);
    expect(JSON.parse(String(calls[0][1].body))).toEqual({ p_grant_id: '11111111-1111-1111-1111-111111111111', p_kind: 'apply' });
    vi.unstubAllGlobals();
  });
  test('does nothing without a grant id', () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    recordOfficialClick(undefined, 'apply');
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
