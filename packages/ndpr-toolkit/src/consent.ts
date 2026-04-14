/**
 * Consent Management module
 * NDPA Section 25-26 compliant consent collection and management
 */
export { ConsentBanner } from './components/consent/ConsentBanner';
export { ConsentManager } from './components/consent/ConsentManager';
export { ConsentStorage } from './components/consent/ConsentStorage';
export type { ConsentBannerClassNames, ConsentAnalyticsEvent } from './components/consent/ConsentBanner';
export type { ConsentManagerClassNames } from './components/consent/ConsentManager';
export type { ConsentStorageClassNames } from './components/consent/ConsentStorage';
export { useConsent } from './hooks/useConsent';
export { resolveClass } from './utils/styling';
export { validateConsent, validateConsentOptions } from './utils/consent';
export { createAuditEntry, getAuditLog, appendAuditEntry } from './utils/consent-audit';
export type { ConsentAuditEntry } from './utils/consent-audit';
export type { ConsentOption, ConsentSettings, ConsentStorageOptions, LawfulBasisType } from './types/consent';

// Compound components (v3)
export { Consent } from './components/consent/compound';
export { ConsentProvider } from './components/consent/Provider';
export type { ConsentProviderProps } from './components/consent/Provider';
export { OptionList as ConsentOptionList } from './components/consent/OptionList';
export { AcceptButton as ConsentAcceptButton } from './components/consent/AcceptButton';
export { RejectButton as ConsentRejectButton } from './components/consent/RejectButton';
export { SaveButton as ConsentSaveButton } from './components/consent/SaveButton';
export { useConsentCompound } from './components/consent/context';

// Re-export adapter types for convenience
export type { StorageAdapter } from './adapters/types';
