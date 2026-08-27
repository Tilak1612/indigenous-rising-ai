import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { readFileSync } from 'node:fs';
import Breadcrumbs from '../Breadcrumbs';

// Breadcrumbs emits BreadcrumbList JSON-LD through Helmet; App.tsx supplies
// the provider in production, so the test supplies it rather than the
// component being changed to suit the test.
const renderTrail = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Breadcrumbs />
      </MemoryRouter>
    </HelmetProvider>,
  );

// Guards for two defects measured in a real browser at 375px, both of
// which appeared on every page of the site.

describe('breadcrumb home link has an accessible name', () => {
  test('the icon-only home crumb is reachable by name', () => {
    renderTrail('/contact');
    // Measured accessible name was "(EMPTY)" — the link announced only
    // "link". aria-label on a bare <svg> is not reliably exposed, so the
    // name has to be on the link itself.
    const home = screen.getByRole('link', { name: /home/i });
    expect(home).toHaveAttribute('href', '/');
  });

  test('no link in the trail is left without a name', () => {
    renderTrail('/guides/indigenous-business-grants');
    for (const link of screen.getAllByRole('link')) {
      const name = (link.getAttribute('aria-label') ?? link.textContent ?? '').trim();
      expect(name, `link to ${link.getAttribute('href')} has no accessible name`).not.toBe('');
    }
  });
});

describe('compliance banner dismiss control is a real tap target', () => {
  test('it declares at least a 24px box', () => {
    // jsdom has no layout engine, so size is asserted from the declared
    // classes; the 44x44 result itself was measured in a browser at 375px.
    const src = readFileSync('src/components/ComplianceBanner.tsx', 'utf8');
    const btn = src.slice(src.indexOf('Dismiss compliance notice'));
    const cls = /className="([^"]+)"/.exec(btn)?.[1] ?? '';
    const minW = /min-w-\[(\d+)px\]/.exec(cls);
    const minH = /min-h-\[(\d+)px\]/.exec(cls);
    expect(minW, `dismiss button has no min-width: ${cls}`).not.toBeNull();
    expect(minH, `dismiss button has no min-height: ${cls}`).not.toBeNull();
    expect(Number(minW![1])).toBeGreaterThanOrEqual(24);
    expect(Number(minH![1])).toBeGreaterThanOrEqual(24);
  });
});
