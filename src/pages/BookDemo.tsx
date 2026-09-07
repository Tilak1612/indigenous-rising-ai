import { useCallback, useEffect, useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/utils/analytics';
import { loadAndMountCal, CAL_DIRECT_URL } from '@/lib/cal-embed';
import { ExternalLink, Loader2, ShieldCheck, Clock, Video } from 'lucide-react';

/**
 * Demo booking.
 *
 * The embed is third-party and can fail for reasons we do not control — a
 * blocked script, an ad blocker, a Cal.com outage, a strict corporate
 * proxy. So the direct booking link is present from the first paint, not
 * revealed only after a failure: someone who cannot load the calendar can
 * still book without noticing anything went wrong.
 */

const MOUNT_ID = 'cal-inline-embed';

type State = 'loading' | 'ready' | 'failed';

const BookDemo = () => {
  const [state, setState] = useState<State>('loading');
  const mounted = useRef(false);
  const [attempt, setAttempt] = useState(0);

  const start = useCallback(async () => {
    setState('loading');
    try {
      await loadAndMountCal(`#${MOUNT_ID}`);
      setState('ready');
      trackEvent('demo_embed_loaded', { provider: 'cal.com' });
    } catch (err) {
      setState('failed');
      trackEvent('demo_embed_failed', {
        provider: 'cal.com',
        reason: err instanceof Error ? err.message : 'unknown',
      });
    }
  }, []);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    trackEvent('demo_page_view', { provider: 'cal.com' });
    void start();
  }, [start, attempt]);

  // Cal posts booking lifecycle events to the parent window. Only messages
  // from Cal's own origin are trusted — anything else is ignored.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!/^https:\/\/(app\.)?cal\.com$/.test(e.origin)) return;
      const type = (e.data as { type?: string } | null)?.type;
      if (type === 'bookingSuccessful') {
        trackEvent('demo_booking_confirmed', { provider: 'cal.com' });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const openDirect = () =>
    trackEvent('demo_direct_link_click', { provider: 'cal.com', state });

  return (
    <div className="min-h-screen bg-[var(--ir-cream,#F5F0E8)]">
      <MetaTags
        title="Book a demo | Indigenous Rising AI"
        description="Book a walkthrough of Indigenous Rising AI. See funding matching, business planning, and the data-sovereignty controls that keep your information yours."
        url="/demo"
      />
      <Navigation />

      <main id="main-content" tabIndex={-1}>
        <div className="container mx-auto px-4 pt-28 pb-4">
          <Breadcrumbs customItems={[{ name: 'Book a demo', path: '/demo' }]} />
        </div>

        <section className="container mx-auto px-4 pb-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--ir-terracotta,#E0926E)]">
              Book a demo
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-[var(--ir-ink,#111111)] sm:text-4xl md:text-5xl">
              See it working with your own numbers
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--ir-bark,#6B5645)] sm:text-lg">
              A short walkthrough of funding matching, the business plan assistant, and the
              controls that decide who can see your data. Bring a real question — it is a
              conversation, not a slide deck.
            </p>

            <ul className="mx-auto mt-7 flex max-w-2xl flex-col items-stretch justify-center gap-3 text-sm text-[var(--ir-bark,#6B5645)] sm:flex-row sm:items-center sm:gap-6">
              <li className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-[var(--ir-green,#124C3B)]" aria-hidden="true" />
                30 minutes
              </li>
              <li className="flex items-center justify-center gap-2">
                <Video className="h-4 w-4 shrink-0 text-[var(--ir-green,#124C3B)]" aria-hidden="true" />
                Online, link sent on booking
              </li>
              <li className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--ir-green,#124C3B)]" aria-hidden="true" />
                No obligation
              </li>
            </ul>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--ir-umber,#4A3826)]/10 bg-[var(--ir-paper,#FFFDF9)] shadow-[0_24px_60px_-32px_rgba(44,30,18,.35)]">
            {state === 'loading' && (
              <div
                className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-6 w-6 animate-spin text-[var(--ir-green,#124C3B)]" aria-hidden="true" />
                <p className="text-sm text-[var(--ir-bark,#6B5645)]">Loading the calendar…</p>
              </div>
            )}

            {state === 'failed' && (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
                <p role="alert" className="max-w-md text-[var(--ir-ink,#111111)]">
                  The calendar could not load here — an ad blocker or a strict network will
                  do that. You can still book on Cal.com directly.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button asChild>
                    <a
                      href={CAL_DIRECT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={openDirect}
                    >
                      Book on Cal.com
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
                    Try again
                  </Button>
                </div>
              </div>
            )}

            {/* Always in the DOM: Cal mounts into this node, and hiding it
                with `hidden` rather than unmounting means the element exists
                the moment the script is ready. */}
            <div id={MOUNT_ID} hidden={state !== 'ready'} className="min-h-[560px] w-full" />
          </div>

          {/* Present from first paint, not only after a failure — someone
              who cannot load the embed should never have to discover that. */}
          <p className="mx-auto mt-5 max-w-5xl text-center text-sm text-[var(--ir-bark,#6B5645)]">
            Prefer to book directly?{' '}
            <a
              href={CAL_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openDirect}
              className="font-medium text-[var(--ir-green,#124C3B)] underline underline-offset-2"
            >
              Open the booking page on Cal.com
            </a>
            .
          </p>
        </section>

        <section className="border-t border-[var(--ir-umber,#4A3826)]/10 bg-[var(--ir-sand,#F4ECE0)]">
          <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
            <h2 className="font-display text-2xl font-semibold text-[var(--ir-ink,#111111)]">
              What you share stays yours
            </h2>
            <p className="mt-3 text-[var(--ir-bark,#6B5645)]">
              Anything you show us in a demo is yours. We do not keep copies of your
              business information from a call, and nothing you mention is added to your
              account unless you ask for it. Data in the platform is stored in Canada and
              you can export or delete it at any time — see{' '}
              <a href="/data-rights" className="font-medium text-[var(--ir-green,#124C3B)] underline underline-offset-2">
                your data rights
              </a>
              .
            </p>
            <p className="mt-4 text-xs text-[var(--ir-stone,#5C554B)]">
              Booking is handled by Cal.com, which receives the name, email and time you
              enter to schedule the call. Their privacy notice applies to that step.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookDemo;
