/**
 * Regression test for the 3.10.3 audit finding: NDPRLawfulBasis and
 * NDPRCrossBorder both called `adapter.load()` synchronously and ignored the
 * returned Promise, so async-backed adapters (cookie, api) never seeded
 * initial state. This test asserts both presets now await the Promise.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { NDPRLawfulBasis } from '../../presets/NDPRLawfulBasis';
import { NDPRCrossBorder } from '../../presets/NDPRCrossBorder';
import type { StorageAdapter } from '../../adapters/types';
import type { ProcessingActivity } from '../../types/lawful-basis';
import type { CrossBorderTransfer } from '../../types/cross-border';

const NOW = 1700000000000;

/** Adapter whose load() returns a Promise, simulating cookieAdapter / apiAdapter. */
function makeAsyncAdapter<T>(initial: T | null) {
  let value: T | null = initial;
  let loadCalls = 0;
  const adapter: StorageAdapter<T> & { readonly loadCalls: () => number } = {
    load(): Promise<T | null> {
      loadCalls += 1;
      return Promise.resolve(value);
    },
    save(data: T): void | Promise<void> {
      value = data;
      return Promise.resolve();
    },
    remove(): void | Promise<void> {
      value = null;
    },
    loadCalls: () => loadCalls,
  };
  return adapter;
}

function makeActivity(overrides: Partial<ProcessingActivity> = {}): ProcessingActivity {
  return {
    id: 'act-async-1',
    name: 'Customer Onboarding (async)',
    description: 'Collecting personal data during signup',
    lawfulBasis: 'consent',
    lawfulBasisJustification: 'Explicit consent gathered via signup form.',
    dataCategories: ['name', 'email'],
    involvesSensitiveData: false,
    dataSubjectCategories: ['customers'],
    purposes: ['account creation'],
    retentionPeriod: '3 years after account closure',
    crossBorderTransfer: false,
    createdAt: NOW - 86_400_000,
    updatedAt: NOW,
    status: 'active',
    ...overrides,
  };
}

function makeTransfer(overrides: Partial<CrossBorderTransfer> = {}): CrossBorderTransfer {
  return {
    id: 'xfer-async-1',
    destinationCountry: 'United Kingdom',
    destinationCountryCode: 'GB',
    adequacyStatus: 'adequate',
    transferMechanism: 'adequacy_decision',
    dataCategories: ['name', 'email'],
    includesSensitiveData: false,
    recipientOrganization: 'Acme UK Async Ltd',
    recipientContact: {
      name: 'Jane Williams',
      email: 'jane@acme.example.com',
    },
    purpose: 'Customer order fulfilment',
    safeguards: ['TLS 1.3'],
    riskAssessment: 'Low risk — UK has adequacy.',
    riskLevel: 'low',
    tiaCompleted: true,
    frequency: 'periodic',
    startDate: NOW - 86_400_000 * 90,
    status: 'active',
    createdAt: NOW - 86_400_000 * 90,
    updatedAt: NOW,
    ...overrides,
  };
}

describe('Async adapter hydration — presets (3.10.4 fix)', () => {
  it('NDPRLawfulBasis seeds activities from an async adapter after mount', async () => {
    const adapter = makeAsyncAdapter<ProcessingActivity[]>([
      // Pre-approve so the activity name only renders once (not also in the
      // "needs DPO approval" warning list).
      makeActivity({
        dpoApproval: { approved: true, approvedBy: 'Adaeze Okafor', approvedAt: NOW },
      }),
    ]);

    render(<NDPRLawfulBasis adapter={adapter} />);

    // After hydration the activity name appears.
    await waitFor(() => {
      expect(screen.getByText(/Customer Onboarding \(async\)/i)).toBeInTheDocument();
    });
    expect(adapter.loadCalls()).toBeGreaterThanOrEqual(1);
  });

  it('NDPRCrossBorder seeds transfers from an async adapter after mount', async () => {
    const adapter = makeAsyncAdapter<CrossBorderTransfer[]>([makeTransfer()]);

    render(<NDPRCrossBorder adapter={adapter} />);

    await waitFor(() => {
      expect(screen.getByText(/Acme UK Async Ltd/i)).toBeInTheDocument();
    });
    expect(adapter.loadCalls()).toBeGreaterThanOrEqual(1);
  });

  it('NDPRLawfulBasis keeps initialActivities when adapter.load resolves null', async () => {
    const adapter = makeAsyncAdapter<ProcessingActivity[]>(null);
    const seeded = [makeActivity({ id: 'init-1', name: 'Initial activity (sync seed)' })];

    render(<NDPRLawfulBasis adapter={adapter} initialActivities={seeded} />);

    expect(screen.getAllByText(/Initial activity \(sync seed\)/i).length).toBeGreaterThan(0);
    await waitFor(() => expect(adapter.loadCalls()).toBeGreaterThanOrEqual(1));
    // After async load resolved to null, the initial seed is preserved.
    expect(screen.getAllByText(/Initial activity \(sync seed\)/i).length).toBeGreaterThan(0);
  });
});
