import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentBanner } from '../../../components/consent/ConsentBanner';
import { ConsentOption } from '../../../types/consent';

describe('ConsentBanner (NDPA Consent Management)', () => {
  const mockOnSave = jest.fn();
  
  const consentOptions: ConsentOption[] = [
    {
      id: 'necessary',
      label: 'Necessary Cookies',
      description: 'Essential cookies for the website to function.',
      required: true
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'Cookies that help us understand how you use our website.',
      required: false
    },
    {
      id: 'marketing',
      label: 'Marketing Cookies',
      description: 'Cookies used for marketing purposes.',
      required: false
    }
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ConsentBanner
        options={consentOptions}
        position="bottom"
        onSave={mockOnSave}
        show={true}
        storageKey="test-consent"
        {...props}
      />
    );
  };

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders the NDPA-compliant consent banner correctly', () => {
    renderComponent();
    
    expect(screen.getByText(/We Value Your Privacy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument();
  });

  it('records consent per NDPA Section 26 when "Accept All" is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: /accept all/i }));
    
    expect(mockOnSave).toHaveBeenCalled();
    const saveCall = mockOnSave.mock.calls[0][0];
    expect(saveCall.consents.necessary).toBe(true);
    expect(saveCall.consents.analytics).toBe(true);
    expect(saveCall.consents.marketing).toBe(true);
    expect(saveCall.timestamp).toBeDefined();
    expect(saveCall.version).toBe('1.0');
  });

  it('shows preferences panel when "Customize" is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: /customize/i }));
    
    expect(screen.getByText(/necessary cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/marketing cookies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
  });

  it('disables required consent options', () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: /customize/i }));
    
    // The checkbox for necessary cookies should be disabled
    const necessaryCheckbox = screen.getByLabelText(/necessary cookies/i);
    expect(necessaryCheckbox).toBeDisabled();
  });

  it('allows toggling non-required consent options', () => {
    renderComponent();
    
    fireEvent.click(screen.getByRole('button', { name: /customize/i }));
    
    // The checkbox for analytics cookies should be enabled
    const analyticsCheckbox = screen.getByLabelText(/analytics cookies/i);
    
    // Toggle the checkbox
    fireEvent.click(analyticsCheckbox);
    
    // Save preferences
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    
    expect(mockOnSave).toHaveBeenCalled();
    const saveCall = mockOnSave.mock.calls[0][0];
    expect(saveCall.consents.necessary).toBeDefined();
    expect(saveCall.consents.analytics).toBeDefined();
    expect(saveCall.method).toBe('customize');
  });

  it('renders with the correct position', () => {
    renderComponent({ position: 'top' });
    
    const banner = screen.getByRole('dialog');
    expect(banner).toHaveClass('top-0');
    expect(banner).not.toHaveClass('bottom-0');
  });
});
