import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImpactLogForm from '@/components/ImpactLogForm';

describe('ImpactLogForm', () => {
  test('submits a log and records analytics', async () => {
    localStorage.clear();
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
      const raw = localStorage.getItem('analytics-queue-v1') || '[]';
      const arr = JSON.parse(raw);
      expect(arr.some((e: any) => e.event === 'impact_log_submitted')).toBe(true);
    });
  });
});
