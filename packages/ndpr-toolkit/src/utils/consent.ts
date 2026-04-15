import { ConsentOption, ConsentSettings } from '../types/consent';

/**
 * Validates consent settings to ensure they meet NDPA requirements
 * @param settings The consent settings to validate
 * @returns An object containing validation result and any error messages
 */
export function validateConsent(settings: ConsentSettings): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Check if consents object exists
  if (!settings.consents || Object.keys(settings.consents).length === 0) {
    errors.push('Consent settings must include at least one consent option');
  }
  
  // Check if timestamp exists and is valid
  if (!settings.timestamp) {
    errors.push('Consent timestamp is required');
  } else if (typeof settings.timestamp !== 'number' || isNaN(settings.timestamp)) {
    errors.push('Consent timestamp must be a valid number');
  }
  
  // Check if version exists
  if (!settings.version) {
    errors.push('Consent version is required');
  }
  
  // Check if method exists
  if (!settings.method) {
    errors.push('Consent collection method is required');
  }
  
  // Check if hasInteracted is defined
  if (settings.hasInteracted === undefined) {
    errors.push('User interaction status is required');
  }
  
  // Check if consent is recent enough (within last 13 months for NDPA compliance)
  if (settings.timestamp) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 13);
    const thirteenMonthsAgo = cutoff.getTime();
    if (settings.timestamp < thirteenMonthsAgo) {
      errors.push('Consent is older than 13 months and should be refreshed');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates that consent options meet NDPA Section 26 requirements.
 * Each consent option must specify a purpose for which data will be processed,
 * as consent must be specific and informed per the Nigeria Data Protection Act.
 * @param options The consent options to validate
 * @returns An object containing validation result and any error messages
 */
export function validateConsentOptions(options: ConsentOption[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options || options.length === 0) {
    errors.push('At least one consent option is required');
  }

  options?.forEach((option) => {
    if (!option.purpose || option.purpose.trim() === '') {
      errors.push(
        `Consent option "${option.id}" is missing a purpose. NDPA Section 26 requires consent to be specific to a stated purpose.`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
