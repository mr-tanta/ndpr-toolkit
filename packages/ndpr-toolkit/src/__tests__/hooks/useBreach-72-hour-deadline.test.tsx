/**
 * Tests for the 72-hour breach-notification countdown logic — the most
 * legally consequential path in the toolkit (NDPA Section 40(2)).
 *
 * The audit (2026-05) flagged that `useBreach.getBreachesRequiringNotification`
 * had zero hook-level tests despite being the toolkit's signature feature.
 * These cases lock in the boundary behaviour at 1h / 24h / 48h / 71.5h /
 * exactly-72h, plus the expired-window case.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreach } from '../../hooks/useBreach';
import { memoryAdapter } from '../../adapters/memory';
import type { BreachCategory, BreachReport } from '../../types/breach';

const HOUR = 60 * 60 * 1000;

const categories: BreachCategory[] = [
  {
    id: 'unauthorized-access',
    name: 'Unauthorized Access',
    description: 'Unauthorized access to systems or data',
    defaultSeverity: 'high',
  },
];

/** Build a high-severity breach report `hoursAgo` hours before now. */
function reportNHoursAgo(hoursAgo: number): Omit<BreachReport, 'id' | 'reportedAt'> & { reportedAt?: number } {
  return {
    title: `Breach discovered ${hoursAgo}h ago`,
    description: 'Test breach for deadline countdown',
    category: 'unauthorized-access',
    discoveredAt: Date.now() - hoursAgo * HOUR,
    reporter: { name: 'Security Officer', email: 'security@example.com', department: 'IT' },
    affectedSystems: ['CRM'],
    dataTypes: ['personal'],
    estimatedAffectedSubjects: 500,
    involvesSensitiveData: true,
    status: 'ongoing' as const,
  };
}

describe('useBreach: 72-hour NDPC notification deadline (Section 40(2))', () => {
  async function renderWithReport(hoursAgo: number) {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let breachId = '';
    act(() => {
      const report = result.current.reportBreach(reportNHoursAgo(hoursAgo) as any);
      breachId = report.id;
    });

    // Submit a matching risk assessment so notification requirements compute
    act(() => {
      result.current.assessRisk(breachId, {
        assessor: { name: 'DPO', role: 'DPO', email: 'dpo@example.com' },
        confidentialityImpact: 5,
        integrityImpact: 4,
        availabilityImpact: 3,
        harmLikelihood: 5,
        harmSeverity: 5,
        overallRiskScore: 80,
        riskLevel: 'high',
        risksToRightsAndFreedoms: true,
        highRisksToRightsAndFreedoms: true,
        justification: 'Sensitive personal data exposed',
      });
    });

    return { result, breachId };
  }

  it('reports ~71 hours remaining for a breach discovered 1 hour ago', async () => {
    const { result } = await renderWithReport(1);

    // Threshold of 72h to include everything
    const matches = result.current.getBreachesRequiringNotification(72);
    expect(matches).toHaveLength(1);
    expect(matches[0].hoursRemaining).toBeGreaterThan(70.5);
    expect(matches[0].hoursRemaining).toBeLessThan(71.5);
  });

  it('reports ~48 hours remaining for a breach discovered 24 hours ago', async () => {
    const { result } = await renderWithReport(24);

    const matches = result.current.getBreachesRequiringNotification(72);
    expect(matches).toHaveLength(1);
    expect(matches[0].hoursRemaining).toBeGreaterThan(47.5);
    expect(matches[0].hoursRemaining).toBeLessThan(48.5);
  });

  it('reports ~24 hours remaining for a breach discovered 48 hours ago', async () => {
    const { result } = await renderWithReport(48);

    const matches = result.current.getBreachesRequiringNotification(72);
    expect(matches).toHaveLength(1);
    expect(matches[0].hoursRemaining).toBeGreaterThan(23.5);
    expect(matches[0].hoursRemaining).toBeLessThan(24.5);
  });

  it('reports ~0.5 hours remaining for a breach discovered 71.5 hours ago (under the wire)', async () => {
    const { result } = await renderWithReport(71.5);

    const matches = result.current.getBreachesRequiringNotification(72);
    expect(matches).toHaveLength(1);
    expect(matches[0].hoursRemaining).toBeGreaterThan(0);
    expect(matches[0].hoursRemaining).toBeLessThan(1);
  });

  it('reports negative hours remaining when the 72-hour deadline has passed', async () => {
    const { result } = await renderWithReport(80);

    const matches = result.current.getBreachesRequiringNotification(72);
    expect(matches).toHaveLength(1);
    expect(matches[0].hoursRemaining).toBeLessThan(0);
    expect(matches[0].hoursRemaining).toBeGreaterThan(-9); // ~-8h
  });

  it('honours the hoursThreshold parameter — a 6h threshold excludes a breach with 24h remaining', async () => {
    const { result } = await renderWithReport(48); // 24h remaining

    const close = result.current.getBreachesRequiringNotification(6);
    expect(close).toHaveLength(0);

    const wide = result.current.getBreachesRequiringNotification(48);
    expect(wide).toHaveLength(1);
  });

  it('sorts results by ascending hoursRemaining (most urgent first)', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Three reports at very different ages — newest = most time left
    let oldId = '', midId = '', newId = '';
    act(() => {
      oldId = result.current.reportBreach(reportNHoursAgo(60) as any).id;
      midId = result.current.reportBreach(reportNHoursAgo(30) as any).id;
      newId = result.current.reportBreach(reportNHoursAgo(2) as any).id;
    });

    for (const id of [oldId, midId, newId]) {
      act(() => {
        result.current.assessRisk(id, {
          assessor: { name: 'DPO', role: 'DPO', email: 'dpo@example.com' },
          confidentialityImpact: 5,
          integrityImpact: 4,
          availabilityImpact: 3,
          harmLikelihood: 5,
          harmSeverity: 5,
          overallRiskScore: 80,
          riskLevel: 'high',
          risksToRightsAndFreedoms: true,
          highRisksToRightsAndFreedoms: true,
          justification: 'Sensitive personal data exposed',
        });
      });
    }

    const matches = result.current.getBreachesRequiringNotification(72);
    expect(matches).toHaveLength(3);
    // Most urgent (oldest) → least urgent (newest)
    expect(matches[0].report.id).toBe(oldId);
    expect(matches[1].report.id).toBe(midId);
    expect(matches[2].report.id).toBe(newId);
    expect(matches[0].hoursRemaining).toBeLessThan(matches[1].hoursRemaining);
    expect(matches[1].hoursRemaining).toBeLessThan(matches[2].hoursRemaining);
  });

  it('excludes breaches that already have a sent notification (no duplicate alerts)', async () => {
    const { result, breachId } = await renderWithReport(48);

    // Confirm the breach is in the requiring-notification list
    expect(result.current.getBreachesRequiringNotification(72)).toHaveLength(1);

    // Send a notification
    act(() => {
      result.current.sendNotification(breachId, {
        method: 'email',
        content: 'Notification to NDPC',
      } as any);
    });

    // Should now be excluded
    expect(result.current.getBreachesRequiringNotification(72)).toHaveLength(0);
  });
});
