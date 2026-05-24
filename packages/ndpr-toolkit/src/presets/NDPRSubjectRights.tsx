import React from 'react';
import { DSRRequestForm } from '../components/dsr/DSRRequestForm';
import type { DSRRequestFormClassNames, DSRFormSubmission } from '../components/dsr/DSRRequestForm';
import type { RequestType } from '../types/dsr';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_REQUEST_TYPES: RequestType[] = [
  {
    id: 'access',
    name: 'Access My Data',
    description: 'Request a copy of your personal data held by us',
    ndpaSection: 'Section 34(1)(a)–(b)',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'rectification',
    name: 'Correct My Data',
    description: 'Request corrections to inaccurate personal data',
    ndpaSection: 'Section 34(1)(c)',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: true,
    additionalFields: [
      {
        id: 'correction_details',
        label: 'What data needs to be corrected?',
        type: 'textarea',
        required: true,
        placeholder: 'Please describe the inaccurate data and what the correct information should be',
      },
    ],
  },
  {
    id: 'erasure',
    name: 'Delete My Data',
    description: 'Request deletion of your personal data',
    ndpaSection: 'Section 34(1)(d), Section 34(2)',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'portability',
    name: 'Export My Data',
    description: 'Receive your data in a portable format',
    ndpaSection: 'Section 38',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'restrict',
    name: 'Restrict Processing',
    description: 'Request restriction of data processing',
    ndpaSection: 'Section 34(1)(e)',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'object',
    name: 'Object to Processing',
    description: 'Object to processing of your personal data',
    ndpaSection: 'Section 36',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
  {
    id: 'withdraw_consent',
    name: 'Withdraw My Consent',
    description: 'Withdraw consent previously given for processing',
    ndpaSection: 'Section 35',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

export interface NDPRSubjectRightsProps {
  requestTypes?: RequestType[];
  adapter?: StorageAdapter<DSRFormSubmission>;
  classNames?: DSRRequestFormClassNames;
  unstyled?: boolean;
  onSubmit?: (data: DSRFormSubmission) => void;

  /**
   * Public-form mode. Use when the form should submit to your existing
   * backend workflow instead of being state-managed by an adapter.
   *
   * When `submitTo` is set:
   * - the form does NOT require an `adapter`
   * - on submit, the toolkit POSTs the JSON-serialised `DSRFormSubmission`
   *   to this URL (with `Content-Type: application/json`)
   * - your `onSubmit` callback still fires (after the POST resolves)
   * - submit failures are surfaced via `onSubmitError`
   *
   * For more control over headers, credentials, or retry behaviour, build
   * an `apiAdapter` (which now supports CSRF, retry, and error hooks in
   * 3.6.0) and pass that as `adapter` instead. `submitTo` is the
   * fire-and-forget shortcut for public forms.
   *
   * @example
   *   <NDPRSubjectRights submitTo="/api/dsr" />
   */
  submitTo?: string;

  /**
   * Fetch options for the `submitTo` POST. Useful for adding `credentials`
   * (cookies/auth), `X-CSRF-Token`, or any other header your backend
   * requires. Ignored unless `submitTo` is set.
   *
   * @default { credentials: 'same-origin' }
   */
  submitOptions?: {
    headers?: Record<string, string> | (() => Record<string, string>);
    credentials?: RequestCredentials;
  };

  /**
   * Called when a `submitTo` POST fails (network error or non-2xx
   * response). Receives the underlying error or Response.
   */
  onSubmitError?: (ctx: { error?: unknown; response?: Response }) => void;

  /**
   * Called when a `submitTo` POST succeeds (2xx response). Receives the
   * `Response` object, the submitted `DSRFormSubmission` payload, and the
   * parsed JSON body if the server returned valid JSON. Use this to
   * display a server-generated reference number, redirect the user, or
   * trigger analytics.
   *
   * The `body` field is `undefined` if the response had no body or the
   * body was not valid JSON. It is typed `unknown` to force consumers to
   * narrow it themselves before reading fields.
   *
   * @example
   *   <NDPRSubjectRights
   *     submitTo="/api/dsr"
   *     onSubmitSuccess={({ response, data, body }) => {
   *       const ref = (body as { referenceId?: string })?.referenceId;
   *       if (ref) router.push(`/dsr-confirmation?ref=${ref}`);
   *     }}
   *   />
   */
  onSubmitSuccess?: (ctx: {
    response: Response;
    data: DSRFormSubmission;
    body?: unknown;
  }) => void;
}

export const NDPRSubjectRights: React.FC<NDPRSubjectRightsProps> = ({
  requestTypes = DEFAULT_REQUEST_TYPES,
  adapter,
  classNames,
  unstyled,
  onSubmit = () => {},
  submitTo,
  submitOptions,
  onSubmitError,
  onSubmitSuccess,
}) => {
  const handleSubmit = async (data: DSRFormSubmission) => {
    if (submitTo) {
      // Public-form mode: fire-and-forget POST to the consumer's backend.
      // No local state, no adapter required — just a single network call.
      const headers = typeof submitOptions?.headers === 'function'
        ? submitOptions.headers()
        : submitOptions?.headers ?? {};
      try {
        const response = await fetch(submitTo, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          credentials: submitOptions?.credentials ?? 'same-origin',
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          onSubmitError?.({ response });
        } else if (onSubmitSuccess) {
          // Parse the JSON body if the server returned one. Many backends
          // return an empty body or 204 — leave `body` undefined in that
          // case rather than throwing.
          let body: unknown;
          try {
            const text = await response.clone().text();
            if (text) body = JSON.parse(text);
          } catch {
            // Body wasn't valid JSON. Pass undefined; consumers can
            // inspect `response` directly if they need raw access.
          }
          onSubmitSuccess({ response, data, body });
        }
      } catch (error) {
        onSubmitError?.({ error });
      }
    } else if (adapter) {
      adapter.save(data);
    }
    onSubmit(data);
  };

  return (
    <DSRRequestForm
      requestTypes={requestTypes}
      onSubmit={handleSubmit}
      classNames={classNames}
      unstyled={unstyled}
    />
  );
};
