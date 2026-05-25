/**
 * Dual-mode Prisma adapter.
 *
 * If process.env.DATABASE_URL is set we lazily load the real @prisma/client.
 * Otherwise we fall back to an in-memory Map-backed mock that implements the
 * subset of the PrismaClient surface the route handler actually calls:
 *
 *     prisma.dSRRequest.create({ data: { ... } })
 *
 * The mock keeps the example runnable with zero infra. Swap it for the real
 * client by setting DATABASE_URL and running `pnpm prisma:generate`.
 */

export interface DSRRequestRow {
  id: string;
  referenceId: string;
  fullName: string;
  email: string;
  requestType: string;
  identifierType: string;
  identifierValue: string;
  description: string | null;
  status: string;
  receivedAt: Date;
  estimatedCompletionAt: Date;
}

export interface DSRRequestCreateInput {
  data: {
    referenceId: string;
    fullName: string;
    email: string;
    requestType: string;
    identifierType: string;
    identifierValue: string;
    description?: string | null;
    status?: string;
    receivedAt?: Date;
    estimatedCompletionAt: Date;
  };
}

export interface DsrPrismaClient {
  dSRRequest: {
    create: (args: DSRRequestCreateInput) => Promise<DSRRequestRow>;
    findUnique: (args: { where: { referenceId: string } }) => Promise<DSRRequestRow | null>;
  };
}

// MOCK: in-memory store. Swap by setting DATABASE_URL.
function createMockClient(): DsrPrismaClient {
  const store = new Map<string, DSRRequestRow>();

  return {
    dSRRequest: {
      // MOCK: in-process Map insert. Reads survive only as long as the
      // Next.js dev server process. Persistence is the whole point of the
      // real Prisma path — don't ship this to production.
      async create({ data }) {
        const now = new Date();
        const row: DSRRequestRow = {
          id: data.referenceId,
          referenceId: data.referenceId,
          fullName: data.fullName,
          email: data.email,
          requestType: data.requestType,
          identifierType: data.identifierType,
          identifierValue: data.identifierValue,
          description: data.description ?? null,
          status: data.status ?? "received",
          receivedAt: data.receivedAt ?? now,
          estimatedCompletionAt: data.estimatedCompletionAt,
        };
        store.set(row.referenceId, row);
        // Make it obvious in dev logs that the mock is in use.
        // eslint-disable-next-line no-console
        console.log(
          `[prisma:mock] inserted DSRRequest referenceId=${row.referenceId} (store size: ${store.size})`,
        );
        return row;
      },
      // MOCK: linear map lookup. Used by the confirmation page in prod.
      async findUnique({ where }) {
        return store.get(where.referenceId) ?? null;
      },
    },
  };
}

let cached: DsrPrismaClient | undefined;

export function getPrisma(): DsrPrismaClient {
  if (cached) return cached;

  if (process.env.DATABASE_URL) {
    // Lazy require so the example boots even when @prisma/client isn't
    // installed (it's an optionalDependency).
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const { PrismaClient } = require("@prisma/client");
      cached = new PrismaClient() as DsrPrismaClient;
      // eslint-disable-next-line no-console
      console.log("[prisma] using real @prisma/client");
      return cached;
    } catch {
      // eslint-disable-next-line no-console
      console.warn(
        "[prisma] DATABASE_URL set but @prisma/client failed to load — falling back to mock. Run `pnpm install` and `pnpm prisma:generate`.",
      );
    }
  }

  cached = createMockClient();
  // eslint-disable-next-line no-console
  console.log("[prisma] using in-memory MOCK (no DATABASE_URL set)");
  return cached;
}
