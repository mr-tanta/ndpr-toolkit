export interface StorageAdapter<T = unknown> {
  /** Load persisted data. Called once on hook mount. */
  load(): T | null | Promise<T | null>;
  /** Persist data. Called on every state change. */
  save(data: T): void | Promise<void>;
  /** Clear persisted data. Called on reset. */
  remove(): void | Promise<void>;
}
