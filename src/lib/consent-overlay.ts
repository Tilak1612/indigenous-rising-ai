/**
 * Tracks whether a consent overlay is currently on screen.
 *
 * The consent surfaces own the bottom of the viewport: CookieConsent is a
 * 360px card at `bottom-4 right-4 z-50`, ComplianceBanner a full-width strip
 * at `bottom-0 z-40`. The assistant launcher sits at `bottom-20 right-4 z-40`,
 * underneath both — so on a first visit it rendered as a button nobody could
 * press. Measured on the live site: `elementFromPoint` at the launcher's
 * centre returned the compliance strip at 375px and the cookie card at
 * 1440px. Once both were dismissed the launcher became clickable again, so
 * this only ever hit first-time visitors — which is exactly who sees it.
 *
 * Raising the launcher's z-index would have fixed the click at the cost of
 * parking a chat button on top of a consent dialog. Consent has to win, so
 * the launcher waits its turn instead.
 *
 * Keyed by id rather than counted: an overlay may re-register on re-render,
 * and a Set makes that idempotent where `count++` would leak.
 */
const openOverlays = new Set<string>();
const listeners = new Set<() => void>();

export function setConsentOverlay(id: string, visible: boolean): void {
  if (visible === openOverlays.has(id)) return;
  if (visible) openOverlays.add(id);
  else openOverlays.delete(id);
  listeners.forEach((listener) => listener());
}

export function subscribeConsentOverlay(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isConsentOverlayOpen(): boolean {
  return openOverlays.size > 0;
}

/** Prerender has no overlay: the static HTML ships the launcher visible. */
export function isConsentOverlayOpenOnServer(): boolean {
  return false;
}
