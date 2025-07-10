/**
 * Base consent categories interface that can be extended
 */
export interface BaseConsentCategories {
  necessary: boolean;
  [key: string]: boolean;
}

/**
 * Default consent categories provided by the toolkit
 */
export interface DefaultConsentCategories extends BaseConsentCategories {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

/**
 * Generic consent state interface
 */
export interface ConsentState<T extends BaseConsentCategories = DefaultConsentCategories> {
  hasUserConsented: boolean;
  consentState: T;
  showBanner: boolean;
  showSettings: boolean;
}

/**
 * Generic consent actions interface
 */
export interface ConsentActions<T extends BaseConsentCategories = DefaultConsentCategories> {
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: Partial<T>) => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateConsent: (category: keyof T, value: boolean) => void;
}

/**
 * Combined consent context value
 */
export interface ConsentContextValue<T extends BaseConsentCategories = DefaultConsentCategories> 
  extends ConsentState<T>, ConsentActions<T> {}

/**
 * Consent provider props with generic support
 */
export interface ConsentProviderProps<T extends BaseConsentCategories = DefaultConsentCategories> {
  children: React.ReactNode;
  initialConsent?: Partial<T>;
  onConsentChange?: (consent: T) => void;
  storageKey?: string;
  categories?: Array<{
    id: keyof T;
    name: string;
    description: string;
    required?: boolean;
  }>;
}