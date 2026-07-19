import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const STAFF_CONTEXT = {
  tenantId: 'tenant-runtime-probe',
  actor: {
    id: 'staff-runtime-probe',
    displayName: 'Runtime Probe Staff',
    email: 'staff@example.test',
    department: 'Privacy',
    subjectId: 'subject-runtime-probe',
    roles: ['ndpr:admin'],
  },
  actorId: 'staff-runtime-probe',
  subjectId: 'subject-runtime-probe',
  subjectSource: 'verified-account-subject',
  roles: ['ndpr:admin'],
};

const MALFORMED_EXPRESS_PROBES = [
  ['dpia.ts', 'post', '/'],
  ['dpia.ts', 'put', '/:id'],
  ['dsr.ts', 'post', '/'],
  ['lawful-basis.ts', 'post', '/'],
  ['lawful-basis.ts', 'put', '/:id'],
  ['cross-border.ts', 'post', '/'],
  ['cross-border.ts', 'put', '/:id'],
];

const CONSENT_FIELDS = [
  'consents',
  'hasInteracted',
  'lawfulBasis',
  'method',
  'timestamp',
  'version',
];

export async function verifyCreateNdprRuntime(fixtureRoot) {
  await verifyMalformedExpressBodies(fixtureRoot);
  for (const orm of ['prisma', 'drizzle', 'none']) {
    await verifyConsentPersistence(fixtureRoot, orm);
  }
  await verifyEvidenceRouteBehaviors(fixtureRoot, 'express');
  await verifyEvidenceRouteBehaviors(fixtureRoot, 'next-app');
  console.log('✓ malformed Express bodies return 400 before database access for every ORM');
  console.log('✓ canonical consent replay/collision/revocation behavior passed for every ORM');
  console.log('✓ DPIA, lawful-basis, and cross-border behavior passed for Express and Next App no-ORM routes');
}

async function verifyMalformedExpressBodies(fixtureRoot) {
  for (const orm of ['prisma', 'drizzle', 'none']) {
    const backend = createBackend(orm);
    const routeRoot = path.join(fixtureRoot, `express-${orm}`, 'src', 'ndpr', 'routes');

    for (const [fileName, method, routePath] of MALFORMED_EXPRESS_PROBES) {
      const loaded = loadExpressRoute(path.join(routeRoot, fileName), backend);
      for (const body of [null, undefined, []]) {
        const response = await invokeExpress(loaded, method, routePath, { body });
        assertEqual(
          response.statusCode,
          400,
          `${orm} ${fileName} ${method.toUpperCase()} ${routePath} malformed body status`,
        );
        assertEqual(
          response.payload?.error,
          'A JSON object is required',
          `${orm} ${fileName} ${method.toUpperCase()} ${routePath} malformed body error`,
        );
      }
    }

    assertEqual(
      backend.accesses.length,
      0,
      `${orm} malformed Express validation database access count`,
    );
  }
}

async function verifyConsentPersistence(fixtureRoot, orm) {
  const backend = createBackend(orm);
  const loaded = loadExpressRoute(
    path.join(fixtureRoot, `express-${orm}`, 'src', 'ndpr', 'routes', 'consent.ts'),
    backend,
  );
  const initialInput = {
    consents: { analytics: true, essential: true },
    version: 'runtime-v1',
    hasInteracted: true,
    lawfulBasis: 'consent',
    timestamp: 1_700_000_000_000,
  };
  const initialSettings = { ...initialInput, method: 'api' };

  const created = await invokeExpress(loaded, 'post', '/', { body: initialInput });
  assertEqual(created.statusCode, 201, `${orm} initial consent status`);
  assertConsentSettings(created.payload, initialSettings, `${orm} initial consent response`);

  const persistentState = backend.state;
  const initialRecordId = persistentState?.records[0]?.id;
  if (persistentState) {
    assertEqual(persistentState.records.length, 1, `${orm} initial backend record count`);
    assertTruthy(initialRecordId, `${orm} initial backend record ID`);
  }

  const initialGet = await invokeExpress(loaded, 'get', '/', {});
  assertEqual(initialGet.statusCode, 200, `${orm} initial consent GET status`);
  assertConsentSettings(initialGet.payload, initialSettings, `${orm} initial consent GET response`);

  const replay = await invokeExpress(loaded, 'post', '/', {
    body: {
      ...initialInput,
      consents: { essential: true, analytics: true },
    },
  });
  assertEqual(replay.statusCode, 201, `${orm} replay status`);
  assertConsentSettings(replay.payload, initialSettings, `${orm} replay response`);
  if (persistentState) {
    assertEqual(persistentState.records.length, 1, `${orm} replay backend record count`);
    assertEqual(
      persistentState.records[0]?.id,
      initialRecordId,
      `${orm} replay retained the original backend record ID`,
    );
  }

  const replayGet = await invokeExpress(loaded, 'get', '/', {});
  assertEqual(replayGet.statusCode, 200, `${orm} replay consent GET status`);
  assertConsentSettings(replayGet.payload, initialSettings, `${orm} replay consent GET response`);

  const collision = await invokeExpress(loaded, 'post', '/', {
    body: {
      ...initialInput,
      consents: { analytics: false, essential: true },
    },
  });
  assertEqual(collision.statusCode, 409, `${orm} replay collision status`);

  const fractionalTimestamp = await invokeExpress(loaded, 'post', '/', {
    body: {
      ...initialInput,
      timestamp: initialInput.timestamp + 0.5,
    },
  });
  assertEqual(fractionalTimestamp.statusCode, 400, `${orm} fractional timestamp status`);

  const replacementInput = {
    ...initialInput,
    timestamp: initialInput.timestamp + 1,
    consents: { analytics: false, essential: true },
  };
  const replacementSettings = { ...replacementInput, method: 'api' };
  const replacement = await invokeExpress(loaded, 'post', '/', { body: replacementInput });
  assertEqual(replacement.statusCode, 201, `${orm} replacement status`);
  assertConsentSettings(replacement.payload, replacementSettings, `${orm} replacement response`);

  if (persistentState) {
    assertEqual(persistentState.records.length, 2, `${orm} replacement backend record count`);
    const replacementRecordId = persistentState.records.at(-1)?.id;
    assertTruthy(replacementRecordId, `${orm} replacement backend record ID`);
    if (replacementRecordId === initialRecordId) {
      fail(`${orm} replacement reused the original backend record ID`);
    }
    assertEqual(
      new Set(persistentState.records.map((record) => record.id)).size,
      2,
      `${orm} replacement distinct backend record IDs`,
    );
  }

  const replacementGet = await invokeExpress(loaded, 'get', '/', {});
  assertEqual(replacementGet.statusCode, 200, `${orm} replacement consent GET status`);
  assertConsentSettings(
    replacementGet.payload,
    replacementSettings,
    `${orm} replacement consent GET response`,
  );

  const revoked = await invokeExpress(loaded, 'delete', '/', {});
  assertEqual(revoked.statusCode, 200, `${orm} revoke status`);
  assertEqual(revoked.payload?.revoked, 1, `${orm} revoke count`);

  const afterRevoke = await invokeExpress(loaded, 'get', '/', {});
  assertEqual(afterRevoke.statusCode, 200, `${orm} post-revoke GET status`);
  assertEqual(afterRevoke.payload, null, `${orm} post-revoke GET payload`);

  const noOp = await invokeExpress(loaded, 'delete', '/', {});
  assertEqual(noOp.statusCode, 200, `${orm} no-op revoke status`);
  assertEqual(noOp.payload?.revoked, 0, `${orm} no-op revoke count`);

  if (persistentState) {
    assertEqual(
      persistentState.audits.length,
      3,
      `${orm} audit count excludes replay/collision/fractional/no-op requests`,
    );
    assertEqual(
      persistentState.records.filter((record) => record.revokedAt === null).length,
      0,
      `${orm} no active records after revoke`,
    );
    const serializable = persistentState.transactionConfigs.some((config) =>
      config?.isolationLevel === 'Serializable' || config?.isolationLevel === 'serializable',
    );
    assertTruthy(serializable, `${orm} serializable replacement transaction`);
  }
}

async function verifyEvidenceRouteBehaviors(fixtureRoot, framework) {
  const root = framework === 'express'
    ? path.join(fixtureRoot, 'express-none', 'src', 'ndpr', 'routes')
    : path.join(fixtureRoot, 'next-app-none', 'app', 'api');
  const routePath = (moduleName) => framework === 'express'
    ? path.join(root, `${moduleName}.ts`)
    : path.join(root, moduleName, 'route.ts');

  await verifyDPIARoute(createEvidenceHarness(routePath('dpia'), framework), framework);
  await verifyLawfulBasisRoute(
    createEvidenceHarness(routePath('lawful-basis'), framework),
    framework,
  );
  await verifyCrossBorderRoute(
    createEvidenceHarness(routePath('cross-border'), framework),
    framework,
  );
}

async function verifyDPIARoute(harness, framework) {
  const label = `${framework} DPIA`;
  await verifyMalformedEvidenceMutations(harness, label);

  const input = createDPIAInput();
  await assertRejectedMutation(
    harness,
    'post',
    { ...input, score: 1, overallRisk: 'low', conductedBy: 'client-claim' },
    `${label} rejects client server-managed claims`,
  );

  const inconsistent = createDPIAInput();
  inconsistent.dpiaData.risks[0] = {
    ...inconsistent.dpiaData.risks[0],
    mitigated: true,
    mitigationMeasures: ['Tokenise direct identifiers'],
    residualScore: 13,
  };
  await assertRejectedMutation(
    harness,
    'post',
    inconsistent,
    `${label} rejects inconsistent risk evidence`,
  );

  const dangerous = createDPIAInput();
  dangerous.dpiaData.answers = Object.fromEntries([
    ['__proto__', 'attacker-controlled'],
  ]);
  dangerous.dpiaData.risks[0].relatedQuestionIds = ['__proto__'];
  await assertRejectedMutation(
    harness,
    'post',
    dangerous,
    `${label} rejects dangerous answer identifiers`,
  );

  const created = await harness.invoke('post', { body: input });
  assertEqual(created.statusCode, 201, `${label} create status`);
  assertTruthy(created.payload?.id, `${label} created ID`);
  assertEqual(created.payload?.score, 12, `${label} server-derived score`);
  assertEqual(created.payload?.overallRisk, 'high', `${label} server-derived overall risk`);
  assertEqual(created.payload?.conductedBy, STAFF_CONTEXT.actorId, `${label} actor-derived conductor`);
  assertEqual(created.payload?.approvedBy, null, `${label} draft approver`);
  assertEqual(created.payload?.dpiaData?.risks?.[0]?.score, 12, `${label} risk score`);
  assertEqual(created.payload?.dpiaData?.risks?.[0]?.level, 'high', `${label} risk level`);
  assertEqual(
    created.payload?.dpiaData?.overallRiskLevel,
    'high',
    `${label} evidence overall risk`,
  );
  assertEqual(created.payload?.dpiaData?.canProceed, false, `${label} can-proceed derivation`);
  assertEqual(
    created.payload?.dpiaData?.ndpcConsultationRequired,
    true,
    `${label} consultation derivation`,
  );
  assertTruthy(created.payload?.dpiaData?.risks?.[0]?.id, `${label} server-generated risk ID`);

  await verifySoftArchive(harness, created.payload.id, label);
}

async function verifyLawfulBasisRoute(harness, framework) {
  const label = `${framework} lawful-basis`;
  await verifyMalformedEvidenceMutations(harness, label);

  const input = createLawfulBasisInput();
  await assertRejectedMutation(
    harness,
    'post',
    {
      ...input,
      assessedBy: 'client-claim',
      assessedAt: '2099-01-01T00:00:00Z',
      removedAt: null,
    },
    `${label} rejects client server-managed claims`,
  );
  await assertRejectedMutation(
    harness,
    'post',
    {
      ...input,
      lawfulBasis: 'legitimate_interests',
      justification: 'Too short',
    },
    `${label} rejects incomplete legitimate-interest evidence`,
  );

  const created = await harness.invoke('post', { body: input });
  assertEqual(created.statusCode, 201, `${label} create status`);
  assertTruthy(created.payload?.id, `${label} created ID`);
  assertEqual(created.payload?.assessedBy, STAFF_CONTEXT.actorId, `${label} actor-derived assessor`);
  assertTruthy(created.payload?.assessedAt instanceof Date, `${label} server assessment timestamp`);

  await verifySoftArchive(harness, created.payload.id, label);
}

async function verifyCrossBorderRoute(harness, framework) {
  const label = `${framework} cross-border`;
  await verifyMalformedEvidenceMutations(harness, label);

  const input = createCrossBorderInput();
  await assertRejectedMutation(
    harness,
    'post',
    {
      ...input,
      riskLevel: 'low',
      ndpcApprovalRequired: false,
      removedAt: null,
    },
    `${label} rejects client server-managed claims`,
  );
  await assertRejectedMutation(
    harness,
    'post',
    { ...input, status: 'active' },
    `${label} rejects active approval-dependent transfer without evidence`,
  );
  await assertRejectedMutation(
    harness,
    'post',
    {
      ...input,
      transferMechanism: 'standard_clauses',
      ndpcApprovalReference: 'NDPC-CLIENT-CLAIM',
    },
    `${label} rejects inconsistent approval evidence`,
  );

  const created = await harness.invoke('post', { body: input });
  assertEqual(created.statusCode, 201, `${label} create status`);
  assertTruthy(created.payload?.id, `${label} created ID`);
  assertEqual(
    created.payload?.ndpcApprovalRequired,
    true,
    `${label} server-derived approval requirement`,
  );
  assertEqual(created.payload?.riskLevel, 'high', `${label} server-derived risk`);
  assertEqual(created.payload?.status, 'pending_approval', `${label} server-derived status`);
  assertEqual(created.payload?.ndpcApprovalReference, null, `${label} normalized approval reference`);

  await verifySoftArchive(harness, created.payload.id, label);
}

async function verifyMalformedEvidenceMutations(harness, label) {
  for (const method of ['post', 'put']) {
    for (const body of [null, undefined, []]) {
      const response = await harness.invoke(method, { body, id: 'runtime-missing-id' });
      assertEqual(
        response.statusCode,
        400,
        `${label} ${method.toUpperCase()} malformed body status`,
      );
      assertEqual(
        response.payload?.error,
        'A JSON object is required',
        `${label} ${method.toUpperCase()} malformed body error`,
      );
    }
  }
}

async function assertRejectedMutation(harness, method, body, label) {
  const response = await harness.invoke(method, { body, id: 'runtime-missing-id' });
  assertEqual(response.statusCode, 400, `${label} status`);
  assertTruthy(response.payload?.error, `${label} error`);
}

async function verifySoftArchive(harness, id, label) {
  const detail = await harness.invoke('get', { id });
  assertEqual(detail.statusCode, 200, `${label} active detail status`);
  assertEqual(detail.payload?.id, id, `${label} active detail ID`);

  const activeList = await harness.invoke('get', {});
  assertEqual(activeList.statusCode, 200, `${label} active list status`);
  assertEqual(activeList.payload?.length, 1, `${label} active list count`);

  const archived = await harness.invoke('delete', { id });
  assertEqual(archived.statusCode, 200, `${label} archive status`);
  assertJsonEqual(
    archived.payload,
    { success: true, archived: true },
    `${label} archive response`,
  );

  const missingDetail = await harness.invoke('get', { id });
  assertEqual(missingDetail.statusCode, 404, `${label} archived detail status`);

  const emptyList = await harness.invoke('get', {});
  assertEqual(emptyList.statusCode, 200, `${label} post-archive list status`);
  assertJsonEqual(emptyList.payload, [], `${label} post-archive active list`);

  const secondArchive = await harness.invoke('delete', { id });
  assertEqual(secondArchive.statusCode, 404, `${label} second archive status`);
  assertTruthy(secondArchive.payload?.error, `${label} second archive error`);
  assertEqual(secondArchive.payload?.archived, undefined, `${label} second archive result`);
}

function createDPIAInput() {
  return {
    projectName: 'Runtime identity verification',
    description: 'Assess identity verification processing before production use.',
    dpiaData: {
      answers: { identity_data: 'Government identifier and selfie' },
      risks: [{
        description: 'Identity records could be disclosed to an unauthorised party.',
        likelihood: 3,
        impact: 4,
        mitigated: false,
        relatedQuestionIds: ['identity_data'],
      }],
      conclusion: 'Further controls are required before approval.',
      version: 'runtime-v1',
      lawfulBasis: 'legal_obligation',
      involvesCrossBorderTransfer: false,
    },
  };
}

function createLawfulBasisInput() {
  return {
    activityName: 'Customer account fulfilment',
    lawfulBasis: 'contract',
    justification: 'Processing is necessary to create and service the requested customer account.',
    dataCategories: ['identity', 'contact'],
    purposes: ['account creation', 'service delivery'],
    reviewDate: '2099-01-01',
  };
}

function createCrossBorderInput() {
  return {
    destinationCountry: 'Exampleland',
    recipientName: 'Example Cloud Processor',
    transferMechanism: 'binding_corporate_rules',
    safeguards: 'Encryption, access controls, and binding intra-group privacy obligations.',
    dataCategories: ['account identifiers'],
    adequacyStatus: 'unknown',
  };
}

function createEvidenceHarness(filePath, framework) {
  const backend = createNoOrmBackend();
  if (framework === 'express') {
    const loaded = loadExpressRoute(filePath, backend);
    return {
      invoke(method, options) {
        const detailRoute = method === 'put' || method === 'delete' || (method === 'get' && options.id);
        return invokeExpress(loaded, method, detailRoute ? '/:id' : '/', options);
      },
    };
  }

  const loaded = loadNextRoute(filePath, backend);
  return {
    invoke(method, options) {
      return invokeNext(loaded, method, options);
    },
  };
}

function loadExpressRoute(filePath, backend) {
  const output = transpileRoute(filePath);
  const captures = { get: [], post: [], put: [], delete: [] };
  const router = { use: () => router };
  for (const method of Object.keys(captures)) {
    router[method] = (routePath, handler) => {
      captures[method].push({ routePath, handler });
      return router;
    };
  }
  const requireModule = createRouteRequire(filePath, backend, {
    express: { Router: () => router },
  });
  executeRoute(filePath, output, requireModule);
  return { captures };
}

function loadNextRoute(filePath, backend) {
  const output = transpileRoute(filePath);
  const nextServer = {
    NextResponse: {
      json(payload, options = {}) {
        return { statusCode: options.status ?? 200, payload };
      },
    },
  };
  const requireModule = createRouteRequire(filePath, backend, {
    'next/server': nextServer,
  });
  return executeRoute(filePath, output, requireModule);
}

function transpileRoute(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    fileName: filePath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    reportDiagnostics: true,
  });
  const diagnostics = output.diagnostics ?? [];
  if (diagnostics.length > 0) {
    fail(
      `${path.basename(filePath)} transpilation diagnostics: ${diagnostics
        .map((item) => item.code)
        .join(', ')}`,
    );
  }
  return output.outputText;
}

function createRouteRequire(filePath, backend, builtins) {
  const contextModule = {
    resolveNDPRRequestContext: async () => STAFF_CONTEXT,
    getNDPRContextProblem: () => null,
  };
  return (specifier) => {
    if (Object.hasOwn(builtins, specifier)) return builtins[specifier];
    if (specifier.includes('request-context')) return contextModule;
    if (backend.modules.has(specifier)) return backend.modules.get(specifier);
    if (specifier.endsWith('/ndpr-schema')) return backend.schema;
    if (specifier.endsWith('/drizzle')) return { db: backend.db };
    throw new Error(`Unexpected runtime-probe import ${JSON.stringify(specifier)} in ${filePath}`);
  };
}

function executeRoute(filePath, output, requireModule) {
  const module = { exports: {} };
  const script = new vm.Script(
    `(function (require, module, exports, crypto) {\n${output}\n})`,
    { filename: filePath },
  );
  const execute = script.runInNewContext({ console, Date, Map, Set });
  let sequence = 0;
  execute(requireModule, module, module.exports, {
    randomUUID: () => `runtime-${ormSafeName(filePath)}-${++sequence}`,
  });
  return module.exports;
}

async function invokeExpress(loaded, method, routePath, options) {
  const registration = loaded.captures[method].find((item) => item.routePath === routePath);
  if (!registration) fail(`Missing ${method.toUpperCase()} ${routePath} handler`);
  const request = {
    body: options.body,
    params: options.id ? { id: options.id } : { id: 'runtime-missing-id' },
    query: options.query ?? {},
    ip: null,
    socket: { remoteAddress: null },
    get: () => undefined,
  };
  const response = {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
  await registration.handler(request, response);
  return response;
}

async function invokeNext(loaded, method, options) {
  const handler = loaded[method.toUpperCase()];
  if (typeof handler !== 'function') fail(`Missing Next ${method.toUpperCase()} handler`);
  const query = new URLSearchParams(options.query ?? {});
  if (options.id) query.set('id', options.id);
  const request = {
    json: async () => options.body,
    headers: { get: () => null },
    nextUrl: { searchParams: query },
  };
  return handler(request);
}

function createBackend(orm) {
  if (orm === 'prisma') return createPrismaBackend();
  if (orm === 'drizzle') return createDrizzleBackend();
  return createNoOrmBackend();
}

function createNoOrmBackend() {
  return {
    accesses: [],
    modules: new Map(),
    schema: {},
    db: null,
    state: null,
  };
}

function createPrismaBackend() {
  const accesses = [];
  const state = {
    records: [],
    audits: [],
    transactionConfigs: [],
    nextId: 0,
  };
  const track = (operation) => accesses.push(operation);
  const client = {
    consentRecord: {
      findFirst: async ({ where }) => {
        track('consentRecord.findFirst');
        return findRecords(state.records, where).at(-1) ?? null;
      },
      updateMany: async ({ where, data }) => {
        track('consentRecord.updateMany');
        const rows = findRecords(state.records, where);
        rows.forEach((row) => Object.assign(row, data));
        return { count: rows.length };
      },
      create: async ({ data }) => {
        track('consentRecord.create');
        const record = {
          id: `prisma-${++state.nextId}`,
          ...data,
          createdAt: new Date(1_700_000_000_000 + state.nextId),
          revokedAt: null,
        };
        state.records.push(record);
        return record;
      },
    },
    complianceAuditLog: {
      create: async ({ data }) => {
        track('complianceAuditLog.create');
        state.audits.push({ id: `audit-${state.audits.length + 1}`, ...data });
      },
    },
    async $transaction(callback, config) {
      track('$transaction');
      state.transactionConfigs.push(config);
      return callback(client);
    },
  };
  class PrismaClient {
    constructor() {
      return client;
    }
  }
  return {
    accesses,
    modules: new Map([[
      '@prisma/client',
      {
        PrismaClient,
        Prisma: { TransactionIsolationLevel: { Serializable: 'Serializable' } },
      },
    ]]),
    schema: {},
    db: null,
    state,
  };
}

function createDrizzleBackend() {
  const accesses = [];
  const state = {
    records: [],
    audits: [],
    transactionConfigs: [],
    nextId: 0,
  };
  const track = (operation) => accesses.push(operation);
  const consentRecords = table('consent');
  const complianceAuditLog = table('audit');
  const schema = { consentRecords, complianceAuditLog };
  const operators = {
    eq: (column, value) => ({ kind: 'eq', column, value }),
    isNull: (column) => ({ kind: 'isNull', column }),
    and: (...conditions) => ({ kind: 'and', conditions }),
    desc: (column) => ({ kind: 'desc', column }),
  };
  const db = {
    select() {
      track('select');
      let selectedTable;
      let condition;
      const builder = {
        from(value) { selectedTable = value; return builder; },
        where(value) { condition = value; return builder; },
        orderBy() { return builder; },
        limit(count) { return Promise.resolve(rows().slice(0, count)); },
        then(resolve, reject) { return Promise.resolve(rows()).then(resolve, reject); },
      };
      const rows = () => {
        const source = selectedTable === consentRecords ? state.records : state.audits;
        return source.filter((row) => evaluateCondition(row, condition)).slice().reverse();
      };
      return builder;
    },
    update(selectedTable) {
      track('update');
      let data;
      let affected = [];
      const builder = {
        set(value) { data = value; return builder; },
        where(condition) {
          const source = selectedTable === consentRecords ? state.records : state.audits;
          affected = source.filter((row) => evaluateCondition(row, condition));
          affected.forEach((row) => Object.assign(row, data));
          return builder;
        },
        returning() { return Promise.resolve(affected); },
        then(resolve, reject) { return Promise.resolve(affected).then(resolve, reject); },
      };
      return builder;
    },
    insert(selectedTable) {
      track('insert');
      let inserted = [];
      const builder = {
        values(data) {
          const values = Array.isArray(data) ? data : [data];
          inserted = values.map((value) => {
            if (selectedTable === consentRecords) {
              return {
                id: `drizzle-${++state.nextId}`,
                ...value,
                createdAt: new Date(1_700_000_000_000 + state.nextId),
                revokedAt: null,
              };
            }
            return { id: `audit-${state.audits.length + 1}`, ...value };
          });
          if (selectedTable === consentRecords) state.records.push(...inserted);
          else state.audits.push(...inserted);
          return builder;
        },
        returning() { return Promise.resolve(inserted); },
        then(resolve, reject) { return Promise.resolve(inserted).then(resolve, reject); },
      };
      return builder;
    },
    async transaction(callback, config) {
      track('transaction');
      state.transactionConfigs.push(config);
      return callback(db);
    },
  };
  return {
    accesses,
    modules: new Map([['drizzle-orm', operators]]),
    schema,
    db,
    state,
  };
}

function table(name) {
  return {
    __name: name,
    id: 'id',
    tenantId: 'tenantId',
    subjectId: 'subjectId',
    activeSubjectKey: 'activeSubjectKey',
    consents: 'consents',
    version: 'version',
    method: 'method',
    hasInteracted: 'hasInteracted',
    lawfulBasis: 'lawfulBasis',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    clientTimestamp: 'clientTimestamp',
    createdAt: 'createdAt',
    revokedAt: 'revokedAt',
  };
}

function findRecords(records, where) {
  return records.filter((record) => Object.entries(where).every(([key, value]) =>
    valuesEqual(record[key], value),
  ));
}

function evaluateCondition(record, condition) {
  if (!condition) return true;
  if (condition.kind === 'and') {
    return condition.conditions.every((item) => evaluateCondition(record, item));
  }
  if (condition.kind === 'isNull') return record[condition.column] == null;
  if (condition.kind === 'eq') return valuesEqual(record[condition.column], condition.value);
  fail(`Unknown Drizzle condition ${JSON.stringify(condition)}`);
}

function valuesEqual(left, right) {
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime();
  return left === right;
}

function ormSafeName(filePath) {
  return filePath.split(path.sep).find((part) =>
    part.startsWith('express-') || part.startsWith('next-app-'),
  ) ?? 'route';
}

function assertConsentSettings(actual, expected, label) {
  assertTruthy(actual && typeof actual === 'object', `${label} object`);
  assertJsonEqual(Object.keys(actual).sort(), CONSENT_FIELDS, `${label} exact fields`);
  assertJsonEqual(actual, expected, label);
  assertEqual(actual.timestamp, expected.timestamp, `${label} client timestamp`);
}

function assertJsonEqual(actual, expected, label) {
  const actualJson = JSON.stringify(sortJson(actual));
  const expectedJson = JSON.stringify(sortJson(expected));
  if (actualJson !== expectedJson) {
    fail(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortJson(item)]),
    );
  }
  return value;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertTruthy(value, label) {
  if (!value) fail(`${label}: expected a truthy value`);
}

function fail(message) {
  throw new Error(`create-ndpr runtime verification failed: ${message}`);
}
