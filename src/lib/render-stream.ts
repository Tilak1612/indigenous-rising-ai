import type { ReactNode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';

/** U+0000. Built from its code point so no raw control character sits in source. */
export const NUL = String.fromCharCode(0);

/**
 * Remove NUL bytes from server-rendered HTML.
 *
 * React 18.3.1's streaming renderer (react-dom/server, writeStringChunk) writes
 * into a fixed 2048-byte view with TextEncoder.encodeInto. When the next
 * character is multi-byte and does not fit in the space left, it flushes the
 * WHOLE view instead of only the bytes written, so the unfilled trailing byte —
 * zero — lands in the output immediately before that character. Measured in
 * the build: "OCAP\0®" in the /faq footer and "M\0étis" in a blog post, and
 * production /faq served one. Which pages are hit depends on where characters
 * fall against the 2048-byte boundary, so it moves around between builds.
 *
 * NUL is never valid in HTML (a parse error the browser drops), and the
 * character after it is intact, so stripping restores the correct text. Some
 * tools, and crawlers, treat a document containing NUL as binary.
 */
export function stripNul(html: string): string {
  return html.includes(NUL) ? html.split(NUL).join('') : html;
}

/**
 * Render a tree to an HTML string after all Suspense boundaries resolve.
 * `strip` exists only so the test can observe React's raw output.
 */
export function renderToHtml(
  tree: ReactNode,
  { label = 'tree', timeoutMs = 20000, strip = true }: { label?: string; timeoutMs?: number; strip?: boolean } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new PassThrough();
    sink.on('data', (c: Buffer) => chunks.push(Buffer.from(c)));
    sink.on('error', reject);
    sink.on('end', () => {
      const html = Buffer.concat(chunks).toString('utf8');
      resolve(strip ? stripNul(html) : html);
    });

    const { pipe, abort } = renderToPipeableStream(tree, {
      onAllReady() { pipe(sink); },
      onError(err) { reject(err); },
    });
    // A hung route must fail the build loudly rather than emit a half page.
    setTimeout(() => abort(new Error(`prerender timed out for ${label}`)), timeoutMs).unref?.();
  });
}
