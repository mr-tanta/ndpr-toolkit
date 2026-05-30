/**
 * Personal-data-breach notification completeness checker for NDPA 2023
 * Section 40, as detailed by NDPC General Application and Implementation
 * Directive (GAID) 2025 Article 33.
 *
 * Section 40(2) requires a data controller to notify the Commission within 72
 * hours of becoming aware of a breach likely to result in a risk to data
 * subjects' rights and freedoms. GAID 2025 Article 33(5)(a)–(h) enumerates the
 * content that a notification to the Commission "shall include". Where the
 * breach is likely to result in a *high* risk, Section 40(3) additionally
 * requires the controller to communicate the breach to affected data subjects
 * in plain and clear language.
 *
 * This assesses a `BreachReport` against those requirements: which mandated
 * content items are present, whether the 72-hour window is met, and whether a
 * data-subject communication is owed. It is a documentation-completeness aid,
 * not legal advice — verify against current NDPC guidance.
 *
 * @see NDPA 2023 Section 40 (Personal data breaches)
 * @see NDPC GAID 2025 Article 33 (Data Breach Notification)
 */

import type { BreachReport, RiskAssessment, RegulatoryNotification } from '../types/breach';

const HOUR_MS = 3600_000;

export interface BreachNotificationOptions {
  /** Risk assessment for the breach; drives whether data-subject communication is required. */
  assessment?: RiskAssessment;
  /** The regulatory notification actually sent, if any — used to judge timeliness. */
  notification?: RegulatoryNotification;
  /** Reference "now" in epoch ms. Defaults to `Date.now()`. */
  asOf?: number;
  /** Notification window in hours. Defaults to 72 (NDPA S. 40(2)). */
  deadlineHours?: number;
  /**
   * Explicit high-risk flag (NDPA S. 40(3)). When omitted, derived from
   * `assessment.highRisksToRightsAndFreedoms`.
   */
  highRisk?: boolean;
}

export interface BreachNotificationItem {
  /** Stable identifier for the requirement. */
  id: string;
  /** Human-readable requirement. */
  label: string;
  /** Authoritative citation, e.g. `GAID 2025 Art. 33(5)(a)`. */
  section: string;
  /** Whether the report satisfies it. */
  satisfied: boolean;
}

export interface BreachNotificationTiming {
  /** `discoveredAt` + the notification window. */
  deadline: number;
  /** Whole hours between discovery and `asOf`. */
  hoursSinceDiscovery: number;
  /** Whether a regulatory notification has been recorded. */
  notified: boolean;
  /** When the regulatory notification was sent, if any. */
  notifiedAt?: number;
  /** Whether the notification (or, if none, `asOf`) falls within the deadline. */
  withinDeadline: boolean;
  /** Whole hours from `asOf` to the deadline (negative once past). */
  hoursRemaining: number;
  /** Whether the deadline has been missed. */
  overdue: boolean;
  /** Late filings must state the reasons for the delay (NDPA S. 40(2)). */
  requiresDelayJustification: boolean;
}

export interface BreachNotificationAssessment {
  /** Whether all applicable mandated content items are satisfied. */
  complete: boolean;
  /** Completeness of applicable content items, 0–100. */
  completeness: number;
  /** GAID 2025 Article 33(5) / NDPA S. 40(2) content of the notification to the Commission. */
  notificationToCommission: BreachNotificationItem[];
  /** NDPA S. 40(3) communication to data subjects — populated only when high-risk. */
  dataSubjectCommunication: BreachNotificationItem[];
  /** Whether a data-subject communication is owed (high risk). */
  dataSubjectCommunicationRequired: boolean;
  timing: BreachNotificationTiming;
  /** Labels of unsatisfied applicable items. */
  missing: string[];
  /** Actionable next steps, including timing warnings. */
  recommendations: string[];
  asOf: number;
}

const isText = (v: unknown): boolean => typeof v === 'string' && v.trim().length > 0;
const hasNum = (v: unknown): boolean => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const hasItems = (v: unknown): boolean => Array.isArray(v) && v.length > 0;
const hasContact = (c: BreachReport['dpoContact']): boolean => !!c && isText(c.name) && isText(c.email);

/**
 * Assess a breach report against the NDPA S. 40 / GAID 2025 Article 33
 * notification requirements.
 */
export function assessBreachNotification(
  report: BreachReport,
  options: BreachNotificationOptions = {},
): BreachNotificationAssessment {
  const asOf = options.asOf ?? Date.now();
  const deadlineHours = options.deadlineHours ?? 72;
  const deadline = report.discoveredAt + deadlineHours * HOUR_MS;

  const notification = options.notification;
  const notified = !!notification;
  const notifiedAt = notification?.sentAt;
  const referencePoint = notified ? (notifiedAt as number) : asOf;
  const overdue = referencePoint > deadline;

  const timing: BreachNotificationTiming = {
    deadline,
    hoursSinceDiscovery: Math.round((asOf - report.discoveredAt) / HOUR_MS),
    notified,
    notifiedAt,
    withinDeadline: !overdue,
    hoursRemaining: Math.round((deadline - asOf) / HOUR_MS),
    overdue,
    requiresDelayJustification: overdue,
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

  const dataSubjectCommunicationRequired =
    options.highRisk ?? options.assessment?.highRisksToRightsAndFreedoms ?? false;

  const dataSubjectCommunication: BreachNotificationItem[] = dataSubjectCommunicationRequired
    ? [
        { id: 'dsNature', label: 'Nature and context of the breach in plain language', section: 'NDPA 2023 S. 40(3)', satisfied: isText(report.description) },
        { id: 'dsConsequences', label: 'Likely consequences of the breach', section: 'NDPA 2023 S. 40(3)', satisfied: isText(report.likelyConsequences) },
        { id: 'dsMeasures', label: 'Safeguards and measures data subjects can take', section: 'NDPA 2023 S. 40(3)', satisfied: isText(report.mitigationMeasures) },
        { id: 'dsContact', label: 'Contact point for data subjects', section: 'NDPA 2023 S. 40(3)', satisfied: hasContact(report.dpoContact) },
      ]
    : [];

  const applicable = [...notificationToCommission, ...dataSubjectCommunication];
  const satisfiedCount = applicable.filter((i) => i.satisfied).length;
  const completeness = Math.round((satisfiedCount / applicable.length) * 100);
  const missing = applicable.filter((i) => !i.satisfied).map((i) => i.label);
  const complete = missing.length === 0;

  const recommendations: string[] = [];
  for (const item of applicable.filter((i) => !i.satisfied)) {
    recommendations.push(`Add: ${item.label} (${item.section}).`);
  }
  if (overdue) {
    recommendations.push(
      'The 72-hour notification deadline has passed — notify the NDPC now and state the reasons for the delay; phased reporting is permitted where complete details are not yet available (NDPA S. 40(2)).',
    );
  } else if (!notified) {
    recommendations.push(
      `${Math.max(0, timing.hoursRemaining)} hour(s) remain to notify the NDPC within the 72-hour window (NDPA S. 40(2)).`,
    );
  }
  if (dataSubjectCommunicationRequired) {
    recommendations.push(
      'High risk to data subjects — communicate the breach to affected data subjects immediately, in plain and clear language (NDPA S. 40(3)).',
    );
  }

  return {
    complete,
    completeness,
    notificationToCommission,
    dataSubjectCommunication,
    dataSubjectCommunicationRequired,
    timing,
    missing,
    recommendations,
    asOf,
  };
}
