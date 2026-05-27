import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * Test harness component: an outside trigger that opens a trap containing
 * three focusable elements. The trap can be deactivated programmatically
 * by clicking the outside trigger again.
 */
interface HarnessProps {
  initialActive?: boolean;
  autoFocus?: boolean;
  onEscape?: () => void;
}

const Harness: React.FC<HarnessProps> = ({ initialActive = false, autoFocus, onEscape }) => {
  const [active, setActive] = useState(initialActive);
  const ref = useFocusTrap<HTMLDivElement>({ active, onEscape, autoFocus });
  return (
    <div>
      <button data-testid="outside" onClick={() => setActive(prev => !prev)}>
        toggle
      </button>
      {active && (
        <div ref={ref} data-testid="trap">
          <button data-testid="first">first</button>
          <button data-testid="middle">middle</button>
          <button data-testid="last">last</button>
        </div>
      )}
    </div>
  );
};

describe('useFocusTrap', () => {
  it('restores focus to previously-focused element on deactivation', async () => {
    render(<Harness />);
    const outside = screen.getByTestId('outside');
    outside.focus();
    expect(document.activeElement).toBe(outside);

    // Activate the trap — focus moves inside.
    await act(async () => {
      fireEvent.click(outside);
    });
    // Auto-focus timer fires asynchronously.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });

    // Deactivate — should restore focus to `outside`.
    await act(async () => {
      fireEvent.click(screen.getByTestId('outside'));
    });
    expect(document.activeElement).toBe(outside);
  });

  it('cycles Tab forward past last focusable to first', async () => {
    render(<Harness initialActive />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });

    const first = screen.getByTestId('first');
    const last = screen.getByTestId('last');

    // Move focus to the last focusable, then press Tab.
    last.focus();
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('cycles Shift+Tab from first focusable to last', async () => {
    render(<Harness initialActive />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });

    const first = screen.getByTestId('first');
    const last = screen.getByTestId('last');

    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('fires onEscape on Escape keydown when configured', async () => {
    const onEscape = jest.fn();
    render(<Harness initialActive onEscape={onEscape} />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not call onEscape when not configured', async () => {
    // No onEscape passed — pressing Escape must be a no-op (no throw).
    render(<Harness initialActive />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });
    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
  });

  it('removes its keydown listener on deactivation (Tab no longer cycles)', async () => {
    render(<Harness />);
    const outside = screen.getByTestId('outside');
    outside.focus();
    // Activate
    await act(async () => fireEvent.click(outside));
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });
    // Deactivate
    await act(async () => fireEvent.click(screen.getByTestId('outside')));

    // The trap is gone — Tab keydown should not move focus anywhere magic.
    // Specifically, dispatching Tab should not throw and the previously
    // restored outside element keeps focus (no cycling logic remains).
    expect(document.activeElement).toBe(outside);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(outside);
  });

  it('respects autoFocus: false (does not steal focus on mount)', async () => {
    const outside = document.createElement('button');
    outside.setAttribute('data-testid', 'pre-existing');
    outside.textContent = 'pre-existing';
    document.body.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    render(<Harness initialActive autoFocus={false} />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
    });

    // With autoFocus=false, focus stays on the pre-existing element.
    expect(document.activeElement).toBe(outside);
    document.body.removeChild(outside);
  });
});
