import { ConsentOption, ConsentSettings, ConsentStorageOptions } from '../types/consent';
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
export declare function useConsent({ options, storageOptions, version, onChange }: UseConsentOptions): UseConsentReturn;
export {};
