import { Linking } from 'react-native';

import { canOpenOutgoing, openOutgoing, outgoingLinkDecision, siteUrl } from './links';

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => ({ type: 'opened' })) }));

const WebBrowser = jest.requireMock('expo-web-browser') as { openBrowserAsync: jest.Mock };

// Expected outcomes are written out per case rather than derived, so a change
// in the policy or the parser shows up as a failing row.
type Row = [label: string, url: string, ios: string, android: string, web: string];
const OK = 'ok';

const ROWS: Row[] = [
  // Pages the native app links today: kept everywhere.
  ['privacy', 'https://www.indigenousrising.ai/privacy', OK, OK, OK],
  ['terms', 'https://www.indigenousrising.ai/terms', OK, OK, OK],
  ['data rights', 'https://www.indigenousrising.ai/data-rights', OK, OK, OK],
  ['faq', 'https://www.indigenousrising.ai/faq', OK, OK, OK],
  ['account deletion', 'https://www.indigenousrising.ai/account-deletion', OK, OK, OK],
  ['trailing slash', 'https://www.indigenousrising.ai/privacy/', OK, OK, OK],
  ['bare domain', 'https://indigenousrising.ai/faq', OK, OK, OK],
  ['upper-case host', 'https://WWW.IndigenousRising.AI/terms', OK, OK, OK],
  ['mailto support', 'mailto:help@indigenousrising.ai', OK, OK, OK],

  // Native context (?context=app): the website omits its purchase prompts.
  ['privacy in native context', 'https://www.indigenousrising.ai/privacy?context=app', OK, OK, OK],
  ['faq in native context', 'https://www.indigenousrising.ai/faq?context=app', OK, OK, OK],
  ['profile in native context', 'https://www.indigenousrising.ai/dashboard/profile?context=app', OK, OK, OK],
  ['profile in native context, trailing slash', 'https://www.indigenousrising.ai/dashboard/profile/?context=app', OK, OK, OK],
  ['profile, context value case differs', 'https://www.indigenousrising.ai/dashboard/profile?context=APP', 'site-path', 'site-path', OK],
  ['profile, extra query', 'https://www.indigenousrising.ai/dashboard/profile?context=app&next=/pricing', 'site-path', 'site-path', OK],
  ['profile, context plus hash', 'https://www.indigenousrising.ai/dashboard/profile?context=app#pricing', 'site-path', 'site-path', OK],
  ['other dashboard page in native context', 'https://www.indigenousrising.ai/dashboard/settings?context=app', 'site-path', 'site-path', OK],
  ['pricing in native context', 'https://www.indigenousrising.ai/pricing?context=app', 'site-path', 'site-path', OK],
  ['dot segments from profile to pricing', 'https://www.indigenousrising.ai/dashboard/profile/../../pricing?context=app', 'site-path', 'site-path', OK],
  ['encoded profile path', 'https://www.indigenousrising.ai/dashboard/%70rofile?context=app', 'site-path', 'site-path', OK],
  ['trailing host dot, profile in native context', 'https://www.indigenousrising.ai./dashboard/profile?context=app', OK, OK, OK],

  // Without native context the full dashboard carries Upgrade -> /pricing.
  ['dashboard profile', 'https://www.indigenousrising.ai/dashboard/profile', 'site-path', 'site-path', OK],
  ['pricing', 'https://www.indigenousrising.ai/pricing', 'site-path', 'site-path', OK],
  ['home pricing anchor', 'https://www.indigenousrising.ai/#pricing', 'site-path', 'site-path', OK],
  ['subdomain', 'https://app.indigenousrising.ai/privacy', OK, OK, OK],
  ['subdomain checkout', 'https://pay.indigenousrising.ai/checkout', 'site-path', 'site-path', OK],
  ['plain http to our site', 'http://www.indigenousrising.ai/privacy', 'site-path', 'site-path', OK],
  ['query on a legal page', 'https://www.indigenousrising.ai/faq?next=/pricing', 'site-path', 'site-path', OK],
  ['hash on a legal page', 'https://www.indigenousrising.ai/faq#pricing', 'site-path', 'site-path', OK],

  // Dot segments resolve before the path check.
  ['dot segments to pricing', 'https://www.indigenousrising.ai/privacy/../pricing', 'site-path', 'site-path', OK],
  ['encoded dot segments to pricing', 'https://www.indigenousrising.ai/%2e%2e/pricing', 'site-path', 'site-path', OK],
  ['dot segments to privacy', 'https://www.indigenousrising.ai/dashboard/../privacy', OK, OK, OK],

  // Trailing host dots cannot turn our site into "someone else's".
  ['trailing host dot', 'https://www.indigenousrising.ai./pricing', 'site-path', 'site-path', OK],
  ['trailing host dot, legal page', 'https://www.indigenousrising.ai./faq', OK, OK, OK],
  ['double trailing host dot', 'https://www.indigenousrising.ai../faq', 'host', 'host', 'host'],

  // Encoded and control-character spellings.
  ['percent-encoded host dot', 'https://www.indigenousrising%2Eai/pricing', 'site-path', 'site-path', OK],
  ['percent-encoded path letter', 'https://www.indigenousrising.ai/priv%61cy', 'site-path', 'site-path', OK],
  ['backslashes', 'https:\\\\www.indigenousrising.ai\\pricing', 'site-path', 'site-path', OK],
  ['tab and newline inside', ' https://www.indigenousrising.ai/pri\tcing\n', 'site-path', 'site-path', OK],
  ['NUL in host', 'https://www.indigenousrising.ai\u0000.evil.example/', 'unparseable', 'unparseable', 'unparseable'],
  ['encoded NUL in host', 'https://www.indigenousrising.ai%00.evil.example/', 'unparseable', 'unparseable', 'unparseable'],
  ['look-alike is not our site', 'https://www.indigenousrising.ai.example.com/pricing', OK, OK, OK],

  // Scheme and credential hygiene applies on every platform.
  ['javascript', 'javascript:alert(1)', 'scheme', 'scheme', 'scheme'],
  ['javascript with tab', 'java\tscript:alert(1)', 'scheme', 'scheme', 'scheme'],
  ['data', 'data:text/html,hi', 'scheme', 'scheme', 'scheme'],
  ['intent', 'intent://pay#Intent;end', 'scheme', 'scheme', 'scheme'],
  ['credentials', 'https://user:pw@www.indigenousrising.ai/faq', 'credentials', 'credentials', 'credentials'],
  ['relative', '/pricing', 'unparseable', 'unparseable', 'unparseable'],
  ['empty', '', 'unparseable', 'unparseable', 'unparseable'],

  // Our own subscription checkout (Checkout Sessions) and billing portal.
  ['stripe checkout', 'https://checkout.stripe.com/c/pay/cs_test_x', 'payment', 'payment', OK],
  ['stripe billing portal', 'https://billing.stripe.com/p/session/x', 'payment', 'payment', OK],
  ['stripe checkout trailing dot', 'https://checkout.stripe.com./c/pay/x', 'payment', 'payment', OK],
  ['stripe checkout upper case', 'https://CHECKOUT.STRIPE.COM/c/pay/x', 'payment', 'payment', OK],
  // Other Stripe hosts are not ours (the site creates no Payment Links), so a
  // funder's payment or donation page there is left alone.
  ['stripe payment link', 'https://buy.stripe.com/test_x', OK, OK, OK],
  ['stripe donation page', 'https://donate.stripe.com/x', OK, OK, OK],
  ['stripe docs', 'https://stripe.com/en-ca/legal', OK, OK, OK],

  // Genuine funding and legal resources from the catalogue stay openable.
  ['ISC programme', 'https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236', OK, OK, OK],
  ['NACCA', 'https://nacca.ca/aboriginal-entrepreneurship-program/', OK, OK, OK],
  ['Futurpreneur', 'https://www.futurpreneur.ca/en/get-started/indigenous-entrepreneur-startup-program/', OK, OK, OK],
  ['funder over plain http', 'http://example-funder.ca/apply', OK, OK, OK],
  ['funder application with query', 'https://forms.example.ca/apply?program=aep&lang=en#step-1', OK, OK, OK],
  ['FNIGC OCAP page', 'https://fnigc.ca/ocap-training/', OK, OK, OK],
  ['Privacy Commissioner', 'https://www.priv.gc.ca/en/', OK, OK, OK],
];

describe('outgoingLinkDecision', () => {
  test.each(ROWS)('%s', (_label, url, ios, android, web) => {
    const outcome = (platform: string) => {
      const d = outgoingLinkDecision(url, platform);
      return d.ok ? OK : d.reason;
    };
    expect({ ios: outcome('ios'), android: outcome('android'), web: outcome('web') }).toEqual({ ios, android, web });
  });

  test('opens the parser-normalised URL, not the raw string', () => {
    const d = outgoingLinkDecision(' https://WWW.IndigenousRising.ai/pri\tvacy\n', 'ios');
    expect(d).toEqual({ ok: true, href: 'https://www.indigenousrising.ai/privacy', opener: 'browser' });
  });

  test('mailto keeps its subject', () => {
    expect(outgoingLinkDecision('mailto:help@indigenousrising.ai?subject=Hi', 'android')).toEqual({
      ok: true,
      href: 'mailto:help@indigenousrising.ai?subject=Hi',
      opener: 'mail',
    });
  });
});

describe('canOpenOutgoing', () => {
  test('null and undefined are not openable', () => {
    expect(canOpenOutgoing(null, 'ios')).toBe(false);
    expect(canOpenOutgoing(undefined, 'web')).toBe(false);
  });
  test('defaults to the running platform (jest-expo runs as ios)', () => {
    expect(canOpenOutgoing('https://www.indigenousrising.ai/dashboard/profile')).toBe(false);
    expect(canOpenOutgoing('https://www.indigenousrising.ai/dashboard/profile', 'web')).toBe(true);
    expect(canOpenOutgoing('https://www.indigenousrising.ai/dashboard/profile?context=app')).toBe(true);
  });
});

describe('siteUrl', () => {
  test('adds the native-context parameter', () => {
    expect(siteUrl('/dashboard/profile')).toBe('https://www.indigenousrising.ai/dashboard/profile?context=app');
    expect(siteUrl('/faq')).toBe('https://www.indigenousrising.ai/faq?context=app');
  });
  test('every page the app links is openable on native', () => {
    for (const p of ['/dashboard/profile', '/privacy', '/terms', '/data-rights', '/faq', '/account-deletion']) {
      expect(canOpenOutgoing(siteUrl(p), 'ios')).toBe(true);
      expect(canOpenOutgoing(siteUrl(p), 'android')).toBe(true);
    }
  });
});

describe('openOutgoing', () => {
  let openURL: jest.SpyInstance;
  beforeEach(() => {
    WebBrowser.openBrowserAsync.mockClear();
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });
  afterEach(() => openURL.mockRestore());

  test('web pages go to the in-app browser', async () => {
    await expect(openOutgoing('https://nacca.ca/', 'ios')).resolves.toBe(true);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://nacca.ca/');
    expect(openURL).not.toHaveBeenCalled();
  });

  test('mailto goes to the mail app', async () => {
    await expect(openOutgoing('mailto:help@indigenousrising.ai', 'android')).resolves.toBe(true);
    expect(openURL).toHaveBeenCalledWith('mailto:help@indigenousrising.ai');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  test('a refused link opens nothing on native', async () => {
    await expect(openOutgoing('https://www.indigenousrising.ai/dashboard/profile', 'ios')).resolves.toBe(false);
    await expect(openOutgoing('https://checkout.stripe.com/x', 'android')).resolves.toBe(false);
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
  });

  test('native opens the profile in native context', async () => {
    await expect(openOutgoing(siteUrl('/dashboard/profile'), 'android')).resolves.toBe(true);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://www.indigenousrising.ai/dashboard/profile?context=app');
  });

  test('web keeps the website link to the profile page', async () => {
    await expect(openOutgoing('https://www.indigenousrising.ai/dashboard/profile', 'web')).resolves.toBe(true);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://www.indigenousrising.ai/dashboard/profile');
  });

  test('javascript: is refused on web too', async () => {
    await expect(openOutgoing('javascript:alert(1)', 'web')).resolves.toBe(false);
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });
});
