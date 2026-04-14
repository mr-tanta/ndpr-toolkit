import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCrossBorderTransfer } from '../../hooks/useCrossBorderTransfer';
import { memoryAdapter } from '../../adapters/memory';
import type { CrossBorderTransfer } from '../../types/cross-border';

const baseTransferData: Omit<CrossBorderTransfer, 'id' | 'createdAt' | 'updatedAt'> = {
  destinationCountry: 'Germany',
  transferMechanism: 'standard_clauses',
  adequacyStatus: 'adequate',
  dataCategories: ['personal'],
  includesSensitiveData: false,
  recipientOrganization: 'EU Data Processor',
  recipientContact: { name: 'EU Customer Data Transfer', email: 'contact@eu-processor.de' },
  purpose: 'service_delivery',
  safeguards: ['encryption'],
  riskAssessment: 'Low risk transfer with standard clauses in place',
  status: 'active',
  tiaCompleted: true,
  riskLevel: 'low',
  frequency: 'continuous',
  startDate: Date.now(),
};

describe('useCrossBorderTransfer with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transfers).toEqual([]);
  });

  it('saves transfers to adapter on addTransfer', async () => {
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addTransfer(baseTransferData);
    });

    const saved = adapter.load() as CrossBorderTransfer[] | null;
    expect(saved).not.toBeNull();
    expect(saved).toHaveLength(1);
    expect(saved![0].recipientContact.name).toBe('EU Customer Data Transfer');
  });

  it('saves to adapter on updateTransfer', async () => {
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let transferId: string;
    act(() => {
      const transfer = result.current.addTransfer(baseTransferData);
      transferId = transfer.id;
    });

    act(() => {
      result.current.updateTransfer(transferId!, { recipientOrganization: 'Updated Transfer' });
    });

    const saved = adapter.load() as CrossBorderTransfer[] | null;
    expect(saved).not.toBeNull();
    expect(saved![0].recipientOrganization).toBe('Updated Transfer');
  });

  it('saves to adapter on removeTransfer', async () => {
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let transferId: string;
    act(() => {
      const transfer = result.current.addTransfer(baseTransferData);
      transferId = transfer.id;
    });

    act(() => {
      result.current.removeTransfer(transferId!);
    });

    const saved = adapter.load();
    expect(saved).toEqual([]);
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<CrossBorderTransfer[] | null>((resolve) => setTimeout(() => resolve(null), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter: asyncAdapter }));
    expect(result.current.isLoading).toBe(true);
  });

  it('backward compat with storageKey (no adapter)', async () => {
    const { result } = renderHook(() =>
      useCrossBorderTransfer({
        storageKey: 'ndpr_cross_border_test_compat',
        useLocalStorage: false,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transfers).toEqual([]);
  });

  it('isLoading is present on the return value', async () => {
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter }));
    expect('isLoading' in result.current).toBe(true);
  });
});
