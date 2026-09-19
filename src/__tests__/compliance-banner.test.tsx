import React from 'react';
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ComplianceBanner from '@/components/ComplianceBanner';

/**
 * The fixed compliance bar said "Cookies enabled." to every visitor on every
 * device — including straight after "Essential Only", and by default, since
 * analytics cookies are denied until the visitor opts in (Consent Mode). Its
 * "Accept" button only dismissed the bar but read as consent.
 */
describe('compliance notice claims nothing about consent', () => {
  beforeEach(() => localStorage.clear());

  test('does not say cookies are enabled', () => {
    render(<MemoryRouter><ComplianceBanner /></MemoryRouter>);
    const region = screen.getByRole('region', { name: /compliance notice/i });
    expect(region).toHaveTextContent(/PIPEDA · CASL · AODA · OCAP®/);
    expect(region).not.toHaveTextContent(/cookies enabled/i);
  });

  test('its dismiss control is not labelled as consent', () => {
    render(<MemoryRouter><ComplianceBanner /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: /^accept$/i })).toBeNull();
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
  });
});
