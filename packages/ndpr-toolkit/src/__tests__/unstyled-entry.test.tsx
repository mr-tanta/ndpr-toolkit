/**
 * Behavioral tests for the /unstyled entry. The wrappers must:
 *   - default `unstyled` to true (no .ndpr-* classes on the root)
 *   - still allow `unstyled={false}` to opt back into default styling
 *   - preserve all functional / ARIA / data attributes
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import {
  ConsentBanner,
  ConsentManager,
  DSRRequestForm,
} from '../unstyled';
import type { ConsentOption } from '../types/consent';

const consentOptions: ConsentOption[] = [
  { id: 'necessary', label: 'Necessary', description: 'Essential.', purpose: 'core', required: true },
];

const requestTypes = [
  {
    id: 'access',
    name: 'Access',
    description: 'Access your data.',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

afterEach(cleanup);

describe('/unstyled entry', () => {
  describe('ConsentBanner', () => {
    it('defaults unstyled=true: root has no .ndpr-consent-banner class', () => {
      render(
        <ConsentBanner options={consentOptions} onSave={jest.fn()} position="inline" />,
      );
      const banner = screen.getByRole('dialog');
      expect(banner.className).not.toMatch(/ndpr-consent-banner/);
      // Functional contract preserved.
      expect(banner).toHaveAttribute('data-ndpr-component', 'consent-banner');
    });

    it('unstyled={false} opts back into default styling', () => {
      render(
        <ConsentBanner
          options={consentOptions}
          onSave={jest.fn()}
          position="inline"
          unstyled={false}
        />,
      );
      const banner = screen.getByRole('dialog');
      expect(banner).toHaveClass('ndpr-consent-banner');
    });
  });

  describe('ConsentManager', () => {
    it('defaults unstyled=true', () => {
      const { container } = render(
        <ConsentManager options={consentOptions} onSave={jest.fn()} />,
      );
      const root = container.querySelector('[data-ndpr-component="consent-manager"]');
      expect(root).not.toBeNull();
      expect(root!.className).not.toMatch(/ndpr-consent-manager/);
    });
  });

  describe('DSRRequestForm', () => {
    it('defaults unstyled=true', () => {
      const { container } = render(
        <DSRRequestForm onSubmit={jest.fn()} requestTypes={requestTypes} />,
      );
      const root = container.querySelector('[data-ndpr-component="dsr-request-form"]');
      expect(root).not.toBeNull();
      expect(root!.className).not.toMatch(/ndpr-dsr-form/);
    });

    it('unstyled={false} renders the styled defaults', () => {
      const { container } = render(
        <DSRRequestForm onSubmit={jest.fn()} requestTypes={requestTypes} unstyled={false} />,
      );
      const root = container.querySelector('[data-ndpr-component="dsr-request-form"]');
      expect(root).toHaveClass('ndpr-dsr-form');
    });
  });
});
