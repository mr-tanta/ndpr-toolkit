import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreach } from '../../hooks/useBreach';
import { memoryAdapter } from '../../adapters/memory';
import type { BreachCategory, RiskAssessment, RegulatoryNotification } from '../../types/breach';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockCategories: BreachCategory[] = [
  {
    id: 'unauthorized-access',
    name: 'Unauthorized Access',
    description: 'Unauthorized access to systems or data',
    defaultSeverity: 'high',
  },
];

const baseReportData = {
  title: 'Test Breach',
  description: 'A test breach incident',
  category: 'unauthorized-access',
  discoveredAt: Date.now(),
  reporter: {
    name: 'Security Officer',
    email: 'security@example.com',
    department: 'IT',
  },
  affectedSystems: ['CRM'],
  dataTypes: ['personal'],
  estimatedAffectedSubjects: 100,
  status: 'contained' as const,
};

const baseAssessmentData = {
  assessor: { name: 'DPO', role: 'Data Protection Officer', email: 'dpo@example.com' },
  confidentialityImpact: 4,
  integrityImpact: 3,
  availabilityImpact: 2,
  harmLikelihood: 4,
  harmSeverity: 4,
  overallRiskScore: 9,
  riskLevel: 'critical' as const,
  risksToRightsAndFreedoms: true,
  highRisksToRightsAndFreedoms: true,
  justification: 'High impact breach',
};

const baseNotificationData = {
  method: 'email' as const,
  content: 'Notification to NDPC about breach',
  ndpcContact: {
    name: 'NDPC Officer',
    email: 'officer@ndpc.gov.ng',
  },
};

// ---------------------------------------------------------------------------
// Tests: Concurrent mutations (stale closure regression)
// ---------------------------------------------------------------------------

describe('useBreach — stale closure fix', () => {
  describe('concurrent mutations do not lose data', () => {
    it('reportBreach + assessRisk in the same act() both persist to React state', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      // Now call assessRisk in its own act so stateRef has been updated
      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      // Both the report AND the assessment must be in the rendered state
      expect(result.current.reports).toHaveLength(1);
      expect(result.current.assessments).toHaveLength(1);
      expect(result.current.assessments[0].breachId).toBe(breachId!);
    });

    it('two reportBreach calls in separate act blocks both persist', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.reportBreach({
          ...baseReportData,
          title: 'Breach A',
        } as any);
      });

      act(() => {
        result.current.reportBreach({
          ...baseReportData,
          title: 'Breach B',
        } as any);
      });

      expect(result.current.reports).toHaveLength(2);
      expect(result.current.reports.map((r) => r.title)).toEqual(
        expect.arrayContaining(['Breach A', 'Breach B']),
      );
    });

    it('reportBreach + assessRisk + sendNotification in rapid succession', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      act(() => {
        result.current.sendNotification(breachId!, baseNotificationData as any);
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.assessments).toHaveLength(1);
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].breachId).toBe(breachId!);
    });
  });

  // ---------------------------------------------------------------------------
  // Tests: State consistency after multiple operations
  // ---------------------------------------------------------------------------

  describe('state consistency after multiple operations', () => {
    it('report, assess, and notify — all three present in final state', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      // Step 1 — report
      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.assessments).toHaveLength(0);
      expect(result.current.notifications).toHaveLength(0);

      // Step 2 — assess risk
      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.assessments).toHaveLength(1);
      expect(result.current.notifications).toHaveLength(0);

      // Step 3 — send notification
      act(() => {
        result.current.sendNotification(breachId!, baseNotificationData as any);
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.assessments).toHaveLength(1);
      expect(result.current.notifications).toHaveLength(1);

      // Cross-reference IDs
      const report = result.current.reports[0];
      const assessment = result.current.assessments[0];
      const notification = result.current.notifications[0];

      expect(assessment.breachId).toBe(report.id);
      expect(notification.breachId).toBe(report.id);
    });

    it('updating a report does not lose assessments or notifications', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      act(() => {
        result.current.sendNotification(breachId!, baseNotificationData as any);
      });

      // Now update the report
      act(() => {
        result.current.updateReport(breachId!, {
          title: 'Updated Title',
          status: 'resolved',
        });
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.reports[0].title).toBe('Updated Title');
      expect(result.current.reports[0].status).toBe('resolved');
      // Assessment and notification must still be present
      expect(result.current.assessments).toHaveLength(1);
      expect(result.current.notifications).toHaveLength(1);
    });

    it('multiple breaches with independent assessments', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let idA: string;
      let idB: string;

      act(() => {
        const a = result.current.reportBreach({ ...baseReportData, title: 'Breach A' } as any);
        idA = a.id;
      });

      act(() => {
        const b = result.current.reportBreach({ ...baseReportData, title: 'Breach B' } as any);
        idB = b.id;
      });

      act(() => {
        result.current.assessRisk(idA!, baseAssessmentData as any);
      });

      act(() => {
        result.current.assessRisk(idB!, {
          ...baseAssessmentData,
          overallRiskScore: 3,
          riskLevel: 'low' as const,
        } as any);
      });

      expect(result.current.reports).toHaveLength(2);
      expect(result.current.assessments).toHaveLength(2);

      const assessmentA = result.current.assessments.find((a) => a.breachId === idA!);
      const assessmentB = result.current.assessments.find((a) => a.breachId === idB!);

      expect(assessmentA).toBeDefined();
      expect(assessmentB).toBeDefined();
      expect(assessmentA!.overallRiskScore).toBe(9);
      expect(assessmentB!.overallRiskScore).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // Tests: Adapter persistence correctness
  // ---------------------------------------------------------------------------

  describe('adapter persistence contains all mutations', () => {
    it('adapter stores report + assessment after sequential mutations', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      const saved = adapter.load();
      expect(saved).not.toBeNull();
      expect(saved!.reports).toHaveLength(1);
      expect(saved!.assessments).toHaveLength(1);
      expect(saved!.assessments[0].breachId).toBe(breachId!);
    });

    it('adapter stores all three slices after full workflow', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      act(() => {
        result.current.sendNotification(breachId!, baseNotificationData as any);
      });

      const saved = adapter.load();
      expect(saved).not.toBeNull();
      expect(saved!.reports).toHaveLength(1);
      expect(saved!.assessments).toHaveLength(1);
      expect(saved!.notifications).toHaveLength(1);
      expect(saved!.reports[0].title).toBe('Test Breach');
      expect(saved!.assessments[0].breachId).toBe(breachId!);
      expect(saved!.notifications[0].breachId).toBe(breachId!);
    });

    it('adapter reflects updated report alongside assessment', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      act(() => {
        result.current.updateReport(breachId!, { title: 'Revised Title' });
      });

      const saved = adapter.load();
      expect(saved!.reports[0].title).toBe('Revised Title');
      expect(saved!.assessments).toHaveLength(1);
    });

    it('adapter data survives clearBreachData and subsequent new report', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.reportBreach(baseReportData as any);
      });

      act(() => {
        result.current.clearBreachData();
      });

      expect(adapter.load()).toBeNull();
      expect(result.current.reports).toHaveLength(0);

      // A new report after clearing should work
      act(() => {
        result.current.reportBreach({ ...baseReportData, title: 'After Clear' } as any);
      });

      expect(result.current.reports).toHaveLength(1);
      expect(result.current.reports[0].title).toBe('After Clear');

      const saved = adapter.load();
      expect(saved).not.toBeNull();
      expect(saved!.reports).toHaveLength(1);
    });

    it('custom adapter save is called for every mutation', async () => {
      const saveCalls: any[] = [];
      const spyAdapter = {
        load: () => null,
        save: (data: any) => { saveCalls.push(JSON.parse(JSON.stringify(data))); },
        remove: () => {},
      };
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter: spyAdapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let breachId: string;

      act(() => {
        const report = result.current.reportBreach(baseReportData as any);
        breachId = report.id;
      });

      act(() => {
        result.current.assessRisk(breachId!, baseAssessmentData as any);
      });

      act(() => {
        result.current.sendNotification(breachId!, baseNotificationData as any);
      });

      // Save should have been called 3 times (once per mutation)
      expect(saveCalls.length).toBe(3);

      // First save: only report
      expect(saveCalls[0].reports).toHaveLength(1);
      expect(saveCalls[0].assessments).toHaveLength(0);
      expect(saveCalls[0].notifications).toHaveLength(0);

      // Second save: report + assessment
      expect(saveCalls[1].reports).toHaveLength(1);
      expect(saveCalls[1].assessments).toHaveLength(1);

      // Third save: report + assessment + notification
      expect(saveCalls[2].reports).toHaveLength(1);
      expect(saveCalls[2].assessments).toHaveLength(1);
      expect(saveCalls[2].notifications).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Tests: useCallback stability
  // ---------------------------------------------------------------------------

  describe('useCallback stability across re-renders', () => {
    it('mutator references are stable across re-renders when deps unchanged', async () => {
      const adapter = memoryAdapter<any>();
      const { result, rerender } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const firstReportBreach = result.current.reportBreach;
      const firstAssessRisk = result.current.assessRisk;
      const firstSendNotification = result.current.sendNotification;
      const firstUpdateReport = result.current.updateReport;
      const firstGetReport = result.current.getReport;
      const firstGetAssessment = result.current.getAssessment;
      const firstGetNotification = result.current.getNotification;
      const firstClearBreachData = result.current.clearBreachData;
      const firstCalculateNotificationReqs = result.current.calculateNotificationRequirements;

      // Re-render with the same props
      rerender();

      expect(result.current.reportBreach).toBe(firstReportBreach);
      expect(result.current.assessRisk).toBe(firstAssessRisk);
      expect(result.current.sendNotification).toBe(firstSendNotification);
      expect(result.current.updateReport).toBe(firstUpdateReport);
      expect(result.current.getReport).toBe(firstGetReport);
      expect(result.current.getAssessment).toBe(firstGetAssessment);
      expect(result.current.getNotification).toBe(firstGetNotification);
      expect(result.current.clearBreachData).toBe(firstClearBreachData);
      expect(result.current.calculateNotificationRequirements).toBe(firstCalculateNotificationReqs);
    });

    it('mutator references remain stable even after state changes', async () => {
      const adapter = memoryAdapter<any>();
      const { result } = renderHook(() =>
        useBreach({ categories: mockCategories, adapter }),
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const firstReportBreach = result.current.reportBreach;
      const firstAssessRisk = result.current.assessRisk;
      const firstSendNotification = result.current.sendNotification;

      // Trigger a state change
      act(() => {
        result.current.reportBreach(baseReportData as any);
      });

      // After the state update, function refs should still be the same
      expect(result.current.reportBreach).toBe(firstReportBreach);
      expect(result.current.assessRisk).toBe(firstAssessRisk);
      expect(result.current.sendNotification).toBe(firstSendNotification);
    });

    it('callback instability when deps change (onReport changes)', async () => {
      const adapter = memoryAdapter<any>();
      let onReport = jest.fn();

      const { result, rerender } = renderHook(
        ({ cb }: { cb: (r: any) => void }) =>
          useBreach({ categories: mockCategories, adapter, onReport: cb }),
        { initialProps: { cb: onReport } },
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const firstReportBreach = result.current.reportBreach;

      // Change the callback — reportBreach should get a new identity
      const newOnReport = jest.fn();
      rerender({ cb: newOnReport });

      expect(result.current.reportBreach).not.toBe(firstReportBreach);
    });
  });
});
