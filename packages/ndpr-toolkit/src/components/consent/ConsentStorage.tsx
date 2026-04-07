import React, { useState, useEffect } from 'react';
import { ConsentSettings, ConsentStorageOptions } from '../../types/consent';
import { resolveClass } from '../../utils/styling';

export interface ConsentStorageClassNames {
  root?: string;
}

export interface ConsentStorageProps {
  /**
   * Current consent settings
   */
  settings: ConsentSettings;
  
  /**
   * Storage options for consent settings
   */
  storageOptions?: ConsentStorageOptions;
  
  /**
   * Callback function called when settings are loaded from storage
   */
  onLoad?: (settings: ConsentSettings | null) => void;
  
  /**
   * Callback function called when settings are saved to storage
   */
  onSave?: (settings: ConsentSettings) => void;
  
  /**
   * Whether to automatically save settings to storage
   * @default true
   */
  autoSave?: boolean;
  
  /**
   * Whether to automatically load settings from storage on mount
   * @default true
   */
  autoLoad?: boolean;
  
  /**
   * Object of CSS class overrides keyed by semantic section name.
   */
  classNames?: ConsentStorageClassNames;

  /**
   * When true, all default classes are removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;

  /**
   * Children to render
   * Can be either React nodes or a render prop function that receives storage methods
   */
  children?: React.ReactNode | ((props: {
    loadSettings: () => ConsentSettings | null;
    saveSettings: (settings: ConsentSettings) => void;
    clearSettings: () => void;
    loaded: boolean;
  }) => React.ReactNode);
}

export const ConsentStorage = ({
  settings,
  storageOptions = {},
  onLoad,
  onSave,
  autoSave = true,
  autoLoad = true,
  classNames,
  unstyled,
  children
}: ConsentStorageProps): React.ReactElement | null => {
  const {
    storageKey = "ndpr_consent",
    storageType = "localStorage",
    cookieOptions = {}
  } = storageOptions;
  
  const [loaded, setLoaded] = useState<boolean>(false);
  
  // Load consent settings from storage on mount
  useEffect(() => {
    if (autoLoad && !loaded) {
      loadSettings();
    }
  }, [autoLoad, loaded]);
  
  // Save consent settings to storage when they change
  useEffect(() => {
    if (autoSave && loaded) {
      saveSettings(settings);
    }
  }, [settings, autoSave, loaded]);
  
  // Load settings from storage
  const loadSettings = (): ConsentSettings | null => {
    let loadedSettings: ConsentSettings | null = null;
    
    try {
      if (storageType === 'localStorage' && typeof window !== 'undefined') {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          loadedSettings = JSON.parse(savedData);
        }
      } else if (storageType === 'sessionStorage' && typeof window !== 'undefined') {
        const savedData = sessionStorage.getItem(storageKey);
        if (savedData) {
          loadedSettings = JSON.parse(savedData);
        }
      } else if (storageType === 'cookie' && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const consentCookie = cookies.find(cookie => cookie.trim().startsWith(`${storageKey}=`));
        if (consentCookie) {
          const cookieValue = consentCookie.split('=')[1];
          loadedSettings = JSON.parse(decodeURIComponent(cookieValue));
        }
      }
      
      setLoaded(true);
      
      if (onLoad) {
        onLoad(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading consent settings:', error);
      setLoaded(true);
      
      if (onLoad) {
        onLoad(null);
      }
    }
    
    return loadedSettings;
  };
  
  // Save settings to storage
  const saveSettings = (settingsToSave: ConsentSettings): boolean => {
    try {
      const settingsString = JSON.stringify(settingsToSave);
      
      if (storageType === 'localStorage' && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, settingsString);
      } else if (storageType === 'sessionStorage' && typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, settingsString);
      } else if (storageType === 'cookie' && typeof document !== 'undefined') {
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
      
      if (onSave) {
        onSave(settingsToSave);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving consent settings:', error);
      return false;
    }
  };
  
  // Clear settings from storage
  const clearSettings = (): boolean => {
    try {
      if (storageType === 'localStorage' && typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      } else if (storageType === 'sessionStorage' && typeof window !== 'undefined') {
        sessionStorage.removeItem(storageKey);
      } else if (storageType === 'cookie' && typeof document !== 'undefined') {
        const { domain, path = '/' } = cookieOptions;
        
        let cookieString = `${storageKey}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        
        if (domain) {
          cookieString += `; domain=${domain}`;
        }
        
        document.cookie = cookieString;
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing consent settings:', error);
      return false;
    }
  };
  
  const rootClass = resolveClass('', classNames?.root, unstyled);

  // If children is a function, call it with the storage methods
  if (typeof children === 'function') {
    const rendered = children({
      loadSettings,
      saveSettings,
      clearSettings,
      loaded
    });
    return rootClass
      ? <div className={rootClass}>{rendered}</div>
      : <>{rendered}</>;
  }

  // Otherwise, just render the children
  return rootClass
    ? <div className={rootClass}>{children}</div>
    : <>{children}</>;
};
