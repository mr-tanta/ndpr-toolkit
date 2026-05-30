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

  it('treats a notification sent within 72 hours as on time', () => {
    const notification: RegulatoryNotification = {
      id: 'n1',
      breachId: 'b1',
      sentAt: DISCOVERED + 50 * HOUR,
      method: 'portal',
      content: 'Filed via NIMP.',
    };
    const r = assessBreachNotification(completeReport(), { notification, asOf: DISCOVERED + 100 * HOUR });
    expect(r.timing.notified).toBe(true);
    expect(r.timing.notifiedAt).toBe(DISCOVERED + 50 * HOUR);
    expect(r.timing.withinDeadline).toBe(true);
    expect(r.timing.overdue).toBe(false);
    expect(r.timing.requiresDelayJustification).toBe(false);
  });

  it('requires data-subject communication when the risk assessment is high', () => {
    const assessment = { highRisksToRightsAndFreedoms: true } as RiskAssessment;
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

  it('does not require data-subject communication when risk is not high', () => {
    const r = assessBreachNotification(completeReport(), { highRisk: false, asOf: DISCOVERED + 1 * HOUR });
    expect(r.dataSubjectCommunicationRequired).toBe(false);
    expect(r.dataSubjectCommunication).toHaveLength(0);
    expect(r.complete).toBe(true);
  });

  it('honours a custom deadline window', () => {
    const r = assessBreachNotification(completeReport(), { deadlineHours: 24, asOf: DISCOVERED + 10 * HOUR });
    expect(r.timing.deadline).toBe(DISCOVERED + 24 * HOUR);
    expect(r.timing.hoursRemaining).toBe(14);
  });
});
