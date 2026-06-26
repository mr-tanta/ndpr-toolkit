/**
 * @jest-environment node
 */

export {};

const nextRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/ropa/route';
const expressRoutePath = '../../packages/ndpr-recipes/src/express/routes/ropa';

type Handler = (req: any, res: any) => unknown | Promise<unknown>;
interface MockExpressResponse {
  statusCode: number;
  body: unknown;
  status: jest.Mock<MockExpressResponse, [number]>;
  json: jest.Mock<MockExpressResponse, [unknown]>;
}

function createPrismaMock() {
  return {
    processingRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'ropa_1',
        purpose: 'Customer order fulfilment',
        lawfulBasis: 'contract',
        status: 'active',
      }),
      update: jest.fn(),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  };
}

async function loadNextRopaRoute(prisma = createPrismaMock()) {
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
  return { ...route, prisma };
}

async function loadExpressRopaRouter(prisma = createPrismaMock()) {
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

function requestWithJson(body: unknown): Request {
  return new Request('https://example.test/api/ropa', {
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

function validRopaPayload() {
  return {
    purpose: 'Customer order fulfilment',
    description: 'Processes customer identity and delivery details to fulfil orders.',
    controllerDetails: {
      name: 'Tanta Stores Ltd',
      contact: 'privacy@example.test',
      address: '1 Compliance Way, Lagos',
    },
    lawfulBasis: 'contract',
    lawfulBasisJustification: 'Processing is necessary to fulfil customer purchase contracts.',
    dataCategories: ['name', 'email', 'delivery address'],
    dataSubjects: ['customers'],
    recipients: ['payment processor', 'delivery partner'],
    retentionPeriod: '7 years after order completion',
    securityMeasures: ['role-based access', 'encryption at rest'],
    dataSource: 'data_subject',
    dpiaRequired: false,
    automatedDecisionMaking: false,
  };
}

describe('ndpr-recipes ROPA routes', () => {
  it('rejects incomplete Next.js ROPA records before writing to Prisma', async () => {
    const { POST, prisma } = await loadNextRopaRoute();

    const response = await POST(
      requestWithJson({
        purpose: 'Customer order fulfilment',
        lawfulBasis: 'contract',
        dataCategories: ['name'],
        dataSubjects: ['customers'],
        recipients: ['delivery partner'],
        retentionPeriod: '7 years',
        securityMeasures: ['encryption'],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields.processingRecord).toEqual(
      expect.arrayContaining([
        'Controller details are required.',
        'Lawful basis justification is required to demonstrate compliance.',
      ]),
    );
    expect(prisma.processingRecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists complete Next.js ROPA records with an audit entry', async () => {
    const { POST, prisma } = await loadNextRopaRoute();

    const response = await POST(requestWithJson(validRopaPayload()));

    expect(response.status).toBe(201);
    expect(prisma.processingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        purpose: 'Customer order fulfilment',
        lawfulBasis: 'contract',
        dataCategories: ['name', 'email', 'delivery address'],
        dataSubjects: ['customers'],
        recipients: ['payment processor', 'delivery partner'],
        retentionPeriod: '7 years after order completion',
        securityMeasures: ['role-based access', 'encryption at rest'],
        dpiaConducted: false,
        status: 'active',
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        module: 'ropa',
        action: 'created',
        entityId: 'ropa_1',
        entityType: 'ProcessingRecord',
      }),
    });
  });

  it('rejects incomplete Express ROPA records before writing to Prisma', async () => {
    const { handlers, prisma } = await loadExpressRopaRouter();
    const res = createExpressRes();

    await handlers['POST /'](
      {
        body: {
          purpose: 'Customer order fulfilment',
          lawfulBasis: 'contract',
          dataCategories: ['name'],
          dataSubjects: ['customers'],
          recipients: ['delivery partner'],
          retentionPeriod: '7 years',
          securityMeasures: ['encryption'],
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: 'Validation failed.',
        fields: {
          processingRecord: expect.arrayContaining([
            'Controller details are required.',
            'Lawful basis justification is required to demonstrate compliance.',
          ]),
        },
      }),
    );
    expect(prisma.processingRecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists complete Express ROPA records with an audit entry', async () => {
    const { handlers, prisma } = await loadExpressRopaRouter();
    const res = createExpressRes();

    await handlers['POST /']({ body: validRopaPayload() }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(prisma.processingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        purpose: 'Customer order fulfilment',
        lawfulBasis: 'contract',
        dataCategories: ['name', 'email', 'delivery address'],
        dataSubjects: ['customers'],
        recipients: ['payment processor', 'delivery partner'],
        retentionPeriod: '7 years after order completion',
        securityMeasures: ['role-based access', 'encryption at rest'],
        dpiaConducted: false,
        status: 'active',
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        module: 'ropa',
        action: 'created',
        entityId: 'ropa_1',
        entityType: 'ProcessingRecord',
      }),
    });
  });
});
