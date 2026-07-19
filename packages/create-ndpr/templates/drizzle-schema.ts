import {
  pgTable,
  text,
  timestamp,
  json,
  boolean,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * NDPA persistence schema for {{ORG_NAME_COMMENT}}.
 * Every operational and audit row carries a required server-resolved tenantId.
 */

export const consentRecords = pgTable(
  'ndpr_consent_records',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    subjectId: text('subject_id').notNull(),
    activeSubjectKey: text('active_subject_key'),
    consents: json('consents').notNull(),
    version: text('version').notNull(),
    method: text('method').notNull(),
    hasInteracted: boolean('has_interacted').notNull(),
    lawfulBasis: text('lawful_basis'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    clientTimestamp: timestamp('client_timestamp').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
  },
  (table) => ({
    activeSubjectKeyUnique: uniqueIndex('consent_active_subject_key').on(
      table.activeSubjectKey,
    ),
    tenantSubjectIdx: index('consent_tenant_subject_idx').on(
      table.tenantId,
      table.subjectId,
      table.revokedAt,
    ),
    replayIdx: index('consent_replay_idx').on(
      table.tenantId,
      table.subjectId,
      table.clientTimestamp,
      table.version,
      table.method,
    ),
  }),
);

export const dsrRequests = pgTable(
  'ndpr_dsr_requests',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    subjectId: text('subject_id').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull().default('pending'),
    subjectName: text('subject_name').notNull(),
    subjectEmail: text('subject_email').notNull(),
    subjectPhone: text('subject_phone'),
    identifierType: text('identifier_type').notNull(),
    identifierValue: text('identifier_value').notNull(),
    description: text('description'),
    internalNotes: text('internal_notes'),
    assignedTo: text('assigned_to'),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
    acknowledgedAt: timestamp('acknowledged_at'),
    completedAt: timestamp('completed_at'),
    dueAt: timestamp('due_at').notNull(),
  },
  (table) => ({
    tenantStatusIdx: index('dsr_tenant_status_idx').on(table.tenantId, table.status),
    tenantSubjectIdx: index('dsr_tenant_subject_idx').on(table.tenantId, table.subjectId),
    tenantEmailIdx: index('dsr_tenant_email_idx').on(table.tenantId, table.subjectEmail),
  }),
);

export const breachReports = pgTable(
  'ndpr_breach_reports',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    severity: text('severity').notNull(),
    status: text('status').notNull().default('ongoing'),
    discoveredAt: timestamp('discovered_at').notNull(),
    occurredAt: timestamp('occurred_at'),
    reportedAt: timestamp('reported_at').defaultNow().notNull(),
    ndpcNotifiedAt: timestamp('ndpc_notified_at'),
    reporterName: text('reporter_name').notNull(),
    reporterEmail: text('reporter_email').notNull(),
    reporterDepartment: text('reporter_department'),
    affectedSystems: json('affected_systems').notNull(),
    dataTypes: json('data_types').notNull(),
    involvesSensitiveData: boolean('involves_sensitive_data').notNull().default(false),
    estimatedAffected: integer('estimated_affected'),
    approximateRecordCount: integer('approximate_record_count'),
    dataSubjectCategories: json('data_subject_categories').notNull(),
    likelyConsequences: text('likely_consequences'),
    mitigationMeasures: text('mitigation_measures'),
    isPhasedReport: boolean('is_phased_report').notNull().default(false),
    supplementsReportId: text('supplements_report_id'),
    initialActions: text('initial_actions'),
    ndpcNotificationSent: boolean('ndpc_notification_sent').notNull().default(false),
  },
  (table) => ({
    tenantStatusIdx: index('breach_tenant_status_idx').on(table.tenantId, table.status),
    tenantSeverityIdx: index('breach_tenant_severity_idx').on(table.tenantId, table.severity),
  }),
);

export const processingRecords = pgTable(
  'ndpr_processing_records',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    purpose: text('purpose').notNull(),
    lawfulBasis: text('lawful_basis').notNull(),
    dataCategories: json('data_categories').notNull(),
    dataSubjects: json('data_subjects').notNull(),
    recipients: json('recipients').notNull(),
    retentionPeriod: text('retention_period').notNull(),
    securityMeasures: json('security_measures').notNull(),
    transferCountries: json('transfer_countries'),
    transferMechanism: text('transfer_mechanism'),
    dpiaConducted: boolean('dpia_conducted').notNull().default(false),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantStatusIdx: index('processing_tenant_status_idx').on(table.tenantId, table.status),
  }),
);

export const dpiaRecords = pgTable(
  'ndpr_dpia_records',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    projectName: text('project_name').notNull(),
    description: text('description').notNull(),
    dpiaData: json('dpia_data').notNull(),
    overallRisk: text('overall_risk').notNull(),
    score: integer('score').notNull(),
    status: text('status').notNull().default('draft'),
    conductedBy: text('conducted_by').notNull(),
    approvedBy: text('approved_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
  },
  (table) => ({
    tenantStatusIdx: index('dpia_tenant_status_idx').on(
      table.tenantId,
      table.removedAt,
      table.status,
    ),
  }),
);

export const lawfulBasisRecords = pgTable(
  'ndpr_lawful_basis_records',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    activityName: text('activity_name').notNull(),
    lawfulBasis: text('lawful_basis').notNull(),
    justification: text('justification').notNull(),
    dataCategories: json('data_categories').notNull(),
    purposes: json('purposes').notNull(),
    assessedBy: text('assessed_by').notNull(),
    assessedAt: timestamp('assessed_at').defaultNow().notNull(),
    reviewDate: timestamp('review_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
  },
  (table) => ({
    tenantBasisIdx: index('lawful_basis_tenant_idx').on(
      table.tenantId,
      table.removedAt,
      table.lawfulBasis,
    ),
  }),
);

export const crossBorderTransferRecords = pgTable(
  'ndpr_cross_border_transfer_records',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    destinationCountry: text('destination_country').notNull(),
    recipientName: text('recipient_name').notNull(),
    transferMechanism: text('transfer_mechanism').notNull(),
    safeguards: text('safeguards').notNull(),
    dataCategories: json('data_categories').notNull(),
    adequacyStatus: text('adequacy_status').notNull(),
    ndpcApprovalRequired: boolean('ndpc_approval_required').notNull().default(false),
    ndpcApprovalReference: text('ndpc_approval_reference'),
    riskLevel: text('risk_level').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
  },
  (table) => ({
    tenantDestinationIdx: index('cross_border_tenant_destination_idx').on(
      table.tenantId,
      table.removedAt,
      table.destinationCountry,
    ),
    tenantRiskIdx: index('cross_border_tenant_risk_idx').on(
      table.tenantId,
      table.removedAt,
      table.riskLevel,
    ),
    tenantStatusIdx: index('cross_border_tenant_status_idx').on(
      table.tenantId,
      table.removedAt,
      table.status,
    ),
  }),
);

/** Append-oriented application audit rows; enforce immutability in DB permissions. */
export const complianceAuditLog = pgTable(
  'ndpr_audit_log',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    tenantId: text('tenant_id').notNull(),
    module: text('module').notNull(),
    action: text('action').notNull(),
    entityId: text('entity_id').notNull(),
    entityType: text('entity_type').notNull(),
    changes: json('changes'),
    performedBy: text('performed_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    tenantEntityIdx: index('audit_tenant_module_entity_idx').on(
      table.tenantId,
      table.module,
      table.entityId,
    ),
  }),
);

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type NewConsentRecord = typeof consentRecords.$inferInsert;
export type DSRRequest = typeof dsrRequests.$inferSelect;
export type NewDSRRequest = typeof dsrRequests.$inferInsert;
export type BreachReport = typeof breachReports.$inferSelect;
export type NewBreachReport = typeof breachReports.$inferInsert;
export type ProcessingRecord = typeof processingRecords.$inferSelect;
export type NewProcessingRecord = typeof processingRecords.$inferInsert;
export type DPIARecord = typeof dpiaRecords.$inferSelect;
export type NewDPIARecord = typeof dpiaRecords.$inferInsert;
export type LawfulBasisRecord = typeof lawfulBasisRecords.$inferSelect;
export type NewLawfulBasisRecord = typeof lawfulBasisRecords.$inferInsert;
export type CrossBorderTransfer = typeof crossBorderTransferRecords.$inferSelect;
export type NewCrossBorderTransfer = typeof crossBorderTransferRecords.$inferInsert;
export type ComplianceAuditLogEntry = typeof complianceAuditLog.$inferSelect;
