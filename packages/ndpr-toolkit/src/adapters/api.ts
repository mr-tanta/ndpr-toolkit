import type {
  StorageAdapter,
  StorageAdapterCapabilities,
  StorageAdapterMutationFailureMode,
} from './types';

export type ApiAdapterMethod = 'load' | 'save' | 'remove';

export interface ApiAdapterErrorContext<T = unknown> {
  method: ApiAdapterMethod;
  endpoint: string;
  error?: unknown;
  response?: Response;
  status?: number;
  payload?: T;
  /** Zero-based request attempt. */
  attempt: number;
  /** True when this adapter's timeout aborted the request. */
  timedOut?: boolean;
}

export interface ApiAdapterSuccessContext<T = unknown> {
  method: ApiAdapterMethod;
  endpoint: string;
  response: Response;
  data?: T;
  payload?: T;
}

export interface ApiAdapterRetryConfig {
  /** Number of additional requests after the first. Defaults to 0. */
  attempts?: number;
  /** Exponential-backoff base delay in milliseconds. Defaults to 250. */
  baseDelayMs?: number;
  /** Defaults to retrying network failures and 5xx responses. */
  shouldRetry?: (context: ApiAdapterErrorContext<unknown>) => boolean;
}

export interface ApiAdapterIdempotencyContext<T = unknown> {
  method: 'save' | 'remove';
  endpoint: string;
  payload?: T;
}

export interface ApiAdapterOptions<T = unknown> {
  headers?: Record<string, string> | (() => Record<string, string>);
  credentials?: RequestCredentials;
  loadMethod?: 'GET' | 'POST';
  saveMethod?: 'POST' | 'PUT' | 'PATCH';
  unwrap?: (raw: unknown) => T | null;
  retry?: ApiAdapterRetryConfig;
  onError?: (context: ApiAdapterErrorContext<T>) => void;
  onSuccess?: (context: ApiAdapterSuccessContext<T>) => void;
  fetchInit?: Omit<
    RequestInit,
    'method' | 'headers' | 'body' | 'credentials' | 'signal'
  > & { signal?: AbortSignal };
  /** Request timeout in milliseconds. Defaults to 15000; set to 0 to disable. */
  timeoutMs?: number;
  /**
   * Key used for retry-safe mutation requests. A function is recommended so
   * independent logical mutations receive different keys while retries of
   * one mutation reuse the same key.
   */
  idempotencyKey?:
    | string
    | ((context: ApiAdapterIdempotencyContext<T>) => string | undefined);
  /** Header carrying the idempotency key. Defaults to `Idempotency-Key`. */
  idempotencyHeader?: string;
  /** Failed save/remove operations reject by default. */
  mutationFailureMode?: StorageAdapterMutationFailureMode;
  /** Failed loads return null by default; use `throw` for strict callers. */
  loadFailureMode?: StorageAdapterMutationFailureMode;
}

export class ApiAdapterError<T = unknown> extends Error {
  readonly context: ApiAdapterErrorContext<T>;

  constructor(context: ApiAdapterErrorContext<T>) {
    const status = context.status === undefined ? '' : ` (${context.status})`;
    super(
      `[ndpr-toolkit] API adapter ${context.method} failed for ${context.endpoint}${status}`,
    );
    this.name = 'ApiAdapterError';
    this.context = context;
  }
}

const CAPABILITIES: Readonly<StorageAdapterCapabilities> = Object.freeze({
  medium: 'remote-api',
  durability: 'server-acknowledged',
  integrity: 'application-defined',
  concurrency: 'application-defined',
  evidenceSuitability: 'application-defined',
  serverReadable: true,
});

function defaultShouldRetry(
  context: ApiAdapterErrorContext<unknown>,
): boolean {
  return !context.response || context.response.status >= 500;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function resolveHeaders(
  headers: ApiAdapterOptions['headers'],
): Record<string, string> {
  if (!headers) return {};
  return typeof headers === 'function' ? headers() : headers;
}

function isRetrySafe(
  method: ApiAdapterMethod,
  loadMethod: 'GET' | 'POST',
  saveMethod: 'POST' | 'PUT' | 'PATCH',
  idempotencyKey: string | undefined,
): boolean {
  if (method === 'load') return loadMethod === 'GET' || Boolean(idempotencyKey);
  if (method === 'save') return saveMethod === 'PUT' || Boolean(idempotencyKey);
  return true;
}

export function apiAdapter<T = unknown>(
  endpoint: string,
  options: ApiAdapterOptions<T> = {},
): StorageAdapter<T> {
  const {
    headers,
    credentials = 'same-origin',
    loadMethod = 'GET',
    saveMethod = 'POST',
    unwrap,
    retry,
    onError,
    onSuccess,
    fetchInit,
    timeoutMs = 15_000,
    idempotencyKey,
    idempotencyHeader = 'Idempotency-Key',
    mutationFailureMode = 'throw',
    loadFailureMode = 'graceful',
  } = options;

  const retryAttempts = retry?.attempts ?? 0;
  const retryBaseDelay = retry?.baseDelayMs ?? 250;
  const shouldRetry = retry?.shouldRetry ?? defaultShouldRetry;

  if (!Number.isInteger(retryAttempts) || retryAttempts < 0) {
    throw new RangeError('retry.attempts must be a non-negative integer');
  }
  if (!Number.isFinite(retryBaseDelay) || retryBaseDelay < 0) {
    throw new RangeError('retry.baseDelayMs must be a non-negative finite number');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    throw new RangeError('timeoutMs must be a non-negative finite number');
  }

  function report(context: ApiAdapterErrorContext<T>): void {
    if (onError) {
      onError(context);
      return;
    }
    if (context.method === 'load') return;
    const verb = context.method === 'save' ? 'save to' : 'delete from';
    const status = context.status === undefined ? '' : `: ${context.status}`;
    // Deliberately exclude response bodies and payloads: either may contain
    // personal data. Consumers can inspect them in an explicit onError hook.
    console.warn(`[ndpr-toolkit] Failed to ${verb} ${endpoint}${status}`);
  }

  function resolveIdempotencyKey(
    method: 'save' | 'remove',
    payload?: T,
  ): string | undefined {
    if (!idempotencyKey) return undefined;
    return typeof idempotencyKey === 'function'
      ? idempotencyKey({ method, endpoint, payload })
      : idempotencyKey;
  }

  async function fetchAttempt(
    init: RequestInit,
  ): Promise<{ response?: Response; error?: unknown; timedOut: boolean }> {
    const controller = new AbortController();
    const externalSignal = fetchInit?.signal;
    let timedOut = false;
    const abortFromExternal = () => controller.abort();
    externalSignal?.addEventListener('abort', abortFromExternal, { once: true });
    if (externalSignal?.aborted) controller.abort();

    const timeout =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, timeoutMs)
        : undefined;

    try {
      const response = await fetch(endpoint, {
        ...fetchInit,
        ...init,
        headers: {
          ...resolveHeaders(headers),
          ...(init.headers as Record<string, string> | undefined),
        },
        credentials,
        signal: controller.signal,
      });
      return { response, timedOut };
    } catch (error) {
      return { error, timedOut };
    } finally {
      if (timeout !== undefined) clearTimeout(timeout);
      externalSignal?.removeEventListener('abort', abortFromExternal);
    }
  }

  async function attempt(
    method: ApiAdapterMethod,
    init: RequestInit,
    payload?: T,
    operationIdempotencyKey?: string,
  ): Promise<
    | { ok: true; response: Response }
    | { ok: false; context: ApiAdapterErrorContext<T> }
  > {
    for (let attemptIndex = 0; attemptIndex <= retryAttempts; attemptIndex += 1) {
      const requestHeaders: Record<string, string> = {
        ...(init.headers as Record<string, string> | undefined),
      };
      if (operationIdempotencyKey) {
        requestHeaders[idempotencyHeader] = operationIdempotencyKey;
      }

      const { response, error, timedOut } = await fetchAttempt({
        ...init,
        headers: requestHeaders,
      });
      if (response?.ok) return { ok: true, response };

      const context: ApiAdapterErrorContext<T> = {
        method,
        endpoint,
        error,
        response,
        status: response?.status,
        payload,
        attempt: attemptIndex,
        timedOut,
      };
      const lastAttempt = attemptIndex === retryAttempts;
      const retrySafe = isRetrySafe(
        method,
        loadMethod,
        saveMethod,
        operationIdempotencyKey,
      );
      if (
        lastAttempt ||
        !retrySafe ||
        !shouldRetry(context as ApiAdapterErrorContext<unknown>)
      ) {
        report(context);
        return { ok: false, context };
      }

      await sleep(retryBaseDelay * 2 ** attemptIndex);
    }

    throw new Error('Unreachable API adapter retry state');
  }

  return {
    capabilities: CAPABILITIES,
    async load(): Promise<T | null> {
      const result = await attempt('load', {
        method: loadMethod,
        headers: {},
      });
      if (!result.ok) {
        if (loadFailureMode === 'throw') throw new ApiAdapterError(result.context);
        return null;
      }

      try {
        const raw = (await result.response.json()) as unknown;
        const data = unwrap ? unwrap(raw) : (raw as T);
        onSuccess?.({
          method: 'load',
          endpoint,
          response: result.response,
          data: data ?? undefined,
        });
        return data;
      } catch (error) {
        const context: ApiAdapterErrorContext<T> = {
          method: 'load',
          endpoint,
          error,
          response: result.response,
          status: result.response.status,
          attempt: 0,
        };
        report(context);
        if (loadFailureMode === 'throw') throw new ApiAdapterError(context);
        return null;
      }
    },

    async save(data: T): Promise<void> {
      let body: string;
      let operationIdempotencyKey: string | undefined;
      try {
        body = JSON.stringify(data);
        if (typeof body !== 'string') {
          throw new TypeError('Value is not JSON-serializable');
        }
        operationIdempotencyKey = resolveIdempotencyKey('save', data);
      } catch (error) {
        const context: ApiAdapterErrorContext<T> = {
          method: 'save',
          endpoint,
          error,
          payload: data,
          attempt: 0,
        };
        report(context);
        if (mutationFailureMode === 'throw') throw new ApiAdapterError(context);
        return;
      }

      const result = await attempt(
        'save',
        {
          method: saveMethod,
          headers: { 'Content-Type': 'application/json' },
          body,
        },
        data,
        operationIdempotencyKey,
      );
      if (!result.ok) {
        if (mutationFailureMode === 'throw') throw new ApiAdapterError(result.context);
        return;
      }
      onSuccess?.({
        method: 'save',
        endpoint,
        response: result.response,
        payload: data,
      });
    },

    async remove(): Promise<void> {
      let operationIdempotencyKey: string | undefined;
      try {
        operationIdempotencyKey = resolveIdempotencyKey('remove');
      } catch (error) {
        const context: ApiAdapterErrorContext<T> = {
          method: 'remove',
          endpoint,
          error,
          attempt: 0,
        };
        report(context);
        if (mutationFailureMode === 'throw') throw new ApiAdapterError(context);
        return;
      }

      const result = await attempt(
        'remove',
        { method: 'DELETE', headers: {} },
        undefined,
        operationIdempotencyKey,
      );
      if (!result.ok) {
        if (mutationFailureMode === 'throw') throw new ApiAdapterError(result.context);
        return;
      }
      onSuccess?.({
        method: 'remove',
        endpoint,
        response: result.response,
      });
    },
  };
}
