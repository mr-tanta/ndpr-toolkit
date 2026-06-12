/**
 * Regression tests for callbacks firing with values computed inside a
 * setState updater. When two mutations land in the same React batch, the
 * second updater is deferred, so code that reads a variable assigned inside
 * the updater immediately after calling setState sees the stale initial
 * value — the callback is silently skipped and the mutator returns null.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDSR } from '../../hooks/useDSR';
import { useLawfulBasis } from '../../hooks/useLawfulBasis';
import { useCrossBorderTransfer } from '../../hooks/useCrossBorderTransfer';
import { memoryAdapter } from '../../adapters/memory';
import type { DSRRequest, RequestType } from '../../types/dsr';
import type { ProcessingActivity } from '../../types/lawful-basis';
import type { CrossBorderTransfer } from '../../types/cross-border';

const requestTypes: RequestType[] = [
  {
    id: 'access',
    name: 'Access Request',
    description: 'Request to access your personal data',
    estimatedCompletionTime: 30,
    requiresAdditionalInfo: false,
  },
];

const baseActivityData: Omit<ProcessingActivity, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Customer Data Processing',
  description: 'Processing customer personal data for service delivery',
  lawfulBasis: 'contract',
  lawfulBasisJustification: 'Necessary for contract performance',
  dataCategories: ['personal'],
  involvesSensitiveData: false,
  dataSubjectCategories: ['customers'],
  purposes: ['service_delivery'],
  retentionPeriod: '3 years',
  crossBorderTransfer: false,
  status: 'active',
};

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

describe('useDSR batched updates', () => {
  it('returns each updated request and fires onUpdate for both updates in one batch', () => {
    const onUpdate = jest.fn();
    const { result } = renderHook(() => useDSR({ requestTypes, onUpdate }));

    let id: string;
    act(() => {
      id = result.current.submitRequest({
        type: 'access',
        subject: { name: 'John Doe', email: 'john@example.com' },
        createdAt: Date.now(),
        description: 'I want to access my data',
      }).id;
    });

    let first: DSRRequest | null = null;
    let second: DSRRequest | null = null;
    act(() => {
      first = result.current.updateRequest(id, { status: 'inProgress' });
      second = result.current.updateRequest(id, { status: 'completed' });
    });

    expect(first?.status).toBe('inProgress');
    expect(second?.status).toBe('completed');
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(result.current.requests[0].status).toBe('completed');
  });

  it('can update a request submitted in the same batch', () => {
    const onUpdate = jest.fn();
    const { result } = renderHook(() => useDSR({ requestTypes, onUpdate }));

    let updated: DSRRequest | null = null;
    act(() => {
      const submitted = result.current.submitRequest({
        type: 'access',
        subject: { name: 'John Doe', email: 'john@example.com' },
        createdAt: Date.now(),
      });
      updated = result.current.updateRequest(submitted.id, { status: 'inProgress' });
    });

    expect(updated?.status).toBe('inProgress');
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(result.current.requests[0].status).toBe('inProgress');
  });
});

describe('useLawfulBasis batched updates', () => {
  it('returns each updated activity and fires onUpdate for both updates in one batch', async () => {
    const onUpdate = jest.fn();
    const adapter = memoryAdapter<ProcessingActivity[]>();
    const { result } = renderHook(() => useLawfulBasis({ adapter, onUpdate }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let id: string;
    act(() => {
      id = result.current.addActivity(baseActivityData).id;
    });

    let first: ProcessingActivity | null = null;
    let second: ProcessingActivity | null = null;
    act(() => {
      first = result.current.updateActivity(id, { name: 'First Update' });
      second = result.current.updateActivity(id, { name: 'Second Update' });
    });

    expect(first?.name).toBe('First Update');
    expect(second?.name).toBe('Second Update');
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(result.current.activities[0].name).toBe('Second Update');
  });
});

describe('useCrossBorderTransfer batched updates', () => {
  it('returns each updated transfer and fires onUpdate for both updates in one batch', async () => {
    const onUpdate = jest.fn();
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter, onUpdate }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let id: string;
    act(() => {
      id = result.current.addTransfer(baseTransferData).id;
    });

    let first: CrossBorderTransfer | null = null;
    let second: CrossBorderTransfer | null = null;
    act(() => {
      first = result.current.updateTransfer(id, { recipientOrganization: 'First Update' });
      second = result.current.updateTransfer(id, { recipientOrganization: 'Second Update' });
    });

    expect(first?.recipientOrganization).toBe('First Update');
    expect(second?.recipientOrganization).toBe('Second Update');
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(result.current.transfers[0].recipientOrganization).toBe('Second Update');
  });

  it('fires onRemove when a transfer is removed in the same batch as an update', async () => {
    const onRemove = jest.fn();
    const adapter = memoryAdapter<CrossBorderTransfer[]>();
    const { result } = renderHook(() => useCrossBorderTransfer({ adapter, onRemove }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let id: string;
    act(() => {
      id = result.current.addTransfer(baseTransferData).id;
    });

    act(() => {
      result.current.updateTransfer(id, { recipientOrganization: 'Updated' });
      result.current.removeTransfer(id);
    });

    expect(onRemove).toHaveBeenCalledWith(id);
    expect(result.current.transfers).toEqual([]);
  });
});
