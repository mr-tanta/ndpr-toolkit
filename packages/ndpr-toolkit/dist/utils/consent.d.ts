import { ConsentOption, ConsentSettings } from '../types/consent';
/**
 * Validates consent settings to ensure they meet NDPA requirements
 * @param settings The consent settings to validate
 * @returns An object containing validation result and any error messages
 */
export declare function validateConsent(settings: ConsentSettings): {
    valid: boolean;
    errors: string[];
};
/**
 * Validates that consent options meet NDPA Section 26 requirements.
 * Each consent option must specify a purpose for which data will be processed,
 * as consent must be specific and informed per the Nigeria Data Protection Act.
 * @param options The consent options to validate
 * @returns An object containing validation result and any error messages
 */
export declare function validateConsentOptions(options: ConsentOption[]): {
    valid: boolean;
    errors: string[];
};
