import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import PlanStepper from '@/components/PlanStepper';

describe('PlanStepper', () => {
  test('uses AI co-pilot and records progress event', async () => {
    localStorage.clear();
    render(<PlanStepper />);

    // initial step textarea
    const textarea = screen.getByPlaceholderText(/write your/i);
    fireEvent.change(textarea, { target: { value: 'My vision statement' } });

    // click AI co-pilot
    const aiButton = screen.getByText('Use AI co-pilot');
    fireEvent.click(aiButton);

    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toContain('Edited by AI co-pilot'));

    // click Next to complete section (should record analytics)
    const next = screen.getByText('Next');
    fireEvent.click(next);

    await waitFor(() => {
      const raw = localStorage.getItem('analytics-queue-v1') || '[]';
      const arr = JSON.parse(raw);
      expect(arr.some((e: any) => e.event === 'plan_section_completed' || e.event === 'ai_copilot_used')).toBe(true);
    });
  });
});
