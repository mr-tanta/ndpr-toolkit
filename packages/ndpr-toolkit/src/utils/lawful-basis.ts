import {
  LawfulBasis,
  ProcessingActivity,
  LawfulBasisSummary,
} from '../types/lawful-basis';

/**
 * Validation result for a processing activity
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Compliance gap identified across processing activities
 */
export interface ComplianceGap {
  activityId: string;
  activityName: string;
  type: 'missing_approval' | 'overdue_review' | 'missing_justification' | 'missing_lia' | 'missing_sensitive_condition' | 'missing_retention' | 'missing_data_categories' | 'missing_purposes';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Validates that all required fields are present on a processing activity
 * and that the lawful basis is properly documented.
 *
 * If lawfulBasis is 'legitimate_interests', ensures a LIA justification exists.
 * If involvesSensitiveData is true, ensures sensitiveDataCondition is set.
 *
 * @param activity The processing activity to validate
 * @returns Validation result with errors and warnings
 */
export function validateProcessingActivity(activity: ProcessingActivity): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!activity.id) {
    errors.push('Activity ID is required.');
  }

  if (!activity.name || activity.name.trim() === '') {
    errors.push('Activity name is required.');
  }

  if (!activity.description || activity.description.trim() === '') {
    errors.push('Activity description is required.');
  }

  if (!activity.lawfulBasis) {
    errors.push('Lawful basis is required per NDPA Section 25.');
  }

  if (!activity.lawfulBasisJustification || activity.lawfulBasisJustification.trim() === '') {
    errors.push('Justification for the lawful basis is required.');
  }

  if (!activity.dataCategories || activity.dataCategories.length === 0) {
    errors.push('At least one data category must be specified.');
  }

  if (!activity.dataSubjectCategories || activity.dataSubjectCategories.length === 0) {
    errors.push('At least one data subject category must be specified.');
  }

  if (!activity.purposes || activity.purposes.length === 0) {
    errors.push('At least one processing purpose must be specified.');
  }

  if (!activity.retentionPeriod || activity.retentionPeriod.trim() === '') {
    errors.push('Data retention period is required.');
  }

  // Legitimate interests requires additional justification (LIA)
  if (activity.lawfulBasis === 'legitimate_interests') {
    if (!activity.lawfulBasisJustification || activity.lawfulBasisJustification.trim().length < 20) {
      errors.push(
        'Legitimate interests requires a detailed Legitimate Interest Assessment (LIA) justification (NDPA Section 25(1)(f)).'
      );
    }
  }

  // Sensitive data requires a specific condition per NDPA Section 27
  if (activity.involvesSensitiveData && !activity.sensitiveDataCondition) {
    errors.push(
      'Processing sensitive personal data requires specifying a condition under NDPA Section 27.'
    );
  }

  // Warnings for best practices
  if (!activity.dpoApproval) {
    warnings.push('Activity has not been approved by the DPO.');
  } else if (!activity.dpoApproval.approved) {
    warnings.push('Activity has a DPO review but has not been approved.');
  }

  if (!activity.reviewDate) {
    warnings.push('No review date has been set. Regular reviews are recommended.');
  } else if (activity.reviewDate < Date.now()) {
    warnings.push('Activity is overdue for review.');
  }

  if (!activity.retentionJustification) {
    warnings.push('Consider documenting the justification for the retention period.');
  }

  if (activity.crossBorderTransfer && (!activity.recipients || activity.recipients.length === 0)) {
    warnings.push(
      'Cross-border transfer is indicated but no recipients are listed. Document the recipients or categories of recipients.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Returns a human-readable description of a lawful basis with the relevant
 * NDPA section reference.
 *
 * @param basis The lawful basis to describe
 * @returns Description string including NDPA section reference
 */
export function getLawfulBasisDescription(basis: LawfulBasis): string {
  const descriptions: Record<LawfulBasis, string> = {
    consent:
      'Consent (NDPA Section 25(1)(a)) - The data subject has given consent to the processing of their personal data for one or more specific purposes.',
    contract:
      'Contract (NDPA Section 25(1)(b)) - Processing is necessary for the performance of a contract to which the data subject is a party, or in order to take steps at the request of the data subject prior to entering into a contract.',
    legal_obligation:
      'Legal Obligation (NDPA Section 25(1)(c)) - Processing is necessary for compliance with a legal obligation to which the data controller is subject.',
    vital_interests:
      'Vital Interests (NDPA Section 25(1)(d)) - Processing is necessary to protect the vital interests of the data subject or another natural person.',
    public_interest:
      'Public Interest (NDPA Section 25(1)(e)) - Processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the data controller.',
    legitimate_interests:
      'Legitimate Interests (NDPA Section 25(1)(f)) - Processing is necessary for the purposes of the legitimate interests pursued by the data controller or a third party, except where such interests are overridden by the interests, rights, or freedoms of the data subject.',
  };

  return descriptions[basis];
}

/**
 * Analyzes all processing activities and returns compliance gaps including
 * missing DPO approval, overdue reviews, undocumented justifications,
 * missing LIA for legitimate interests, and other documentation issues.
 *
 * @param activities Array of processing activities to analyze
 * @returns Array of identified compliance gaps
 */
export function assessComplianceGaps(activities: ProcessingActivity[]): ComplianceGap[] {
  const gaps: ComplianceGap[] = [];

  for (const activity of activities) {
    // Skip archived activities
    if (activity.status === 'archived') {
      continue;
    }

    // Missing DPO approval
    if (!activity.dpoApproval || !activity.dpoApproval.approved) {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_approval',
        severity: 'high',
        description: `Processing activity "${activity.name}" has not been approved by the DPO.`,
      });
    }

    // Overdue review
    if (activity.reviewDate && activity.reviewDate < Date.now()) {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'overdue_review',
        severity: 'medium',
        description: `Processing activity "${activity.name}" was due for review on ${new Date(activity.reviewDate).toLocaleDateString()}.`,
      });
    }

    // Missing justification
    if (!activity.lawfulBasisJustification || activity.lawfulBasisJustification.trim() === '') {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_justification',
        severity: 'high',
        description: `Processing activity "${activity.name}" is missing the lawful basis justification.`,
      });
    }

    // Missing LIA for legitimate interests
    if (
      activity.lawfulBasis === 'legitimate_interests' &&
      (!activity.lawfulBasisJustification || activity.lawfulBasisJustification.trim().length < 20)
    ) {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_lia',
        severity: 'high',
        description: `Processing activity "${activity.name}" relies on legitimate interests but lacks a detailed Legitimate Interest Assessment (NDPA Section 25(1)(f)).`,
      });
    }

    // Missing sensitive data condition
    if (activity.involvesSensitiveData && !activity.sensitiveDataCondition) {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_sensitive_condition',
        severity: 'high',
        description: `Processing activity "${activity.name}" involves sensitive data but no condition under NDPA Section 27 has been specified.`,
      });
    }

    // Missing retention period
    if (!activity.retentionPeriod || activity.retentionPeriod.trim() === '') {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_retention',
        severity: 'medium',
        description: `Processing activity "${activity.name}" is missing a documented retention period.`,
      });
    }

    // Missing data categories
    if (!activity.dataCategories || activity.dataCategories.length === 0) {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_data_categories',
        severity: 'medium',
        description: `Processing activity "${activity.name}" has no documented data categories.`,
      });
    }

    // Missing purposes
    if (!activity.purposes || activity.purposes.length === 0) {
      gaps.push({
        activityId: activity.id,
        activityName: activity.name,
        type: 'missing_purposes',
        severity: 'medium',
        description: `Processing activity "${activity.name}" has no documented processing purposes.`,
      });
    }
  }

  return gaps;
}

/**
 * Generates a summary of all lawful basis documentation across processing activities.
 *
 * @param activities Array of processing activities to summarize
 * @returns LawfulBasisSummary with counts, breakdowns, and flagged activities
 */
export function generateLawfulBasisSummary(activities: ProcessingActivity[]): LawfulBasisSummary {
  const byBasis: Record<LawfulBasis, number> = {
    consent: 0,
    contract: 0,
    legal_obligation: 0,
    vital_interests: 0,
    public_interest: 0,
    legitimate_interests: 0,
  };

  let sensitiveDataActivities = 0;
  let crossBorderActivities = 0;
  const activitiesDueForReview: ProcessingActivity[] = [];
  const activitiesWithoutApproval: ProcessingActivity[] = [];

  for (const activity of activities) {
    if (activity.status === 'archived') {
      continue;
    }

    // Count by lawful basis
    if (activity.lawfulBasis in byBasis) {
      byBasis[activity.lawfulBasis]++;
    }

    // Count sensitive data activities
    if (activity.involvesSensitiveData) {
      sensitiveDataActivities++;
    }

    // Count cross-border transfers
    if (activity.crossBorderTransfer) {
      crossBorderActivities++;
    }

    // Check for overdue reviews
    if (activity.reviewDate && activity.reviewDate < Date.now()) {
      activitiesDueForReview.push(activity);
    }

    // Check for missing DPO approval
    if (!activity.dpoApproval || !activity.dpoApproval.approved) {
      activitiesWithoutApproval.push(activity);
    }
  }

  return {
    totalActivities: activities.filter(a => a.status !== 'archived').length,
    byBasis,
    sensitiveDataActivities,
    crossBorderActivities,
    activitiesDueForReview,
    activitiesWithoutApproval,
    lastUpdated: Date.now(),
  };
}
