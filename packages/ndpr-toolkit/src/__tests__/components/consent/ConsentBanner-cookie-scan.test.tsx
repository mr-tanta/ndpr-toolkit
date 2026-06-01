import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentBanner } from '../../../components/consent/ConsentBanner';
import { ConsentOption } from '../../../types/consent';

const options: ConsentOption[] = [
  { id: 'necessary', label: 'Necessary', description: 'Essential.', required: true, purpose: 'Core' },
  { id: 'analytics', label: 'Analytics', description: 'Usage stats.', required: false, purpose: 'Analytics' },
];

function renderBanner(extra: Record<string, unknown> = {}) {
  return render(
    <ConsentBanner
      options={options}
      onSave={jest.fn()}
      show
      position="inline"
      showCookieScan
      declaredCookies={[{ name: 'sid', category: 'necessary' }]}
      cookieScanOptions={{ cookieString: 'sid=1; _ga=2; mystery=3' }}
      {...extra}
    />,
  );
}

describe('ConsentBanner — cookie scan panel', () => {
  it('does not render the scan panel until the customize view is open', () => {
    const { container } = renderBanner();
    expect(container.querySelector('[data-ndpr-section="cookie-scan"]')).toBeNull();
  });

  it('renders the scan panel in the customize view, flagging undeclared cookies', () => {
    const { container } = renderBanner();
    fireEvent.click(screen.getByText('Customize'));

    const panel = container.querySelector('[data-ndpr-section="cookie-scan"]');
    expect(panel).not.toBeNull();
    // _ga + mystery are undeclared (sid was declared)
    expect(panel!.textContent).toMatch(/2 undeclared/i);
    expect(panel!.textContent).toContain('_ga');
    expect(panel!.textContent).toContain('mystery');
    // the registry identifies _ga; mystery is unrecognized
    expect(panel!.textContent).toMatch(/Google Analytics/i);
    expect(panel!.textContent).toMatch(/unrecognized/i);
    // the declared cookie is not flagged
    expect(panel!.textContent).not.toContain('sid');
  });

  it('reports a clean result when every present cookie is declared', () => {
    const { container } = renderBanner({
      declaredCookies: [
        { name: 'sid', category: 'necessary' },
        { name: '_ga', category: 'analytics' },
        { name: 'mystery', category: 'functional' },
      ],
    });
    fireEvent.click(screen.getByText('Customize'));
    const panel = container.querySelector('[data-ndpr-section="cookie-scan"]');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toMatch(/all cookies on this page are declared/i);
  });

  it('is opt-in — no panel when showCookieScan is omitted', () => {
    const { container } = render(
      <ConsentBanner options={options} onSave={jest.fn()} show position="inline" />,
    );
    fireEvent.click(screen.getByText('Customize'));
    expect(container.querySelector('[data-ndpr-section="cookie-scan"]')).toBeNull();
  });
});
