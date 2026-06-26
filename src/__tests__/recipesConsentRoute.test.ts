/**
 * @jest-environment node
 */

import type { ConsentSettings } from '../../packages/ndpr-toolkit/src/types/consent';

const routePath = '../../packages/ndpr-recipes/src/nextjs/app-router/api/consent/route';

function createPrismaMock() {
  return {
    consentRecord: {
      findFirst: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({
        id: 'consent_1',
        subjectId: 'subject-1',
        consents: { analytics: true },
        version: '2026.06',
      }),
    },
    complianceAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
    },
  };
}

async function loadRecipeRoute(prisma = createPrismaMock()) {
  jest.resetModules();
  jest.doMock(
    '@prisma/client',
    () => ({
      PrismaClient: jest.fn(() => prisma),
    }),
    { virtual: true },
  );
  jest.doMock('@tantainnovative/ndpr-toolkit/server', () =>
    jest.requireActual('../../packages/ndpr-toolkit/src/server'),
  );

  const route = await import(routePath);
  return { ...route, prisma };
}

function requestWithJson(body: unknown, headers?: HeadersInit): Request {
  return new Request('https://example.test/api/consent', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('ndpr-recipes Next.js consent route', () => {
  it('rejects invalid ConsentSettings before writing to Prisma', async () => {
    const { POST, prisma } = await loadRecipeRoute();

    const response = await POST(
      requestWithJson({
        subjectId: 'subject-1',
        consents: { analytics: true },
        version: '2026.06',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed.');
    expect(body.fields).toEqual({
      timestamp: 'Consent timestamp is required',
      method: 'Consent collection method is required',
      hasInteracted: 'User interaction status is required',
    });
    expect(prisma.consentRecord.create).not.toHaveBeenCalled();
    expect(prisma.complianceAuditLog.create).not.toHaveBeenCalled();
  });

  it('persists validated ConsentSettings and request metadata', async () => {
    const { POST, prisma } = await loadRecipeRoute();
    const consent: ConsentSettings & { subjectId: string } = {
      subjectId: 'subject-1',
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
    expect(prisma.consentRecord.updateMany).toHaveBeenCalledWith({
      where: { subjectId: 'subject-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.consentRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        subjectId: 'subject-1',
        consents: consent.consents,
        version: '2026.06',
        method: 'banner',
        lawfulBasis: 'consent',
        ipAddress: '203.0.113.12',
        userAgent: 'Jest Browser',
      }),
    });
    expect(prisma.complianceAuditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        module: 'consent',
        action: 'created',
        entityId: 'consent_1',
        entityType: 'ConsentRecord',
        changes: expect.objectContaining({
          subjectId: 'subject-1',
          version: '2026.06',
          consents: consent.consents,
        }),
      }),
    });
  });
});
