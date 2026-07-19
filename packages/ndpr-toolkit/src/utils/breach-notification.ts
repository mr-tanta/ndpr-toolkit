/**
 * Breach-notification content, timing, and evidence-correlation checker for
 * NDPA 2023 Section 40 / NDPC GAID 2025 Article 33.
 *
 * `complete` means required content is present. `ready` additionally requires
 * valid/correlated evidence and, when notification is required, a recorded
 * notification sent within the configured window.
 */

import type { BreachReport, RiskAssessment, RegulatoryNotification } from '../types/breach';

const HOUR_MS = 3_600_000;

export interface BreachNotificationOptions {
  assessment?: RiskAssessment;
  notification?: RegulatoryNotification;
  asOf?: number;
  deadlineHours?: number;
  /** Force the high-risk data-subject duty on; a complete assessment is required to establish false. */
  highRisk?: true;
  /** Force Commission notification on; a complete assessment is required to establish false. */
  notificationRequired?: true;
}

export interface BreachNotificationItem {
  id: string;
  label: string;
  section: string;
  satisfied: boolean;
}

export interface BreachNotificationTiming {
  deadline: number;
  hoursSinceDiscovery: number;
  notified: boolean;
  notifiedAt?: number;
  withinDeadline: boolean;
  hoursRemaining: number;
  overdue: boolean;
  requiresDelayJustification: boolean;
  validDiscoveryTimestamp: boolean;
  validNotificationTimestamp: boolean;
}

export interface BreachNotificationAssessment {
  /** Content completeness only; does not prove that notification was sent. */
  complete: boolean;
  /** Content + valid, correlated, timely evidence. */
  ready: boolean;
  /** Whether timestamps and supplied evidence references are valid. */
  valid: boolean;
  completeness: number;
  notificationToCommission: BreachNotificationItem[];
  dataSubjectCommunication: BreachNotificationItem[];
  dataSubjectCommunicationRequired: boolean;
  notificationRequired: boolean;
  timing: BreachNotificationTiming;
  evidence: {
    assessmentProvided: boolean;
    assessmentCorrelated: boolean;
    assessmentValid: boolean;
    notificationProvided: boolean;
    notificationCorrelated: boolean;
    notificationValid: boolean;
  };
  validationErrors: string[];
  missing: string[];
  recommendations: string[];
  asOf: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const hasNum = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isBoundedNumber = (value: unknown, min: number, max: number): boolean =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const hasItems = (value: unknown): boolean => Array.isArray(value) && value.length > 0;
const hasContact = (contact: BreachReport['dpoContact']): boolean =>
  Boolean(contact && isText(contact.name) && isText(contact.email));

const RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical']);
const NOTIFICATION_METHODS = new Set(['email', 'portal', 'letter', 'other']);

export interface BreachEvidenceValidationError {
  path: string;
  message: string;
}

export interface BreachEvidenceValidationResult {
  assessmentProvided: boolean;
  assessmentCorrelated: boolean;
  assessmentValid: boolean;
  notificationProvided: boolean;
  notificationCorrelated: boolean;
  notificationValid: boolean;
  validNotificationTimestamp: boolean;
  errors: BreachEvidenceValidationError[];
}

/** Runtime validation for the incident timeline used by readiness and JSON audits. */
export function validateBreachReportChronology(
  report: { occurredAt?: unknown; discoveredAt?: unknown; reportedAt?: unknown },
  asOf: number,
): BreachEvidenceValidationError[] {
  const errors: BreachEvidenceValidationError[] = [];
  const add = (path: string, message: string) => errors.push({ path, message });
  const discoveredAt = report.discoveredAt;
  const validDiscoveryTimestamp = hasNum(discoveredAt);

  if (!validDiscoveryTimestamp) {
    add('discoveredAt', 'Must be a finite, non-negative epoch timestamp.');
  } else if (discoveredAt > asOf) {
    add('discoveredAt', 'Must not be later than asOf.');
  }

  if (report.occurredAt !== undefined) {
    if (!hasNum(report.occurredAt)) {
      add('occurredAt', 'Must be a finite, non-negative epoch timestamp when provided.');
    } else if (validDiscoveryTimestamp && report.occurredAt > discoveredAt) {
      add('occurredAt', 'Must not be later than discoveredAt.');
    }
  }

  if (!hasNum(report.reportedAt)) {
    add('reportedAt', 'Must be a finite, non-negative epoch timestamp.');
  } else if (validDiscoveryTimestamp && report.reportedAt < discoveredAt) {
    add('reportedAt', 'Must not be earlier than discoveredAt.');
  } else if (report.reportedAt > asOf) {
    add('reportedAt', 'Must not be later than asOf.');
  }

  return errors;
}

/** Runtime validation for evidence that may originate in JSON rather than TypeScript. */
export function validateBreachNotificationEvidence(
  report: Pick<BreachReport, 'id' | 'discoveredAt'>,
  options: Pick<
    BreachNotificationOptions,
    'assessment' | 'notification' | 'highRisk' | 'notificationRequired'
  >,
  asOf: number,
): BreachEvidenceValidationResult {
  const errors: BreachEvidenceValidationError[] = [];
  const add = (path: string, message: string) => errors.push({ path, message });
  const validDiscoveryTimestamp = hasNum(report.discoveredAt) && report.discoveredAt <= asOf;

  if (options.highRisk !== undefined && options.highRisk !== true) {
    add(
      'highRisk',
      'Only true is accepted as a force-on override; use a complete assessment to establish lower risk.',
    );
  }
  if (options.notificationRequired !== undefined && options.notificationRequired !== true) {
    add(
      'notificationRequired',
      'Only true is accepted as a force-on override; use a complete assessment to establish that notification is not required.',
    );
  }

  const assessmentProvided = options.assessment !== undefined;
  const assessmentRecord = isRecord(options.assessment) ? options.assessment : undefined;
  const assessmentCorrelated = !assessmentProvided || assessmentRecord?.breachId === report.id;
  if (assessmentProvided) {
    if (!assessmentRecord) {
      add('assessment', 'Must be an object.');
    } else {
      if (!isText(assessmentRecord.id)) add('assessment.id', 'Must be a non-empty string.');
      if (!isText(assessmentRecord.breachId)) {
        add('assessment.breachId', 'Must be a non-empty string.');
      } else if (!assessmentCorrelated) {
        add('assessment.breachId', `Must match breach ${report.id}.`);
      }
      if (!hasNum(assessmentRecord.assessedAt)) {
        add('assessment.assessedAt', 'Must be a finite, non-negative epoch timestamp.');
      } else if (
        validDiscoveryTimestamp
        && (assessmentRecord.assessedAt < report.discoveredAt || assessmentRecord.assessedAt > asOf)
      ) {
        add('assessment.assessedAt', 'Must be between breach discovery and asOf.');
      }

      const assessor = assessmentRecord.assessor;
      if (!isRecord(assessor)) {
        add('assessment.assessor', 'Must be an object.');
      } else {
        for (const field of ['name', 'role', 'email'] as const) {
          if (!isText(assessor[field])) add(`assessment.assessor.${field}`, 'Must be a non-empty string.');
        }
      }
      for (const field of [
        'confidentialityImpact',
        'integrityImpact',
        'availabilityImpact',
        'harmLikelihood',
        'harmSeverity',
      ]) {
        if (!isBoundedNumber(assessmentRecord[field], 1, 5)) {
          add(`assessment.${field}`, 'Must be a number from 1 to 5.');
        }
      }
      if (!hasNum(assessmentRecord.overallRiskScore)) {
        add('assessment.overallRiskScore', 'Must be a non-negative number.');
      }
      if (!RISK_LEVELS.has(String(assessmentRecord.riskLevel))) {
        add('assessment.riskLevel', 'Must be low, medium, high, or critical.');
      }
      if (typeof assessmentRecord.risksToRightsAndFreedoms !== 'boolean') {
        add('assessment.risksToRightsAndFreedoms', 'Must be a boolean.');
      }
      if (typeof assessmentRecord.highRisksToRightsAndFreedoms !== 'boolean') {
        add('assessment.highRisksToRightsAndFreedoms', 'Must be a boolean.');
      } else if (
        assessmentRecord.highRisksToRightsAndFreedoms
        && assessmentRecord.risksToRightsAndFreedoms !== true
      ) {
        add(
          'assessment.highRisksToRightsAndFreedoms',
          'High risk requires risksToRightsAndFreedoms to also be true.',
        );
      }
      if (!isText(assessmentRecord.justification)) {
        add('assessment.justification', 'Must be a non-empty string.');
      }
    }
  }
  const assessmentValid = !errors.some((error) => error.path.startsWith('assessment'));

  const notificationProvided = options.notification !== undefined;
  const notificationRecord = isRecord(options.notification) ? options.notification : undefined;
  const notificationCorrelated = !notificationProvided || notificationRecord?.breachId === report.id;
  let validNotificationTimestamp = !notificationProvided;
  if (notificationProvided) {
    if (!notificationRecord) {
      add('notification', 'Must be an object.');
      validNotificationTimestamp = false;
    } else {
      if (!isText(notificationRecord.id)) add('notification.id', 'Must be a non-empty string.');
      if (!isText(notificationRecord.breachId)) {
        add('notification.breachId', 'Must be a non-empty string.');
      } else if (!notificationCorrelated) {
        add('notification.breachId', `Must match breach ${report.id}.`);
      }
      validNotificationTimestamp = hasNum(notificationRecord.sentAt)
        && (!validDiscoveryTimestamp
          || (notificationRecord.sentAt >= report.discoveredAt && notificationRecord.sentAt <= asOf));
      if (!hasNum(notificationRecord.sentAt)) {
        add('notification.sentAt', 'Must be a finite, non-negative epoch timestamp.');
      } else if (
        validDiscoveryTimestamp
        && (notificationRecord.sentAt < report.discoveredAt || notificationRecord.sentAt > asOf)
      ) {
        add('notification.sentAt', 'Must be between breach discovery and asOf.');
      }
      if (!NOTIFICATION_METHODS.has(String(notificationRecord.method))) {
        add('notification.method', 'Must be email, portal, letter, or other.');
      }
      if (!isText(notificationRecord.content)) {
        add('notification.content', 'Must be a non-empty string.');
      }
    }
  }
  const notificationValid = !errors.some((error) => error.path.startsWith('notification'));

  return {
    assessmentProvided,
    assessmentCorrelated,
    assessmentValid,
    notificationProvided,
    notificationCorrelated,
    notificationValid,
    validNotificationTimestamp,
    errors,
  };
}

export function assessBreachNotification(
  report: BreachReport,
  options: BreachNotificationOptions = {},
): BreachNotificationAssessment {
  const asOf = options.asOf ?? Date.now();
  const deadlineHours = options.deadlineHours ?? 72;
  if (!Number.isFinite(asOf) || asOf < 0) {
    throw new RangeError('asOf must be a finite, non-negative epoch timestamp.');
  }
  if (!Number.isFinite(deadlineHours) || deadlineHours <= 0) {
    throw new RangeError('deadlineHours must be a positive finite number.');
  }

  const validationErrors: string[] = [];
  const validDiscoveryTimestamp = hasNum(report.discoveredAt) && report.discoveredAt <= asOf;
  validationErrors.push(
    ...validateBreachReportChronology(report, asOf).map(
      (error) => `Breach ${error.path}: ${error.message}`,
    ),
  );

  const evidenceValidation = validateBreachNotificationEvidence(report, options, asOf);
  validationErrors.push(
    ...evidenceValidation.errors.map((error) => `${error.path}: ${error.message}`),
  );
  const {
    assessmentProvided,
    assessmentCorrelated,
    assessmentValid,
    notificationProvided,
    notificationCorrelated,
    notificationValid,
    validNotificationTimestamp,
  } = evidenceValidation;

  const correlatedAssessment = assessmentProvided && assessmentCorrelated && assessmentValid
    ? options.assessment
    : undefined;
  const correlatedNotification = notificationProvided && notificationCorrelated && notificationValid
    ? options.notification
    : undefined;
  const notificationRequired = options.notificationRequired === true
    || (correlatedAssessment?.risksToRightsAndFreedoms ?? true);
  const notified = Boolean(correlatedNotification);
  const notifiedAt = correlatedNotification?.sentAt;
  const deadline = validDiscoveryTimestamp ? report.discoveredAt + deadlineHours * HOUR_MS : Number.NaN;
  const referencePoint = notified ? (notifiedAt as number) : asOf;
  const withinDeadline = validDiscoveryTimestamp && referencePoint <= deadline;
  const overdue = notificationRequired && validDiscoveryTimestamp && referencePoint > deadline;

  const timing: BreachNotificationTiming = {
    deadline,
    hoursSinceDiscovery: validDiscoveryTimestamp
      ? Math.round((asOf - report.discoveredAt) / HOUR_MS)
      : Number.NaN,
    notified,
    notifiedAt,
    withinDeadline,
    hoursRemaining: validDiscoveryTimestamp
      ? Math.round((deadline - asOf) / HOUR_MS)
      : Number.NaN,
    overdue,
    requiresDelayJustification: overdue,
    validDiscoveryTimestamp,
    validNotificationTimestamp,
  };

  const notificationToCommission: BreachNotificationItem[] = [
    { id: 'circumstances', label: 'Description of the circumstances of the breach', section: 'GAID 2025 Art. 33(5)(a)', satisfied: isText(report.description) },
    { id: 'occurrence', label: 'Date or time period of the breach', section: 'GAID 2025 Art. 33(5)(b)', satisfied: hasNum(report.occurredAt) },
    { id: 'personalInfo', label: 'Description of the personal data involved', section: 'GAID 2025 Art. 33(5)(c)', satisfied: hasItems(report.dataTypes) },
    { id: 'riskOfHarm', label: 'Assessment of the risk of harm to data subjects', section: 'GAID 2025 Art. 33(5)(d)', satisfied: isText(report.likelyConsequences) },
    { id: 'numberAtRisk', label: 'Estimated number of data subjects at risk of significant harm', section: 'GAID 2025 Art. 33(5)(e)', satisfied: hasNum(report.estimatedAffectedSubjects) },
    { id: 'mitigation', label: 'Steps taken to reduce the risk of harm', section: 'GAID 2025 Art. 33(5)(f)', satisfied: isText(report.mitigationMeasures) },
    { id: 'notifySteps', label: 'Steps taken to notify affected data subjects', section: 'GAID 2025 Art. 33(5)(g)', satisfied: isText(report.initialActions) },
    { id: 'contactPoint', label: 'Name and contact details of a contact point', section: 'GAID 2025 Art. 33(5)(h)', satisfied: hasContact(report.dpoContact) },
    { id: 'dataSubjectCategories', label: 'Categories of data subjects concerned', section: 'NDPA 2023 S. 40(2)', satisfied: hasItems(report.dataSubjectCategories) },
    { id: 'recordCount', label: 'Approximate number of personal data records concerned', section: 'NDPA 2023 S. 40(2)', satisfied: hasNum(report.approximateRecordCount) },
  ];

  // Absence, invalidity, or mismatching assessment evidence cannot waive the
  // Section 40(3) duty. Only a complete correlated assessment may establish
  // that high risk is false; callers may otherwise only force the duty on.
  const dataSubjectCommunicationRequired = options.highRisk === true
    || (correlatedAssessment?.highRisksToRightsAndFreedoms ?? true);
  const dataSubjectCommunication: BreachNotificationItem[] = dataSubjectCommunicationRequired
    ? [
        { id: 'dsNature', label: 'Nature and context of the breach in plain language', section: 'NDPA 2023 S. 40(3)', satisfied: isText(report.description) },
        { id: 'dsConsequences', label: 'Likely consequences of the breach', section: 'NDPA 2023 S. 40(3)', satisfied: isText(report.likelyConsequences) },
        { id: 'dsMeasures', label: 'Safeguards and measures data subjects can take', section: 'NDPA 2023 S. 40(3)', satisfied: isText(report.mitigationMeasures) },
        { id: 'dsContact', label: 'Contact point for data subjects', section: 'NDPA 2023 S. 40(3)', satisfied: hasContact(report.dpoContact) },
      ]
    : [];

  const applicableItems = [...notificationToCommission, ...dataSubjectCommunication];
  const satisfiedCount = applicableItems.filter((item) => item.satisfied).length;
  const completeness = Math.round((satisfiedCount / applicableItems.length) * 100);
  const missing = applicableItems.filter((item) => !item.satisfied).map((item) => item.label);
  const complete = missing.length === 0;
  const valid = validationErrors.length === 0;
  const ready = valid
    && complete
    && (!notificationRequired || notified)
    && (!notificationRequired || withinDeadline);

  const recommendations = applicableItems
    .filter((item) => !item.satisfied)
    .map((item) => `Add: ${item.label} (${item.section}).`);
  recommendations.push(...validationErrors.map((error) => `Correct evidence: ${error}`));

  if (notificationRequired && overdue) {
    recommendations.push('The notification deadline has passed — notify the NDPC now, retain filing evidence, and record the reason for delay.');
  } else if (notificationRequired && !notified && validDiscoveryTimestamp) {
    recommendations.push(`${Math.max(0, timing.hoursRemaining)} hour(s) remain to notify the NDPC within the configured window.`);
  }
  if (dataSubjectCommunicationRequired) {
    recommendations.push('High risk to data subjects — communicate the breach to affected data subjects in plain and clear language.');
  }

  return {
    complete,
    ready,
    valid,
    completeness,
    notificationToCommission,
    dataSubjectCommunication,
    dataSubjectCommunicationRequired,
    notificationRequired,
    timing,
    evidence: {
      assessmentProvided,
      assessmentCorrelated,
      assessmentValid,
      notificationProvided,
      notificationCorrelated,
      notificationValid,
    },
    validationErrors,
    missing,
    recommendations,
    asOf,
  };
}
