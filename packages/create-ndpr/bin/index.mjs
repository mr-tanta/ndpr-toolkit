#!/usr/bin/env node

import { createInterface } from 'node:readline';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const CWD = process.cwd();
// Keep this exact pin synchronized with the repository root package version.
const TOOLKIT_VERSION = '6.0.0';
const FORCE = process.argv.slice(2).includes('--force');

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', green: '\x1b[32m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m',
};
const colour = (code, value) => `${code}${value}${c.reset}`;
const bold = (value) => colour(c.bold, value);
const green = (value) => colour(c.green, value);
const cyan = (value) => colour(c.cyan, value);
const yellow = (value) => colour(c.yellow, value);
const dim = (value) => colour(c.dim, value);
const red = (value) => colour(c.red, value);

function printBanner() {
  console.log();
  console.log(bold(cyan('  create-ndpr')) + dim(' — NDPA compliance scaffolder'));
  console.log(dim(`  Generates @tantainnovative/ndpr-toolkit@${TOOLKIT_VERSION} integrations`));
  if (FORCE) {
    console.log(yellow('  --force enabled: existing generated files may be replaced.'));
  }
  console.log();
}

function detectStack() {
  const detected = { framework: null, orm: null };
  const pkgPath = join(CWD, 'package.json');
  let dependencies = {};
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      dependencies = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      if (dependencies.express) detected.framework = 'express';
      if (dependencies['drizzle-orm'] || dependencies['drizzle-kit']) detected.orm = 'drizzle';
      if (dependencies['@prisma/client'] || dependencies.prisma) detected.orm = 'prisma';
    } catch {
      console.log(yellow('  package.json could not be parsed; continuing with manual choices.'));
    }
  }

  const nextConfigs = ['next.config.js', 'next.config.cjs', 'next.config.mjs', 'next.config.ts'];
  const hasNext = Boolean(dependencies.next) || nextConfigs.some((file) => existsSync(join(CWD, file)));
  if (hasNext) {
    const hasApp = existsSync(join(CWD, 'app')) || existsSync(join(CWD, 'src', 'app'));
    detected.framework = hasApp ? 'nextjs-app' : 'nextjs-pages';
  }

  if (!detected.orm) {
    if (existsSync(join(CWD, 'prisma', 'schema.prisma'))) detected.orm = 'prisma';
    else if (['ts', 'js', 'mjs', 'cjs'].some((ext) => existsSync(join(CWD, `drizzle.config.${ext}`)))) {
      detected.orm = 'drizzle';
    }
  }
  return detected;
}

function createRL() {
  return createInterface({ input: process.stdin, output: process.stdout });
}
function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}
async function askValidated(rl, question, label, validate) {
  while (true) {
    const value = await ask(rl, question);
    const problem = validate(value);
    if (!problem) return value;
    console.log(red(`  ${label}: ${problem}`));
  }
}
async function askChoice(rl, question, choices, defaultIndex = 0) {
  const lines = choices.map((choice, index) => `  ${index + 1}) ${choice}`).join('\n');
  while (true) {
    const raw = await ask(rl, `${question}\n${lines}\n  Choice [${defaultIndex + 1}]: `);
    if (!raw) return defaultIndex;
    const selected = Number.parseInt(raw, 10);
    if (Number.isInteger(selected) && selected >= 1 && selected <= choices.length) return selected - 1;
    console.log(yellow(`  Enter a number from 1-${choices.length}.`));
  }
}
async function askCheckboxes(rl, question, options, defaults) {
  const lines = options.map((option, index) => `  ${index + 1}) ${option}`).join('\n');
  const defaultText = defaults.map((index) => index + 1).join(',');
  while (true) {
    const raw = await ask(
      rl,
      `${question} [default: ${defaultText}]\n${lines}\n  Enter comma-separated numbers: `,
    );
    if (!raw) return defaults;
    const values = raw.split(',').map((value) => Number.parseInt(value.trim(), 10));
    if (values.every((value) => Number.isInteger(value) && value >= 1 && value <= options.length)) {
      return [...new Set(values.map((value) => value - 1))];
    }
    console.log(yellow(`  Enter only numbers from 1-${options.length}.`));
  }
}
async function askYesNo(rl, question, defaultYes = true) {
  const answer = await ask(rl, `${question} ${defaultYes ? '[Y/n]' : '[y/N]'}: `);
  return answer ? answer.toLowerCase().startsWith('y') : defaultYes;
}

function javascriptStringLiteral(value) {
  return JSON.stringify(String(value))
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}
function javascriptTemplateLiteralContent(value) {
  return JSON.stringify(String(value))
    .slice(1, -1)
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}
function commentTemplateValue(value) {
  return String(value)
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
    .replaceAll('*/', '* /');
}
function tenantSlug(value) {
  const slug = String(value).toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return slug || 'ndpr-tenant';
}
function createTemplateVars({ orgName, dpoEmail, framework, orm }) {
  return {
    ORG_NAME_COMMENT: commentTemplateValue(orgName),
    ORG_NAME_LITERAL: javascriptStringLiteral(orgName),
    DPO_EMAIL_LITERAL: javascriptStringLiteral(dpoEmail),
    ORG_NAME_TEMPLATE: javascriptTemplateLiteralContent(orgName),
    DPO_EMAIL_TEMPLATE: javascriptTemplateLiteralContent(dpoEmail),
    TENANT_ID: tenantSlug(orgName),
    TOOLKIT_VERSION,
    FRAMEWORK: framework,
    ORM: orm,
  };
}

function renderTemplate(templateName, vars) {
  const templatePath = join(TEMPLATES_DIR, templateName);
  if (!existsSync(templatePath)) throw new Error(`Template not found: ${templateName}`);
  let content = readFileSync(templatePath, 'utf8');
  const ifPattern =
    /(?:[ \t]*\/\/[ \t]*)?\{\{#if[ \t]+([A-Z_]+)=([a-zA-Z0-9_-]+)\}\}\s*([\s\S]*?)(?:[ \t]*\/\/[ \t]*)?\{\{\/if\}\}[ \t]*\n?/g;
  content = content.replace(ifPattern, (_match, key, expected, body) =>
    vars[key] === expected ? (body.endsWith('\n') ? body : `${body}\n`) : '',
  );
  const unresolvedDirective = content.match(/\{\{(?:#if|\/if)[^}]*\}\}/);
  if (unresolvedDirective) {
    throw new Error(`Unresolved template directive ${unresolvedDirective[0]} in ${templateName}`);
  }
  content = content.replace(/\{\{([A-Z_]+)\}\}/g, (placeholder, key) => {
    if (!Object.hasOwn(vars, key)) {
      throw new Error(`Unresolved template variable ${placeholder} in ${templateName}`);
    }
    return String(vars[key]);
  });
  return content;
}

const GENERATED_FILES = [];
const SKIPPED_FILES = [];
function skip(relativePath, reason) {
  SKIPPED_FILES.push(relativePath);
  console.log(`  ${dim('-')} ${dim(relativePath)} ${dim(`(skipped — ${reason})`)}`);
}
function writeGenerated(relativePath, content, { neverOverwrite = false } = {}) {
  const destination = join(CWD, relativePath);
  const shouldOverwrite = FORCE && !neverOverwrite;
  const directory = dirname(destination);
  mkdirSync(directory, { recursive: true });
  try {
    writeFileSync(destination, content, {
      encoding: 'utf8',
      flag: shouldOverwrite ? 'w' : 'wx',
    });
  } catch (error) {
    if (error && error.code === 'EEXIST') {
      skip(
        relativePath,
        neverOverwrite
          ? 'existing file must be merged manually'
          : 'already exists; pass --force to replace',
      );
      return false;
    }
    throw error;
  }
  GENERATED_FILES.push(relativePath);
  console.log(`  ${green('+')} ${relativePath}`);
  return true;
}
function generate(relativePath, templateName, vars, options) {
  return writeGenerated(relativePath, renderTemplate(templateName, vars), options);
}

const PAGES_METHODS = {
  consent: ['GET', 'POST', 'DELETE'],
  dsr: ['GET', 'POST'],
  breach: ['GET', 'POST'],
  dpia: ['GET', 'POST', 'PUT', 'DELETE'],
  'lawful-basis': ['GET', 'POST', 'PUT', 'DELETE'],
  'cross-border': ['GET', 'POST', 'PUT', 'DELETE'],
};
function renderPagesRoute(templateName, vars, methods) {
  let content = renderTemplate(templateName, vars)
    .replace('Next.js App Router', 'Next.js Pages Router')
    .replace(
      "import { NextRequest, NextResponse } from 'next/server';",
      "import { NextRequest, NextResponse } from 'next/server';\nimport type { NextApiRequest, NextApiResponse } from 'next';",
    );
  const map = methods.map((method) => `${method}`).join(', ');
  content += `\n\ntype AppRouteHandler = (request: NextRequest) => Promise<Response>;\nconst pageHandlers: Record<string, AppRouteHandler> = { ${map} };\n\nexport default async function handler(req: NextApiRequest, res: NextApiResponse) {\n  const method = (req.method ?? '').toUpperCase();\n  const routeHandler = pageHandlers[method];\n  if (!routeHandler) {\n    res.setHeader('Allow', Object.keys(pageHandlers));\n    return res.status(405).json({ error: 'Method not allowed' });\n  }\n\n  const headers = new Headers();\n  for (const [name, value] of Object.entries(req.headers)) {\n    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));\n    else if (value !== undefined) headers.set(name, value);\n  }\n  headers.delete('content-length');\n  const init: Omit<RequestInit, 'signal'> = { method, headers };\n  if (method !== 'GET' && method !== 'HEAD') {\n    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});\n    if (!headers.has('content-type')) headers.set('content-type', 'application/json');\n  }\n\n  const request = new NextRequest(new URL(req.url ?? '/', 'http://localhost'), init);\n  const response = await routeHandler(request);\n  response.headers.forEach((value, name) => res.setHeader(name, value));\n  const responseBody = await response.text();\n  if (!responseBody) return res.status(response.status).end();\n  return res.status(response.status).send(responseBody);\n}\n`;
  return content;
}

function renderExpressIndex(selectedModules) {
  const routeNames = {
    consent: 'consentRouter', dsr: 'dsrRouter', breach: 'breachRouter',
    dpia: 'dpiaRouter', 'lawful-basis': 'lawfulBasisRouter',
    'cross-border': 'crossBorderRouter',
  };
  const enabled = selectedModules.filter((module) => routeNames[module]);
  const imports = enabled.map((module) =>
    `import { ${routeNames[module]} } from './routes/${module}';`,
  ).join('\n');
  const mounts = enabled.map((module) =>
    `  router.use('/${module}', ${routeNames[module]});`,
  ).join('\n');
  return `import { Router } from 'express';\n${imports}\n\nexport function createNDPRRouter(): Router {\n  const router = Router();\n${mounts}\n  return router;\n}\n`;
}

const NEXT_TEMPLATES = {
  consent: 'nextjs-consent-route.ts', dsr: 'nextjs-dsr-route.ts',
  breach: 'nextjs-breach-route.ts', dpia: 'nextjs-dpia-route.ts',
  'lawful-basis': 'nextjs-lawful-basis-route.ts',
  'cross-border': 'nextjs-cross-border-route.ts',
};
const EXPRESS_TEMPLATES = {
  consent: 'express-consent-route.ts', dsr: 'express-dsr-route.ts',
  breach: 'express-breach-route.ts', dpia: 'express-dpia-route.ts',
  'lawful-basis': 'express-lawful-basis-route.ts',
  'cross-border': 'express-cross-border-route.ts',
};

/**
 * Render the exact integration files produced by the interactive CLI without
 * reading prompts or writing to disk. The verifier consumes this same API.
 */
function renderIntegrationFiles({
  framework,
  orm,
  selectedModules,
  vars,
  useSrcDirectory = false,
}) {
  if (!['nextjs-app', 'nextjs-pages', 'express', 'none'].includes(framework)) {
    throw new Error(`Unsupported framework: ${framework}`);
  }
  if (!['prisma', 'drizzle', 'none'].includes(orm)) {
    throw new Error(`Unsupported ORM: ${orm}`);
  }

  const templateVars = { ...vars, FRAMEWORK: framework, ORM: orm };
  const modules = [...new Set(selectedModules)];
  const files = [];
  const addTemplate = (relativePath, templateName, routeVars = templateVars, options) => {
    files.push({
      relativePath,
      content: renderTemplate(templateName, routeVars),
      ...(options ? { options } : {}),
    });
  };

  if (orm === 'prisma') {
    addTemplate(
      'prisma/schema.prisma',
      'prisma-schema.prisma',
      templateVars,
      { neverOverwrite: true },
    );
  } else if (orm === 'drizzle') {
    addTemplate('src/drizzle/ndpr-schema.ts', 'drizzle-schema.ts');
    addTemplate('src/drizzle/index.ts', 'drizzle-client.ts');
  }

  if (framework === 'nextjs-app' || framework === 'nextjs-pages') {
    const sourceRoot = useSrcDirectory ? 'src/' : '';
    const appDir = `${sourceRoot}app`;
    const pagesDir = `${sourceRoot}pages`;
    const contextPath = `${sourceRoot}ndpr/request-context.ts`;
    const drizzleBase = framework === 'nextjs-app'
      ? (useSrcDirectory ? '../../../drizzle' : '../../../src/drizzle')
      : (useSrcDirectory ? '../../drizzle' : '../../src/drizzle');
    addTemplate(contextPath, 'nextjs-request-context.ts');

    if (modules.includes('consent')) {
      addTemplate(
        framework === 'nextjs-app'
          ? `${appDir}/ndpr-layout.tsx`
          : `${pagesDir}/ndpr-provider.tsx`,
        'nextjs-layout.tsx',
      );
    }

    for (const [moduleName, template] of Object.entries(NEXT_TEMPLATES)) {
      if (!modules.includes(moduleName)) continue;
      const routeVars = {
        ...templateVars,
        NDPR_CONTEXT_IMPORT: framework === 'nextjs-app'
          ? '../../../ndpr/request-context'
          : '../../ndpr/request-context',
        NDPR_DB_IMPORT: drizzleBase,
        NDPR_SCHEMA_IMPORT: `${drizzleBase}/ndpr-schema`,
      };
      if (framework === 'nextjs-app') {
        addTemplate(`${appDir}/api/${moduleName}/route.ts`, template, routeVars);
      } else {
        files.push({
          relativePath: `${pagesDir}/api/${moduleName}.ts`,
          content: renderPagesRoute(template, routeVars, PAGES_METHODS[moduleName]),
        });
      }
    }
  } else if (framework === 'express') {
    addTemplate('src/ndpr/request-context.ts', 'express-request-context.ts');
    for (const [moduleName, template] of Object.entries(EXPRESS_TEMPLATES)) {
      if (!modules.includes(moduleName)) continue;
      addTemplate(`src/ndpr/routes/${moduleName}.ts`, template, {
        ...templateVars,
        NDPR_CONTEXT_IMPORT: '../request-context',
        NDPR_DB_IMPORT: '../../drizzle',
        NDPR_SCHEMA_IMPORT: '../../drizzle/ndpr-schema',
      });
    }
    files.push({
      relativePath: 'src/ndpr/index.ts',
      content: renderExpressIndex(modules),
    });
  }

  return files;
}

async function main() {
  printBanner();
  const detected = detectStack();
  console.log(bold('  Detected project setup:'));
  console.log(`  ${cyan('Framework:')} ${detected.framework ?? dim('not detected')}`);
  console.log(`  ${cyan('ORM:')}       ${detected.orm ?? dim('not detected')}`);
  console.log();

  const rl = createRL();
  try {
    const orgName = await askValidated(
      rl,
      `  ${cyan('Organisation name')}: `,
      'Organisation name',
      (value) => !value ? 'is required' : value.length > 120 ? 'must be at most 120 characters' : /[\u0000-\u001f]/.test(value) ? 'contains control characters' : null,
    );
    const dpoEmail = await askValidated(
      rl,
      `  ${cyan('DPO email address')}: `,
      'DPO email',
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'must be a valid email address',
    );

    const frameworkLabels = ['Next.js — App Router', 'Next.js — Pages Router', 'Express', 'None'];
    const frameworkValues = ['nextjs-app', 'nextjs-pages', 'express', 'none'];
    const frameworkDefault = Math.max(0, frameworkValues.indexOf(detected.framework ?? 'none'));
    const frameworkIndex = await askChoice(rl, `  ${cyan('Framework')}`, frameworkLabels, frameworkDefault);
    const framework = frameworkValues[frameworkIndex];

    const moduleLabels = [
      'consent — NDPA §25-26', 'dsr — data-subject rights', 'breach — notification',
      'policy — privacy policy', 'dpia — impact assessment',
      'lawful-basis — processing register', 'cross-border — transfer register', 'ropa — processing activities',
    ];
    const moduleValues = ['consent', 'dsr', 'breach', 'policy', 'dpia', 'lawful-basis', 'cross-border', 'ropa'];
    const moduleIndices = await askCheckboxes(rl, `  ${cyan('Modules')}`, moduleLabels, [0, 1, 2]);
    const selectedModules = moduleIndices.map((index) => moduleValues[index]);

    const ormLabels = ['Prisma', 'Drizzle', 'None (development stores only)'];
    const ormValues = ['prisma', 'drizzle', 'none'];
    const ormDefault = Math.max(0, ormValues.indexOf(detected.orm ?? 'none'));
    const ormIndex = await askChoice(rl, `  ${cyan('ORM')}`, ormLabels, ormDefault);
    const orm = ormValues[ormIndex];

    console.log(`\n  ${cyan('Organisation:')} ${orgName}`);
    console.log(`  ${cyan('Framework:')}    ${frameworkLabels[frameworkIndex]}`);
    console.log(`  ${cyan('ORM:')}          ${ormLabels[ormIndex]}`);
    console.log(`  ${cyan('Modules:')}      ${selectedModules.join(', ') || 'none'}\n`);
    if (!await askYesNo(rl, `  ${cyan('Generate files?')}`)) {
      console.log(yellow('\n  Aborted. No files were written.\n'));
      return;
    }

    const vars = createTemplateVars({ orgName, dpoEmail, framework, orm });
    console.log(`\n${bold('  Generating files...')}\n`);
    generate('.env.example', 'env-example', vars);

    const useSrcDirectory = framework === 'nextjs-app'
      ? existsSync(join(CWD, 'src', 'app'))
      : framework === 'nextjs-pages'
        ? existsSync(join(CWD, 'src', 'pages'))
        : false;
    const integrationFiles = renderIntegrationFiles({
      framework,
      orm,
      selectedModules,
      vars,
      useSrcDirectory,
    });
    for (const file of integrationFiles) {
      writeGenerated(file.relativePath, file.content, file.options);
    }

    generate('ndpr.audit.json', 'ndpr-audit.json', vars);
    generate('.github/workflows/ndpr-audit.yml', 'github-ndpr-audit.yml', vars);

    console.log(`\n${bold(green('  Done.'))} Generated ${GENERATED_FILES.length} file(s); skipped ${SKIPPED_FILES.length}.\n`);
    console.log(bold('  Next steps:'));
    console.log(dim(`  1. Install the exact toolkit version: pnpm add @tantainnovative/ndpr-toolkit@${TOOLKIT_VERSION}`));
    console.log(dim('  2. Set DATABASE_URL and NDPR_TENANT_ID in your server environment.'));
    console.log(dim('  3. Connect the generated request-context resolver to verified authentication.'));
    if (orm === 'prisma') console.log(dim('  4. Run: pnpm prisma migrate dev --name ndpr-init'));
    if (orm === 'drizzle') {
      console.log(dim('  4. Pass your Drizzle instance to configureNDPRDatabase() during server startup.'));
      console.log(dim('     Then run your pinned-compatible drizzle-kit migration command.'));
    }
    if (framework === 'nextjs-pages' && selectedModules.includes('consent')) {
      console.log(dim('  5. Wrap Component with NDPRClientProvider from pages/ndpr-provider in pages/_app.tsx.'));
    } else if (framework === 'nextjs-app' && selectedModules.includes('consent')) {
      console.log(dim('  5. Render NDPRClientProvider from app/ndpr-layout.tsx inside app/layout.tsx.'));
    } else if (framework === 'express') {
      console.log(dim("  5. Mount createNDPRRouter() at your chosen '/api/ndpr' path."));
    }
    console.log(dim('  Review every generated TODO and do not deploy in-memory stores as evidence.\n'));
  } finally {
    rl.close();
  }
}

export {
  createTemplateVars,
  renderIntegrationFiles,
  renderPagesRoute,
  renderTemplate,
};

const isDirectExecution = Boolean(
  process.argv[1]
  && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)),
);
if (isDirectExecution) {
  main().catch((error) => {
    console.error(red(`\n  Error: ${error instanceof Error ? error.message : String(error)}\n`));
    process.exitCode = 1;
  });
}
