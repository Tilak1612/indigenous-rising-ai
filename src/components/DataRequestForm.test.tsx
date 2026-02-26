import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DataRequestForm from './DataRequestForm';

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
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <DataRequestForm />
    </BrowserRouter>
  );
};

describe('DataRequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders data request form with all fields', () => {
    renderComponent();
    
    expect(screen.getByText(/PIPEDA Data Rights Request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Type of Request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Request Details/i)).toBeInTheDocument();
  });

  it('renders all request type options', () => {
    renderComponent();
    
    expect(screen.getByText('Access My Data')).toBeInTheDocument();
    expect(screen.getByText('Correct My Data')).toBeInTheDocument();
    expect(screen.getByText('Delete My Data')).toBeInTheDocument();
    expect(screen.getByText('Data Portability')).toBeInTheDocument();
    expect(screen.getByText('Withdraw Consent')).toBeInTheDocument();
  });

  it('validates full name field', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    const submitButton = screen.getByRole('button', { name: /Submit PIPEDA Request/i });
    
    await user.type(nameInput, 'A');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const submitButton = screen.getByRole('button', { name: /Submit PIPEDA Request/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('validates request details minimum length', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const detailsInput = screen.getByLabelText(/Request Details/i);
    const submitButton = screen.getByRole('button', { name: /Submit PIPEDA Request/i });
    
    await user.type(detailsInput, 'Too short');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please provide more details/i)).toBeInTheDocument();
    });
  });

  it('shows character count for details field', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const detailsInput = screen.getByLabelText(/Request Details/i);
    
    await user.type(detailsInput, 'Test message');
    
    expect(screen.getByText(/12\/2000 characters/i)).toBeInTheDocument();
  });

  it('allows selecting different request types', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const accessRadio = screen.getByLabelText('Access My Data');
    const deletionRadio = screen.getByLabelText('Delete My Data');
    
    await user.click(accessRadio);
    expect(accessRadio).toBeChecked();
    
    await user.click(deletionRadio);
    expect(deletionRadio).toBeChecked();
    expect(accessRadio).not.toBeChecked();
  });

  it('handles file upload with validation', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Identity Verification Document/i);
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  it('rejects files larger than 5MB', async () => {
    const user = userEvent.setup();
    const { toast } = await import('@/hooks/use-toast');
    
    renderComponent();
    
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Identity Verification Document/i);
    
    await user.upload(fileInput, largeFile);
    
    // Toast should be called with error
    await waitFor(() => {
      expect(toast).toHaveBeenCalled();
    });
  });

  it('rejects invalid file types', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Identity Verification Document/i);
    
    await user.upload(fileInput, invalidFile);
    
    // Should show error or not accept the file
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const { supabase } = await import('@/lib/supabase');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { tracking_number: 'REQ-123456' },
      error: null,
    } as any);
    
    renderComponent();
    
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await user.click(screen.getByLabelText('Access My Data'));
    await user.type(screen.getByLabelText(/Request Details/i), 'I would like to access all my personal data stored in your system.');
    
    const submitButton = screen.getByRole('button', { name: /Submit PIPEDA Request/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Request Received/i)).toBeInTheDocument();
      expect(screen.getByText('REQ-123456')).toBeInTheDocument();
    });
  });

  it('displays success screen with tracking number', async () => {
    const user = userEvent.setup();
    const { supabase } = await import('@/lib/supabase');
    
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { tracking_number: 'REQ-789012' },
      error: null,
    } as any);
    
    renderComponent();
    
    // Fill and submit form
    await user.type(screen.getByLabelText(/Full Name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/Email Address/i), 'jane@example.com');
    await user.click(screen.getByLabelText('Access My Data'));
    await user.type(screen.getByLabelText(/Request Details/i), 'Please provide all my data.');
    await user.click(screen.getByRole('button', { name: /Submit PIPEDA Request/i }));
    
    await waitFor(() => {
      expect(screen.getByText('REQ-789012')).toBeInTheDocument();
      expect(screen.getByText(/Track My Request/i)).toBeInTheDocument();
      expect(screen.getByText(/Submit Another Request/i)).toBeInTheDocument();
    });
  });

  it('shows 30-day response timeframe', () => {
    renderComponent();
    
    expect(screen.getByText(/We will respond within 30 days/i)).toBeInTheDocument();
  });

  it('includes privacy officer contact information', () => {
    renderComponent();
    
    const privacyEmail = screen.getByText(/privacy@indigenousrising.ai/i);
    expect(privacyEmail).toBeInTheDocument();
  });
});
