import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConsentBanner } from '../../../components/consent/ConsentBanner';
import { ConsentOption } from '../../../types/consent';

/**
 * Lazy-load react-dom/server inside SSR tests.
 * React 19's server renderer requires MessageChannel and TextEncoder which
 * are not present in the default jsdom environment, so we polyfill them
 * with lightweight shims.
 */
function ssrRenderToString(element: React.ReactElement): string {
  if (typeof globalThis.MessageChannel === 'undefined') {
    // Minimal shim: React only uses MessageChannel for scheduling
    (globalThis as any).MessageChannel = class MessageChannel {
      port1: any;
      port2: any;
      constructor() {
        const listeners: { port1: Function | null; port2: Function | null } = {
          port1: null,
          port2: null,
        };
        this.port1 = {
          set onmessage(fn: Function | null) { listeners.port1 = fn; },
          get onmessage() { return listeners.port1; },
          postMessage(data: any) { listeners.port2?.({ data }); },
          close() {},
        };
        this.port2 = {
          set onmessage(fn: Function | null) { listeners.port2 = fn; },
          get onmessage() { return listeners.port2; },
          postMessage(data: any) { listeners.port1?.({ data }); },
          close() {},
        };
      }
    };
  }
  if (typeof globalThis.TextEncoder === 'undefined') {
    const util = require('util');
    (globalThis as any).TextEncoder = util.TextEncoder;
    (globalThis as any).TextDecoder = util.TextDecoder;
  }
  const { renderToString: rts } = require('react-dom/server');
  return rts(element);
}

describe('ConsentBanner (NDPA Consent Management)', () => {
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
    },
    {
      id: 'marketing',
      label: 'Marketing Cookies',
      description: 'Cookies used for marketing purposes.',
      purpose: 'Personalized advertising',
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

  describe('SSR hydration safety (isMounted pattern)', () => {
    it('returns empty markup for portal positions during SSR (center)', () => {
      // SSR via renderToString never fires useEffect, so isMounted stays false.
      // For center (portal) position the component should return null.
      const html = ssrRenderToString(
        <ConsentBanner
          options={consentOptions}
          onSave={mockOnSave}
          position="center"
          show={true}
          storageKey="test-consent-ssr"
        />
      );

      // The server-rendered markup should be empty — no banner content
      expect(html).toBe('');
    });

    it('returns empty markup for portal positions during SSR (bottom)', () => {
      const html = ssrRenderToString(
        <ConsentBanner
          options={consentOptions}
          onSave={mockOnSave}
          position="bottom"
          show={true}
          storageKey="test-consent-ssr-bottom"
        />
      );

      expect(html).toBe('');
    });

    it('returns empty markup for portal positions during SSR (top)', () => {
      const html = ssrRenderToString(
        <ConsentBanner
          options={consentOptions}
          onSave={mockOnSave}
          position="top"
          show={true}
          storageKey="test-consent-ssr-top"
        />
      );

      expect(html).toBe('');
    });

    it('renders banner content after mount for center (portal) position', () => {
      renderComponent({ position: 'center' });

      // After render (which runs useEffect via act), the portal content
      // should be present in document.body
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/We Value Your Privacy/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject all/i })).toBeInTheDocument();
    });

    it('renders banner content after mount for bottom (portal) position', () => {
      renderComponent({ position: 'bottom' });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/We Value Your Privacy/i)).toBeInTheDocument();
    });

    it('renders banner content after mount for top (portal) position', () => {
      renderComponent({ position: 'top' });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/We Value Your Privacy/i)).toBeInTheDocument();
    });

    it('renders inline position without portal (no isMounted guard)', () => {
      const { container } = renderComponent({ position: 'inline' });

      // Inline renders directly in the component tree, not via portal
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/We Value Your Privacy/i)).toBeInTheDocument();

      // The dialog should be inside the render container (not portaled to body)
      expect(container.querySelector('[role="dialog"]')).toBe(dialog);
    });

    it('inline position also returns empty during SSR (isOpen set in useEffect)', () => {
      // Even though inline does not use a portal, the isOpen state is
      // initialised to false and only set to true in a useEffect.  During
      // SSR useEffect does not run, so the component returns null for all
      // positions — which is the desired hydration-safe behaviour.
      const html = ssrRenderToString(
        <ConsentBanner
          options={consentOptions}
          onSave={mockOnSave}
          position="inline"
          show={true}
          storageKey="test-consent-ssr-inline"
        />
      );

      expect(html).toBe('');
    });
  });
});
