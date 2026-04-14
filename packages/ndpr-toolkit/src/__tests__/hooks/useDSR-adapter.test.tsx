import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDSR } from '../../hooks/useDSR';
import { memoryAdapter } from '../../adapters/memory';
import type { RequestType } from '../../types/dsr';

const mockRequestTypes: RequestType[] = [
  {
    id: 'access',
    name: 'Access Request',
    description: 'Request to access your personal data',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

const baseRequestData = {
  type: 'access',
  dataSubject: {
    name: 'Test User',
    email: 'test@example.com',
    identifierType: 'email',
    identifierValue: 'test@example.com',
  },
};

describe('useDSR with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<any[]>();
    const { result } = renderHook(() => useDSR({ requestTypes: mockRequestTypes, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.requests).toEqual([]);
  });

  it('saves to adapter on submitRequest', async () => {
    const adapter = memoryAdapter<any[]>();
    const { result } = renderHook(() => useDSR({ requestTypes: mockRequestTypes, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.submitRequest(baseRequestData as any);
    });

    const saved = adapter.load() as any[] | null;
    expect(saved).not.toBeNull();
    expect(saved!.length).toBe(1);
    expect(saved![0].type).toBe('access');
  });

  it('clears adapter on clearRequests', async () => {
    const adapter = memoryAdapter<any[]>();
    const { result } = renderHook(() => useDSR({ requestTypes: mockRequestTypes, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.submitRequest(baseRequestData as any);
    });

    act(() => {
      result.current.clearRequests();
    });

    expect(adapter.load()).toBeNull();
    expect(result.current.requests).toEqual([]);
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useDSR({ requestTypes: mockRequestTypes, adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('backward compat with storageKey (no adapter)', async () => {
    const { result } = renderHook(() =>
      useDSR({
        requestTypes: mockRequestTypes,
        storageKey: 'ndpr_dsr_test_compat',
        useLocalStorage: false,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.requests).toEqual([]);
  });

  it('isLoading is present on the return value', async () => {
    const adapter = memoryAdapter<any[]>();
    const { result } = renderHook(() => useDSR({ requestTypes: mockRequestTypes, adapter }));
    expect('isLoading' in result.current).toBe(true);
  });
});
