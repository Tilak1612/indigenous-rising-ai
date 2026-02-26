import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';

// Mock hooks
vi.mock('@/hooks/use-toast', () => {
  const t = vi.fn();
  return {
    useToast: () => ({ toast: t }),
    toast: t,
  };
});

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <NewsletterSignup />
    </BrowserRouter>
  );
};

describe('NewsletterSignup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders newsletter signup form', () => {
    renderComponent();
    
    expect(screen.getByText('Stay Connected')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText(/I consent to receive funding alerts/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Subscribe to Updates/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByRole('button', { name: /Subscribe to Updates/i });
    
    await user.type(emailInput, 'invalid-email');
    
    // Check consent
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('requires consent checkbox to be checked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const submitButton = screen.getByRole('button', { name: /Subscribe to Updates/i });
    
    await user.type(emailInput, 'test@example.com');
    
    // Submit without checking consent
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid and consent is given', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const checkbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /Subscribe to Updates/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(checkbox);
    
    expect(submitButton).not.toBeDisabled();
  });

  it('rejects emails with plus-addressing', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const checkbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /Subscribe to Updates/i });
    
    await user.type(emailInput, 'test+alias@example.com');
    await user.click(checkbox);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Plus-addressing is not allowed/i)).toBeInTheDocument();
    });
  });

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup();
    const { supabase } = await import('@/lib/supabase');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { requiresConfirmation: false },
      error: null,
    } as any);
    
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const checkbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /Subscribe to Updates/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(checkbox);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Successfully subscribed/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    const { supabase } = await import('@/lib/supabase');
    
    vi.mocked(supabase.functions.invoke).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: {}, error: null } as any), 1000))
    );
    
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const checkbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /Subscribe to Updates/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(checkbox);
    await user.click(submitButton);
    
    expect(screen.getByText(/Subscribing.../i)).toBeInTheDocument();
  });

  it('shows privacy policy link', () => {
    renderComponent();
    
    const privacyLink = screen.getByText(/Privacy Policy/i);
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('displays PIPEDA compliance message', () => {
    renderComponent();
    
    expect(screen.getByText(/PIPEDA Compliant/i)).toBeInTheDocument();
    expect(screen.getByText(/Data stored in Canada/i)).toBeInTheDocument();
  });
});
