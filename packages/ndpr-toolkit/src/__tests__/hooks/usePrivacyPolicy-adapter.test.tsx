import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrivacyPolicy } from '../../hooks/usePrivacyPolicy';
import { memoryAdapter } from '../../adapters/memory';
import type { PolicyTemplate, PrivacyPolicy } from '../../types/privacy';

const mockTemplate: PolicyTemplate = {
  id: 'tpl-basic',
  name: 'Basic Privacy Policy',
  description: 'A basic NDPA-compliant privacy policy',
  organizationType: 'business',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      required: true,
      included: true,
      template: 'This is the introduction.',
    },
  ],
  variables: {},
  version: '1.0',
  lastUpdated: Date.now(),
  ndpaCompliant: true,
};

describe('usePrivacyPolicy with adapter', () => {
  it('accepts an adapter prop and exposes isLoading', async () => {
    const adapter = memoryAdapter<PrivacyPolicy>();
    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [mockTemplate], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.policy).toBeNull();
  });

  it('saves policy to adapter on generatePolicy', async () => {
    const adapter = memoryAdapter<PrivacyPolicy>();
    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [mockTemplate], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTemplate('tpl-basic');
      result.current.updateOrganizationInfo({
        name: 'Test Corp',
        website: 'https://example.com',
        privacyEmail: 'privacy@example.com',
      });
    });

    act(() => {
      result.current.generatePolicy();
    });

    const saved = adapter.load() as PrivacyPolicy | null;
    expect(saved).not.toBeNull();
    expect(saved!.templateId).toBe('tpl-basic');
    expect(saved!.organizationInfo.name).toBe('Test Corp');
  });

  it('clears adapter on resetPolicy', async () => {
    const adapter = memoryAdapter<PrivacyPolicy>();
    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [mockTemplate], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTemplate('tpl-basic');
      result.current.updateOrganizationInfo({
        name: 'Test Corp',
        website: 'https://example.com',
        privacyEmail: 'privacy@example.com',
      });
    });

    act(() => {
      result.current.generatePolicy();
    });

    act(() => {
      result.current.resetPolicy();
    });

    expect(adapter.load()).toBeNull();
    expect(result.current.policy).toBeNull();
  });

  it('isLoading starts true for async adapter', () => {
    const asyncAdapter = {
      load: () => new Promise<PrivacyPolicy | null>((resolve) => setTimeout(() => resolve(null), 50)),
      save: async () => {},
      remove: async () => {},
    };
    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [mockTemplate], adapter: asyncAdapter })
    );
    expect(result.current.isLoading).toBe(true);
  });

  it('backward compat with storageKey (no adapter)', async () => {
    const { result } = renderHook(() =>
      usePrivacyPolicy({
        templates: [mockTemplate],
        storageKey: 'ndpr_policy_test_compat',
        useLocalStorage: false,
      })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.policy).toBeNull();
  });

  it('isLoading is present on the return value', async () => {
    const adapter = memoryAdapter<PrivacyPolicy>();
    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [mockTemplate], adapter })
    );
    expect('isLoading' in result.current).toBe(true);
  });

  it('skips loading when initialPolicy is provided', async () => {
    const initialPolicy: PrivacyPolicy = {
      id: 'existing-policy',
      title: 'Existing Policy',
      templateId: 'tpl-basic',
      organizationInfo: {
        name: 'Existing Corp',
        website: 'https://existing.com',
        privacyEmail: 'existing@example.com',
      },
      sections: [],
      variableValues: {},
      effectiveDate: Date.now(),
      lastUpdated: Date.now(),
      version: '1.0',
    };
    const adapter = memoryAdapter<PrivacyPolicy>();
    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [mockTemplate], adapter, initialPolicy })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.policy).toEqual(initialPolicy);
  });
});
