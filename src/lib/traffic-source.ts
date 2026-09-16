/**
 * Classifies how a visitor arrived, so organic conversions can be attributed
 * to search engines and AI assistants.
 *
 * Reliability, honestly:
 *  - utm_source=chatgpt.com is documented by OpenAI: ChatGPT adds it to links
 *    it shows, so it survives even when the browser strips the referrer.
 *  - The referrer hostnames below are what these products commonly send, but
 *    no vendor documents them. Many AI visits arrive with no referrer at all
 *    (apps, privacy settings) and are counted as direct. Treat the numbers as
 *    a floor, and check them against GA4's own referral report.
 *
 * Only the classified source is kept — never the referrer URL, which can carry
 * search terms or other personal data in its query string.
 */
export type TrafficMedium = 'ai_assistant' | 'organic_search' | 'referral' | 'direct';
export interface TrafficSource { source: string; medium: TrafficMedium }

const AI_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/^copilot\.microsoft\.com$/, 'copilot'],
  [/^gemini\.google\.com$/, 'gemini'],
  [/(^|\.)claude\.ai$/, 'claude'],
];

const AI_UTM: Record<string, string> = {
  'chatgpt.com': 'chatgpt',
  'perplexity': 'perplexity',
  'perplexity.ai': 'perplexity',
  'copilot.microsoft.com': 'copilot',
  'gemini.google.com': 'gemini',
  'claude.ai': 'claude',
};

const SEARCH_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)google\.[a-z.]+$/, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)search\.yahoo\.com$|(^|\.)yahoo\.com$/, 'yahoo'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)yandex\.[a-z]+$/, 'yandex'],
];

export function classifyTrafficSource(referrer: string, search: string, ownHost: string): TrafficSource {
  const utm = new URLSearchParams(search).get('utm_source')?.trim().toLowerCase();
  if (utm && AI_UTM[utm]) return { source: AI_UTM[utm], medium: 'ai_assistant' };

  let host = '';
  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase() : '';
  } catch {
    host = '';
  }
  if (!host || host === ownHost) return { source: '(direct)', medium: 'direct' };

  for (const [re, name] of AI_HOSTS) if (re.test(host)) return { source: name, medium: 'ai_assistant' };
  // gemini.google.com is matched above, before the generic google.* rule.
  for (const [re, name] of SEARCH_HOSTS) if (re.test(host)) return { source: name, medium: 'organic_search' };
  return { source: host, medium: 'referral' };
}

const SESSION_KEY = 'landing-traffic-source';

/**
 * Classify once per browser session (the landing page is where the referrer
 * is real; later SPA navigations would look direct) and remember the result.
 */
export function landingTrafficSource(): TrafficSource | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored) as TrafficSource;
    const result = classifyTrafficSource(document.referrer, window.location.search, window.location.hostname);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
    return result;
  } catch {
    return classifyTrafficSource(document.referrer, window.location.search, window.location.hostname);
  }
}

/** True only the first time it is called in a session. */
export function isFirstHitOfSession(): boolean {
  try {
    if (sessionStorage.getItem(`${SESSION_KEY}-reported`)) return false;
    sessionStorage.setItem(`${SESSION_KEY}-reported`, '1');
    return true;
  } catch {
    return false;
  }
}
