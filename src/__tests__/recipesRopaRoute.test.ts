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

const nextRoutePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/ropa/route';
const expressRoutePath = '../../packages/ndpr-recipes/src/express/routes/ropa';
const CREATED_AT = Date.parse('2026-06-26T10:00:00.000Z');

type Handler = (req: any, res: any) => unknown | Promise<unknown>;
interface MockExpressResponse {
  statusCode: number;
  body: unknown;
  status: jest.Mock<MockExpressResponse, [number]>;
  json: jest.Mock<MockExpressResponse, [unknown]>;
}

const RECORD_SNAPSHOT = {
  id: 'ropa_1',
  name: 'Customer order fulfilment',
  description: 'Processes customer identity and delivery details to fulfil orders.',
  controllerDetails: {
    name: 'Tanta Stores Ltd',
    contact: 'privacy@example.test',
    address: '1 Compliance Way, Lagos',
  },
  lawfulBasis: 'contract',
  lawfulBasisJustification: 'Processing is necessary to fulfil customer purchase contracts.',
  purposes: ['Customer order fulfilment'],
  dataCategories: ['name', 'email', 'delivery address'],
  dataSubjectCategories: ['customers'],
  recipients: ['payment processor', 'delivery partner'],
  retentionPeriod: '7 years after order completion',
  securityMeasures: ['role-based access', 'encryption at rest'],
  dataSource: 'data_subject',
  dpiaRequired: false,
  automatedDecisionMaking: false,
  status: 'active',
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};

function processingRecordRow(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: STAFF_CONTEXT.tenantId,
    id: 'ropa_1',
    purpose: RECORD_SNAPSHOT.purposes[0],
    lawfulBasis: RECORD_SNAPSHOT.lawfulBasis,
    dataCategories: RECORD_SNAPSHOT.dataCategories,
    dataSubjects: RECORD_SNAPSHOT.dataSubjectCategories,
    recipients: RECORD_SNAPSHOT.recipients,
    retentionPeriod: RECORD_SNAPSHOT.retentionPeriod,
    securityMeasures: RECORD_SNAPSHOT.securityMeasures,
    transferCountries: null,
    transferMechanism: null,
    dpiaConducted: false,
    recordData: RECORD_SNAPSHOT,
    status: 'active',
    createdAt: new Date(CREATED_AT),
    updatedAt: new Date(CREATED_AT),
    removedAt: null,
    ...overrides,
  };
}

function createPrismaMock() {
  return addTransactionMock({
    processingRecord: {
      findMany: jest.fn().mockResolvedValue([processingRecordRow()]),
      findFirst: jest.fn().mockResolvedValue(processingRecordRow()),
      create: jest.fn().mockResolvedValue(processingRecordRow()),
      update: jest.fn().mockResolvedValue(processingRecordRow()),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  });
}

async function loadNextRopaRoute(
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
  return { ...route, prisma };
}

async function loadExpressRopaRouter(
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
    tenantId: 'client-controlled-tenant',
    purpose: RECORD_SNAPSHOT.purposes[0],
    description: RECORD_SNAPSHOT.description,
    controllerDetails: RECORD_SNAPSHOT.controllerDetails,
    lawfulBasis: RECORD_SNAPSHOT.lawfulBasis,
    lawfulBasisJustification: RECORD_SNAPSHOT.lawfulBasisJustification,
    dataCategories: RECORD_SNAPSHOT.dataCategories,
    dataSubjects: RECORD_SNAPSHOT.dataSubjectCategories,
    recipients: RECORD_SNAPSHOT.recipients,
    retentionPeriod: RECORD_SNAPSHOT.retentionPeriod,
    securityMeasures: RECORD_SNAPSHOT.securityMeasures,
    dataSource: RECORD_SNAPSHOT.dataSource,
    dpiaRequired: false,
    automatedDecisionMaking: false,
  };
}

function incompleteRopaPayload() {
  return {
    purpose: 'Customer order fulfilment',
    lawfulBasis: 'contract',
    dataCategories: ['name'],
    dataSubjects: ['customers'],
    recipients: ['delivery partner'],
    retentionPeriod: '7 years',
    securityMeasures: ['encryption'],
  };
}

describe('ndpr-recipes ROPA routes', () => {
  it('rejects incomplete Next.js ROPA records before writing to Prisma', async () => {
    const { POST, prisma } = await loadNextRopaRoute();

    const response = await POST(requestWithJson(incompleteRopaPayload()));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields.processingRecord).toEqual(
      expect.stringContaining('Controller name is required.'),
    );
    expect(body.fields.processingRecord).toEqual(
      expect.stringContaining('Lawful basis justification is required'),
    );
    expect(prisma.processingRecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists a complete tenant-scoped snapshot with an atomic audit entry', async () => {
    const { POST, prisma } = await loadNextRopaRoute();

    const response = await POST(requestWithJson(validRopaPayload()));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.processingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        purpose: RECORD_SNAPSHOT.purposes[0],
        lawfulBasis: 'contract',
        dataCategories: RECORD_SNAPSHOT.dataCategories,
        dataSubjects: RECORD_SNAPSHOT.dataSubjectCategories,
        recipients: RECORD_SNAPSHOT.recipients,
        retentionPeriod: RECORD_SNAPSHOT.retentionPeriod,
        securityMeasures: RECORD_SNAPSHOT.securityMeasures,
        dpiaConducted: false,
        status: 'active',
        removedAt: null,
        recordData: expect.objectContaining({
          name: RECORD_SNAPSHOT.name,
          controllerDetails: RECORD_SNAPSHOT.controllerDetails,
          lawfulBasisJustification: RECORD_SNAPSHOT.lawfulBasisJustification,
          dataSubjectCategories: RECORD_SNAPSHOT.dataSubjectCategories,
          status: 'active',
        }),
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        module: 'ropa',
        action: 'created',
        entityId: 'ropa_1',
        entityType: 'ProcessingRecord',
        performedBy: STAFF_CONTEXT.actorId,
        changes: {
          status: 'active',
          lawfulBasis: 'contract',
          snapshotStored: true,
        },
      }),
    });
    expect(body).toEqual(expect.objectContaining({
      id: 'ropa_1',
      name: RECORD_SNAPSHOT.name,
      controllerDetails: RECORD_SNAPSHOT.controllerDetails,
      dataSubjectCategories: RECORD_SNAPSHOT.dataSubjectCategories,
    }));
  });

  it('rejects incomplete Express ROPA records before writing to Prisma', async () => {
    const { handlers, prisma } = await loadExpressRopaRouter();
    const res = createExpressRes();

    await handlers['POST /']({ body: incompleteRopaPayload() }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual(expect.objectContaining({
      error: 'Validation failed.',
      fields: {
        processingRecord: expect.stringContaining('Controller name is required.'),
      },
    }));
    expect(prisma.processingRecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists complete Express ROPA records with tenant and actor provenance', async () => {
    const { handlers, prisma } = await loadExpressRopaRouter();
    const res = createExpressRes();

    await handlers['POST /'](
      { body: validRopaPayload(), ip: '203.0.113.20' },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(prisma.processingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        lawfulBasis: 'contract',
        recordData: expect.objectContaining({
          controllerDetails: RECORD_SNAPSHOT.controllerDetails,
          lawfulBasisJustification: RECORD_SNAPSHOT.lawfulBasisJustification,
        }),
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: STAFF_CONTEXT.tenantId,
        module: 'ropa',
        action: 'created',
        entityId: 'ropa_1',
        entityType: 'ProcessingRecord',
        performedBy: STAFF_CONTEXT.actorId,
        ipAddress: '203.0.113.20',
      }),
    });
  });
});
