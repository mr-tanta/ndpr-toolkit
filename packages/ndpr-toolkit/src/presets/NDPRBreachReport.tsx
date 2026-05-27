import React from 'react';
import { BreachReportForm } from '../components/breach/BreachReportForm';
import type { BreachReportFormClassNames, BreachFormSubmission } from '../components/breach/BreachReportForm';
import type { BreachCategory } from '../types/breach';
import type { StorageAdapter } from '../adapters/types';

const DEFAULT_CATEGORIES: BreachCategory[] = [
  {
    id: 'unauthorized_access',
    name: 'Unauthorized Access',
    description: 'Unauthorized access to personal data',
    defaultSeverity: 'high',
  },
  {
    id: 'data_loss',
    name: 'Data Loss',
    description: 'Loss of personal data',
    defaultSeverity: 'high',
  },
  {
    id: 'data_theft',
    name: 'Data Theft',
    description: 'Theft of personal data',
    defaultSeverity: 'critical',
  },
  {
    id: 'system_breach',
    name: 'System Breach',
    description: 'Breach of system containing personal data',
    defaultSeverity: 'critical',
  },
  {
    id: 'accidental_disclosure',
    name: 'Accidental Disclosure',
    description: 'Unintended disclosure of personal data',
    defaultSeverity: 'medium',
  },
];

/**
 * UX copy overrides for the NDPRBreachReport preset. Pass any subset to
 * replace the default text without dropping to the lower-level
 * `<BreachReportForm>` API.
 */
export interface NDPRBreachReportCopy {
  /** Form heading. Default: "Report a Data Breach" */
  title?: string;
  /** Body paragraph under the heading. */
  description?: string;
  /** Submit button label. Default: "Submit Report" */
  submitButton?: string;
}

export interface NDPRBreachReportProps {
  categories?: BreachCategory[];
  adapter?: StorageAdapter<BreachFormSubmission>;
  classNames?: BreachReportFormClassNames;
  unstyled?: boolean;
  onSubmit?: (data: BreachFormSubmission) => void;

  /**
   * UX copy overrides — see {@link NDPRBreachReportCopy}.
   */
  copy?: NDPRBreachReportCopy;

  /**
   * Body paragraph under the heading.
   */
  description?: string;

  /**
   * Public-form mode. Use when the form should submit to your existing
   * backend workflow instead of being state-managed by an adapter.
   *
   * When `submitTo` is set:
   * - the form does NOT require an `adapter`
   * - on submit, the toolkit POSTs the JSON-serialised `BreachFormSubmission`
   *   to this URL (with `Content-Type: application/json`)
   * - your `onSubmit` callback still fires (after the POST resolves)
   * - submit failures are surfaced via `onSubmitError`
   *
   * @example
   *   <NDPRBreachReport submitTo="/api/breach" />
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
   * `Response` object, the submitted `BreachFormSubmission` payload, and the
   * parsed JSON body if the server returned valid JSON.
   */
  onSubmitSuccess?: (ctx: {
    response: Response;
    data: BreachFormSubmission;
    body?: unknown;
  }) => void;
}

export const NDPRBreachReport: React.FC<NDPRBreachReportProps> = ({
  categories = DEFAULT_CATEGORIES,
  adapter,
  classNames,
  unstyled,
  onSubmit = () => {},
  copy,
  description,
  submitTo,
  submitOptions,
  onSubmitError,
  onSubmitSuccess,
}) => {
  const handleSubmit = async (data: BreachFormSubmission) => {
    if (submitTo) {
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
          let body: unknown;
          try {
            const text = await response.clone().text();
            if (text) body = JSON.parse(text);
          } catch {
            // body wasn't JSON
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

  // copy.description wins; otherwise `description` prop; otherwise the
  // underlying form supplies the locale-aware default.
  const resolvedDescription = copy?.description ?? description;

  return (
    <BreachReportForm
      categories={categories}
      onSubmit={handleSubmit}
      classNames={classNames}
      unstyled={unstyled}
      title={copy?.title}
      description={resolvedDescription}
      submitButtonText={copy?.submitButton}
    />
  );
};
