import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FundingList from '@/components/FundingList';

describe('FundingList', () => {
  test('starts application and records analytics', async () => {
    localStorage.clear();
    render(<FundingList filters={{}} />);

    const startButtons = await screen.findAllByText('Start application');
    expect(startButtons.length).toBeGreaterThan(0);

    fireEvent.click(startButtons[0]);

    await waitFor(() => {
      const raw = localStorage.getItem('analytics-queue-v1') || '[]';
      const arr = JSON.parse(raw);
      expect(arr.some((e: any) => e.event === 'funding_application_started')).toBe(true);
    });
  });
});
