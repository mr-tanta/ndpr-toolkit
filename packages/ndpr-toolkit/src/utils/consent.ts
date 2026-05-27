import { ConsentOption, ConsentSettings } from '../types/consent';

/**
 * Single structured validation error with a stable, locale-independent
 * `code` consumers can switch on programmatically.
 */
export interface StructuredValidationError {
  /** Dot-path of the offending field (e.g. `'timestamp'`, `'dataSubject.email'`, `'options[0].purpose'`). */
  field: string;
  /** Stable, snake_case error code — safe to switch on across locales. */
  code: string;
  /** Human-readable English message — informational only; do not regex-match. */
  message: string;
}

/**
 * Result of a structured validator. `errors` is an array (one entry per
 * failed rule). `data` is the narrowed, typed payload, only populated on
 * `valid: true`.
 */
export interface StructuredValidationResult<T> {
  valid: boolean;
  errors: StructuredValidationError[];
  data?: T;
}

let warnedValidateConsent = false;
let warnedValidateConsentOptions = false;

/**
 * Validates consent settings to ensure they meet NDPA requirements
 * @param settings The consent settings to validate
 * @returns An object containing validation result and any error messages
 * @deprecated Use `validateConsentStructured()` for typed `{ field, code, message }[]` errors. The legacy string-returning shape will be removed in 5.0.
 */
export function validateConsent(settings: ConsentSettings): {
  valid: boolean;
  errors: string[]
} {
  if (!warnedValidateConsent) {
    warnedValidateConsent = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[ndpr-toolkit] `validateConsent()` returns English error strings and will be removed in 5.0. Use `validateConsentStructured()` for typed `{ field, code, message }[]` errors.',
    );
  }
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
 * Structured-result variant of {@link validateConsent}. Returns the same
 * checks as `{ field, code, message }[]` so consumers can switch on `code`
 * across locales without regex-matching English strings.
 *
 * Codes emitted:
 * - `consents_required`
 * - `timestamp_required`
 * - `timestamp_invalid`
 * - `version_required`
 * - `method_required`
 * - `has_interacted_required`
 * - `consent_stale`
 *
 * @example
 * ```ts
 * const { valid, errors, data } = validateConsentStructured(settings);
 * if (!valid) {
 *   const stale = errors.find((e) => e.code === 'consent_stale');
 *   if (stale) showRefreshBanner();
 * }
 * ```
 */
export function validateConsentStructured(
  settings: ConsentSettings,
): StructuredValidationResult<ConsentSettings> {
  const errors: StructuredValidationError[] = [];

  if (!settings.consents || Object.keys(settings.consents).length === 0) {
    errors.push({
      field: 'consents',
      code: 'consents_required',
      message: 'Consent settings must include at least one consent option',
    });
  }

  if (!settings.timestamp) {
    errors.push({
      field: 'timestamp',
      code: 'timestamp_required',
      message: 'Consent timestamp is required',
    });
  } else if (typeof settings.timestamp !== 'number' || isNaN(settings.timestamp)) {
    errors.push({
      field: 'timestamp',
      code: 'timestamp_invalid',
      message: 'Consent timestamp must be a valid number',
    });
  }

  if (!settings.version) {
    errors.push({
      field: 'version',
      code: 'version_required',
      message: 'Consent version is required',
    });
  }

  if (!settings.method) {
    errors.push({
      field: 'method',
      code: 'method_required',
      message: 'Consent collection method is required',
    });
  }

  if (settings.hasInteracted === undefined) {
    errors.push({
      field: 'hasInteracted',
      code: 'has_interacted_required',
      message: 'User interaction status is required',
    });
  }

  if (settings.timestamp) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 13);
    const thirteenMonthsAgo = cutoff.getTime();
    if (settings.timestamp < thirteenMonthsAgo) {
      errors.push({
        field: 'timestamp',
        code: 'consent_stale',
        message: 'Consent is older than 13 months and should be refreshed',
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, errors: [], data: settings };
}

/**
 * Validates that consent options meet NDPA Section 26 requirements.
 * Each consent option must specify a purpose for which data will be processed,
 * as consent must be specific and informed per the Nigeria Data Protection Act.
 * @param options The consent options to validate
 * @returns An object containing validation result and any error messages
 * @deprecated Use `validateConsentOptionsStructured()` for typed `{ field, code, message }[]` errors. The legacy string-returning shape will be removed in 5.0.
 */
export function validateConsentOptions(options: ConsentOption[]): {
  valid: boolean;
  errors: string[];
} {
  if (!warnedValidateConsentOptions) {
    warnedValidateConsentOptions = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[ndpr-toolkit] `validateConsentOptions()` returns English error strings and will be removed in 5.0. Use `validateConsentOptionsStructured()` for typed `{ field, code, message }[]` errors.',
    );
  }
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

/**
 * Structured-result variant of {@link validateConsentOptions}. Each option
 * is checked for a non-empty `purpose` (NDPA Section 26). Failing options
 * are reported with `field: 'options[i].purpose'` so consumers can map
 * errors back to the originating option index.
 *
 * Codes emitted:
 * - `options_required` — empty / missing options array
 * - `purpose_required` — single option missing a purpose
 */
export function validateConsentOptionsStructured(
  options: ConsentOption[],
): StructuredValidationResult<ConsentOption[]> {
  const errors: StructuredValidationError[] = [];

  if (!options || options.length === 0) {
    errors.push({
      field: 'options',
      code: 'options_required',
      message: 'At least one consent option is required',
    });
  }

  options?.forEach((option, index) => {
    if (!option.purpose || option.purpose.trim() === '') {
      errors.push({
        field: `options[${index}].purpose`,
        code: 'purpose_required',
        message: `Consent option "${option.id}" is missing a purpose. NDPA Section 26 requires consent to be specific to a stated purpose.`,
      });
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, errors: [], data: options };
}
