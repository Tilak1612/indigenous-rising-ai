import { landingTrafficSource, isFirstHitOfSession } from '@/lib/traffic-source';

const PRODUCT = 'indigenousrising';
const IS_DEV = import.meta.env.DEV;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const trackPageView = (path: string, title: string) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: title,
    product: PRODUCT,
  });
  if (IS_DEV) console.log('[GA4 PageView]', path, title);
};

export const trackEvent = (
  eventName: string,
  params: Record<string, unknown> = {}
) => {
  if (typeof window.gtag !== 'function') return;
  // Every event carries how this session arrived, so a signup or a checkout
  // can be attributed to ChatGPT, Perplexity, Google, etc. — not only the
  // landing page_view, which GA4 would otherwise attribute alone.
  const landing = landingTrafficSource();
  const payload = {
    product: PRODUCT,
    page_path: window.location.pathname,
    page_location: window.location.href,
    ...(landing ? { traffic_source: landing.source, traffic_medium: landing.medium } : {}),
    ...params,
  };
  window.gtag('event', eventName, payload);
  if (IS_DEV) console.log('[GA4 Event]', eventName, payload);
};

/**
 * One event per session when the visitor came from an AI assistant, so AI
 * discovery shows up as its own line in GA4 rather than inside "referral".
 */
export const trackAiReferral = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const landing = landingTrafficSource();
  if (!landing || landing.medium !== 'ai_assistant') return;
  if (!isFirstHitOfSession()) return;
  window.gtag('event', 'ai_referral', {
    product: PRODUCT,
    ai_source: landing.source,
    landing_page: window.location.pathname,
  });
};
