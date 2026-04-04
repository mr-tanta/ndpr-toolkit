import {
  validateProcessingRecord,
  generateROPASummary,
  exportROPAToCSV,
  identifyComplianceGaps,
} from '../../utils/ropa';
import type { ProcessingRecord, RecordOfProcessingActivities } from '../../types/ropa';

const createValidRecord = (overrides: Partial<ProcessingRecord> = {}): ProcessingRecord => ({
  id: 'rec-001',
  name: 'Employee Payroll Processing',
  description: 'Monthly payroll computation and disbursement for all staff',
  controllerDetails: {
    name: 'NaijaTech Solutions Ltd',
    contact: 'privacy@naijatech.example.com',
    address: '15 Broad Street, Lagos Island, Lagos, Nigeria',
    registrationNumber: 'RC-123456',
    dpoContact: 'dpo@naijatech.example.com',
  },
  lawfulBasis: 'contract',
  lawfulBasisJustification:
    'Processing is necessary to fulfil the employment contract with each employee, including salary payments and statutory deductions.',
  purposes: ['salary computation', 'tax remittance', 'pension contribution'],
  dataCategories: ['name', 'bank account number', 'tax identification number', 'salary grade'],
  sensitiveDataCategories: [],
  dataSubjectCategories: ['employees'],
  recipients: ['payroll processor', 'tax authority', 'pension fund administrator'],
  crossBorderTransfers: undefined,
  retentionPeriod: '7 years after employment ends',
  retentionJustification: 'Required by Nigerian tax law and labour regulations',
  securityMeasures: ['encrypted database', 'role-based access', 'audit logging'],
  dataSource: 'data_subject',
  dpiaRequired: false,
  automatedDecisionMaking: false,
  status: 'active',
  department: 'Human Resources',
  systemsUsed: ['SAP HR', 'BankConnect'],
  createdAt: Date.now() - 86400000 * 365,
  updatedAt: Date.now(),
  lastReviewedAt: Date.now() - 86400000 * 30,
  nextReviewDate: Date.now() + 86400000 * 335,
  ...overrides,
});

const createROPA = (records: ProcessingRecord[]): RecordOfProcessingActivities => ({
  id: 'ropa-001',
  organizationName: 'NaijaTech Solutions Ltd',
  organizationContact: 'info@naijatech.example.com',
  organizationAddress: '15 Broad Street, Lagos Island, Lagos, Nigeria',
  dpoDetails: {
    name: 'Chioma Eze',
    email: 'dpo@naijatech.example.com',
    phone: '+234 801 234 5678',
  },
  ndpcRegistrationNumber: 'NDPC-2024-00123',
  records,
  lastUpdated: Date.now(),
  version: '2.0',
});

describe('validateProcessingRecord', () => {
  it('should validate a fully compliant record', () => {
    const record = createValidRecord();
    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return errors for missing required fields', () => {
    const record = createValidRecord({
      id: '',
      name: '',
      description: '',
      controllerDetails: { name: '', contact: '', address: '' },
      lawfulBasis: undefined as any,
      lawfulBasisJustification: '',
      purposes: [],
      dataCategories: [],
      dataSubjectCategories: [],
      recipients: [],
      retentionPeriod: '',
      securityMeasures: [],
      dataSource: undefined as any,
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Record ID is required.');
    expect(result.errors).toContain('Processing activity name is required.');
    expect(result.errors).toContain('Processing description is required.');
    expect(result.errors).toContain('Controller name is required.');
    expect(result.errors).toContain('Controller contact is required.');
    expect(result.errors).toContain('Controller address is required.');
    expect(result.errors).toContain('A valid lawful basis must be specified (NDPA Section 25).');
    expect(result.errors).toContain('Lawful basis justification is required to demonstrate compliance.');
    expect(result.errors).toContain('At least one processing purpose must be specified.');
    expect(result.errors).toContain('At least one data category must be specified.');
    expect(result.errors).toContain('At least one data subject category must be specified.');
    expect(result.errors).toContain('At least one recipient or category of recipients must be specified.');
    expect(result.errors).toContain('Retention period must be specified.');
    expect(result.errors).toContain('At least one security measure must be documented.');
    expect(result.errors).toContain('Data source must be specified.');
  });

  it('should require third-party source details when data source is third_party', () => {
    const record = createValidRecord({
      dataSource: 'third_party',
      thirdPartySourceDetails: '',
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Third-party source details are required when data source is "third_party".'
    );
  });

  it('should pass when third_party source has details provided', () => {
    const record = createValidRecord({
      dataSource: 'third_party',
      thirdPartySourceDetails: 'Employee background check provider (VerifyNG)',
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(true);
  });

  it('should require automated decision-making details when flagged', () => {
    const record = createValidRecord({
      automatedDecisionMaking: true,
      automatedDecisionMakingDetails: '',
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Automated decision-making details are required when automated decision-making is involved.'
    );
  });

  it('should pass when automated decision-making has details', () => {
    const record = createValidRecord({
      automatedDecisionMaking: true,
      automatedDecisionMakingDetails:
        'Credit scoring algorithm used to determine loan eligibility. Manual review is available upon request.',
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(true);
  });

  it('should require DPIA reference when DPIA is required', () => {
    const record = createValidRecord({
      dpiaRequired: true,
      dpiaReference: '',
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('DPIA reference is required when DPIA is marked as required.');
  });

  it('should pass when DPIA is required and reference is provided', () => {
    const record = createValidRecord({
      dpiaRequired: true,
      dpiaReference: 'DPIA-2025-HR-001',
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(true);
  });

  it('should reject an invalid lawful basis', () => {
    const record = createValidRecord({
      lawfulBasis: 'invalid_basis' as any,
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('A valid lawful basis must be specified (NDPA Section 25).');
  });

  it('should not require controller details sub-fields when controllerDetails itself is missing', () => {
    const record = createValidRecord({
      controllerDetails: undefined as any,
    });

    const result = validateProcessingRecord(record);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Controller details are required.');
    expect(result.errors).not.toContain('Controller name is required.');
  });
});

describe('generateROPASummary', () => {
  it('should produce correct counts for a mixed set of records', () => {
    const records: ProcessingRecord[] = [
      createValidRecord({
        id: 'rec-001',
        lawfulBasis: 'contract',
        status: 'active',
        department: 'Human Resources',
      }),
      createValidRecord({
        id: 'rec-002',
        lawfulBasis: 'consent',
        status: 'active',
        sensitiveDataCategories: ['health data'],
        department: 'Marketing',
      }),
      createValidRecord({
        id: 'rec-003',
        lawfulBasis: 'legitimate_interests',
        status: 'inactive',
        crossBorderTransfers: [
          {
            destinationCountry: 'United Kingdom',
            safeguards: 'Standard contractual clauses',
            transferMechanism: 'standard_clauses',
          },
        ],
        department: 'Marketing',
      }),
      createValidRecord({
        id: 'rec-004',
        lawfulBasis: 'consent',
        status: 'active',
        dpiaRequired: true,
        dpiaReference: 'DPIA-004',
        automatedDecisionMaking: true,
        automatedDecisionMakingDetails: 'Recommendation engine',
        department: 'Engineering',
      }),
    ];

    const ropa = createROPA(records);
    const summary = generateROPASummary(ropa);

    expect(summary.totalRecords).toBe(4);
    expect(summary.activeRecords).toBe(3);
    expect(summary.byLawfulBasis.consent).toBe(2);
    expect(summary.byLawfulBasis.contract).toBe(1);
    expect(summary.byLawfulBasis.legitimate_interests).toBe(1);
    expect(summary.byLawfulBasis.legal_obligation).toBe(0);
    expect(summary.sensitiveDataRecords).toBe(1);
    expect(summary.crossBorderRecords).toBe(1);
    expect(summary.dpiaRequiredRecords).toBe(1);
    expect(summary.automatedDecisionRecords).toBe(1);
  });

  it('should identify records due for review', () => {
    const overdueRecord = createValidRecord({
      id: 'rec-overdue',
      nextReviewDate: Date.now() - 86400000 * 30,
    });
    const futureRecord = createValidRecord({
      id: 'rec-future',
      nextReviewDate: Date.now() + 86400000 * 180,
    });

    const ropa = createROPA([overdueRecord, futureRecord]);
    const summary = generateROPASummary(ropa);

    expect(summary.recordsDueForReview).toHaveLength(1);
    expect(summary.recordsDueForReview[0].id).toBe('rec-overdue');
  });

  it('should rank top departments by record count', () => {
    const records = [
      createValidRecord({ id: 'r1', department: 'Engineering' }),
      createValidRecord({ id: 'r2', department: 'Engineering' }),
      createValidRecord({ id: 'r3', department: 'Engineering' }),
      createValidRecord({ id: 'r4', department: 'Marketing' }),
      createValidRecord({ id: 'r5', department: 'Marketing' }),
      createValidRecord({ id: 'r6', department: 'Legal' }),
    ];

    const ropa = createROPA(records);
    const summary = generateROPASummary(ropa);

    expect(summary.topDepartments[0].department).toBe('Engineering');
    expect(summary.topDepartments[0].count).toBe(3);
    expect(summary.topDepartments[1].department).toBe('Marketing');
    expect(summary.topDepartments[1].count).toBe(2);
  });

  it('should return the lastUpdated timestamp from the ROPA', () => {
    const ropa = createROPA([createValidRecord()]);
    const summary = generateROPASummary(ropa);

    expect(summary.lastUpdated).toBe(ropa.lastUpdated);
  });

  it('should handle an empty records array', () => {
    const ropa = createROPA([]);
    const summary = generateROPASummary(ropa);

    expect(summary.totalRecords).toBe(0);
    expect(summary.activeRecords).toBe(0);
    expect(summary.recordsDueForReview).toEqual([]);
    expect(summary.topDepartments).toEqual([]);
  });
});

describe('exportROPAToCSV', () => {
  it('should produce a CSV string with headers and one data row', () => {
    const record = createValidRecord();
    const ropa = createROPA([record]);
    const csv = exportROPAToCSV(ropa);

    const lines = csv.split('\n');

    expect(lines.length).toBe(2);
    expect(lines[0]).toContain('ID');
    expect(lines[0]).toContain('Name');
    expect(lines[0]).toContain('Lawful Basis');
    expect(lines[0]).toContain('Controller Name');
    expect(lines[0]).toContain('Retention Period');
  });

  it('should include record data in the CSV output', () => {
    const record = createValidRecord({
      id: 'rec-csv',
      name: 'CSV Test Record',
      lawfulBasis: 'consent',
    });
    const ropa = createROPA([record]);
    const csv = exportROPAToCSV(ropa);

    expect(csv).toContain('rec-csv');
    expect(csv).toContain('CSV Test Record');
    expect(csv).toContain('consent');
  });

  it('should properly escape fields containing commas', () => {
    const record = createValidRecord({
      description: 'Processing for legal, compliance, and regulatory purposes',
    });
    const ropa = createROPA([record]);
    const csv = exportROPAToCSV(ropa);

    expect(csv).toContain('"Processing for legal, compliance, and regulatory purposes"');
  });

  it('should properly escape fields containing double quotes', () => {
    const record = createValidRecord({
      description: 'Processing under "special" conditions',
    });
    const ropa = createROPA([record]);
    const csv = exportROPAToCSV(ropa);

    expect(csv).toContain('"Processing under ""special"" conditions"');
  });

  it('should include cross-border transfer summaries', () => {
    const record = createValidRecord({
      crossBorderTransfers: [
        {
          destinationCountry: 'Ghana',
          transferMechanism: 'adequacy_decision',
          safeguards: 'Adequacy finding by NDPC',
        },
      ],
    });
    const ropa = createROPA([record]);
    const csv = exportROPAToCSV(ropa);

    expect(csv).toContain('Ghana');
    expect(csv).toContain('adequacy_decision');
  });

  it('should produce multiple data rows for multiple records', () => {
    const records = [
      createValidRecord({ id: 'r1', name: 'Record One' }),
      createValidRecord({ id: 'r2', name: 'Record Two' }),
      createValidRecord({ id: 'r3', name: 'Record Three' }),
    ];
    const ropa = createROPA(records);
    const csv = exportROPAToCSV(ropa);

    const lines = csv.split('\n');
    expect(lines.length).toBe(4);
  });

  it('should handle empty records gracefully', () => {
    const ropa = createROPA([]);
    const csv = exportROPAToCSV(ropa);

    const lines = csv.split('\n');
    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('ID');
  });
});

describe('identifyComplianceGaps', () => {
  it('should return no gaps for a fully compliant ROPA', () => {
    const records = [
      createValidRecord({ id: 'rec-ok-1' }),
      createValidRecord({ id: 'rec-ok-2' }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps).toEqual([]);
  });

  it('should detect missing lawful basis justification', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-1',
        name: 'No Justification',
        lawfulBasisJustification: '',
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].recordId).toBe('rec-gap-1');
    expect(gaps[0].gaps).toContain(
      'Missing lawful basis justification (NDPA Section 25 requires documented justification).'
    );
  });

  it('should detect missing retention period', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-2',
        name: 'No Retention',
        retentionPeriod: '',
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain(
      'Missing retention period (data must not be kept longer than necessary).'
    );
  });

  it('should detect missing security measures', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-3',
        name: 'No Security',
        securityMeasures: [],
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain(
      'No security measures documented (NDPA requires appropriate technical and organizational measures).'
    );
  });

  it('should detect overdue reviews', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-4',
        name: 'Overdue Review',
        nextReviewDate: Date.now() - 86400000 * 10,
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    const reviewGap = gaps[0].gaps.find((g) => g.includes('Review is overdue'));
    expect(reviewGap).toBeDefined();
    expect(reviewGap).toContain('day');
  });

  it('should detect missing DPIA reference when DPIA is required', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-5',
        name: 'DPIA Missing',
        dpiaRequired: true,
        dpiaReference: '',
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain(
      'DPIA is required but no reference to a completed DPIA was provided.'
    );
  });

  it('should detect missing automated decision-making details', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-6',
        name: 'ADM Missing Details',
        automatedDecisionMaking: true,
        automatedDecisionMakingDetails: '',
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain(
      'Automated decision-making is flagged but no details are documented.'
    );
  });

  it('should detect missing cross-border transfer safeguards and mechanism', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-7',
        name: 'Cross-Border Gaps',
        crossBorderTransfers: [
          {
            destinationCountry: 'South Africa',
            safeguards: '',
            transferMechanism: '',
          },
        ],
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain(
      'Cross-border transfer to South Africa is missing safeguard documentation.'
    );
    expect(gaps[0].gaps).toContain(
      'Cross-border transfer to South Africa is missing transfer mechanism.'
    );
  });

  it('should detect missing third-party source details', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-8',
        name: 'Third-Party Source',
        dataSource: 'third_party',
        thirdPartySourceDetails: '',
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain(
      'Data source is "third_party" but no source details are provided.'
    );
  });

  it('should detect missing purposes and recipients', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-9',
        name: 'Missing Lists',
        purposes: [],
        recipients: [],
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps[0].gaps).toContain('No processing purposes specified.');
    expect(gaps[0].gaps).toContain('No recipients or categories of recipients specified.');
  });

  it('should aggregate multiple gaps for a single record', () => {
    const records = [
      createValidRecord({
        id: 'rec-gap-multi',
        name: 'Many Gaps',
        lawfulBasisJustification: '',
        retentionPeriod: '',
        securityMeasures: [],
        purposes: [],
        recipients: [],
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].gaps.length).toBeGreaterThanOrEqual(5);
  });

  it('should return gaps grouped by record with correct identifiers', () => {
    const records = [
      createValidRecord({ id: 'ok-1', name: 'Clean Record' }),
      createValidRecord({
        id: 'gap-1',
        name: 'Problematic Record',
        retentionPeriod: '',
      }),
    ];
    const ropa = createROPA(records);
    const gaps = identifyComplianceGaps(ropa);

    expect(gaps).toHaveLength(1);
    expect(gaps[0].recordId).toBe('gap-1');
    expect(gaps[0].recordName).toBe('Problematic Record');
  });
});
