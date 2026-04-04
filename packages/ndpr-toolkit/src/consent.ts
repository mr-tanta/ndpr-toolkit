/**
 * Consent Management module
 * NDPA Section 25-26 compliant consent collection and management
 */
export { ConsentBanner } from './components/consent/ConsentBanner';
export { ConsentManager } from './components/consent/ConsentManager';
export { ConsentStorage } from './components/consent/ConsentStorage';
export { useConsent } from './hooks/useConsent';
export { validateConsent, validateConsentOptions } from './utils/consent';
export type { ConsentOption, ConsentSettings, ConsentStorageOptions, LawfulBasisType } from './types/consent';
