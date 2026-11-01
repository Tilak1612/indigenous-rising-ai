import { Linking } from 'react-native';

import { canOpenOutgoing, openOutgoing, outgoingLinkDecision } from './links';

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

  // The concrete purchase route: dashboard pages carry Upgrade -> /pricing.
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

  // Payment processors.
  ['stripe checkout', 'https://checkout.stripe.com/c/pay/cs_test_x', 'payment', 'payment', OK],
  ['stripe billing portal', 'https://billing.stripe.com/p/session/x', 'payment', 'payment', OK],
  ['stripe trailing dot', 'https://buy.stripe.com./x', 'payment', 'payment', OK],

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

  test('web keeps the website link to the profile page', async () => {
    await expect(openOutgoing('https://www.indigenousrising.ai/dashboard/profile', 'web')).resolves.toBe(true);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://www.indigenousrising.ai/dashboard/profile');
  });

  test('javascript: is refused on web too', async () => {
    await expect(openOutgoing('javascript:alert(1)', 'web')).resolves.toBe(false);
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });
});
