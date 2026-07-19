export interface RecipeTestContext {
  tenantId: string;
  actor: {
    id: string;
    displayName: string;
    email: string;
    department?: string;
    roles: string[];
  } | null;
  actorId: string | null;
  subjectId: string | null;
  subjectSource: 'verified-account-subject' | 'anonymous-uuid-capability' | null;
  roles: string[];
}

export const STAFF_CONTEXT: RecipeTestContext = {
  tenantId: 'tenant-1',
  actor: {
    id: 'actor-1',
    displayName: 'Ada DPO',
    email: 'ada@example.test',
    department: 'Privacy',
    roles: ['ndpr:staff'],
  },
  actorId: 'actor-1',
  subjectId: null,
  subjectSource: null,
  roles: ['ndpr:staff'],
};

export const SUBJECT_CONTEXT: RecipeTestContext = {
  tenantId: 'tenant-1',
  actor: null,
  actorId: null,
  subjectId: 'anon_123e4567-e89b-42d3-a456-426614174000',
  subjectSource: 'anonymous-uuid-capability',
  roles: [],
};

const nextContextPath = require.resolve(
  '../../../packages/ndpr-recipes/src/nextjs/app-router/request-context.ts',
);
const expressContextPath = require.resolve(
  '../../../packages/ndpr-recipes/src/express/request-context.ts',
);

export function installRecipeContextMocks(
  context: RecipeTestContext = STAFF_CONTEXT,
): void {
  const factory = () => ({
    resolveNDPRRequestContext: jest.fn().mockResolvedValue(context),
    getNDPRContextProblem: jest.fn(
      (resolved: RecipeTestContext, requirement: 'tenant' | 'subject' | 'staff') =>
        getContextProblem(resolved, requirement),
    ),
    isNDPRStaffContext: jest.fn((resolved: RecipeTestContext) =>
      Boolean(
        resolved.actorId
          && resolved.roles.some((role) => role === 'ndpr:staff' || role === 'ndpr:admin'),
      ),
    ),
  });

  jest.doMock(nextContextPath, factory);
  jest.doMock(expressContextPath, factory);
}

export function installPrismaClientMock(prisma: Record<string, unknown>): void {
  jest.doMock(
    '@prisma/client',
    () => ({
      PrismaClient: jest.fn(() => prisma),
      Prisma: {
        DbNull: { kind: 'DbNull' },
        JsonNull: { kind: 'JsonNull' },
        TransactionIsolationLevel: { Serializable: 'Serializable' },
      },
    }),
    { virtual: true },
  );
}

export function addTransactionMock<T extends Record<string, unknown>>(prisma: T): T & {
  $transaction: jest.Mock;
} {
  const transactional = prisma as T & { $transaction: jest.Mock };
  transactional.$transaction = jest.fn(
    async (operation: (transaction: T) => unknown) => operation(prisma),
  );
  return transactional;
}

function getContextProblem(
  context: RecipeTestContext,
  requirement: 'tenant' | 'subject' | 'staff',
): { status: 401 | 403 | 503; error: string } | null {
  if (!context.tenantId) {
    return { status: 503, error: 'NDPR_TENANT_ID is not configured on the server' };
  }
  if (requirement === 'subject' && !context.subjectId) {
    return { status: 401, error: 'A verified data-subject identity is required' };
  }
  if (requirement === 'staff' && !context.actorId) {
    return {
      status: 401,
      error: 'Connect resolveVerifiedNDPRActor to verified staff authentication',
    };
  }
  if (requirement === 'staff'
    && !context.roles.some((role) => role === 'ndpr:staff' || role === 'ndpr:admin')) {
    return { status: 403, error: 'NDPR staff or administrator role required' };
  }
  return null;
}
