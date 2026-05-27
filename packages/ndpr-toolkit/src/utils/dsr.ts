import { DSRRequest } from '../types/dsr';
import type {
  StructuredValidationError,
  StructuredValidationResult,
} from './consent';

let warnedValidateDsrSubmission = false;
let warnedFormatDSRRequest = false;

/**
 * Validated DSR submission shape — matches what `<DSRRequestForm onSubmit>`
 * emits client-side. Use this as the typed parameter for your server-side
 * handler after `validateDsrSubmission` returns `valid: true`.
 */
export interface DsrSubmissionPayload {
  requestType: string;
  dataSubject: {
    fullName: string;
    email: string;
    phone?: string;
    identifierType: string;
    identifierValue: string;
  };
  additionalInfo?: Record<string, string | number | boolean | null>;
  submittedAt: number;
}

/** Result of validating a raw DSR submission payload. */
export interface DsrSubmissionValidationResult {
  /** True when the payload conforms to the DSR submission contract. */
  valid: boolean;
  /** Field-keyed error messages. Empty when `valid` is true. */
  errors: Record<string, string>;
  /** The narrowed, typed payload — only populated when `valid` is true. */
  data?: DsrSubmissionPayload;
}

/** Options for {@link validateDsrSubmission}. */
export interface ValidateDsrSubmissionOptions {
  /**
   * Whether the data subject is required to provide an identifier
   * (NDPC's recommended verification step). Mirror whatever you set on
   * the client-side `<DSRRequestForm requireIdentityVerification>`.
   * @default true
   */
  requireIdentityVerification?: boolean;
  /**
   * Allowed request types. When provided, the payload's `requestType`
   * must be one of these — useful for locking the server to a specific
   * set of supported NDPA Part VI §34-38 (plus §35, §36, §37) data-subject rights.
   */
  allowedRequestTypes?: string[];
}

// Backtracking-free email check. Splits on `@` and validates each side with
// linear scans — avoids the polynomial-time worst case of the earlier
// `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` regex on adversarial input.
// RFC 5321 caps total length at 254.
function isValidEmail(value: string): boolean {
  if (value.length === 0 || value.length > 254) return false;
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (local.length === 0 || domain.length === 0) return false;
  if (/\s/.test(value)) return false;
  if (!domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  return true;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Raw, post-validation shape of a DSR submission payload. Mirrors
 * {@link DsrSubmissionPayload} but with the `identifierType` /
 * `identifierValue` fields kept optional so the same guard works whether
 * or not identity verification is required.
 */
interface DsrPayloadRaw {
  requestType: string;
  dataSubject: {
    fullName: string;
    email: string;
    phone?: string;
    identifierType?: string;
    identifierValue?: string;
  };
  additionalInfo?: Record<string, string | number | boolean | null>;
  submittedAt: number;
}

/**
 * Type guard asserting that a payload satisfies the post-validation
 * {@link DsrPayloadRaw} shape. The caller is responsible for running the
 * full validator first — this guard's job is purely to let TS narrow
 * `payload` so the subsequent property reads don't need `as` casts.
 */
function isDsrPayloadRaw(payload: unknown): payload is DsrPayloadRaw {
  if (!isPlainObject(payload)) return false;
  if (!isNonEmptyString(payload.requestType)) return false;
  if (!isPlainObject(payload.dataSubject)) return false;
  const ds = payload.dataSubject;
  if (!isNonEmptyString(ds.fullName)) return false;
  if (!isNonEmptyString(ds.email)) return false;
  if (typeof payload.submittedAt !== 'number' || !Number.isFinite(payload.submittedAt)) return false;
  return true;
}

/**
 * Validate a raw DSR submission payload against the same rules
 * `<DSRRequestForm />` enforces client-side. Designed to be called from a
 * server-side handler (Next.js Route Handler, NestJS controller, Express
 * middleware, Cloudflare Worker) so client and server stay in sync without
 * the consumer hand-rolling zod / class-validator schemas.
 *
 * Defensive — accepts `unknown` and narrows. Safe to call directly on
 * `await request.json()`.
 *
 * @example **Next.js Route Handler**
 * ```ts
 * // app/api/dsr/route.ts
 * import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';
 *
 * export async function POST(req: Request) {
 *   const { valid, errors, data } = validateDsrSubmission(await req.json());
 *   if (!valid) return Response.json({ errors }, { status: 422 });
 *   // `data` is the typed DsrSubmissionPayload
 *   await dsrStore.create(data);
 *   return Response.json({ ok: true }, { status: 201 });
 * }
 * ```
 *
 * @example **Lock to specific request types**
 * ```ts
 * validateDsrSubmission(payload, {
 *   allowedRequestTypes: ['access', 'erasure', 'rectification'],
 * });
 * ```
 *
 * @example **Skip identity verification (e.g. authenticated session)**
 * ```ts
 * validateDsrSubmission(payload, { requireIdentityVerification: false });
 * ```
 *
 * @deprecated Use `validateDsrSubmissionStructured()` for typed `{ field, code, message }[]` errors. The legacy string-returning shape will be removed in 5.0.
 */
export function validateDsrSubmission(
  payload: unknown,
  options: ValidateDsrSubmissionOptions = {},
): DsrSubmissionValidationResult {
  if (!warnedValidateDsrSubmission) {
    warnedValidateDsrSubmission = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[ndpr-toolkit] `validateDsrSubmission()` returns a field-keyed `Record<string, string>` of English messages and will be removed in 5.0. Use `validateDsrSubmissionStructured()` for typed `{ field, code, message }[]` errors.',
    );
  }
  const { requireIdentityVerification = true, allowedRequestTypes } = options;
  const errors: Record<string, string> = {};

  if (!isPlainObject(payload)) {
    return { valid: false, errors: { _root: 'Payload must be an object' } };
  }

  // ── requestType ───────────────────────────────────────────────────────
  if (!isNonEmptyString(payload.requestType)) {
    errors.requestType = 'Request type is required';
  } else if (allowedRequestTypes && !allowedRequestTypes.includes(payload.requestType)) {
    errors.requestType = `Request type "${payload.requestType}" is not in the allowed set`;
  }

  // ── dataSubject ───────────────────────────────────────────────────────
  const dataSubject = payload.dataSubject;
  if (!isPlainObject(dataSubject)) {
    errors.dataSubject = 'Data subject information is required';
  } else {
    if (!isNonEmptyString(dataSubject.fullName)) {
      errors['dataSubject.fullName'] = 'Full name is required';
    }
    if (!isNonEmptyString(dataSubject.email)) {
      errors['dataSubject.email'] = 'Email address is required';
    } else if (!isValidEmail(dataSubject.email)) {
      errors['dataSubject.email'] = 'Email address format is invalid';
    }
    if (dataSubject.phone !== undefined && typeof dataSubject.phone !== 'string') {
      errors['dataSubject.phone'] = 'Phone must be a string when provided';
    }
    if (requireIdentityVerification) {
      if (!isNonEmptyString(dataSubject.identifierType)) {
        errors['dataSubject.identifierType'] = 'Identifier type is required';
      }
      if (!isNonEmptyString(dataSubject.identifierValue)) {
        errors['dataSubject.identifierValue'] = 'Identifier value is required';
      }
    }
  }

  // ── submittedAt ───────────────────────────────────────────────────────
  if (typeof payload.submittedAt !== 'number' || !Number.isFinite(payload.submittedAt)) {
    errors.submittedAt = 'submittedAt must be a finite number (ms timestamp)';
  }

  // ── additionalInfo (optional, if present must be an object) ──────────
  if (payload.additionalInfo !== undefined && !isPlainObject(payload.additionalInfo)) {
    errors.additionalInfo = 'additionalInfo must be an object when provided';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  // Safe narrowing via type guard — every required field passed validation
  // above, so the guard always returns true here. The early-return is for
  // type safety (and to satisfy TS that the cast-free reads below are sound).
  if (!isDsrPayloadRaw(payload)) {
    return { valid: false, errors: { _root: 'Payload failed final narrowing' } };
  }

  return {
    valid: true,
    errors: {},
    data: {
      requestType: payload.requestType,
      dataSubject: {
        fullName: payload.dataSubject.fullName,
        email: payload.dataSubject.email,
        phone: payload.dataSubject.phone,
        identifierType: payload.dataSubject.identifierType ?? '',
        identifierValue: payload.dataSubject.identifierValue ?? '',
      },
      additionalInfo: payload.additionalInfo,
      submittedAt: payload.submittedAt,
    },
  };
}

/**
 * Formats a DSR request for display or submission
 * @param request The DSR request to format
 * @returns Formatted request data
 * @deprecated Use `formatDSRRequestStructured()` for typed `{ field, code, message }[]` errors. The legacy string-returning shape will be removed in 5.0.
 */
export function formatDSRRequest(request: DSRRequest): {
  formattedRequest: Record<string, unknown>;
  isValid: boolean;
  validationErrors: string[];
} {
  if (!warnedFormatDSRRequest) {
    warnedFormatDSRRequest = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[ndpr-toolkit] `formatDSRRequest()` returns English error strings in `validationErrors` and will be removed in 5.0. Use `formatDSRRequestStructured()` for typed `{ field, code, message }[]` errors.',
    );
  }
  const validationErrors: string[] = [];

  // Validate required fields
  if (!request.id) {
    validationErrors.push('Request ID is required');
  }

  if (!request.type) {
    validationErrors.push('Request type is required');
  }

  if (!request.status) {
    validationErrors.push('Request status is required');
  }

  if (!request.createdAt) {
    validationErrors.push('Creation timestamp is required');
  }

  if (!request.subject?.name) {
    validationErrors.push('Data subject name is required');
  }

  if (!request.subject?.email) {
    validationErrors.push('Data subject email is required');
  }

  // Format the request for display or submission
  const formattedRequest = {
    requestId: request.id,
    requestType: request.type,
    status: request.status,
    createdDate: new Date(request.createdAt).toISOString(),
    lastUpdated: request.updatedAt ? new Date(request.updatedAt).toISOString() : undefined,
    dueDate: request.dueDate 
      ? new Date(request.dueDate).toISOString() 
      : undefined,
    dataSubject: request.subject ? {
      name: request.subject.name,
      email: request.subject.email,
      phone: request.subject.phone || 'Not provided',
      identifier: {
        type: request.subject.identifierType || 'Not specified',
        value: request.subject.identifierValue || 'Not provided'
      }
    } : undefined,
    additionalInformation: request.additionalInfo || {},
    verificationStatus: request.verification 
      ? `${request.verification.verified ? 'Verified' : 'Not verified'}${request.verification.method ? ` via ${request.verification.method}` : ''}`
      : 'Pending verification',
    attachments: request.attachments 
      ? request.attachments.map(attachment => ({
          name: attachment.name,
          type: attachment.type,
          addedOn: new Date(attachment.addedAt).toISOString()
        }))
      : []
  };
  
  return {
    formattedRequest,
    isValid: validationErrors.length === 0,
    validationErrors
  };
}

// ---------------------------------------------------------------------------
// Structured-result family (4.1.0) — alongside the legacy string-returning
// validators above. 5.0 will remove the legacy shapes.
// ---------------------------------------------------------------------------

/**
 * Structured-result variant of {@link validateDsrSubmission}. Same rules,
 * but returns an array of `{ field, code, message }` so callers can switch
 * on `code` programmatically across locales.
 *
 * Codes emitted:
 * - `payload_not_object`
 * - `request_type_required`
 * - `request_type_not_allowed`
 * - `data_subject_required`
 * - `full_name_required`
 * - `email_required`
 * - `email_invalid_format`
 * - `phone_invalid_type`
 * - `identifier_type_required`
 * - `identifier_value_required`
 * - `submitted_at_invalid`
 * - `additional_info_invalid_type`
 * - `payload_final_narrowing_failed`
 *
 * @example **Next.js Route Handler**
 * ```ts
 * import { validateDsrSubmissionStructured } from '@tantainnovative/ndpr-toolkit/server';
 *
 * export async function POST(req: Request) {
 *   const { valid, errors, data } = validateDsrSubmissionStructured(await req.json());
 *   if (!valid) {
 *     return Response.json({ errors }, { status: 422 });
 *   }
 *   await dsrStore.create(data);
 *   return Response.json({ ok: true }, { status: 201 });
 * }
 * ```
 */
export function validateDsrSubmissionStructured(
  payload: unknown,
  options: ValidateDsrSubmissionOptions = {},
): StructuredValidationResult<DsrSubmissionPayload> {
  const { requireIdentityVerification = true, allowedRequestTypes } = options;
  const errors: StructuredValidationError[] = [];

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: [
        {
          field: '_root',
          code: 'payload_not_object',
          message: 'Payload must be an object',
        },
      ],
    };
  }

  if (!isNonEmptyString(payload.requestType)) {
    errors.push({
      field: 'requestType',
      code: 'request_type_required',
      message: 'Request type is required',
    });
  } else if (allowedRequestTypes && !allowedRequestTypes.includes(payload.requestType)) {
    errors.push({
      field: 'requestType',
      code: 'request_type_not_allowed',
      message: `Request type "${payload.requestType}" is not in the allowed set`,
    });
  }

  const dataSubject = payload.dataSubject;
  if (!isPlainObject(dataSubject)) {
    errors.push({
      field: 'dataSubject',
      code: 'data_subject_required',
      message: 'Data subject information is required',
    });
  } else {
    if (!isNonEmptyString(dataSubject.fullName)) {
      errors.push({
        field: 'dataSubject.fullName',
        code: 'full_name_required',
        message: 'Full name is required',
      });
    }
    if (!isNonEmptyString(dataSubject.email)) {
      errors.push({
        field: 'dataSubject.email',
        code: 'email_required',
        message: 'Email address is required',
      });
    } else if (!isValidEmail(dataSubject.email)) {
      errors.push({
        field: 'dataSubject.email',
        code: 'email_invalid_format',
        message: 'Email address format is invalid',
      });
    }
    if (dataSubject.phone !== undefined && typeof dataSubject.phone !== 'string') {
      errors.push({
        field: 'dataSubject.phone',
        code: 'phone_invalid_type',
        message: 'Phone must be a string when provided',
      });
    }
    if (requireIdentityVerification) {
      if (!isNonEmptyString(dataSubject.identifierType)) {
        errors.push({
          field: 'dataSubject.identifierType',
          code: 'identifier_type_required',
          message: 'Identifier type is required',
        });
      }
      if (!isNonEmptyString(dataSubject.identifierValue)) {
        errors.push({
          field: 'dataSubject.identifierValue',
          code: 'identifier_value_required',
          message: 'Identifier value is required',
        });
      }
    }
  }

  if (typeof payload.submittedAt !== 'number' || !Number.isFinite(payload.submittedAt)) {
    errors.push({
      field: 'submittedAt',
      code: 'submitted_at_invalid',
      message: 'submittedAt must be a finite number (ms timestamp)',
    });
  }

  if (payload.additionalInfo !== undefined && !isPlainObject(payload.additionalInfo)) {
    errors.push({
      field: 'additionalInfo',
      code: 'additional_info_invalid_type',
      message: 'additionalInfo must be an object when provided',
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (!isDsrPayloadRaw(payload)) {
    return {
      valid: false,
      errors: [
        {
          field: '_root',
          code: 'payload_final_narrowing_failed',
          message: 'Payload failed final narrowing',
        },
      ],
    };
  }

  return {
    valid: true,
    errors: [],
    data: {
      requestType: payload.requestType,
      dataSubject: {
        fullName: payload.dataSubject.fullName,
        email: payload.dataSubject.email,
        phone: payload.dataSubject.phone,
        identifierType: payload.dataSubject.identifierType ?? '',
        identifierValue: payload.dataSubject.identifierValue ?? '',
      },
      additionalInfo: payload.additionalInfo,
      submittedAt: payload.submittedAt,
    },
  };
}

/** Result of {@link formatDSRRequestStructured}. */
export interface FormatDSRRequestStructuredResult {
  valid: boolean;
  errors: StructuredValidationError[];
  /** Formatted request payload — always populated regardless of `valid`. */
  formattedRequest: Record<string, unknown>;
  /** Narrowed input — populated only on `valid: true`. */
  data?: DSRRequest;
}

/**
 * Structured-result variant of {@link formatDSRRequest}. Same formatting
 * output, but `validationErrors` is replaced with a typed `errors` array
 * of `{ field, code, message }`.
 *
 * Codes emitted:
 * - `request_id_required`
 * - `request_type_required`
 * - `request_status_required`
 * - `created_at_required`
 * - `subject_name_required`
 * - `subject_email_required`
 */
export function formatDSRRequestStructured(
  request: DSRRequest,
): FormatDSRRequestStructuredResult {
  const errors: StructuredValidationError[] = [];

  if (!request.id) {
    errors.push({
      field: 'id',
      code: 'request_id_required',
      message: 'Request ID is required',
    });
  }
  if (!request.type) {
    errors.push({
      field: 'type',
      code: 'request_type_required',
      message: 'Request type is required',
    });
  }
  if (!request.status) {
    errors.push({
      field: 'status',
      code: 'request_status_required',
      message: 'Request status is required',
    });
  }
  if (!request.createdAt) {
    errors.push({
      field: 'createdAt',
      code: 'created_at_required',
      message: 'Creation timestamp is required',
    });
  }
  if (!request.subject?.name) {
    errors.push({
      field: 'subject.name',
      code: 'subject_name_required',
      message: 'Data subject name is required',
    });
  }
  if (!request.subject?.email) {
    errors.push({
      field: 'subject.email',
      code: 'subject_email_required',
      message: 'Data subject email is required',
    });
  }

  const formattedRequest = {
    requestId: request.id,
    requestType: request.type,
    status: request.status,
    createdDate: new Date(request.createdAt).toISOString(),
    lastUpdated: request.updatedAt ? new Date(request.updatedAt).toISOString() : undefined,
    dueDate: request.dueDate ? new Date(request.dueDate).toISOString() : undefined,
    dataSubject: request.subject
      ? {
          name: request.subject.name,
          email: request.subject.email,
          phone: request.subject.phone || 'Not provided',
          identifier: {
            type: request.subject.identifierType || 'Not specified',
            value: request.subject.identifierValue || 'Not provided',
          },
        }
      : undefined,
    additionalInformation: request.additionalInfo || {},
    verificationStatus: request.verification
      ? `${request.verification.verified ? 'Verified' : 'Not verified'}${request.verification.method ? ` via ${request.verification.method}` : ''}`
      : 'Pending verification',
    attachments: request.attachments
      ? request.attachments.map((attachment) => ({
          name: attachment.name,
          type: attachment.type,
          addedOn: new Date(attachment.addedAt).toISOString(),
        }))
      : [],
  };

  if (errors.length > 0) {
    return { valid: false, errors, formattedRequest };
  }
  return { valid: true, errors: [], formattedRequest, data: request };
}
