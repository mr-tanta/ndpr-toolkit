export type StorageAdapterOperation = 'load' | 'save' | 'remove';

export type StorageAdapterMedium =
  | 'memory'
  | 'local-storage'
  | 'session-storage'
  | 'cookie'
  | 'remote-api'
  | 'composed'
  | 'custom';

export type StorageAdapterDurability =
  | 'ephemeral'
  | 'session'
  | 'best-effort'
  | 'server-acknowledged'
  | 'application-defined';

export type StorageAdapterIntegrity =
  | 'none'
  | 'unverified-client-state'
  | 'application-defined';

export type StorageAdapterConcurrency =
  | 'none'
  | 'last-write-wins'
  | 'fan-out'
  | 'application-defined';

export type StorageAdapterEvidenceSuitability =
  | 'none'
  | 'ux-state-only'
  | 'application-defined';

/**
 * Describes what an adapter can actually guarantee. Capability metadata is
 * informational; applications must still implement authentication,
 * authorization, retention, integrity, and audit controls appropriate to
 * their backend.
 */
export interface StorageAdapterCapabilities {
  medium: StorageAdapterMedium;
  durability: StorageAdapterDurability;
  integrity: StorageAdapterIntegrity;
  concurrency: StorageAdapterConcurrency;
  evidenceSuitability: StorageAdapterEvidenceSuitability;
  serverReadable: boolean;
}

export interface StorageAdapterErrorContext {
  operation: StorageAdapterOperation;
  medium: StorageAdapterMedium;
  error: unknown;
  key?: string;
}

export type StorageAdapterMutationFailureMode = 'throw' | 'graceful';

/** Shared failure controls used by browser-backed adapters. */
export interface StorageAdapterFailureOptions {
  /** Receives read, serialization, quota, and security failures. */
  onError?: (context: StorageAdapterErrorContext) => void;
  /**
   * Whether failed save/remove operations throw after reporting the error.
   * Defaults to `throw`, making failed persistence observable to hooks and
   * callers. `load` remains nullable and reports failures through `onError`.
   */
  mutationFailureMode?: StorageAdapterMutationFailureMode;
}

export class StorageAdapterError extends Error {
  readonly context: StorageAdapterErrorContext;

  constructor(context: StorageAdapterErrorContext) {
    const key = context.key ? ` for key "${context.key}"` : '';
    super(
      `[ndpr-toolkit] ${context.medium} adapter ${context.operation} failed${key}`,
    );
    this.name = 'StorageAdapterError';
    this.context = context;
  }
}

export interface StorageAdapter<T = unknown> {
  /** Optional, explicit description of this adapter's persistence guarantees. */
  readonly capabilities?: Readonly<StorageAdapterCapabilities>;
  /** Load persisted data. Called once on hook mount. */
  load(): T | null | Promise<T | null>;
  /** Persist data. Called on every state change. */
  save(data: T): void | Promise<void>;
  /** Clear persisted data. Called on reset. */
  remove(): void | Promise<void>;
}
