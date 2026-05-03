import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { PolicyPage } from '../../../components/policy/PolicyPage';
import type { PrivacyPolicy } from '../../../types/privacy';

const samplePolicy: PrivacyPolicy = {
  id: 'p1',
  title: 'Acme Privacy Policy',
  templateId: 'default-business',
  organizationInfo: {
    name: 'Acme Nigeria Ltd',
    website: 'https://acme.ng',
    privacyEmail: 'privacy@acme.ng',
    address: '12 Marina, Lagos',
    privacyPhone: '',
    dpoName: 'Jane Doe',
    dpoEmail: 'dpo@acme.ng',
    industry: 'fintech',
  },
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      template: 'This is the policy intro for {{orgName}}.',
      required: true,
      included: true,
    },
  ],
  variableValues: { orgName: 'Acme Nigeria Ltd' },
  effectiveDate: 1_700_000_000_000,
  lastUpdated: 1_700_000_000_000,
  version: '1.0',
};

describe('PolicyPage (B1: no global CSS leak)', () => {
  afterEach(cleanup);

  describe('shadow mode (default)', () => {
    it('mounts the policy inside a shadow root', () => {
      const { container } = render(<PolicyPage policy={samplePolicy} />);
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      expect(host).not.toBeNull();
      expect(host.shadowRoot).not.toBeNull();
    });

    it('does not inject any <style> tags into the host document', () => {
      const styleTagsBefore = document.head.querySelectorAll('style').length;
      render(<PolicyPage policy={samplePolicy} />);
      const styleTagsAfter = document.head.querySelectorAll('style').length;
      // The shadow-root style block lives inside the shadow DOM, not in the
      // host document. Bare selectors like `body`, `article`, `h1` cannot
      // reach the consuming application's CSS.
      expect(styleTagsAfter).toBe(styleTagsBefore);
    });

    it('renders the policy content inside the shadow root', () => {
      const { container } = render(<PolicyPage policy={samplePolicy} />);
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      const shadowText = host.shadowRoot?.textContent ?? '';
      expect(shadowText).toContain('Acme Privacy Policy');
      expect(shadowText).toContain('Introduction');
    });
  });

  describe('inline mode', () => {
    it('does not include styles by default', () => {
      const { container } = render(
        <PolicyPage policy={samplePolicy} mode="inline" />,
      );
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      // Default inline mode strips <style> blocks entirely so bare selectors
      // (body, article) cannot leak.
      expect(host.querySelectorAll('style').length).toBe(0);
      expect(host.textContent).toContain('Acme Privacy Policy');
    });

    it('opt-in includeStyles still works for advanced users', () => {
      const { container } = render(
        <PolicyPage
          policy={samplePolicy}
          mode="inline"
          options={{ includeStyles: true }}
        />,
      );
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      expect(host.querySelectorAll('style').length).toBeGreaterThan(0);
    });
  });
});
