import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';

// "Manage Billing" shipped with no handler: a paying customer clicked it
// and nothing happened. It now calls the same customer-portal function
// Training.tsx already uses.

describe('the billing button is wired to the portal', () => {
  test('it invokes customer-portal and is disabled while opening', () => {
    const src = readFileSync('src/pages/dashboard/Settings.tsx', 'utf8');
    expect(src, 'no handler on the billing button')
      .toMatch(/onClick=\{openBillingPortal\}/);
    expect(src, 'the handler must call the deployed portal function')
      .toMatch(/functions\.invoke\('customer-portal'/);
    expect(src, 'the button must not be clickable twice while opening')
      .toMatch(/disabled=\{portalLoading\}/);
  });

  test('a portal failure is surfaced, not swallowed', () => {
    const src = readFileSync('src/pages/dashboard/Settings.tsx', 'utf8');
    const fn = src.slice(src.indexOf('const openBillingPortal'));
    const body = fn.slice(0, fn.indexOf('\n  };'));
    // Silently doing nothing on failure is the defect this whole session
    // kept finding; the portal is billing, so it matters more here.
    expect(body).toMatch(/toast\.error/);
    expect(body, 'a missing url must be treated as a failure')
      .toMatch(/data\?\.url|!data/);
  });

  test('it opens in a new tab without leaking the opener', () => {
    const src = readFileSync('src/pages/dashboard/Settings.tsx', 'utf8');
    expect(src).toMatch(/window\.open\(data\.url, '_blank', 'noopener,noreferrer'\)/);
  });
});
