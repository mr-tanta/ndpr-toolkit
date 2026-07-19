/**
 * @jest-environment node
 */

import {
  addTransactionMock,
  installPrismaClientMock,
  installRecipeContextMocks,
  STAFF_CONTEXT,
  type RecipeTestContext,
} from './helpers/recipeRouteTestUtils';

const nextListRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/breach/route';
const nextDetailRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/breach/[id]/route';
const expressRoutePath = '../../packages/ndpr-recipes/src/express/routes/breach';

const DISCOVERED_AT = '2026-06-26T10:00:00.000Z';
const DISCOVERED_MS = Date.parse(DISCOVERED_AT);
const ASSESSMENT = {
  id: 'assessment_1',
  breachId: 'breach_1',
  assessedAt: DISCOVERED_MS + 60_000,
  assessor: {
    name: STAFF_CONTEXT.actor?.displayName,
    role: 'verified-ndpr-staff',
    email: STAFF_CONTEXT.actor?.email,
  },
  confidentialityImpact: 4,
  integrityImpact: 3,
  availabilityImpact: 2,
  harmLikelihood: 4,
  harmSeverity: 4,
  overallRiskScore: 16,
  riskLevel: 'high',
  risksToRightsAndFreedoms: true,
  highRisksToRightsAndFreedoms: true,
  justification: 'The exposed identifiers create a high phishing and fraud risk.',
};

type Handler = (req: any, res: any) => unknown | Promise<unknown>;
interface MockExpressResponse {
  statusCode: number;
  body: unknown;
  status: jest.Mock<MockExpressResponse, [number]>;
  json: jest.Mock<MockExpressResponse, [unknown]>;
}

function breachRow(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: STAFF_CONTEXT.tenantId,
    id: 'breach_1',
    title: 'Customer export exposed',
    description: 'A customer export was uploaded to a public bucket.',
    category: 'unauthorized_access',
    severity: 'high',
    status: 'ongoing',
    discoveredAt: new Date(DISCOVERED_AT),
    occurredAt: new Date('2026-06-26T09:00:00.000Z'),
    reportedAt: new Date(DISCOVERED_AT),
    ndpcNotifiedAt: null,
    reporterName: STAFF_CONTEXT.actor?.displayName,
    reporterEmail: STAFF_CONTEXT.actor?.email,
    reporterDepartment: STAFF_CONTEXT.actor?.department,
    reporterPhone: null,
    affectedSystems: ['object-storage'],
    dataTypes: ['name', 'email'],
    involvesSensitiveData: false,
    estimatedAffectedSubjects: 220,
    approximateRecordCount: 300,
    dataSubjectCategories: ['customers'],
    likelyConsequences: 'Affected customers face phishing and account takeover risks.',
    mitigationMeasures: 'Bucket access was disabled and credentials were rotated.',
    isPhasedReport: false,
    supplementsReportId: null,
    dpoContact: { name: 'Ada DPO', email: 'ada@example.test' },
    initialActions: 'Affected customers were given protective guidance.',
    attachments: null,
    assessments: [ASSESSMENT],
    notifications: [],
    ndpcNotificationSent: false,
    removedAt: null,
    ...overrides,
  };
}

function createPrismaMock() {
  return addTransactionMock({
    breachReport: {
      findMany: jest.fn().mockResolvedValue([breachRow()]),
      findFirst: jest.fn().mockResolvedValue(breachRow()),
      create: jest.fn().mockResolvedValue(breachRow()),
      update: jest.fn().mockResolvedValue(breachRow({ status: 'contained' })),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  });
}

async function loadNextBreachRoutes(
  prisma = createPrismaMock(),
  context: RecipeTestContext = STAFF_CONTEXT,
) {
  jest.resetModules();
  installRecipeContextMocks(context);
  installPrismaClientMock(prisma);
  jest.doMock(
    '@tantainnovative/ndpr-toolkit/server',
    () => jest.requireActual('../../packages/ndpr-toolkit/src/server'),
    { virtual: true },
  );

  const listRoute = await import(nextListRoutePath);
  const detailRoute = await import(nextDetailRoutePath);
  return { listRoute, detailRoute, prisma };
}

async function loadExpressBreachRouter(
  prisma = createPrismaMock(),
  context: RecipeTestContext = STAFF_CONTEXT,
) {
  jest.resetModules();
  const handlers: Record<string, Handler> = {};

  jest.doMock(
    'express',
    () => ({
      Router: jest.fn(() => ({
        get: jest.fn((path: string, handler: Handler) => {
          handlers[`GET ${path}`] = handler;
        }),
        post: jest.fn((path: string, handler: Handler) => {
          handlers[`POST ${path}`] = handler;
        }),
        patch: jest.fn((path: string, handler: Handler) => {
          handlers[`PATCH ${path}`] = handler;
        }),
      })),
    }),
    { virtual: true },
  );
  installRecipeContextMocks(context);
  installPrismaClientMock(prisma);
  jest.doMock(
    '@tantainnovative/ndpr-toolkit/server',
    () => jest.requireActual('../../packages/ndpr-toolkit/src/server'),
    { virtual: true },
  );

  await import(expressRoutePath);
  return { handlers, prisma };
}

function nextRequestWithJson(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createExpressRes(): MockExpressResponse {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status: jest.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: jest.fn((body: unknown) => {
      res.body = body;
      return res;
    }),
  } as MockExpressResponse;
  return res;
}

function validBreachPayload() {
  return {
    title: 'Customer export exposed',
    description: 'A customer export was uploaded to a public bucket.',
    category: 'unauthorized_access',
    discoveredAt: DISCOVERED_AT,
    occurredAt: '2026-06-26T09:00:00.000Z',
    reporter: {
      name: 'Client Supplied Actor',
      email: 'attacker@example.test',
      department: 'Untrusted',
    },
    affectedSystems: ['object-storage'],
    dataTypes: ['name', 'email'],
    involvesSensitiveData: false,
    estimatedAffectedSubjects: 220,
    approximateRecordCount: 300,
    dataSubjectCategories: ['customers'],
    likelyConsequences: 'Affected customers face phishing and account takeover risks.',
    mitigationMeasures: 'Bucket access was disabled and credentials were rotated.',
    isPhasedReport: false,
    dpoContact: { name: 'Ada DPO', email: 'ada@example.test' },
    initialActions: 'Affected customers were given protective guidance.',
    assessments: [{
      id: ASSESSMENT.id,
      assessedAt: ASSESSMENT.assessedAt,
      assessor: {
        name: 'Client Supplied Assessor',
        role: 'administrator',
        email: 'attacker@example.test',
      },
      confidentialityImpact: ASSESSMENT.confidentialityImpact,
      integrityImpact: ASSESSMENT.integrityImpact,
      availabilityImpact: ASSESSMENT.availabilityImpact,
      harmLikelihood: ASSESSMENT.harmLikelihood,
      harmSeverity: ASSESSMENT.harmSeverity,
      overallRiskScore: ASSESSMENT.overallRiskScore,
      riskLevel: ASSESSMENT.riskLevel,
      risksToRightsAndFreedoms: true,
      highRisksToRightsAndFreedoms: true,
      justification: ASSESSMENT.justification,
    }],
    severity: 'critical',
    ndpcNotificationSent: true,
  };
}

function invalidBreachPayload() {
  return {
    ...validBreachPayload(),
    discoveredAt: 'not-a-date',
    affectedSystems: [],
    dataTypes: [],
  };
}

describe('ndpr-recipes breach routes', () => {
  it('rejects invalid Next.js breach intake before writing to Prisma', async () => {
    const { listRoute, prisma } = await loadNextBreachRoutes();

    const response = await listRoute.POST(
      nextRequestWithJson('https://example.test/api/breach', invalidBreachPayload()),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual(expect.objectContaining({
      discoveredAt: 'discoveredAt must be a valid timestamp.',
      affectedSystems: 'affectedSystems must contain at least one string.',
      dataTypes: 'dataTypes must contain at least one string.',
    }));
    expect(prisma.breachReport.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists server-derived breach evidence and returns NDPC readiness metadata', async () => {
    const { listRoute, prisma } = await loadNextBreachRoutes();

    const response = await listRoute.POST(
      nextRequestWithJson('https://example.test/api/breach', validBreachPayload()),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.breachReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        category: 'unauthorized_access',
        severity: 'high',
        status: 'ongoing',
        reporterName: STAFF_CONTEXT.actor?.displayName,
        reporterEmail: STAFF_CONTEXT.actor?.email,
        affectedSystems: ['object-storage'],
        dataTypes: ['name', 'email'],
        assessments: [expect.objectContaining({
          breachId: 'test-cuid',
          assessor: {
            name: STAFF_CONTEXT.actor?.displayName,
            role: 'verified-ndpr-staff',
            email: STAFF_CONTEXT.actor?.email,
          },
          riskLevel: 'high',
        })],
        notifications: [],
        ndpcNotificationSent: false,
        removedAt: null,
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        module: 'breach',
        action: 'reported',
        entityType: 'BreachReport',
        performedBy: STAFF_CONTEXT.actorId,
        changes: {
          category: 'unauthorized_access',
          status: 'ongoing',
          assessmentCount: 1,
          notificationEvidenceCount: 0,
        },
      }),
    });
    expect(body.ndpcReadiness).toEqual(expect.objectContaining({
      complete: true,
      ready: false,
      valid: true,
      notificationRequired: true,
      dataSubjectCommunicationRequired: true,
      timing: expect.objectContaining({
        notified: false,
        hoursRemaining: expect.any(Number),
        overdue: expect.any(Boolean),
      }),
    }));
  });

  it('rejects invalid Next.js breach updates within a tenant-scoped transaction', async () => {
    const { detailRoute, prisma } = await loadNextBreachRoutes();

    const response = await detailRoute.PATCH(
      nextRequestWithJson('https://example.test/api/breach/breach_1', {
        status: 'deleted',
        severity: 'severe',
      }),
      { params: Promise.resolve({ id: 'breach_1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'Validation failed.',
      fields: { status: 'status must be ongoing, contained, or resolved.' },
    });
    expect(prisma.breachReport.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: STAFF_CONTEXT.tenantId,
        id: 'breach_1',
        removedAt: null,
      },
    });
    expect(prisma.breachReport.update).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects invalid Express breach updates before writing to Prisma', async () => {
    const { handlers, prisma } = await loadExpressBreachRouter();
    const res = createExpressRes();

    await handlers['PATCH /:id'](
      {
        params: { id: 'breach_1' },
        body: { status: 'deleted', severity: 'severe' },
        ip: '203.0.113.20',
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({
      error: 'Validation failed.',
      fields: { status: 'status must be ongoing, contained, or resolved.' },
    });
    expect(prisma.breachReport.update).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });
});
