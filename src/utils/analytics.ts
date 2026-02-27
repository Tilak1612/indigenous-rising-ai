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
  const payload = {
    product: PRODUCT,
    page_path: window.location.pathname,
    page_location: window.location.href,
    ...params,
  };
  window.gtag('event', eventName, payload);
  if (IS_DEV) console.log('[GA4 Event]', eventName, payload);
};
