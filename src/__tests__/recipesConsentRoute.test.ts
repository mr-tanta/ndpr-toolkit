/**
 * @jest-environment node
 */

import type { ConsentSettings } from '../../packages/ndpr-toolkit/src/types/consent';

const routePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/consent/route';
const TENANT_ID = 'tenant-1';
const SUBJECT_ID = 'anon_123e4567-e89b-42d3-a456-426614174000';

function createPrismaMock() {
  const createdAt = new Date('2026-06-26T10:00:00.000Z');
  const prisma: any = {
    consentRecord: {
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({
        id: 'consent_1',
        tenantId: TENANT_ID,
        subjectId: SUBJECT_ID,
        consents: { analytics: true },
        version: '2026.06',
        method: 'banner',
        hasInteracted: true,
        lawfulBasis: 'consent',
        createdAt,
      }),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  };
  prisma.$transaction = jest.fn(
    async (operation: (transaction: typeof prisma) => unknown) => operation(prisma),
  );
  return prisma;
}

async function loadRecipeRoute(prisma = createPrismaMock()) {
  jest.resetModules();
  jest.doMock(
    '@prisma/client',
    () => ({
      PrismaClient: jest.fn(() => prisma),
      Prisma: {
        DbNull: { kind: 'DbNull' },
        TransactionIsolationLevel: { Serializable: 'Serializable' },
      },
    }),
    { virtual: true },
  );
  jest.doMock(
    '@tantainnovative/ndpr-toolkit/server',
    () => jest.requireActual('../../packages/ndpr-toolkit/src/server'),
    { virtual: true },
  );

  const route = await import(routePath);
  return { ...route, prisma };
}

function requestWithJson(body: unknown, headers?: HeadersInit): Request {
  return new Request('https://example.test/api/consent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ndpr-subject-id': SUBJECT_ID,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('ndpr-recipes Next.js consent route', () => {
  const originalTenantId = process.env.NDPR_TENANT_ID;

  beforeEach(() => {
    process.env.NDPR_TENANT_ID = TENANT_ID;
  });

  afterAll(() => {
    if (originalTenantId === undefined) delete process.env.NDPR_TENANT_ID;
    else process.env.NDPR_TENANT_ID = originalTenantId;
  });

  it('rejects invalid ConsentSettings before writing to Prisma', async () => {
    const { POST, prisma } = await loadRecipeRoute();

    const response = await POST(
      requestWithJson({
        subjectId: 'client-controlled-subject',
        consents: { analytics: true },
        version: '2026.06',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual({
      timestamp: 'timestamp must be a non-negative safe-integer epoch value within the valid Date range.',
      method: 'method is required.',
      hasInteracted: 'hasInteracted must be boolean.',
    });
    expect(prisma.consentRecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects fractional timestamps before database access', async () => {
    const { POST, prisma } = await loadRecipeRoute();

    const response = await POST(
      requestWithJson({
        consents: { analytics: true },
        timestamp: 1_784_466_026_694.75,
        version: '2026.06',
        method: 'banner',
        hasInteracted: true,
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Validation failed.',
      fields: {
        timestamp: 'timestamp must be a non-negative safe-integer epoch value within the valid Date range.',
      },
    });
    expect(prisma.consentRecord.findFirst).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.consentRecord.create).not.toHaveBeenCalled();
  });

  it('persists tenant-scoped ConsentSettings for the verified subject atomically', async () => {
    const { POST, prisma } = await loadRecipeRoute();
    const consent: ConsentSettings & { subjectId: string } = {
      subjectId: 'client-controlled-subject',
      consents: { analytics: true },
      timestamp: Date.now(),
      version: '2026.06',
      method: 'banner',
      hasInteracted: true,
      lawfulBasis: 'consent',
    };

    const response = await POST(
      requestWithJson(consent, {
        'user-agent': 'Jest Browser',
        'x-forwarded-for': '203.0.113.12',
      }),
    );

    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.consentRecord.updateMany).toHaveBeenCalledWith({
      where: { tenantId: TENANT_ID, subjectId: SUBJECT_ID, revokedAt: null },
      data: { revokedAt: expect.any(Date), activeSubjectKey: null },
    });
    expect(prisma.consentRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: TENANT_ID,
        subjectId: SUBJECT_ID,
        activeSubjectKey: JSON.stringify([TENANT_ID, SUBJECT_ID]),
        consents: consent.consents,
        version: '2026.06',
        method: 'banner',
        lawfulBasis: 'consent',
        ipAddress: '203.0.113.12',
        userAgent: 'Jest Browser',
        clientTimestamp: expect.any(Date),
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: TENANT_ID,
        module: 'consent',
        action: 'created',
        entityId: 'consent_1',
        entityType: 'ConsentRecord',
        performedBy: null,
        changes: expect.objectContaining({
          subjectId: SUBJECT_ID,
          subjectIdentitySource: 'anonymous-uuid-capability',
          consentCategories: ['analytics'],
        }),
      }),
    });
  });

  it('fails closed when only a client-controlled body subject is supplied', async () => {
    const { POST, prisma } = await loadRecipeRoute();

    const response = await POST(
      requestWithJson(
        {
          subjectId: 'client-controlled-subject',
          consents: { analytics: true },
          timestamp: Date.now(),
          version: '2026.06',
          method: 'banner',
          hasInteracted: true,
        },
        { 'x-ndpr-subject-id': '' },
      ),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'A verified data-subject identity is required',
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.consentRecord.create).not.toHaveBeenCalled();
  });
});
