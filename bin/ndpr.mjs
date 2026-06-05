#!/usr/bin/env node
// ndpr — NDPA 2023 compliance CLI.
// `ndpr audit` scores a compliance config against the toolkit's engine
// (compliance score + GAID 2025 DCPMI / CAR / breach checks) and exits
// non-zero when the audit fails — drop it into CI as a compliance gate.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const DEFAULT_CONFIG_NAMES = ['ndpr.audit.json', 'ndpr.config.json'];

const STARTER_CONFIG = {
  minScore: 70,
  compliance: {
    consent: { hasConsentMechanism: true, hasPurposeSpecification: true, hasWithdrawalMechanism: true, hasMinorProtection: false, consentRecordsRetained: true },
    dsr: { hasRequestMechanism: true, supportsAccess: true, supportsRectification: true, supportsErasure: false, supportsPortability: false, supportsObjection: false, responseTimelineDays: 30 },
    dpia: { conductedForHighRisk: true, documentedRisks: true, mitigationMeasures: true },
    breach: { hasNotificationProcess: true, notifiesWithin72Hours: true, hasRiskAssessment: true, hasRecordKeeping: true },
    policy: { hasPrivacyPolicy: true, isPubliclyAccessible: true, lastUpdated: '2026-01-01', coversAllSections: true },
    lawfulBasis: { documentedForAllProcessing: true, hasLegitimateInterestAssessment: false },
    crossBorder: { hasTransferMechanisms: true, adequacyAssessed: true, ndpcApprovalObtained: false },
    ropa: { maintained: true, includesAllProcessing: true, lastReviewed: '2026-01-01' },
  },
  dcpmi: { dataSubjectsInSixMonths: 0 },
};

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { args.flags[key] = next; i++; }
      else args.flags[key] = true;
    } else {
      args._.push(a);
    }
  }
  return args;
}

const HELP = `ndpr ${pkg.version} — NDPA 2023 compliance CLI

Usage:
  ndpr audit [options]      Run a compliance audit and exit non-zero on failure
  ndpr --help               Show this help
  ndpr --version            Print the version

Options for "audit":
  --config <path>           Path to the audit config JSON
                            (default: ./ndpr.audit.json or ./ndpr.config.json)
  --min-score <n>           Minimum overall compliance score to pass (default 70)
  --json                    Output the full result as JSON
  --no-color                Disable coloured output
  --init                    Write a starter ndpr.audit.json and exit

Config shape: { minScore?, compliance, dcpmi?, car?, breaches? }
See https://ndprtoolkit.com.ng/docs/guides/audit-cli`;

function findConfig(explicit) {
  if (explicit) return resolve(process.cwd(), explicit);
  for (const name of DEFAULT_CONFIG_NAMES) {
    const p = resolve(process.cwd(), name);
    if (existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const command = args._[0] ?? (args.flags.help || args.flags.version ? null : 'audit');

  if (args.flags.version) { process.stdout.write(`${pkg.version}\n`); return 0; }
  if (args.flags.help || command === 'help') { process.stdout.write(`${HELP}\n`); return 0; }

  if (command !== 'audit') {
    process.stderr.write(`Unknown command: ${command}\n\n${HELP}\n`);
    return 2;
  }

  if (args.flags.init) {
    const out = resolve(process.cwd(), 'ndpr.audit.json');
    if (existsSync(out)) { process.stderr.write(`Refusing to overwrite existing ${out}\n`); return 1; }
    writeFileSync(out, JSON.stringify(STARTER_CONFIG, null, 2) + '\n');
    process.stdout.write(`Wrote starter config to ${out}\n`);
    return 0;
  }

  const configPath = findConfig(typeof args.flags.config === 'string' ? args.flags.config : undefined);
  if (!configPath) {
    process.stderr.write('No audit config found. Create one with "ndpr audit --init" or pass --config <path>.\n');
    return 2;
  }
  if (!existsSync(configPath)) {
    process.stderr.write(`Config not found: ${configPath}\n`);
    return 2;
  }

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (err) {
    process.stderr.write(`Failed to parse ${configPath}: ${err.message}\n`);
    return 2;
  }
  if (!config || typeof config.compliance !== 'object' || config.compliance === null) {
    process.stderr.write(`Config ${configPath} must contain a "compliance" object.\n`);
    return 2;
  }

  const { runNdprAudit, formatNdprAuditReport } = await import('@tantainnovative/ndpr-toolkit/server');

  const options = { ...(config.options ?? {}) };
  if (args.flags['min-score'] !== undefined) {
    const minScore = Number(args.flags['min-score']);
    if (typeof args.flags['min-score'] !== 'string' || Number.isNaN(minScore)) {
      process.stderr.write('--min-score requires a numeric value.\n');
      return 2;
    }
    options.minScore = minScore;
  } else if (config.minScore !== undefined) {
    options.minScore = config.minScore;
  }

  const result = runNdprAudit(
    { compliance: config.compliance, dcpmi: config.dcpmi, car: config.car, breaches: config.breaches },
    options,
  );

  if (args.flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const color = !args.flags['no-color'] && process.stdout.isTTY === true;
    process.stdout.write(formatNdprAuditReport(result, { color }) + '\n');
  }

  return result.passed ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (err) => { process.stderr.write(`ndpr: ${err?.stack || err}\n`); process.exit(2); },
);
