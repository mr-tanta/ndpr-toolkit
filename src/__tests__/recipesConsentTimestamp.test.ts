/// <reference types="jest" />

import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ConsentSettings } from '@tantainnovative/ndpr-toolkit';
import { drizzleConsentAdapter } from '../../packages/ndpr-recipes/src/adapters/drizzle-consent';
import { prismaConsentAdapter } from '../../packages/ndpr-recipes/src/adapters/prisma-consent';

const clientTimestamp = 1_700_000_000_123;
const createdTimestamp = clientTimestamp + 60_000;
const settings: ConsentSettings = {
  consents: { essential: true, analytics: false },
  timestamp: clientTimestamp,
  version: 'roundtrip-v1',
  method: 'api',
  hasInteracted: true,
  lawfulBasis: 'consent',
};

function consentRow(timestamp: Date | null = new Date(clientTimestamp)) {
  return {
    tenantId: 'tenant-a',
    id: 'consent-a',
    subjectId: 'subject-a',
    activeSubjectKey: '["tenant-a","subject-a"]',
    consents: settings.consents,
    version: settings.version,
    method: settings.method,
    hasInteracted: settings.hasInteracted,
    lawfulBasis: settings.lawfulBasis ?? null,
    ipAddress: null,
    userAgent: null,
    clientTimestamp: timestamp,
    createdAt: new Date(createdTimestamp),
    revokedAt: null,
  };
}

describe('consent timestamp persistence', () => {
  it('round-trips the canonical client timestamp through the Prisma adapter', async () => {
    let row: ReturnType<typeof consentRow> | null = null;
    const create = jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
      row = {
        ...consentRow(data.clientTimestamp as Date),
        consents: data.consents as ConsentSettings['consents'],
        version: data.version as string,
        method: data.method as string,
        hasInteracted: data.hasInteracted as boolean,
        lawfulBasis: data.lawfulBasis as NonNullable<ConsentSettings['lawfulBasis']> | null,
      };
      return row;
    });
    const transaction = {
      consentRecord: {
        updateMany: jest.fn(async () => ({ count: 0 })),
        create,
      },
    };
    const prisma = {
      consentRecord: {
        findFirst: jest.fn(async () => row),
        updateMany: jest.fn(async () => ({ count: 0 })),
      },
      $transaction: jest.fn(async (callback: (client: typeof transaction) => unknown) => (
        callback(transaction)
      )),
    };

    const adapter = prismaConsentAdapter(prisma as never, {
      tenantId: 'tenant-a',
      subjectId: 'subject-a',
    });
    await adapter.save(settings);

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ clientTimestamp: new Date(clientTimestamp) }),
    });
    await expect(adapter.load()).resolves.toEqual(settings);
  });

  it('round-trips the canonical client timestamp through the Drizzle adapter', async () => {
    let row: ReturnType<typeof consentRow> | null = null;
    const values = jest.fn(async (data: Record<string, unknown>) => {
      row = {
        ...consentRow(data.clientTimestamp as Date),
        consents: data.consents as ConsentSettings['consents'],
        version: data.version as string,
        method: data.method as string,
        hasInteracted: data.hasInteracted as boolean,
        lawfulBasis: data.lawfulBasis as NonNullable<ConsentSettings['lawfulBasis']> | null,
      };
    });
    const transaction = {
      update: () => ({
        set: () => ({ where: async () => undefined }),
      }),
      insert: () => ({ values }),
    };
    const db = {
      transaction: jest.fn(async (callback: (client: typeof transaction) => unknown) => (
        callback(transaction)
      )),
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({ limit: async () => row ? [row] : [] }),
          }),
        }),
      }),
    };

    const adapter = drizzleConsentAdapter(db, {
      tenantId: 'tenant-a',
      subjectId: 'subject-a',
    });
    await adapter.save(settings);

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ clientTimestamp: new Date(clientTimestamp) }),
    );
    await expect(adapter.load()).resolves.toEqual(settings);
  });

  it.each([
    ['Prisma', (row: ReturnType<typeof consentRow>) => {
      const prisma = {
        consentRecord: { findFirst: jest.fn(async () => row) },
      };
      return prismaConsentAdapter(prisma as never, {
        tenantId: 'tenant-a',
        subjectId: 'subject-a',
      });
    }],
    ['Drizzle', (row: ReturnType<typeof consentRow>) => {
      const db = {
        select: () => ({
          from: () => ({
            where: () => ({
              orderBy: () => ({ limit: async () => [row] }),
            }),
          }),
        }),
      };
      return drizzleConsentAdapter(db, {
        tenantId: 'tenant-a',
        subjectId: 'subject-a',
      });
    }],
  ])('%s load prefers clientTimestamp and falls back only for a legacy null value', async (_name, makeAdapter) => {
    const loaded = await makeAdapter(consentRow()).load();
    expect(loaded?.timestamp).toBe(clientTimestamp);

    const legacy = await makeAdapter(consentRow(null)).load();
    expect(legacy?.timestamp).toBe(createdTimestamp);
  });
});

describe('generated consent response contract', () => {
  const templates = [
    ['Next', path.resolve(__dirname, '../../packages/create-ndpr/templates/nextjs-consent-route.ts')],
    ['Express', path.resolve(__dirname, '../../packages/create-ndpr/templates/express-consent-route.ts')],
  ] as const;

  it.each(templates)('%s serializes GET, creation, and no-ORM replay as ConsentSettings', (_name, file) => {
    const source = readFileSync(file, 'utf8');

    expect(source).toContain('record ? toConsentSettings(record) : null');
    expect(source).toContain('toConsentSettings(replay)');
    expect(source).toContain('toConsentSettings(record)');
    expect(source).toContain(
      'timestamp: record.clientTimestamp?.getTime() ?? record.createdAt.getTime()',
    );
    expect(source).not.toMatch(/\.json\(record(?:\s*[,)]|\s*\?\?)/);
    expect(source).not.toMatch(/\.json\(replay(?:\s*[,)]|\s*\?\?)/);
  });

  it('consumes canonical route responses directly and validates the legacy createdAt fallback', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../packages/create-ndpr/templates/nextjs-layout.tsx'),
      'utf8',
    );

    expect(source).toContain('apiAdapter<StoredConsent | ConsentSettings>');
    expect(source).toContain("'timestamp' in record");
    expect(source).toContain('return record;');
    expect(source).toContain('const timestamp = Date.parse(record.createdAt);');
    expect(source).toContain('if (!Number.isFinite(timestamp)) return null;');
  });
});
