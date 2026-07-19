import {
  runNdprAudit,
  formatNdprAuditReport,
  validateNdprAuditConfig,
} from '../../utils/audit';
import type { NdprAuditInput } from '../../utils/audit';
import type { ComplianceInput } from '../../utils/compliance-score';
import type { BreachReport } from '../../types/breach';

const HOUR = 3600_000;

function perfectCompliance(): ComplianceInput {
  return {
    consent: {
      hasConsentMechanism: true,
      hasPurposeSpecification: true,
      hasWithdrawalMechanism: true,
      hasMinorProtection: true,
      consentRecordsRetained: true,
    },
    dsr: {
      hasRequestMechanism: true,
      supportsAccess: true,
      supportsRectification: true,
      supportsErasure: true,
      supportsPortability: true,
      supportsObjection: true,
      responseTimelineDays: 14,
    },
    dpia: { conductedForHighRisk: true, documentedRisks: true, mitigationMeasures: true },
    breach: { hasNotificationProcess: true, notifiesWithin72Hours: true, hasRiskAssessment: true, hasRecordKeeping: true },
    policy: { hasPrivacyPolicy: true, isPubliclyAccessible: true, lastUpdated: '2026-05-01', coversAllSections: true },
    lawfulBasis: { documentedForAllProcessing: true, hasLegitimateInterestAssessment: true },
    crossBorder: { hasTransferMechanisms: true, adequacyAssessed: true, ndpcApprovalObtained: true },
    ropa: { maintained: true, includesAllProcessing: true, lastReviewed: '2026-05-01' },
  };
}

function completeAuditBreach(): BreachReport {
  const discoveredAt = Date.UTC(2026, 0, 1);
  return {
    id: 'b1',
    title: 'Exposed export',
    description: 'A bucket exposed a customer export for six hours.',
    category: 'unauthorised-access',
    discoveredAt,
    occurredAt: discoveredAt - 6 * HOUR,
    reportedAt: discoveredAt,
    reporter: { name: 'Ada', email: 'ada@example.com', department: 'Security' },
    affectedSystems: ['crm'],
    dataTypes: ['email'],
    estimatedAffectedSubjects: 100,
    approximateRecordCount: 100,
    dataSubjectCategories: ['customers'],
    likelyConsequences: 'Affected customers face a phishing risk.',
    mitigationMeasures: 'Access was removed and credentials were rotated.',
    initialActions: 'Affected customers were notified by email.',
    dpoContact: { name: 'Bola', email: 'dpo@example.com' },
    status: 'contained',
  };
}

describe('runNdprAudit', () => {
  it('passes for a complete compliance posture', () => {
    const result = runNdprAudit({ compliance: perfectCompliance() });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.summary.fail).toBe(0);
    expect(result.minScore).toBe(70);
  });

  it('fails when a critical NDPA gap is present', () => {
    const compliance = perfectCompliance();
    compliance.consent.hasConsentMechanism = false; // critical-priority gap
    const result = runNdprAudit({ compliance });
    expect(result.passed).toBe(false);
    expect(result.checks.some((c) => c.status === 'fail')).toBe(true);
  });

  it('fails when the score is below the configured minimum', () => {
    const compliance = perfectCompliance();
    // Knock out several non-critical items to drop the score without a critical gap.
    compliance.crossBorder.adequacyAssessed = false;
    compliance.crossBorder.ndpcApprovalObtained = false;
    compliance.lawfulBasis.hasLegitimateInterestAssessment = false;
    const result = runNdprAudit({ compliance }, { minScore: 100 });
    expect(result.passed).toBe(false);
    const overall = result.checks.find((c) => c.id === 'compliance-score');
    expect(overall?.status).toBe('fail');
  });

  it('flags an overdue, un-notified breach as a hard failure', () => {
    const discoveredAt = Date.UTC(2026, 0, 1);
    const breach: BreachReport = {
      id: 'b1',
      title: 'Exposed export',
      description: 'A bucket was exposed.',
      category: 'unauthorised-access',
      discoveredAt,
      reportedAt: discoveredAt,
      reporter: { name: 'Ada', email: 'ada@example.com', department: 'Security' },
      affectedSystems: ['crm'],
      dataTypes: ['email'],
      status: 'contained',
    };
    const result = runNdprAudit(
      { compliance: perfectCompliance(), breaches: [breach] },
      { breachOptions: { asOf: discoveredAt + 100 * HOUR } },
    );
    expect(result.breaches).toHaveLength(1);
    const breachCheck = result.checks.find((c) => c.id.startsWith('breach:'));
    expect(breachCheck?.status).toBe('fail');
    expect(result.passed).toBe(false);
  });

  it('includes DCPMI classification and CAR schedule when provided', () => {
    const result = runNdprAudit({
      compliance: perfectCompliance(),
      dcpmi: { dataSubjectsInSixMonths: 6200 },
      car: { commencementDate: '2025-01-15', asOf: '2026-03-21' },
    });
    expect(result.dcpmi?.tier).toBe('UHL');
    expect(result.car?.schedule.nextFilingDeadline).toBe('2026-05-30');
    expect(result.checks.some((c) => c.id === 'dcpmi')).toBe(true);
    expect(result.checks.some((c) => c.id === 'car')).toBe(true);
  });
  it('fails closed when malformed runtime assessment evidence tries to waive notification', () => {
    const breach = completeAuditBreach();
    const input = {
      compliance: perfectCompliance(),
      breaches: [breach],
      breachEvidence: {
        b1: {
          assessment: { breachId: 'b1', risksToRightsAndFreedoms: false },
        },
      },
    } as unknown as NdprAuditInput;

    const result = runNdprAudit(input, {
      breachOptions: { asOf: breach.discoveredAt + 24 * HOUR },
    });

    expect(result.passed).toBe(false);
    expect(result.breaches[0].assessment.notificationRequired).toBe(true);
    expect(result.breaches[0].assessment.evidence.assessmentValid).toBe(false);
    expect(result.checks.find((check) => check.id === 'breach:b1')?.status).toBe('fail');
  });
  it('fails closed when runtime JSON supplies a bare false notification override', () => {
    const breach = completeAuditBreach();
    const input = {
      compliance: perfectCompliance(),
      breaches: [breach],
      breachEvidence: { b1: { notificationRequired: false } },
    } as unknown as NdprAuditInput;

    const result = runNdprAudit(input, {
      breachOptions: { asOf: breach.discoveredAt + 24 * HOUR },
    });

    expect(result.passed).toBe(false);
    expect(result.breaches[0].assessment.notificationRequired).toBe(true);
    expect(result.breaches[0].assessment.valid).toBe(false);
    expect(result.checks.find((check) => check.id === 'breach:b1')?.status).toBe('fail');
  });

  it.each([
    [
      'a noncanonical year key',
      { '02027': '2027-04-30' },
      /canonical four-digit year from 2000 to 9999/i,
    ],
    [
      'an inherited year key',
      Object.create({ 2027: '2027-04-30' }),
      /plain object or null-prototype record/i,
    ],
  ])('fails closed for CAR options with %s', (_label, deadlineOverrides, expected) => {
    const input: NdprAuditInput = {
      compliance: perfectCompliance(),
      car: { commencementDate: '2024-01-01', asOf: '2027-04-01', tier: 'none' },
    };
    expect(runNdprAudit(input).passed).toBe(true);
    expect(() => runNdprAudit(input, {
      carOptions: {
        deadlineOverrides: deadlineOverrides as Record<number, string>,
      },
    })).toThrow(expected);
  });

  it.each([
    ['empty ruleset ID', { rulesetId: '' }, /rulesetId.*non-empty/i],
    ['empty ruleset version', { rulesetVersion: ' ' }, /rulesetVersion.*non-empty/i],
    ['impossible effective date', { rulesetEffectiveDate: '2026-02-30' }, /rulesetEffectiveDate.*real calendar date/i],
  ])('rejects %s at the aggregate programmatic boundary', (_label, carOptions, expected) => {
    expect(() => runNdprAudit(
      {
        compliance: perfectCompliance(),
        car: { commencementDate: '2024-01-01', asOf: '2026-03-21', tier: 'UHL' },
      },
      { carOptions },
    )).toThrow(expected);
  });

  it('fails when a content-complete breach has impossible chronology', () => {
    const breach = completeAuditBreach();
    breach.occurredAt = breach.discoveredAt + HOUR;
    const result = runNdprAudit(
      {
        compliance: perfectCompliance(),
        breaches: [breach],
        breachEvidence: {
          b1: {
            notification: {
              id: 'n1',
              breachId: 'b1',
              sentAt: breach.discoveredAt + 12 * HOUR,
              method: 'portal',
              content: 'Filed via NIMP.',
            },
          },
        },
      },
      { breachOptions: { asOf: breach.discoveredAt + 24 * HOUR } },
    );

    expect(result.passed).toBe(false);
    expect(result.breaches[0].assessment.valid).toBe(false);
    expect(result.breaches[0].assessment.ready).toBe(false);
  });
});

describe('validateNdprAuditConfig', () => {
  it('rejects partial nested breach assessment evidence', () => {
    const breach = completeAuditBreach();
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      breaches: [breach],
      options: { breachOptions: { asOf: breach.discoveredAt + 24 * HOUR } },
      breachEvidence: {
        b1: { assessment: { breachId: 'b1', risksToRightsAndFreedoms: false } },
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'breachEvidence.b1.assessment.id' }),
        expect.objectContaining({ path: 'breachEvidence.b1.assessment.assessedAt' }),
      ]),
    );
  });

  it.each([
    ['before discovery', -HOUR],
    ['after asOf', 25 * HOUR],
  ])('rejects notification evidence sent %s', (_label, offset) => {
    const breach = completeAuditBreach();
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      breaches: [breach],
      options: { breachOptions: { asOf: breach.discoveredAt + 24 * HOUR } },
      breachEvidence: {
        b1: {
          notification: {
            id: 'n1',
            breachId: 'b1',
            sentAt: breach.discoveredAt + offset,
            method: 'portal',
            content: 'Filed via NIMP.',
          },
        },
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'breachEvidence.b1.notification.sentAt' }),
      ]),
    );
  });

  it('accepts complete correlated notification evidence within the audit interval', () => {
    const breach = completeAuditBreach();
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      breaches: [breach],
      options: { breachOptions: { asOf: breach.discoveredAt + 24 * HOUR } },
      breachEvidence: {
        b1: {
          notification: {
            id: 'n1',
            breachId: 'b1',
            sentAt: breach.discoveredAt + 12 * HOUR,
            method: 'portal',
            content: 'Filed via NIMP.',
          },
        },
      },
    });

    expect(validation).toEqual({ valid: true, errors: [] });
  });
  it('rejects a bare false notification requirement in strict JSON', () => {
    const breach = completeAuditBreach();
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      breaches: [breach],
      options: { breachOptions: { asOf: breach.discoveredAt + 24 * HOUR } },
      breachEvidence: { b1: { notificationRequired: false } },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'breachEvidence.b1.notificationRequired' }),
      ]),
    );
  });

  it.each([
    ['occurredAt after discoveredAt', { occurredAt: Date.UTC(2026, 0, 1) + HOUR }, 'occurredAt'],
    ['reportedAt before discoveredAt', { reportedAt: Date.UTC(2026, 0, 1) - HOUR }, 'reportedAt'],
    ['reportedAt after asOf', { reportedAt: Date.UTC(2026, 0, 1) + 25 * HOUR }, 'reportedAt'],
  ])('rejects impossible breach chronology: %s', (_label, overrides, field) => {
    const breach = { ...completeAuditBreach(), ...overrides };
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      breaches: [breach],
      options: { breachOptions: { asOf: breach.discoveredAt + 24 * HOUR } },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: `breaches.0.${field}` }),
      ]),
    );
  });

  it('rejects inherited CAR override records even when no CAR scope is supplied', () => {
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      options: {
        carOptions: {
          deadlineOverrides: Object.create({ 2027: '2027-04-30' }),
        },
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'options.carOptions.deadlineOverrides' }),
    ]));
  });

  it('rejects CAR override accessors without invoking them', () => {
    let reads = 0;
    const deadlineOverrides = {};
    Object.defineProperty(deadlineOverrides, '2027', {
      enumerable: true,
      get() {
        reads += 1;
        throw new Error('must not execute');
      },
    });

    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      options: { carOptions: { deadlineOverrides } },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'options.carOptions.deadlineOverrides.2027' }),
    ]));
    expect(reads).toBe(0);
  });

  it.each([
    ['rulesetId', '', 'options.carOptions.rulesetId'],
    ['rulesetVersion', '   ', 'options.carOptions.rulesetVersion'],
    ['rulesetEffectiveDate', '2026-02-30', 'options.carOptions.rulesetEffectiveDate'],
  ])('rejects invalid CAR provenance field %s', (field, value, path) => {
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      options: { carOptions: { [field]: value } },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path }),
    ]));
  });

  it('rejects unsupported CAR tiers instead of treating them as not applicable', () => {
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      car: { commencementDate: '2020-01-01', asOf: '2026-06-01', tier: 'bogus' },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'car.tier' })]),
    );
  });

  it('rejects malformed and future CAR evidence with invalid options', () => {
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      car: {
        commencementDate: '2025-02-30',
        asOf: '2026-03-21',
        tier: 'UHL',
        filings: [
          { year: 2026, filedAt: '2026-04-01', acknowledgedAt: '2026-03-01' },
          { year: 2026, filedAt: '2026-03-01' },
        ],
      },
      options: {
        carOptions: {
          annualDeadline: { month: 13, day: 0 },
          deadlineOverrides: { 2027: '2026-04-30' },
        },
      },
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'car.commencementDate' }),
        expect.objectContaining({ path: 'car.filings.0.filedAt' }),
        expect.objectContaining({ path: 'car.filings.1.year' }),
        expect.objectContaining({ path: 'options.carOptions.annualDeadline.month' }),
        expect.objectContaining({ path: 'options.carOptions.deadlineOverrides.2027' }),
      ]),
    );
  });

  it('accepts complete chronological CAR evidence and reviewed options', () => {
    const validation = validateNdprAuditConfig({
      compliance: perfectCompliance(),
      car: {
        commencementDate: '2023-01-01',
        asOf: '2026-03-21',
        tier: 'UHL',
        initialAuditCompletedAt: '2024-03-01',
        filings: [
          {
            year: 2025,
            filedAt: '2025-03-20',
            referenceNumber: 'CAR-2025-001',
            acknowledgedAt: '2025-03-21',
          },
        ],
      },
      options: {
        carOptions: {
          annualDeadline: { month: 3, day: 31 },
          initialAuditWithinMonths: 15,
          deadlineOverrides: { 2027: '2027-04-30' },
        },
      },
    });

    expect(validation).toEqual({ valid: true, errors: [] });
  });
});

describe('formatNdprAuditReport', () => {
  it('renders a readable report with a verdict and the score', () => {
    const report = formatNdprAuditReport(runNdprAudit({ compliance: perfectCompliance() }));
    expect(report).toMatch(/PASS/);
    expect(report).toMatch(/100/);
  });

  it('renders FAIL when the audit does not pass', () => {
    const compliance = perfectCompliance();
    compliance.consent.hasConsentMechanism = false;
    const report = formatNdprAuditReport(runNdprAudit({ compliance }));
    expect(report).toMatch(/FAIL/);
  });
});
