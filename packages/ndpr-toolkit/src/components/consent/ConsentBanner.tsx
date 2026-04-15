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

  // Dismiss on Escape key
  const dismiss = useCallback(() => {
    fireAnalytics('dismissed');
    setIsOpen(false);
    setShowCustomize(false);
  }, [fireAnalytics]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dismiss]);

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

  // Move focus to the banner when it opens
  useEffect(() => {
    if (isOpen && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [isOpen]);

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

  const resolvedAcceptButton = classNames?.primaryButton || classNames?.acceptButton
    || `px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName} ${primaryButtonClassName}`;
  const resolvedRejectButton = classNames?.secondaryButton || classNames?.rejectButton
    || `px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${buttonClassName} ${secondaryButtonClassName}`;
  const resolvedCustomizeButton = classNames?.customizeButton
    || `px-4 py-2 bg-transparent text-gray-800 dark:text-white hover:underline ${buttonClassName}`;
  const resolvedSaveButton = classNames?.saveButton
    || `px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName} ${primaryButtonClassName}`;

  // Build position classes for the root element
  const isInline = position === 'inline';
  const isCenter = position === 'center';

  let rootPositionClass: string;
  if (isInline) {
    rootPositionClass = '';
  } else if (isCenter) {
    // Full-screen overlay wrapper is used for center; the inner banner has no extra position class
    rootPositionClass = '';
  } else if (position === 'top') {
    rootPositionClass = 'fixed inset-x-0 top-0';
  } else {
    // bottom (default)
    rootPositionClass = 'fixed inset-x-0 bottom-0';
  }

  const bannerContent = (
    <div
      ref={bannerRef}
      tabIndex={-1}
      data-ndpr-component="consent-banner"
      className={resolveClass(
        `${isInline ? '' : rootPositionClass} bg-white dark:bg-gray-800 shadow-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 ${isCenter ? 'max-w-lg w-full' : ''} ${className}`,
        classNames?.root,
        unstyled
      )}
      style={!isInline && !isCenter ? { zIndex } : undefined}
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-description"
    >
      <div className={resolveClass('max-w-6xl mx-auto', classNames?.container, unstyled)}>
        <h2 id="consent-banner-title" className={resolveClass('text-lg font-bold mb-2', classNames?.title, unstyled)}>{title}</h2>
        <p id="consent-banner-description" className={resolveClass('text-sm sm:text-base mb-4', classNames?.description, unstyled)}>{description}</p>

        {showCustomize && (
          <div
            ref={customizePanelRef}
            className={resolveClass(
              'mb-4 p-3 sm:p-4 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50',
              classNames?.customizePanel,
              unstyled
            )}
            style={{
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out',
            }}
          >
            {/* Select All / Deselect All toggle */}
            <div className="mb-3 flex items-center justify-end">
              <button
                type="button"
                onClick={allSelected ? handleDeselectAll : handleSelectAll}
                className={resolveClass(
                  'text-sm font-medium text-[rgb(var(--ndpr-primary))] hover:underline',
                  classNames?.selectAllButton,
                  unstyled
                )}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className={resolveClass('space-y-3', classNames?.optionsList, unstyled)}>
              {options.map(option => (
                <div key={option.id} className={resolveClass('flex items-start', classNames?.optionItem, unstyled)}>
                  <div className="flex items-center h-5">
                    <input
                      id={`consent-${option.id}`}
                      type="checkbox"
                      checked={consents[option.id] || false}
                      onChange={e => handleToggleConsent(option.id, e.target.checked)}
                      disabled={option.required}
                      className={resolveClass('h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]', classNames?.optionCheckbox, unstyled)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`consent-${option.id}`} className={resolveClass('font-medium', classNames?.optionLabel, unstyled)}>
                      {option.label} {option.required && <span className="text-red-500">*</span>}
                    </label>
                    <p className={resolveClass('text-gray-600 dark:text-gray-400', classNames?.optionDescription, unstyled)}>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={resolveClass('mt-4 flex flex-col sm:flex-row flex-wrap gap-2', classNames?.buttonGroup, unstyled)}>
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
          <div className={resolveClass('flex flex-col sm:flex-row flex-wrap gap-2', classNames?.buttonGroup, unstyled)}>
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

        <div className={resolveClass('mt-2 text-xs text-gray-600 dark:text-gray-400', undefined, unstyled)}>
          By clicking &quot;Accept All&quot;, you agree to the use of ALL cookies. Visit our Cookie Policy to learn more.
        </div>
      </div>
    </div>
  );

  // Inline position: render in normal DOM tree, no portal
  if (isInline) {
    return bannerContent;
  }

  // Center position: wrap in a full-screen backdrop overlay
  if (isCenter) {
    const centerOverlay = (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          aria-hidden="true"
        />
        {/* Banner (relative to escape the absolute backdrop) */}
        <div className="relative">
          {bannerContent}
        </div>
      </div>
    );

    if (!isMounted) return null;
    return createPortal(centerOverlay, document.body);
  }

  // Top / Bottom positions: portal to document.body with fixed positioning
  if (!isMounted) return null;
  return createPortal(bannerContent, document.body);
};
