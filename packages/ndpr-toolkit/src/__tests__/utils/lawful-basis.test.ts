import {
  validateProcessingActivity,
  getLawfulBasisDescription,
  assessComplianceGaps,
} from '../../utils/lawful-basis';
import { ProcessingActivity, LawfulBasis } from '../../types/lawful-basis';

const createValidActivity = (overrides: Partial<ProcessingActivity> = {}): ProcessingActivity => ({
  id: 'act-001',
  name: 'Customer Onboarding',
  description: 'Collecting and processing personal data during customer registration',
  lawfulBasis: 'consent',
  lawfulBasisJustification: 'Customers provide explicit consent during sign-up via an informed consent form.',
  dataCategories: ['name', 'email', 'phone'],
  involvesSensitiveData: false,
  dataSubjectCategories: ['customers'],
  purposes: ['account creation', 'identity verification'],
  retentionPeriod: '3 years after account closure',
  retentionJustification: 'Required for legal and audit purposes',
  crossBorderTransfer: false,
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now(),
  reviewDate: Date.now() + 86400000 * 180,
  status: 'active',
  dpoApproval: {
    approved: true,
    approvedBy: 'Adaeze Okafor',
    approvedAt: Date.now() - 86400000,
    notes: 'Reviewed and approved.',
  },
  ...overrides,
});

describe('validateProcessingActivity', () => {
  it('should validate a fully compliant processing activity', () => {
    const activity = createValidActivity();
    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('should return errors for missing required fields', () => {
    const activity = createValidActivity({
      id: '',
      name: '',
      description: '',
      lawfulBasis: undefined as unknown as LawfulBasis,
      lawfulBasisJustification: '',
      dataCategories: [],
      dataSubjectCategories: [],
      purposes: [],
      retentionPeriod: '',
    });

    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Activity ID is required.');
    expect(result.errors).toContain('Activity name is required.');
    expect(result.errors).toContain('Activity description is required.');
    expect(result.errors).toContain('Lawful basis is required per NDPA Section 25.');
    expect(result.errors).toContain('Justification for the lawful basis is required.');
    expect(result.errors).toContain('At least one data category must be specified.');
    expect(result.errors).toContain('At least one data subject category must be specified.');
    expect(result.errors).toContain('At least one processing purpose must be specified.');
    expect(result.errors).toContain('Data retention period is required.');
  });

  it('should require a detailed LIA justification when lawful basis is legitimate_interests', () => {
    const activity = createValidActivity({
      lawfulBasis: 'legitimate_interests',
      lawfulBasisJustification: 'Short',
    });

    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Legitimate interests requires a detailed Legitimate Interest Assessment (LIA) justification (NDPA Section 25(1)(f)).'
    );
  });

  it('should pass when legitimate_interests has a sufficiently detailed justification', () => {
    const activity = createValidActivity({
      lawfulBasis: 'legitimate_interests',
      lawfulBasisJustification:
        'The organization has a legitimate interest in processing customer purchase data for fraud detection. A balancing test has been performed and the data subject rights are not overridden.',
    });

    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should require a sensitive data condition when processing sensitive data', () => {
    const activity = createValidActivity({
      involvesSensitiveData: true,
      sensitiveDataCondition: undefined,
    });

    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Processing sensitive personal data requires specifying a condition under NDPA Section 27.'
    );
  });

  it('should pass when sensitive data has a condition specified', () => {
    const activity = createValidActivity({
      involvesSensitiveData: true,
      sensitiveDataCondition: 'explicit_consent',
    });

    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(true);
  });

  it('should warn when DPO approval is missing', () => {
    const activity = createValidActivity({
      dpoApproval: undefined,
    });

    const result = validateProcessingActivity(activity);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('Activity has not been approved by the DPO.');
  });

  it('should warn when DPO has reviewed but not approved', () => {
    const activity = createValidActivity({
      dpoApproval: {
        approved: false,
        approvedBy: 'Adaeze Okafor',
        approvedAt: Date.now(),
      },
    });

    const result = validateProcessingActivity(activity);

    expect(result.warnings).toContain('Activity has a DPO review but has not been approved.');
  });

  it('should warn when review date is overdue', () => {
    const activity = createValidActivity({
      reviewDate: Date.now() - 86400000 * 30,
    });

    const result = validateProcessingActivity(activity);

    expect(result.warnings).toContain('Activity is overdue for review.');
  });

  it('should warn when no review date is set', () => {
    const activity = createValidActivity({
      reviewDate: undefined,
    });

    const result = validateProcessingActivity(activity);

    expect(result.warnings).toContain('No review date has been set. Regular reviews are recommended.');
  });

  it('should warn when cross-border transfer is indicated but recipients are missing', () => {
    const activity = createValidActivity({
      crossBorderTransfer: true,
      recipients: [],
    });

    const result = validateProcessingActivity(activity);

    expect(result.warnings).toContain(
      'Cross-border transfer is indicated but no recipients are listed. Document the recipients or categories of recipients.'
    );
  });
});

describe('getLawfulBasisDescription', () => {
  const bases: LawfulBasis[] = [
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_interest',
    'legitimate_interests',
  ];

  it.each(bases)('should return a description for "%s"', (basis) => {
    const description = getLawfulBasisDescription(basis);

    expect(typeof description).toBe('string');
    expect(description.length).toBeGreaterThan(0);
  });

  it('should reference NDPA Section 25(1)(a) for consent', () => {
    const description = getLawfulBasisDescription('consent');

    expect(description).toContain('Consent');
    expect(description).toContain('NDPA Section 25(1)(a)');
  });

  it('should reference NDPA Section 25(1)(b) for contract', () => {
    const description = getLawfulBasisDescription('contract');

    expect(description).toContain('Contract');
    expect(description).toContain('NDPA Section 25(1)(b)');
  });

  it('should reference NDPA Section 25(1)(c) for legal_obligation', () => {
    const description = getLawfulBasisDescription('legal_obligation');

    expect(description).toContain('Legal Obligation');
    expect(description).toContain('NDPA Section 25(1)(c)');
  });

  it('should reference NDPA Section 25(1)(d) for vital_interests', () => {
    const description = getLawfulBasisDescription('vital_interests');

    expect(description).toContain('Vital Interests');
    expect(description).toContain('NDPA Section 25(1)(d)');
  });

  it('should reference NDPA Section 25(1)(e) for public_interest', () => {
    const description = getLawfulBasisDescription('public_interest');

    expect(description).toContain('Public Interest');
    expect(description).toContain('NDPA Section 25(1)(e)');
  });

  it('should reference NDPA Section 25(1)(f) for legitimate_interests', () => {
    const description = getLawfulBasisDescription('legitimate_interests');

    expect(description).toContain('Legitimate Interests');
    expect(description).toContain('NDPA Section 25(1)(f)');
  });
});

describe('assessComplianceGaps', () => {
  it('should return no gaps for fully compliant activities', () => {
    const activities = [
      createValidActivity({ id: 'act-001', name: 'Activity One' }),
      createValidActivity({ id: 'act-002', name: 'Activity Two' }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps).toEqual([]);
  });

  it('should detect missing DPO approval', () => {
    const activities = [
      createValidActivity({
        id: 'act-003',
        name: 'Unapproved Activity',
        dpoApproval: undefined,
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps.some((g) => g.type === 'missing_approval' && g.activityId === 'act-003')).toBe(true);
  });

  it('should detect overdue review dates', () => {
    const activities = [
      createValidActivity({
        id: 'act-004',
        name: 'Overdue Activity',
        reviewDate: Date.now() - 86400000 * 60,
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps.some((g) => g.type === 'overdue_review' && g.activityId === 'act-004')).toBe(true);
  });

  it('should detect missing lawful basis justification', () => {
    const activities = [
      createValidActivity({
        id: 'act-005',
        name: 'Unjustified Activity',
        lawfulBasisJustification: '',
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps.some((g) => g.type === 'missing_justification' && g.activityId === 'act-005')).toBe(true);
  });

  it('should detect missing LIA for legitimate interests', () => {
    const activities = [
      createValidActivity({
        id: 'act-006',
        name: 'LI Without LIA',
        lawfulBasis: 'legitimate_interests',
        lawfulBasisJustification: 'Too short',
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps.some((g) => g.type === 'missing_lia' && g.activityId === 'act-006')).toBe(true);
    expect(gaps.find((g) => g.type === 'missing_lia')?.severity).toBe('high');
  });

  it('should detect missing sensitive data condition', () => {
    const activities = [
      createValidActivity({
        id: 'act-007',
        name: 'Sensitive Without Condition',
        involvesSensitiveData: true,
        sensitiveDataCondition: undefined,
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(
      gaps.some((g) => g.type === 'missing_sensitive_condition' && g.activityId === 'act-007')
    ).toBe(true);
  });

  it('should detect missing retention period', () => {
    const activities = [
      createValidActivity({
        id: 'act-008',
        name: 'No Retention',
        retentionPeriod: '',
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps.some((g) => g.type === 'missing_retention' && g.activityId === 'act-008')).toBe(true);
  });

  it('should detect missing data categories and purposes', () => {
    const activities = [
      createValidActivity({
        id: 'act-009',
        name: 'Missing Categories',
        dataCategories: [],
        purposes: [],
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps.some((g) => g.type === 'missing_data_categories' && g.activityId === 'act-009')).toBe(true);
    expect(gaps.some((g) => g.type === 'missing_purposes' && g.activityId === 'act-009')).toBe(true);
  });

  it('should skip archived activities', () => {
    const activities = [
      createValidActivity({
        id: 'act-010',
        name: 'Archived Activity',
        status: 'archived',
        dpoApproval: undefined,
        lawfulBasisJustification: '',
        dataCategories: [],
        purposes: [],
        retentionPeriod: '',
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    expect(gaps).toEqual([]);
  });

  it('should report correct severity levels', () => {
    const activities = [
      createValidActivity({
        id: 'act-011',
        name: 'Multi-gap Activity',
        dpoApproval: undefined,
        reviewDate: Date.now() - 86400000,
        retentionPeriod: '',
      }),
    ];

    const gaps = assessComplianceGaps(activities);

    const approvalGap = gaps.find((g) => g.type === 'missing_approval');
    const reviewGap = gaps.find((g) => g.type === 'overdue_review');
    const retentionGap = gaps.find((g) => g.type === 'missing_retention');

    expect(approvalGap?.severity).toBe('high');
    expect(reviewGap?.severity).toBe('medium');
    expect(retentionGap?.severity).toBe('medium');
  });
});
