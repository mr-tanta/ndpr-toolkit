import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  BaseConsentCategories,
  DefaultConsentCategories,
  ConsentContextValue,
  ConsentProviderProps,
} from "@/types/consent";

/**
 * Factory function to create a typed consent context
 */
export function createConsentContext<
  T extends BaseConsentCategories = DefaultConsentCategories,
>() {
  const ConsentContext = createContext<ConsentContextValue<T> | undefined>(
    undefined,
  );

  function ConsentProvider({
    children,
    initialConsent = {} as Partial<T>,
    onConsentChange,
    storageKey = "ndpr-consent",
    categories,
  }: ConsentProviderProps<T>) {
    const getDefaultConsent = (): T => {
      const defaultConsent: Record<string, boolean> = { necessary: true };

      if (categories) {
        categories.forEach((cat) => {
          if (cat.id !== "necessary") {
            defaultConsent[cat.id] = false;
          }
        });
      } else {
        // Use default categories
        defaultConsent.analytics = false;
        defaultConsent.marketing = false;
        defaultConsent.functional = false;
      }

      return defaultConsent as T;
    };

    const [consentState, setConsentState] = useState<T>(() => {
      // Try to load from localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return { ...getDefaultConsent(), ...parsed };
          } catch (e) {
            console.error("Failed to parse consent from localStorage", e);
          }
        }
      }
      return { ...getDefaultConsent(), ...initialConsent } as T;
    });

    const [hasUserConsented, setHasUserConsented] = useState(() => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(`${storageKey}-set`) === "true";
      }
      return false;
    });

    const [showBanner, setShowBanner] = useState(!hasUserConsented);
    const [showSettings, setShowSettings] = useState(false);

    // Persist consent to localStorage
    useEffect(() => {
      if (typeof window !== "undefined" && hasUserConsented) {
        localStorage.setItem(storageKey, JSON.stringify(consentState));
        localStorage.setItem(`${storageKey}-set`, "true");
      }
    }, [consentState, hasUserConsented, storageKey]);

    // Notify parent of consent changes
    useEffect(() => {
      if (hasUserConsented && onConsentChange) {
        onConsentChange(consentState);
      }
    }, [consentState, hasUserConsented, onConsentChange]);

    const acceptAll = useCallback(() => {
      const newConsent = { ...consentState };
      Object.keys(newConsent).forEach((key) => {
        (newConsent as Record<string, boolean>)[key] = true;
      });
      setConsentState(newConsent);
      setHasUserConsented(true);
      setShowBanner(false);
      setShowSettings(false);
    }, [consentState]);

    const rejectAll = useCallback(() => {
      const newConsent = { ...consentState };
      Object.keys(newConsent).forEach((key) => {
        if (key !== "necessary") {
          (newConsent as Record<string, boolean>)[key] = false;
        }
      });
      setConsentState(newConsent);
      setHasUserConsented(true);
      setShowBanner(false);
      setShowSettings(false);
    }, [consentState]);

    const savePreferences = useCallback((preferences: Partial<T>) => {
      setConsentState(
        (prev) =>
          ({
            ...prev,
            ...preferences,
            necessary: true, // Always keep necessary as true
          }) as T,
      );
      setHasUserConsented(true);
      setShowBanner(false);
      setShowSettings(false);
    }, []);

    const updateConsent = useCallback((category: keyof T, value: boolean) => {
      if (category === "necessary") return; // Can't change necessary cookies

      setConsentState((prev) => ({
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

    const value: ConsentContextValue<T> = {
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

  function useConsent() {
    const context = useContext(ConsentContext);
    if (!context) {
      throw new Error("useConsent must be used within a ConsentProvider");
    }
    return context;
  }

  return {
    ConsentContext,
    ConsentProvider,
    useConsent,
  };
}
