/**
 * Aggregate NDPA 2023 compliance audit — combines the compliance-score engine
 * with the GAID 2025 DCPMI classifier, Compliance Audit Returns scheduler, and
 * breach-notification checker into a single pass/fail result suitable for CI.
 *
 * Pure and React-free: drive it from a config file via the `ndpr audit` CLI, a
 * CI job, or a server route. Not legal advice — verify against current NDPC
 * guidance.
 */

import { getComplianceScore } from './compliance-score';
import type { ComplianceInput, ComplianceReport, ComplianceRating } from './compliance-score';
import { classifyDCPMI } from './dcpmi';
import type { DCPMIInput, DCPMIClassificationOptions, DCPMIClassification } from './dcpmi';
import { generateComplianceAuditReturn } from './car';
import type { CARInput, CAROptions, ComplianceAuditReturn } from './car';
import { assessBreachNotification } from './breach-notification';
import type { BreachNotificationOptions, BreachNotificationAssessment } from './breach-notification';
import type { BreachReport } from '../types/breach';

export interface NdprAuditInput {
  /** Compliance posture across the 8 NDPA modules. */
  compliance: ComplianceInput;
  /** Optional DCPMI classification input (GAID 2025 registration). */
  dcpmi?: DCPMIInput;
  /** Optional Compliance Audit Returns scheduling input. */
  car?: CARInput;
  /** Optional breach reports to check against the S. 40 / Article 33 duty. */
  breaches?: BreachReport[];
}

export interface NdprAuditOptions {
  /** Minimum overall compliance score required to pass. Default 70. */
  minScore?: number;
  dcpmiOptions?: DCPMIClassificationOptions;
  carOptions?: CAROptions;
  breachOptions?: BreachNotificationOptions;
}

export type AuditCheckStatus = 'pass' | 'warn' | 'fail';

export interface AuditCheck {
  id: string;
  label: string;
  status: AuditCheckStatus;
  detail: string;
}

export interface NdprAuditResult {
  /** True when the score meets `minScore` and no check is a hard failure. */
  passed: boolean;
  score: number;
  rating: ComplianceRating;
  minScore: number;
  checks: AuditCheck[];
  compliance: ComplianceReport;
  dcpmi?: DCPMIClassification;
  car?: ComplianceAuditReturn;
  breaches: Array<{ id: string; title: string; assessment: BreachNotificationAssessment }>;
  summary: { pass: number; warn: number; fail: number };
  generatedAt: string;
}

const ngn = (n: number): string => `₦${n.toLocaleString('en-NG')}`;

/**
 * Run the aggregate NDPA compliance audit.
 */
export function runNdprAudit(input: NdprAuditInput, options: NdprAuditOptions = {}): NdprAuditResult {
  const minScore = options.minScore ?? 70;
  const compliance = getComplianceScore(input.compliance);
  const checks: AuditCheck[] = [];

  // Overall compliance score.
  checks.push({
    id: 'compliance-score',
    label: 'Overall compliance score',
    status: compliance.score >= minScore ? 'pass' : 'fail',
    detail: `${compliance.score}/100 (${compliance.rating}); minimum ${minScore}.`,
  });

  // Critical gaps hard-fail; high-priority gaps warn.
  for (const rec of compliance.recommendations) {
    if (rec.priority !== 'critical' && rec.priority !== 'high') continue;
    checks.push({
      id: `gap:${rec.module}:${rec.key}`,
      label: `${rec.label} (${rec.ndpaSection})`,
      status: rec.priority === 'critical' ? 'fail' : 'warn',
      detail: rec.recommendation,
    });
  }

  // DCPMI registration.
  let dcpmi: DCPMIClassification | undefined;
  if (input.dcpmi) {
    dcpmi = classifyDCPMI(input.dcpmi, options.dcpmiOptions);
    checks.push({
      id: 'dcpmi',
      label: 'DCPMI registration (GAID 2025)',
      status: dcpmi.tier === 'listed' ? 'warn' : 'pass',
      detail: dcpmi.isDCPMI
        ? `${dcpmi.tier} — ${ngn(dcpmi.annualFeeNGN)}/yr; ${dcpmi.registration.renewsAnnually ? 'renew registration annually' : 'register once + file CAR annually'}.`
        : 'Not a Data Controller/Processor of Major Importance by volume.',
    });
  }

  // Compliance Audit Returns schedule.
  let car: ComplianceAuditReturn | undefined;
  if (input.car) {
    car = generateComplianceAuditReturn(input.car, options.carOptions);
    const days = car.status.daysUntilNextDeadline;
    checks.push({
      id: 'car',
      label: 'Compliance Audit Returns (NDPC GAID 2025)',
      status: !car.applicable ? 'pass' : car.status.initialAuditDue || days <= 30 ? 'warn' : 'pass',
      detail: car.applicable
        ? `Next filing ${car.schedule.nextFilingDeadline} (${days} day(s)); initial audit due ${car.schedule.initialAuditDueDate}.`
        : 'CAR does not apply (not a DCPMI).',
    });
  }

  // Breach notifications.
  const breaches = (input.breaches ?? []).map((report) => ({
    id: report.id,
    title: report.title,
    assessment: assessBreachNotification(report, options.breachOptions),
  }));
  for (const b of breaches) {
    const a = b.assessment;
    const status: AuditCheckStatus = a.timing.overdue ? 'fail' : a.complete ? 'pass' : 'warn';
    const timing = Number.isFinite(a.timing.deadline)
      ? a.timing.overdue
        ? `${Math.abs(a.timing.hoursRemaining)}h overdue`
        : `${Math.max(0, a.timing.hoursRemaining)}h remaining`
      : 'discovery date not set';
    checks.push({
      id: `breach:${b.id}`,
      label: `Breach notification — ${b.title} (NDPA S. 40)`,
      status,
      detail: `${a.completeness}% complete; ${timing}.`,
    });
  }

  const summary = {
    pass: checks.filter((c) => c.status === 'pass').length,
    warn: checks.filter((c) => c.status === 'warn').length,
    fail: checks.filter((c) => c.status === 'fail').length,
  };
  const passed = compliance.score >= minScore && summary.fail === 0;

  return {
    passed,
    score: compliance.score,
    rating: compliance.rating,
    minScore,
    checks,
    compliance,
    dcpmi,
    car,
    breaches,
    summary,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}

const SYMBOL: Record<AuditCheckStatus, string> = { pass: '✓', warn: '!', fail: '✗' };
const COLOR: Record<AuditCheckStatus, string> = { pass: '\x1b[32m', warn: '\x1b[33m', fail: '\x1b[31m' };
const RESET = '\x1b[0m';

export interface FormatAuditReportOptions {
  /** Wrap status symbols in ANSI colour codes. Default false. */
  color?: boolean;
}

/**
 * Render an `NdprAuditResult` as a plain-text report.
 */
export function formatNdprAuditReport(result: NdprAuditResult, options: FormatAuditReportOptions = {}): string {
  const paint = (s: AuditCheckStatus, text: string) =>
    options.color ? `${COLOR[s]}${text}${RESET}` : text;

  const lines: string[] = [];
  lines.push('NDPA 2023 Compliance Audit');
  lines.push(`Generated ${result.generatedAt}`);
  lines.push('');
  lines.push(`Compliance score: ${result.score}/100 (${result.rating}) — minimum ${result.minScore}`);
  lines.push('');
  for (const c of result.checks) {
    lines.push(`${paint(c.status, SYMBOL[c.status])} ${c.label}`);
    lines.push(`    ${c.detail}`);
  }
  lines.push('');
  lines.push(`${result.summary.pass} passed, ${result.summary.warn} warning(s), ${result.summary.fail} failed`);
  lines.push(paint(result.passed ? 'pass' : 'fail', `Verdict: ${result.passed ? 'PASS' : 'FAIL'}`));
  return lines.join('\n');
}
