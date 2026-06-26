/**
 * @jest-environment node
 */

export {};

const nextListRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/breach/route';
const nextDetailRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/breach/[id]/route';
const expressRoutePath = '../../packages/ndpr-recipes/src/express/routes/breach';

type Handler = (req: any, res: any) => unknown | Promise<unknown>;
interface MockExpressResponse {
  statusCode: number;
  body: unknown;
  status: jest.Mock<MockExpressResponse, [number]>;
  json: jest.Mock<MockExpressResponse, [unknown]>;
}

const DISCOVERED_AT = '2026-06-26T10:00:00.000Z';

function breachRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'breach_1',
    title: 'Customer export exposed',
    description: 'A customer export was uploaded to a public bucket.',
    category: 'unauthorized_access',
    severity: 'high',
    status: 'ongoing',
    discoveredAt: new Date(DISCOVERED_AT),
    occurredAt: new Date('2026-06-26T09:00:00.000Z'),
    reportedAt: new Date(DISCOVERED_AT),
    reporterName: 'Ada DPO',
    reporterEmail: 'ada@example.test',
    reporterDepartment: 'Privacy',
    affectedSystems: ['object-storage'],
    dataTypes: ['name', 'email'],
    estimatedAffected: 220,
    initialActions: 'Bucket access was disabled.',
    ndpcNotificationSent: false,
    ...overrides,
  };
}

function createPrismaMock() {
  return {
    breachReport: {
      findMany: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(breachRow()),
      create: jest.fn().mockResolvedValue(breachRow()),
      update: jest.fn().mockResolvedValue(breachRow({ status: 'investigating' })),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  };
}

async function loadNextBreachRoutes(prisma = createPrismaMock()) {
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

  const listRoute = await import(nextListRoutePath);
  const detailRoute = await import(nextDetailRoutePath);
  return { listRoute, detailRoute, prisma };
}

async function loadExpressBreachRouter(prisma = createPrismaMock()) {
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

function validBreachPayload() {
  return {
    title: 'Customer export exposed',
    description: 'A customer export was uploaded to a public bucket.',
    category: 'unauthorized_access',
    discoveredAt: DISCOVERED_AT,
    occurredAt: '2026-06-26T09:00:00.000Z',
    reporterName: 'Ada DPO',
    reporterEmail: 'ada@example.test',
    reporterDepartment: 'Privacy',
    affectedSystems: ['object-storage'],
    dataTypes: ['name', 'email'],
    estimatedAffected: 220,
    initialActions: 'Bucket access was disabled.',
  };
}

function invalidBreachPayload() {
  return {
    ...validBreachPayload(),
    discoveredAt: 'not-a-date',
    reporterEmail: 'not-an-email',
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
    expect(body.fields).toEqual(
      expect.objectContaining({
        discoveredAt: 'discoveredAt must be a valid ISO date.',
        reporterEmail: 'reporterEmail must be a valid email address.',
        affectedSystems: 'affectedSystems must include at least one affected system.',
        dataTypes: 'dataTypes must include at least one data type.',
      }),
    );
    expect(prisma.breachReport.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('returns NDPC readiness metadata when Next.js breach intake is persisted', async () => {
    const { listRoute, prisma } = await loadNextBreachRoutes();

    const response = await listRoute.POST(
      nextRequestWithJson('https://example.test/api/breach', validBreachPayload()),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.breachReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        category: 'unauthorized_access',
        severity: 'high',
        status: 'ongoing',
        affectedSystems: ['object-storage'],
        dataTypes: ['name', 'email'],
      }),
    });
    expect(body.ndpcReadiness).toEqual(
      expect.objectContaining({
        complete: expect.any(Boolean),
        completeness: expect.any(Number),
        missing: expect.any(Array),
        hoursRemaining: expect.any(Number),
        overdue: expect.any(Boolean),
      }),
    );
  });

  it('rejects invalid Next.js breach updates before writing to Prisma', async () => {
    const { detailRoute, prisma } = await loadNextBreachRoutes();

    const response = await detailRoute.PATCH(
      nextRequestWithJson('https://example.test/api/breach/breach_1', {
        status: 'deleted',
        severity: 'severe',
      }),
      { params: { id: 'breach_1' } },
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual({
      status: 'status must be one of ongoing, investigating, resolved, or closed.',
      severity: 'severity must be one of critical, high, medium, or low.',
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
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({
      error: 'Validation failed.',
      fields: {
        status: 'status must be one of ongoing, investigating, resolved, or closed.',
        severity: 'severity must be one of critical, high, medium, or low.',
      },
    });
    expect(prisma.breachReport.update).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });
});
