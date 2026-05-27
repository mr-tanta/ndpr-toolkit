/**
 * Regression test for the 3.10.5 fix: ConsentManager's options-init
 * useEffect previously depended on the `options` reference identity. When
 * a parent re-rendered with an inline-literal `options` array, the effect
 * re-ran and reset the user's toggled consents.
 *
 * After the fix, the effect depends on a stable hash of (id + defaultValue)
 * pairs — re-init only fires when the option set actually changes.
 */
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentManager } from '../../../components/consent/ConsentManager';
import { ConsentOption } from '../../../types/consent';

const options: ConsentOption[] = [
  {
    id: 'necessary',
    label: 'Necessary',
    description: 'Essential cookies.',
    purpose: 'Core functionality',
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Anonymous usage measurement.',
    purpose: 'Product analytics',
    required: false,
    defaultValue: false,
  },
];

/**
 * Renders ConsentManager with options recreated on every parent render via
 * a state-bump button. Mimics how consumers typically pass inline arrays.
 */
function ParentWithBump() {
  const [bump, setBump] = useState(0);
  return (
    <>
      <button onClick={() => setBump(b => b + 1)}>force-rerender:{bump}</button>
      <ConsentManager
        options={options.map(o => ({ ...o }))}
        onSave={() => {}}
      />
    </>
  );
}

describe('ConsentManager — stable options identity (3.10.5)', () => {
  it('keeps the user toggle when the parent re-renders with a fresh options literal', () => {
    render(<ParentWithBump />);

    // Toggle analytics on. The label text is "Enabled/Disabled" and the
    // option label is rendered as a sibling <h3>, so locate by the stable
    // input id format `consent-manager-<option-id>`.
    const analytics = document.getElementById('consent-manager-analytics') as HTMLInputElement;
    expect(analytics).not.toBeNull();
    expect(analytics.checked).toBe(false);
    fireEvent.click(analytics);
    expect(analytics.checked).toBe(true);

    // Force the parent to re-render with a NEW `options` array reference.
    // Pre-3.10.5 this would have reset analytics back to `false`.
    fireEvent.click(screen.getByRole('button', { name: /force-rerender/i }));

    const analyticsAfter = document.getElementById('consent-manager-analytics') as HTMLInputElement;
    expect(analyticsAfter.checked).toBe(true);
  });
});
