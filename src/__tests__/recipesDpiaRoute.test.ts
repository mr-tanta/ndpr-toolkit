/**
 * @jest-environment node
 */

export {};

const nextRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/dpia/route';
const expressRoutePath = '../../packages/ndpr-recipes/src/express/routes/dpia';

type Handler = (req: any, res: any) => unknown | Promise<unknown>;
interface MockExpressResponse {
  statusCode: number;
  body: unknown;
  status: jest.Mock<MockExpressResponse, [number]>;
  json: jest.Mock<MockExpressResponse, [unknown]>;
}

function dpiaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dpia_1',
    projectName: 'Customer analytics model',
    description: 'Profiling customer activity for product recommendations.',
    dpiaData: {
      assessor: {
        name: 'Ada DPO',
        role: 'DPO',
        email: 'ada@example.test',
      },
      answers: { highRiskProcessing: true },
      risks: [{ id: 'risk_1', title: 'Profiling risk', score: 12 }],
      conclusion: 'Proceed with mitigation plan.',
      recommendations: ['Run quarterly review.'],
      version: '1.0',
      ndpcConsultationRequired: true,
    },
    overallRisk: 'high',
    score: 12,
    status: 'draft',
    conductedBy: 'ada@example.test',
    approvedBy: null,
    createdAt: new Date('2026-06-26T10:00:00.000Z'),
    updatedAt: new Date('2026-06-26T10:00:00.000Z'),
    ...overrides,
  };
}

function createPrismaMock() {
  return {
    dPIARecord: {
      findMany: jest.fn().mockResolvedValue([dpiaRow()]),
      findUnique: jest.fn().mockResolvedValue(dpiaRow()),
      create: jest.fn().mockResolvedValue(dpiaRow()),
      update: jest.fn().mockResolvedValue(dpiaRow({ status: 'completed' })),
      delete: jest.fn().mockResolvedValue(dpiaRow()),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  };
}

async function loadNextDpiaRoute(prisma = createPrismaMock()) {
  jest.resetModules();
  jest.doMock(
    '@prisma/client',
    () => ({
      PrismaClient: jest.fn(() => prisma),
    }),
    { virtual: true },
  );
  jest.doMock(
    '@tantainnovative/ndpr-toolkit/server',
    () => jest.requireActual('../../packages/ndpr-toolkit/src/server'),
    { virtual: true },
  );

  const route = await import(nextRoutePath);
  return { route, prisma };
}

async function loadExpressDpiaRouter(prisma = createPrismaMock()) {
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
  jest.doMock(
    '@prisma/client',
    () => ({
      PrismaClient: jest.fn(() => prisma),
    }),
    { virtual: true },
  );
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
    projectName: 'Customer analytics model',
    description: 'Profiling customer activity for product recommendations.',
    dpiaData: {
      assessor: {
        name: 'Ada DPO',
        role: 'DPO',
        email: 'ada@example.test',
      },
      answers: { highRiskProcessing: true },
      risks: [{ id: 'risk_1', title: 'Profiling risk', score: 12 }],
      conclusion: 'Proceed with mitigation plan.',
      recommendations: ['Run quarterly review.'],
      version: '1.0',
      ndpcConsultationRequired: true,
    },
    overallRisk: 'high',
    score: 12,
    conductedBy: 'ada@example.test',
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
        overallRisk: 'severe',
        score: -1,
        conductedBy: '',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual(
      expect.objectContaining({
        projectName: 'projectName is required.',
        description: 'description is required.',
        dpiaData: 'dpiaData must include assessor, answers, risks, conclusion, and version.',
        overallRisk: 'overallRisk must be one of low, medium, high, or critical.',
        score: 'score must be a non-negative number.',
        conductedBy: 'conductedBy is required.',
      }),
    );
    expect(prisma.dPIARecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists valid Next.js DPIA intake and writes an audit log', async () => {
    const { route, prisma } = await loadNextDpiaRoute();

    const response = await route.POST(
      nextRequestWithJson('https://example.test/api/dpia', validDpiaPayload()),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.dPIARecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectName: 'Customer analytics model',
        overallRisk: 'high',
        score: 12,
        status: 'draft',
        conductedBy: 'ada@example.test',
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        module: 'dpia',
        action: 'created',
        entityType: 'DPIARecord',
      }),
    });
    expect(body).toEqual(expect.objectContaining({ id: 'dpia_1', overallRisk: 'high' }));
  });

  it('rejects invalid Next.js DPIA updates before writing to Prisma', async () => {
    const { route, prisma } = await loadNextDpiaRoute();

    const response = await route.PUT(
      nextRequestWithJson('https://example.test/api/dpia', {
        id: 'dpia_1',
        status: 'published',
        score: -4,
        overallRisk: 'severe',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual({
      status: 'status must be one of draft, in_progress, completed, approved, or rejected.',
      overallRisk: 'overallRisk must be one of low, medium, high, or critical.',
      score: 'score must be a non-negative number.',
    });
    expect(prisma.dPIARecord.update).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects invalid Express DPIA intake before writing to Prisma', async () => {
    const { handlers, prisma } = await loadExpressDpiaRouter();
    const res = createExpressRes();

    await handlers['POST /'](
      {
        body: {
          projectName: 'Customer analytics model',
          description: '',
          dpiaData: {},
          overallRisk: 'severe',
          score: Number.NaN,
          conductedBy: '',
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({
      error: 'Validation failed.',
      fields: expect.objectContaining({
        description: 'description is required.',
        dpiaData: 'dpiaData must include assessor, answers, risks, conclusion, and version.',
        overallRisk: 'overallRisk must be one of low, medium, high, or critical.',
        score: 'score must be a non-negative number.',
        conductedBy: 'conductedBy is required.',
      }),
    });
    expect(prisma.dPIARecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });
});
