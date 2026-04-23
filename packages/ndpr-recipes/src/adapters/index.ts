/**
 * StorageAdapter implementations for @tantainnovative/ndpr-toolkit
 *
 * Two ORM families are covered — Prisma and Drizzle. Each adapter implements
 * the StorageAdapter<T> interface and can be passed directly to the
 * corresponding toolkit hook.
 *
 * Copy and adapt the individual files into your own project.
 * See each adapter file's header for detailed usage examples.
 *
 * Prisma adapters
 * ---------------
 * These use the PrismaClient generated from the schema in `prisma/schema.prisma`.
 * Run `prisma migrate dev` to create the tables before using them.
 *
 * Drizzle adapters
 * ----------------
 * These use any Drizzle `db` instance pointing at a PostgreSQL database.
 * Run `drizzle-kit push` (or generate migrations from `src/drizzle/schema.ts`)
 * to create the tables before using them.
 */

// ---------------------------------------------------------------------------
// Prisma adapters
// ---------------------------------------------------------------------------

export { prismaConsentAdapter } from './prisma-consent';
export { prismaDSRAdapter } from './prisma-dsr';
export { prismaBreachAdapter } from './prisma-breach';
export type { BreachState } from './prisma-breach';
export { prismaROPAAdapter } from './prisma-ropa';
export type { ROPAOrgMetadata } from './prisma-ropa';

// ---------------------------------------------------------------------------
// Drizzle adapters
// ---------------------------------------------------------------------------

export { drizzleConsentAdapter } from './drizzle-consent';
export { drizzleDSRAdapter } from './drizzle-dsr';
export { drizzleBreachAdapter } from './drizzle-breach';
export type { BreachState as DrizzleBreachState } from './drizzle-breach';
export { drizzleROPAAdapter } from './drizzle-ropa';
export type { ROPAOrgMetadata as DrizzleROPAOrgMetadata } from './drizzle-ropa';
export { drizzleDPIAAdapter } from './drizzle-dpia';
export { drizzleLawfulBasisAdapter } from './drizzle-lawful-basis';
export { drizzleCrossBorderAdapter } from './drizzle-cross-border';
