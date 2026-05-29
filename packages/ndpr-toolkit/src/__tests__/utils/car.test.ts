import { generateComplianceAuditReturn } from '../../utils/car';

describe('generateComplianceAuditReturn (NDPC GAID 2025 — Compliance Audit Returns)', () => {
  it('computes the initial audit due date as commencement + 15 months', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2025-01-15', asOf: '2025-06-01', tier: 'UHL' });
    expect(r.schedule.initialAuditDueDate).toBe('2026-04-15');
    expect(r.schedule.initialAuditWithinMonths).toBe(15);
  });

  it('defaults the annual filing deadline to 31 March and finds the next one', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-10', tier: 'UHL' });
    expect(r.schedule.nextFilingDeadline).toBe('2026-03-31');
    expect(r.schedule.filingYear).toBe(2026);
  });

  it('rolls to next year once the deadline has passed', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-04-01', tier: 'UHL' });
    expect(r.schedule.nextFilingDeadline).toBe('2027-03-31');
    expect(r.schedule.filingYear).toBe(2027);
  });

  it('honours per-year deadline overrides (e.g. 2026 extended to 30 May)', () => {
    const r = generateComplianceAuditReturn(
      { commencementDate: '2024-01-01', asOf: '2026-04-01', tier: 'UHL' },
      { deadlineOverrides: { 2026: '2026-05-30' } },
    );
    expect(r.schedule.nextFilingDeadline).toBe('2026-05-30'); // not yet passed on 2026-04-01
    expect(r.schedule.filingYear).toBe(2026);
  });

  it('computes whole days until the next filing deadline', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-03-21', tier: 'UHL' });
    expect(r.status.daysUntilNextDeadline).toBe(10); // 2026-03-21 → 2026-03-31
  });

  it('flags whether the initial audit obligation has arisen relative to asOf', () => {
    const before = generateComplianceAuditReturn({ commencementDate: '2025-01-15', asOf: '2025-06-01', tier: 'UHL' });
    expect(before.status.initialAuditDue).toBe(false);
    const after = generateComplianceAuditReturn({ commencementDate: '2025-01-15', asOf: '2026-05-01', tier: 'UHL' });
    expect(after.status.initialAuditDue).toBe(true);
  });

  it('is not applicable to a non-DCPMI organisation', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier: 'none' });
    expect(r.applicable).toBe(false);
  });

  it('is applicable to every DCPMI tier including listed', () => {
    for (const tier of ['UHL', 'EHL', 'OHL', 'listed'] as const) {
      expect(
        generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier }).applicable,
      ).toBe(true);
    }
  });

  it('surfaces a GAID/NIMP caveat note', () => {
    const r = generateComplianceAuditReturn({ commencementDate: '2024-01-01', asOf: '2026-01-01', tier: 'UHL' });
    expect(r.notes.some((n) => /gaid|nimp/i.test(n))).toBe(true);
  });
});
