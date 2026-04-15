import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrivacyPolicy } from '../../hooks/usePrivacyPolicy';
import { memoryAdapter } from '../../adapters/memory';
import type { PolicyTemplate, PrivacyPolicy } from '../../types/privacy';

const makeTemplate = (overrides?: Partial<PolicyTemplate>): PolicyTemplate => ({
  id: 'tpl-test',
  name: 'Test Privacy Policy',
  description: 'A test NDPA-compliant privacy policy',
  organizationType: 'business',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      required: true,
      included: true,
      template: 'Welcome to {{orgName}}. We respect your privacy.',
    },
    {
      id: 'data-collection',
      title: 'Data Collection',
      required: false,
      included: true,
      template: 'We collect data as described by {{dataTypes}}.',
    },
  ],
  variables: {
    orgName: {
      name: 'Organization Name',
      description: 'The name of the organization',
      required: true,
      defaultValue: 'Acme Inc',
    },
    dataTypes: {
      name: 'Data Types',
      description: 'Types of data collected',
      required: false,
      defaultValue: 'personal information',
    },
    retentionPeriod: {
      name: 'Retention Period',
      description: 'How long data is retained',
      required: false,
      // no defaultValue on purpose
    },
  },
  version: '1.0',
  lastUpdated: Date.now(),
  ndpaCompliant: true,
  ...overrides,
});

describe('usePrivacyPolicy - selectTemplate stores state', () => {
  it('policy is not null after selectTemplate is called', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Before selecting a template, policy should be null
    expect(result.current.policy).toBeNull();

    act(() => {
      result.current.selectTemplate('tpl-test');
    });

    // After selecting a template, policy must not be null
    expect(result.current.policy).not.toBeNull();
  });

  it('policy contains the template variable default values after selectTemplate', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTemplate('tpl-test');
    });

    const policy = result.current.policy!;
    expect(policy.variableValues).toBeDefined();
    expect(policy.variableValues.orgName).toBe('Acme Inc');
    expect(policy.variableValues.dataTypes).toBe('personal information');
    // Variable without defaultValue should be empty string
    expect(policy.variableValues.retentionPeriod).toBe('');
  });

  it('policy contains the template sections after selectTemplate', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTemplate('tpl-test');
    });

    const policy = result.current.policy!;
    expect(policy.sections).toHaveLength(2);
    expect(policy.sections[0].id).toBe('introduction');
    expect(policy.sections[1].id).toBe('data-collection');
    expect(policy.templateId).toBe('tpl-test');
  });

  it('selectTemplate returns false for unknown template and policy stays null', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let returnValue: boolean | undefined;
    act(() => {
      returnValue = result.current.selectTemplate('nonexistent');
    });

    expect(returnValue).toBe(false);
    expect(result.current.policy).toBeNull();
  });
});

describe('usePrivacyPolicy - updateVariableValue works after selectTemplate', () => {
  it('updates a variable value in the policy after selectTemplate', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTemplate('tpl-test');
    });

    // The default value is 'Acme Inc'
    expect(result.current.policy!.variableValues.orgName).toBe('Acme Inc');

    act(() => {
      result.current.updateVariableValue('orgName', 'Test Corp');
    });

    expect(result.current.policy!.variableValues.orgName).toBe('Test Corp');
  });

  it('can update multiple variables sequentially after selectTemplate', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectTemplate('tpl-test');
    });

    act(() => {
      result.current.updateVariableValue('orgName', 'Test Corp');
    });

    act(() => {
      result.current.updateVariableValue('dataTypes', 'email and phone');
    });

    act(() => {
      result.current.updateVariableValue('retentionPeriod', '2 years');
    });

    const vars = result.current.policy!.variableValues;
    expect(vars.orgName).toBe('Test Corp');
    expect(vars.dataTypes).toBe('email and phone');
    expect(vars.retentionPeriod).toBe('2 years');
  });

  it('updateVariableValue is a no-op when policy is null (no template selected)', async () => {
    const template = makeTemplate();
    const adapter = memoryAdapter<PrivacyPolicy>();

    const { result } = renderHook(() =>
      usePrivacyPolicy({ templates: [template], adapter })
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Policy is null before selectTemplate
    expect(result.current.policy).toBeNull();

    act(() => {
      result.current.updateVariableValue('orgName', 'Test Corp');
    });

    // Policy should still be null -- the call was a no-op
    expect(result.current.policy).toBeNull();
  });
});

describe('usePrivacyPolicy - templates ref stability', () => {
  it('adapter load is called only once even when templates array is recreated each render', async () => {
    const loadFn = jest.fn().mockReturnValue(null);
    const adapter = {
      load: loadFn,
      save: jest.fn(),
      remove: jest.fn(),
    };

    // Render with an inline templates array (new reference every render)
    const { rerender } = renderHook(
      ({ templates }) => usePrivacyPolicy({ templates, adapter }),
      {
        initialProps: {
          templates: [makeTemplate()],
        },
      }
    );

    await waitFor(() => expect(loadFn).toHaveBeenCalled());

    // The load function should have been called exactly once after mount
    const callCountAfterMount = loadFn.mock.calls.length;
    expect(callCountAfterMount).toBe(1);

    // Rerender multiple times with new template array references
    rerender({ templates: [makeTemplate()] });
    rerender({ templates: [makeTemplate()] });
    rerender({ templates: [makeTemplate()] });

    // load should not have been called again -- templates is tracked via useRef
    expect(loadFn).toHaveBeenCalledTimes(callCountAfterMount);
  });

  it('the hook still accesses latest templates via ref after rerender', async () => {
    const adapter = memoryAdapter<PrivacyPolicy>();
    const template1 = makeTemplate({ id: 'tpl-v1', name: 'V1' });
    const template2 = makeTemplate({ id: 'tpl-v2', name: 'V2' });

    const { result, rerender } = renderHook(
      ({ templates }) => usePrivacyPolicy({ templates, adapter }),
      {
        initialProps: {
          templates: [template1],
        },
      }
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Rerender with a new template
    rerender({ templates: [template1, template2] });

    // selectTemplate should find the new template via the ref
    let success: boolean | undefined;
    act(() => {
      success = result.current.selectTemplate('tpl-v2');
    });

    expect(success).toBe(true);
    expect(result.current.selectedTemplate).not.toBeNull();
    expect(result.current.selectedTemplate!.id).toBe('tpl-v2');
  });
});
