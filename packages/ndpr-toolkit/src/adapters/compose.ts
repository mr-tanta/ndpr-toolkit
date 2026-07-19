import type {
  StorageAdapter,
  StorageAdapterCapabilities,
  StorageAdapterOperation,
} from './types';

export class ComposedAdapterError extends Error {
  readonly operation: StorageAdapterOperation;
  readonly adapterIndex: number;
  readonly cause: unknown;

  constructor(
    operation: StorageAdapterOperation,
    adapterIndex: number,
    cause: unknown,
  ) {
    super(
      `[ndpr-toolkit] Composed adapter ${operation} failed at adapter index ${adapterIndex}`,
    );
    this.name = 'ComposedAdapterError';
    this.operation = operation;
    this.adapterIndex = adapterIndex;
    this.cause = cause;
  }
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}

function capabilitiesFor<T>(
  adapters: StorageAdapter<T>[],
): Readonly<StorageAdapterCapabilities> {
  const capabilities = adapters.map((adapter) => adapter.capabilities);
  const allServerAcknowledged = capabilities.every(
    (capability) => capability?.durability === 'server-acknowledged',
  );
  const allApplicationEvidence = capabilities.every(
    (capability) => capability?.evidenceSuitability === 'application-defined',
  );

  return Object.freeze({
    medium: 'composed',
    durability: allServerAcknowledged
      ? 'server-acknowledged'
      : 'application-defined',
    integrity: 'application-defined',
    concurrency: 'fan-out',
    evidenceSuitability: allApplicationEvidence
      ? 'application-defined'
      : 'ux-state-only',
    serverReadable: capabilities.some(
      (capability) => capability?.serverReadable === true,
    ),
  });
}

function invokeMutation<T>(
  adapters: StorageAdapter<T>[],
  operation: 'save' | 'remove',
  data?: T,
  startIndex = 0,
): void | Promise<void> {
  for (let index = startIndex; index < adapters.length; index += 1) {
    let result: void | Promise<void>;
    try {
      result =
        operation === 'save'
          ? adapters[index].save(data as T)
          : adapters[index].remove();
    } catch (error) {
      throw new ComposedAdapterError(operation, index, error);
    }

    if (isPromiseLike<void>(result)) {
      return Promise.resolve(result).then(
        () => invokeMutation(adapters, operation, data, index + 1),
        (error) => {
          throw new ComposedAdapterError(operation, index, error);
        },
      );
    }
  }
}

/**
 * Compose adapters in priority order. Reads fall back left-to-right when an
 * adapter has no value. Mutations run sequentially across every adapter and
 * complete only after every asynchronous write completes. Any failed read or
 * mutation is propagated as `ComposedAdapterError`; callers therefore never
 * receive a false acknowledgement while a secondary write is still pending.
 */
export function composeAdapters<T = unknown>(
  primary: StorageAdapter<T>,
  ...secondaries: StorageAdapter<T>[]
): StorageAdapter<T> {
  const adapters = [primary, ...secondaries];

  function loadFrom(index: number): T | null | Promise<T | null> {
    if (index >= adapters.length) return null;

    let result: T | null | Promise<T | null>;
    try {
      result = adapters[index].load();
    } catch (error) {
      throw new ComposedAdapterError('load', index, error);
    }

    if (isPromiseLike<T | null>(result)) {
      return Promise.resolve(result).then(
        (value) => (value === null ? loadFrom(index + 1) : value),
        (error) => {
          throw new ComposedAdapterError('load', index, error);
        },
      );
    }

    return result === null ? loadFrom(index + 1) : result;
  }

  return {
    capabilities: capabilitiesFor(adapters),
    load(): T | null | Promise<T | null> {
      return loadFrom(0);
    },
    save(data: T): void | Promise<void> {
      return invokeMutation(adapters, 'save', data);
    },
    remove(): void | Promise<void> {
      return invokeMutation(adapters, 'remove');
    },
  };
}
