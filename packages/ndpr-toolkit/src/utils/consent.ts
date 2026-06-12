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

/**
 * Validates consent settings against NDPA requirements. Returns structured
 * `{ field, code, message }[]` errors so consumers can switch on `code`
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
    // Subtract 13 months without the setMonth() month-end rollover quirk
    // (e.g. 31 Mar − 13 months must clamp to 28 Feb, not roll into March).
    const cutoff = new Date(Date.now());
    const dayOfMonth = cutoff.getDate();
    cutoff.setDate(1);
    cutoff.setMonth(cutoff.getMonth() - 13);
    const daysInTargetMonth = new Date(cutoff.getFullYear(), cutoff.getMonth() + 1, 0).getDate();
    cutoff.setDate(Math.min(dayOfMonth, daysInTargetMonth));
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
 * Validates consent options against NDPA Section 26 requirements. Each option
 * is checked for a non-empty `purpose`. Failing options are reported with
 * `field: 'options[i].purpose'` so consumers can map errors back to the
 * originating option index.
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
