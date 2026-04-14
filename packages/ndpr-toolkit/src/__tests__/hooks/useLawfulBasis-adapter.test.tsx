import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLawfulBasis } from '../../hooks/useLawfulBasis';
import { memoryAdapter } from '../../adapters/memory';
import type { ProcessingActivity } from '../../types/lawful-basis';

const baseActivityData: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Customer Data Processing',
  description: 'Processing customer personal data for service delivery',
  lawfulBasis: 'contract',
  dataCategories: ['personal'],
  purposes: ['service_delivery'],
  retentionPeriod: '3 years',
  dataSubjects: ['customers'],
};

describe('useLawfulBasis with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<ProcessingActivity[]>();
    const { result } = renderHook(() => useLawfulBasis({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activities).toEqual([]);
  });

  it('saves activities to adapter on addActivity', async () => {
    const adapter = memoryAdapter<ProcessingActivity[]>();
    const { result } = renderHook(() => useLawfulBasis({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addActivity(baseActivityData);
    });

    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect(saved).toHaveLength(1);
    expect(saved![0].name).toBe('Customer Data Processing');
  });

  it('saves to adapter on updateActivity', async () => {
    const adapter = memoryAdapter<ProcessingActivity[]>();
    const { result } = renderHook(() => useLawfulBasis({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let activityId: string;
    act(() => {
      const activity = result.current.addActivity(baseActivityData);
      activityId = activity.id;
    });

    act(() => {
      result.current.updateActivity(activityId!, { name: 'Updated Activity' });
    });

    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect(saved![0].name).toBe('Updated Activity');
  });

  it('saves to adapter on removeActivity', async () => {
    const adapter = memoryAdapter<ProcessingActivity[]>();
    const { result } = renderHook(() => useLawfulBasis({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let activityId: string;
    act(() => {
      const activity = result.current.addActivity(baseActivityData);
      activityId = activity.id;
    });

    act(() => {
      result.current.removeActivity(activityId!);
    });

    const saved = adapter.load();
    expect(saved).toEqual([]);
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<ProcessingActivity[] | null>((resolve) => setTimeout(() => resolve(null), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useLawfulBasis({ adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('backward compat with storageKey (no adapter)', async () => {
    const { result } = renderHook(() =>
      useLawfulBasis({
        storageKey: 'ndpr_lawful_basis_test_compat',
        useLocalStorage: false,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activities).toEqual([]);
  });

  it('isLoading is present on the return value', async () => {
    const adapter = memoryAdapter<ProcessingActivity[]>();
    const { result } = renderHook(() => useLawfulBasis({ adapter }));
    expect('isLoading' in result.current).toBe(true);
  });
});
