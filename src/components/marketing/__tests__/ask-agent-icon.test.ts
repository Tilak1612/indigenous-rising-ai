import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const widget = readFileSync('src/components/marketing/SiteAssistant.tsx', 'utf8');
const cream = readFileSync('public/img/ask-agent-icon-cream.svg', 'utf8');
const full = readFileSync('public/img/ask-agent-icon.svg', 'utf8');

// The chatbot mark: the brand's rising-rings motif inside a speech bubble
// (reviewed Higgsfield/Recraft vector output; 4 of 8 candidates rejected for
// weak legibility at 20px). Cream-line variant on the green launcher pill,
// full-colour variant on the panel header.
describe('the Ask Agent brand icon', () => {
  test('the launcher uses the cream variant, the header the full-colour one', () => {
    expect(widget).toMatch(/img src="\/img\/ask-agent-icon-cream\.svg"/);
    expect(widget).toMatch(/img src="\/img\/ask-agent-icon\.svg"/);
  });

  test('both are decorative, with the name still on the controls', () => {
    // alt="" + aria-hidden on each icon, and the launcher keeps its label
    const imgs = widget.match(/<img src="\/img\/ask-agent-icon[^>]+>/g) ?? [];
    expect(imgs).toHaveLength(2);
    for (const img of imgs) {
      expect(img).toMatch(/alt=""/);
      expect(img).toMatch(/aria-hidden="true"/);
      expect(img).toMatch(/width=\{20\}/);
    }
    expect(widget).toMatch(/aria-label="Ask Agent about Indigenous Rising AI"/);
  });

  test('the SVGs are clean: transparent, brand-coloured, metadata stripped', () => {
    for (const [name, svg] of [['cream', cream], ['full', full]] as const) {
      expect(svg.length, `${name} should be a few KB, not a 21KB c2pa blob`).toBeLessThan(8_000);
      expect(svg, `${name} still carries generator metadata`).not.toMatch(/c2pa|metadata/);
      // brand palette only (plus white interior on the full-colour variant)
      const fills = [...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]);
      const allowed = ['rgb(18,76,59)', 'rgb(212,91,53)', 'rgb(215,154,39)', 'rgb(245,240,232)', 'rgb(255,255,255)'];
      for (const f of fills) expect(allowed, `${name} has off-brand fill ${f}`).toContain(f);
    }
    // the cream variant must NOT ship the green canvas as its first shape —
    // that is what makes it invisible on the green pill
    expect(cream).not.toMatch(/viewBox="0 0 2048 2048"/); // tight-cropped, not full canvas
    expect(full).not.toMatch(/viewBox="0 0 2048 2048"/);
  });
});
