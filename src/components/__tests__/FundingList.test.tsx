import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Assert against the GA4 sender. This test used to read the event back out of
// localStorage 'analytics-queue-v1' — the queue of a stub that never sent
// anything — so it certified the bug as "records analytics".
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));
import { trackEvent } from '@/utils/analytics';
import FundingList from '@/components/FundingList';

describe('FundingList', () => {
  test('starts application and records analytics', async () => {
    localStorage.clear();
    vi.mocked(trackEvent).mockClear();
    render(<FundingList filters={{}} />);

    const startButtons = await screen.findAllByText('Start application');
    expect(startButtons.length).toBeGreaterThan(0);

    fireEvent.click(startButtons[0]);

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('funding_application_started', expect.objectContaining({ opportunityId: expect.anything() }));
    });
  });
});
