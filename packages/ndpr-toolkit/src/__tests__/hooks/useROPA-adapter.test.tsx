import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useROPA } from '../../hooks/useROPA';
import { memoryAdapter } from '../../adapters/memory';
import type { RecordOfProcessingActivities, ProcessingRecord } from '../../types/ropa';

const initialROPA: RecordOfProcessingActivities = {
  id: 'ropa-test-001',
  organizationName: 'Test Org',
  organizationContact: 'privacy@test.com',
  organizationAddress: '1 Test Street',
  records: [],
  lastUpdated: Date.now(),
  version: '1.0',
};

const baseRecord: ProcessingRecord = {
  id: 'rec-001',
  name: 'Customer Registration',
  description: 'Processing customer registration data',
  controller: 'Test Org',
  purposes: ['account_management'],
  lawfulBasis: 'contract',
  dataCategories: ['personal'],
  dataSubjects: ['customers'],
  recipients: [],
  retentionPeriod: '3 years',
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('useROPA with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<RecordOfProcessingActivities>();
    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.ropa.records).toEqual([]);
  });

  it('saves ROPA to adapter on addRecord', async () => {
    const adapter = memoryAdapter<RecordOfProcessingActivities>();
    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addRecord(baseRecord);
    });

    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect(saved!.records).toHaveLength(1);
    expect(saved!.records[0].name).toBe('Customer Registration');
  });

  it('saves to adapter on updateRecord', async () => {
    const adapter = memoryAdapter<RecordOfProcessingActivities>();
    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addRecord(baseRecord);
    });

    act(() => {
      result.current.updateRecord('rec-001', { name: 'Updated Registration' });
    });

    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect(saved!.records[0].name).toBe('Updated Registration');
  });

  it('saves to adapter on archiveRecord', async () => {
    const adapter = memoryAdapter<RecordOfProcessingActivities>();
    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addRecord(baseRecord);
    });

    act(() => {
      result.current.archiveRecord('rec-001');
    });

    const saved = adapter.load();
    expect(saved).not.toBeNull();
    expect(saved!.records[0].status).toBe('archived');
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<RecordOfProcessingActivities | null>((resolve) => setTimeout(() => resolve(null), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('behaves as before when no adapter provided (isLoading is false)', async () => {
    const { result } = renderHook(() => useROPA({ initialData: initialROPA }));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.ropa.organizationName).toBe('Test Org');
  });

  it('loads persisted state from adapter on mount', async () => {
    const persistedROPA: RecordOfProcessingActivities = {
      ...initialROPA,
      records: [baseRecord],
    };
    const adapter = memoryAdapter<RecordOfProcessingActivities>();
    adapter.save(persistedROPA);

    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.ropa.records).toHaveLength(1);
    expect(result.current.ropa.records[0].name).toBe('Customer Registration');
  });

  it('isLoading is present on the return value', () => {
    const adapter = memoryAdapter<RecordOfProcessingActivities>();
    const { result } = renderHook(() => useROPA({ initialData: initialROPA, adapter }));
    expect('isLoading' in result.current).toBe(true);
  });
});
