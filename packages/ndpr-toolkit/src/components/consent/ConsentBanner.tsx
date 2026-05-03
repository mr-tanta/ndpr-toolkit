import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ConsentOption, ConsentSettings } from '../../types/consent';
import { resolveClass } from '../../utils/styling';

export interface ConsentAnalyticsEvent {
  action: 'shown' | 'accepted_all' | 'rejected_all' | 'customized' | 'dismissed';
  timestamp: number;
  version: string;
  categories?: Record<string, boolean>;
}

export interface ConsentBannerClassNames {
  root?: string;
  container?: string;
  title?: string;
  description?: string;
  optionsList?: string;
  optionItem?: string;
  optionCheckbox?: string;
  optionLabel?: string;
  optionDescription?: string;
  buttonGroup?: string;
  acceptButton?: string;
  rejectButton?: string;
  customizeButton?: string;
  saveButton?: string;
  customizePanel?: string;
  selectAllButton?: string;
  /** Alias for acceptButton */
  primaryButton?: string;
  /** Alias for rejectButton */
  secondaryButton?: string;
}

export interface ConsentBannerProps {
  /**
   * Array of consent options to display
   */
  options: ConsentOption[];
  
  /**
   * Callback function called when user saves their consent choices
   */
  onSave: (settings: ConsentSettings) => void;
  
  /**
   * Title displayed on the banner
   * @default "We Value Your Privacy"
   */
  title?: string;
  
  /**
   * Description text displayed on the banner
   * @default "We use cookies and similar technologies to provide our services and enhance your experience. Your consent is collected in accordance with NDPA Sections 25-26."
   */
  description?: string;
  
  /**
   * Text for the accept all button
   * @default "Accept All"
   */
  acceptAllButtonText?: string;
  
  /**
   * Text for the reject all button
   * @default "Reject All"
   */
  rejectAllButtonText?: string;
  
  /**
   * Text for the customize button
   * @default "Customize"
   */
  customizeButtonText?: string;
  
  /**
   * Text for the save button
   * @default "Save Preferences"
   */
  saveButtonText?: string;
  
  /**
   * Position of the banner.
   * 'top', 'bottom', and 'center' render via a portal to document.body
   * with fixed positioning so the banner overlays the page.
   * 'inline' renders in the normal DOM tree without a portal.
   * @default "bottom"
   */
  position?: 'top' | 'bottom' | 'center' | 'inline';

  /**
   * Visual treatment.
   * - 'bar'   (default): full-width strip pinned to the edge.
   * - 'card'  : bounded floating card with rounded corners and a margin
   *             from the screen edges. Pairs well with `position="bottom"`.
   * - 'modal' : centered card with a backdrop overlay. Forces center
   *             placement regardless of `position`.
   * @default "bar"
   */
  variant?: 'bar' | 'card' | 'modal';

  /**
   * z-index applied to the fixed-position banner.
   * Ignored when position is 'inline'.
   * @default 9999
   */
  zIndex?: number;

  /**
   * Version of the consent form
   * @default "1.0"
   */
  version?: string;
  
  /**
   * Whether to show the banner
   * If not provided, the banner will be shown if no consent has been saved
   */
  show?: boolean;
  
  /**
   * Storage key for consent settings
   * @default "ndpr_consent"
   */
  storageKey?: string;
  
  /**
   * Whether the banner manages its own localStorage persistence.
   * Set to false when an external storage mechanism (e.g., ConsentStorage)
   * is responsible for persisting consent settings under the same key.
   * This avoids race conditions where two writers target the same storage key.
   * @default true
   */
  manageStorage?: boolean;

  /**
   * Custom CSS class for the banner
   */
  className?: string;
  
  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;
  
  /**
   * Custom CSS class for the primary button
   */
  primaryButtonClassName?: string;
  
  /**
   * Custom CSS class for the secondary button
   */
  secondaryButtonClassName?: string;

  /**
   * Object of CSS class overrides keyed by semantic section name.
   * Takes priority over buttonClassName / primaryButtonClassName / secondaryButtonClassName.
   */
  classNames?: ConsentBannerClassNames;

  /**
   * When true, all default Tailwind classes are removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;

  /**
   * Optional analytics callback fired on each user interaction.
   * Called when the banner is shown, accepted, rejected, customized, or dismissed.
   */
  onAnalytics?: (event: ConsentAnalyticsEvent) => void;
}

/**
 * Consent banner component. Implements NDPA Sections 25-26 consent requirements
 * for obtaining and managing data subject consent.
 */
export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  options,
  onSave,
  title = "We Value Your Privacy",
  description = "We use cookies and similar technologies to provide our services and enhance your experience. Your consent is collected in accordance with NDPA Sections 25-26.",
  acceptAllButtonText = "Accept All",
  rejectAllButtonText = "Reject All",
  customizeButtonText = "Customize",
  saveButtonText = "Save Preferences",
  position = "bottom",
  variant = "bar",
  zIndex = 9999,
  version = "1.0",
  show,
  manageStorage = true,
  storageKey = "ndpr_consent",
  className = "",
  buttonClassName = "",
  primaryButtonClassName = "",
  secondaryButtonClassName = "",
  classNames,
  unstyled,
  onAnalytics
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCustomize, setShowCustomize] = useState<boolean>(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const customizePanelRef = useRef<HTMLDivElement>(null);
  const analyticsShownFired = useRef<boolean>(false);

  // Avoid SSR hydration mismatch: portals only render after client mount
  useEffect(() => { setIsMounted(true); }, []);

  // Helper to fire analytics events
  const fireAnalytics = useCallback((
    action: ConsentAnalyticsEvent['action'],
    categories?: Record<string, boolean>
  ) => {
    onAnalytics?.({
      action,
      timestamp: Date.now(),
      version,
      ...(categories !== undefined ? { categories } : {}),
    });
  }, [onAnalytics, version]);

  // Initialize consents from options
  useEffect(() => {
    const initialConsents: Record<string, boolean> = {};
    options.forEach(option => {
      initialConsents[option.id] = option.defaultValue || false;
    });
    setConsents(initialConsents);

    // Check if consent is already saved.
    // When manageStorage is false the banner does not read from localStorage
    // because an external mechanism (e.g. ConsentStorage) owns persistence.
    if (show === undefined) {
      if (!manageStorage) {
        // Without storage access, default to showing the banner and let the
        // parent control visibility via the `show` prop or `onSave` callback.
        setIsOpen(true);
      } else {
        const savedConsentRaw = localStorage.getItem(storageKey);
        if (savedConsentRaw) {
          try {
            const savedSettings: ConsentSettings = JSON.parse(savedConsentRaw);
            // Version enforcement: if the stored version differs from the
            // current prop, treat consent as stale and re-show the banner.
            if (savedSettings.version !== version) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          } catch {
            // Corrupted storage — show the banner
            setIsOpen(true);
          }
        } else {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(show);
    }
    // `show` is intentionally NOT in the dep array — a separate effect below
    // reacts to it. Including it here would re-run the storage-load logic
    // every time the parent toggles `show`, undoing the dismissal state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, storageKey, version, manageStorage]);

  // Issue 7.2 — Sync the `show` prop to internal `isOpen` state.
  // The initialisation effect above depends on [options, storageKey, version]
  // but not on `show` changing after mount.  This dedicated effect ensures
  // that when the parent flips `show` from false → true (or vice-versa)
  // the banner reacts immediately.
  useEffect(() => {
    if (show !== undefined) {
      setIsOpen(show);
    }
  }, [show]);

  const handleAcceptAll = () => {
    const allConsents: Record<string, boolean> = {};
    options.forEach(option => {
      allConsents[option.id] = true;
    });
    fireAnalytics('accepted_all', allConsents);
    saveConsent(allConsents);
  };

  const handleRejectAll = () => {
    const rejectedConsents: Record<string, boolean> = {};
    options.forEach(option => {
      rejectedConsents[option.id] = option.required || false;
    });
    fireAnalytics('rejected_all', rejectedConsents);
    saveConsent(rejectedConsents);
  };

  const handleToggleConsent = (id: string, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectAll = () => {
    const allSelected: Record<string, boolean> = {};
    options.forEach(option => {
      allSelected[option.id] = true;
    });
    setConsents(allSelected);
  };

  const handleDeselectAll = () => {
    const allDeselected: Record<string, boolean> = {};
    options.forEach(option => {
      allDeselected[option.id] = option.required || false;
    });
    setConsents(allDeselected);
  };

  // Determine if all options are currently selected
  const allSelected = options.length > 0 && options.every(option => consents[option.id]);

  const handleSavePreferences = () => {
    fireAnalytics('customized', consents);
    saveConsent(consents);
  };

  const saveConsent = (consentValues: Record<string, boolean>) => {
    const settings: ConsentSettings = {
      consents: consentValues,
      timestamp: Date.now(),
      version,
      method: showCustomize ? 'customize' : 'banner',
      hasInteracted: true
    };

    // Only write to localStorage when the banner owns storage.
    // When manageStorage is false, the parent or a ConsentStorage component
    // is responsible for persisting the settings received via onSave.
    if (manageStorage) {
      localStorage.setItem(storageKey, JSON.stringify(settings));
    }

    // Call onSave callback
    onSave(settings);

    // Close the banner
    setIsOpen(false);
    setShowCustomize(false);
  };

  // Escape key dismisses by rejecting all non-required consents
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fireAnalytics('dismissed');
        handleRejectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // handleRejectAll is intentionally excluded — its identity changes on
    // every render but the keydown handler always reads the latest options
    // via closure-fresh state. Including it would rebind the listener on
    // every render with no behaviour change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fireAnalytics, options, showCustomize]);

  // Fire the "shown" analytics event when the banner becomes visible
  useEffect(() => {
    if (isOpen && !analyticsShownFired.current) {
      analyticsShownFired.current = true;
      fireAnalytics('shown');
    }
    if (!isOpen) {
      // Reset so we fire again if the banner re-opens
      analyticsShownFired.current = false;
    }
  }, [isOpen, fireAnalytics]);

  // Focus trap: keep Tab cycling within the banner and auto-focus first interactive element
  useEffect(() => {
    if (!isOpen || !bannerRef.current) return;

    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Auto-focus the first interactive element when the banner opens
    const focusFirst = () => {
      if (!bannerRef.current) return;
      const focusable = bannerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        bannerRef.current.focus();
      }
    };

    // Small delay to ensure DOM is painted (especially for customize panel transitions)
    const timerId = setTimeout(focusFirst, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !bannerRef.current) return;

      const focusable = bannerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab at first element -> wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab at last element -> wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showCustomize]);

  // Animate the customize panel with a slide/fade transition
  useEffect(() => {
    if (showCustomize && customizePanelRef.current) {
      const panel = customizePanelRef.current;
      // Start collapsed
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      // Force reflow so the browser registers the starting values
      void panel.offsetHeight;
      // Expand to content height
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      panel.style.opacity = '1';
    }
  }, [showCustomize]);

  if (!isOpen) {
    return null;
  }

  // ---------------------------------------------------------------------
  // Class composition
  //
  // We assemble the default class list from semantic BEM-ish tokens that
  // are backed by `dist/styles.css`. Consumers who provide overrides via
  // `classNames` REPLACE the default for that slot (existing behaviour
  // preserved by `resolveClass`). `unstyled={true}` strips every default,
  // letting the consumer build their own visual system.
  // ---------------------------------------------------------------------

  // Modal forces center placement regardless of `position`.
  const effectivePosition = variant === 'modal' ? 'center' : position;
  const isInline = effectivePosition === 'inline';
  const isCenter = effectivePosition === 'center';

  const rootClassParts = ['ndpr-consent-banner'];
  if (variant !== 'bar') rootClassParts.push(`ndpr-consent-banner--${variant}`);
  if (effectivePosition === 'top') rootClassParts.push('ndpr-consent-banner--top');
  else if (effectivePosition === 'bottom') rootClassParts.push('ndpr-consent-banner--bottom');
  else if (effectivePosition === 'inline') rootClassParts.push('ndpr-consent-banner--inline');
  if (className) rootClassParts.push(className);
  const defaultRootClass = rootClassParts.join(' ');

  const defaultPrimaryButton = `ndpr-consent-banner__button ndpr-consent-banner__button--primary ${buttonClassName} ${primaryButtonClassName}`.trim();
  const defaultSecondaryButton = `ndpr-consent-banner__button ndpr-consent-banner__button--secondary ${buttonClassName} ${secondaryButtonClassName}`.trim();
  const defaultGhostButton = `ndpr-consent-banner__button ndpr-consent-banner__button--ghost ${buttonClassName}`.trim();

  const resolvedAcceptButton = classNames?.primaryButton || classNames?.acceptButton || defaultPrimaryButton;
  const resolvedRejectButton = classNames?.secondaryButton || classNames?.rejectButton || defaultSecondaryButton;
  const resolvedCustomizeButton = classNames?.customizeButton || defaultGhostButton;
  const resolvedSaveButton = classNames?.saveButton || defaultPrimaryButton;

  const bannerContent = (
    <div
      ref={bannerRef}
      tabIndex={-1}
      data-ndpr-component="consent-banner"
      data-ndpr-variant={variant}
      data-ndpr-position={effectivePosition}
      className={resolveClass(defaultRootClass, classNames?.root, unstyled)}
      style={
        // Only apply z-index for non-modal fixed positions; modal uses its
        // own overlay wrapper which carries the z-index instead.
        !isInline && !isCenter ? { zIndex } : undefined
      }
      role="dialog"
      aria-modal={isCenter || undefined}
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
    >
      <div className={resolveClass('ndpr-consent-banner__container', classNames?.container, unstyled)}>
        <h2 id="consent-banner-title" className={resolveClass('ndpr-consent-banner__title', classNames?.title, unstyled)}>{title}</h2>
        <p id="consent-banner-description" className={resolveClass('ndpr-consent-banner__description', classNames?.description, unstyled)}>{description}</p>

        {showCustomize && (
          <div
            ref={customizePanelRef}
            className={resolveClass(
              'ndpr-consent-banner__customize-panel',
              classNames?.customizePanel,
              unstyled
            )}
          >
            <div className={unstyled ? '' : 'ndpr-consent-banner__select-all-row'}>
              <button
                type="button"
                onClick={allSelected ? handleDeselectAll : handleSelectAll}
                className={resolveClass(
                  'ndpr-consent-banner__select-all-button',
                  classNames?.selectAllButton,
                  unstyled
                )}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className={resolveClass('ndpr-consent-banner__options-list', classNames?.optionsList, unstyled)}>
              {options.map(option => (
                <div key={option.id} className={resolveClass('ndpr-consent-banner__option', classNames?.optionItem, unstyled)}>
                  <input
                    id={`consent-${option.id}`}
                    type="checkbox"
                    checked={consents[option.id] || false}
                    onChange={e => handleToggleConsent(option.id, e.target.checked)}
                    disabled={option.required}
                    className={resolveClass('ndpr-consent-banner__option-checkbox', classNames?.optionCheckbox, unstyled)}
                  />
                  <div className={unstyled ? '' : 'ndpr-consent-banner__option-text'}>
                    <label htmlFor={`consent-${option.id}`} className={resolveClass('ndpr-consent-banner__option-label', classNames?.optionLabel, unstyled)}>
                      {option.label}
                      {option.required && <span className={unstyled ? '' : 'ndpr-consent-banner__required-marker'}> *</span>}
                    </label>
                    <p className={resolveClass('ndpr-consent-banner__option-description', classNames?.optionDescription, unstyled)}>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={resolveClass('ndpr-consent-banner__buttons', classNames?.buttonGroup, unstyled)}>
              <button
                onClick={handleSavePreferences}
                className={resolveClass(resolvedSaveButton, classNames?.saveButton, unstyled)}
              >
                {saveButtonText}
              </button>
              <button
                onClick={() => setShowCustomize(false)}
                className={resolveClass(resolvedRejectButton, classNames?.rejectButton, unstyled)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {!showCustomize && (
          <div className={resolveClass('ndpr-consent-banner__buttons', classNames?.buttonGroup, unstyled)}>
            <button
              onClick={handleAcceptAll}
              className={resolveClass(resolvedAcceptButton, classNames?.acceptButton, unstyled)}
            >
              {acceptAllButtonText}
            </button>
            <button
              onClick={handleRejectAll}
              className={resolveClass(resolvedRejectButton, classNames?.rejectButton, unstyled)}
            >
              {rejectAllButtonText}
            </button>
            <button
              onClick={() => setShowCustomize(true)}
              className={resolveClass(resolvedCustomizeButton, classNames?.customizeButton, unstyled)}
            >
              {customizeButtonText}
            </button>
          </div>
        )}

        <div className={resolveClass('ndpr-consent-banner__footer-text', undefined, unstyled)}>
          By clicking &quot;Accept All&quot;, you agree to the use of ALL cookies. Visit our Cookie Policy to learn more.
        </div>
      </div>
    </div>
  );

  // Inline position: render in normal DOM tree, no portal
  if (isInline) {
    return bannerContent;
  }

  // Center position (also forced by variant="modal"): wrap in a backdrop.
  if (isCenter) {
    const overlay = (
      <div
        className={unstyled ? '' : 'ndpr-consent-banner__overlay'}
        style={{ zIndex }}
      >
        {bannerContent}
      </div>
    );

    if (!isMounted) return null;
    return createPortal(overlay, document.body);
  }

  // Top / Bottom positions: portal to document.body with fixed positioning
  if (!isMounted) return null;
  return createPortal(bannerContent, document.body);
};
