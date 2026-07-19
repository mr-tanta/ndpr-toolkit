/**
 * Aggregate NDPA implementation-readiness audit.
 *
 * Combines compliance scoring, DCPMI classification, CAR evidence, and
 * per-breach notification evidence. A PASS means the supplied, correlated
 * evidence satisfies this recorded ruleset — it is not a legal opinion.
 */

import { getComplianceScore } from './compliance-score';
import type {
  ComplianceInput,
  ComplianceReport,
  ComplianceRating,
  ComplianceScoreOptions,
} from './compliance-score';
import { classifyDCPMI } from './dcpmi';
import type { DCPMIInput, DCPMIClassificationOptions, DCPMIClassification } from './dcpmi';
import { generateComplianceAuditReturn } from './car';
import type { CARInput, CAROptions, ComplianceAuditReturn } from './car';
import {
  assessBreachNotification,
  validateBreachNotificationEvidence,
  validateBreachReportChronology,
} from './breach-notification';
import type { BreachNotificationOptions, BreachNotificationAssessment } from './breach-notification';
import type { BreachReport, RiskAssessment, RegulatoryNotification } from '../types/breach';

export interface BreachAuditEvidence {
  assessment?: RiskAssessment;
  notification?: RegulatoryNotification;
  highRisk?: true;
  notificationRequired?: true;
}

export interface NdprAuditInput {
  compliance: ComplianceInput;
  dcpmi?: DCPMIInput;
  car?: CARInput;
  breaches?: BreachReport[];
  /** Evidence keyed by breach ID; prevents one notification being reused globally. */
  breachEvidence?: Record<string, BreachAuditEvidence>;
}

export type NdprAuditScope = 'dcpmi' | 'car' | 'breaches';

export interface NdprAuditOptions {
  minScore?: number;
  complianceOptions?: ComplianceScoreOptions;
  dcpmiOptions?: DCPMIClassificationOptions;
  carOptions?: CAROptions;
  /** Shared timing defaults. Evidence fields are only accepted for one breach. */
  breachOptions?: BreachNotificationOptions;
  /** Per-breach overrides keyed by BreachReport.id. */
  breachOptionsById?: Record<string, BreachNotificationOptions>;
  /** Scopes that must be supplied for this organisation's CI policy. */
  requiredScopes?: NdprAuditScope[];
}

export type AuditCheckStatus = 'pass' | 'warn' | 'fail';

export interface AuditCheck {
  id: string;
  label: string;
  status: AuditCheckStatus;
  detail: string;
}

export interface NdprAuditResult {
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
  provenance: {
    auditRulesetId: string;
    auditRulesetVersion: string;
    compliance: ComplianceReport['provenance'];
  };
  advisoryNotice: string;
}

export interface AuditConfigValidationError {
  path: string;
  message: string;
}

export interface AuditConfigValidationResult {
  valid: boolean;
  errors: AuditConfigValidationError[];
}

export const DEFAULT_AUDIT_RULESET = {
  id: 'ndpr-toolkit-aggregate-readiness',
  version: '2026.07',
} as const;

const ngn = (value: number): string => `₦${value.toLocaleString('en-NG')}`;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isRealISODate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const CAR_TIERS = new Set(['UHL', 'EHL', 'OHL', 'listed', 'none']);

/** Inspect an untrusted config without reading properties through getters. */
function inspectJsonStructure(value: unknown): AuditConfigValidationError[] {
  const errors: AuditConfigValidationError[] = [];
  const seen = new WeakSet<object>();
  const add = (path: string, message: string) => errors.push({ path, message });
  const childPath = (path: string, key: string) => path === '$' ? key : `${path}.${key}`;

  const visit = (input: unknown, path: string): void => {
    if (typeof input !== 'object' || input === null) return;
    if (seen.has(input)) {
      add(path, 'Must not contain cycles or repeated object references.');
      return;
    }
    seen.add(input);

    if (Array.isArray(input)) {
      if (Object.getPrototypeOf(input) !== Array.prototype) {
        add(path, 'Arrays must use the standard Array prototype.');
        return;
      }
      for (let index = 0; index < input.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(input, String(index));
        const itemPath = childPath(path, String(index));
        if (!descriptor?.enumerable || !('value' in descriptor)) {
          add(itemPath, 'Array entries must be enumerable data properties.');
        } else {
          visit(descriptor.value, itemPath);
        }
      }
      for (const key of Reflect.ownKeys(input)) {
        if (key === 'length') continue;
        const isCanonicalIndex = typeof key === 'string'
          && /^(0|[1-9]\d*)$/.test(key)
          && Number(key) < input.length;
        if (!isCanonicalIndex) {
          add(childPath(path, String(key)), 'Arrays must not contain named or symbol properties.');
        }
      }
      return;
    }

    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      add(path, 'Must be a plain object or null-prototype record.');
      return;
    }
    for (const key of Reflect.ownKeys(input)) {
      const propertyPath = childPath(path, String(key));
      if (typeof key !== 'string') {
        add(propertyPath, 'Symbol properties are not valid JSON configuration.');
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (!descriptor?.enumerable || !('value' in descriptor)) {
        add(propertyPath, 'Must be an enumerable data property.');
        continue;
      }
      visit(descriptor.value, propertyPath);
    }
  };

  visit(value, '$');
  return errors;
}

/** Strict structural validation for JSON audit configuration. */
export function validateNdprAuditConfig(value: unknown): AuditConfigValidationResult {
  const errors: AuditConfigValidationError[] = [];
  const add = (path: string, message: string) => errors.push({ path, message });
  if (!isRecord(value)) return { valid: false, errors: [{ path: '$', message: 'Config must be an object.' }] };
  const structuralErrors = inspectJsonStructure(value);
  if (structuralErrors.length > 0) return { valid: false, errors: structuralErrors };

  const validateBooleanFields = (path: string, input: unknown, fields: string[]) => {
    if (!isRecord(input)) {
      add(path, 'Must be an object.');
      return;
    }
    for (const field of fields) {
      if (!isBoolean(input[field])) add(`${path}.${field}`, 'Must be a boolean.');
    }
  };

  const compliance = value.compliance;
  if (!isRecord(compliance)) {
    add('compliance', 'Must be an object.');
  } else {
    validateBooleanFields('compliance.consent', compliance.consent, [
      'hasConsentMechanism', 'hasPurposeSpecification', 'hasWithdrawalMechanism',
      'hasMinorProtection', 'consentRecordsRetained',
    ]);
    validateBooleanFields('compliance.dsr', compliance.dsr, [
      'hasRequestMechanism', 'supportsAccess', 'supportsRectification', 'supportsErasure',
      'supportsPortability', 'supportsObjection',
    ]);
    if (isRecord(compliance.dsr)) {
      const days = compliance.dsr.responseTimelineDays;
      if (!isFiniteNumber(days) || days < 0) add('compliance.dsr.responseTimelineDays', 'Must be a non-negative number.');
    }
    validateBooleanFields('compliance.dpia', compliance.dpia, [
      'conductedForHighRisk', 'documentedRisks', 'mitigationMeasures',
    ]);
    validateBooleanFields('compliance.breach', compliance.breach, [
      'hasNotificationProcess', 'notifiesWithin72Hours', 'hasRiskAssessment', 'hasRecordKeeping',
    ]);
    validateBooleanFields('compliance.policy', compliance.policy, [
      'hasPrivacyPolicy', 'isPubliclyAccessible', 'coversAllSections',
    ]);
    if (isRecord(compliance.policy) && !isText(compliance.policy.lastUpdated)) {
      add('compliance.policy.lastUpdated', 'Must be a non-empty YYYY-MM-DD string.');
    }
    validateBooleanFields('compliance.lawfulBasis', compliance.lawfulBasis, [
      'documentedForAllProcessing', 'hasLegitimateInterestAssessment',
    ]);
    validateBooleanFields('compliance.crossBorder', compliance.crossBorder, [
      'hasTransferMechanisms', 'adequacyAssessed', 'ndpcApprovalObtained',
    ]);
    validateBooleanFields('compliance.ropa', compliance.ropa, ['maintained', 'includesAllProcessing']);
    if (isRecord(compliance.ropa) && !isText(compliance.ropa.lastReviewed)) {
      add('compliance.ropa.lastReviewed', 'Must be a non-empty YYYY-MM-DD string.');
    }
  }

  const configOptions = isRecord(value.options) ? value.options : undefined;
  if (value.options !== undefined && !configOptions) add('options', 'Must be an object.');

  for (const [path, minScore] of [
    ['minScore', value.minScore],
    ['options.minScore', configOptions?.minScore],
  ] as const) {
    if (minScore !== undefined && (!isFiniteNumber(minScore) || minScore < 0 || minScore > 100)) {
      add(path, 'Must be a number from 0 to 100.');
    }
  }

  const validateBreachTimingOptions = (path: string, input: Record<string, unknown>) => {
    if (
      input.asOf !== undefined
      && (!isFiniteNumber(input.asOf) || input.asOf < 0)
    ) {
      add(`${path}.asOf`, 'Must be a finite, non-negative epoch timestamp.');
    }
    if (
      input.deadlineHours !== undefined
      && (!isFiniteNumber(input.deadlineHours) || input.deadlineHours <= 0)
    ) {
      add(`${path}.deadlineHours`, 'Must be a positive number.');
    }
    for (const field of ['highRisk', 'notificationRequired'] as const) {
      if (input[field] !== undefined && input[field] !== true) {
        add(
          `${path}.${field}`,
          'Only true is accepted as a force-on override; use complete correlated assessment evidence to establish false.',
        );
      }
    }
  };

  const sharedBreachOptions = configOptions?.breachOptions;
  if (sharedBreachOptions !== undefined && !isRecord(sharedBreachOptions)) {
    add('options.breachOptions', 'Must be an object.');
  } else if (isRecord(sharedBreachOptions)) {
    validateBreachTimingOptions('options.breachOptions', sharedBreachOptions);
  }

  const breachOptionsById = configOptions?.breachOptionsById;
  if (breachOptionsById !== undefined && !isRecord(breachOptionsById)) {
    add('options.breachOptionsById', 'Must be an object keyed by breach ID.');
  } else if (isRecord(breachOptionsById)) {
    for (const [breachId, perBreachOptions] of Object.entries(breachOptionsById)) {
      const path = `options.breachOptionsById.${breachId}`;
      if (!isRecord(perBreachOptions)) add(path, 'Must be an object.');
      else validateBreachTimingOptions(path, perBreachOptions);
    }
  }

  const carOptions = configOptions?.carOptions;
  if (carOptions !== undefined && !isRecord(carOptions)) {
    add('options.carOptions', 'Must be an object.');
  } else if (isRecord(carOptions)) {
    if (carOptions.annualDeadline !== undefined) {
      if (!isRecord(carOptions.annualDeadline)) {
        add('options.carOptions.annualDeadline', 'Must be an object.');
      } else {
        const { month, day } = carOptions.annualDeadline;
        if (!Number.isInteger(month) || (month as number) < 1 || (month as number) > 12) {
          add('options.carOptions.annualDeadline.month', 'Must be an integer from 1 to 12.');
        }
        if (!Number.isInteger(day) || (day as number) < 1 || (day as number) > 31) {
          add('options.carOptions.annualDeadline.day', 'Must be an integer from 1 to 31.');
        }
      }
    }
    if (
      carOptions.initialAuditWithinMonths !== undefined
      && (!Number.isInteger(carOptions.initialAuditWithinMonths)
        || (carOptions.initialAuditWithinMonths as number) <= 0)
    ) {
      add('options.carOptions.initialAuditWithinMonths', 'Must be a positive integer.');
    }
    if (carOptions.deadlineOverrides !== undefined) {
      if (!isRecord(carOptions.deadlineOverrides)) {
        add('options.carOptions.deadlineOverrides', 'Must be an object keyed by four-digit year.');
      } else {
        for (const [yearText, deadline] of Object.entries(carOptions.deadlineOverrides)) {
          const year = Number(yearText);
          const path = `options.carOptions.deadlineOverrides.${yearText}`;
          if (!Number.isInteger(year) || year < 2000 || year > 9999) {
            add(path, 'Key must be a four-digit year.');
          }
          if (!isRealISODate(deadline)) {
            add(path, 'Must be a real YYYY-MM-DD calendar date.');
          } else if (deadline.slice(0, 4) !== yearText) {
            add(path, `Must fall within year ${yearText}.`);
          }
        }
      }
    }
    for (const field of ['rulesetId', 'rulesetVersion'] as const) {
      if (carOptions[field] !== undefined && !isText(carOptions[field])) {
        add(`options.carOptions.${field}`, 'Must be a non-empty string.');
      }
    }
    if (
      carOptions.rulesetEffectiveDate !== undefined
      && !isRealISODate(carOptions.rulesetEffectiveDate)
    ) {
      add('options.carOptions.rulesetEffectiveDate', 'Must be a real YYYY-MM-DD calendar date.');
    }
  }

  if (value.dcpmi !== undefined) {
    if (!isRecord(value.dcpmi)) add('dcpmi', 'Must be an object.');
    else {
      if (value.dcpmi.dataSubjectsInSixMonths !== undefined) {
        const count = value.dcpmi.dataSubjectsInSixMonths;
        if (!isFiniteNumber(count) || count < 0) add('dcpmi.dataSubjectsInSixMonths', 'Must be a non-negative number.');
      }
      if (value.dcpmi.isDesignated !== undefined && !isBoolean(value.dcpmi.isDesignated)) {
        add('dcpmi.isDesignated', 'Must be a boolean.');
      }
    }
  }

  if (value.car !== undefined) {
    if (!isRecord(value.car)) {
      add('car', 'Must be an object.');
    } else {
      const carErrorStart = errors.length;
      const commencementDate = value.car.commencementDate;
      const carAsOf = value.car.asOf ?? new Date().toISOString().slice(0, 10);

      if (!isRealISODate(commencementDate)) {
        add('car.commencementDate', 'Must be a real YYYY-MM-DD calendar date.');
      }
      if (value.car.asOf !== undefined && !isRealISODate(value.car.asOf)) {
        add('car.asOf', 'Must be a real YYYY-MM-DD calendar date.');
      }
      if (value.car.tier !== undefined && !CAR_TIERS.has(String(value.car.tier))) {
        add('car.tier', 'Must be UHL, EHL, OHL, listed, or none.');
      }
      if (
        value.car.initialAuditCompletedAt !== undefined
        && !isRealISODate(value.car.initialAuditCompletedAt)
      ) {
        add('car.initialAuditCompletedAt', 'Must be a real YYYY-MM-DD calendar date.');
      } else if (
        isRealISODate(value.car.initialAuditCompletedAt)
        && isRealISODate(commencementDate)
        && value.car.initialAuditCompletedAt < commencementDate
      ) {
        add('car.initialAuditCompletedAt', 'Must not be earlier than commencementDate.');
      } else if (
        isRealISODate(value.car.initialAuditCompletedAt)
        && isRealISODate(carAsOf)
        && value.car.initialAuditCompletedAt > carAsOf
      ) {
        add('car.initialAuditCompletedAt', 'Must not be later than asOf.');
      }

      if (value.car.filings !== undefined && !Array.isArray(value.car.filings)) {
        add('car.filings', 'Must be an array.');
      } else if (Array.isArray(value.car.filings)) {
        const filingYears = new Set<number>();
        value.car.filings.forEach((filing, index) => {
          const path = `car.filings.${index}`;
          if (!isRecord(filing)) {
            add(path, 'Must be an object.');
            return;
          }
          if (!Number.isSafeInteger(filing.year) || (filing.year as number) < 2000 || (filing.year as number) > 9999) {
            add(`${path}.year`, 'Must be a four-digit integer year.');
          } else if (filingYears.has(filing.year as number)) {
            add(`${path}.year`, 'Each filing year may appear at most once.');
          } else {
            filingYears.add(filing.year as number);
          }
          if (!isRealISODate(filing.filedAt)) {
            add(`${path}.filedAt`, 'Must be a real YYYY-MM-DD calendar date.');
          } else if (isRealISODate(commencementDate) && filing.filedAt < commencementDate) {
            add(`${path}.filedAt`, 'Must not be earlier than commencementDate.');
          } else if (isRealISODate(carAsOf) && filing.filedAt > carAsOf) {
            add(`${path}.filedAt`, 'Must not be later than asOf.');
          }
          if (filing.referenceNumber !== undefined && !isText(filing.referenceNumber)) {
            add(`${path}.referenceNumber`, 'Must be a non-empty string when provided.');
          }
          if (filing.acknowledgedAt !== undefined && !isRealISODate(filing.acknowledgedAt)) {
            add(`${path}.acknowledgedAt`, 'Must be a real YYYY-MM-DD calendar date.');
          } else if (
            isRealISODate(filing.acknowledgedAt)
            && isRealISODate(filing.filedAt)
            && filing.acknowledgedAt < filing.filedAt
          ) {
            add(`${path}.acknowledgedAt`, 'Must not be earlier than filedAt.');
          } else if (
            isRealISODate(filing.acknowledgedAt)
            && isRealISODate(carAsOf)
            && filing.acknowledgedAt > carAsOf
          ) {
            add(`${path}.acknowledgedAt`, 'Must not be later than asOf.');
          }
        });
      }

      if (errors.length === carErrorStart) {
        try {
          generateComplianceAuditReturn(
            value.car as unknown as CARInput,
            (isRecord(carOptions) ? carOptions : {}) as unknown as CAROptions,
          );
        } catch (error) {
          add('car', error instanceof Error ? error.message : 'Invalid CAR input.');
        }
      }
    }
  }

  const breachContexts = new Map<string, {
    id: string;
    index: number;
    report: Record<string, unknown>;
  }>();
  if (value.breaches !== undefined) {
    if (!Array.isArray(value.breaches)) add('breaches', 'Must be an array.');
    else value.breaches.forEach((breach, index) => {
      const path = `breaches.${index}`;
      if (!isRecord(breach)) {
        add(path, 'Must be an object.');
        return;
      }
      for (const field of ['id', 'title', 'description', 'category']) {
        if (!isText(breach[field])) add(`${path}.${field}`, 'Must be a non-empty string.');
      }
      if (!isRecord(breach.reporter)) add(`${path}.reporter`, 'Must be an object.');
      if (!Array.isArray(breach.affectedSystems)) add(`${path}.affectedSystems`, 'Must be an array.');
      if (!Array.isArray(breach.dataTypes)) add(`${path}.dataTypes`, 'Must be an array.');
      if (!['ongoing', 'contained', 'resolved'].includes(String(breach.status))) {
        add(`${path}.status`, 'Must be ongoing, contained, or resolved.');
      }

      if (isText(breach.id)) {
        if (breachContexts.has(breach.id)) add(`${path}.id`, 'Breach IDs must be unique.');
        else breachContexts.set(breach.id, { id: breach.id, index, report: breach });
      }
    });
  }

  const validationNow = Date.now();
  const sharedOptionsRecord = isRecord(sharedBreachOptions) ? sharedBreachOptions : undefined;
  const byIdOptionsRecord = isRecord(breachOptionsById) ? breachOptionsById : undefined;
  const effectiveAsOf = (breachId: string): number => {
    const perBreach = isRecord(byIdOptionsRecord?.[breachId]) ? byIdOptionsRecord[breachId] : undefined;
    const candidate = perBreach?.asOf ?? sharedOptionsRecord?.asOf;
    return isFiniteNumber(candidate) && candidate >= 0 ? candidate : validationNow;
  };

  for (const context of breachContexts.values()) {
    const chronology = validateBreachReportChronology(
      context.report,
      effectiveAsOf(context.id),
    );
    for (const error of chronology) {
      add(`breaches.${context.index}.${error.path}`, error.message);
    }
  }

  const validateEvidence = (
    path: string,
    input: Record<string, unknown>,
    context: { id: string; index: number; report: Record<string, unknown> },
  ) => {
    const asOf = effectiveAsOf(context.id);
    const validation = validateBreachNotificationEvidence(
      {
        id: context.id,
        discoveredAt: context.report.discoveredAt as number,
      },
      input as unknown as BreachNotificationOptions,
      asOf,
    );
    for (const error of validation.errors) add(`${path}.${error.path}`, error.message);
  };

  if (value.breachEvidence !== undefined) {
    if (!isRecord(value.breachEvidence)) {
      add('breachEvidence', 'Must be an object keyed by breach ID.');
    } else {
      for (const [breachId, evidence] of Object.entries(value.breachEvidence)) {
        const path = `breachEvidence.${breachId}`;
        const context = breachContexts.get(breachId);
        if (!context) add(path, 'Must reference a supplied breach ID.');
        if (!isRecord(evidence)) add(path, 'Must be an object.');
        else if (context) validateEvidence(path, evidence, context);
      }
    }
  }

  if (byIdOptionsRecord) {
    for (const [breachId, perBreachOptions] of Object.entries(byIdOptionsRecord)) {
      const path = `options.breachOptionsById.${breachId}`;
      const context = breachContexts.get(breachId);
      if (!context) add(path, 'Must reference a supplied breach ID.');
      if (isRecord(perBreachOptions) && context) validateEvidence(path, perBreachOptions, context);
    }
  }

  if (sharedOptionsRecord) {
    const hasGlobalEvidence = sharedOptionsRecord.assessment !== undefined
      || sharedOptionsRecord.notification !== undefined
      || sharedOptionsRecord.highRisk !== undefined
      || sharedOptionsRecord.notificationRequired !== undefined;
    if (hasGlobalEvidence && breachContexts.size !== 1) {
      add(
        'options.breachOptions',
        'Global assessment/notification evidence requires exactly one supplied breach.',
      );
    } else if (breachContexts.size === 1) {
      validateEvidence(
        'options.breachOptions',
        sharedOptionsRecord,
        [...breachContexts.values()][0],
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

export function runNdprAudit(input: NdprAuditInput, options: NdprAuditOptions = {}): NdprAuditResult {
  const minScore = options.minScore ?? 70;
  if (!Number.isFinite(minScore) || minScore < 0 || minScore > 100) {
    throw new RangeError('minScore must be a number from 0 to 100.');
  }

  const compliance = getComplianceScore(input.compliance, options.complianceOptions);
  const checks: AuditCheck[] = [];
  checks.push({
    id: 'compliance-score',
    label: 'Overall implementation-readiness score',
    status: compliance.score >= minScore ? 'pass' : 'fail',
    detail: `${compliance.score}/100 (${compliance.rating}); minimum ${minScore}; ruleset ${compliance.provenance.rulesetVersion}.`,
  });

  for (const recommendation of compliance.recommendations) {
    if (recommendation.priority !== 'critical' && recommendation.priority !== 'high') continue;
    checks.push({
      id: `gap:${recommendation.module}:${recommendation.key}`,
      label: `${recommendation.label} (${recommendation.ndpaSection})`,
      status: recommendation.priority === 'critical' ? 'fail' : 'warn',
      detail: recommendation.recommendation,
    });
  }

  for (const scope of options.requiredScopes ?? []) {
    const supplied = scope === 'breaches'
      ? input.breaches !== undefined
      : input[scope] !== undefined;
    if (!supplied) {
      checks.push({
        id: `scope:${scope}`,
        label: `Required audit scope — ${scope}`,
        status: 'fail',
        detail: `The organisation's audit policy requires ${scope} input, but none was supplied.`,
      });
    }
  }

  let dcpmi: DCPMIClassification | undefined;
  if (input.dcpmi) {
    dcpmi = classifyDCPMI(input.dcpmi, options.dcpmiOptions);
    checks.push({
      id: 'dcpmi',
      label: 'DCPMI designation',
      status: dcpmi.tier === 'listed' ? 'warn' : 'pass',
      detail: dcpmi.isDCPMI
        ? `${dcpmi.tier} — ${ngn(dcpmi.annualFeeNGN)}/yr under ruleset ${dcpmi.provenance.rulesetVersion}.`
        : `Not volume-classified as a DCPMI under ruleset ${dcpmi.provenance.rulesetVersion}.`,
    });
    if (dcpmi.compliance.auditReturnsAnnual && !input.car) {
      checks.push({
        id: 'car-required',
        label: 'Compliance Audit Return evidence required',
        status: 'fail',
        detail: `${dcpmi.tier} classification requires CAR scheduling/evidence, but no car input was supplied.`,
      });
    }
  }

  let car: ComplianceAuditReturn | undefined;
  if (input.car) {
    if (dcpmi && input.car.tier && input.car.tier !== dcpmi.tier) {
      checks.push({
        id: 'car-tier-mismatch',
        label: 'CAR classification matches DCPMI evidence',
        status: 'fail',
        detail: `CAR tier ${input.car.tier} does not match classified tier ${dcpmi.tier}.`,
      });
    }
    car = generateComplianceAuditReturn(input.car, options.carOptions);
    const failed = car.applicable && (car.status.initialAuditOverdue || car.status.missedFilingYears.length > 0);
    const warning = car.applicable && car.status.annualFiling === 'due-soon';
    checks.push({
      id: 'car',
      label: 'Compliance Audit Returns evidence',
      status: failed ? 'fail' : warning ? 'warn' : 'pass',
      detail: !car.applicable
        ? 'CAR is not applicable under the supplied classification.'
        : failed
          ? `Missing/late evidence: initial audit overdue=${car.status.initialAuditOverdue}; missed filing years=${car.status.missedFilingYears.join(', ') || 'none'}.`
          : `Annual filing status ${car.status.annualFiling}; next deadline ${car.schedule.nextFilingDeadline}.`,
    });
  }

  const reports = input.breaches ?? [];
  const globalEvidenceUsedForMany = reports.length > 1 && Boolean(
    options.breachOptions?.assessment
      || options.breachOptions?.notification
      || options.breachOptions?.highRisk
      || options.breachOptions?.notificationRequired,
  );
  if (globalEvidenceUsedForMany) {
    checks.push({
      id: 'breach-evidence-scope',
      label: 'Breach evidence is correlated per incident',
      status: 'fail',
      detail: 'Global assessment/notification evidence cannot be reused across multiple breaches; use breachEvidence or breachOptionsById.',
    });
  }

  const breaches = reports.map((report) => {
    const shared: BreachNotificationOptions = {
      asOf: options.breachOptions?.asOf,
      deadlineHours: options.breachOptions?.deadlineHours,
    };
    if (reports.length === 1) Object.assign(shared, options.breachOptions);
    const assessmentOptions: BreachNotificationOptions = {
      ...shared,
      ...input.breachEvidence?.[report.id],
      ...options.breachOptionsById?.[report.id],
    };
    return {
      id: report.id,
      title: report.title,
      assessment: assessBreachNotification(report, assessmentOptions),
    };
  });

  for (const breach of breaches) {
    const assessment = breach.assessment;
    const status: AuditCheckStatus = assessment.ready
      ? 'pass'
      : !assessment.valid || assessment.timing.overdue || assessment.timing.notified
        ? 'fail'
        : 'warn';
    const timing = Number.isFinite(assessment.timing.deadline)
      ? assessment.timing.overdue
        ? `${Math.abs(assessment.timing.hoursRemaining)}h overdue`
        : `${Math.max(0, assessment.timing.hoursRemaining)}h remaining`
      : 'invalid discovery timestamp';
    checks.push({
      id: `breach:${breach.id}`,
      label: `Breach notification — ${breach.title}`,
      status,
      detail: `${assessment.completeness}% content complete; notified=${assessment.timing.notified}; correlated=${assessment.valid}; ${timing}.`,
    });
  }

  const summary = {
    pass: checks.filter((check) => check.status === 'pass').length,
    warn: checks.filter((check) => check.status === 'warn').length,
    fail: checks.filter((check) => check.status === 'fail').length,
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
    generatedAt: new Date().toISOString(),
    provenance: {
      auditRulesetId: DEFAULT_AUDIT_RULESET.id,
      auditRulesetVersion: DEFAULT_AUDIT_RULESET.version,
      compliance: compliance.provenance,
    },
    advisoryNotice: 'Advisory implementation-readiness result only; it does not replace legal review or prove facts not represented by correlated evidence.',
  };
}

const SYMBOL: Record<AuditCheckStatus, string> = { pass: '✓', warn: '!', fail: '✗' };
const COLOR: Record<AuditCheckStatus, string> = { pass: '\x1b[32m', warn: '\x1b[33m', fail: '\x1b[31m' };
const RESET = '\x1b[0m';

export interface FormatAuditReportOptions {
  color?: boolean;
}

export function formatNdprAuditReport(
  result: NdprAuditResult,
  options: FormatAuditReportOptions = {},
): string {
  const paint = (status: AuditCheckStatus, text: string) =>
    options.color ? `${COLOR[status]}${text}${RESET}` : text;
  const lines = [
    'NDPA Implementation-Readiness Audit',
    `Generated ${result.generatedAt}`,
    `Ruleset ${result.provenance.auditRulesetVersion}; evaluated ${result.compliance.provenance.asOf}`,
    '',
    `Readiness score: ${result.score}/100 (${result.rating}) — minimum ${result.minScore}`,
    '',
  ];
  for (const check of result.checks) {
    lines.push(`${paint(check.status, SYMBOL[check.status])} ${check.label}`);
    lines.push(`    ${check.detail}`);
  }
  lines.push('');
  lines.push(`${result.summary.pass} passed, ${result.summary.warn} warning(s), ${result.summary.fail} failed`);
  lines.push(paint(result.passed ? 'pass' : 'fail', `Verdict: ${result.passed ? 'PASS' : 'FAIL'}`));
  lines.push(`Notice: ${result.advisoryNotice}`);
  return lines.join('\n');
}
