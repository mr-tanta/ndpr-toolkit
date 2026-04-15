import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BreachReportForm } from '../../../components/breach/BreachReportForm';
import type { BreachCategory } from '../../../types/breach';

const mockCategories: BreachCategory[] = [
  {
    id: 'unauthorized-access',
    name: 'Unauthorized Access',
    description: 'Unauthorized access to systems or data',
    defaultSeverity: 'high',
  },
  {
    id: 'data-loss',
    name: 'Data Loss',
    description: 'Loss of data',
    defaultSeverity: 'critical',
  },
];

/**
 * Helper: create a mock File object.
 */
function createMockFile(name: string, size: number, type: string): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}

/**
 * Helper: get the file input element from the rendered form.
 */
function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('File input not found');
  return input as HTMLInputElement;
}

describe('BreachReportForm file upload validation', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('adds valid files and shows error for invalid files in a mixed selection', () => {
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        allowAttachments
        maxFileSize={1024} // 1 KB limit
        allowedFileTypes={['.txt', '.pdf']}
      />
    );

    const validFile1 = createMockFile('notes.txt', 100, 'text/plain');
    const validFile2 = createMockFile('report.txt', 200, 'text/plain');
    const oversizedFile = createMockFile('huge.txt', 2048, 'text/plain'); // exceeds 1 KB

    const fileInput = getFileInput(container);

    fireEvent.change(fileInput, {
      target: { files: [validFile1, validFile2, oversizedFile] },
    });

    // The 2 valid files should appear in the attachments list
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
    expect(screen.getByText('report.txt')).toBeInTheDocument();

    // The oversized file should NOT appear
    expect(screen.queryByText('huge.txt')).not.toBeInTheDocument();
  });

  it('shows an error message when a file fails validation', () => {
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        allowAttachments
        maxFileSize={1024}
        allowedFileTypes={['.txt', '.pdf']}
      />
    );

    const validFile = createMockFile('ok.txt', 100, 'text/plain');
    const oversizedFile = createMockFile('toobig.txt', 2048, 'text/plain');

    const fileInput = getFileInput(container);

    fireEvent.change(fileInput, {
      target: { files: [validFile, oversizedFile] },
    });

    // An error message should be displayed via role="alert"
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.textContent).toMatch(/toobig\.txt/);
    expect(alert.textContent).toMatch(/exceeds/i);
  });

  it('shows an error message for disallowed file types', () => {
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        allowAttachments
        maxFileSize={5 * 1024 * 1024}
        allowedFileTypes={['.txt', '.pdf']}
      />
    );

    const validFile = createMockFile('readme.txt', 100, 'text/plain');
    const badTypeFile = createMockFile('virus.exe', 100, 'application/x-msdownload');

    const fileInput = getFileInput(container);

    fireEvent.change(fileInput, {
      target: { files: [validFile, badTypeFile] },
    });

    // Valid file is added
    expect(screen.getByText('readme.txt')).toBeInTheDocument();

    // Invalid file is rejected
    expect(screen.queryByText('virus.exe')).not.toBeInTheDocument();

    // Error message mentions the disallowed type
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toMatch(/\.exe/);
    expect(alert.textContent).toMatch(/not allowed/i);
  });

  it('adds all files when every file is valid', () => {
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        allowAttachments
        maxFileSize={5 * 1024 * 1024}
        allowedFileTypes={['.txt', '.pdf']}
      />
    );

    const file1 = createMockFile('a.txt', 100, 'text/plain');
    const file2 = createMockFile('b.txt', 200, 'text/plain');
    const file3 = createMockFile('c.pdf', 300, 'application/pdf');

    const fileInput = getFileInput(container);

    fireEvent.change(fileInput, {
      target: { files: [file1, file2, file3] },
    });

    // All three files should be listed
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
    expect(screen.getByText('c.pdf')).toBeInTheDocument();

    // No error alert should be present
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not show the file input when allowAttachments is false', () => {
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        allowAttachments={false}
      />
    );

    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});

describe('BreachReportForm accessibility', () => {
  const mockOnSubmit = jest.fn();

  it('uses fieldset and legend for "Types of Data Involved" section', () => {
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
      />
    );

    // The "Types of Data Involved" checkboxes should be wrapped in a <fieldset>
    const fieldsets = container.querySelectorAll('fieldset');
    expect(fieldsets.length).toBeGreaterThanOrEqual(1);

    // Find the fieldset that contains a legend with "Types of Data Involved"
    let found = false;
    fieldsets.forEach((fieldset) => {
      const legend = fieldset.querySelector('legend');
      if (legend && /types of data involved/i.test(legend.textContent || '')) {
        found = true;

        // Verify checkboxes are inside this fieldset
        const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThan(0);
      }
    });

    expect(found).toBe(true);
  });

  it('associates error messages with inputs via aria-describedby', async () => {
    const mockValidationError = jest.fn();
    const { container } = render(
      <BreachReportForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onValidationError={mockValidationError}
      />
    );

    // Submit the form via the form element to trigger onSubmit / validateForm
    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    // Wait for React state update to propagate after setErrors
    await waitFor(() => {
      expect(mockValidationError).toHaveBeenCalled();
    });

    // The breach title input should reference its error via aria-describedby
    const titleInput = screen.getByLabelText(/breach title/i);
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(titleInput).toHaveAttribute('aria-describedby', 'breachTitle-error');
  });
});
