import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DSRRequestForm } from '../../../components/dsr/DSRRequestForm';
// Note: We'll mock the DSR context instead of importing it directly

describe('DSRRequestForm (NDPA Part IV - Data Subject Rights)', () => {
  const mockOnSubmit = jest.fn();
  
  const renderComponent = (props = {}) => {
    return render(
      <DSRRequestForm
        onSubmit={mockOnSubmit}
        requestTypes={[
          { id: 'access', name: 'Access my data', description: 'Request a copy of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
          { id: 'rectification', name: 'Correct my data', description: 'Request corrections to your data', estimatedCompletionTime: 15, requiresAdditionalInfo: true },
          { id: 'erasure', name: 'Delete my data', description: 'Request deletion of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false }
        ]}
        {...props}
      />
    );
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the NDPA data subject request form correctly', () => {
    renderComponent();
    
    expect(screen.getByText(/submit a data subject request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/request type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays all request types in the dropdown', () => {
    renderComponent();
    
    const selectElement = screen.getByLabelText(/request type/i);
    fireEvent.click(selectElement);
    
    expect(screen.getByText('Access my data')).toBeInTheDocument();
    expect(screen.getByText('Correct my data')).toBeInTheDocument();
    expect(screen.getByText('Delete my data')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    // Mock console.error to prevent React warnings from cluttering test output
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const { container } = renderComponent();
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for validation to happen
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Directly check that the form validation prevented submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('validates email format', async () => {
    // Use a custom render to access component state
    const { container } = renderComponent();
    
    // Fill in name and request type
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    });
    
    // Select a request type
    const selectElement = screen.getByLabelText(/request type/i);
    fireEvent.change(selectElement, { target: { value: 'access' } });
    
    // Enter invalid email
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, {
      target: { value: 'invalid-email' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait a bit for the validation to happen
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check that the form has an error message somewhere
    const errorElements = container.querySelectorAll('.text-red-500');
    expect(errorElements.length).toBeGreaterThan(0);
    
    // Should not call onSubmit when validation fails
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Now try with a valid email
    fireEvent.change(emailInput, {
      target: { value: 'valid@example.com' }
    });
    
    // Also fill in any other required fields
    // Fill in identifier value if required
    const identifierValueInput = screen.getByLabelText(/identifier value/i);
    fireEvent.change(identifierValueInput, {
      target: { value: 'valid-id-123' }
    });
    
    // Submit the form again
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Now onSubmit should be called
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    // Mock the onSubmit function
    const mockSubmit = jest.fn();
    
    render(
      <DSRRequestForm
        requestTypes={[
          { id: 'access', name: 'Access my data', description: 'Request a copy of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
          { id: 'rectification', name: 'Correct my data', description: 'Request corrections to your data', estimatedCompletionTime: 15, requiresAdditionalInfo: true },
          { id: 'erasure', name: 'Delete my data', description: 'Request deletion of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false }
        ]}
        onSubmit={mockSubmit}
      />
    );
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    // Select a request type
    const selectElement = screen.getByLabelText(/request type/i);
    fireEvent.change(selectElement, { target: { value: 'access' } });
    
    // Fill in identifier value
    fireEvent.change(screen.getByLabelText(/identifier value/i), {
      target: { value: 'john@example.com' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    
    // Should call onSubmit with form data
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('shows success message after submission', async () => {
    // Mock the onSubmit function to trigger the success message
    const mockSubmit = jest.fn().mockImplementation(() => {
      // This will be called when the form is submitted
    });
    
    render(
      <DSRRequestForm
        requestTypes={[
          { id: 'access', name: 'Access my data', description: 'Request a copy of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
          { id: 'rectification', name: 'Correct my data', description: 'Request corrections to your data', estimatedCompletionTime: 15, requiresAdditionalInfo: true },
          { id: 'erasure', name: 'Delete my data', description: 'Request deletion of your data', estimatedCompletionTime: 30, requiresAdditionalInfo: false }
        ]}
        onSubmit={mockSubmit}
        showConfirmation={true}
        confirmationMessage="Your request has been submitted successfully. You will receive a confirmation email shortly."
      />
    );
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' }
    });
    
    // Select a request type
    const selectElement = screen.getByLabelText(/request type/i);
    fireEvent.change(selectElement, { target: { value: 'access' } });
    
    // Fill in identifier value
    fireEvent.change(screen.getByLabelText(/identifier value/i), {
      target: { value: 'john@example.com' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    
    // Should show success message
    expect(await screen.findByText(/request submitted/i)).toBeInTheDocument();
    expect(await screen.findByText(/you will receive a confirmation email shortly/i)).toBeInTheDocument();
    
    // Verify that onSubmit was called
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('handles custom field labels', () => {
    renderComponent({
      labels: {
        name: 'Your Full Name',
        email: 'Your Email Address',
        requestType: 'Type of Request',
        description: 'Additional Information',
        submit: 'Send Request'
      }
    });
    
    expect(screen.getByLabelText(/Your Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type of Request/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Additional Information/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Request/i })).toBeInTheDocument();
  });
});
