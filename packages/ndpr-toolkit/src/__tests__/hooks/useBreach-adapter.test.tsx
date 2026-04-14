import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreach } from '../../hooks/useBreach';
import { memoryAdapter } from '../../adapters/memory';
import type { BreachCategory } from '../../types/breach';

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
  affectedIndividuals: 100,
  status: 'investigating' as const,
  severity: 'high' as const,
};

describe('useBreach with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories: mockCategories, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reports).toEqual([]);
    expect(result.current.assessments).toEqual([]);
    expect(result.current.notifications).toEqual([]);
  });

  it('saves composite state to adapter on reportBreach', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories: mockCategories, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.reportBreach(baseReportData as any);
    });

    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect(saved!.reports).toHaveLength(1);
    expect(saved!.reports[0].title).toBe('Test Breach');
    expect(saved!.assessments).toEqual([]);
    expect(saved!.notifications).toEqual([]);
  });

  it('saves to adapter on assessRisk', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories: mockCategories, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let breachId: string;
    act(() => {
      const report = result.current.reportBreach(baseReportData as any);
      breachId = report.id;
    });

    act(() => {
      result.current.assessRisk(breachId!, {
        likelihood: 'high',
        impact: 'high',
        riskScore: 9,
        riskLevel: 'critical',
        affectedDataTypes: ['personal'],
        mitigationMeasures: [],
        residualRisk: 'medium',
      } as any);
    });

    const saved = adapter.load();
    expect(saved!.assessments).toHaveLength(1);
    expect(saved!.assessments[0].breachId).toBe(breachId!);
  });

  it('clears adapter on clearBreachData', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories: mockCategories, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.reportBreach(baseReportData as any);
    });

    act(() => {
      result.current.clearBreachData();
    });

    expect(adapter.load()).toBeNull();
    expect(result.current.reports).toEqual([]);
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<any>((resolve) => setTimeout(() => resolve(null), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useBreach({ categories: mockCategories, adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('backward compat with storageKey (no adapter)', async () => {
    const { result } = renderHook(() =>
      useBreach({
        categories: mockCategories,
        storageKey: 'ndpr_breach_test_compat',
        useLocalStorage: false,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reports).toEqual([]);
  });

  it('isLoading is present on the return value', async () => {
    const adapter = memoryAdapter<any>();
    const { result } = renderHook(() => useBreach({ categories: mockCategories, adapter }));
    expect('isLoading' in result.current).toBe(true);
  });
});
