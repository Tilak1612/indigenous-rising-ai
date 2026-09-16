import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Assert against the GA4 sender. This test used to read the event back out of
// localStorage 'analytics-queue-v1' — the queue of a stub that never sent
// anything — so it certified the bug as "records analytics".
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }));
import { trackEvent } from '@/utils/analytics';
import ImpactLogForm from '@/components/ImpactLogForm';

describe('ImpactLogForm', () => {
  test('submits a log and records analytics', async () => {
    localStorage.clear();
    vi.mocked(trackEvent).mockClear();
    render(<ImpactLogForm />);

    const textarea = screen.getByPlaceholderText(/share a story/i);
    fireEvent.change(textarea, { target: { value: 'Community event held' } });

    const jobsInput = screen.getByPlaceholderText('Jobs created');
    fireEvent.change(jobsInput, { target: { value: '2' } });

    const logButton = screen.getByText('Log this month');
    fireEvent.click(logButton);

    await waitFor(() => {
      const logs = JSON.parse(localStorage.getItem('impact-logs-v1') || '[]');
      expect(logs.length).toBeGreaterThan(0);
      expect(trackEvent).toHaveBeenCalledWith('impact_log_submitted', expect.objectContaining({ jobs: 2 }));
    });
  });
});
