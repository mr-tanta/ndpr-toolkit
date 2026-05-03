import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConsentManager } from '../../../components/consent/ConsentManager';
import { ConsentOption, ConsentSettings } from '../../../types/consent';

describe('ConsentManager (NDPA Privacy Settings)', () => {
  const mockOnSave = jest.fn();
  
  const consentOptions: ConsentOption[] = [
    {
      id: 'necessary',
      label: 'Necessary Cookies',
      description: 'Essential cookies for the website to function.',
      purpose: 'Core website functionality',
      required: true
    },
    {
      id: 'analytics',
      label: 'Analytics Cookies',
      description: 'Cookies that help us understand how you use our website.',
      purpose: 'Usage analytics and site improvement',
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

  describe('timer cleanup and accessibility', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('clears the success message timer on unmount without state update warnings', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = render(
        <ConsentManager
          options={consentOptions}
          onSave={mockOnSave}
          successMessageDuration={5000}
        />
      );

      // Trigger save to start the success timer
      fireEvent.click(screen.getByRole('button', { name: /Save Preferences/i }));

      // Unmount immediately before the timer fires
      unmount();

      // Advance timers past the success duration
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      // Verify no "state update on unmounted component" warning was logged
      const stateUpdateWarnings = consoleErrorSpy.mock.calls.filter(call =>
        call.some(
          arg =>
            typeof arg === 'string' &&
            arg.includes("Can't perform a React state update on an unmounted component")
        )
      );
      expect(stateUpdateWarnings).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('renders the success message with aria-live="polite" and role="status"', () => {
      render(
        <ConsentManager
          options={consentOptions}
          onSave={mockOnSave}
        />
      );

      // Trigger save to show the success message
      fireEvent.click(screen.getByRole('button', { name: /Save Preferences/i }));

      const successElement = screen.getByText('Your preferences have been saved.');
      expect(successElement).toHaveAttribute('aria-live', 'polite');
      expect(successElement).toHaveAttribute('role', 'status');
    });

    it('hides the success message after the configured timeout', () => {
      render(
        <ConsentManager
          options={consentOptions}
          onSave={mockOnSave}
          successMessageDuration={3000}
        />
      );

      // Trigger save to show the success message
      fireEvent.click(screen.getByRole('button', { name: /Save Preferences/i }));

      // The message should be visible
      expect(screen.getByText('Your preferences have been saved.')).toBeInTheDocument();

      // Advance time past the duration
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // The message should now be gone
      expect(screen.queryByText('Your preferences have been saved.')).not.toBeInTheDocument();
    });
  });

  describe('3.5 styling: semantic class names + no Tailwind dependency', () => {
    it('emits .ndpr-consent-manager root with no Tailwind utility leakage', () => {
      const { container } = render(
        <ConsentManager options={consentOptions} onSave={jest.fn()} />,
      );
      const root = container.querySelector('[data-ndpr-component="consent-manager"]');
      expect(root).not.toBeNull();
      expect(root).toHaveClass('ndpr-consent-manager');
      expect(root!.className).not.toMatch(/\bbg-white\b|\bdark:bg-/);
    });

    it('exposes the title, description, options-list, and toggle slots', () => {
      const { container } = render(
        <ConsentManager options={consentOptions} onSave={jest.fn()} />,
      );
      expect(container.querySelector('.ndpr-consent-manager__title')).not.toBeNull();
      expect(container.querySelector('.ndpr-consent-manager__description')).not.toBeNull();
      expect(container.querySelector('.ndpr-consent-manager__options-list')).not.toBeNull();
      expect(container.querySelector('.ndpr-consent-manager__toggle')).not.toBeNull();
    });

    it('unstyled={true} strips every default class', () => {
      const { container } = render(
        <ConsentManager options={consentOptions} onSave={jest.fn()} unstyled />,
      );
      const root = container.querySelector('[data-ndpr-component="consent-manager"]');
      expect(root).not.toBeNull();
      expect(root!.className).not.toMatch(/ndpr-consent-manager/);
    });
  });
});
