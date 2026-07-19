import { createId } from '@paralleldrive/cuid2';
import {
  Prisma,
  type PrismaClient,
  type BreachReport as PrismaBreachReport,
  type DPIARecord as PrismaDPIARecord,
  type ProcessingRecord as PrismaProcessingRecord,
} from '@prisma/client';
import {
  assessBreachNotification,
  validateConsentStructured,
  validateProcessingRecord,
  type BreachNotificationAssessment,
  type BreachReport,
  type ConsentSettings,
  type DPIARisk,
  type DPIAResult,
  type ProcessingRecord,
  type RegulatoryNotification,
  type RiskAssessment,
} from '@tantainnovative/ndpr-toolkit/server';

export interface VerifiedActorProfile {
  id: string;
  displayName: string;
  email: string;
  department?: string;
  phone?: string;
}

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; fields: Record<string, string> };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function validateConsentPayload(
  input: unknown,
): ValidationResult<ConsentSettings> {
  if (!isRecord(input)) {
    return { valid: false, fields: { body: 'Request body must be a JSON object.' } };
  }

  const fields: Record<string, string> = {};
  const consents = isRecord(input.consents)
    && Object.values(input.consents).every((value) => typeof value === 'boolean')
    ? input.consents as Record<string, boolean>
    : undefined;
  const timestamp = typeof input.timestamp === 'number'
    && Number.isSafeInteger(input.timestamp)
    && input.timestamp >= 0
    && Number.isFinite(new Date(input.timestamp).getTime())
    ? input.timestamp
    : undefined;
  const version = asNonEmptyString(input.version);
  const method = asNonEmptyString(input.method);
  const hasInteracted = typeof input.hasInteracted === 'boolean'
    ? input.hasInteracted
    : undefined;
  const lawfulBases = new Set<NonNullable<ConsentSettings['lawfulBasis']>>([
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_interest',
    'legitimate_interests',
  ]);
  const lawfulBasis = input.lawfulBasis === undefined
    ? undefined
    : typeof input.lawfulBasis === 'string'
      && lawfulBases.has(input.lawfulBasis as NonNullable<ConsentSettings['lawfulBasis']>)
      ? input.lawfulBasis as ConsentSettings['lawfulBasis']
      : null;

  if (!consents || Object.keys(consents).length === 0) {
    fields.consents = 'consents must be a non-empty boolean map.';
  }
  if (timestamp === undefined) {
    fields.timestamp = 'timestamp must be a non-negative safe-integer epoch value within the valid Date range.';
  }
  if (!version) fields.version = 'version is required.';
  if (!method) fields.method = 'method is required.';
  if (hasInteracted === undefined) fields.hasInteracted = 'hasInteracted must be boolean.';
  if (lawfulBasis === null) fields.lawfulBasis = 'lawfulBasis is not supported.';
  if (Object.keys(fields).length > 0) return { valid: false, fields };

  const candidate: ConsentSettings = {
    consents: consents as Record<string, boolean>,
    timestamp: timestamp as number,
    version: version as string,
    method: method as string,
    hasInteracted: hasInteracted as boolean,
    lawfulBasis: lawfulBasis ?? undefined,
  };
  const toolkitValidation = validateConsentStructured(candidate);
  return toolkitValidation.valid
    ? { valid: true, data: toolkitValidation.data as ConsentSettings }
    : {
        valid: false,
        fields: Object.fromEntries(
          toolkitValidation.errors.map((error) => [error.field, error.message]),
        ),
      };
}

export function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function jsonOrDbNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value === undefined ? Prisma.DbNull : toInputJson(value);
}

export type SerializableTransactionResult<T> =
  | { committed: true; value: T }
  | { committed: false };

/**
 * Retries the complete read/validate/write transaction on a retryable
 * concurrency conflict. Callers must return an explicit API conflict when the
 * bounded attempts are exhausted.
 */
export async function runSerializableTransaction<T>(
  client: PrismaClient,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  maximumAttempts = 3,
): Promise<SerializableTransactionResult<T>> {
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      const value = await client.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
      return { committed: true, value };
    } catch (error) {
      const retryable = isRecord(error)
        && (error.code === 'P2034' || error.code === 'P2002');
      if (!retryable) throw error;
      if (attempt === maximumAttempts) return { committed: false };
    }
  }
  return { committed: false };
}

export function getDsrOperationalTargetDays(): number {
  const configured = Number(process.env.NDPR_DSR_TARGET_DAYS ?? '30');
  return Number.isInteger(configured) && configured > 0 && configured <= 365
    ? configured
    : 30;
}

export function addOperationalDays(start: Date, days: number): Date {
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
}

export const DSR_OPERATIONAL_TARGET_NOTICE =
  'Configured workflow target only; it is not a legal conclusion or an assertion of a universal statutory deadline.';

export function normalizeDsrStatus(status: string): string {
  return status === 'in_progress' ? 'inProgress' : status;
}

// ---------------------------------------------------------------------------
// Breach report contract
// ---------------------------------------------------------------------------

export interface BreachStateRecord {
  report: BreachReport;
  assessments: RiskAssessment[];
  notifications: RegulatoryNotification[];
}

const BREACH_STATUSES = new Set<BreachReport['status']>([
  'ongoing',
  'contained',
  'resolved',
]);
const RISK_LEVELS = new Set<RiskAssessment['riskLevel']>([
  'low',
  'medium',
  'high',
  'critical',
]);
const NOTIFICATION_METHODS = new Set<RegulatoryNotification['method']>([
  'email',
  'portal',
  'letter',
  'other',
]);

export function createBreachStateRecord(
  input: unknown,
  actor: VerifiedActorProfile,
  now = Date.now(),
): ValidationResult<BreachStateRecord> {
  if (!isRecord(input)) {
    return {
      valid: false,
      fields: { body: 'Request body must be a JSON object.' },
    };
  }

  const reportInput = isRecord(input.report) ? input.report : input;
  const id = createId();
  const reportResult = normalizeBreachReport(reportInput, actor, now, { id });
  if (!reportResult.valid) return reportResult;

  const assessmentsResult = normalizeAssessments(
    input.assessments,
    id,
    actor,
    now,
    reportResult.data.discoveredAt,
    [],
  );
  const notificationsResult = normalizeNotifications(
    input.notifications,
    id,
    now,
    reportResult.data.discoveredAt,
    [],
  );
  if (!assessmentsResult.valid || !notificationsResult.valid) {
    return {
      valid: false,
      fields: mergeValidationFields(assessmentsResult, notificationsResult),
    };
  }

  return {
    valid: true,
    data: {
      report: reportResult.data,
      assessments: assessmentsResult.data,
      notifications: notificationsResult.data,
    },
  };
}

export function updateBreachStateRecord(
  input: unknown,
  current: BreachStateRecord,
  actor: VerifiedActorProfile,
  now = Date.now(),
): ValidationResult<BreachStateRecord> {
  if (!isRecord(input)) {
    return {
      valid: false,
      fields: { body: 'Request body must be a JSON object.' },
    };
  }
  const reportPatch = isRecord(input.report) ? input.report : input;
  const safeMerged: Record<string, unknown> = breachReportToInput(current.report);
  const allowedReportFields = [
    'title',
    'description',
    'category',
    'discoveredAt',
    'occurredAt',
    'affectedSystems',
    'dataTypes',
    'involvesSensitiveData',
    'estimatedAffectedSubjects',
    'estimatedAffected',
    'approximateRecordCount',
    'dataSubjectCategories',
    'likelyConsequences',
    'mitigationMeasures',
    'isPhasedReport',
    'supplementsReportId',
    'dpoContact',
    'status',
    'initialActions',
    'attachments',
  ];
  if (Object.prototype.hasOwnProperty.call(reportPatch, 'estimatedAffectedSubjects')
    && Object.prototype.hasOwnProperty.call(reportPatch, 'estimatedAffected')) {
    return {
      valid: false,
      fields: {
        estimatedAffectedSubjects:
          'Send estimatedAffectedSubjects or the legacy estimatedAffected alias, not both.',
      },
    };
  }
  for (const field of allowedReportFields) {
    if (Object.prototype.hasOwnProperty.call(reportPatch, field)) {
      const canonicalField = field === 'estimatedAffected'
        ? 'estimatedAffectedSubjects'
        : field;
      safeMerged[canonicalField] = reportPatch[field];
    }
  }

  const reportResult = normalizeBreachReport(safeMerged, actor, now, {
    id: current.report.id,
    reportedAt: current.report.reportedAt,
    reporter: current.report.reporter,
  });
  if (!reportResult.valid) return reportResult;
  if (Object.prototype.hasOwnProperty.call(reportPatch, 'discoveredAt')
    && reportResult.data.discoveredAt !== current.report.discoveredAt) {
    const evidencePredatesDiscovery = current.assessments.some(
      (assessment) => assessment.assessedAt < reportResult.data.discoveredAt,
    ) || current.notifications.some(
      (notification) => notification.sentAt < reportResult.data.discoveredAt,
    );
    if (evidencePredatesDiscovery) {
      return {
        valid: false,
        fields: {
          discoveredAt:
            'discoveredAt cannot move after preserved assessment or notification evidence.',
        },
      };
    }
  }

  const assessmentsResult = Object.prototype.hasOwnProperty.call(input, 'assessments')
    ? normalizeAssessments(
        input.assessments,
        current.report.id,
        actor,
        now,
        reportResult.data.discoveredAt,
        current.assessments,
      )
    : { valid: true as const, data: current.assessments };
  const notificationsResult = Object.prototype.hasOwnProperty.call(input, 'notifications')
    ? normalizeNotifications(
        input.notifications,
        current.report.id,
        now,
        reportResult.data.discoveredAt,
        current.notifications,
      )
    : { valid: true as const, data: current.notifications };
  if (!assessmentsResult.valid || !notificationsResult.valid) {
    return {
      valid: false,
      fields: mergeValidationFields(assessmentsResult, notificationsResult),
    };
  }

  const changed = allowedReportFields.some((field) =>
    Object.prototype.hasOwnProperty.call(reportPatch, field),
  ) || Object.prototype.hasOwnProperty.call(input, 'assessments')
    || Object.prototype.hasOwnProperty.call(input, 'notifications');
  if (!changed) {
    return {
      valid: false,
      fields: {
        body: 'Provide at least one allowlisted report field, assessments, or notifications.',
      },
    };
  }

  return {
    valid: true,
    data: {
      report: reportResult.data,
      assessments: assessmentsResult.data,
      notifications: notificationsResult.data,
    },
  };
}

export function breachStateFromRow(row: PrismaBreachReport): BreachStateRecord {
  return {
    report: {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      discoveredAt: row.discoveredAt.getTime(),
      occurredAt: row.occurredAt?.getTime(),
      reportedAt: row.reportedAt.getTime(),
      reporter: {
        name: row.reporterName,
        email: row.reporterEmail,
        department: row.reporterDepartment ?? '',
        phone: row.reporterPhone ?? undefined,
      },
      affectedSystems: fromJsonArray<string>(row.affectedSystems),
      dataTypes: fromJsonArray<string>(row.dataTypes),
      involvesSensitiveData: row.involvesSensitiveData ?? undefined,
      estimatedAffectedSubjects: row.estimatedAffectedSubjects ?? undefined,
      approximateRecordCount: row.approximateRecordCount ?? undefined,
      dataSubjectCategories: fromOptionalJson<string[]>(row.dataSubjectCategories),
      likelyConsequences: row.likelyConsequences ?? undefined,
      mitigationMeasures: row.mitigationMeasures ?? undefined,
      isPhasedReport: row.isPhasedReport ?? undefined,
      supplementsReportId: row.supplementsReportId ?? undefined,
      dpoContact: fromOptionalJson<BreachReport['dpoContact']>(row.dpoContact),
      status: normalizeStoredBreachStatus(row.status),
      initialActions: row.initialActions ?? undefined,
      attachments: fromOptionalJson<BreachReport['attachments']>(row.attachments),
    },
    assessments: fromJsonArray<RiskAssessment>(row.assessments),
    notifications: fromJsonArray<RegulatoryNotification>(row.notifications),
  };
}

export function breachCreateData(
  tenantId: string,
  state: BreachStateRecord,
): Prisma.BreachReportUncheckedCreateInput {
  const { report, assessments, notifications } = state;
  const notifiedAt = notifications.length > 0
    ? Math.min(...notifications.map((notification) => notification.sentAt))
    : undefined;

  return {
    tenantId,
    id: report.id,
    title: report.title,
    description: report.description,
    category: report.category,
    severity: highestRiskLevel(assessments),
    status: report.status,
    discoveredAt: new Date(report.discoveredAt),
    occurredAt: report.occurredAt === undefined ? null : new Date(report.occurredAt),
    reportedAt: new Date(report.reportedAt),
    ndpcNotifiedAt: notifiedAt === undefined ? null : new Date(notifiedAt),
    reporterName: report.reporter.name,
    reporterEmail: report.reporter.email,
    reporterDepartment: report.reporter.department || null,
    reporterPhone: report.reporter.phone ?? null,
    affectedSystems: toInputJson(report.affectedSystems),
    dataTypes: toInputJson(report.dataTypes),
    involvesSensitiveData: report.involvesSensitiveData ?? null,
    estimatedAffectedSubjects: report.estimatedAffectedSubjects ?? null,
    approximateRecordCount: report.approximateRecordCount ?? null,
    dataSubjectCategories: jsonOrDbNull(report.dataSubjectCategories),
    likelyConsequences: report.likelyConsequences ?? null,
    mitigationMeasures: report.mitigationMeasures ?? null,
    isPhasedReport: report.isPhasedReport ?? null,
    supplementsReportId: report.supplementsReportId ?? null,
    dpoContact: jsonOrDbNull(report.dpoContact),
    initialActions: report.initialActions ?? null,
    attachments: jsonOrDbNull(report.attachments),
    assessments: toInputJson(assessments),
    notifications: toInputJson(notifications),
    ndpcNotificationSent: notifications.length > 0,
    removedAt: null,
  };
}

export function breachResponse(row: PrismaBreachReport): Record<string, unknown> {
  const state = breachStateFromRow(row);
  const assessment = [...state.assessments].sort(
    (left, right) => right.assessedAt - left.assessedAt,
  )[0];
  const notification = [...state.notifications].sort(
    (left, right) => left.sentAt - right.sentAt,
  )[0];
  const baseReadiness = assessBreachNotification(state.report, {
    assessment,
    notification,
  });
  const chronologyErrors = breachChronologyErrors(state, baseReadiness.asOf);
  const readiness: BreachNotificationAssessment = chronologyErrors.length === 0
    ? baseReadiness
    : {
        ...baseReadiness,
        ready: false,
        valid: false,
        validationErrors: [...baseReadiness.validationErrors, ...chronologyErrors],
        recommendations: [
          ...baseReadiness.recommendations,
          ...chronologyErrors.map((error) => `Correct evidence: ${error}`),
        ],
      };

  return {
    ...state.report,
    severity: row.severity,
    assessments: state.assessments,
    notifications: state.notifications,
    ndpcNotificationSent: state.notifications.length > 0,
    ndpcNotifiedAt: row.ndpcNotifiedAt?.getTime(),
    ndpcReadiness: readiness,
  };
}

function normalizeBreachReport(
  input: Record<string, unknown>,
  actor: VerifiedActorProfile,
  now: number,
  fixed: {
    id: string;
    reportedAt?: number;
    reporter?: BreachReport['reporter'];
  },
): ValidationResult<BreachReport> {
  const fields: Record<string, string> = {};
  if (Object.prototype.hasOwnProperty.call(input, 'estimatedAffectedSubjects')
    && Object.prototype.hasOwnProperty.call(input, 'estimatedAffected')) {
    fields.estimatedAffectedSubjects =
      'Send estimatedAffectedSubjects or the legacy estimatedAffected alias, not both.';
  }
  const title = asNonEmptyString(input.title);
  const description = asNonEmptyString(input.description);
  const category = asNonEmptyString(input.category);
  const discoveredAt = parseTimestamp(input.discoveredAt);
  const occurredAt = input.occurredAt === undefined || input.occurredAt === null
    ? undefined
    : parseTimestamp(input.occurredAt);
  const affectedSystems = stringArray(input.affectedSystems);
  const dataTypes = stringArray(input.dataTypes);
  const status = normalizeInputBreachStatus(input.status);

  if (!title) fields.title = 'title is required.';
  if (!description) fields.description = 'description is required.';
  if (!category) fields.category = 'category is required.';
  if (discoveredAt === undefined) fields.discoveredAt = 'discoveredAt must be a valid timestamp.';
  if (discoveredAt !== undefined && discoveredAt > now) {
    fields.discoveredAt = 'discoveredAt cannot be in the future.';
  }
  if (input.occurredAt !== undefined && input.occurredAt !== null && occurredAt === undefined) {
    fields.occurredAt = 'occurredAt must be a valid timestamp when provided.';
  }
  if (occurredAt !== undefined && discoveredAt !== undefined && occurredAt > discoveredAt) {
    fields.occurredAt = 'occurredAt cannot be later than discoveredAt.';
  }
  if (!affectedSystems || affectedSystems.length === 0) {
    fields.affectedSystems = 'affectedSystems must contain at least one string.';
  }
  if (!dataTypes || dataTypes.length === 0) {
    fields.dataTypes = 'dataTypes must contain at least one string.';
  }
  if (!status) fields.status = 'status must be ongoing, contained, or resolved.';

  const estimated = optionalNonNegativeInteger(
    input.estimatedAffectedSubjects ?? input.estimatedAffected,
  );
  if ((input.estimatedAffectedSubjects ?? input.estimatedAffected) !== undefined && estimated === undefined) {
    fields.estimatedAffectedSubjects = 'estimatedAffectedSubjects must be a non-negative integer.';
  }
  const recordCount = optionalNonNegativeInteger(input.approximateRecordCount);
  if (input.approximateRecordCount !== undefined && recordCount === undefined) {
    fields.approximateRecordCount = 'approximateRecordCount must be a non-negative integer.';
  }

  const dataSubjectCategories = optionalStringArray(input.dataSubjectCategories, fields, 'dataSubjectCategories');
  const dpoContact = optionalContact(input.dpoContact, fields, 'dpoContact');
  const attachments = optionalReportAttachments(input.attachments, fields);
  const involvesSensitiveData = optionalBoolean(input.involvesSensitiveData, fields, 'involvesSensitiveData');
  const isPhasedReport = optionalBoolean(input.isPhasedReport, fields, 'isPhasedReport');
  const likelyConsequences = optionalTextField(
    input.likelyConsequences,
    fields,
    'likelyConsequences',
  );
  const mitigationMeasures = optionalTextField(
    input.mitigationMeasures,
    fields,
    'mitigationMeasures',
  );
  const supplementsReportId = optionalTextField(
    input.supplementsReportId,
    fields,
    'supplementsReportId',
  );
  const initialActions = optionalTextField(input.initialActions, fields, 'initialActions');

  if (Object.keys(fields).length > 0) return { valid: false, fields };

  return {
    valid: true,
    data: {
      id: fixed.id,
      title: title as string,
      description: description as string,
      category: category as string,
      discoveredAt: discoveredAt as number,
      occurredAt,
      reportedAt: fixed.reportedAt ?? now,
      reporter: fixed.reporter ?? {
        name: actor.displayName,
        email: actor.email,
        department: actor.department ?? '',
        phone: actor.phone,
      },
      affectedSystems: affectedSystems as string[],
      dataTypes: dataTypes as string[],
      involvesSensitiveData,
      estimatedAffectedSubjects: estimated,
      approximateRecordCount: recordCount,
      dataSubjectCategories,
      likelyConsequences,
      mitigationMeasures,
      isPhasedReport,
      supplementsReportId,
      dpoContact,
      status: status as BreachReport['status'],
      initialActions,
      attachments,
    },
  };
}

function normalizeAssessments(
  value: unknown,
  breachId: string,
  actor: VerifiedActorProfile,
  now: number,
  discoveredAt: number,
  existing: RiskAssessment[],
): ValidationResult<RiskAssessment[]> {
  if (value === undefined) return { valid: true, data: [] };
  if (!Array.isArray(value)) {
    return { valid: false, fields: { assessments: 'assessments must be an array.' } };
  }

  const fields: Record<string, string> = {};
  const assessments: RiskAssessment[] = [];
  const submittedIds = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`assessments.${index}`] = 'Assessment must be an object.';
      return;
    }
    const prefix = `assessments.${index}`;
    const id = asNonEmptyString(item.id) ?? createId();
    if (submittedIds.has(id)) {
      fields[`${prefix}.id`] = 'Assessment IDs must be unique within the request.';
      return;
    }
    submittedIds.add(id);
    const previous = existing.find((assessment) => assessment.id === id);
    const source: Record<string, unknown> = previous
      ? { ...previous, ...item }
      : item;
    const confidentialityImpact = boundedNumber(source.confidentialityImpact, 1, 5);
    const integrityImpact = boundedNumber(source.integrityImpact, 1, 5);
    const availabilityImpact = boundedNumber(source.availabilityImpact, 1, 5);
    const harmLikelihood = boundedNumber(source.harmLikelihood, 1, 5);
    const harmSeverity = boundedNumber(source.harmSeverity, 1, 5);
    const overallRiskScore = nonNegativeNumber(source.overallRiskScore);
    const riskLevel = typeof source.riskLevel === 'string'
      && RISK_LEVELS.has(source.riskLevel as RiskAssessment['riskLevel'])
      ? source.riskLevel as RiskAssessment['riskLevel']
      : undefined;
    const risks = typeof source.risksToRightsAndFreedoms === 'boolean'
      ? source.risksToRightsAndFreedoms
      : undefined;
    const highRisks = typeof source.highRisksToRightsAndFreedoms === 'boolean'
      ? source.highRisksToRightsAndFreedoms
      : undefined;
    const justification = asNonEmptyString(source.justification);
    const assessedAt = previous?.assessedAt
      ?? (source.assessedAt === undefined ? now : parseTimestamp(source.assessedAt));

    if (confidentialityImpact === undefined) fields[`${prefix}.confidentialityImpact`] = 'Must be between 1 and 5.';
    if (integrityImpact === undefined) fields[`${prefix}.integrityImpact`] = 'Must be between 1 and 5.';
    if (availabilityImpact === undefined) fields[`${prefix}.availabilityImpact`] = 'Must be between 1 and 5.';
    if (harmLikelihood === undefined) fields[`${prefix}.harmLikelihood`] = 'Must be between 1 and 5.';
    if (harmSeverity === undefined) fields[`${prefix}.harmSeverity`] = 'Must be between 1 and 5.';
    if (overallRiskScore === undefined) fields[`${prefix}.overallRiskScore`] = 'Must be a non-negative number.';
    if (!riskLevel) fields[`${prefix}.riskLevel`] = 'Must be low, medium, high, or critical.';
    if (risks === undefined) fields[`${prefix}.risksToRightsAndFreedoms`] = 'Must be boolean.';
    if (highRisks === undefined) fields[`${prefix}.highRisksToRightsAndFreedoms`] = 'Must be boolean.';
    if (highRisks === true && risks !== true) {
      fields[`${prefix}.highRisksToRightsAndFreedoms`] =
        'High risk requires risksToRightsAndFreedoms to also be true.';
    }
    if (!justification) fields[`${prefix}.justification`] = 'justification is required.';
    if (assessedAt === undefined) fields[`${prefix}.assessedAt`] = 'Must be a valid timestamp.';
    if (assessedAt !== undefined && (assessedAt < discoveredAt || assessedAt > now)) {
      fields[`${prefix}.assessedAt`] = 'Must be between breach discovery and the current time.';
    }
    if (Object.keys(fields).some((key) => key.startsWith(prefix))) return;

    assessments.push({
      id,
      breachId,
      assessedAt: assessedAt as number,
      assessor: previous?.assessor ?? {
        name: actor.displayName,
        role: 'verified-ndpr-staff',
        email: actor.email,
      },
      confidentialityImpact: confidentialityImpact as number,
      integrityImpact: integrityImpact as number,
      availabilityImpact: availabilityImpact as number,
      harmLikelihood: harmLikelihood as number,
      harmSeverity: harmSeverity as number,
      overallRiskScore: overallRiskScore as number,
      riskLevel: riskLevel as RiskAssessment['riskLevel'],
      risksToRightsAndFreedoms: risks as boolean,
      highRisksToRightsAndFreedoms: highRisks as boolean,
      justification: justification as string,
    });
  });

  if (Object.keys(fields).length > 0) return { valid: false, fields };
  const merged = new Map(existing.map((assessment) => [assessment.id, assessment]));
  assessments.forEach((assessment) => merged.set(assessment.id, assessment));
  return { valid: true, data: [...merged.values()] };
}

function normalizeNotifications(
  value: unknown,
  breachId: string,
  now: number,
  discoveredAt: number,
  existing: RegulatoryNotification[],
): ValidationResult<RegulatoryNotification[]> {
  if (value === undefined) return { valid: true, data: [] };
  if (!Array.isArray(value)) {
    return { valid: false, fields: { notifications: 'notifications must be an array.' } };
  }

  const fields: Record<string, string> = {};
  const notifications: RegulatoryNotification[] = [];
  const submittedIds = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`notifications.${index}`] = 'Notification must be an object.';
      return;
    }
    const prefix = `notifications.${index}`;
    const id = asNonEmptyString(item.id) ?? createId();
    if (submittedIds.has(id)) {
      fields[`${prefix}.id`] = 'Notification IDs must be unique within the request.';
      return;
    }
    submittedIds.add(id);
    const previous = existing.find((notification) => notification.id === id);
    const source: Record<string, unknown> = previous
      ? { ...previous, ...item }
      : item;
    const sentAt = previous?.sentAt ?? parseTimestamp(source.sentAt);
    const method = typeof source.method === 'string'
      && NOTIFICATION_METHODS.has(source.method as RegulatoryNotification['method'])
      ? source.method as RegulatoryNotification['method']
      : undefined;
    const content = asNonEmptyString(source.content);
    const referenceNumber = optionalTextField(
      source.referenceNumber,
      fields,
      `${prefix}.referenceNumber`,
    );
    const contactValue = Object.prototype.hasOwnProperty.call(item, 'ndpcContact')
      ? item.ndpcContact
      : Object.prototype.hasOwnProperty.call(item, 'nitdaContact')
        ? item.nitdaContact
        : source.ndpcContact ?? source.nitdaContact;
    const ndpcContact = optionalContact(
      contactValue,
      fields,
      `${prefix}.ndpcContact`,
    );
    const attachments = optionalNotificationAttachments(
      source.attachments,
      fields,
      `${prefix}.attachments`,
    );
    const followUps = optionalFollowUps(
      source.followUps,
      fields,
      `${prefix}.followUps`,
      discoveredAt,
      sentAt,
      now,
    );

    if (sentAt === undefined) fields[`${prefix}.sentAt`] = 'sentAt must be a valid timestamp.';
    if (sentAt !== undefined && (sentAt < discoveredAt || sentAt > now)) {
      fields[`${prefix}.sentAt`] = 'sentAt must be between breach discovery and the current time.';
    }
    if (!method) fields[`${prefix}.method`] = 'method must be email, portal, letter, or other.';
    if (!content) fields[`${prefix}.content`] = 'content is required.';
    if (Object.keys(fields).some((key) => key.startsWith(prefix))) return;

    notifications.push({
      id,
      breachId,
      sentAt: sentAt as number,
      method: method as RegulatoryNotification['method'],
      referenceNumber,
      ndpcContact,
      content: content as string,
      attachments,
      followUps,
    });
  });

  if (Object.keys(fields).length > 0) return { valid: false, fields };
  const merged = new Map(existing.map((notification) => [notification.id, notification]));
  notifications.forEach((notification) => merged.set(notification.id, notification));
  return { valid: true, data: [...merged.values()] };
}

function breachReportToInput(report: BreachReport): Record<string, unknown> {
  return {
    title: report.title,
    description: report.description,
    category: report.category,
    discoveredAt: report.discoveredAt,
    occurredAt: report.occurredAt,
    affectedSystems: report.affectedSystems,
    dataTypes: report.dataTypes,
    involvesSensitiveData: report.involvesSensitiveData,
    estimatedAffectedSubjects: report.estimatedAffectedSubjects,
    approximateRecordCount: report.approximateRecordCount,
    dataSubjectCategories: report.dataSubjectCategories,
    likelyConsequences: report.likelyConsequences,
    mitigationMeasures: report.mitigationMeasures,
    isPhasedReport: report.isPhasedReport,
    supplementsReportId: report.supplementsReportId,
    dpoContact: report.dpoContact,
    status: report.status,
    initialActions: report.initialActions,
    attachments: report.attachments,
  };
}

function highestRiskLevel(
  assessments: RiskAssessment[],
): RiskAssessment['riskLevel'] | null {
  const rank: Record<RiskAssessment['riskLevel'], number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };
  return assessments.reduce<RiskAssessment['riskLevel'] | null>(
    (highest, assessment) =>
      highest === null || rank[assessment.riskLevel] > rank[highest]
        ? assessment.riskLevel
        : highest,
    null,
  );
}

function breachChronologyErrors(
  state: BreachStateRecord,
  asOf: number,
): string[] {
  const errors: string[] = [];
  const { discoveredAt, occurredAt } = state.report;
  if (discoveredAt > asOf) errors.push('Breach discovery timestamp is in the future.');
  if (occurredAt !== undefined && occurredAt > discoveredAt) {
    errors.push('Breach occurrence timestamp is later than discovery.');
  }
  for (const assessment of state.assessments) {
    if (assessment.assessedAt < discoveredAt || assessment.assessedAt > asOf) {
      errors.push(`Risk assessment ${assessment.id} has an impossible assessment timestamp.`);
    }
    if (assessment.highRisksToRightsAndFreedoms
      && !assessment.risksToRightsAndFreedoms) {
      errors.push(
        `Risk assessment ${assessment.id} marks high risk without marking risks to rights and freedoms.`,
      );
    }
  }
  for (const notification of state.notifications) {
    if (notification.sentAt < discoveredAt || notification.sentAt > asOf) {
      errors.push(`Regulatory notification ${notification.id} has an impossible sent timestamp.`);
    }
    for (const followUp of notification.followUps ?? []) {
      if (followUp.timestamp < discoveredAt
        || followUp.timestamp < notification.sentAt
        || followUp.timestamp > asOf) {
        errors.push(
          `Regulatory notification ${notification.id} has a follow-up with an impossible timestamp.`,
        );
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// ROPA processing-record contract
// ---------------------------------------------------------------------------

const ROPA_STATUSES = new Set<ProcessingRecord['status']>([
  'active',
  'inactive',
  'archived',
]);
const ROPA_LAWFUL_BASES = new Set<ProcessingRecord['lawfulBasis']>([
  'consent',
  'contract',
  'legal_obligation',
  'vital_interests',
  'public_interest',
  'legitimate_interests',
]);
const ROPA_DATA_SOURCES = new Set<ProcessingRecord['dataSource']>([
  'data_subject',
  'third_party',
  'public_source',
  'other',
]);

export function processingRecordFromRow(
  row: PrismaProcessingRecord,
): ProcessingRecord {
  if (row.recordData === null) {
    throw new Error(`Processing record ${row.id} is missing its lossless recordData snapshot`);
  }
  return {
    ...(row.recordData as unknown as ProcessingRecord),
    id: row.id,
    lawfulBasis: row.lawfulBasis as ProcessingRecord['lawfulBasis'],
    status: row.status as ProcessingRecord['status'],
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

function validateProcessingRecordInputFields(
  input: Record<string, unknown>,
  update: boolean,
): Record<string, string> {
  const fields: Record<string, string> = {};
  const has = (field: string) => Object.prototype.hasOwnProperty.call(input, field);
  const mutableFields = [
    'name',
    'purpose',
    'description',
    'controllerDetails',
    'jointControllerDetails',
    'processorDetails',
    'lawfulBasis',
    'lawfulBasisJustification',
    'purposes',
    'dataCategories',
    'sensitiveDataCategories',
    'dataSubjectCategories',
    'dataSubjects',
    'recipients',
    'crossBorderTransfers',
    'transferCountries',
    'retentionPeriod',
    'retentionJustification',
    'securityMeasures',
    'dataSource',
    'thirdPartySourceDetails',
    'dpiaRequired',
    'dpiaConducted',
    'dpiaReference',
    'automatedDecisionMaking',
    'automatedDecisionMakingDetails',
    'status',
    'department',
    'systemsUsed',
    'lastReviewedAt',
    'nextReviewDate',
  ];
  if (update && !mutableFields.some(has)) {
    fields.body = 'Provide at least one allowlisted processing-record field to update.';
  }

  const requiredTextFields = [
    'name',
    'purpose',
    'description',
    'lawfulBasisJustification',
    'retentionPeriod',
  ];
  const optionalTextFields = [
    'retentionJustification',
    'thirdPartySourceDetails',
    'dpiaReference',
    'automatedDecisionMakingDetails',
    'department',
  ];
  for (const field of [...requiredTextFields, ...optionalTextFields]) {
    const optionalClear = optionalTextFields.includes(field) && input[field] === null;
    if (has(field) && !optionalClear && !asNonEmptyString(input[field])) {
      fields[field] = `${field} must be non-empty text${optionalTextFields.includes(field) ? ' or null' : ''} when provided.`;
    }
  }

  const arrayFields = [
    'purposes',
    'dataCategories',
    'sensitiveDataCategories',
    'dataSubjectCategories',
    'dataSubjects',
    'recipients',
    'securityMeasures',
    'systemsUsed',
  ];
  const nullableArrayFields = new Set(['sensitiveDataCategories', 'systemsUsed']);
  for (const field of arrayFields) {
    const optionalClear = nullableArrayFields.has(field) && input[field] === null;
    if (has(field) && !optionalClear && stringArray(input[field]) === undefined) {
      fields[field] = `${field} must be an array of strings${nullableArrayFields.has(field) ? ' or null' : ''}.`;
    }
  }

  for (const field of ['dpiaRequired', 'dpiaConducted', 'automatedDecisionMaking']) {
    if (has(field) && typeof input[field] !== 'boolean') {
      fields[field] = `${field} must be boolean.`;
    }
  }

  if (has('lawfulBasis')
    && (typeof input.lawfulBasis !== 'string'
      || !ROPA_LAWFUL_BASES.has(input.lawfulBasis as ProcessingRecord['lawfulBasis']))) {
    fields.lawfulBasis = 'lawfulBasis is not supported.';
  }
  if (has('dataSource')
    && (typeof input.dataSource !== 'string'
      || !ROPA_DATA_SOURCES.has(input.dataSource as ProcessingRecord['dataSource']))) {
    fields.dataSource = 'dataSource must be data_subject, third_party, public_source, or other.';
  }
  if (has('status')
    && (typeof input.status !== 'string'
      || !ROPA_STATUSES.has(input.status as ProcessingRecord['status']))) {
    fields.status = 'status must be active, inactive, or archived.';
  }

  const validateDetails = (
    field: 'controllerDetails' | 'jointControllerDetails' | 'processorDetails',
    required: readonly string[],
    optional: readonly string[],
  ) => {
    if (!has(field)) return;
    const details = input[field];
    if (details === null && field !== 'controllerDetails') return;
    if (!isRecord(details)) {
      fields[field] = `${field} must be an object${field === 'controllerDetails' ? '' : ' or null'}.`;
      return;
    }
    const allowed = new Set([...required, ...optional]);
    for (const key of Object.keys(details)) {
      if (!allowed.has(key)) fields[`${field}.${key}`] = 'Unsupported field.';
    }
    for (const key of required) {
      if (!asNonEmptyString(details[key])) {
        fields[`${field}.${key}`] = `${key} is required.`;
      }
    }
    for (const key of optional) {
      if (Object.prototype.hasOwnProperty.call(details, key)
        && !asNonEmptyString(details[key])) {
        fields[`${field}.${key}`] = `${key} must be non-empty text when provided.`;
      }
    }
  };

  validateDetails(
    'controllerDetails',
    ['name', 'contact', 'address'],
    ['registrationNumber', 'dpoContact'],
  );
  validateDetails(
    'jointControllerDetails',
    ['name', 'contact', 'address', 'responsibilities'],
    [],
  );
  validateDetails(
    'processorDetails',
    ['name', 'contact', 'address'],
    ['contractReference'],
  );
  return fields;
}

export function normalizeProcessingRecordInput(
  input: unknown,
  existing?: ProcessingRecord,
  now = Date.now(),
): ValidationResult<ProcessingRecord> {
  if (!isRecord(input)) {
    return { valid: false, fields: { body: 'Request body must be a JSON object.' } };
  }

  const inputFields = validateProcessingRecordInputFields(input, existing !== undefined);
  if (Object.keys(inputFields).length > 0) {
    return { valid: false, fields: inputFields };
  }

  const value = <K extends keyof ProcessingRecord>(key: K): ProcessingRecord[K] | undefined =>
    Object.prototype.hasOwnProperty.call(input, key)
      ? input[key] as ProcessingRecord[K]
      : existing?.[key];
  const fields: Record<string, string> = {};
  const name = asNonEmptyString(input.name ?? input.purpose) ?? existing?.name ?? '';
  const purposes = Object.prototype.hasOwnProperty.call(input, 'purposes')
    ? stringArray(input.purposes) ?? []
    : Object.prototype.hasOwnProperty.call(input, 'purpose')
      ? [asNonEmptyString(input.purpose) ?? ''].filter(Boolean)
      : existing?.purposes ?? [];
  const dataSubjectCategories = Object.prototype.hasOwnProperty.call(input, 'dataSubjectCategories')
    ? stringArray(input.dataSubjectCategories) ?? []
    : Object.prototype.hasOwnProperty.call(input, 'dataSubjects')
      ? stringArray(input.dataSubjects) ?? []
      : existing?.dataSubjectCategories ?? [];
  const statusCandidate = value('status') ?? 'active';
  const validStatus = typeof statusCandidate === 'string'
    && ROPA_STATUSES.has(statusCandidate as ProcessingRecord['status']);
  const status: ProcessingRecord['status'] = validStatus
    ? statusCandidate as ProcessingRecord['status']
    : 'active';
  if (!validStatus) fields.status = 'status must be active, inactive, or archived.';

  let crossBorderTransfers = existing?.crossBorderTransfers;
  if (Object.prototype.hasOwnProperty.call(input, 'crossBorderTransfers')) {
    if (input.crossBorderTransfers === null) {
      crossBorderTransfers = undefined;
    } else {
      const parsedTransfers = normalizeCrossBorderTransfers(input.crossBorderTransfers);
      if (!parsedTransfers.valid) Object.assign(fields, parsedTransfers.fields);
      else crossBorderTransfers = parsedTransfers.data;
    }
  }
  if (Object.prototype.hasOwnProperty.call(input, 'transferCountries')) {
    fields.transferCountries =
      'Legacy transferCountries cannot preserve safeguards; send complete crossBorderTransfers objects.';
  }

  const hasLastReviewedAt = Object.prototype.hasOwnProperty.call(input, 'lastReviewedAt');
  const lastReviewedAt = hasLastReviewedAt
    ? input.lastReviewedAt === null
      ? undefined
      : parseTimestamp(input.lastReviewedAt)
    : existing?.lastReviewedAt;
  if (hasLastReviewedAt && input.lastReviewedAt !== null && lastReviewedAt === undefined) {
    fields.lastReviewedAt = 'lastReviewedAt must be a valid unambiguous ISO timestamp or epoch milliseconds.';
  }
  const hasNextReviewDate = Object.prototype.hasOwnProperty.call(input, 'nextReviewDate');
  const nextReviewDate = hasNextReviewDate
    ? input.nextReviewDate === null
      ? undefined
      : parseTimestamp(input.nextReviewDate)
    : existing?.nextReviewDate;
  if (hasNextReviewDate && input.nextReviewDate !== null && nextReviewDate === undefined) {
    fields.nextReviewDate = 'nextReviewDate must be a valid unambiguous ISO timestamp or epoch milliseconds.';
  }

  const hasInput = (field: string) => Object.prototype.hasOwnProperty.call(input, field);
  const optionalTextUpdate = (field: string, current: string | undefined) =>
    hasInput(field)
      ? input[field] === null
        ? undefined
        : optionalText(input[field])
      : current;
  const jointControllerDetails = hasInput('jointControllerDetails')
    ? input.jointControllerDetails === null
      ? undefined
      : cloneOptional<ProcessingRecord['jointControllerDetails']>(input.jointControllerDetails)
    : existing?.jointControllerDetails;
  const processorDetails = hasInput('processorDetails')
    ? input.processorDetails === null
      ? undefined
      : cloneOptional<ProcessingRecord['processorDetails']>(input.processorDetails)
    : existing?.processorDetails;
  const sensitiveDataCategories = hasInput('sensitiveDataCategories')
    ? input.sensitiveDataCategories === null
      ? undefined
      : stringArray(input.sensitiveDataCategories)
    : existing?.sensitiveDataCategories;
  const systemsUsed = hasInput('systemsUsed')
    ? input.systemsUsed === null
      ? undefined
      : stringArray(input.systemsUsed)
    : existing?.systemsUsed;
  const retentionJustification = optionalTextUpdate(
    'retentionJustification',
    existing?.retentionJustification,
  );
  const thirdPartySourceDetails = optionalTextUpdate(
    'thirdPartySourceDetails',
    existing?.thirdPartySourceDetails,
  );
  const dpiaReference = optionalTextUpdate('dpiaReference', existing?.dpiaReference);
  const automatedDecisionMakingDetails = optionalTextUpdate(
    'automatedDecisionMakingDetails',
    existing?.automatedDecisionMakingDetails,
  );
  const department = optionalTextUpdate('department', existing?.department);
  if (Object.keys(fields).length > 0) return { valid: false, fields };

  const record: ProcessingRecord = {
    id: existing?.id ?? createId(),
    name,
    description: asNonEmptyString(input.description ?? input.purpose) ?? existing?.description ?? '',
    controllerDetails: cloneOptional<ProcessingRecord['controllerDetails']>(input.controllerDetails)
      ?? existing?.controllerDetails
      ?? { name: '', contact: '', address: '' },
    jointControllerDetails,
    processorDetails,
    lawfulBasis: (input.lawfulBasis ?? existing?.lawfulBasis ?? '') as ProcessingRecord['lawfulBasis'],
    lawfulBasisJustification: asNonEmptyString(input.lawfulBasisJustification)
      ?? existing?.lawfulBasisJustification
      ?? '',
    purposes,
    dataCategories: Object.prototype.hasOwnProperty.call(input, 'dataCategories')
      ? stringArray(input.dataCategories) ?? []
      : existing?.dataCategories ?? [],
    sensitiveDataCategories,
    dataSubjectCategories,
    recipients: Object.prototype.hasOwnProperty.call(input, 'recipients')
      ? stringArray(input.recipients) ?? []
      : existing?.recipients ?? [],
    crossBorderTransfers,
    retentionPeriod: asNonEmptyString(input.retentionPeriod) ?? existing?.retentionPeriod ?? '',
    retentionJustification,
    securityMeasures: Object.prototype.hasOwnProperty.call(input, 'securityMeasures')
      ? stringArray(input.securityMeasures) ?? []
      : existing?.securityMeasures ?? [],
    dataSource: (input.dataSource ?? existing?.dataSource ?? 'data_subject') as ProcessingRecord['dataSource'],
    thirdPartySourceDetails,
    dpiaRequired: typeof input.dpiaRequired === 'boolean'
      ? input.dpiaRequired
      : typeof input.dpiaConducted === 'boolean'
        ? input.dpiaConducted
        : existing?.dpiaRequired ?? false,
    dpiaReference,
    automatedDecisionMaking: typeof input.automatedDecisionMaking === 'boolean'
      ? input.automatedDecisionMaking
      : existing?.automatedDecisionMaking ?? false,
    automatedDecisionMakingDetails,
    status,
    department,
    systemsUsed,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastReviewedAt,
    nextReviewDate,
  };

  let validation;
  try {
    validation = validateProcessingRecord(record);
  } catch {
    return {
      valid: false,
      fields: { processingRecord: 'Processing record contains invalid nested field types.' },
    };
  }
  if (!validation.valid) {
    return {
      valid: false,
      fields: { processingRecord: validation.errors.join('; ') },
    };
  }
  return { valid: true, data: record };
}

export function processingRecordCreateData(
  tenantId: string,
  record: ProcessingRecord,
): Prisma.ProcessingRecordUncheckedCreateInput {
  return {
    tenantId,
    id: record.id,
    purpose: record.purposes[0] ?? record.name,
    lawfulBasis: record.lawfulBasis,
    dataCategories: toInputJson(record.dataCategories),
    dataSubjects: toInputJson(record.dataSubjectCategories),
    recipients: toInputJson(record.recipients),
    retentionPeriod: record.retentionPeriod,
    securityMeasures: toInputJson(record.securityMeasures),
    transferCountries: record.crossBorderTransfers
      ? toInputJson(record.crossBorderTransfers.map(({ destinationCountry }) => destinationCountry))
      : Prisma.DbNull,
    transferMechanism: record.crossBorderTransfers?.[0]?.transferMechanism ?? null,
    dpiaConducted: record.dpiaRequired,
    recordData: toInputJson(record),
    status: record.status,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    removedAt: null,
  };
}

// ---------------------------------------------------------------------------
// DPIA contract
// ---------------------------------------------------------------------------

const DPIA_STATUSES = new Set(['draft', 'in_progress', 'completed', 'approved', 'rejected']);

export interface DPIAStateRecord {
  result: DPIAResult;
  status: string;
  conductedBy: string;
  approvedBy: string | null;
  updatedAt: number;
}

function validateDpiaScalarInputFields(
  input: Record<string, unknown>,
  nested: Record<string, unknown>,
  update: boolean,
): Record<string, string> {
  const fields: Record<string, string> = {};
  const has = (source: Record<string, unknown>, field: string) =>
    Object.prototype.hasOwnProperty.call(source, field);
  const resultFields = [
    'title',
    'processingDescription',
    'answers',
    'risks',
    'canProceed',
    'conclusion',
    'recommendations',
    'reviewDate',
    'version',
    'completedAt',
    'ndpcConsultationRequired',
    'ndpcConsultationDate',
    'ndpcConsultationReference',
    'lawfulBasis',
    'involvesCrossBorderTransfer',
  ];
  const hasResultField = resultFields.some((field) => has(input, field) || has(nested, field));
  if (update && !hasResultField && !has(input, 'projectName')
    && !has(input, 'description') && !has(input, 'status')) {
    fields.body = 'Provide at least one allowlisted DPIA field to update.';
  }

  const validateText = (source: Record<string, unknown>, field: string, output = field) => {
    if (has(source, field) && !asNonEmptyString(source[field])) {
      fields[output] = `${output} must be non-empty text.`;
    }
  };
  for (const source of nested === input ? [input] : [input, nested]) {
    for (const field of ['title', 'processingDescription', 'conclusion', 'version']) {
      validateText(source, field);
    }
  }
  validateText(input, 'projectName', 'title');
  validateText(input, 'description', 'processingDescription');

  if (has(input, 'status')
    && (typeof input.status !== 'string' || !DPIA_STATUSES.has(input.status))) {
    fields.status = 'status is not supported.';
  }
  return fields;
}

export function dpiaStateFromRow(row: PrismaDPIARecord): DPIAStateRecord {
  const result = row.dpiaData as unknown as DPIAResult;
  return {
    result: {
      ...result,
      id: row.id,
      title: row.projectName,
      processingDescription: row.description,
      overallRiskLevel: row.overallRisk as DPIAResult['overallRiskLevel'],
      startedAt: result.startedAt ?? row.createdAt.getTime(),
    },
    status: row.status,
    conductedBy: row.conductedBy,
    approvedBy: row.approvedBy,
    updatedAt: row.updatedAt.getTime(),
  };
}

export function normalizeDpiaInput(
  input: unknown,
  actor: VerifiedActorProfile,
  existing?: DPIAStateRecord,
  now = Date.now(),
): ValidationResult<DPIAStateRecord> {
  if (!isRecord(input)) {
    return { valid: false, fields: { body: 'Request body must be a JSON object.' } };
  }
  if (Object.prototype.hasOwnProperty.call(input, 'dpiaData') && !isRecord(input.dpiaData)) {
    return { valid: false, fields: { dpiaData: 'dpiaData must be an object.' } };
  }
  const nested = isRecord(input.dpiaData) ? input.dpiaData : input;
  const scalarFields = validateDpiaScalarInputFields(input, nested, existing !== undefined);
  if (Object.keys(scalarFields).length > 0) {
    return { valid: false, fields: scalarFields };
  }
  const read = (key: string): unknown =>
    Object.prototype.hasOwnProperty.call(input, key)
      ? input[key]
      : nested[key];
  const existingResult = existing?.result;
  const fields: Record<string, string> = {};
  const title = asNonEmptyString(read('title') ?? input.projectName) ?? existingResult?.title;
  const processingDescription = asNonEmptyString(read('processingDescription') ?? input.description)
    ?? existingResult?.processingDescription;
  const answersValue = read('answers');
  const answers = answersValue === undefined
    ? existingResult?.answers
    : normalizeDpiaAnswers(answersValue, fields);
  const risksValue = read('risks');
  const risks = risksValue === undefined
    ? existingResult?.risks
    : normalizeDpiaRisks(risksValue, fields);
  const conclusion = asNonEmptyString(read('conclusion')) ?? existingResult?.conclusion;
  const version = asNonEmptyString(read('version')) ?? existingResult?.version;
  const canProceedValue = read('canProceed');
  let canProceed = canProceedValue === undefined
    ? existingResult?.canProceed ?? false
    : typeof canProceedValue === 'boolean'
      ? canProceedValue
      : existingResult?.canProceed ?? false;
  if (canProceedValue !== undefined && typeof canProceedValue !== 'boolean') {
    fields.canProceed = 'canProceed must be boolean.';
  }

  const recommendationsValue = read('recommendations');
  const recommendations = recommendationsValue === undefined
    ? existingResult?.recommendations
    : recommendationsValue === null
      ? undefined
      : stringArray(recommendationsValue);
  if (recommendationsValue !== undefined && recommendationsValue !== null
    && recommendations === undefined) {
    fields.recommendations = 'recommendations must be an array of strings.';
  }

  const reviewDateValue = read('reviewDate');
  const reviewDate = reviewDateValue === undefined
    ? existingResult?.reviewDate
    : reviewDateValue === null
      ? undefined
      : parseTimestamp(reviewDateValue);
  if (reviewDateValue !== undefined && reviewDateValue !== null && reviewDate === undefined) {
    fields.reviewDate = 'reviewDate must be a valid unambiguous ISO timestamp or epoch milliseconds.';
  }

  const consultationRequiredValue = read('ndpcConsultationRequired');
  const ndpcConsultationRequired = consultationRequiredValue === undefined
    ? existingResult?.ndpcConsultationRequired
    : typeof consultationRequiredValue === 'boolean'
      ? consultationRequiredValue
      : existingResult?.ndpcConsultationRequired;
  if (consultationRequiredValue !== undefined && typeof consultationRequiredValue !== 'boolean') {
    fields.ndpcConsultationRequired = 'ndpcConsultationRequired must be boolean.';
  }

  const consultationDateValue = read('ndpcConsultationDate');
  const ndpcConsultationDate = consultationDateValue === undefined
    ? existingResult?.ndpcConsultationDate
    : consultationDateValue === null
      ? undefined
      : parseTimestamp(consultationDateValue);
  if (consultationDateValue !== undefined && consultationDateValue !== null
    && ndpcConsultationDate === undefined) {
    fields.ndpcConsultationDate =
      'ndpcConsultationDate must be a valid unambiguous ISO timestamp or epoch milliseconds.';
  }

  const consultationReferenceValue = read('ndpcConsultationReference');
  const ndpcConsultationReference = consultationReferenceValue === undefined
    ? existingResult?.ndpcConsultationReference
    : consultationReferenceValue === null
      ? undefined
      : optionalText(consultationReferenceValue);
  if (consultationReferenceValue !== undefined && consultationReferenceValue !== null
    && !asNonEmptyString(consultationReferenceValue)) {
    fields.ndpcConsultationReference = 'ndpcConsultationReference must be non-empty text or null.';
  }

  const lawfulBasisValue = read('lawfulBasis');
  const lawfulBasis = lawfulBasisValue === undefined
    ? existingResult?.lawfulBasis
    : lawfulBasisValue === null
      ? undefined
      : optionalText(lawfulBasisValue);
  if (lawfulBasisValue !== undefined && lawfulBasisValue !== null
    && !asNonEmptyString(lawfulBasisValue)) {
    fields.lawfulBasis = 'lawfulBasis must be non-empty text or null.';
  }

  const crossBorderValue = read('involvesCrossBorderTransfer');
  const involvesCrossBorderTransfer = crossBorderValue === undefined
    ? existingResult?.involvesCrossBorderTransfer
    : typeof crossBorderValue === 'boolean'
      ? crossBorderValue
      : existingResult?.involvesCrossBorderTransfer;
  if (crossBorderValue !== undefined && typeof crossBorderValue !== 'boolean') {
    fields.involvesCrossBorderTransfer = 'involvesCrossBorderTransfer must be boolean.';
  }

  const requestedStatus = asNonEmptyString(input.status);
  const status = requestedStatus
    ?? existing?.status
    ?? (parseTimestamp(read('completedAt')) !== undefined
      ? canProceed ? 'approved' : 'completed'
      : 'draft');
  if (status === 'approved') canProceed = true;

  if (!title) fields.title = 'title or projectName is required.';
  if (!processingDescription) fields.processingDescription = 'processingDescription or description is required.';
  if (!answers) fields.answers = 'answers must be an object with scalar or string-array values.';
  if (!risks || risks.length === 0) {
    fields.risks = 'risks must contain at least one valid DPIA risk.';
  }
  if (!conclusion) fields.conclusion = 'conclusion is required.';
  if (!version) fields.version = 'version is required.';
  if (!DPIA_STATUSES.has(status)) fields.status = 'status is not supported.';
  if (Object.keys(fields).length > 0) return { valid: false, fields };

  const terminalStatus = ['completed', 'approved', 'rejected'].includes(status);
  const completedAtInput = read('completedAt');
  const parsedCompletedAt = completedAtInput === undefined
    ? undefined
    : parseTimestamp(completedAtInput);
  if (completedAtInput !== undefined && parsedCompletedAt === undefined) {
    return { valid: false, fields: { completedAt: 'completedAt must be a valid timestamp.' } };
  }
  if (!terminalStatus && completedAtInput !== undefined) {
    return {
      valid: false,
      fields: { completedAt: 'completedAt is only valid for a terminal DPIA status.' },
    };
  }
  const completedAt = terminalStatus
    ? parsedCompletedAt ?? existingResult?.completedAt ?? now
    : undefined;
  if (completedAt !== undefined && completedAt > now) {
    return { valid: false, fields: { completedAt: 'completedAt cannot be in the future.' } };
  }

  const riskList = risks as DPIARisk[];
  const result: DPIAResult = {
    id: existingResult?.id ?? createId(),
    title: title as string,
    processingDescription: processingDescription as string,
    startedAt: existingResult?.startedAt ?? now,
    completedAt,
    assessor: existingResult?.assessor ?? {
      name: actor.displayName,
      role: 'verified-ndpr-staff',
      email: actor.email,
    },
    answers: answers as DPIAResult['answers'],
    risks: riskList,
    overallRiskLevel: highestDpiaRiskLevel(riskList),
    canProceed,
    conclusion: conclusion as string,
    recommendations,
    reviewDate,
    version: version as string,
    ndpcConsultationRequired,
    ndpcConsultationDate,
    ndpcConsultationReference,
    lawfulBasis,
    involvesCrossBorderTransfer,
  };

  return {
    valid: true,
    data: {
      result,
      status,
      conductedBy: existing?.conductedBy ?? actor.id,
      approvedBy: status === 'approved'
        ? existing?.status === 'approved'
          ? existing.approvedBy
          : actor.id
        : existing?.approvedBy ?? null,
      updatedAt: now,
    },
  };
}

export function dpiaCreateData(
  tenantId: string,
  state: DPIAStateRecord,
): Prisma.DPIARecordUncheckedCreateInput {
  return {
    tenantId,
    id: state.result.id,
    projectName: state.result.title,
    description: state.result.processingDescription,
    dpiaData: toInputJson(state.result),
    overallRisk: state.result.overallRiskLevel,
    score: calculateDpiaRiskScore(state.result),
    status: state.status,
    conductedBy: state.conductedBy,
    approvedBy: state.approvedBy,
    createdAt: new Date(state.result.startedAt),
    updatedAt: new Date(state.updatedAt),
    removedAt: null,
  };
}

export function calculateDpiaRiskScore(result: DPIAResult): number {
  return result.risks.reduce(
    (highest, risk) => Math.max(highest, risk.residualScore ?? risk.score),
    0,
  );
}

// ---------------------------------------------------------------------------
// Small validation helpers
// ---------------------------------------------------------------------------

function mergeValidationFields(
  ...results: Array<ValidationResult<unknown>>
): Record<string, string> {
  return results.reduce<Record<string, string>>(
    (fields, result) => result.valid ? fields : { ...fields, ...result.fields },
    {},
  );
}

function parseTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
  if (value instanceof Date && Number.isFinite(value.getTime()) && value.getTime() >= 0) {
    return value.getTime();
  }
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const dateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(trimmed);
  const match = dateOnly ?? dateTime;
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendarDate = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`);
  if (!Number.isFinite(calendarDate.getTime())
    || calendarDate.getUTCFullYear() !== year
    || calendarDate.getUTCMonth() + 1 !== month
    || calendarDate.getUTCDate() !== day) {
    return undefined;
  }

  if (dateTime) {
    const hour = Number(dateTime[4]);
    const minute = Number(dateTime[5]);
    const second = Number(dateTime[6]);
    const offset = dateTime[8];
    if (hour > 23 || minute > 59 || second > 59) return undefined;
    if (offset !== 'Z') {
      const offsetHour = Number(offset.slice(1, 3));
      const offsetMinute = Number(offset.slice(4, 6));
      if (offsetHour > 23 || offsetMinute > 59) return undefined;
    }
  }

  const parsed = new Date(trimmed).getTime();
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return undefined;
  return value.map((item) => item.trim()).filter(Boolean);
}

function optionalStringArray(
  value: unknown,
  fields: Record<string, string>,
  field: string,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = stringArray(value);
  if (!parsed) fields[field] = `${field} must be an array of strings.`;
  return parsed;
}

function optionalText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'string' ? value.trim() || undefined : undefined;
}

function optionalTextField(
  value: unknown,
  fields: Record<string, string>,
  field: string,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  const parsed = asNonEmptyString(value);
  if (!parsed) fields[field] = `${field} must be non-empty text or null when provided.`;
  return parsed;
}

function optionalBoolean(
  value: unknown,
  fields: Record<string, string>,
  field: string,
): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') {
    fields[field] = `${field} must be boolean when provided.`;
    return undefined;
  }
  return value;
}

function optionalNonNegativeInteger(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
}

function nonNegativeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function boundedNumber(value: unknown, minimum: number, maximum: number): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
    ? value
    : undefined;
}

function boundedInteger(value: unknown, minimum: number, maximum: number): number | undefined {
  return Number.isInteger(value) && (value as number) >= minimum && (value as number) <= maximum
    ? value as number
    : undefined;
}

function optionalContact(
  value: unknown,
  fields: Record<string, string>,
  field: string,
): { name: string; email: string; phone?: string } | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    fields[field] = `${field} must be an object.`;
    return undefined;
  }
  const name = asNonEmptyString(value.name);
  const email = asNonEmptyString(value.email);
  if (!name || !email) {
    fields[field] = `${field} requires name and email.`;
    return undefined;
  }
  return { name, email, phone: optionalText(value.phone) };
}

function optionalReportAttachments(
  value: unknown,
  fields: Record<string, string>,
): BreachReport['attachments'] {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    fields.attachments = 'attachments must be an array.';
    return undefined;
  }
  const attachments: NonNullable<BreachReport['attachments']> = [];
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`attachments.${index}`] = 'Attachment must be an object.';
      return;
    }
    const name = asNonEmptyString(item.name);
    const type = asNonEmptyString(item.type);
    const url = asNonEmptyString(item.url);
    const addedAt = parseTimestamp(item.addedAt);
    if (!name || !type || !url || addedAt === undefined) {
      fields[`attachments.${index}`] = 'Attachment requires name, type, url, and addedAt.';
      return;
    }
    attachments.push({ id: asNonEmptyString(item.id) ?? createId(), name, type, url, addedAt });
  });
  return attachments;
}

function optionalNotificationAttachments(
  value: unknown,
  fields: Record<string, string>,
  field: string,
): RegulatoryNotification['attachments'] {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    fields[field] = `${field} must be an array.`;
    return undefined;
  }
  const attachments: NonNullable<RegulatoryNotification['attachments']> = [];
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`${field}.${index}`] = 'Attachment must be an object.';
      return;
    }
    const name = asNonEmptyString(item.name);
    const type = asNonEmptyString(item.type);
    const url = asNonEmptyString(item.url);
    if (!name || !type || !url) {
      fields[`${field}.${index}`] = 'Attachment requires name, type, and url.';
      return;
    }
    attachments.push({ id: asNonEmptyString(item.id) ?? createId(), name, type, url });
  });
  return attachments;
}

function optionalFollowUps(
  value: unknown,
  fields: Record<string, string>,
  field: string,
  discoveredAt: number,
  notificationSentAt: number | undefined,
  now: number,
): RegulatoryNotification['followUps'] {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    fields[field] = `${field} must be an array.`;
    return undefined;
  }
  const followUps: NonNullable<RegulatoryNotification['followUps']> = [];
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`${field}.${index}`] = 'Follow-up must be an object.';
      return;
    }
    const timestamp = parseTimestamp(item.timestamp);
    const direction = item.direction === 'sent' || item.direction === 'received'
      ? item.direction
      : undefined;
    const content = asNonEmptyString(item.content);
    const attachments = optionalNotificationAttachments(
      item.attachments,
      fields,
      `${field}.${index}.attachments`,
    );
    if (timestamp === undefined || !direction || !content) {
      fields[`${field}.${index}`] = 'Follow-up requires timestamp, direction, and content.';
      return;
    }
    if (timestamp < discoveredAt
      || (notificationSentAt !== undefined && timestamp < notificationSentAt)
      || timestamp > now) {
      fields[`${field}.${index}.timestamp`] =
        'Follow-up timestamp must be between notification delivery and the current time.';
      return;
    }
    followUps.push({ timestamp, direction, content, attachments });
  });
  return followUps;
}

function normalizeInputBreachStatus(value: unknown): BreachReport['status'] | undefined {
  if (value === undefined) return 'ongoing';
  if (value === 'investigating') return 'ongoing';
  if (value === 'closed') return 'resolved';
  return typeof value === 'string' && BREACH_STATUSES.has(value as BreachReport['status'])
    ? value as BreachReport['status']
    : undefined;
}

function normalizeStoredBreachStatus(value: string): BreachReport['status'] {
  return normalizeInputBreachStatus(value) ?? 'ongoing';
}

function normalizeCrossBorderTransfers(
  value: unknown,
): ValidationResult<NonNullable<ProcessingRecord['crossBorderTransfers']>> {
  if (!Array.isArray(value)) {
    return {
      valid: false,
      fields: { crossBorderTransfers: 'crossBorderTransfers must be an array.' },
    };
  }
  const fields: Record<string, string> = {};
  const transfers: NonNullable<ProcessingRecord['crossBorderTransfers']> = [];
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`crossBorderTransfers.${index}`] = 'Transfer must be an object.';
      return;
    }
    const destinationCountry = asNonEmptyString(item.destinationCountry);
    const safeguards = asNonEmptyString(item.safeguards);
    const transferMechanism = asNonEmptyString(item.transferMechanism);
    const countryCode = item.countryCode === undefined
      ? undefined
      : asNonEmptyString(item.countryCode);
    if (!destinationCountry || !safeguards || !transferMechanism
      || (item.countryCode !== undefined && !countryCode)) {
      fields[`crossBorderTransfers.${index}`] =
        'Transfer requires destinationCountry, safeguards, transferMechanism, and a valid optional countryCode.';
      return;
    }
    transfers.push({ destinationCountry, safeguards, transferMechanism, countryCode });
  });
  return Object.keys(fields).length > 0
    ? { valid: false, fields }
    : { valid: true, data: transfers };
}

function normalizeDpiaAnswers(
  value: unknown,
  fields: Record<string, string>,
): DPIAResult['answers'] | undefined {
  if (!isRecord(value)) return undefined;
  const answers: DPIAResult['answers'] = {};
  for (const [questionId, answer] of Object.entries(value)) {
    const validScalar = typeof answer === 'string'
      || typeof answer === 'boolean'
      || (typeof answer === 'number' && Number.isFinite(answer));
    const validStringArray = Array.isArray(answer)
      && answer.every((item) => typeof item === 'string');
    if (!questionId.trim() || (!validScalar && !validStringArray)) {
      fields[`answers.${questionId || '(empty)'}`] =
        'Answer must be a string, finite number, boolean, or string array.';
      continue;
    }
    answers[questionId] = Array.isArray(answer) ? [...answer] : answer;
  }
  return answers;
}

function normalizeDpiaRisks(
  value: unknown,
  fields: Record<string, string>,
): DPIARisk[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const risks: DPIARisk[] = [];
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      fields[`risks.${index}`] = 'Risk must be an object.';
      return;
    }
    const description = asNonEmptyString(item.description);
    const likelihood = boundedNumber(item.likelihood, 1, 5);
    const impact = boundedNumber(item.impact, 1, 5);
    const mitigated = typeof item.mitigated === 'boolean' ? item.mitigated : undefined;
    const relatedQuestionIds = stringArray(item.relatedQuestionIds);
    const residualScore = item.residualScore === undefined
      ? undefined
      : boundedInteger(item.residualScore, 0, 25);
    const mitigationMeasures = item.mitigationMeasures === undefined
      ? undefined
      : stringArray(item.mitigationMeasures);
    if (!description || likelihood === undefined || impact === undefined
      || mitigated === undefined || !relatedQuestionIds
      || (item.residualScore !== undefined && residualScore === undefined)
      || (item.mitigationMeasures !== undefined && !mitigationMeasures)) {
      fields[`risks.${index}`] = 'Risk fields are invalid or incomplete.';
      return;
    }
    const score = likelihood * impact;
    const level = dpiARiskLevelForScore(residualScore ?? score);
    risks.push({
      id: asNonEmptyString(item.id) ?? createId(),
      description,
      likelihood,
      impact,
      score,
      level,
      mitigationMeasures,
      mitigated,
      residualScore,
      relatedQuestionIds,
    });
  });
  return risks;
}

function dpiARiskLevelForScore(score: number): DPIARisk['level'] {
  if (score >= 17) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

function highestDpiaRiskLevel(risks: DPIARisk[]): DPIAResult['overallRiskLevel'] {
  const rank: Record<DPIARisk['level'], number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };
  return risks.reduce<DPIARisk['level']>(
    (highest, risk) => rank[risk.level] > rank[highest] ? risk.level : highest,
    'low',
  );
}

function cloneOptional<T>(value: unknown): T | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as T;
}

function fromJsonArray<T>(value: Prisma.JsonValue): T[] {
  return Array.isArray(value) ? value as unknown as T[] : [];
}

function fromOptionalJson<T>(value: Prisma.JsonValue | null): T | undefined {
  return value === null ? undefined : value as unknown as T;
}
