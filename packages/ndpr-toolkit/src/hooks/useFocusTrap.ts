import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active. When transitioning from false → true,
   * the hook captures `document.activeElement` and moves focus into the
   * container; when transitioning back to false, the captured element is
   * re-focused (WCAG 2.4.3 — focus order).
   */
  active: boolean;

  /**
   * Optional callback fired on Escape keydown while the trap is active.
   * Typical use is to close the surrounding dialog.
   */
  onEscape?: () => void;

  /**
   * If false, do not auto-focus the first interactive element inside the
   * container on activation. Defaults to true.
   */
  autoFocus?: boolean;
}

/**
 * Trap keyboard focus inside a container while it is active, and restore
 * focus to the element that was active before activation when the container
 * deactivates. Centralises the trap/restore logic that was previously
 * duplicated (and broken — no restore) inside ConsentBanner.
 *
 * @example
 * ```tsx
 * const ref = useFocusTrap<HTMLDivElement>({ active: isOpen, onEscape: close });
 * return <div ref={ref}>...</div>;
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions,
): RefObject<T | null> {
  const { active, onEscape, autoFocus = true } = options;
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Capture the element that had focus before the trap activated so we
    // can restore it on deactivation (WCAG 2.4.3).
    previouslyFocusedRef.current =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null;

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let autoFocusTimer: ReturnType<typeof setTimeout> | undefined;

    const focusFirst = () => {
      if (cancelled || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // Fall back to the container itself if there's nothing focusable inside.
        if (containerRef.current.tabIndex < 0) {
          containerRef.current.tabIndex = -1;
        }
        containerRef.current.focus();
      }
    };

    if (autoFocus) {
      // Wait a tick so any entrance animation / dialog mount has painted.
      autoFocusTimer = setTimeout(focusFirst, 0);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelled = true;
      if (autoFocusTimer) clearTimeout(autoFocusTimer);
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to whatever had it before the trap activated, but only
      // if that element is still in the document and focusable.
      const previous = previouslyFocusedRef.current;
      if (
        previous &&
        typeof document !== 'undefined' &&
        document.contains(previous) &&
        typeof previous.focus === 'function'
      ) {
        previous.focus();
      }
    };
  }, [active, onEscape, autoFocus]);

  return containerRef;
}
