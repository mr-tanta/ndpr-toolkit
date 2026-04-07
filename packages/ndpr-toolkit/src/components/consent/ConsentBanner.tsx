import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ConsentOption, ConsentSettings } from '../../types/consent';
import { resolveClass } from '../../utils/styling';

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
   * @default "We use cookies and similar technologies to provide our services and enhance your experience."
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
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  options,
  onSave,
  title = "We Value Your Privacy",
  description = "We use cookies and similar technologies to provide our services and enhance your experience.",
  acceptAllButtonText = "Accept All",
  rejectAllButtonText = "Reject All",
  customizeButtonText = "Customize",
  saveButtonText = "Save Preferences",
  position = "bottom",
  zIndex = 9999,
  version = "1.0",
  show,
  storageKey = "ndpr_consent",
  className = "",
  buttonClassName = "",
  primaryButtonClassName = "",
  secondaryButtonClassName = "",
  classNames,
  unstyled
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCustomize, setShowCustomize] = useState<boolean>(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  
  // Initialize consents from options
  useEffect(() => {
    const initialConsents: Record<string, boolean> = {};
    options.forEach(option => {
      initialConsents[option.id] = option.defaultValue || false;
    });
    setConsents(initialConsents);
    
    // Check if consent is already saved
    if (show === undefined) {
      const savedConsent = localStorage.getItem(storageKey);
      setIsOpen(!savedConsent);
    } else {
      setIsOpen(show);
    }
  }, [options, show, storageKey]);
  
  const handleAcceptAll = () => {
    const allConsents: Record<string, boolean> = {};
    options.forEach(option => {
      allConsents[option.id] = true;
    });
    saveConsent(allConsents);
  };
  
  const handleRejectAll = () => {
    const rejectedConsents: Record<string, boolean> = {};
    options.forEach(option => {
      rejectedConsents[option.id] = option.required || false;
    });
    saveConsent(rejectedConsents);
  };
  
  const handleToggleConsent = (id: string, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSavePreferences = () => {
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
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(settings));
    
    // Call onSave callback
    onSave(settings);
    
    // Close the banner
    setIsOpen(false);
    setShowCustomize(false);
  };
  
  // Dismiss on Escape key
  const dismiss = useCallback(() => {
    setIsOpen(false);
    setShowCustomize(false);
  }, []);

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

  if (!isOpen) {
    return null;
  }

  const resolvedAcceptButton = classNames?.acceptButton
    || `px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName} ${primaryButtonClassName}`;
  const resolvedRejectButton = classNames?.rejectButton
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
      className={resolveClass(
        `${isInline ? '' : rootPositionClass} bg-white dark:bg-gray-800 shadow-lg p-4 border border-gray-200 dark:border-gray-700 ${isCenter ? 'max-w-lg w-full' : ''} ${className}`,
        classNames?.root,
        unstyled
      )}
      style={!isInline && !isCenter ? { zIndex } : undefined}
      role="dialog"
      aria-labelledby="consent-banner-title"
    >
      <div className={resolveClass('max-w-6xl mx-auto', classNames?.container, unstyled)}>
        <h2 id="consent-banner-title" className={resolveClass('text-lg font-bold mb-2', classNames?.title, unstyled)}>{title}</h2>
        <p className={resolveClass('mb-4', classNames?.description, unstyled)}>{description}</p>

        {showCustomize ? (
          <div className="mb-4">
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
                    <p className={resolveClass('text-gray-500 dark:text-gray-400', classNames?.optionDescription, unstyled)}>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={resolveClass('mt-4 flex flex-wrap gap-2', classNames?.buttonGroup, unstyled)}>
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
        ) : (
          <div className={resolveClass('flex flex-wrap gap-2', classNames?.buttonGroup, unstyled)}>
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

        <div className={resolveClass('mt-2 text-xs text-gray-500 dark:text-gray-400', undefined, unstyled)}>
          By clicking "Accept All", you agree to the use of ALL cookies. Visit our Cookie Policy to learn more.
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

    return typeof document !== 'undefined'
      ? createPortal(centerOverlay, document.body)
      : centerOverlay;
  }

  // Top / Bottom positions: portal to document.body with fixed positioning
  return typeof document !== 'undefined'
    ? createPortal(bannerContent, document.body)
    : bannerContent;
};
