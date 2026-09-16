import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppTree } from './App';
import { renderToHtml } from './lib/render-stream';

/**
 * Server entry for the prerender build.
 *
 * Renders the SAME tree the browser renders, under StaticRouter instead of
 * BrowserRouter, so each route's real markup lands in the initial HTML rather
 * than an empty <div id="root">.
 *
 * ErrorBoundary and SpeedInsights are deliberately omitted: both are
 * client-only concerns and neither contributes crawlable content.
 *
 * Effects do not run during renderToString, so nothing here fetches from
 * Supabase — pages render their loading/empty state, and the client hydrates
 * with live data. That is the correct trade: the crawler gets the page's
 * structure, headings and static copy, which is what was missing entirely.
 */
export function render(url: string): Promise<{ html: string; helmet: HelmetServerState | undefined }> {
  const helmetContext: { helmet?: HelmetServerState } = {};
  // A fresh client per route so no query cache leaks between prerendered pages.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  const tree = (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <AppTree />
        </StaticRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

  // renderToString does NOT await React.lazy — every route here is lazy behind
  // Suspense, so it emitted the loading skeleton (4 words) instead of the page.
  // renderToHtml uses renderToPipeableStream and waits for onAllReady, which is
  // what actually gets the page's content into the HTML. It also strips the NUL
  // bytes React 18.3.1 inserts at buffer boundaries (see render-stream.ts).
  return renderToHtml(tree, { label: url }).then((html) => ({ html, helmet: helmetContext.helmet }));
}
