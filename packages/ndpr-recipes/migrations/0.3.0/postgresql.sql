-- @tantainnovative/ndpr-recipes 0.1.x / published 0.2.0 -> 0.3.0
-- PostgreSQL migration for both the legacy Prisma (camel-case columns) and
-- legacy Drizzle (snake-case columns) recipe schemas.
--
-- REQUIRED: replace the tenant placeholder in set_config below with the one
-- server-controlled tenant that owns the legacy unscoped rows. Read README.md in this directory
-- and rehearse this script against a restored production snapshot first.

BEGIN;
SELECT pg_advisory_xact_lock(hashtext('ndpr-recipes-0.3.0-hardening'));
SELECT set_config(
  'ndpr.migration_tenant_id',
  '__REPLACE_WITH_TENANT_ID__',
  true
);

DO $$
DECLARE
  tenant_id text := current_setting('ndpr.migration_tenant_id', true);
BEGIN
  IF tenant_id IS NULL
    OR btrim(tenant_id) = ''
    OR tenant_id = concat('__REPLACE_WITH_', 'TENANT_ID__')
  THEN
    RAISE EXCEPTION
      'Set the reviewed legacy tenant ID before running the NDPR 0.3.0 migration.';
  END IF;
END
$$;

-- The published 0.1.x Prisma schema used quoted camel-case columns while the
-- Drizzle schema used snake_case. Normalize only when the old name exists.
CREATE OR REPLACE FUNCTION pg_temp.ndpr_rename_column(
  _table_name text,
  _old_name text,
  _new_name text
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  old_exists boolean;
  new_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns AS columns
    WHERE columns.table_schema = current_schema()
      AND columns.table_name = _table_name
      AND columns.column_name = _old_name
  ) INTO old_exists;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns AS columns
    WHERE columns.table_schema = current_schema()
      AND columns.table_name = _table_name
      AND columns.column_name = _new_name
  ) INTO new_exists;

  IF old_exists AND new_exists THEN
    RAISE EXCEPTION 'Both %.% and %.% exist; resolve the partial migration first.',
      _table_name, _old_name, _table_name, _new_name;
  ELSIF old_exists THEN
    EXECUTE format(
      'ALTER TABLE %I RENAME COLUMN %I TO %I',
      _table_name,
      _old_name,
      _new_name
    );
  END IF;
END
$$;

-- Consent column normalization.
SELECT pg_temp.ndpr_rename_column('ndpr_consent_records', 'subjectId', 'subject_id');
SELECT pg_temp.ndpr_rename_column('ndpr_consent_records', 'lawfulBasis', 'lawful_basis');
SELECT pg_temp.ndpr_rename_column('ndpr_consent_records', 'ipAddress', 'ip_address');
SELECT pg_temp.ndpr_rename_column('ndpr_consent_records', 'userAgent', 'user_agent');
SELECT pg_temp.ndpr_rename_column('ndpr_consent_records', 'createdAt', 'created_at');
SELECT pg_temp.ndpr_rename_column('ndpr_consent_records', 'revokedAt', 'revoked_at');

-- DSR column normalization. Preserve legacy free-text notes and acknowledgement
-- time in explicitly named columns until the operator completes review.
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'subjectName', 'subject_name');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'subjectEmail', 'subject_email');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'subjectPhone', 'subject_phone');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'identifierType', 'identifier_type');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'identifierValue', 'identifier_value');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'internalNotes', 'internal_notes');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'assignedTo', 'assigned_to');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'submittedAt', 'submitted_at');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'acknowledgedAt', 'acknowledged_at');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'completedAt', 'completed_at');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'dueAt', 'due_at');
SELECT pg_temp.ndpr_rename_column('ndpr_dsr_requests', 'internal_notes', 'internal_notes_legacy');

-- Breach column normalization.
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'discoveredAt', 'discovered_at');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'occurredAt', 'occurred_at');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'reportedAt', 'reported_at');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'ndpcNotifiedAt', 'ndpc_notified_at');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'reporterName', 'reporter_name');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'reporterEmail', 'reporter_email');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'reporterDepartment', 'reporter_department');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'affectedSystems', 'affected_systems');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'dataTypes', 'data_types');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'estimatedAffected', 'estimated_affected_subjects');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'estimated_affected', 'estimated_affected_subjects');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'initialActions', 'initial_actions');
SELECT pg_temp.ndpr_rename_column('ndpr_breach_reports', 'ndpcNotificationSent', 'ndpc_notification_sent');

-- ROPA and supporting record column normalization.
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'lawfulBasis', 'lawful_basis');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'dataCategories', 'data_categories');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'dataSubjects', 'data_subjects');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'retentionPeriod', 'retention_period');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'securityMeasures', 'security_measures');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'transferCountries', 'transfer_countries');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'transferMechanism', 'transfer_mechanism');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'dpiaConducted', 'dpia_conducted');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'createdAt', 'created_at');
SELECT pg_temp.ndpr_rename_column('ndpr_processing_records', 'updatedAt', 'updated_at');

-- DPIA column normalization.
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'projectName', 'project_name');
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'dpiaData', 'dpia_data');
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'overallRisk', 'overall_risk');
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'conductedBy', 'conducted_by');
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'approvedBy', 'approved_by');
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'createdAt', 'created_at');
SELECT pg_temp.ndpr_rename_column('ndpr_dpia_records', 'updatedAt', 'updated_at');

-- Lawful-basis column normalization.
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'activityName', 'activity_name');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'lawfulBasis', 'lawful_basis');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'dataCategories', 'data_categories');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'assessedBy', 'assessed_by');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'assessedAt', 'assessed_at');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'reviewDate', 'review_date');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'createdAt', 'created_at');
SELECT pg_temp.ndpr_rename_column('ndpr_lawful_basis_records', 'updatedAt', 'updated_at');

-- Cross-border column normalization. Preserve the old scalar safeguard text;
-- the new contract stores a lossless string array.
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'destinationCountry', 'destination_country');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'recipientName', 'recipient_name');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'transferMechanism', 'transfer_mechanism');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'dataCategories', 'data_categories');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'adequacyStatus', 'adequacy_status');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'ndpcApprovalRequired', 'ndpc_approval_required');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'ndpcApprovalReference', 'ndpc_approval_reference');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'riskLevel', 'risk_level');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'createdAt', 'created_at');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'updatedAt', 'updated_at');
SELECT pg_temp.ndpr_rename_column('ndpr_cross_border_transfer_records', 'safeguards', 'safeguards_legacy');

-- Audit column normalization. Prisma 0.1 used `details`; Drizzle already used
-- entity_id/entity_type/changes.
SELECT pg_temp.ndpr_rename_column('ndpr_audit_log', 'details', 'changes');
SELECT pg_temp.ndpr_rename_column('ndpr_audit_log', 'entityId', 'entity_id');
SELECT pg_temp.ndpr_rename_column('ndpr_audit_log', 'entityType', 'entity_type');
SELECT pg_temp.ndpr_rename_column('ndpr_audit_log', 'performedBy', 'performed_by');
SELECT pg_temp.ndpr_rename_column('ndpr_audit_log', 'ipAddress', 'ip_address');
SELECT pg_temp.ndpr_rename_column('ndpr_audit_log', 'createdAt', 'created_at');

-- Drizzle 0.1 used PostgreSQL's default timestamp precision while the current
-- Prisma/Drizzle contract stores JavaScript-millisecond precision explicitly.
ALTER TABLE ndpr_consent_records
  ALTER COLUMN created_at TYPE timestamp(3) USING created_at::timestamp(3),
  ALTER COLUMN revoked_at TYPE timestamp(3) USING revoked_at::timestamp(3);
ALTER TABLE ndpr_dsr_requests
  ALTER COLUMN submitted_at TYPE timestamp(3) USING submitted_at::timestamp(3),
  ALTER COLUMN acknowledged_at TYPE timestamp(3) USING acknowledged_at::timestamp(3),
  ALTER COLUMN completed_at TYPE timestamp(3) USING completed_at::timestamp(3),
  ALTER COLUMN due_at TYPE timestamp(3) USING due_at::timestamp(3);
ALTER TABLE ndpr_breach_reports
  ALTER COLUMN discovered_at TYPE timestamp(3) USING discovered_at::timestamp(3),
  ALTER COLUMN occurred_at TYPE timestamp(3) USING occurred_at::timestamp(3),
  ALTER COLUMN reported_at TYPE timestamp(3) USING reported_at::timestamp(3),
  ALTER COLUMN ndpc_notified_at TYPE timestamp(3) USING ndpc_notified_at::timestamp(3);
ALTER TABLE ndpr_processing_records
  ALTER COLUMN created_at TYPE timestamp(3) USING created_at::timestamp(3),
  ALTER COLUMN updated_at TYPE timestamp(3) USING updated_at::timestamp(3);
ALTER TABLE ndpr_dpia_records
  ALTER COLUMN created_at TYPE timestamp(3) USING created_at::timestamp(3),
  ALTER COLUMN updated_at TYPE timestamp(3) USING updated_at::timestamp(3);
ALTER TABLE ndpr_lawful_basis_records
  ALTER COLUMN assessed_at TYPE timestamp(3) USING assessed_at::timestamp(3),
  ALTER COLUMN review_date TYPE timestamp(3) USING review_date::timestamp(3),
  ALTER COLUMN created_at TYPE timestamp(3) USING created_at::timestamp(3),
  ALTER COLUMN updated_at TYPE timestamp(3) USING updated_at::timestamp(3);
ALTER TABLE ndpr_cross_border_transfer_records
  ALTER COLUMN created_at TYPE timestamp(3) USING created_at::timestamp(3),
  ALTER COLUMN updated_at TYPE timestamp(3) USING updated_at::timestamp(3);
ALTER TABLE ndpr_audit_log
  ALTER COLUMN created_at TYPE timestamp(3) USING created_at::timestamp(3);

-- Consent: tenant scope, replay metadata, and one-active-row database invariant.
ALTER TABLE ndpr_consent_records
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS active_subject_key text,
  ADD COLUMN IF NOT EXISTS has_interacted boolean,
  ADD COLUMN IF NOT EXISTS client_timestamp timestamp(3);
ALTER TABLE ndpr_consent_records
  ALTER COLUMN consents TYPE jsonb USING consents::jsonb;
UPDATE ndpr_consent_records
SET tenant_id = current_setting('ndpr.migration_tenant_id'),
    has_interacted = COALESCE(has_interacted, true),
    client_timestamp = COALESCE(client_timestamp, created_at)
WHERE tenant_id IS NULL
   OR has_interacted IS NULL
   OR client_timestamp IS NULL;

-- Preserve the newest legacy active snapshot. Any additional active row is
-- explicitly superseded at migration time rather than deleted.
WITH ranked_active AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY tenant_id, subject_id
           ORDER BY created_at DESC, id DESC
         ) AS active_rank
  FROM ndpr_consent_records
  WHERE revoked_at IS NULL
)
UPDATE ndpr_consent_records AS consent
SET revoked_at = CURRENT_TIMESTAMP,
    active_subject_key = NULL
FROM ranked_active
WHERE consent.id = ranked_active.id
  AND ranked_active.active_rank > 1;

UPDATE ndpr_consent_records
SET active_subject_key = CASE
  WHEN revoked_at IS NULL THEN
    '[' || to_json(tenant_id)::text || ',' || to_json(subject_id)::text || ']'
  ELSE NULL
END;
ALTER TABLE ndpr_consent_records
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN has_interacted SET NOT NULL;
ALTER TABLE ndpr_consent_records
  DROP CONSTRAINT IF EXISTS ndpr_consent_records_pkey;
ALTER TABLE ndpr_consent_records
  ADD CONSTRAINT ndpr_consent_records_pkey PRIMARY KEY (tenant_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS consent_active_subject_key
  ON ndpr_consent_records(active_subject_key);
CREATE INDEX IF NOT EXISTS consent_tenant_subject_active_idx
  ON ndpr_consent_records(tenant_id, subject_id, revoked_at);

-- DSR: scope every row. Legacy schemas did not persist a verified application
-- subject ID, so use an unmistakable fail-closed placeholder until the operator
-- applies the reviewed account mapping described in README.md.
ALTER TABLE ndpr_dsr_requests
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS subject_id text,
  ADD COLUMN IF NOT EXISTS lawful_basis text,
  ADD COLUMN IF NOT EXISTS additional_info jsonb,
  ADD COLUMN IF NOT EXISTS internal_notes jsonb,
  ADD COLUMN IF NOT EXISTS verification jsonb,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS attachments jsonb,
  ADD COLUMN IF NOT EXISTS extension_requested boolean,
  ADD COLUMN IF NOT EXISTS extension_reason text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp(3),
  ADD COLUMN IF NOT EXISTS verified_at timestamp(3),
  ADD COLUMN IF NOT EXISTS adapter_removed_at timestamp(3);
UPDATE ndpr_dsr_requests
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id')),
    subject_id = COALESCE(subject_id, 'legacy_dsr_' || id),
    updated_at = COALESCE(updated_at, completed_at, submitted_at, CURRENT_TIMESTAMP),
    internal_notes = CASE
      WHEN internal_notes IS NOT NULL THEN internal_notes
      WHEN internal_notes_legacy IS NULL OR btrim(internal_notes_legacy) = '' THEN NULL
      ELSE jsonb_build_array(jsonb_build_object(
        'timestamp', floor(extract(epoch FROM submitted_at) * 1000)::bigint,
        'author', 'Legacy migration',
        'note', internal_notes_legacy
      ))
    END;
ALTER TABLE ndpr_dsr_requests
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN subject_id SET NOT NULL,
  ALTER COLUMN identifier_type DROP NOT NULL,
  ALTER COLUMN identifier_value DROP NOT NULL,
  ALTER COLUMN due_at DROP NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE ndpr_dsr_requests
  DROP CONSTRAINT IF EXISTS ndpr_dsr_requests_pkey;
ALTER TABLE ndpr_dsr_requests
  ADD CONSTRAINT ndpr_dsr_requests_pkey PRIMARY KEY (tenant_id, subject_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS dsr_tenant_id_unique
  ON ndpr_dsr_requests(tenant_id, id);
CREATE INDEX IF NOT EXISTS dsr_tenant_subject_active_idx
  ON ndpr_dsr_requests(tenant_id, subject_id, adapter_removed_at, submitted_at);
CREATE INDEX IF NOT EXISTS dsr_tenant_status_idx
  ON ndpr_dsr_requests(tenant_id, status);

-- Breach: preserve legacy notification flags/timestamps but do not fabricate a
-- RegulatoryNotification object. Operators must attach the original filing
-- content/reference before it can count as correlated readiness evidence.
ALTER TABLE ndpr_breach_reports
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS reporter_phone text,
  ADD COLUMN IF NOT EXISTS involves_sensitive_data boolean,
  ADD COLUMN IF NOT EXISTS approximate_record_count integer,
  ADD COLUMN IF NOT EXISTS data_subject_categories jsonb,
  ADD COLUMN IF NOT EXISTS likely_consequences text,
  ADD COLUMN IF NOT EXISTS mitigation_measures text,
  ADD COLUMN IF NOT EXISTS is_phased_report boolean,
  ADD COLUMN IF NOT EXISTS supplements_report_id text,
  ADD COLUMN IF NOT EXISTS dpo_contact jsonb,
  ADD COLUMN IF NOT EXISTS attachments jsonb,
  ADD COLUMN IF NOT EXISTS assessments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS adapter_removed_at timestamp(3);
ALTER TABLE ndpr_breach_reports
  ALTER COLUMN affected_systems TYPE jsonb USING affected_systems::jsonb,
  ALTER COLUMN data_types TYPE jsonb USING data_types::jsonb;
UPDATE ndpr_breach_reports
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id'));
ALTER TABLE ndpr_breach_reports
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN severity DROP NOT NULL;
ALTER TABLE ndpr_breach_reports
  DROP CONSTRAINT IF EXISTS ndpr_breach_reports_pkey;
ALTER TABLE ndpr_breach_reports
  ADD CONSTRAINT ndpr_breach_reports_pkey PRIMARY KEY (tenant_id, id);
CREATE INDEX IF NOT EXISTS breach_tenant_active_status_idx
  ON ndpr_breach_reports(tenant_id, adapter_removed_at, status);
CREATE INDEX IF NOT EXISTS breach_tenant_severity_idx
  ON ndpr_breach_reports(tenant_id, severity);

-- ROPA: legacy scalar columns remain queryable, but record_data stays NULL
-- until a human supplies facts the old schema never stored. Maintained routes
-- return 409 for those rows instead of presenting invented evidence.
ALTER TABLE ndpr_processing_records
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS record_data jsonb,
  ADD COLUMN IF NOT EXISTS adapter_removed_at timestamp(3);
ALTER TABLE ndpr_processing_records
  ALTER COLUMN data_categories TYPE jsonb USING data_categories::jsonb,
  ALTER COLUMN data_subjects TYPE jsonb USING data_subjects::jsonb,
  ALTER COLUMN recipients TYPE jsonb USING recipients::jsonb,
  ALTER COLUMN security_measures TYPE jsonb USING security_measures::jsonb,
  ALTER COLUMN transfer_countries TYPE jsonb USING transfer_countries::jsonb;
UPDATE ndpr_processing_records
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id'));
ALTER TABLE ndpr_processing_records
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ndpr_processing_records
  DROP CONSTRAINT IF EXISTS ndpr_processing_records_pkey;
ALTER TABLE ndpr_processing_records
  ADD CONSTRAINT ndpr_processing_records_pkey PRIMARY KEY (tenant_id, id);
CREATE INDEX IF NOT EXISTS processing_tenant_active_status_idx
  ON ndpr_processing_records(tenant_id, adapter_removed_at, status);
CREATE INDEX IF NOT EXISTS processing_tenant_basis_idx
  ON ndpr_processing_records(tenant_id, lawful_basis);

CREATE TABLE IF NOT EXISTS ndpr_ropa_registers (
  tenant_id text PRIMARY KEY,
  metadata jsonb NOT NULL,
  updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  adapter_removed_at timestamp(3)
);
CREATE INDEX IF NOT EXISTS ropa_register_tenant_active_idx
  ON ndpr_ropa_registers(tenant_id, adapter_removed_at);

-- DPIA.
ALTER TABLE ndpr_dpia_records
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS adapter_removed_at timestamp(3);
ALTER TABLE ndpr_dpia_records
  ALTER COLUMN dpia_data TYPE jsonb USING dpia_data::jsonb;
UPDATE ndpr_dpia_records
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id'));
ALTER TABLE ndpr_dpia_records
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ndpr_dpia_records
  DROP CONSTRAINT IF EXISTS ndpr_dpia_records_pkey;
ALTER TABLE ndpr_dpia_records
  ADD CONSTRAINT ndpr_dpia_records_pkey PRIMARY KEY (tenant_id, id);
CREATE INDEX IF NOT EXISTS dpia_tenant_active_status_idx
  ON ndpr_dpia_records(tenant_id, adapter_removed_at, status);
CREATE INDEX IF NOT EXISTS dpia_tenant_conductor_idx
  ON ndpr_dpia_records(tenant_id, conducted_by);

-- Lawful basis. activity_data is intentionally nullable until reviewed facts
-- absent from the legacy schema are reconstructed.
ALTER TABLE ndpr_lawful_basis_records
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS involves_sensitive_data boolean,
  ADD COLUMN IF NOT EXISTS sensitive_data_condition text,
  ADD COLUMN IF NOT EXISTS data_subject_categories jsonb,
  ADD COLUMN IF NOT EXISTS retention_period text,
  ADD COLUMN IF NOT EXISTS retention_justification text,
  ADD COLUMN IF NOT EXISTS recipients jsonb,
  ADD COLUMN IF NOT EXISTS cross_border_transfer boolean,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS dpo_approval jsonb,
  ADD COLUMN IF NOT EXISTS activity_data jsonb,
  ADD COLUMN IF NOT EXISTS adapter_removed_at timestamp(3);
ALTER TABLE ndpr_lawful_basis_records
  ALTER COLUMN data_categories TYPE jsonb USING data_categories::jsonb,
  ALTER COLUMN purposes TYPE jsonb USING purposes::jsonb;
UPDATE ndpr_lawful_basis_records
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id'));
ALTER TABLE ndpr_lawful_basis_records
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ndpr_lawful_basis_records
  DROP CONSTRAINT IF EXISTS ndpr_lawful_basis_records_pkey;
ALTER TABLE ndpr_lawful_basis_records
  ADD CONSTRAINT ndpr_lawful_basis_records_pkey PRIMARY KEY (tenant_id, id);
CREATE INDEX IF NOT EXISTS lawful_basis_tenant_basis_idx
  ON ndpr_lawful_basis_records(tenant_id, lawful_basis);
CREATE INDEX IF NOT EXISTS lawful_basis_tenant_assessor_idx
  ON ndpr_lawful_basis_records(tenant_id, assessed_by);
CREATE INDEX IF NOT EXISTS lawful_basis_tenant_active_status_idx
  ON ndpr_lawful_basis_records(tenant_id, adapter_removed_at, status);

-- Cross-border transfer. Convert the required legacy scalar safeguard into a
-- one-item array without discarding its text. transfer_data remains reviewable.
ALTER TABLE ndpr_cross_border_transfer_records
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS destination_country_code text,
  ADD COLUMN IF NOT EXISTS recipient_contact jsonb,
  ADD COLUMN IF NOT EXISTS safeguards jsonb,
  ADD COLUMN IF NOT EXISTS includes_sensitive_data boolean,
  ADD COLUMN IF NOT EXISTS estimated_data_subjects integer,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS risk_assessment text,
  ADD COLUMN IF NOT EXISTS ndpc_approval jsonb,
  ADD COLUMN IF NOT EXISTS tia_completed boolean,
  ADD COLUMN IF NOT EXISTS tia_reference text,
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS start_date timestamp(3),
  ADD COLUMN IF NOT EXISTS end_date timestamp(3),
  ADD COLUMN IF NOT EXISTS review_date timestamp(3),
  ADD COLUMN IF NOT EXISTS transfer_data jsonb,
  ADD COLUMN IF NOT EXISTS adapter_removed_at timestamp(3);
ALTER TABLE ndpr_cross_border_transfer_records
  ALTER COLUMN data_categories TYPE jsonb USING data_categories::jsonb;
UPDATE ndpr_cross_border_transfer_records
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id')),
    safeguards = COALESCE(
      safeguards,
      jsonb_build_array(safeguards_legacy)
    );
ALTER TABLE ndpr_cross_border_transfer_records
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN safeguards SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ndpr_cross_border_transfer_records
  DROP CONSTRAINT IF EXISTS ndpr_cross_border_transfer_records_pkey;
ALTER TABLE ndpr_cross_border_transfer_records
  ADD CONSTRAINT ndpr_cross_border_transfer_records_pkey PRIMARY KEY (tenant_id, id);
CREATE INDEX IF NOT EXISTS cross_border_tenant_destination_idx
  ON ndpr_cross_border_transfer_records(tenant_id, destination_country);
CREATE INDEX IF NOT EXISTS cross_border_tenant_risk_idx
  ON ndpr_cross_border_transfer_records(tenant_id, risk_level);
CREATE INDEX IF NOT EXISTS cross_border_tenant_active_status_idx
  ON ndpr_cross_border_transfer_records(tenant_id, adapter_removed_at, status);

-- Accountability audit log. Prisma's legacy schema had no entity columns; use
-- the immutable event ID and an explicit legacy type rather than inventing a
-- business entity correlation.
ALTER TABLE ndpr_audit_log
  ADD COLUMN IF NOT EXISTS tenant_id text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS changes jsonb,
  ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE ndpr_audit_log
  ALTER COLUMN changes TYPE jsonb USING changes::jsonb;
UPDATE ndpr_audit_log
SET tenant_id = COALESCE(tenant_id, current_setting('ndpr.migration_tenant_id')),
    entity_id = COALESCE(entity_id, id),
    entity_type = COALESCE(entity_type, 'LegacyAuditEvent');
ALTER TABLE ndpr_audit_log
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN entity_id SET NOT NULL,
  ALTER COLUMN entity_type SET NOT NULL;
ALTER TABLE ndpr_audit_log
  DROP CONSTRAINT IF EXISTS ndpr_audit_log_pkey;
ALTER TABLE ndpr_audit_log
  ADD CONSTRAINT ndpr_audit_log_pkey PRIMARY KEY (tenant_id, id);
CREATE INDEX IF NOT EXISTS audit_tenant_module_entity_idx
  ON ndpr_audit_log(tenant_id, module, entity_id);
CREATE INDEX IF NOT EXISTS audit_tenant_actor_idx
  ON ndpr_audit_log(tenant_id, performed_by);

-- Hard invariant verification. Any failure rolls the whole transaction back.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM ndpr_consent_records
    WHERE tenant_id IS NULL OR has_interacted IS NULL
  ) THEN
    RAISE EXCEPTION 'Consent tenant/interaction backfill is incomplete.';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM ndpr_consent_records
    WHERE revoked_at IS NULL
    GROUP BY tenant_id, subject_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'More than one active consent row remains for a subject.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM ndpr_consent_records
    WHERE (revoked_at IS NULL AND active_subject_key IS NULL)
       OR (revoked_at IS NOT NULL AND active_subject_key IS NOT NULL)
  ) THEN
    RAISE EXCEPTION 'Consent active-subject keys do not match revocation state.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM ndpr_dsr_requests
    WHERE tenant_id IS NULL OR subject_id IS NULL
  ) THEN
    RAISE EXCEPTION 'DSR tenant/subject backfill is incomplete.';
  END IF;
END
$$;

-- Review queues. Non-zero values are expected where the legacy schema lacked
-- enough facts; complete the reviewed mappings in README.md before enabling the
-- corresponding subject or ROPA workflows.
SELECT
  (SELECT count(*) FROM ndpr_dsr_requests WHERE subject_id LIKE 'legacy_dsr_%')
    AS dsr_subjects_requiring_mapping,
  (SELECT count(*) FROM ndpr_processing_records WHERE record_data IS NULL)
    AS ropa_snapshots_requiring_reconstruction,
  (SELECT count(*) FROM ndpr_breach_reports
    WHERE ndpc_notification_sent = true AND jsonb_array_length(notifications) = 0)
    AS breach_notifications_requiring_evidence;
COMMIT;
