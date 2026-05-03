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

  describe('TOC anchor links inside Shadow DOM (v3.5.1 fix)', () => {
    // Browser default <a href="#x"> behaviour can't traverse shadow boundaries.
    // PolicyPage installs a click delegate on the shadow root that intercepts
    // intra-document anchors and scrolls the target into view.

    it('scrolls the matching shadow-root section into view when a TOC link is clicked', () => {
      const { container } = render(<PolicyPage policy={samplePolicy} />);
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      const shadow = host.shadowRoot;
      expect(shadow).not.toBeNull();

      // The exported HTML uses slugified section titles as anchor ids.
      // sample policy has section "Introduction" → id "introduction".
      const target = shadow!.getElementById('introduction');
      expect(target).not.toBeNull();

      // Spy on scrollIntoView (jsdom doesn't implement it; we add a stub).
      const scrollSpy = jest.fn();
      (target as HTMLElement & { scrollIntoView: typeof scrollSpy }).scrollIntoView = scrollSpy;

      const tocLink = shadow!.querySelector('a[href="#introduction"]') as HTMLAnchorElement;
      expect(tocLink).not.toBeNull();
      // Use a real bubbling MouseEvent so the click delegate on the shadow
      // root receives it via standard event flow.
      tocLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    });

    it('ignores external and cross-document links', () => {
      const { container } = render(<PolicyPage policy={samplePolicy} />);
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      const shadow = host.shadowRoot!;

      // Inject a non-anchor link to verify the handler doesn't preventDefault.
      const externalLink = document.createElement('a');
      externalLink.href = 'https://example.com/page';
      externalLink.textContent = 'External';
      shadow.appendChild(externalLink);

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      externalLink.dispatchEvent(event);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('handles bare hash links pointing at unknown ids gracefully', () => {
      const { container } = render(<PolicyPage policy={samplePolicy} />);
      const host = container.querySelector(
        '[data-ndpr-component="policy-page"]',
      ) as HTMLElement;
      const shadow = host.shadowRoot!;

      const bogus = document.createElement('a');
      bogus.href = '#nope-not-a-real-section';
      bogus.textContent = 'Broken';
      shadow.appendChild(bogus);

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      // Should NOT throw, should NOT preventDefault — let the browser do
      // whatever it would naturally do with a missing fragment target.
      expect(() => bogus.dispatchEvent(event)).not.toThrow();
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
