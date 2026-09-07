/**
 * Cal.com official inline embed, loaded on demand.
 *
 * This is Cal's own embed.js loader, transcribed rather than pulled in as a
 * package: @calcom/embed-react would add a dependency and ship on every
 * route, and the booking page is one route most visitors never open. The
 * script is fetched only when that page mounts.
 *
 * The site runs a strict CSP, so app.cal.com had to be allowed in
 * script-src, frame-src and connect-src (see vercel.json). Without those the
 * embed is blocked outright and the page falls back to the direct link —
 * which is exactly why the fallback exists rather than being decorative.
 */

export const CAL_LINK = 'team/brainfy-ai/indigenous-rising-demo';
export const CAL_ORIGIN = 'https://cal.com';
export const CAL_DIRECT_URL = `${CAL_ORIGIN}/${CAL_LINK}`;
export const CAL_NAMESPACE = 'indigenous-rising-demo';

const EMBED_SRC = 'https://app.cal.com/embed/embed.js';

type CalFn = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
  loaded?: boolean;
  q?: unknown[];
};

declare global {
  interface Window { Cal?: CalFn }
}

let initialised = false;

/**
 * Loads the embed and mounts the inline calendar into `selector`.
 *
 * The initialiser below is Cal's official snippet: the shim itself injects
 * embed.js and embed.js then drains the queue the shim built. Injecting the
 * script separately and calling init afterwards does NOT work — the script
 * loads, the namespace exists, and `inline` renders nothing. Measured:
 * scriptLoaded true, Cal a function, ns present, mount node empty.
 *
 * Success is an IFRAME in the mount node, nothing less. An earlier version
 * resolved on Cal's own `loaded` flag, which the shim sets the instant it
 * injects the script rather than when the script runs — so with app.cal.com
 * blocked it reported success and rendered an empty box: no calendar, no
 * error, no fallback.
 */
export const loadAndMountCal = async (selector: string, timeoutMs = 15000): Promise<void> => {
  if (typeof window === 'undefined') throw new Error('Cal embed requires a browser');
  const w = window as Window & { Cal?: CalFn };

  if (!w.Cal) {
    const push = (fn: { q?: unknown[] }, args: IArguments) => { fn.q = fn.q ?? []; fn.q.push(args); };
    const cal = function (this: unknown) {
      const c = w.Cal as CalFn;
      if (!c.loaded) {
        c.ns = {};
        c.q = c.q ?? [];
        document.head.appendChild(
          Object.assign(document.createElement('script'), { src: EMBED_SRC, async: true }),
        );
        c.loaded = true;
      }
      // eslint-disable-next-line prefer-rest-params
      const ar = arguments;
      if (ar[0] === 'init') {
        const api = function (this: unknown) {
          // eslint-disable-next-line prefer-rest-params
          push(api as unknown as { q?: unknown[] }, arguments);
        } as CalFn;
        api.q = api.q ?? [];
        const ns = ar[1];
        if (typeof ns === 'string') {
          c.ns![ns] = c.ns![ns] ?? api;
          push(c.ns![ns] as unknown as { q?: unknown[] }, ar);
          push(c as unknown as { q?: unknown[] }, ['initNamespace', ns] as unknown as IArguments);
        } else push(c as unknown as { q?: unknown[] }, ar);
        return;
      }
      push(c as unknown as { q?: unknown[] }, ar);
    } as unknown as CalFn;
    w.Cal = cal;
  }

  if (!initialised) {
    w.Cal!('init', CAL_NAMESPACE, { origin: CAL_ORIGIN });
    initialised = true;
  }
  const ns = w.Cal!.ns?.[CAL_NAMESPACE];
  (ns ?? w.Cal!)('inline', {
    elementOrSelector: selector,
    calLink: CAL_LINK,
    config: { layout: 'month_view' },
  });

  const started = Date.now();
  for (;;) {
    if (document.querySelector(`${selector} iframe`)) return;
    if (Date.now() - started > timeoutMs) throw new Error('Cal.com calendar did not render');
    await new Promise((r) => window.setTimeout(r, 200));
  }
};

/** Exposed for tests: forget the load so a retry re-runs from scratch. */
export const resetCalForTests = () => {
  initialised = false;
  document.querySelectorAll(`script[src="${EMBED_SRC}"]`).forEach((n) => n.remove());
  delete (window as Window & { Cal?: CalFn }).Cal;
};
