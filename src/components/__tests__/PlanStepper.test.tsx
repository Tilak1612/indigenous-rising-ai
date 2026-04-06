import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PlanStepper from '@/components/PlanStepper';

describe('PlanStepper', () => {
  beforeEach(() => {
    // Provide a gtag stub so @/utils/analytics calls don't silently no-op
    window.gtag = vi.fn();
  });

  test('uses AI co-pilot and records progress event', async () => {
    render(<PlanStepper />);

    // initial step textarea
    const textarea = screen.getByPlaceholderText(/write your/i);
    fireEvent.change(textarea, { target: { value: 'My vision statement' } });

    // click AI co-pilot
    const aiButton = screen.getByText('Use AI co-pilot');
    fireEvent.click(aiButton);

    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toContain('Edited by AI co-pilot'));

    // click Next to complete section (should record analytics via GA4)
    const next = screen.getByText('Next');
    fireEvent.click(next);

    await waitFor(() => {
      const calls = (window.gtag as ReturnType<typeof vi.fn>).mock.calls;
      expect(
        calls.some(([, name]) => name === 'plan_section_completed' || name === 'ai_copilot_used')
      ).toBe(true);
    });
  });
});
