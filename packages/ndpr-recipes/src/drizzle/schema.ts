/**
 * Drizzle ORM schema for NDPA compliance tables.
 *
 * This mirrors the Prisma schema in `prisma/schema.prisma` using Drizzle's
 * `pgTable` API. Copy this file into your project and use it with your Drizzle
 * database instance. It defines all five compliance tables required for
 * full NDPA coverage:
 *
 *   - ndpr_consent_records      — Immutable consent audit trail (NDPA §25–26)
 *   - ndpr_dsr_requests         — Data subject rights requests (NDPA Part IV)
 *   - ndpr_breach_reports       — Breach incident records (NDPA §40)
 *   - ndpr_processing_records   — Record of Processing Activities / ROPA
 *   - ndpr_audit_log            — General compliance audit log
 *
 * Prerequisites
 * -------------
 * - `drizzle-orm` must be installed in your project.
 * - `@paralleldrive/cuid2` must be installed (`pnpm add @paralleldrive/cuid2`).
 * - Run `drizzle-kit push` or generate migrations to apply the schema.
 *
 * @module drizzle/schema
 */

import {
  pgTable,
  text,
  timestamp,
  json,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// ---------------------------------------------------------------------------
// ndpr_consent_records
// ---------------------------------------------------------------------------

/**
 * Immutable consent audit trail.
 *
 * Records are NEVER deleted. Revocation sets `revokedAt` on the existing row.
 * At most one row per `subjectId` should have `revokedAt = NULL` at any time —
 * this invariant is maintained by the drizzleConsentAdapter.
 *
 * NDPA reference: Sections 25–26 (consent and consent withdrawal)
 */
export const consentRecords = pgTable(
  'ndpr_consent_records',
  {
    /** CUID2 primary key — collision-resistant, URL-safe, sortable */
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    /**
     * Stable identifier for the data subject.
     * Use your application's user ID, session ID, or hashed email address.
     * Never store raw PII here if you can avoid it — a pseudonymous ID is preferred.
     */
    subjectId: text('subject_id').notNull(),

    /**
     * Map of consent category → boolean.
     * Stored as JSON so the schema does not need to change when new
     * consent categories are added to the toolkit.
     *
     * Example: { "analytics": true, "marketing": false, "functional": true }
     */
    consents: json('consents').notNull(),

    /** The consent policy version the subject agreed to (e.g. "1.0", "2024-01"). */
    version: text('version').notNull(),

    /** How consent was captured: "banner", "api", "form", "import", etc. */
    method: text('method').notNull(),

    /**
     * NDPA lawful basis for processing.
     * One of: "consent" | "contract" | "legal_obligation" | "vital_interests" |
     *         "public_task" | "legitimate_interest"
     */
    lawfulBasis: text('lawful_basis'),

    /** IP address at the time of consent — retained as evidence for regulators. */
    ipAddress: text('ip_address'),

    /** User-agent string at the time of consent — provides device/browser context. */
    userAgent: text('user_agent'),

    /** Timestamp when the consent record was created. */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /**
     * Timestamp when the consent was revoked.
     * NULL means the record is currently active. Non-NULL means it has been
     * superseded or explicitly withdrawn by the data subject.
     */
    revokedAt: timestamp('revoked_at'),
  },
  (table) => ({
    /** Index on subjectId to make per-subject queries fast. */
    subjectIdIdx: index('consent_subject_id_idx').on(table.subjectId),
  }),
);

// ---------------------------------------------------------------------------
// ndpr_dsr_requests
// ---------------------------------------------------------------------------

/**
 * Data Subject Rights (DSR) request tracking.
 *
 * Records every DSR request submitted by a data subject. Status transitions
 * follow the NDPA 30-day response window (NDPA Section 29–36):
 *
 *   pending → in_progress → completed
 *                         → rejected
 *
 * NDPA reference: Part IV, Sections 29–36
 */
export const dsrRequests = pgTable(
  'ndpr_dsr_requests',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    /**
     * DSR type — one of:
     *   "access" | "erasure" | "portability" | "rectification" |
     *   "restriction" | "objection" | "automated_decision"
     */
    type: text('type').notNull(),

    /**
     * Processing status.
     * Default is "pending" when a new request comes in.
     */
    status: text('status').notNull().default('pending'),

    /** Full name of the data subject making the request. */
    subjectName: text('subject_name').notNull(),

    /** Email address of the data subject — used to communicate outcomes. */
    subjectEmail: text('subject_email').notNull(),

    /** Optional phone number for the data subject. */
    subjectPhone: text('subject_phone'),

    /**
     * Type of identifier used to locate the subject's data in your systems.
     * E.g. "email", "account_id", "national_id".
     */
    identifierType: text('identifier_type').notNull(),

    /** The actual identifier value corresponding to `identifierType`. */
    identifierValue: text('identifier_value').notNull(),

    /** Optional free-text description / reason provided by the subject. */
    description: text('description'),

    /** Internal staff notes — never expose these to the data subject. */
    internalNotes: text('internal_notes'),

    /** Email of the staff member assigned to handle this request. */
    assignedTo: text('assigned_to'),

    /** When the request was submitted. */
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),

    /** When the request was acknowledged to the subject. */
    acknowledgedAt: timestamp('acknowledged_at'),

    /** When the request was fully completed. */
    completedAt: timestamp('completed_at'),

    /**
     * NDPA mandates a 30-day response window from submission.
     * This should be set to `submittedAt + 30 days` on creation.
     */
    dueAt: timestamp('due_at').notNull(),
  },
  (table) => ({
    statusIdx: index('dsr_status_idx').on(table.status),
    subjectEmailIdx: index('dsr_subject_email_idx').on(table.subjectEmail),
  }),
);

// ---------------------------------------------------------------------------
// ndpr_breach_reports
// ---------------------------------------------------------------------------

/**
 * Personal data breach incident reports.
 *
 * Under NDPA Section 40, data controllers must notify the NDPC within 72 hours
 * of becoming aware of a breach. This table tracks every breach incident and
 * its notification status.
 *
 * Records are never deleted — status transitions from "ongoing" to "resolved"
 * once the incident is closed.
 *
 * NDPA reference: Section 40 (breach notification to NDPC)
 */
export const breachReports = pgTable(
  'ndpr_breach_reports',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    /** Short title describing the breach (e.g. "Customer database exposed"). */
    title: text('title').notNull(),

    /** Detailed description of what happened, how, and what data was affected. */
    description: text('description').notNull(),

    /**
     * Breach category — classifies the type of incident:
     *   "confidentiality" | "integrity" | "availability" | "combined"
     */
    category: text('category').notNull(),

    /**
     * Risk severity level.
     * One of: "low" | "medium" | "high" | "critical"
     */
    severity: text('severity').notNull(),

    /**
     * Current status of the incident.
     * One of: "ongoing" | "contained" | "resolved"
     */
    status: text('status').notNull().default('ongoing'),

    /** When the breach was first discovered by your organisation. */
    discoveredAt: timestamp('discovered_at').notNull(),

    /** When the breach actually occurred (may differ from discoveredAt). */
    occurredAt: timestamp('occurred_at'),

    /** When the breach was formally logged in this system. */
    reportedAt: timestamp('reported_at').defaultNow().notNull(),

    /**
     * When the NDPC was notified.
     * NULL means notification has not yet been sent.
     * The 72-hour window starts from `discoveredAt`.
     */
    ndpcNotifiedAt: timestamp('ndpc_notified_at'),

    /** Full name of the person who reported the breach internally. */
    reporterName: text('reporter_name').notNull(),

    /** Email address of the breach reporter. */
    reporterEmail: text('reporter_email').notNull(),

    /** Department or business unit of the reporter. */
    reporterDepartment: text('reporter_department'),

    /**
     * List of systems or services that were affected.
     * Stored as a JSON array of strings.
     * Example: ["user-auth-service", "payments-db"]
     */
    affectedSystems: json('affected_systems').notNull(),

    /**
     * Categories of personal data involved in the breach.
     * Stored as a JSON array of strings.
     * Example: ["email", "national_id", "financial_data"]
     */
    dataTypes: json('data_types').notNull(),

    /** Estimated number of data subjects affected. */
    estimatedAffected: integer('estimated_affected'),

    /** Description of any immediate containment actions taken. */
    initialActions: text('initial_actions'),

    /**
     * Whether the mandatory NDPC notification has been sent.
     * Use `ndpcNotifiedAt` for the exact timestamp.
     */
    ndpcNotificationSent: boolean('ndpc_notification_sent').notNull().default(false),
  },
  (table) => ({
    statusIdx: index('breach_status_idx').on(table.status),
    severityIdx: index('breach_severity_idx').on(table.severity),
  }),
);

// ---------------------------------------------------------------------------
// ndpr_processing_records
// ---------------------------------------------------------------------------

/**
 * Record of Processing Activities (ROPA).
 *
 * Data controllers are required under the NDPA accountability principle to
 * maintain a register of all personal data processing activities. Each row
 * represents one distinct processing activity (e.g. "Email marketing",
 * "HR payroll processing", "Website analytics").
 *
 * Records are never deleted — inactive activities are archived by setting
 * `status = 'archived'`.
 *
 * NDPA reference: Accountability principle; Schedule 1, Part 1
 */
export const processingRecords = pgTable(
  'ndpr_processing_records',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    /** The primary purpose of this processing activity. */
    purpose: text('purpose').notNull(),

    /**
     * NDPA lawful basis for this processing activity.
     * One of: "consent" | "contract" | "legal_obligation" | "vital_interests" |
     *         "public_task" | "legitimate_interest"
     */
    lawfulBasis: text('lawful_basis').notNull(),

    /**
     * Categories of personal data processed.
     * Stored as a JSON array of strings.
     * Example: ["name", "email", "purchase_history"]
     */
    dataCategories: json('data_categories').notNull(),

    /**
     * Categories of data subjects whose data is processed.
     * Stored as a JSON array of strings.
     * Example: ["customers", "employees", "website_visitors"]
     */
    dataSubjects: json('data_subjects').notNull(),

    /**
     * Third parties to whom data is disclosed.
     * Stored as a JSON array of strings.
     * Example: ["Mailchimp", "Stripe", "Google Analytics"]
     */
    recipients: json('recipients').notNull(),

    /**
     * How long data is retained for this activity.
     * Use a human-readable string: "2 years", "Until account deletion", etc.
     */
    retentionPeriod: text('retention_period').notNull(),

    /**
     * Technical and organisational security measures in place.
     * Stored as a JSON array of strings.
     * Example: ["encryption_at_rest", "access_controls", "audit_logging"]
     */
    securityMeasures: json('security_measures').notNull(),

    /**
     * Countries to which data is transferred outside Nigeria.
     * Stored as a JSON array of country codes/names, or null if no transfers.
     */
    transferCountries: json('transfer_countries'),

    /**
     * Legal mechanism used for the cross-border transfer.
     * E.g. "adequacy_decision", "standard_contractual_clauses", "consent".
     */
    transferMechanism: text('transfer_mechanism'),

    /**
     * Whether a Data Protection Impact Assessment (DPIA) was conducted.
     * Required for high-risk processing activities.
     */
    dpiaConducted: boolean('dpia_conducted').notNull().default(false),

    /**
     * Current status of this processing activity.
     * One of: "active" | "archived"
     */
    status: text('status').notNull().default('active'),

    /** When this processing record was first created. */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /** When this processing record was last updated. */
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

// ---------------------------------------------------------------------------
// ndpr_audit_log
// ---------------------------------------------------------------------------

/**
 * General compliance audit log.
 *
 * Records every significant compliance action across all modules. The audit
 * log is append-only — rows are never updated or deleted. It provides an
 * authoritative trail for regulatory inspection under the NDPA accountability
 * principle.
 *
 * NDPA reference: Section 44 (accountability); Schedule 1, Part 1
 */
export const auditLog = pgTable(
  'ndpr_audit_log',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),

    /**
     * Which compliance module generated this entry.
     * One of: "consent" | "dsr" | "breach" | "ropa" | "system"
     */
    module: text('module').notNull(),

    /**
     * The action that occurred.
     * E.g. "created", "updated", "revoked", "deleted", "notified"
     */
    action: text('action').notNull(),

    /** ID of the entity that was acted upon. */
    entityId: text('entity_id').notNull(),

    /**
     * Type/model of the entity.
     * E.g. "ConsentRecord", "DSRRequest", "BreachReport"
     */
    entityType: text('entity_type').notNull(),

    /**
     * Snapshot of what changed.
     * Stored as JSON. The exact shape depends on the module and action.
     */
    changes: json('changes'),

    /**
     * Who performed the action.
     * May be a user ID, email address, or system identifier.
     * NULL indicates an automated/system action.
     */
    performedBy: text('performed_by'),

    /** Exact timestamp when the audit event occurred. */
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    moduleEntityIdx: index('audit_module_entity_idx').on(table.module, table.entityId),
  }),
);

// ---------------------------------------------------------------------------
// Type exports — infer table row types for use throughout your application
// ---------------------------------------------------------------------------

/** Row type for ndpr_consent_records */
export type ConsentRecord = typeof consentRecords.$inferSelect;
/** Insert type for ndpr_consent_records */
export type NewConsentRecord = typeof consentRecords.$inferInsert;

/** Row type for ndpr_dsr_requests */
export type DSRRequest = typeof dsrRequests.$inferSelect;
/** Insert type for ndpr_dsr_requests */
export type NewDSRRequest = typeof dsrRequests.$inferInsert;

/** Row type for ndpr_breach_reports */
export type BreachReport = typeof breachReports.$inferSelect;
/** Insert type for ndpr_breach_reports */
export type NewBreachReport = typeof breachReports.$inferInsert;

/** Row type for ndpr_processing_records */
export type ProcessingRecord = typeof processingRecords.$inferSelect;
/** Insert type for ndpr_processing_records */
export type NewProcessingRecord = typeof processingRecords.$inferInsert;

/** Row type for ndpr_audit_log */
export type AuditLogEntry = typeof auditLog.$inferSelect;
/** Insert type for ndpr_audit_log */
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
