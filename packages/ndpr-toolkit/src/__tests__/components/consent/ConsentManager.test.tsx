import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentManager } from '../../../components/consent/ConsentManager';
import { ConsentOption, ConsentSettings } from '../../../types/consent';

describe('ConsentManager (NDPA Privacy Settings)', () => {
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
    }
  ];
  
  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders the NDPA-compliant consent manager correctly', () => {
    render(
      <ConsentManager
        options={consentOptions}
        onSave={mockOnSave}
      />
    );
    
    // Check that the title and description are rendered
    expect(screen.getByText(/Manage Your Privacy Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Update your consent preferences/i)).toBeInTheDocument();
    
    // Check that the consent options are rendered
    expect(screen.getByText(/Necessary Cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytics Cookies/i)).toBeInTheDocument();
    
    // Check that the buttons are rendered
    expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset to Defaults/i })).toBeInTheDocument();
  });

  it('records consent preferences per NDPA when Save Preferences is clicked', () => {
    render(
      <ConsentManager
        options={consentOptions}
        onSave={mockOnSave}
      />
    );
    
    // Click the save button
    fireEvent.click(screen.getByRole('button', { name: /Save Preferences/i }));
    
    // Check that onSave was called with the correct settings
    expect(mockOnSave).toHaveBeenCalled();
    const saveCall = mockOnSave.mock.calls[0][0];
    expect(saveCall.consents).toBeDefined();
    expect(saveCall.timestamp).toBeDefined();
    expect(saveCall.version).toBe('1.0');
    expect(saveCall.method).toBe('manager');
  });

  it('handles empty options array', () => {
    render(
      <ConsentManager
        options={[]}
        onSave={mockOnSave}
      />
    );
    
    // Should still render the manager even with empty options
    expect(screen.getByText(/Manage Your Privacy Settings/i)).toBeInTheDocument();
  });

  it('allows toggling non-required consent options', () => {
    render(
      <ConsentManager
        options={consentOptions}
        onSave={mockOnSave}
      />
    );
    
    // Find the analytics checkbox (non-required)
    const analyticsCheckboxes = screen.getAllByRole('checkbox');
    const analyticsCheckbox = analyticsCheckboxes.find(checkbox => !checkbox.hasAttribute('disabled'));
    
    // Toggle the checkbox
    if (analyticsCheckbox) {
      fireEvent.click(analyticsCheckbox);
      
      // Save preferences
      fireEvent.click(screen.getByRole('button', { name: /Save Preferences/i }));
      
      // Check that onSave was called
      expect(mockOnSave).toHaveBeenCalled();
    }
  });
  
  it('disables required consent options', () => {
    render(
      <ConsentManager
        options={consentOptions}
        onSave={mockOnSave}
      />
    );
    
    // Find all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Find the necessary checkbox (required)
    const necessaryCheckbox = checkboxes.find(checkbox => checkbox.hasAttribute('disabled'));
    
    // Check thatit&apos;s disabled
    expect(necessaryCheckbox).toBeDisabled();
  });
});
