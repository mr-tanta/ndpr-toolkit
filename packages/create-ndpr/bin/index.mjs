#!/usr/bin/env node

import { createInterface } from 'readline';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const CWD = process.cwd();

// ---------------------------------------------------------------------------
// ANSI colour helpers (no external deps)
// ---------------------------------------------------------------------------

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m',
};

const bold = (s) => `${c.bold}${s}${c.reset}`;
const green = (s) => `${c.green}${s}${c.reset}`;
const cyan = (s) => `${c.cyan}${s}${c.reset}`;
const yellow = (s) => `${c.yellow}${s}${c.reset}`;
const dim = (s) => `${c.dim}${s}${c.reset}`;
const red = (s) => `${c.red}${s}${c.reset}`;

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------

function printBanner() {
  console.log();
  console.log(bold(cyan('  ███╗   ██╗██████╗ ██████╗ ██████╗ ')));
  console.log(bold(cyan('  ████╗  ██║██╔══██╗██╔══██╗██╔══██╗')));
  console.log(bold(cyan('  ██╔██╗ ██║██║  ██║██████╔╝██████╔╝')));
  console.log(bold(cyan('  ██║╚██╗██║██║  ██║██╔═══╝ ██╔══██╗')));
  console.log(bold(cyan('  ██║ ╚████║██████╔╝██║     ██║  ██║')));
  console.log(bold(cyan('  ╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝  ╚═╝')));
  console.log();
  console.log(bold('  create-ndpr') + dim(' — NDPA compliance scaffolder'));
  console.log(dim('  Powered by @tantainnovative/ndpr-toolkit'));
  console.log();
}

// ---------------------------------------------------------------------------
// Stack detection
// ---------------------------------------------------------------------------

function detectStack() {
  const detected = {
    framework: null,       // 'nextjs-app' | 'nextjs-pages' | 'express' | null
    orm: null,             // 'prisma' | 'drizzle' | null
    hasPackageJson: false,
  };

  // Check package.json exists
  const pkgPath = join(CWD, 'package.json');
  if (existsSync(pkgPath)) {
    detected.hasPackageJson = true;
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const deps = {
        ...((pkg.dependencies) || {}),
        ...((pkg.devDependencies) || {}),
      };

      if (deps['express']) {
        detected.framework = 'express';
      }

      if (deps['drizzle-orm'] || deps['drizzle-kit']) {
        detected.orm = 'drizzle';
      }
      if (deps['@prisma/client'] || deps['prisma']) {
        detected.orm = 'prisma';
      }
    } catch {
      // ignore parse errors
    }
  }

  // Next.js detection via config file
  const nextConfigs = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
  const hasNextConfig = nextConfigs.some((f) => existsSync(join(CWD, f)));
  if (hasNextConfig) {
    // App Router vs Pages Router: check for app/ directory
    const hasAppDir =
      existsSync(join(CWD, 'app')) ||
      existsSync(join(CWD, 'src', 'app'));
    detected.framework = hasAppDir ? 'nextjs-app' : 'nextjs-pages';
  }

  // ORM detection via project structure (if not already found in deps)
  if (!detected.orm) {
    if (existsSync(join(CWD, 'prisma', 'schema.prisma'))) {
      detected.orm = 'prisma';
    } else {
      const drizzleConfigs = ['drizzle.config.ts', 'drizzle.config.js', 'drizzle.config.mjs'];
      if (drizzleConfigs.some((f) => existsSync(join(CWD, f)))) {
        detected.orm = 'drizzle';
      }
    }
  }

  return detected;
}

// ---------------------------------------------------------------------------
// Readline helpers
// ---------------------------------------------------------------------------

function createRL() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function askRequired(rl, question, label) {
  let value = '';
  while (!value) {
    value = await ask(rl, question);
    if (!value) {
      console.log(red(`  ${label} is required.`));
    }
  }
  return value;
}

async function askChoice(rl, question, choices, defaultIndex = 0) {
  const lines = choices.map((c, i) => `  ${i + 1}) ${c}`).join('\n');
  const prompt = `${question}\n${lines}\n  Choice [${defaultIndex + 1}]: `;
  while (true) {
    const raw = await ask(rl, prompt);
    if (!raw) return defaultIndex;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1 && n <= choices.length) return n - 1;
    console.log(yellow(`  Please enter a number between 1 and ${choices.length}.`));
  }
}

async function askCheckboxes(rl, question, options, defaults = []) {
  const defaultStr = defaults.length ? ` [default: ${defaults.map((i) => i + 1).join(',')}]` : '';
  const lines = options.map((o, i) => `  ${i + 1}) ${o}`).join('\n');
  const prompt = `${question}${defaultStr}\n${lines}\n  Enter numbers separated by commas (or press Enter for default): `;

  while (true) {
    const raw = await ask(rl, prompt);
    if (!raw) return defaults;
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const indices = [];
    let valid = true;
    for (const p of parts) {
      const n = parseInt(p, 10);
      if (isNaN(n) || n < 1 || n > options.length) {
        console.log(yellow(`  Invalid option: ${p}. Enter numbers from 1-${options.length}.`));
        valid = false;
        break;
      }
      indices.push(n - 1);
    }
    if (valid) return [...new Set(indices)];
  }
}

async function askYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await ask(rl, `${question} ${hint}: `);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith('y');
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

function renderTemplate(templateName, vars) {
  const templatePath = join(TEMPLATES_DIR, templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }
  let content = readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

function writeFile(filePath, content) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, content, 'utf8');
}

// ---------------------------------------------------------------------------
// File generation
// ---------------------------------------------------------------------------

const GENERATED_FILES = [];

function generate(destRelative, templateName, vars = {}) {
  const destPath = join(CWD, destRelative);
  const content = renderTemplate(templateName, vars);
  writeFile(destPath, content);
  GENERATED_FILES.push(destRelative);
  console.log(`  ${green('+')} ${destRelative}`);
}

function generateRaw(destRelative, content) {
  const destPath = join(CWD, destRelative);
  writeFile(destPath, content);
  GENERATED_FILES.push(destRelative);
  console.log(`  ${green('+')} ${destRelative}`);
}

function skip(destRelative, reason) {
  console.log(`  ${dim('-')} ${dim(destRelative)} ${dim(`(skipped — ${reason})`)}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  printBanner();

  // --- Detect stack ---
  const detected = detectStack();

  console.log(bold('  Detected project setup:'));
  if (detected.framework) {
    const label = {
      'nextjs-app': 'Next.js (App Router)',
      'nextjs-pages': 'Next.js (Pages Router)',
      'express': 'Express',
    }[detected.framework];
    console.log(`  ${cyan('Framework:')} ${label}`);
  } else {
    console.log(`  ${cyan('Framework:')} ${yellow('Not detected')}`);
  }

  if (detected.orm) {
    console.log(`  ${cyan('ORM:')}       ${detected.orm === 'prisma' ? 'Prisma' : 'Drizzle'}`);
  } else {
    console.log(`  ${cyan('ORM:')}       ${dim('Not detected')}`);
  }
  console.log();

  const rl = createRL();

  try {
    // --- Organisation details ---
    console.log(bold('  Organisation details'));
    console.log(dim('  These are embedded in the generated files.'));
    console.log();

    const orgName = await askRequired(
      rl,
      `  ${cyan('Organisation name')} (e.g. Acme Corp Nigeria Ltd): `,
      'Organisation name',
    );

    const dpoEmail = await askRequired(
      rl,
      `  ${cyan('DPO email address')} (e.g. dpo@acmecorp.ng): `,
      'DPO email',
    );
    console.log();

    // --- Framework confirmation/override ---
    const frameworkLabels = [
      'Next.js — App Router',
      'Next.js — Pages Router',
      'Express',
      'None (generate shared files only)',
    ];
    const frameworkValues = ['nextjs-app', 'nextjs-pages', 'express', 'none'];

    let detectedFrameworkIdx = frameworkValues.indexOf(detected.framework ?? 'none');
    if (detectedFrameworkIdx === -1) detectedFrameworkIdx = 3;

    console.log(bold('  Framework'));
    const frameworkIdx = await askChoice(
      rl,
      `  ${cyan('Which framework are you using?')}`,
      frameworkLabels,
      detectedFrameworkIdx,
    );
    const framework = frameworkValues[frameworkIdx];
    console.log();

    // --- Modules ---
    const moduleOptions = [
      'consent      — NDPA §25-26 consent management',
      'dsr          — Data Subject Rights requests (§34-38)',
      'breach       — Breach notification workflow (§40)',
      'policy       — Privacy policy generation',
      'dpia         — Data Protection Impact Assessment',
      'lawful-basis — Lawful basis register',
      'cross-border — Cross-border transfer management',
      'ropa         — Record of Processing Activities',
    ];
    const moduleValues = ['consent', 'dsr', 'breach', 'policy', 'dpia', 'lawful-basis', 'cross-border', 'ropa'];

    console.log(bold('  Compliance modules'));
    const selectedModuleIndices = await askCheckboxes(
      rl,
      `  ${cyan('Which modules do you want to include?')}`,
      moduleOptions,
      [0, 1, 2],  // consent, dsr, breach by default
    );
    const selectedModules = selectedModuleIndices.map((i) => moduleValues[i]);
    console.log();

    // --- ORM ---
    const ormLabels = ['Prisma', 'Drizzle', 'None (skip database schema)'];
    const ormValues = ['prisma', 'drizzle', 'none'];

    let detectedOrmIdx = ormValues.indexOf(detected.orm ?? 'none');
    if (detectedOrmIdx === -1) detectedOrmIdx = 0;

    console.log(bold('  Database / ORM'));
    const ormIdx = await askChoice(
      rl,
      `  ${cyan('Which ORM are you using?')}`,
      ormLabels,
      detectedOrmIdx,
    );
    const orm = ormValues[ormIdx];
    console.log();

    // --- Confirm ---
    console.log(bold('  Summary'));
    console.log(`  ${cyan('Organisation:')} ${orgName}`);
    console.log(`  ${cyan('DPO email:')}    ${dpoEmail}`);
    console.log(`  ${cyan('Framework:')}    ${frameworkLabels[frameworkIdx]}`);
    console.log(`  ${cyan('ORM:')}          ${ormLabels[ormIdx]}`);
    console.log(`  ${cyan('Modules:')}      ${selectedModules.join(', ')}`);
    console.log();

    const confirmed = await askYesNo(rl, `  ${cyan('Generate files?')}`, true);
    if (!confirmed) {
      console.log(yellow('\n  Aborted. No files were written.\n'));
      process.exit(0);
    }
    console.log();

    // -------------------------------------------------------------------------
    // File generation
    // -------------------------------------------------------------------------

    console.log(bold('  Generating files...'));
    console.log();

    const vars = {
      ORG_NAME: orgName,
      DPO_EMAIL: dpoEmail,
    };

    // .env.example
    generate('.env.example', 'env-example', vars);

    // ORM schema
    if (orm === 'prisma') {
      if (existsSync(join(CWD, 'prisma', 'schema.prisma'))) {
        skip('prisma/schema.prisma', 'already exists — merge the NDPR models manually');
        console.log(dim(`    See: ${TEMPLATES_DIR}/prisma-schema.prisma`));
      } else {
        generate('prisma/schema.prisma', 'prisma-schema.prisma', vars);
      }
    } else if (orm === 'drizzle') {
      if (existsSync(join(CWD, 'src', 'drizzle', 'ndpr-schema.ts'))) {
        skip('src/drizzle/ndpr-schema.ts', 'already exists');
      } else {
        generate('src/drizzle/ndpr-schema.ts', 'drizzle-schema.ts', vars);
      }
    }

    // Framework-specific files
    if (framework === 'nextjs-app') {
      const appDir = existsSync(join(CWD, 'src', 'app')) ? 'src/app' : 'app';

      // Layout wrapper
      generate(`${appDir}/ndpr-layout.tsx`, 'nextjs-layout.tsx', vars);

      // API routes per selected module
      if (selectedModules.includes('consent')) {
        generate(`${appDir}/api/consent/route.ts`, 'nextjs-consent-route.ts', vars);
      }
      if (selectedModules.includes('dsr')) {
        generate(`${appDir}/api/dsr/route.ts`, 'nextjs-dsr-route.ts', vars);
      }
      if (selectedModules.includes('breach')) {
        generate(`${appDir}/api/breach/route.ts`, 'nextjs-breach-route.ts', vars);
      }
    } else if (framework === 'nextjs-pages') {
      console.log(yellow('  Note: Pages Router API routes generated under pages/api/'));
      if (selectedModules.includes('consent')) {
        generate('pages/api/consent.ts', 'nextjs-consent-route.ts', vars);
      }
      if (selectedModules.includes('dsr')) {
        generate('pages/api/dsr.ts', 'nextjs-dsr-route.ts', vars);
      }
      if (selectedModules.includes('breach')) {
        generate('pages/api/breach.ts', 'nextjs-breach-route.ts', vars);
      }
    } else if (framework === 'express') {
      generate('src/ndpr/index.ts', 'express-setup.ts', vars);
      if (selectedModules.includes('consent')) {
        generate('src/ndpr/routes/consent.ts', 'express-consent-route.ts', vars);
      }
    }

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------

    console.log();
    console.log(bold(green('  Done! Files generated:')));
    for (const f of GENERATED_FILES) {
      console.log(`  ${green('✓')} ${f}`);
    }
    console.log();

    // Next steps
    console.log(bold('  Next steps:'));
    console.log();

    if (orm === 'prisma') {
      console.log(`  ${cyan('1.')} Set your database URL in .env:`);
      console.log(dim('     DATABASE_URL="postgresql://user:password@localhost:5432/mydb_dev"'));
      console.log();
      console.log(`  ${cyan('2.')} Install the Prisma client and run migrations:`);
      console.log(dim('     pnpm add @prisma/client'));
      console.log(dim('     pnpm add -D prisma'));
      console.log(dim('     pnpm prisma migrate dev --name ndpr-init'));
      console.log();
    } else if (orm === 'drizzle') {
      console.log(`  ${cyan('1.')} Set your database URL in .env:`);
      console.log(dim('     DATABASE_URL="postgresql://user:password@localhost:5432/mydb_dev"'));
      console.log();
      console.log(`  ${cyan('2.')} Install Drizzle and push the schema:`);
      console.log(dim('     pnpm add drizzle-orm @paralleldrive/cuid2'));
      console.log(dim('     pnpm add -D drizzle-kit'));
      console.log(dim('     pnpm drizzle-kit push'));
      console.log();
    }

    console.log(`  ${cyan(`${orm === 'none' ? '1' : '3'}`.padStart(1))}. Install the ndpr-toolkit:`);
    console.log(dim('     pnpm add @tantainnovative/ndpr-toolkit'));
    console.log();

    if (framework === 'nextjs-app' || framework === 'nextjs-pages') {
      const appDir = existsSync(join(CWD, 'src', 'app')) ? 'src/app' : 'app';
      console.log(`  ${cyan(`${orm === 'none' ? '2' : '4'}`.padStart(1))}. Wrap your root layout with NDPRLayout:`);
      console.log(dim(`     // ${appDir}/layout.tsx`));
      console.log(dim(`     import NDPRLayout from './${appDir.includes('src') ? '' : ''}ndpr-layout';`));
      console.log(dim('     // Render <NDPRLayout>{children}</NDPRLayout> inside your <body>'));
      console.log();
    } else if (framework === 'express') {
      console.log(`  ${cyan(`${orm === 'none' ? '2' : '4'}`.padStart(1))}. Mount the NDPR router in your Express app:`);
      console.log(dim("     import { createNDPRRouter } from './src/ndpr';"));
      console.log(dim("     app.use('/api/ndpr', createNDPRRouter());"));
      console.log();
    }

    console.log(dim('  Documentation: https://ndpr-toolkit.tantainnovative.com'));
    console.log(dim('  Repository:    https://github.com/tantainnovative/ndpr-toolkit'));
    console.log();

  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(red(`\n  Error: ${err.message}\n`));
  process.exit(1);
});
