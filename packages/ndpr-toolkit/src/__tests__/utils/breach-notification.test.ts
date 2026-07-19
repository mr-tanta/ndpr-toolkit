import { assessBreachNotification } from '../../utils/breach-notification';
import type { BreachReport, RiskAssessment, RegulatoryNotification } from '../../types/breach';

const HOUR = 3600_000;
const DISCOVERED = Date.UTC(2026, 0, 1, 0, 0, 0);

function completeReport(overrides: Partial<BreachReport> = {}): BreachReport {
  return {
    id: 'b1',
    title: 'Unauthorised access to CRM export',
    description: 'A misconfigured S3 bucket exposed a customer export for 6 hours.',
    category: 'unauthorised-access',
    discoveredAt: DISCOVERED,
    occurredAt: DISCOVERED - 6 * HOUR,
    reportedAt: DISCOVERED,
    reporter: { name: 'Ada', email: 'ada@example.com', department: 'Security' },
    affectedSystems: ['crm'],
    dataTypes: ['name', 'email', 'phone'],
    estimatedAffectedSubjects: 4200,
    approximateRecordCount: 4200,
    dataSubjectCategories: ['customers'],
    likelyConsequences: 'Possible phishing and identity-theft exposure for affected customers.',
    mitigationMeasures: 'Bucket locked down, credentials rotated, affected users emailed.',
    initialActions: 'Notified affected data subjects by email within 24 hours.',
    dpoContact: { name: 'Bola', email: 'dpo@example.com', phone: '+234...' },
    status: 'contained',
    ...overrides,
  };
}

function completeAssessment(overrides: Partial<RiskAssessment> = {}): RiskAssessment {
  return {
    id: 'a1',
    breachId: 'b1',
    assessedAt: DISCOVERED + HOUR,
    assessor: { name: 'Bola', role: 'DPO', email: 'dpo@example.com' },
    confidentialityImpact: 3,
    integrityImpact: 2,
    availabilityImpact: 1,
    harmLikelihood: 3,
    harmSeverity: 4,
    overallRiskScore: 3.2,
    riskLevel: 'high',
    risksToRightsAndFreedoms: true,
    highRisksToRightsAndFreedoms: false,
    justification: 'The exposed identifiers create a material phishing risk.',
    ...overrides,
  };
}

function completeNotification(overrides: Partial<RegulatoryNotification> = {}): RegulatoryNotification {
  return {
    id: 'n1',
    breachId: 'b1',
    sentAt: DISCOVERED + 50 * HOUR,
    method: 'portal',
    content: 'Filed via NIMP.',
    ...overrides,
  };
}

describe('assessBreachNotification (NDPA S.40 / GAID 2025 Article 33)', () => {
  it('marks a fully-populated regulatory notification as complete (100%)', () => {
    const r = assessBreachNotification(completeReport(), { asOf: DISCOVERED + 24 * HOUR });
    expect(r.complete).toBe(true);
    expect(r.completeness).toBe(100);
    expect(r.missing).toHaveLength(0);
    expect(r.notificationToCommission.every((i) => i.satisfied)).toBe(true);
  });

  it('flags missing required content and cites the right provisions', () => {
    const r = assessBreachNotification(
      completeReport({ likelyConsequences: undefined, mitigationMeasures: '', dpoContact: undefined }),
      { asOf: DISCOVERED + 24 * HOUR },
    );
    expect(r.complete).toBe(false);
    expect(r.completeness).toBeLessThan(100);

    const riskOfHarm = r.notificationToCommission.find((i) => i.id === 'riskOfHarm');
    const mitigation = r.notificationToCommission.find((i) => i.id === 'mitigation');
    const contact = r.notificationToCommission.find((i) => i.id === 'contactPoint');
    expect(riskOfHarm?.satisfied).toBe(false);
    expect(mitigation?.satisfied).toBe(false);
    expect(contact?.satisfied).toBe(false);
    expect(contact?.section).toMatch(/Art\. 33\(5\)\(h\)/);
    expect(r.missing.length).toBeGreaterThanOrEqual(3);
  });

  it('cites NDPA S.40(2) for data-subject categories and record count', () => {
    const r = assessBreachNotification(completeReport(), { asOf: DISCOVERED + 1 * HOUR });
    const cats = r.notificationToCommission.find((i) => i.id === 'dataSubjectCategories');
    const records = r.notificationToCommission.find((i) => i.id === 'recordCount');
    expect(cats?.section).toMatch(/S\.?\s?40\(2\)/);
    expect(records?.section).toMatch(/S\.?\s?40\(2\)/);
  });

  it('reports time remaining before the 72-hour deadline', () => {
    const r = assessBreachNotification(completeReport(), { asOf: DISCOVERED + 24 * HOUR });
    expect(r.timing.deadline).toBe(DISCOVERED + 72 * HOUR);
    expect(r.timing.hoursRemaining).toBe(48);
    expect(r.timing.overdue).toBe(false);
    expect(r.timing.withinDeadline).toBe(true);
    expect(r.timing.notified).toBe(false);
  });

  it('flags an overdue, un-notified breach and requires a delay justification', () => {
    const r = assessBreachNotification(completeReport(), { asOf: DISCOVERED + 80 * HOUR });
    expect(r.timing.overdue).toBe(true);
    expect(r.timing.hoursRemaining).toBe(-8);
    expect(r.timing.requiresDelayJustification).toBe(true);
    expect(r.recommendations.some((m) => /phased|delay/i.test(m))).toBe(true);
  });

  it('treats a complete notification sent within 72 hours as valid and ready', () => {
    const r = assessBreachNotification(completeReport(), {
      notification: completeNotification(),
      asOf: DISCOVERED + 100 * HOUR,
    });
    expect(r.timing.notified).toBe(true);
    expect(r.timing.notifiedAt).toBe(DISCOVERED + 50 * HOUR);
    expect(r.timing.withinDeadline).toBe(true);
    expect(r.timing.overdue).toBe(false);
    expect(r.timing.requiresDelayJustification).toBe(false);
    expect(r.evidence.notificationValid).toBe(true);
    expect(r.ready).toBe(true);
  });

  it('fails closed when a partial matching assessment attempts to suppress notification', () => {
    const assessment = {
      breachId: 'b1',
      risksToRightsAndFreedoms: false,
    } as RiskAssessment;
    const r = assessBreachNotification(completeReport(), {
      assessment,
      asOf: DISCOVERED + 24 * HOUR,
    });

    expect(r.evidence.assessmentCorrelated).toBe(true);
    expect(r.evidence.assessmentValid).toBe(false);
    expect(r.notificationRequired).toBe(true);
    expect(r.valid).toBe(false);
    expect(r.ready).toBe(false);
    expect(r.validationErrors).toEqual(
      expect.arrayContaining([expect.stringMatching(/assessment\.id/i)]),
    );
  });

  it.each([
    ['before discovery', DISCOVERED - HOUR],
    ['after asOf', DISCOVERED + 25 * HOUR],
  ])('rejects a notification timestamp %s', (_label, sentAt) => {
    const r = assessBreachNotification(completeReport(), {
      notification: completeNotification({ sentAt }),
      asOf: DISCOVERED + 24 * HOUR,
    });

    expect(r.timing.validNotificationTimestamp).toBe(false);
    expect(r.timing.notified).toBe(false);
    expect(r.evidence.notificationValid).toBe(false);
    expect(r.valid).toBe(false);
    expect(r.ready).toBe(false);
    expect(r.validationErrors).toEqual(
      expect.arrayContaining([expect.stringMatching(/notification\.sentAt.*between breach discovery and asOf/i)]),
    );
  });

  it('requires data-subject communication when the risk assessment is high', () => {
    const assessment = completeAssessment({
      highRisksToRightsAndFreedoms: true,
      risksToRightsAndFreedoms: true,
    });
    const r = assessBreachNotification(
      completeReport({ likelyConsequences: undefined }),
      { assessment, asOf: DISCOVERED + 1 * HOUR },
    );
    expect(r.dataSubjectCommunicationRequired).toBe(true);
    expect(r.dataSubjectCommunication.length).toBeGreaterThan(0);
    const consequences = r.dataSubjectCommunication.find((i) => i.id === 'dsConsequences');
    expect(consequences?.section).toMatch(/S\.?\s?40\(3\)/);
    expect(consequences?.satisfied).toBe(false);
    expect(r.complete).toBe(false);
  });

  it('fails closed by applying the data-subject duty until complete evidence establishes no high risk', () => {
    const r = assessBreachNotification(completeReport(), {
      asOf: DISCOVERED + HOUR,
    });

    expect(r.evidence.assessmentProvided).toBe(false);
    expect(r.dataSubjectCommunicationRequired).toBe(true);
    expect(r.dataSubjectCommunication).toHaveLength(4);
  });

  it('does not require data-subject communication when a complete assessment finds no high risk', () => {
    const assessment = completeAssessment({
      risksToRightsAndFreedoms: true,
      highRisksToRightsAndFreedoms: false,
    });
    const r = assessBreachNotification(completeReport(), {
      assessment,
      asOf: DISCOVERED + 1 * HOUR,
    });
    expect(r.dataSubjectCommunicationRequired).toBe(false);
    expect(r.dataSubjectCommunication).toHaveLength(0);
    expect(r.valid).toBe(true);
    expect(r.complete).toBe(true);
  });

  it('keeps complete assessment-only low-risk evidence valid and ready', () => {
    const assessment = completeAssessment({
      riskLevel: 'low',
      risksToRightsAndFreedoms: false,
      highRisksToRightsAndFreedoms: false,
      overallRiskScore: 1,
      justification: 'The encrypted operational identifier cannot identify a person without separately held data.',
    });
    const r = assessBreachNotification(completeReport(), {
      assessment,
      asOf: DISCOVERED + 2 * HOUR,
    });

    expect(r.evidence.assessmentValid).toBe(true);
    expect(r.notificationRequired).toBe(false);
    expect(r.dataSubjectCommunicationRequired).toBe(false);
    expect(r.timing.notified).toBe(false);
    expect(r.valid).toBe(true);
    expect(r.complete).toBe(true);
    expect(r.ready).toBe(true);
  });

  it('rejects a bare false Commission-notification override and fails closed', () => {
    const r = assessBreachNotification(completeReport(), {
      notificationRequired: false,
      asOf: DISCOVERED + 24 * HOUR,
    } as unknown as Parameters<typeof assessBreachNotification>[1]);

    expect(r.notificationRequired).toBe(true);
    expect(r.valid).toBe(false);
    expect(r.ready).toBe(false);
    expect(r.validationErrors).toEqual(
      expect.arrayContaining([expect.stringMatching(/notificationRequired.*force-on/i)]),
    );
  });

  it('rejects a bare false high-risk override instead of suppressing a validated duty', () => {
    const r = assessBreachNotification(completeReport(), {
      assessment: completeAssessment({ highRisksToRightsAndFreedoms: true }),
      highRisk: false,
      asOf: DISCOVERED + 24 * HOUR,
    } as unknown as Parameters<typeof assessBreachNotification>[1]);

    expect(r.dataSubjectCommunicationRequired).toBe(true);
    expect(r.valid).toBe(false);
    expect(r.ready).toBe(false);
    expect(r.validationErrors).toEqual(
      expect.arrayContaining([expect.stringMatching(/highRisk.*force-on/i)]),
    );
  });

  it.each([
    ['occurrence after discovery', { occurredAt: DISCOVERED + HOUR }],
    ['reporting before discovery', { reportedAt: DISCOVERED - HOUR }],
    ['reporting after asOf', { reportedAt: DISCOVERED + 25 * HOUR }],
  ])('rejects impossible breach chronology: %s', (_label, overrides) => {
    const r = assessBreachNotification(completeReport(overrides), {
      notification: completeNotification({ sentAt: DISCOVERED + 12 * HOUR }),
      asOf: DISCOVERED + 24 * HOUR,
    });

    expect(r.valid).toBe(false);
    expect(r.ready).toBe(false);
    expect(r.validationErrors).toEqual(
      expect.arrayContaining([expect.stringMatching(/Breach (occurredAt|reportedAt)/)]),
    );
  });

  it('honours a custom deadline window', () => {
    const r = assessBreachNotification(completeReport(), { deadlineHours: 24, asOf: DISCOVERED + 10 * HOUR });
    expect(r.timing.deadline).toBe(DISCOVERED + 24 * HOUR);
    expect(r.timing.hoursRemaining).toBe(14);
  });
});
