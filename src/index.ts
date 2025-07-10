// Core exports
export { ConsentProvider, useConsent, ConsentContext } from './contexts/ConsentContext';
export type { ConsentCategories, ConsentState, ConsentActions, ConsentContextValue } from './contexts/ConsentContext';

// Generic consent context factory
export { createConsentContext } from './contexts/GenericConsentContext';
export type {
  BaseConsentCategories,
  DefaultConsentCategories,
  ConsentProviderProps,
} from './types/consent';

// Components
export { ConsentManager } from './components/consent/ConsentManager';
export { ConsentBanner } from './components/consent/ConsentBanner';
export { ConsentSettings } from './components/consent/ConsentSettings';
export type { ConsentManagerProps, BannerProps, SettingsProps, RenderProps } from './components/consent/ConsentManager';

// Unstyled components
export {
  UnstyledConsentBanner,
  UnstyledConsentSettings,
  UnstyledConsentToggle,
} from './components/consent/unstyled';

// Hooks
export { useConsentState } from './hooks/useConsentState';
export { useConsentActions } from './hooks/useConsentActions';
export { useConsentManager } from './hooks/useConsentManager';

// Utilities
export { consentService } from './lib/consentService';

// Cookie utilities
export const cookieUtils = {
  set: (name: string, value: string, days: number) => {
    if (typeof window === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },
  get: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  delete: (name: string) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Consent storage utilities
export const consentStorage = {
  save: (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  },
  load: (key: string): any | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};