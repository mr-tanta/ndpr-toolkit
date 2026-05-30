import React from 'react';
import { render } from '@testing-library/react';
import { useBreachNotificationAssessment } from '../../hooks/useBreachNotificationAssessment';
import type { BreachNotificationOptions, BreachNotificationAssessment } from '../../utils/breach-notification';
import type { BreachReport, RiskAssessment } from '../../types/breach';

const HOUR = 3600_000;
const DISCOVERED = Date.UTC(2026, 0, 1, 0, 0, 0);

const report: BreachReport = {
  id: 'b1',
  title: 'Exposed export',
  description: 'A misconfigured bucket exposed a customer export.',
  category: 'unauthorised-access',
  discoveredAt: DISCOVERED,
  occurredAt: DISCOVERED - 6 * HOUR,
  reportedAt: DISCOVERED,
  reporter: { name: 'Ada', email: 'ada@example.com', department: 'Security' },
  affectedSystems: ['crm'],
  dataTypes: ['name', 'email'],
  estimatedAffectedSubjects: 4200,
  approximateRecordCount: 4200,
  dataSubjectCategories: ['customers'],
  likelyConsequences: 'Phishing exposure.',
  mitigationMeasures: 'Locked down, rotated credentials.',
  initialActions: 'Emailed affected subjects.',
  dpoContact: { name: 'Bola', email: 'dpo@example.com' },
  status: 'contained',
};

function capture(r: BreachReport, options?: BreachNotificationOptions): BreachNotificationAssessment {
  let result: BreachNotificationAssessment | undefined;
  function Probe() {
    result = useBreachNotificationAssessment(r, options);
    return null;
  }
  render(<Probe />);
  return result as BreachNotificationAssessment;
}

describe('useBreachNotificationAssessment', () => {
  it('returns a complete assessment for a fully-populated report', () => {
    const r = capture(report, { asOf: DISCOVERED + 24 * HOUR });
    expect(r.complete).toBe(true);
    expect(r.completeness).toBe(100);
  });

  it('requires data-subject communication on high risk', () => {
    const assessment = { highRisksToRightsAndFreedoms: true } as RiskAssessment;
    const r = capture(report, { assessment, asOf: DISCOVERED + 24 * HOUR });
    expect(r.dataSubjectCommunicationRequired).toBe(true);
  });
});
