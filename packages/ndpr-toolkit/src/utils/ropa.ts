import type { LawfulBasis } from '../types/lawful-basis';
import type {
  ProcessingRecord,
  RecordOfProcessingActivities,
  ROPASummary,
} from '../types/ropa';

/**
 * Compliance gap found in a processing record
 */
export interface ROPAComplianceGap {
  recordId: string;
  recordName: string;
  gaps: string[];
}

/**
 * Validation result for a processing record
 */
export interface ROPAValidationResult {
  valid: boolean;
  errors: string[];
}

const ALL_LAWFUL_BASES: LawfulBasis[] = [
  'consent',
  'contract',
  'legal_obligation',
  'vital_interests',
  'public_interest',
  'legitimate_interests',
];

/**
 * Validates a processing record to ensure all required fields are present
 * and properly filled per NDPA 2023 requirements.
 *
 * @param record - The processing record to validate
 * @returns Validation result with any errors found
 */
export function validateProcessingRecord(
  record: ProcessingRecord
): ROPAValidationResult {
  const errors: string[] = [];

  if (!record.id || record.id.trim() === '') {
    errors.push('Record ID is required.');
  }

  if (!record.name || record.name.trim() === '') {
    errors.push('Processing activity name is required.');
  }

  if (!record.description || record.description.trim() === '') {
    errors.push('Processing description is required.');
  }

  if (!record.controllerDetails) {
    errors.push('Controller details are required.');
  } else {
    if (!record.controllerDetails.name || record.controllerDetails.name.trim() === '') {
      errors.push('Controller name is required.');
    }
    if (!record.controllerDetails.contact || record.controllerDetails.contact.trim() === '') {
      errors.push('Controller contact is required.');
    }
    if (!record.controllerDetails.address || record.controllerDetails.address.trim() === '') {
      errors.push('Controller address is required.');
    }
  }

  if (!record.lawfulBasis || !ALL_LAWFUL_BASES.includes(record.lawfulBasis)) {
    errors.push('A valid lawful basis must be specified (NDPA Section 25).');
  }

  if (!record.lawfulBasisJustification || record.lawfulBasisJustification.trim() === '') {
    errors.push('Lawful basis justification is required to demonstrate compliance.');
  }

  if (!record.purposes || record.purposes.length === 0) {
    errors.push('At least one processing purpose must be specified.');
  }

  if (!record.dataCategories || record.dataCategories.length === 0) {
    errors.push('At least one data category must be specified.');
  }

  if (!record.dataSubjectCategories || record.dataSubjectCategories.length === 0) {
    errors.push('At least one data subject category must be specified.');
  }

  if (!record.recipients || record.recipients.length === 0) {
    errors.push('At least one recipient or category of recipients must be specified.');
  }

  if (!record.retentionPeriod || record.retentionPeriod.trim() === '') {
    errors.push('Retention period must be specified.');
  }

  if (!record.securityMeasures || record.securityMeasures.length === 0) {
    errors.push('At least one security measure must be documented.');
  }

  if (!record.dataSource) {
    errors.push('Data source must be specified.');
  }

  if (
    record.dataSource === 'third_party' &&
    (!record.thirdPartySourceDetails || record.thirdPartySourceDetails.trim() === '')
  ) {
    errors.push('Third-party source details are required when data source is "third_party".');
  }

  if (
    record.automatedDecisionMaking &&
    (!record.automatedDecisionMakingDetails || record.automatedDecisionMakingDetails.trim() === '')
  ) {
    errors.push(
      'Automated decision-making details are required when automated decision-making is involved.'
    );
  }

  if (
    record.dpiaRequired &&
    (!record.dpiaReference || record.dpiaReference.trim() === '')
  ) {
    errors.push('DPIA reference is required when DPIA is marked as required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates a summary of the Record of Processing Activities.
 * Provides statistics and identifies records that are due for review.
 *
 * @param ropa - The full Record of Processing Activities
 * @returns Summary statistics for the ROPA
 */
export function generateROPASummary(
  ropa: RecordOfProcessingActivities
): ROPASummary {
  const byLawfulBasis = ALL_LAWFUL_BASES.reduce(
    (acc, basis) => {
      acc[basis] = 0;
      return acc;
    },
    {} as Record<LawfulBasis, number>
  );

  let activeRecords = 0;
  let sensitiveDataRecords = 0;
  let crossBorderRecords = 0;
  let dpiaRequiredRecords = 0;
  let automatedDecisionRecords = 0;
  const recordsDueForReview: ProcessingRecord[] = [];
  const departmentCounts: Record<string, number> = {};

  const now = Date.now();

  for (const record of ropa.records) {
    // Count by lawful basis
    if (record.lawfulBasis && ALL_LAWFUL_BASES.includes(record.lawfulBasis)) {
      byLawfulBasis[record.lawfulBasis]++;
    }

    // Count active records
    if (record.status === 'active') {
      activeRecords++;
    }

    // Count sensitive data records
    if (
      record.sensitiveDataCategories &&
      record.sensitiveDataCategories.length > 0
    ) {
      sensitiveDataRecords++;
    }

    // Count cross-border transfer records
    if (record.crossBorderTransfers && record.crossBorderTransfers.length > 0) {
      crossBorderRecords++;
    }

    // Count DPIA-required records
    if (record.dpiaRequired) {
      dpiaRequiredRecords++;
    }

    // Count automated decision-making records
    if (record.automatedDecisionMaking) {
      automatedDecisionRecords++;
    }

    // Identify records due for review
    if (record.nextReviewDate && record.nextReviewDate <= now) {
      recordsDueForReview.push(record);
    }

    // Track department counts
    if (record.department) {
      departmentCounts[record.department] =
        (departmentCounts[record.department] || 0) + 1;
    }
  }

  // Sort departments by count and take the top ones
  const topDepartments = Object.entries(departmentCounts)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalRecords: ropa.records.length,
    activeRecords,
    byLawfulBasis,
    sensitiveDataRecords,
    crossBorderRecords,
    dpiaRequiredRecords,
    automatedDecisionRecords,
    recordsDueForReview,
    topDepartments,
    lastUpdated: ropa.lastUpdated,
  };
}

/**
 * Escapes a string value for safe inclusion in CSV output
 */
function escapeCSVField(value: string): string {
  // Guard against CSV formula injection
  if (/^[=+\-@\t\r]/.test(value)) {
    value = "'" + value;
  }
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats a timestamp as an ISO date string for CSV export
 */
function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString();
}

/**
 * Exports the Record of Processing Activities to a CSV string.
 * The CSV includes all key fields from each processing record.
 *
 * @param ropa - The full Record of Processing Activities
 * @returns CSV-formatted string
 */
export function exportROPAToCSV(ropa: RecordOfProcessingActivities): string {
  const headers = [
    'ID',
    'Name',
    'Description',
    'Controller Name',
    'Controller Contact',
    'Lawful Basis',
    'Lawful Basis Justification',
    'Purposes',
    'Data Categories',
    'Sensitive Data Categories',
    'Data Subject Categories',
    'Recipients',
    'Cross-Border Transfers',
    'Retention Period',
    'Security Measures',
    'Data Source',
    'DPIA Required',
    'DPIA Reference',
    'Automated Decision-Making',
    'Status',
    'Department',
    'Systems Used',
    'Created At',
    'Updated At',
    'Last Reviewed At',
    'Next Review Date',
  ];

  const rows = ropa.records.map((record) => {
    const crossBorderSummary = record.crossBorderTransfers
      ? record.crossBorderTransfers
          .map(
            (t) =>
              `${t.destinationCountry} (${t.transferMechanism}: ${t.safeguards})`
          )
          .join('; ')
      : '';

    return [
      record.id,
      record.name,
      record.description,
      record.controllerDetails.name,
      record.controllerDetails.contact,
      record.lawfulBasis,
      record.lawfulBasisJustification,
      record.purposes.join('; '),
      record.dataCategories.join('; '),
      (record.sensitiveDataCategories || []).join('; '),
      record.dataSubjectCategories.join('; '),
      record.recipients.join('; '),
      crossBorderSummary,
      record.retentionPeriod,
      record.securityMeasures.join('; '),
      record.dataSource,
      record.dpiaRequired ? 'Yes' : 'No',
      record.dpiaReference || '',
      record.automatedDecisionMaking ? 'Yes' : 'No',
      record.status,
      record.department || '',
      (record.systemsUsed || []).join('; '),
      formatTimestamp(record.createdAt),
      formatTimestamp(record.updatedAt),
      formatTimestamp(record.lastReviewedAt),
      formatTimestamp(record.nextReviewDate),
    ].map((field) => escapeCSVField(String(field)));
  });

  const csvLines = [
    headers.map((h) => escapeCSVField(h)).join(','),
    ...rows.map((row) => row.join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Identifies compliance gaps in the Record of Processing Activities.
 * Finds records that are missing required information per NDPA 2023.
 *
 * @param ropa - The full Record of Processing Activities
 * @returns Array of compliance gaps grouped by record
 */
export function identifyComplianceGaps(
  ropa: RecordOfProcessingActivities
): ROPAComplianceGap[] {
  const gaps: ROPAComplianceGap[] = [];
  const now = Date.now();

  for (const record of ropa.records) {
    const recordGaps: string[] = [];

    // Check lawful basis justification
    if (
      !record.lawfulBasisJustification ||
      record.lawfulBasisJustification.trim() === ''
    ) {
      recordGaps.push(
        'Missing lawful basis justification (NDPA Section 25 requires documented justification).'
      );
    }

    // Check retention period
    if (!record.retentionPeriod || record.retentionPeriod.trim() === '') {
      recordGaps.push(
        'Missing retention period (data must not be kept longer than necessary).'
      );
    }

    // Check security measures
    if (!record.securityMeasures || record.securityMeasures.length === 0) {
      recordGaps.push(
        'No security measures documented (NDPA requires appropriate technical and organizational measures).'
      );
    }

    // Check for overdue review
    if (record.nextReviewDate && record.nextReviewDate <= now) {
      const overdueBy = Math.ceil(
        (now - record.nextReviewDate) / (24 * 60 * 60 * 1000)
      );
      recordGaps.push(
        `Review is overdue by ${overdueBy} day${overdueBy !== 1 ? 's' : ''}.`
      );
    }

    // Check DPIA reference when required
    if (
      record.dpiaRequired &&
      (!record.dpiaReference || record.dpiaReference.trim() === '')
    ) {
      recordGaps.push(
        'DPIA is required but no reference to a completed DPIA was provided.'
      );
    }

    // Check automated decision-making documentation
    if (
      record.automatedDecisionMaking &&
      (!record.automatedDecisionMakingDetails ||
        record.automatedDecisionMakingDetails.trim() === '')
    ) {
      recordGaps.push(
        'Automated decision-making is flagged but no details are documented.'
      );
    }

    // Check cross-border transfer safeguards
    if (record.crossBorderTransfers) {
      for (const transfer of record.crossBorderTransfers) {
        if (!transfer.safeguards || transfer.safeguards.trim() === '') {
          recordGaps.push(
            `Cross-border transfer to ${transfer.destinationCountry} is missing safeguard documentation.`
          );
        }
        if (
          !transfer.transferMechanism ||
          transfer.transferMechanism.trim() === ''
        ) {
          recordGaps.push(
            `Cross-border transfer to ${transfer.destinationCountry} is missing transfer mechanism.`
          );
        }
      }
    }

    // Check third-party source details
    if (
      record.dataSource === 'third_party' &&
      (!record.thirdPartySourceDetails ||
        record.thirdPartySourceDetails.trim() === '')
    ) {
      recordGaps.push(
        'Data source is "third_party" but no source details are provided.'
      );
    }

    // Check missing purposes
    if (!record.purposes || record.purposes.length === 0) {
      recordGaps.push('No processing purposes specified.');
    }

    // Check missing recipients
    if (!record.recipients || record.recipients.length === 0) {
      recordGaps.push('No recipients or categories of recipients specified.');
    }

    if (recordGaps.length > 0) {
      gaps.push({
        recordId: record.id,
        recordName: record.name,
        gaps: recordGaps,
      });
    }
  }

  return gaps;
}
