import React from 'react';
import { describe, test, expect } from 'vitest';
import { renderToHtml, stripNul, NUL } from '@/lib/render-stream';

/**
 * React 18.3.1's streaming renderer can put a NUL byte before a multi-byte
 * character that straddles its 2048-byte write buffer. Production /faq served
 * "OCAP\0®". This sweeps text lengths so an "é" lands on every position around
 * the boundary.
 */
// React only uses its 2048-byte view for chunks of at most 682 characters
// (longer ones are encoded directly), so fill the buffer with several short
// chunks, then move a short "Métis" chunk across the boundary.
const tree = (n: number) => (
  <div>
    {[0, 1, 2, 3].map((i) => <p key={i}>{'a'.repeat(480)}</p>)}
    <p>{'b'.repeat(n)}Métis</p>
  </div>
);

describe('server-rendered HTML never contains NUL', () => {
  test('React 18.3.1 raw output really does contain NUL at some boundary (the test exercises the bug)', async () => {
    let hits = 0;
    for (let n = 0; n < 200; n++) {
      const raw = await renderToHtml(tree(n), { strip: false });
      if (raw.includes(NUL)) hits++;
    }
    // If this starts failing after a React upgrade, the upstream bug is fixed:
    // the strip in render-stream.ts can then be removed, and this test with it.
    expect(hits, 'no NUL reproduced — has React fixed writeStringChunk?').toBeGreaterThan(0);
  });

  test('the prerender pipeline output has none, and the text is intact', async () => {
    for (let n = 0; n < 200; n++) {
      const html = await renderToHtml(tree(n));
      expect(html.includes(NUL), `NUL at n=${n}`).toBe(false);
      expect(html).toContain('Métis');
    }
  });

  test('stripNul removes only NUL', () => {
    expect(stripNul(`OCAP${NUL}® M${NUL}étis`)).toBe('OCAP® Métis');
    expect(stripNul('no change — ®')).toBe('no change — ®');
  });
});
