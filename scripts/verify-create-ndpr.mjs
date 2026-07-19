#!/usr/bin/env node

/**
 * Render, behavior-probe, and typecheck every create-ndpr backend branch.
 *
 * The root tsconfig intentionally excludes packages/create-ndpr. This gate
 * consumes the same noninteractive assembler as the CLI so path/inventory
 * regressions cannot hide until a consumer runs the published package.
 */
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  createTemplateVars,
  renderIntegrationFiles,
  renderTemplate,
} from '../packages/create-ndpr/bin/index.mjs';
import { verifyCreateNdprRuntime } from './lib/verify-create-ndpr-runtime.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TSC = path.join(
  ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc',
);
const PRISMA = path.join(
  ROOT,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
);
const ORMS = ['prisma', 'drizzle', 'none'];
const MODULES = [
  'consent',
  'dsr',
  'breach',
  'policy',
  'dpia',
  'lawful-basis',
  'cross-border',
  'ropa',
];
const CONFIGURATIONS = [
  { name: 'next-app', framework: 'nextjs-app', useSrcDirectory: false },
  { name: 'next-app-src', framework: 'nextjs-app', useSrcDirectory: true },
  { name: 'next-pages', framework: 'nextjs-pages', useSrcDirectory: false },
  { name: 'next-pages-src', framework: 'nextjs-pages', useSrcDirectory: true },
  { name: 'express', framework: 'express', useSrcDirectory: false },
];
const BASE_VARS = createTemplateVars({
  orgName: 'NDPR Verification Organisation',
  dpoEmail: 'dpo@example.test',
  framework: 'nextjs-app',
  orm: 'prisma',
});
const ESCAPING_CASES = [
  { label: 'double-quotes', orgName: 'Acme "Quoted" Ltd', dpoEmail: 'dpo"quoted@example.test' },
  { label: 'apostrophe', orgName: "O'Reilly Privacy", dpoEmail: "dpo'privacy@example.test" },
  { label: 'backslash', orgName: 'Acme \\ Privacy', dpoEmail: 'dpo\\privacy@example.test' },
  { label: 'backtick', orgName: 'Acme `Privacy` Labs', dpoEmail: 'dpo`privacy@example.test' },
  { label: 'comment-close', orgName: 'Acme */ Privacy', dpoEmail: 'dpo@example.test' },
  {
    label: 'placeholder-text',
    orgName: 'Acme {{DPO_EMAIL_LITERAL}} Privacy',
    dpoEmail: 'dpo{{ORG_NAME_LITERAL}}@example.test',
  },
  {
    label: 'interpolation-text',
    orgName: 'Acme ${process.env.SECRET} Privacy',
    dpoEmail: 'dpo${process.env.SECRET}@example.test',
  },
];

const CODEQL_MODE = process.argv.includes('--codeql');
const CODEQL_FIXTURE_ROOT = path.join(ROOT, 'codeql-generated', 'create-ndpr');

let fixtureRoot;
try {
  if (CODEQL_MODE) {
    rmSync(CODEQL_FIXTURE_ROOT, { recursive: true, force: true });
    mkdirSync(CODEQL_FIXTURE_ROOT, { recursive: true });
    fixtureRoot = CODEQL_FIXTURE_ROOT;
  } else {
    fixtureRoot = mkdtempSync(path.join(ROOT, '.verify-create-ndpr-'));
  }
  console.log(`create-ndpr fixture: ${path.relative(ROOT, fixtureRoot)}`);

  const prismaSchema = checkedRender(
    'prisma-schema.prisma',
    renderTemplate('prisma-schema.prisma', {
      ...BASE_VARS,
      FRAMEWORK: 'nextjs-app',
      ORM: 'prisma',
    }),
  ).replace(
    '  provider = "prisma-client-js"',
    '  provider = "prisma-client-js"\n  output   = "../generated/prisma-client"',
  );
  assertIncludes(prismaSchema, 'output   = "../generated/prisma-client"', 'temporary Prisma output');
  write('prisma/schema.prisma', prismaSchema);

  for (const configuration of CONFIGURATIONS) {
    for (const orm of ORMS) {
      const fixtureName = `${configuration.name}-${orm}`;
      const files = renderIntegrationFiles({
        framework: configuration.framework,
        orm,
        selectedModules: MODULES,
        vars: BASE_VARS,
        useSrcDirectory: configuration.useSrcDirectory,
      });
      for (const file of files) {
        write(
          `${fixtureName}/${file.relativePath}`,
          checkedRender(`${fixtureName}/${file.relativePath}`, file.content),
        );
      }
      verifyCompleteInventory(fixtureName, configuration, orm, files);
    }
  }
  for (const escapingCase of ESCAPING_CASES) {
    verifyPromptEscaping(escapingCase);
  }
  console.log('✓ prompt values preserve quotes, apostrophes, backslashes, backticks, and template text');

  verifyRenderedSecurityContracts();
  await verifyCreateNdprRuntime(fixtureRoot);

  run(PRISMA, ['generate', '--schema', path.join(fixtureRoot, 'prisma', 'schema.prisma')], {
    cwd: fixtureRoot,
    env: { ...process.env, DATABASE_URL: 'postgresql://ndpr:ndpr@localhost:5432/ndpr' },
  });
  console.log('✓ generated temporary Prisma client from rendered schema');

  write('tsconfig.json', `${JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      forceConsistentCasingInFileNames: true,
      types: ['node'],
      paths: {
        '@prisma/client': ['./generated/prisma-client'],
      },
    },
    include: [
      'next-app-*/**/*.ts',
      'next-app-*/**/*.tsx',
      'next-pages-*/**/*.ts',
      'next-pages-*/**/*.tsx',
      'express-*/**/*.ts',
      'escaping-*/**/*.ts',
      'escaping-*/**/*.tsx',
    ],
  }, null, 2)}\n`);

  run(TSC, ['--project', path.join(fixtureRoot, 'tsconfig.json'), '--pretty', 'false'], {
    cwd: fixtureRoot,
    env: process.env,
  });
  console.log('✓ strict TypeScript passed for 15 complete framework/layout/ORM combinations');
  console.log('✓ create-ndpr generated scaffold verification passed');
} finally {
  if (fixtureRoot) {
    if (CODEQL_MODE) {
      rmSync(path.join(fixtureRoot, 'generated'), { recursive: true, force: true });
      console.log(`✓ retained rendered CodeQL fixtures at ${path.relative(ROOT, fixtureRoot)}`);
    } else {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  }
}

function verifyPromptEscaping({ label, orgName, dpoEmail }) {
  const vars = createTemplateVars({
    orgName,
    dpoEmail,
    framework: 'nextjs-app',
    orm: 'none',
  });
  if (JSON.parse(vars.ORG_NAME_LITERAL) !== orgName
      || evaluateTemplateContent(vars.ORG_NAME_TEMPLATE) !== orgName) {
    fail(`${label} organisation literal changed prompt semantics`);
  }
  if (JSON.parse(vars.DPO_EMAIL_LITERAL) !== dpoEmail
      || evaluateTemplateContent(vars.DPO_EMAIL_TEMPLATE) !== dpoEmail) {
    fail(`${label} DPO email literal changed prompt semantics`);
  }
  if (vars.ORG_NAME_COMMENT.includes('*/')) {
    fail(`${label} organisation comment can terminate a generated block comment`);
  }

  const fixtureName = `escaping-${label}`;
  const files = renderIntegrationFiles({
    framework: 'nextjs-app',
    orm: 'none',
    selectedModules: MODULES,
    vars,
    useSrcDirectory: false,
  });
  for (const file of files) {
    write(
      `${fixtureName}/${file.relativePath}`,
      checkedRender(`${fixtureName}/${file.relativePath}`, file.content),
    );
  }
  const layout = files.find((file) => file.relativePath === 'app/ndpr-layout.tsx')?.content;
  const breach = files.find((file) => file.relativePath === 'app/api/breach/route.ts')?.content;
  if (!layout || !breach) fail(`${label} escaping fixture omitted required Next files`);
  assertIncludes(
    layout,
    `organizationName={\`${vars.ORG_NAME_TEMPLATE}\`}`,
    `${label} JSX organisation expression`,
  );
  assertIncludes(
    layout,
    `dpoEmail={\`${vars.DPO_EMAIL_TEMPLATE}\`}`,
    `${label} JSX DPO email expression`,
  );
  assertIncludes(
    breach,
    `name: \`${vars.ORG_NAME_TEMPLATE} DPO\``,
    `${label} breach DPO name literal`,
  );
  assertIncludes(
    breach,
    `email: \`${vars.DPO_EMAIL_TEMPLATE}\``,
    `${label} breach DPO email literal`,
  );

  checkedRender(`${label}/.env.example`, renderTemplate('env-example', vars));
  checkedRender(
    `${label}/github-ndpr-audit.yml`,
    renderTemplate('github-ndpr-audit.yml', vars),
  );
}

function verifyCompleteInventory(fixtureName, configuration, orm, files) {
  const paths = new Set(files.map((file) => file.relativePath));
  if (orm === 'prisma') assertSetHas(paths, 'prisma/schema.prisma', `${fixtureName} Prisma schema`);
  if (orm === 'drizzle') {
    assertSetHas(paths, 'src/drizzle/ndpr-schema.ts', `${fixtureName} Drizzle schema`);
    assertSetHas(paths, 'src/drizzle/index.ts', `${fixtureName} Drizzle client`);
  }

  if (configuration.framework === 'express') {
    assertSetHas(paths, 'src/ndpr/index.ts', `${fixtureName} Express router index`);
    assertSetHas(paths, 'src/ndpr/request-context.ts', `${fixtureName} Express context`);
    for (const moduleName of MODULES.filter((name) => !['policy', 'ropa'].includes(name))) {
      assertSetHas(
        paths,
        `src/ndpr/routes/${moduleName}.ts`,
        `${fixtureName} Express ${moduleName} route`,
      );
    }
    return;
  }

  const sourceRoot = configuration.useSrcDirectory ? 'src/' : '';
  const routerDirectory = configuration.framework === 'nextjs-app' ? 'app' : 'pages';
  assertSetHas(
    paths,
    `${sourceRoot}ndpr/request-context.ts`,
    `${fixtureName} Next context`,
  );
  assertSetHas(
    paths,
    configuration.framework === 'nextjs-app'
      ? `${sourceRoot}app/ndpr-layout.tsx`
      : `${sourceRoot}pages/ndpr-provider.tsx`,
    `${fixtureName} consent provider`,
  );
  for (const moduleName of MODULES.filter((name) => !['policy', 'ropa'].includes(name))) {
    assertSetHas(
      paths,
      configuration.framework === 'nextjs-app'
        ? `${sourceRoot}${routerDirectory}/api/${moduleName}/route.ts`
        : `${sourceRoot}${routerDirectory}/api/${moduleName}.ts`,
      `${fixtureName} Next ${moduleName} route`,
    );
  }
}

function verifyRenderedSecurityContracts() {
  const routeContracts = [
    {
      moduleName: 'dpia',
      prismaModel: 'dPIARecord',
      drizzleTable: 'dpiaRecords',
      storeNames: ['dpiaStore'],
      postFields: ['projectName', 'description', 'dpiaData'],
      updateFields: ['projectName', 'description', 'dpiaData', 'status'],
      derivedMarkers: [
        'const score = dpiaData.risks.reduce',
        'overallRisk: dpiaData.overallRiskLevel',
        'conductedBy: actorId',
      ],
    },
    {
      moduleName: 'lawful-basis',
      prismaModel: 'lawfulBasisRecord',
      drizzleTable: 'lawfulBasisRecords',
      storeNames: ['basisStore', 'lawfulBasisStore'],
      postFields: [
        'activityName',
        'lawfulBasis',
        'justification',
        'dataCategories',
        'purposes',
        'reviewDate',
      ],
      updateFields: [
        'activityName',
        'lawfulBasis',
        'justification',
        'dataCategories',
        'purposes',
        'reviewDate',
      ],
      derivedMarkers: ['assessedBy: actorId', 'assessedAt: now'],
    },
    {
      moduleName: 'cross-border',
      prismaModel: 'crossBorderTransferRecord',
      drizzleTable: 'crossBorderTransferRecords',
      storeNames: ['transferStore'],
      postFields: [
        'destinationCountry',
        'recipientName',
        'transferMechanism',
        'safeguards',
        'dataCategories',
        'adequacyStatus',
        'ndpcApprovalReference',
        'status',
      ],
      updateFields: [
        'destinationCountry',
        'recipientName',
        'transferMechanism',
        'safeguards',
        'dataCategories',
        'adequacyStatus',
        'ndpcApprovalReference',
        'status',
      ],
      derivedMarkers: [
        'const required = approvalRequired(mechanismValue)',
        'ndpcApprovalRequired: required',
        'riskLevel: deriveRiskLevel(',
      ],
    },
  ];
  const generatedPrismaSchema = readGenerated(path.join(fixtureRoot, 'prisma', 'schema.prisma'));
  assertIncludes(
    generatedPrismaSchema,
    'activeSubjectKey String?  @unique',
    'Prisma one-active-consent constraint',
  );
  assertIncludes(
    generatedPrismaSchema,
    '@@index([tenantId, subjectId, clientTimestamp, version, method])',
    'Prisma consent replay index',
  );
  const generatedDrizzleSchema = readGenerated(
    path.join(fixtureRoot, 'next-app-drizzle', 'src', 'drizzle', 'ndpr-schema.ts'),
  );
  assertIncludes(
    generatedDrizzleSchema,
    "uniqueIndex('consent_active_subject_key')",
    'Drizzle one-active-consent constraint',
  );
  assertIncludes(
    generatedDrizzleSchema,
    "index('consent_replay_idx')",
    'Drizzle consent replay index',
  );

  let verifiedCombinationCount = 0;
  for (const configuration of CONFIGURATIONS) {
    for (const orm of ORMS) {
      const fixtureName = `${configuration.name}-${orm}`;
      const isExpress = configuration.framework === 'express';
      const sourceRoot = configuration.useSrcDirectory ? 'src' : '';
      const routeRoot = isExpress
        ? path.join(fixtureRoot, fixtureName, 'src', 'ndpr', 'routes')
        : configuration.framework === 'nextjs-pages'
          ? path.join(fixtureRoot, fixtureName, sourceRoot, 'pages', 'api')
          : path.join(fixtureRoot, fixtureName, sourceRoot, 'app', 'api');
      const routePath = (moduleName) => configuration.framework === 'nextjs-app'
        ? path.join(routeRoot, moduleName, 'route.ts')
        : path.join(routeRoot, `${moduleName}.ts`);
      const consent = readGenerated(routePath('consent'));
      const breach = readGenerated(routePath('breach'));
      if (!isExpress) {
        const providerPath = configuration.framework === 'nextjs-app'
          ? path.join(fixtureRoot, fixtureName, sourceRoot, 'app', 'ndpr-layout.tsx')
          : path.join(fixtureRoot, fixtureName, sourceRoot, 'pages', 'ndpr-provider.tsx');
        const provider = readGenerated(providerPath);
        assertIncludes(
          provider,
          "try {\n      const existing = decodeURIComponent",
          `${fixtureName} malformed subject-cookie guard`,
        );
        assertIncludes(
          provider,
          'Ignore malformed percent encoding and replace the invalid cookie below.',
          `${fixtureName} malformed subject-cookie recovery`,
        );
      }

      verifyConsentSecurityContract(consent, fixtureName, orm, isExpress);
      for (const contract of routeContracts) {
        verifyEvidenceRouteSecurityContract(
          readGenerated(routePath(contract.moduleName)),
          fixtureName,
          orm,
          isExpress,
          contract,
        );
      }
      verifyGeneratedEvidenceSchema(fixtureName, orm);

      if (/input\.reporter(?:Name|Email|Department)/.test(breach)) {
        fail(`${fixtureName} breach route trusts client-controlled reporter profile fields`);
      }
      assertIncludes(breach, 'actor.displayName', `${fixtureName} verified reporter name`);
      assertIncludes(breach, 'actor.email', `${fixtureName} verified reporter email`);
      verifiedCombinationCount += 1;
    }
  }

  if (verifiedCombinationCount !== 15) {
    fail(`expected 15 rendered security combinations, verified ${verifiedCombinationCount}`);
  }
  console.log('✓ static security and malformed-object contracts passed for all 15 generated combinations');
}

function verifyConsentSecurityContract(consent, fixtureName, orm, isExpress) {
  assertIncludes(consent, 'activeSubjectKey', `${fixtureName} active consent invariant`);
  assertIncludes(
    consent,
    orm === 'none' ? 'row.activeSubjectKey = null' : 'activeSubjectKey: null',
    `${fixtureName} active-key clearing`,
  );
  assertIncludes(consent, 'clientTimestamp', `${fixtureName} replay key`);
  assertIncludes(consent, 'sameConsentMutation', `${fixtureName} replay comparison`);
  assertIncludes(consent, 'sortedConsentEntries', `${fixtureName} stable consent comparison`);
  assertIncludes(
    consent,
    'Number.isSafeInteger(value.timestamp)',
    `${fixtureName} canonical timestamp validation`,
  );
  assertIncludes(
    consent,
    "['P2002', 'P2034', '23505', '40001', '40P01']",
    `${fixtureName} expected concurrency conflict codes`,
  );
  assertIncludes(
    consent,
    isExpress ? '.status(409)' : '{ status: 409 }',
    `${fixtureName} conflict response`,
  );
  assertIncludes(consent, 'revoked', `${fixtureName} revoked count`);
  assertOccurrencesAtLeast(
    consent,
    'toConsentSettings(',
    3,
    `${fixtureName} canonical consent response mapper`,
  );
  assertIncludes(
    consent,
    'record ? toConsentSettings(record) : null',
    `${fixtureName} canonical consent GET response`,
  );
  assertIncludes(
    consent,
    'timestamp: record.clientTimestamp?.getTime() ?? record.createdAt.getTime()',
    `${fixtureName} consent clientTimestamp fallback`,
  );
  assertNotMatches(
    consent,
    /\.json\(\s*record\s*(?:,|\))/,
    `${fixtureName} raw consent persistence response`,
  );

  if (orm === 'prisma') {
    assertIncludes(
      consent,
      'Prisma.TransactionIsolationLevel.Serializable',
      `${fixtureName} serializable Prisma transaction`,
    );
    assertIncludes(
      consent,
      'if (result.count > 0)',
      `${fixtureName} conditional revocation audit`,
    );
  } else if (orm === 'drizzle') {
    assertIncludes(
      consent,
      "{ isolationLevel: 'serializable' }",
      `${fixtureName} serializable Drizzle transaction`,
    );
    assertIncludes(
      consent,
      'if (rows.length > 0)',
      `${fixtureName} conditional revocation audit`,
    );
  } else {
    assertIncludes(
      consent,
      'if (revoked > 0)',
      `${fixtureName} conditional development-store revocation audit`,
    );
  }
}

function verifyEvidenceRouteSecurityContract(content, fixtureName, orm, isExpress, contract) {
  const label = `${fixtureName} ${contract.moduleName}`;
  const bodyExpression = isExpress ? 'req.body' : 'body';
  const postFields = quotedFields(contract.postFields);
  assertIncludes(
    content,
    "value !== null && typeof value === 'object' && !Array.isArray(value)",
    `${label} plain-object predicate`,
  );
  assertOccurrencesAtLeast(
    content,
    `if (!isRecord(${bodyExpression}))`,
    2,
    `${label} malformed POST/PUT guards`,
  );
  assertIncludes(
    content,
    `rejectUnknownFields(${bodyExpression}, [${postFields}])`,
    `${label} strict create allowlist`,
  );

  if (contract.moduleName === 'cross-border') {
    assertIncludes(
      content,
      `const fields = [${quotedFields(contract.updateFields)}] as const`,
      `${label} strict update field set`,
    );
    assertIncludes(
      content,
      isExpress
        ? 'rejectUnknownFields(req.body, fields)'
        : "rejectUnknownFields(body, ['id', ...fields])",
      `${label} strict update allowlist`,
    );
  } else {
    const updateFields = isExpress
      ? contract.updateFields
      : ['id', ...contract.updateFields];
    assertIncludes(
      content,
      `rejectUnknownFields(${bodyExpression}, [${quotedFields(updateFields)}])`,
      `${label} strict update allowlist`,
    );
  }

  for (const marker of contract.derivedMarkers) {
    assertIncludes(content, marker, `${label} server-derived field contract`);
  }
  assertIncludes(content, 'removedAt: archivedAt', `${label} soft archive timestamp`);
  assertIncludes(content, "action: 'archived'", `${label} archived audit action`);

  const activeFilter = orm === 'prisma'
    ? 'removedAt: null'
    : orm === 'drizzle'
      ? `isNull(${contract.drizzleTable}.removedAt)`
      : 'removedAt === null';
  assertOccurrencesAtLeast(content, activeFilter, 4, `${label} active-record filters`);

  assertNotMatches(content, /\.deleteMany\s*\(/, `${label} physical deleteMany`);
  assertNotMatches(
    content,
    new RegExp(`\\.${contract.prismaModel}\\.delete\\s*\\(`),
    `${label} physical Prisma delete`,
  );
  assertNotMatches(content, /\b(?:db|tx)\.delete\s*\(/, `${label} physical Drizzle delete`);
  assertNotMatches(content, /\bMap\.delete\s*\(/, `${label} physical Map delete`);
  assertNotMatches(
    content,
    new RegExp(`\\b(?:${contract.storeNames.join('|')})\\.delete\\s*\\(`),
    `${label} physical development-store delete`,
  );
  assertNotMatches(
    content,
    /action\s*:\s*['"]deleted['"]/,
    `${label} deleted audit action`,
  );
}

function verifyGeneratedEvidenceSchema(fixtureName, orm) {
  if (orm === 'none') return;
  const schemaPath = orm === 'prisma'
    ? path.join(fixtureRoot, fixtureName, 'prisma', 'schema.prisma')
    : path.join(fixtureRoot, fixtureName, 'src', 'drizzle', 'ndpr-schema.ts');
  const schema = readGenerated(schemaPath);
  const sections = orm === 'prisma'
    ? [
        ['DPIA', 'model DPIARecord {', 'model LawfulBasisRecord {'],
        ['lawful-basis', 'model LawfulBasisRecord {', 'model CrossBorderTransferRecord {'],
        ['cross-border', 'model CrossBorderTransferRecord {', 'model ComplianceAuditLog {'],
      ]
    : [
        ['DPIA', 'export const dpiaRecords = pgTable(', 'export const lawfulBasisRecords = pgTable('],
        [
          'lawful-basis',
          'export const lawfulBasisRecords = pgTable(',
          'export const crossBorderTransferRecords = pgTable(',
        ],
        [
          'cross-border',
          'export const crossBorderTransferRecords = pgTable(',
          'export const complianceAuditLog = pgTable(',
        ],
      ];
  const blocks = Object.fromEntries(sections.map(([name, start, end]) => [
    name,
    sectionBetween(schema, start, end, `${fixtureName} ${name} schema`),
  ]));
  const removedAtPattern = orm === 'prisma'
    ? /\bremovedAt\s+DateTime\?/
    : /removedAt:\s*timestamp\('removed_at'\)/;
  for (const [name, block] of Object.entries(blocks)) {
    assertMatches(block, removedAtPattern, `${fixtureName} ${name} removedAt schema field`);
  }
  assertMatches(
    blocks['cross-border'],
    orm === 'prisma' ? /\bstatus\s+String/ : /status:\s*text\('status'\)/,
    `${fixtureName} cross-border status schema field`,
  );
}

function quotedFields(fields) {
  return fields.map((field) => `'${field}'`).join(', ');
}

function sectionBetween(content, start, end, label) {
  const startIndex = content.indexOf(start);
  if (startIndex < 0) fail(`${label} is missing ${JSON.stringify(start)}`);
  const endIndex = content.indexOf(end, startIndex + start.length);
  if (endIndex < 0) fail(`${label} is missing ${JSON.stringify(end)}`);
  return content.slice(startIndex, endIndex);
}

function assertOccurrencesAtLeast(content, expected, minimum, label) {
  const occurrences = content.split(expected).length - 1;
  if (occurrences < minimum) {
    fail(`${label} expected at least ${minimum} occurrences of ${JSON.stringify(expected)}, found ${occurrences}`);
  }
}

function assertMatches(content, pattern, label) {
  if (!pattern.test(content)) fail(`${label} does not match ${pattern}`);
}

function assertNotMatches(content, pattern, label) {
  if (pattern.test(content)) fail(`${label} unexpectedly matches ${pattern}`);
}

function evaluateTemplateContent(content) {
  return new vm.Script(`\`${content}\``).runInNewContext({});
}

function checkedRender(label, content) {
  const unresolved = content.match(/\{\{(?:#if|\/if)\b/);
  if (unresolved) fail(`${label} retained template syntax: ${unresolved[0]}`);
  return content;
}

function write(relativePath, content) {
  const destination = path.join(fixtureRoot, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content, 'utf8');
}

function readGenerated(filePath) {
  return readFileSync(filePath, 'utf8');
}

function assertSetHas(values, expected, label) {
  if (!values.has(expected)) fail(`${label} is missing ${expected}`);
}

function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) fail(`${label} is missing ${JSON.stringify(expected)}`);
}

function run(command, args, options) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    fail(`${path.basename(command)} ${args.join(' ')} exited with status ${result.status}`);
  }
}

function fail(message) {
  throw new Error(`create-ndpr verification failed: ${message}`);
}
