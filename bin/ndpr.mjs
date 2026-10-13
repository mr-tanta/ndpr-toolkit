#!/usr/bin/env node
// ndpr — NDPA 2023 compliance CLI.
// `ndpr audit` scores a compliance config against the toolkit's engine
// (compliance score + GAID 2025 DCPMI / CAR / breach checks) and exits
// non-zero when the audit fails — drop it into CI as a compliance gate.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
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
  ndpr dcpmi [options]      Compare your declared DCPMI tier with the tier
                            reached if third-party data subjects are counted
  ndpr --help               Show this help
  ndpr --version            Print the version

Options for "dcpmi" (advisory only; never writes to your audit config):
  --direct <n>              Direct data subjects in the six-month window
  --relations <list>        Comma-separated kind:perSubject[:coverage], e.g.
                            guarantor:2:0.6,uploaded_contact:150:0.3
                            kinds: next_of_kin, guarantor, referee, dependant,
                            beneficiary, emergency_contact, uploaded_contact, other
  --overlap <0-1>           Share of derived records that duplicate others
  --revenue <naira>         Annual gross revenue, to show the s.48(4) ceiling
  --json                    Output the full result as JSON

  ndpr scan [paths...]      Find Nigerian personal identifiers (phone, NIN/BVN-
                            shaped numbers, NUBAN, cards, CAC, plates, email)
                            in files. Values are masked in the output.
  --fail-on <level>         Exit 1 when a match at or above low|medium|high is
                            found (default: high)
  --min-confidence <level>  Hide matches below this level (default: medium)
  --types <list>            Comma-separated subset of: phone_ng, national_id,
                            nuban, payment_card, cac_number, vehicle_plate, email
  --include-example-domains Also report emails at reserved documentation
                            domains (example.com, *.test, *.example, *.invalid)
  --json                    Output matches as JSON

Options for "audit":
  --config <path>           Path to the audit config JSON
                            (default: ./ndpr.audit.json or ./ndpr.config.json)
  --min-score <n>           Minimum overall compliance score to pass (default 70)
  --json                    Output the full result as JSON
  --no-color                Disable coloured output
  --init                    Write a starter ndpr.audit.json and exit

Config shape: { minScore?, compliance, dcpmi?, car?, breaches? }
See https://ndprtoolkit.com.ng/docs/guides/audit-cli`;

function parseNumberFlag(args, name, { min = 0, max = Infinity } = {}) {
  const raw = args.flags[name];
  if (raw === undefined) return undefined;
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new UsageError(`--${name} requires a number between ${min} and ${max}.`);
  }
  return value;
}

class UsageError extends Error {}

const ngnFormat = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`;

async function runDcpmi(args) {
  const { estimateDerivedDataSubjects, estimateStatutoryCeiling } = await import('@tantainnovative/ndpr-toolkit/server');
  const direct = parseNumberFlag(args, 'direct');
  if (direct === undefined) throw new UsageError('ndpr dcpmi requires --direct <n>.');
  const relationsRaw = typeof args.flags.relations === 'string' ? args.flags.relations : '';
  const relationships = relationsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((spec) => {
      const [kind, per, coverage] = spec.split(':');
      const entry = { kind, perDirectSubject: Number(per) };
      if (coverage !== undefined) entry.coverage = Number(coverage);
      return entry;
    });
  const overlapShare = parseNumberFlag(args, 'overlap', { max: 1 });
  const revenue = parseNumberFlag(args, 'revenue');

  let result;
  try {
    result = estimateDerivedDataSubjects({ directSubjects: direct, relationships, overlapShare });
  } catch (err) {
    throw new UsageError(err.message);
  }
  const ceiling = revenue === undefined
    ? undefined
    : estimateStatutoryCeiling({ annualGrossRevenueNGN: revenue, majorImportance: result.tiers.declared.isDCPMI });

  if (args.flags.json) {
    process.stdout.write(JSON.stringify({ ...result, ceiling }, null, 2) + '\n');
    return 0;
  }
  const lines = [
    'Derived data-subject estimate (advisory)',
    '',
    `Direct subjects:            ${direct.toLocaleString('en-NG')}  -> tier ${result.tiers.declared.tier}`,
    `Third-party subjects:       ${result.derived.estimated.toLocaleString('en-NG')} (range ${result.derived.low.toLocaleString('en-NG')}-${result.derived.high.toLocaleString('en-NG')})`,
    `Direct plus third-party:    ${result.directPlusDerived.estimated.toLocaleString('en-NG')}  -> tier ${result.tiers.withDerived.tier}`,
    '',
    ...result.relationships.map((r) => `  ${r.label.padEnd(26)}${r.estimated.toLocaleString('en-NG')}`),
    '',
    ...result.notes.map((n) => `- ${n}`),
  ];
  if (ceiling) {
    lines.push('', `Statutory ceiling (${ceiling.citation}): ${ngnFormat(ceiling.ceilingNGN)} (${ceiling.basis} basis)`, ceiling.notice);
  }
  lines.push('', result.advisoryNotice);
  process.stdout.write(lines.join('\n') + '\n');
  return 0;
}

const LEVELS = ['low', 'medium', 'high'];
const PII_TYPES = ['phone_ng', 'national_id', 'nuban', 'payment_card', 'cac_number', 'vehicle_plate', 'email'];
// RFC 2606 / RFC 6761 reserved names: documentation addresses, not real people.
const RESERVED_EMAIL_DOMAIN = /@(?:[^@\s]+\.)?(?:example\.(?:com|org|net)|[^@\s]*\.(?:test|example|invalid|localhost))$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', 'out', 'coverage', 'build', '.turbo']);
const MAX_FILE_BYTES = 1024 * 1024;

function collectFiles(target, out) {
  let stat;
  try { stat = statSync(target); } catch { return; }
  if (stat.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (SKIP_DIRS.has(entry)) continue;
      collectFiles(join(target, entry), out);
    }
  } else if (stat.isFile() && stat.size <= MAX_FILE_BYTES) {
    out.push(target);
  }
}

function levelFlag(args, name, fallback) {
  const value = args.flags[name] ?? fallback;
  if (!LEVELS.includes(value)) throw new UsageError(`--${name} must be one of ${LEVELS.join(', ')}.`);
  return value;
}

async function runScan(args) {
  const { detectNigerianPII, maskValue } = await import('@tantainnovative/ndpr-toolkit/server');
  const failOn = levelFlag(args, 'fail-on', 'high');
  const minConfidence = levelFlag(args, 'min-confidence', 'medium');
  const types = typeof args.flags.types === 'string'
    ? args.flags.types.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;
  const unknownType = types?.find((t) => !PII_TYPES.includes(t));
  if (unknownType) throw new UsageError(`Unknown --types entry "${unknownType}". Use: ${PII_TYPES.join(', ')}.`);
  const includeExamples = args.flags['include-example-domains'] === true;
  const targets = args._.slice(1);
  const files = [];
  for (const t of targets.length ? targets : ['.']) collectFiles(resolve(process.cwd(), t), files);

  const findings = [];
  for (const file of files) {
    const buf = readFileSync(file);
    if (buf.includes(0)) continue; // binary
    const text = buf.toString('utf8');
    for (const m of detectNigerianPII(text, { minConfidence, types })) {
      if (m.type === 'email' && !includeExamples && RESERVED_EMAIL_DOMAIN.test(m.value)) continue;
      const line = text.slice(0, m.start).split('\n').length;
      findings.push({
        file: relative(process.cwd(), file),
        line,
        type: m.type,
        confidence: m.confidence,
        masked: maskValue(m.value.replace(/\s/g, ''), 2),
        reason: m.reason,
      });
    }
  }

  const failing = findings.filter((f) => LEVELS.indexOf(f.confidence) >= LEVELS.indexOf(failOn));
  if (args.flags.json) {
    process.stdout.write(JSON.stringify({ scannedFiles: files.length, findings }, null, 2) + '\n');
  } else {
    for (const f of findings) {
      process.stdout.write(`${f.file}:${f.line}  ${f.type.padEnd(13)} ${f.confidence.padEnd(6)} ${f.masked}  (${f.reason})\n`);
    }
    process.stdout.write(`\nScanned ${files.length} file(s): ${findings.length} finding(s), ${failing.length} at or above "${failOn}".\n`);
  }
  return failing.length > 0 ? 1 : 0;
}

const withUsage = (fn) => (args) => fn(args).catch((err) => {
  if (err instanceof UsageError) { process.stderr.write(`${err.message}\n`); return 2; }
  throw err;
});

const EXTRA_COMMANDS = {
  dcpmi: withUsage(runDcpmi),
  scan: withUsage(runScan),
};

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

  const extra = EXTRA_COMMANDS[command];
  if (extra) return extra(args);

  if (command !== 'audit') {
    process.stderr.write(`Unknown command: ${command}\n\n${HELP}\n`);
    return 2;
  }

  if (args.flags.init) {
    const out = resolve(process.cwd(), 'ndpr.audit.json');
    // Write with 'wx' rather than checking existsSync first and writing
    // second. That check-then-write pattern is a TOCTOU race: a file created
    // in the window between the two calls is silently overwritten, which
    // defeats the very guard below. 'wx' makes the refusal atomic — the open
    // fails with EEXIST and nothing is written.
    try {
      writeFileSync(out, JSON.stringify(STARTER_CONFIG, null, 2) + '\n', { flag: 'wx' });
    } catch (err) {
      if (err?.code === 'EEXIST') {
        process.stderr.write(`Refusing to overwrite existing ${out}\n`);
        return 1;
      }
      throw err;
    }
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
  const {
    runNdprAudit,
    formatNdprAuditReport,
    validateNdprAuditConfig,
  } = await import('@tantainnovative/ndpr-toolkit/server');

  const validation = validateNdprAuditConfig(config);
  if (!validation.valid) {
    process.stderr.write(`Invalid audit config ${configPath}:\n`);
    for (const error of validation.errors) {
      process.stderr.write(`  - ${error.path}: ${error.message}\n`);
    }
    return 2;
  }

  const options = { ...(config.options ?? {}) };
  if (args.flags['min-score'] !== undefined) {
    const raw = args.flags['min-score'];
    const minScore = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
    if (!Number.isFinite(minScore) || minScore < 0 || minScore > 100) {
      process.stderr.write('--min-score requires a numeric value between 0 and 100.\n');
      return 2;
    }
    options.minScore = minScore;
  } else if (config.minScore !== undefined) {
    options.minScore = config.minScore;
  }

  const result = runNdprAudit(
    {
      compliance: config.compliance,
      dcpmi: config.dcpmi,
      car: config.car,
      breaches: config.breaches,
      breachEvidence: config.breachEvidence,
    },
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
