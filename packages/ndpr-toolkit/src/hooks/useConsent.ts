import { useState, useEffect } from 'react';
import { ConsentOption, ConsentSettings, ConsentStorageOptions } from '../types/consent';
import { validateConsent } from '../utils/consent';

interface UseConsentOptions {
  /**
   * Consent options to present to the user
   */
  options: ConsentOption[];
  
  /**
   * Storage options for consent settings
   */
  storageOptions?: ConsentStorageOptions;
  
  /**
   * Version of the consent form
   * @default "1.0"
   */
  version?: string;
  
  /**
   * Callback function called when consent settings change
   */
  onChange?: (settings: ConsentSettings) => void;
}

interface UseConsentReturn {
  /**
   * Current consent settings
   */
  settings: ConsentSettings | null;
  
  /**
   * Whether consent has been given for a specific option
   */
  hasConsent: (optionId: string) => boolean;
  
  /**
   * Update consent settings
   */
  updateConsent: (consents: Record<string, boolean>) => void;
  
  /**
   * Accept all consent options
   */
  acceptAll: () => void;
  
  /**
   * Reject all non-required consent options
   */
  rejectAll: () => void;
  
  /**
   * Whether the consent banner should be shown
   */
  shouldShowBanner: boolean;
  
  /**
   * Whether consent settings are valid
   */
  isValid: boolean;
  
  /**
   * Validation errors (if any)
   */
  validationErrors: string[];
  
  /**
   * Reset consent settings (clear from storage)
   */
  resetConsent: () => void;
}

/**
 * Hook for managing user consent in compliance with NDPA
 */
export function useConsent({
  options,
  storageOptions = {},
  version = "1.0",
  onChange
}: UseConsentOptions): UseConsentReturn {
  const {
    storageKey = "ndpr_consent",
    storageType = "localStorage"
  } = storageOptions;
  
  const [settings, setSettings] = useState<ConsentSettings | null>(null);
  const [shouldShowBanner, setShouldShowBanner] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Load consent settings from storage on mount
  useEffect(() => {
    let savedSettings: ConsentSettings | null = null;
    
    try {
      if (storageType === 'localStorage' && typeof window !== 'undefined') {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          savedSettings = JSON.parse(savedData);
        }
      } else if (storageType === 'sessionStorage' && typeof window !== 'undefined') {
        const savedData = sessionStorage.getItem(storageKey);
        if (savedData) {
          savedSettings = JSON.parse(savedData);
        }
      } else if (storageType === 'cookie' && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const consentCookie = cookies.find(cookie => cookie.trim().startsWith(`${storageKey}=`));
        if (consentCookie) {
          const cookieValue = consentCookie.split('=')[1];
          savedSettings = JSON.parse(decodeURIComponent(cookieValue));
        }
      }
    } catch (error) {
      console.error('Error loading consent settings:', error);
    }
    
    if (savedSettings) {
      setSettings(savedSettings);
      
      // Validate the saved settings
      const { valid, errors } = validateConsent(savedSettings);
      setIsValid(valid);
      setValidationErrors(errors);
      
      // Only hide banner if settings are valid and for the current version
      setShouldShowBanner(!(valid && savedSettings.version === version));
    } else {
      setShouldShowBanner(true);
    }
  }, [storageKey, storageType, version]);
  
  // Save settings to storage
  const saveSettings = (newSettings: ConsentSettings) => {
    try {
      const settingsString = JSON.stringify(newSettings);
      
      if (storageType === 'localStorage' && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, settingsString);
      } else if (storageType === 'sessionStorage' && typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, settingsString);
      } else if (storageType === 'cookie' && typeof document !== 'undefined') {
        const { cookieOptions = {} } = storageOptions;
        const {
          domain,
          path = '/',
          expires = 365,
          secure = true,
          sameSite = 'Lax'
        } = cookieOptions;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expires);
        
        let cookieString = `${storageKey}=${encodeURIComponent(settingsString)}; path=${path}; expires=${expiryDate.toUTCString()}`;
        
        if (domain) {
          cookieString += `; domain=${domain}`;
        }
        
        if (secure) {
          cookieString += '; secure';
        }
        
        cookieString += `; samesite=${sameSite}`;
        
        document.cookie = cookieString;
      }
      
      // Validate the new settings
      const { valid, errors } = validateConsent(newSettings);
      setIsValid(valid);
      setValidationErrors(errors);
      
      // Call onChange callback if provided
      if (onChange) {
        onChange(newSettings);
      }
    } catch (error) {
      console.error('Error saving consent settings:', error);
    }
  };
  
  // Update consent settings
  const updateConsent = (consents: Record<string, boolean>) => {
    const newSettings: ConsentSettings = {
      consents,
      timestamp: Date.now(),
      version,
      method: 'explicit',
      hasInteracted: true
    };
    
    setSettings(newSettings);
    saveSettings(newSettings);
    setShouldShowBanner(false);
  };
  
  // Accept all consent options
  const acceptAll = () => {
    const allConsents: Record<string, boolean> = {};
    options.forEach(option => {
      allConsents[option.id] = true;
    });
    
    updateConsent(allConsents);
  };
  
  // Reject all non-required consent options
  const rejectAll = () => {
    const rejectedConsents: Record<string, boolean> = {};
    options.forEach(option => {
      rejectedConsents[option.id] = option.required || false;
    });
    
    updateConsent(rejectedConsents);
  };
  
  // Check if consent has been given for a specific option
  const hasConsent = (optionId: string): boolean => {
    return !!settings?.consents[optionId];
  };
  
  // Reset consent settings
  const resetConsent = () => {
    if (storageType === 'localStorage' && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    } else if (storageType === 'sessionStorage' && typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
    } else if (storageType === 'cookie' && typeof document !== 'undefined') {
      const { cookieOptions = {} } = storageOptions;
      const { domain, path = '/' } = cookieOptions;
      
      let cookieString = `${storageKey}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      if (domain) {
        cookieString += `; domain=${domain}`;
      }
      
      document.cookie = cookieString;
    }
    
    setSettings(null);
    setShouldShowBanner(true);
    setIsValid(false);
    setValidationErrors([]);
  };
  
  return {
    settings,
    hasConsent,
    updateConsent,
    acceptAll,
    rejectAll,
    shouldShowBanner,
    isValid,
    validationErrors,
    resetConsent
  };
}
