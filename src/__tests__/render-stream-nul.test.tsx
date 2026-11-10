import React from 'react';
import { describe, test, expect } from 'vitest';
import { renderToHtml, stripNul, NUL } from '@/lib/render-stream';

/**
 * React 18.3.1's streaming renderer put a NUL byte before a multi-byte
 * character that straddled its 2048-byte write buffer. Production /faq served
 * "OCAP\0®". React 19 fixed writeStringChunk. This still sweeps the old
 * boundary, and stripNul stays so a regression cannot publish a NUL.
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
  test('React 19 raw output has no NUL at the old 2048-byte boundary', async () => {
    let hits = 0;
    for (let n = 0; n < 200; n++) {
      const raw = await renderToHtml(tree(n), { strip: false });
      if (raw.includes(NUL)) hits++;
    }
    expect(hits, 'NUL returned — writeStringChunk regressed').toBe(0);
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
