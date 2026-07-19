/**
 * @jest-environment node
 */

import {
  addTransactionMock,
  installPrismaClientMock,
  installRecipeContextMocks,
  STAFF_CONTEXT,
  SUBJECT_CONTEXT,
  type RecipeTestContext,
} from './helpers/recipeRouteTestUtils';

const nextRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/dpia/route';
const expressRoutePath = '../../packages/ndpr-recipes/src/express/routes/dpia';

const STARTED_AT = Date.parse('2026-06-26T10:00:00.000Z');
const DPIA_DATA = {
  id: 'dpia_1',
  title: 'Customer analytics model',
  processingDescription: 'Profiling customer activity for product recommendations.',
  startedAt: STARTED_AT,
  assessor: {
    name: STAFF_CONTEXT.actor?.displayName,
    role: 'verified-ndpr-staff',
    email: STAFF_CONTEXT.actor?.email,
  },
  answers: { highRiskProcessing: true },
  risks: [{
    id: 'risk_1',
    description: 'Profiling could cause unfair treatment.',
    likelihood: 3,
    impact: 4,
    score: 12,
    level: 'high',
    mitigated: false,
    relatedQuestionIds: ['highRiskProcessing'],
  }],
  overallRiskLevel: 'high',
  canProceed: false,
  conclusion: 'Proceed only after implementing the mitigation plan.',
  recommendations: ['Run quarterly review.'],
  version: '1.0',
  ndpcConsultationRequired: true,
};

type Handler = (req: any, res: any) => unknown | Promise<unknown>;
interface MockExpressResponse {
  statusCode: number;
  body: unknown;
  status: jest.Mock<MockExpressResponse, [number]>;
  json: jest.Mock<MockExpressResponse, [unknown]>;
}

function dpiaRow(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: STAFF_CONTEXT.tenantId,
    id: 'dpia_1',
    projectName: DPIA_DATA.title,
    description: DPIA_DATA.processingDescription,
    dpiaData: DPIA_DATA,
    overallRisk: 'high',
    score: 12,
    status: 'draft',
    conductedBy: STAFF_CONTEXT.actorId,
    approvedBy: null,
    createdAt: new Date(STARTED_AT),
    updatedAt: new Date(STARTED_AT),
    removedAt: null,
    ...overrides,
  };
}

function createPrismaMock() {
  return addTransactionMock({
    dPIARecord: {
      findMany: jest.fn().mockResolvedValue([dpiaRow()]),
      findFirst: jest.fn().mockResolvedValue(dpiaRow()),
      create: jest.fn().mockResolvedValue(dpiaRow()),
      update: jest.fn().mockResolvedValue(dpiaRow({ status: 'completed' })),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  });
}

async function loadNextDpiaRoute(
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

  const route = await import(nextRoutePath);
  return { route, prisma };
}

async function loadExpressDpiaRouter(
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
        put: jest.fn((path: string, handler: Handler) => {
          handlers[`PUT ${path}`] = handler;
        }),
        delete: jest.fn((path: string, handler: Handler) => {
          handlers[`DELETE ${path}`] = handler;
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

function validDpiaPayload() {
  return {
    projectName: DPIA_DATA.title,
    description: DPIA_DATA.processingDescription,
    dpiaData: {
      assessor: {
        name: 'Client Supplied Actor',
        role: 'administrator',
        email: 'attacker@example.test',
      },
      answers: DPIA_DATA.answers,
      risks: DPIA_DATA.risks.map(({ score: _score, level: _level, ...risk }) => risk),
      conclusion: DPIA_DATA.conclusion,
      recommendations: DPIA_DATA.recommendations,
      version: DPIA_DATA.version,
      ndpcConsultationRequired: true,
    },
    overallRisk: 'critical',
    score: 25,
    conductedBy: 'client-controlled-actor',
    approvedBy: 'client-controlled-approver',
  };
}

describe('ndpr-recipes DPIA routes', () => {
  it('rejects invalid Next.js DPIA intake before writing to Prisma', async () => {
    const { route, prisma } = await loadNextDpiaRoute();

    const response = await route.POST(
      nextRequestWithJson('https://example.test/api/dpia', {
        projectName: '',
        description: '',
        dpiaData: {},
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual({
      title: 'title must be non-empty text.',
      processingDescription: 'processingDescription must be non-empty text.',
    });
    expect(prisma.dPIARecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects prototype-reserved Next.js DPIA question ids before writing to Prisma', async () => {
    const { route, prisma } = await loadNextDpiaRoute();
    const payload = validDpiaPayload();
    Object.assign(payload.dpiaData, {
      answers: Object.fromEntries([
        ['__proto__', 'attacker-controlled'],
      ]),
    });
    payload.dpiaData.risks[0].relatedQuestionIds = ['__proto__'];

    const response = await route.POST(
      nextRequestWithJson('https://example.test/api/dpia', payload),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'Validation failed.',
      fields: {
        answers: 'Question IDs must be non-reserved text with at most 200 characters.',
      },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.dPIARecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists derived, tenant-scoped Next.js DPIA evidence and audit data', async () => {
    const { route, prisma } = await loadNextDpiaRoute();

    const response = await route.POST(
      nextRequestWithJson('https://example.test/api/dpia', validDpiaPayload()),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.dPIARecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        projectName: DPIA_DATA.title,
        overallRisk: 'high',
        score: 12,
        status: 'draft',
        conductedBy: STAFF_CONTEXT.actorId,
        approvedBy: null,
        removedAt: null,
        dpiaData: expect.objectContaining({
          assessor: {
            name: STAFF_CONTEXT.actor?.displayName,
            role: 'verified-ndpr-staff',
            email: STAFF_CONTEXT.actor?.email,
          },
          overallRiskLevel: 'high',
        }),
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        module: 'dpia',
        action: 'created',
        entityType: 'DPIARecord',
        performedBy: STAFF_CONTEXT.actorId,
        changes: {
          status: 'draft',
          overallRisk: 'high',
          derivedRiskScore: 12,
        },
      }),
    });
    expect(body).toEqual(expect.objectContaining({
      id: 'dpia_1',
      overallRiskLevel: 'high',
      score: 12,
      conductedBy: STAFF_CONTEXT.actorId,
    }));
  });

  it('rejects invalid Next.js DPIA updates before writing to Prisma', async () => {
    const { route, prisma } = await loadNextDpiaRoute();

    const response = await route.PUT(
      nextRequestWithJson('https://example.test/api/dpia', {
        id: 'dpia_1',
        status: 'published',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'Validation failed.',
      fields: { status: 'status is not supported.' },
    });
    expect(prisma.dPIARecord.findFirst).toHaveBeenCalledWith({
      where: { tenantId: STAFF_CONTEXT.tenantId, id: 'dpia_1', removedAt: null },
    });
    expect(prisma.dPIARecord.update).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects invalid Express DPIA intake before writing to Prisma', async () => {
    const { handlers, prisma } = await loadExpressDpiaRouter();
    const res = createExpressRes();

    await handlers['POST /'](
      { body: { projectName: '', description: '', dpiaData: {} } },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({
      error: 'Validation failed.',
      fields: {
        title: 'title must be non-empty text.',
        processingDescription: 'processingDescription must be non-empty text.',
      },
    });
    expect(prisma.dPIARecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('fails closed when an anonymous subject attempts a staff DPIA mutation', async () => {
    const { route, prisma } = await loadNextDpiaRoute(createPrismaMock(), SUBJECT_CONTEXT);

    const response = await route.POST(
      nextRequestWithJson('https://example.test/api/dpia', validDpiaPayload()),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Connect resolveVerifiedNDPRActor to verified staff authentication',
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.dPIARecord.create).not.toHaveBeenCalled();
  });
});
