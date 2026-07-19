export { prismaConsentAdapter } from './prisma-consent';
export { prismaDSRAdapter } from './prisma-dsr';
export { prismaBreachAdapter } from './prisma-breach';
export type { BreachState } from './prisma-breach';
export { prismaROPAAdapter } from './prisma-ropa';
export type { ROPAOrgMetadata } from './prisma-ropa';

export { drizzleConsentAdapter } from './drizzle-consent';
export { drizzleDSRAdapter } from './drizzle-dsr';
export { drizzleBreachAdapter } from './drizzle-breach';
export type { BreachState as DrizzleBreachState } from './drizzle-breach';
export { drizzleROPAAdapter } from './drizzle-ropa';
export type { ROPAOrgMetadata as DrizzleROPAOrgMetadata } from './drizzle-ropa';
export { drizzleDPIAAdapter } from './drizzle-dpia';
export { drizzleLawfulBasisAdapter } from './drizzle-lawful-basis';
export { drizzleCrossBorderAdapter } from './drizzle-cross-border';

export { serverStorageCapabilities } from './server-storage';
export type {
  ConsentAdapterContext,
  SubjectAdapterContext,
  TenantAdapterContext,
} from './server-storage';
