import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDPIA } from '../../hooks/useDPIA';
import { memoryAdapter } from '../../adapters/memory';
import type { DPIASection } from '../../types/dpia';

const mockSections: DPIASection[] = [
  {
    id: 'section1',
    title: 'Processing Overview',
    description: 'General information',
    order: 1,
    questions: [
      {
        id: 'q1',
        text: 'Describe the processing activity',
        type: 'textarea',
        required: true,
      },
    ],
  },
];

describe('useDPIA with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<Record<string, any>>();
    const { result } = renderHook(() => useDPIA({ sections: mockSections, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.answers).toEqual({});
  });

  it('saves to adapter on updateAnswer', async () => {
    const adapter = memoryAdapter<Record<string, any>>();
    const { result } = renderHook(() => useDPIA({ sections: mockSections, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateAnswer('q1', 'Test answer');
    });

    const saved = adapter.load() as Record<string, any> | null;
    expect(saved).not.toBeNull();
    expect(saved!['q1']).toBe('Test answer');
  });

  it('clears adapter on resetDPIA', async () => {
    const adapter = memoryAdapter<Record<string, any>>();
    const { result } = renderHook(() => useDPIA({ sections: mockSections, adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateAnswer('q1', 'Some answer');
    });

    act(() => {
      result.current.resetDPIA();
    });

    expect(adapter.load()).toBeNull();
    expect(result.current.answers).toEqual({});
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<Record<string, any>>((resolve) => setTimeout(() => resolve({}), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useDPIA({ sections: mockSections, adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('backward compat with storageKey (no adapter)', async () => {
    const { result } = renderHook(() =>
      useDPIA({
        sections: mockSections,
        storageKey: 'ndpr_dpia_test_compat',
        useLocalStorage: false,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.answers).toEqual({});
  });

  it('isLoading is present on the return value', async () => {
    const adapter = memoryAdapter<Record<string, any>>();
    const { result } = renderHook(() => useDPIA({ sections: mockSections, adapter }));
    expect('isLoading' in result.current).toBe(true);
  });
});
