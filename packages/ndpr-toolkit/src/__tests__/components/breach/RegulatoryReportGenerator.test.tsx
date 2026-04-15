import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  RegulatoryReportGenerator,
  OrganizationInfo,
} from '../../../components/breach/RegulatoryReportGenerator';
import type { BreachReport } from '../../../types/breach';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBreachData(overrides: Partial<BreachReport> = {}): BreachReport {
  return {
    id: 'breach-1',
    title: 'Unauthorized database access',
    description: 'An attacker gained read access to the users table.',
    category: 'unauthorized-access',
    discoveredAt: new Date('2025-06-01T10:00:00Z').getTime(),
    reportedAt: new Date('2025-06-01T12:00:00Z').getTime(),
    reporter: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      department: 'Security',
    },
    affectedSystems: ['User DB'],
    dataTypes: ['email', 'name'],
    status: 'contained' as const,
    estimatedAffectedSubjects: 500,
    ...overrides,
  };
}

function makeOrgInfo(overrides: Partial<OrganizationInfo> = {}): OrganizationInfo {
  return {
    name: 'Acme Corp',
    address: '123 Lagos Ave',
    dpoName: 'John Smith',
    dpoEmail: 'dpo@acme.com',
    ...overrides,
  };
}

const noop = () => {};

// Keep a reference to the real createElement before any mocks are applied
const originalCreateElement = document.createElement.bind(document);

// jsdom does not implement URL.createObjectURL, so we polyfill it for tests
beforeAll(() => {
  if (typeof URL.createObjectURL === 'undefined') {
    URL.createObjectURL = jest.fn();
  }
  if (typeof URL.revokeObjectURL === 'undefined') {
    URL.revokeObjectURL = jest.fn();
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RegulatoryReportGenerator', () => {
  // ------------------------------------------------------------------
  // 1. Content updates when breachData changes
  // ------------------------------------------------------------------
  describe('content updates when breachData changes', () => {
    it('regenerates the report preview when breachData prop changes', async () => {
      const initialBreach = makeBreachData({ title: 'Initial Breach Title' });
      const updatedBreach = makeBreachData({ title: 'Updated Breach Title' });

      const { rerender } = render(
        <RegulatoryReportGenerator
          breachData={initialBreach}
          organizationInfo={makeOrgInfo()}
          onGenerate={noop}
          allowEditing={true}
        />
      );

      const textarea = screen.getByLabelText(/edit report content/i) as HTMLTextAreaElement;
      await waitFor(() => {
        expect(textarea.value).toContain('Initial Breach Title');
      });

      rerender(
        <RegulatoryReportGenerator
          breachData={updatedBreach}
          organizationInfo={makeOrgInfo()}
          onGenerate={noop}
          allowEditing={true}
        />
      );

      await waitFor(() => {
        expect(textarea.value).toContain('Updated Breach Title');
        expect(textarea.value).not.toContain('Initial Breach Title');
      });
    });
  });

  // ------------------------------------------------------------------
  // 2. Content updates when organizationInfo changes
  // ------------------------------------------------------------------
  describe('content updates when organizationInfo changes', () => {
    it('regenerates the report preview when organizationInfo prop changes', async () => {
      const initialOrg = makeOrgInfo({ name: 'OrgAlpha' });
      const updatedOrg = makeOrgInfo({ name: 'OrgBeta' });

      const { rerender } = render(
        <RegulatoryReportGenerator
          breachData={makeBreachData()}
          organizationInfo={initialOrg}
          onGenerate={noop}
          allowEditing={true}
        />
      );

      const textarea = screen.getByLabelText(/edit report content/i) as HTMLTextAreaElement;
      await waitFor(() => {
        expect(textarea.value).toContain('OrgAlpha');
      });

      rerender(
        <RegulatoryReportGenerator
          breachData={makeBreachData()}
          organizationInfo={updatedOrg}
          onGenerate={noop}
          allowEditing={true}
        />
      );

      await waitFor(() => {
        expect(textarea.value).toContain('OrgBeta');
        expect(textarea.value).not.toContain('OrgAlpha');
      });
    });
  });

  // ------------------------------------------------------------------
  // 3. HTML download format produces correct MIME type and extension
  // ------------------------------------------------------------------
  describe('HTML download format', () => {
    it('creates a Blob with text/html MIME type when downloadFormat is html', async () => {
      render(
        <RegulatoryReportGenerator
          breachData={makeBreachData()}
          organizationInfo={makeOrgInfo()}
          onGenerate={jest.fn()}
          downloadFormat="html"
          allowDownload={true}
        />
      );

      // Submit the form to reach the "submitted" view with the download button
      const submitButton = screen.getByRole('button', { name: /generate report/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/download report/i)).toBeInTheDocument();
      });

      // Now set up mocks for the download action (after React is done rendering)
      const mockObjectUrl = 'blob:http://localhost/fake-url';
      const createObjectURLSpy = jest
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue(mockObjectUrl);

      const clickSpy = jest.fn();
      const mockAnchor: Record<string, unknown> = {
        href: '',
        download: '',
        click: clickSpy,
        style: {},
      };

      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string) => {
          if (tag === 'a') {
            return mockAnchor as unknown as HTMLAnchorElement;
          }
          return originalCreateElement(tag);
        });

      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);
      const removeChildSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation((node) => node);

      // Click the download button
      const downloadButton = screen.getByText(/download report/i);
      fireEvent.click(downloadButton);

      // Verify Blob was created with text/html MIME type
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('text/html');

      // Verify the download filename has .html extension
      expect(mockAnchor.download).toMatch(/\.html$/);

      // Verify the anchor was clicked
      expect(clickSpy).toHaveBeenCalledTimes(1);

      // Cleanup
      createObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  // ------------------------------------------------------------------
  // 4. Default download format falls back to text/plain
  // ------------------------------------------------------------------
  describe('default download format', () => {
    it('creates a Blob with text/plain MIME type when downloadFormat is pdf (the default)', async () => {
      // No downloadFormat prop -- defaults to "pdf" which maps to text/plain
      render(
        <RegulatoryReportGenerator
          breachData={makeBreachData()}
          organizationInfo={makeOrgInfo()}
          onGenerate={jest.fn()}
          allowDownload={true}
        />
      );

      // Submit to get the download button
      const submitButton = screen.getByRole('button', { name: /generate report/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/download report/i)).toBeInTheDocument();
      });

      // Set up mocks after rendering is complete
      const mockObjectUrl = 'blob:http://localhost/fake-url';
      const createObjectURLSpy = jest
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue(mockObjectUrl);

      const clickSpy = jest.fn();
      const mockAnchor: Record<string, unknown> = {
        href: '',
        download: '',
        click: clickSpy,
        style: {},
      };

      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tag: string) => {
          if (tag === 'a') {
            return mockAnchor as unknown as HTMLAnchorElement;
          }
          return originalCreateElement(tag);
        });

      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);
      const removeChildSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation((node) => node);

      const downloadButton = screen.getByText(/download report/i);
      fireEvent.click(downloadButton);

      // Verify Blob was created with text/plain MIME type
      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      const blobArg = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('text/plain');

      // Verify the download filename has .pdf.txt extension (stub for real PDF)
      expect(mockAnchor.download).toMatch(/\.pdf\.txt$/);

      // Cleanup
      createObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
