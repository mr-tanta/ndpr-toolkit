/**
 * Prisma adapters for @tantainnovative/ndpr-toolkit
 *
 * Each adapter implements the StorageAdapter<T> interface and can be passed
 * directly to the corresponding toolkit hook. Copy and adapt these files
 * into your own project — see individual adapter files for usage examples.
 */

export { prismaConsentAdapter } from './prisma-consent';
export { prismaDSRAdapter } from './prisma-dsr';
export { prismaBreachAdapter } from './prisma-breach';
export type { BreachState } from './prisma-breach';
export { prismaROPAAdapter } from './prisma-ropa';
export type { ROPAOrgMetadata } from './prisma-ropa';
