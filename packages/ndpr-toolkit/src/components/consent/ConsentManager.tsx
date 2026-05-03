import React, { useState, useEffect, useRef } from 'react';
import { ConsentOption, ConsentSettings } from '../../types/consent';
import { resolveClass } from '../../utils/styling';

export interface ConsentManagerClassNames {
  root?: string;
  header?: string;
  title?: string;
  description?: string;
  optionsList?: string;
  optionItem?: string;
  toggle?: string;
  saveButton?: string;
  resetButton?: string;
  /** Alias for saveButton */
  primaryButton?: string;
  /** Alias for resetButton */
  secondaryButton?: string;
}

export interface ConsentManagerProps {
  /**
   * Array of consent options to display
   */
  options: ConsentOption[];
  
  /**
   * Current consent settings
   */
  settings?: ConsentSettings;
  
  /**
   * Callback function called when user saves their consent choices
   */
  onSave: (settings: ConsentSettings) => void;
  
  /**
   * Title displayed in the manager
   * @default "Manage Your Privacy Settings"
   */
  title?: string;
  
  /**
   * Description text displayed in the manager
   * @default "Update your consent preferences at any time. Required cookies cannot be disabled as they are necessary for the website to function. Consent management is provided in accordance with NDPA Sections 25-26."
   */
  description?: string;
  
  /**
   * Text for the save button
   * @default "Save Preferences"
   */
  saveButtonText?: string;
  
  /**
   * Text for the reset button
   * @default "Reset to Defaults"
   */
  resetButtonText?: string;
  
  /**
   * Version of the consent form
   * @default "1.0"
   */
  version?: string;
  
  /**
   * Custom CSS class for the manager
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
  classNames?: ConsentManagerClassNames;

  /**
   * When true, all default Tailwind classes are removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;

  /**
   * Whether to show a success message after saving
   * @default true
   */
  showSuccessMessage?: boolean;
  
  /**
   * Success message to display after saving
   * @default "Your preferences have been saved."
   */
  successMessage?: string;
  
  /**
   * Duration to show the success message (in milliseconds)
   * @default 3000
   */
  successMessageDuration?: number;
}

/**
 * Consent management component. Implements NDPA Sections 25-26 consent requirements,
 * allowing data subjects to review and update their consent preferences.
 */
export const ConsentManager: React.FC<ConsentManagerProps> = ({
  options,
  settings,
  onSave,
  title = "Manage Your Privacy Settings",
  description = "Update your consent preferences at any time. Required cookies cannot be disabled as they are necessary for the website to function. Consent management is provided in accordance with NDPA Sections 25-26.",
  saveButtonText = "Save Preferences",
  resetButtonText = "Reset to Defaults",
  version = "1.0",
  className = "",
  buttonClassName = "",
  primaryButtonClassName = "",
  secondaryButtonClassName = "",
  classNames,
  unstyled,
  showSuccessMessage = true,
  successMessage = "Your preferences have been saved.",
  successMessageDuration = 3000
}) => {
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Clear the success message timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Initialize consents from settings or options
  useEffect(() => {
    if (settings && settings.consents) {
      setConsents(settings.consents);
    } else {
      const initialConsents: Record<string, boolean> = {};
      options.forEach(option => {
        initialConsents[option.id] = option.defaultValue || false;
      });
      setConsents(initialConsents);
    }
  }, [options, settings]);
  
  const handleToggleConsent = (id: string, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSave = () => {
    const newSettings: ConsentSettings = {
      consents,
      timestamp: Date.now(),
      version,
      method: 'manager',
      hasInteracted: true
    };
    
    onSave(newSettings);
    
    if (showSuccessMessage) {
      setShowSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, successMessageDuration);
    }
  };
  
  const handleReset = () => {
    const defaultConsents: Record<string, boolean> = {};
    options.forEach(option => {
      defaultConsents[option.id] = option.defaultValue || false;
    });
    setConsents(defaultConsents);
  };
  
  // 3.5: semantic class composition. Defaults map to .ndpr-consent-manager
  // BEM tokens backed by dist/styles.css; consumer overrides via classNames
  // continue to REPLACE defaults for backward compat with resolveClass.
  const defaultPrimaryButton =
    `ndpr-consent-manager__button ndpr-consent-manager__button--primary ${buttonClassName} ${primaryButtonClassName}`.trim();
  const defaultSecondaryButton =
    `ndpr-consent-manager__button ndpr-consent-manager__button--secondary ${buttonClassName} ${secondaryButtonClassName}`.trim();

  const resolvedSaveButton = classNames?.primaryButton || classNames?.saveButton || defaultPrimaryButton;
  const resolvedResetButton = classNames?.secondaryButton || classNames?.resetButton || defaultSecondaryButton;

  const rootClass = `ndpr-consent-manager${className ? ` ${className}` : ''}`;

  return (
    <div
      data-ndpr-component="consent-manager"
      className={resolveClass(rootClass, classNames?.root, unstyled)}
    >
      <h2 className={resolveClass('ndpr-consent-manager__title', classNames?.title, unstyled)}>{title}</h2>
      <p className={resolveClass('ndpr-consent-manager__description', classNames?.description, unstyled)}>{description}</p>

      <div className={resolveClass('ndpr-consent-manager__options-list', classNames?.optionsList, unstyled)}>
        {options.map(option => {
          const inputId = `consent-manager-${option.id}`;
          return (
            <div key={option.id} className={resolveClass('ndpr-consent-manager__option', classNames?.optionItem, unstyled)}>
              <div className={unstyled ? '' : 'ndpr-consent-manager__option-info'}>
                <h3 className={unstyled ? '' : 'ndpr-consent-manager__option-label'}>{option.label}</h3>
                <p className={unstyled ? '' : 'ndpr-consent-manager__option-description'}>{option.description}</p>
              </div>
              <label htmlFor={inputId} className={unstyled ? '' : 'ndpr-consent-manager__toggle-wrapper'}>
                <input
                  id={inputId}
                  type="checkbox"
                  className={unstyled ? '' : 'ndpr-consent-manager__toggle-input'}
                  checked={consents[option.id] || false}
                  onChange={e => handleToggleConsent(option.id, e.target.checked)}
                  disabled={option.required}
                />
                <span
                  aria-hidden="true"
                  className={resolveClass('ndpr-consent-manager__toggle', classNames?.toggle, unstyled)}
                />
                <span className={unstyled ? '' : 'ndpr-consent-manager__toggle-status'}>
                  {consents[option.id] ? 'Enabled' : 'Disabled'}
                  {option.required && <span className={unstyled ? '' : 'ndpr-consent-manager__required-marker'}>(Required)</span>}
                </span>
              </label>
            </div>
          );
        })}
      </div>

      {showSuccess && (
        <div
          className={unstyled ? '' : 'ndpr-consent-manager__success'}
          aria-live="polite"
          role="status"
        >
          {successMessage}
        </div>
      )}

      <div className={unstyled ? '' : 'ndpr-consent-manager__buttons'}>
        <button
          onClick={handleSave}
          className={resolveClass(resolvedSaveButton, classNames?.saveButton, unstyled)}
        >
          {saveButtonText}
        </button>
        <button
          onClick={handleReset}
          className={resolveClass(resolvedResetButton, classNames?.resetButton, unstyled)}
        >
          {resetButtonText}
        </button>
      </div>

      <div className={unstyled ? '' : 'ndpr-consent-manager__meta'}>
        <p>Last updated: {settings ? new Date(settings.timestamp).toLocaleString() : 'Never'}</p>
        <p>Version: {version}</p>
      </div>
    </div>
  );
};
