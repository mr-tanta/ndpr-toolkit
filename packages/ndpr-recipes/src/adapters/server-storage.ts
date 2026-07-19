import type { StorageAdapterCapabilities } from '@tantainnovative/ndpr-toolkit';

/** Tenant identity established by authenticated server code. */
export interface TenantAdapterContext {
  tenantId: string;
}

/** Tenant and stable, application-owned data-subject identity. */
export interface SubjectAdapterContext extends TenantAdapterContext {
  subjectId: string;
}

/** Optional request evidence captured by the server when consent is saved. */
export interface ConsentAdapterContext extends SubjectAdapterContext {
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Database-backed recipes are server-readable and acknowledge mutations, but
 * integrity, concurrency, retention, and evidentiary controls remain the host
 * application's responsibility.
 */
export const serverStorageCapabilities = Object.freeze({
  medium: 'custom',
  durability: 'server-acknowledged',
  integrity: 'application-defined',
  concurrency: 'application-defined',
  evidenceSuitability: 'application-defined',
  serverReadable: true,
}) satisfies Readonly<StorageAdapterCapabilities>;

export function assertTenantContext(
  context: TenantAdapterContext,
): asserts context is TenantAdapterContext {
  assertIdentifier(context?.tenantId, 'tenantId');
}

export function assertSubjectContext(
  context: SubjectAdapterContext,
): asserts context is SubjectAdapterContext {
  assertTenantContext(context);
  assertIdentifier(context?.subjectId, 'subjectId');
}

function assertIdentifier(value: string | undefined, name: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string from authenticated server context`);
  }
}
