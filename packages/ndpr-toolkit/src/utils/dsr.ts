import { DSRRequest } from '../types/dsr';

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
   * set of supported NDPA Part IV §29-36 rights.
   */
  allowedRequestTypes?: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
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
 */
export function validateDsrSubmission(
  payload: unknown,
  options: ValidateDsrSubmissionOptions = {},
): DsrSubmissionValidationResult {
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
    } else if (!EMAIL_RE.test(dataSubject.email)) {
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

  // Safe narrowing: every required field passed validation above.
  const ds = dataSubject as Record<string, unknown>;
  return {
    valid: true,
    errors: {},
    data: {
      requestType: payload.requestType as string,
      dataSubject: {
        fullName: ds.fullName as string,
        email: ds.email as string,
        phone: ds.phone as string | undefined,
        identifierType: (ds.identifierType as string | undefined) ?? '',
        identifierValue: (ds.identifierValue as string | undefined) ?? '',
      },
      additionalInfo: payload.additionalInfo as
        | Record<string, string | number | boolean | null>
        | undefined,
      submittedAt: payload.submittedAt as number,
    },
  };
}

/**
 * Formats a DSR request for display or submission
 * @param request The DSR request to format
 * @returns Formatted request data
 */
export function formatDSRRequest(request: DSRRequest): {
  formattedRequest: Record<string, unknown>;
  isValid: boolean;
  validationErrors: string[];
} {
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
