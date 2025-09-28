import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface ConsentCategories {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  [key: string]: boolean;
}

export interface ConsentState {
  hasUserConsented: boolean;
  consentState: ConsentCategories;
  showBanner: boolean;
  showSettings: boolean;
}

export interface ConsentActions {
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: Partial<ConsentCategories>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateConsent: (category: keyof ConsentCategories, value: boolean) => void;
}

export interface ConsentContextValue extends ConsentState, ConsentActions {}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export interface ConsentProviderProps {
  children: ReactNode;
  initialConsent?: Partial<ConsentCategories>;
  onConsentChange?: (consent: ConsentCategories) => void;
  storageKey?: string;
}

const defaultConsent: ConsentCategories = {
  necessary: true, // Always true
  analytics: false,
  marketing: false,
  functional: false,
};

export function ConsentProvider({
  children,
  initialConsent = {},
  onConsentChange,
  storageKey = 'ndpr-consent',
}: ConsentProviderProps) {
  const [consentState, setConsentState] = useState<ConsentCategories>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return { ...defaultConsent, ...parsed };
        } catch (e) {
          console.error('Failed to parse consent from localStorage', e);
        }
      }
    }
    return { ...defaultConsent, ...initialConsent };
  });

  const [hasUserConsented, setHasUserConsented] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`${storageKey}-set`) === 'true';
    }
    return false;
  });

  const [showBanner, setShowBanner] = useState(!hasUserConsented);
  const [showSettings, setShowSettings] = useState(false);

  // Persist consent to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && hasUserConsented) {
      localStorage.setItem(storageKey, JSON.stringify(consentState));
      localStorage.setItem(`${storageKey}-set`, 'true');
    }
  }, [consentState, hasUserConsented, storageKey]);

  // Notify parent of consent changes
  useEffect(() => {
    if (hasUserConsented && onConsentChange) {
      onConsentChange(consentState);
    }
  }, [consentState, hasUserConsented, onConsentChange]);

  const acceptAll = useCallback(() => {
    const newConsent: ConsentCategories = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setConsentState(newConsent);
    setHasUserConsented(true);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const rejectAll = useCallback(() => {
    const newConsent: ConsentCategories = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setConsentState(newConsent);
    setHasUserConsented(true);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const savePreferences = useCallback((preferences: Partial<ConsentCategories>) => {
    setConsentState(prev => ({
      ...prev,
      ...preferences,
      necessary: true, // Always keep necessary as true
    }));
    setHasUserConsented(true);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const updateConsent = useCallback((category: keyof ConsentCategories, value: boolean) => {
    if (category === 'necessary') return; // Can't change necessary cookies
    
    setConsentState(prev => ({
      ...prev,
      [category]: value,
    }));
  }, []);

  const openSettings = useCallback(() => {
    setShowSettings(true);
    setShowBanner(false);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const value: ConsentContextValue = {
    hasUserConsented,
    consentState,
    showBanner,
    showSettings,
    acceptAll,
    rejectAll,
    savePreferences,
    openSettings,
    closeSettings,
    updateConsent,
  };

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}

// Export for external use
export { ConsentContext };