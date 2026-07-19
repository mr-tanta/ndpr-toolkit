import type {
  BreachReport as ToolkitBreachReport,
  ConsentSettings,
  CrossBorderTransfer,
  DPIAResult,
  DSRRequest as ToolkitDSRRequest,
  ProcessingActivity,
  ProcessingRecord as ToolkitProcessingRecord,
  RecordOfProcessingActivities,
  RegulatoryNotification,
  RiskAssessment,
} from '@tantainnovative/ndpr-toolkit';
import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp as timestampColumn,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const timestamp = <TName extends string>(name: TName) =>
  timestampColumn(name, { precision: 3 });

export const consentRecords = pgTable(
  'ndpr_consent_records',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    subjectId: text('subject_id').notNull(),
    activeSubjectKey: text('active_subject_key'),
    consents: jsonb('consents').$type<ConsentSettings['consents']>().notNull(),
    version: text('version').notNull(),
    method: text('method').notNull(),
    hasInteracted: boolean('has_interacted').notNull(),
    lawfulBasis: text('lawful_basis').$type<ConsentSettings['lawfulBasis']>(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    clientTimestamp: timestamp('client_timestamp'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
  },
  (table) => [
    primaryKey({ name: 'ndpr_consent_records_pkey', columns: [table.tenantId, table.id] }),
    uniqueIndex('consent_active_subject_key').on(table.activeSubjectKey),
    index('consent_tenant_subject_active_idx').on(
      table.tenantId,
      table.subjectId,
      table.revokedAt,
    ),
  ],
);

export const dsrRequests = pgTable(
  'ndpr_dsr_requests',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    subjectId: text('subject_id').notNull(),
    type: text('type').$type<ToolkitDSRRequest['type']>().notNull(),
    status: text('status').$type<ToolkitDSRRequest['status']>().notNull().default('pending'),
    subjectName: text('subject_name').notNull(),
    subjectEmail: text('subject_email').notNull(),
    subjectPhone: text('subject_phone'),
    identifierType: text('identifier_type'),
    identifierValue: text('identifier_value'),
    description: text('description'),
    lawfulBasis: text('lawful_basis'),
    additionalInfo: jsonb('additional_info').$type<ToolkitDSRRequest['additionalInfo']>(),
    internalNotes: jsonb('internal_notes').$type<ToolkitDSRRequest['internalNotes']>(),
    verification: jsonb('verification').$type<ToolkitDSRRequest['verification']>(),
    rejectionReason: text('rejection_reason'),
    attachments: jsonb('attachments').$type<ToolkitDSRRequest['attachments']>(),
    extensionRequested: boolean('extension_requested'),
    extensionReason: text('extension_reason'),
    assignedTo: text('assigned_to'),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    verifiedAt: timestamp('verified_at'),
    completedAt: timestamp('completed_at'),
    dueAt: timestamp('due_at'),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [
    primaryKey({
      name: 'ndpr_dsr_requests_pkey',
      columns: [table.tenantId, table.subjectId, table.id],
    }),
    uniqueIndex('dsr_tenant_id_unique').on(table.tenantId, table.id),
    index('dsr_tenant_subject_active_idx').on(
      table.tenantId,
      table.subjectId,
      table.removedAt,
      table.submittedAt,
    ),
    index('dsr_tenant_status_idx').on(table.tenantId, table.status),
  ],
);

export const breachReports = pgTable(
  'ndpr_breach_reports',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    severity: text('severity').$type<RiskAssessment['riskLevel']>(),
    status: text('status').$type<ToolkitBreachReport['status']>().notNull().default('ongoing'),
    discoveredAt: timestamp('discovered_at').notNull(),
    occurredAt: timestamp('occurred_at'),
    reportedAt: timestamp('reported_at').defaultNow().notNull(),
    ndpcNotifiedAt: timestamp('ndpc_notified_at'),
    reporterName: text('reporter_name').notNull(),
    reporterEmail: text('reporter_email').notNull(),
    reporterDepartment: text('reporter_department'),
    reporterPhone: text('reporter_phone'),
    affectedSystems: jsonb('affected_systems').$type<string[]>().notNull(),
    dataTypes: jsonb('data_types').$type<string[]>().notNull(),
    involvesSensitiveData: boolean('involves_sensitive_data'),
    estimatedAffectedSubjects: integer('estimated_affected_subjects'),
    approximateRecordCount: integer('approximate_record_count'),
    dataSubjectCategories: jsonb('data_subject_categories').$type<string[]>(),
    likelyConsequences: text('likely_consequences'),
    mitigationMeasures: text('mitigation_measures'),
    isPhasedReport: boolean('is_phased_report'),
    supplementsReportId: text('supplements_report_id'),
    dpoContact: jsonb('dpo_contact').$type<ToolkitBreachReport['dpoContact']>(),
    initialActions: text('initial_actions'),
    attachments: jsonb('attachments').$type<ToolkitBreachReport['attachments']>(),
    assessments: jsonb('assessments').$type<RiskAssessment[]>().notNull().default([]),
    notifications: jsonb('notifications').$type<RegulatoryNotification[]>().notNull().default([]),
    ndpcNotificationSent: boolean('ndpc_notification_sent').notNull().default(false),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [
    primaryKey({ name: 'ndpr_breach_reports_pkey', columns: [table.tenantId, table.id] }),
    index('breach_tenant_active_status_idx').on(table.tenantId, table.removedAt, table.status),
    index('breach_tenant_severity_idx').on(table.tenantId, table.severity),
  ],
);

export const processingRecords = pgTable(
  'ndpr_processing_records',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    purpose: text('purpose').notNull(),
    lawfulBasis: text('lawful_basis').$type<ToolkitProcessingRecord['lawfulBasis']>().notNull(),
    dataCategories: jsonb('data_categories').$type<string[]>().notNull(),
    dataSubjects: jsonb('data_subjects').$type<string[]>().notNull(),
    recipients: jsonb('recipients').$type<string[]>().notNull(),
    retentionPeriod: text('retention_period').notNull(),
    securityMeasures: jsonb('security_measures').$type<string[]>().notNull(),
    transferCountries: jsonb('transfer_countries').$type<string[]>(),
    transferMechanism: text('transfer_mechanism'),
    dpiaConducted: boolean('dpia_conducted').notNull().default(false),
    recordData: jsonb('record_data').$type<ToolkitProcessingRecord>(),
    status: text('status').$type<ToolkitProcessingRecord['status']>().notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [
    primaryKey({ name: 'ndpr_processing_records_pkey', columns: [table.tenantId, table.id] }),
    index('processing_tenant_active_status_idx').on(
      table.tenantId,
      table.removedAt,
      table.status,
    ),
    index('processing_tenant_basis_idx').on(table.tenantId, table.lawfulBasis),
  ],
);

export const ropaRegisters = pgTable(
  'ndpr_ropa_registers',
  {
    tenantId: text('tenant_id').primaryKey(),
    metadata: jsonb('metadata').$type<Omit<RecordOfProcessingActivities, 'records'>>().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [index('ropa_register_tenant_active_idx').on(table.tenantId, table.removedAt)],
);

export const dpiaRecords = pgTable(
  'ndpr_dpia_records',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    projectName: text('project_name').notNull(),
    description: text('description').notNull(),
    dpiaData: jsonb('dpia_data').$type<DPIAResult>().notNull(),
    overallRisk: text('overall_risk').$type<DPIAResult['overallRiskLevel']>().notNull(),
    score: integer('score').notNull(),
    status: text('status').notNull().default('draft'),
    conductedBy: text('conducted_by').notNull(),
    approvedBy: text('approved_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [
    primaryKey({ name: 'ndpr_dpia_records_pkey', columns: [table.tenantId, table.id] }),
    index('dpia_tenant_active_status_idx').on(table.tenantId, table.removedAt, table.status),
    index('dpia_tenant_conductor_idx').on(table.tenantId, table.conductedBy),
  ],
);

export const lawfulBasisRecords = pgTable(
  'ndpr_lawful_basis_records',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    activityName: text('activity_name').notNull(),
    description: text('description'),
    lawfulBasis: text('lawful_basis').$type<ProcessingActivity['lawfulBasis']>().notNull(),
    justification: text('justification').notNull(),
    dataCategories: jsonb('data_categories').$type<string[]>().notNull(),
    involvesSensitiveData: boolean('involves_sensitive_data'),
    sensitiveDataCondition: text('sensitive_data_condition').$type<ProcessingActivity['sensitiveDataCondition']>(),
    dataSubjectCategories: jsonb('data_subject_categories').$type<string[]>(),
    purposes: jsonb('purposes').$type<string[]>().notNull(),
    retentionPeriod: text('retention_period'),
    retentionJustification: text('retention_justification'),
    recipients: jsonb('recipients').$type<string[]>(),
    crossBorderTransfer: boolean('cross_border_transfer'),
    status: text('status').$type<ProcessingActivity['status']>().notNull().default('active'),
    dpoApproval: jsonb('dpo_approval').$type<ProcessingActivity['dpoApproval']>(),
    activityData: jsonb('activity_data').$type<ProcessingActivity>(),
    assessedBy: text('assessed_by').notNull(),
    assessedAt: timestamp('assessed_at').defaultNow().notNull(),
    reviewDate: timestamp('review_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [
    primaryKey({ name: 'ndpr_lawful_basis_records_pkey', columns: [table.tenantId, table.id] }),
    index('lawful_basis_tenant_basis_idx').on(table.tenantId, table.lawfulBasis),
    index('lawful_basis_tenant_assessor_idx').on(table.tenantId, table.assessedBy),
    index('lawful_basis_tenant_active_status_idx').on(
      table.tenantId,
      table.removedAt,
      table.status,
    ),
  ],
);

export const crossBorderTransferRecords = pgTable(
  'ndpr_cross_border_transfer_records',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    destinationCountry: text('destination_country').notNull(),
    destinationCountryCode: text('destination_country_code'),
    recipientName: text('recipient_name').notNull(),
    recipientContact: jsonb('recipient_contact').$type<CrossBorderTransfer['recipientContact']>(),
    transferMechanism: text('transfer_mechanism').$type<CrossBorderTransfer['transferMechanism']>().notNull(),
    safeguards: jsonb('safeguards').$type<string[]>().notNull(),
    dataCategories: jsonb('data_categories').$type<string[]>().notNull(),
    includesSensitiveData: boolean('includes_sensitive_data'),
    estimatedDataSubjects: integer('estimated_data_subjects'),
    purpose: text('purpose'),
    adequacyStatus: text('adequacy_status').$type<CrossBorderTransfer['adequacyStatus']>().notNull(),
    riskAssessment: text('risk_assessment'),
    riskLevel: text('risk_level').$type<CrossBorderTransfer['riskLevel']>().notNull(),
    ndpcApprovalRequired: boolean('ndpc_approval_required').notNull().default(false),
    ndpcApprovalReference: text('ndpc_approval_reference'),
    ndpcApproval: jsonb('ndpc_approval').$type<CrossBorderTransfer['ndpcApproval']>(),
    tiaCompleted: boolean('tia_completed'),
    tiaReference: text('tia_reference'),
    frequency: text('frequency').$type<CrossBorderTransfer['frequency']>(),
    status: text('status').$type<CrossBorderTransfer['status']>().notNull().default('active'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    reviewDate: timestamp('review_date'),
    transferData: jsonb('transfer_data').$type<CrossBorderTransfer>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('adapter_removed_at'),
  },
  (table) => [
    primaryKey({
      name: 'ndpr_cross_border_transfer_records_pkey',
      columns: [table.tenantId, table.id],
    }),
    index('cross_border_tenant_destination_idx').on(table.tenantId, table.destinationCountry),
    index('cross_border_tenant_risk_idx').on(table.tenantId, table.riskLevel),
    index('cross_border_tenant_active_status_idx').on(
      table.tenantId,
      table.removedAt,
      table.status,
    ),
  ],
);

export const complianceAuditLog = pgTable(
  'ndpr_audit_log',
  {
    tenantId: text('tenant_id').notNull(),
    id: text('id').notNull().$defaultFn(() => createId()),
    action: text('action').notNull(),
    module: text('module').notNull(),
    entityId: text('entity_id').notNull(),
    entityType: text('entity_type').notNull(),
    changes: jsonb('changes').$type<Record<string, unknown>>(),
    performedBy: text('performed_by'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ name: 'ndpr_audit_log_pkey', columns: [table.tenantId, table.id] }),
    index('audit_tenant_module_entity_idx').on(table.tenantId, table.module, table.entityId),
    index('audit_tenant_actor_idx').on(table.tenantId, table.performedBy),
  ],
);

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type NewConsentRecord = typeof consentRecords.$inferInsert;
export type DSRRequest = typeof dsrRequests.$inferSelect;
export type NewDSRRequest = typeof dsrRequests.$inferInsert;
export type BreachReport = typeof breachReports.$inferSelect;
export type NewBreachReport = typeof breachReports.$inferInsert;
export type ProcessingRecord = typeof processingRecords.$inferSelect;
export type NewProcessingRecord = typeof processingRecords.$inferInsert;
export type RopaRegister = typeof ropaRegisters.$inferSelect;
export type NewRopaRegister = typeof ropaRegisters.$inferInsert;
export type DPIARecord = typeof dpiaRecords.$inferSelect;
export type NewDPIARecord = typeof dpiaRecords.$inferInsert;
export type LawfulBasisRecord = typeof lawfulBasisRecords.$inferSelect;
export type NewLawfulBasisRecord = typeof lawfulBasisRecords.$inferInsert;
export type CrossBorderTransferRecord = typeof crossBorderTransferRecords.$inferSelect;
export type NewCrossBorderTransferRecord = typeof crossBorderTransferRecords.$inferInsert;
export type ComplianceAuditLog = typeof complianceAuditLog.$inferSelect;
export type NewComplianceAuditLog = typeof complianceAuditLog.$inferInsert;
