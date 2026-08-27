import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import GettingStartedChecklist from '../dashboard/GettingStartedChecklist';

// Guards for legibility and nested-interactive defects measured in a real
// browser at 320/375/414/768/1024/1280 and 812x375 landscape.

describe('form fields do not trigger the iOS zoom', () => {
  // iOS Safari zooms the page when a focused field is under 16px and does
  // not zoom back. input.tsx already handled this; textarea.tsx did not.
  for (const file of ['src/components/ui/input.tsx', 'src/components/ui/textarea.tsx']) {
    test(`${file.split('/').pop()} is 16px on phones`, () => {
      const cls = readFileSync(file, 'utf8');
      expect(cls, `${file} must use text-base at phone widths`).toMatch(/\btext-base\b/);
      expect(cls, `${file} may only drop to text-sm from md up`).toMatch(/\bmd:text-sm\b/);
      // A bare text-sm would apply at every width, re-introducing the zoom.
      expect(/(?<!md:)\btext-sm\b(?![^"]*md:text-sm)/.test(cls.split('className')[1] ?? '')).toBe(false);
    });
  }
});

describe('compliance banner text is legible on a phone', () => {
  test('it no longer renders at 11px', () => {
    const src = readFileSync('src/components/ComplianceBanner.tsx', 'utf8');
    // text-[11px] sm:text-xs put the SMALLEST text on the SMALLEST screen,
    // on wording that carries consent and compliance meaning.
    expect(src, 'banner must not use an 11px override').not.toMatch(/text-\[11px\]/);
    expect(src, 'banner body must not use leading-tight at this size').not.toMatch(/leading-tight/);
  });
});

describe('no interactive element is nested inside another', () => {
  test('DataRights links out with asChild, not <Link><Button>', () => {
    const src = readFileSync('src/pages/DataRights.tsx', 'utf8');
    // <Link><Button> renders <a><button>, which is invalid and collapsed the
    // anchor to a 20px inline box 2px from its neighbour.
    expect(src).toMatch(/<Button asChild[^>]*>\s*<Link to="\/track-request">/);
    expect(src).not.toMatch(/<Link to="\/track-request">\s*<Button/);
  });
});

describe('icon-only dashboard links carry a name', () => {
  test('each checklist chevron announces where it goes', () => {
    render(
      <MemoryRouter>
        <GettingStartedChecklist />
      </MemoryRouter>,
    );
    const links = screen.queryAllByRole('link');
    // Pinned: with no links the loop below would assert nothing and pass.
    expect(links.length, 'checklist rendered no links to check').toBe(4);
    for (const link of links) {
      const name = (link.getAttribute('aria-label') ?? link.textContent ?? '').trim();
      expect(name, `link to ${link.getAttribute('href')} announces only "link"`).not.toBe('');
    }
  });
});
