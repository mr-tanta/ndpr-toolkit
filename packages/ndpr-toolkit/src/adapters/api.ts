import type { StorageAdapter } from './types';

export type ApiAdapterMethod = 'load' | 'save' | 'remove';

export interface ApiAdapterErrorContext<T = unknown> {
  /** Which adapter operation triggered this — `load`, `save`, or `remove`. */
  method: ApiAdapterMethod;
  /** The endpoint URL that failed. */
  endpoint: string;
  /** Underlying error (for network failures / parse errors). */
  error?: unknown;
  /** Response object, if a response was received. */
  response?: Response;
  /** HTTP status code, if available. */
  status?: number;
  /** For `save`, the payload that failed to send. */
  payload?: T;
  /** Which retry attempt this is (0 = first try). Capped at `retry.attempts`. */
  attempt: number;
}

export interface ApiAdapterSuccessContext<T = unknown> {
  /** Which adapter operation succeeded — `load`, `save`, or `remove`. */
  method: ApiAdapterMethod;
  /** The endpoint URL. */
  endpoint: string;
  /** Response object. */
  response: Response;
  /** For `load` operations, the parsed (and optionally unwrapped) data. */
  data?: T;
  /** For `save` operations, the payload that was sent. */
  payload?: T;
}

export interface ApiAdapterRetryConfig {
  /**
   * Number of additional attempts after the initial request. Defaults to 0
   * (no retries). e.g. `attempts: 2` means up to 3 total requests.
   */
  attempts?: number;
  /**
   * Base delay in ms between attempts. Defaults to 250ms. The actual delay
   * uses exponential backoff: `baseDelayMs * 2^attempt`.
   */
  baseDelayMs?: number;
  /**
   * Predicate that decides whether to retry given the failure context. By
   * default we retry on network errors and 5xx responses, but not on 4xx
   * (those are client errors that won't fix themselves).
   */
  shouldRetry?: (ctx: ApiAdapterErrorContext<unknown>) => boolean;
}

export interface ApiAdapterOptions<T = unknown> {
  /**
   * Extra HTTP headers to send with every request. Useful for `Authorization`,
   * `X-CSRF-Token`, `X-Requested-With`, etc.
   *
   * Can also be a function that returns headers, which lets you read a CSRF
   * token from the DOM/cookie at request time rather than at adapter
   * construction time.
   */
  headers?: Record<string, string> | (() => Record<string, string>);

  /**
   * Forwarded to fetch's `credentials` option. Defaults to `'same-origin'`
   * (the browser default). Set to `'include'` for cross-origin endpoints
   * that need cookies / auth.
   */
  credentials?: RequestCredentials;

  /**
   * HTTP method override for the load operation. Defaults to `'GET'`.
   */
  loadMethod?: 'GET' | 'POST';

  /**
   * HTTP method override for the save operation. Defaults to `'POST'`. Some
   * REST APIs prefer `'PUT'` for upsert semantics.
   */
  saveMethod?: 'POST' | 'PUT' | 'PATCH';

  /**
   * Transform the raw JSON response into the expected `T`. Useful for APIs
   * that wrap responses in `{ data: ... }` or similar envelopes. Called
   * after `res.json()`. If omitted, the parsed JSON is used as-is.
   */
  unwrap?: (raw: unknown) => T | null;

  /**
   * Retry policy for failed requests. Defaults to no retries (preserves the
   * pre-3.6.0 behaviour). When configured, applies to all three operations.
   */
  retry?: ApiAdapterRetryConfig;

  /**
   * Called when a request fails (after all retries exhausted). The adapter
   * still returns a graceful null/void result so the consuming hook
   * doesn't crash — this hook is for telemetry, toasts, or audit logging.
   */
  onError?: (ctx: ApiAdapterErrorContext<T>) => void;

  /**
   * Called when a request succeeds. Useful for cache invalidation,
   * analytics, or syncing other state.
   */
  onSuccess?: (ctx: ApiAdapterSuccessContext<T>) => void;

  /**
   * Per-request fetch options to merge into every request. Use this for
   * things `fetch` itself supports that aren't directly modelled above —
   * `signal`, `mode`, `cache`, `redirect`, etc.
   */
  fetchInit?: Omit<RequestInit, 'method' | 'headers' | 'body' | 'credentials'>;
}

function defaultShouldRetry(ctx: ApiAdapterErrorContext<unknown>): boolean {
  // Retry on network errors (no response) and 5xx server errors. Skip 4xx
  // (client errors are not going to fix themselves) and skip 2xx + 3xx
  // (success / redirect — shouldn't reach the retry path anyway).
  if (!ctx.response) return true;
  return ctx.response.status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveHeaders(
  headers: ApiAdapterOptions['headers'],
): Record<string, string> {
  if (!headers) return {};
  if (typeof headers === 'function') return headers();
  return headers;
}

/**
 * Production-ready API storage adapter.
 *
 * Backward-compatible with the 3.5.x signature — `apiAdapter('/api/x')`
 * still works exactly as before. New options are all opt-in.
 *
 * @example basic
 *   const adapter = apiAdapter<ConsentSettings>('/api/consent');
 *
 * @example with credentials and CSRF
 *   const adapter = apiAdapter<ConsentSettings>('/api/consent', {
 *     credentials: 'include',
 *     headers: () => ({
 *       'X-CSRF-Token': document.querySelector<HTMLMetaElement>(
 *         'meta[name="csrf-token"]'
 *       )?.content ?? '',
 *     }),
 *   });
 *
 * @example with retry + telemetry
 *   const adapter = apiAdapter<ConsentSettings>('/api/consent', {
 *     retry: { attempts: 2, baseDelayMs: 300 },
 *     onError: (ctx) => Sentry.captureException(ctx.error, { extra: ctx }),
 *     onSuccess: (ctx) => analytics.track('consent_saved', { method: ctx.method }),
 *   });
 *
 * @example with response unwrap
 *   const adapter = apiAdapter<ConsentSettings>('/api/consent', {
 *     // API returns { data: ConsentSettings, ok: true }
 *     unwrap: (raw) => (raw as { data: ConsentSettings }).data,
 *   });
 */
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
  } = options;

  const retryAttempts = retry?.attempts ?? 0;
  const retryBaseDelay = retry?.baseDelayMs ?? 250;
  const shouldRetry = retry?.shouldRetry ?? defaultShouldRetry;

  // Backward-compat: if no onError handler is configured, fall back to the
  // pre-3.6.0 console.warn behavior so existing telemetry-free deployments
  // still surface failures in the dev console.
  //
  // Since 3.10.5: also surface the response body (capped 256 chars). The
  // previous behaviour swallowed it, so a 400 from the server saying
  // `{"error":"Validation failed","fields":{...}}` showed up as just
  // "Failed to save to /api/x: 400" with no clue why. Best-effort clone
  // + text; if the body can't be read, fall back to the status-only line.
  const handleError = onError ?? ((ctx: ApiAdapterErrorContext<T>) => {
    if (ctx.method === 'load') return; // load failures already return null silently
    const verb = ctx.method === 'save' ? 'save to' : 'delete from';
    if (ctx.response) {
      // Always emit the status-only line synchronously so tests + dev
      // consoles see SOMETHING even if reading the body fails (the mock
      // Response objects in our test suite are plain `{ok, status}` and
      // don't carry a real `.clone()`).
      console.warn(
        `[ndpr-toolkit] Failed to ${verb} ${ctx.endpoint}: ${ctx.response.status}`,
      );
      // Best-effort: also surface the response body (capped 256 chars) so
      // the developer can see what the server actually said. Cloned first
      // so the consumer's `await response.text()` (if any) still works.
      try {
        const clone = typeof ctx.response.clone === 'function' ? ctx.response.clone() : null;
        if (clone && typeof clone.text === 'function') {
          void clone
            .text()
            .then((body) => {
              const snippet = body.length > 256 ? `${body.slice(0, 256)}…` : body;
              if (snippet.trim()) {
                console.warn(
                  `[ndpr-toolkit] ${verb} ${ctx.endpoint} response body: ${snippet}`,
                );
              }
            })
            .catch(() => {
              /* body unreadable — status-only line above already emitted */
            });
        }
      } catch {
        /* clone() unsupported — status-only line above already emitted */
      }
    } else {
      console.warn(
        `[ndpr-toolkit] Failed to ${verb} ${ctx.endpoint}`,
      );
    }
  });

  async function attempt(
    method: ApiAdapterMethod,
    init: RequestInit,
    payload?: T,
  ): Promise<{ ok: true; response: Response } | { ok: false }> {
    for (let i = 0; i <= retryAttempts; i++) {
      let response: Response | undefined;
      let error: unknown;
      try {
        response = await fetch(endpoint, {
          ...fetchInit,
          ...init,
          headers: {
            ...resolveHeaders(headers),
            ...(init.headers as Record<string, string>),
          },
          credentials,
        });
      } catch (e) {
        error = e;
      }

      if (response && response.ok) {
        return { ok: true, response };
      }

      // Either no response (network error) or a non-2xx response
      const ctx: ApiAdapterErrorContext<T> = {
        method,
        endpoint,
        error,
        response,
        status: response?.status,
        payload,
        attempt: i,
      };

      const isLastAttempt = i === retryAttempts;
      if (isLastAttempt || !shouldRetry(ctx as ApiAdapterErrorContext<unknown>)) {
        handleError(ctx);
        return { ok: false };
      }

      // Exponential backoff before the next attempt
      await sleep(retryBaseDelay * Math.pow(2, i));
    }
    return { ok: false };
  }

  return {
    async load(): Promise<T | null> {
      const result = await attempt(
        'load',
        { method: loadMethod, headers: {} },
      );
      if (!result.ok) return null;
      try {
        const raw = (await result.response.json()) as unknown;
        const data = unwrap ? unwrap(raw) : (raw as T);
        if (onSuccess) {
          onSuccess({
            method: 'load',
            endpoint,
            response: result.response,
            data: data ?? undefined,
          });
        }
        return data;
      } catch (error) {
        handleError({
          method: 'load',
          endpoint,
          error,
          response: result.response,
          status: result.response.status,
          attempt: retryAttempts,
        });
        return null;
      }
    },

    async save(data: T): Promise<void> {
      const result = await attempt(
        'save',
        {
          method: saveMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
        data,
      );
      if (result.ok && onSuccess) {
        onSuccess({
          method: 'save',
          endpoint,
          response: result.response,
          payload: data,
        });
      }
    },

    async remove(): Promise<void> {
      const result = await attempt(
        'remove',
        { method: 'DELETE', headers: {} },
      );
      if (result.ok && onSuccess) {
        onSuccess({
          method: 'remove',
          endpoint,
          response: result.response,
        });
      }
    },
  };
}
