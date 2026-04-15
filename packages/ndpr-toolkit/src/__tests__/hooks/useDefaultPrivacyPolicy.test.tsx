import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDefaultPrivacyPolicy } from '../../hooks/useDefaultPrivacyPolicy';
import { createBusinessPolicyTemplate } from '../../utils/policy-templates';

beforeEach(() => {
  localStorage.clear();
});

/**
 * Helper: renders the hook and selects the default template so that
 * selectedTemplate is populated and variable defaults are initialised.
 */
function renderAndSelect(
  options: Parameters<typeof useDefaultPrivacyPolicy>[0] = {}
) {
  const hookReturn = renderHook(() => useDefaultPrivacyPolicy(options));
  act(() => {
    hookReturn.result.current.selectTemplate('default-business');
  });
  return hookReturn;
}

describe('useDefaultPrivacyPolicy', () => {
  describe('no shared state mutation', () => {
    it('second call with different orgInfo is not affected by the first call', () => {
      const { result: result1 } = renderAndSelect({
        orgInfo: { name: 'First Corp', email: 'first@corp.com', dpoName: 'Alice' },
        useLocalStorage: false,
      });

      const { result: result2 } = renderAndSelect({
        orgInfo: { name: 'Second Corp', email: 'second@corp.com', dpoName: 'Bob' },
        useLocalStorage: false,
      });

      // The first hook's template should retain First Corp values
      const tpl1 = result1.current.selectedTemplate;
      expect(tpl1).not.toBeNull();
      expect(tpl1!.variables['orgName'].defaultValue).toBe('First Corp');
      expect(tpl1!.variables['privacyEmail'].defaultValue).toBe('first@corp.com');
      expect(tpl1!.variables['dpoName'].defaultValue).toBe('Alice');

      // The second hook's template must have Second Corp values, not First Corp
      const tpl2 = result2.current.selectedTemplate;
      expect(tpl2).not.toBeNull();
      expect(tpl2!.variables['orgName'].defaultValue).toBe('Second Corp');
      expect(tpl2!.variables['privacyEmail'].defaultValue).toBe('second@corp.com');
      expect(tpl2!.variables['dpoName'].defaultValue).toBe('Bob');

      // Cross-contamination check: first template must still have its own values
      expect(result1.current.selectedTemplate!.variables['orgName'].defaultValue).toBe(
        'First Corp'
      );
    });

    it('does not mutate the source template from createBusinessPolicyTemplate', () => {
      const before = createBusinessPolicyTemplate();
      const originalValues = before.variables.map(v => ({ name: v.name, value: v.value }));

      renderAndSelect({
        orgInfo: { name: 'Mutator Inc', email: 'mutate@test.com', dpoName: 'Trudy' },
        useLocalStorage: false,
      });

      const after = createBusinessPolicyTemplate();
      const afterValues = after.variables.map(v => ({ name: v.name, value: v.value }));

      // The shared template variables must be unchanged
      expect(afterValues).toEqual(originalValues);
    });
  });

  describe('orgInfo values are applied', () => {
    it('sets orgName, privacyEmail, and dpoName from orgInfo', () => {
      const { result } = renderAndSelect({
        orgInfo: { name: 'Test Corp', email: 'test@corp.com', dpoName: 'Jane' },
        useLocalStorage: false,
      });

      const tpl = result.current.selectedTemplate;
      expect(tpl).not.toBeNull();
      expect(tpl!.variables['orgName'].defaultValue).toBe('Test Corp');
      expect(tpl!.variables['privacyEmail'].defaultValue).toBe('test@corp.com');
      expect(tpl!.variables['dpoName'].defaultValue).toBe('Jane');
    });

    it('leaves other variables with their original defaults when orgInfo is partial', () => {
      const { result } = renderAndSelect({
        orgInfo: { name: 'Partial Corp' },
        useLocalStorage: false,
      });

      const tpl = result.current.selectedTemplate;
      expect(tpl).not.toBeNull();
      expect(tpl!.variables['orgName'].defaultValue).toBe('Partial Corp');
      // privacyEmail and dpoName were not provided so they should not have overridden values
      expect(tpl!.variables['privacyEmail'].defaultValue).toBeFalsy();
      expect(tpl!.variables['dpoName'].defaultValue).toBeFalsy();
    });
  });

  describe('empty orgInfo', () => {
    it('returns a valid template with default variable values when orgInfo is empty', () => {
      const { result } = renderAndSelect({
        orgInfo: {},
        useLocalStorage: false,
      });

      const tpl = result.current.selectedTemplate;
      expect(tpl).not.toBeNull();
      expect(tpl!.id).toBe('default-business');

      // All variables should exist even with empty orgInfo
      const baseTemplate = createBusinessPolicyTemplate();
      for (const v of baseTemplate.variables) {
        expect(tpl!.variables[v.name]).toBeDefined();
        expect(tpl!.variables[v.name].name).toBe(v.name);
      }

      // No orgInfo overrides means defaults come from the base template (empty strings -> falsy)
      expect(tpl!.variables['orgName'].defaultValue).toBeFalsy();
      expect(tpl!.variables['privacyEmail'].defaultValue).toBeFalsy();
      expect(tpl!.variables['dpoName'].defaultValue).toBeFalsy();
    });

    it('returns a working hook when no options are provided at all', () => {
      const { result } = renderHook(() => useDefaultPrivacyPolicy());

      // selectTemplate should succeed
      let selected: boolean = false;
      act(() => {
        selected = result.current.selectTemplate('default-business');
      });
      expect(selected).toBe(true);

      const tpl = result.current.selectedTemplate;
      expect(tpl).not.toBeNull();
      expect(tpl!.sections.length).toBeGreaterThan(0);
    });
  });

  describe('return value shape', () => {
    it('returns all expected fields from usePrivacyPolicy', async () => {
      const { result } = renderHook(() =>
        useDefaultPrivacyPolicy({
          orgInfo: { name: 'Shape Corp' },
          useLocalStorage: false,
        })
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Core state
      expect(result.current).toHaveProperty('policy');
      expect(result.current).toHaveProperty('selectedTemplate');
      expect(result.current).toHaveProperty('organizationInfo');

      // Action functions
      expect(typeof result.current.selectTemplate).toBe('function');
      expect(typeof result.current.updateOrganizationInfo).toBe('function');
      expect(typeof result.current.toggleSection).toBe('function');
      expect(typeof result.current.updateSectionContent).toBe('function');
      expect(typeof result.current.updateVariableValue).toBe('function');
      expect(typeof result.current.generatePolicy).toBe('function');
      expect(typeof result.current.getPolicyText).toBe('function');
      expect(typeof result.current.resetPolicy).toBe('function');
      expect(typeof result.current.isValid).toBe('function');

      // Loading flag
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('provides a template with correct metadata after selection', () => {
      const { result } = renderAndSelect({ useLocalStorage: false });

      const tpl = result.current.selectedTemplate;
      expect(tpl).not.toBeNull();
      expect(tpl!.id).toBe('default-business');
      expect(tpl!.name).toBe('Default Business Policy');
      expect(tpl!.organizationType).toBe('business');
      expect(tpl!.ndpaCompliant).toBe(true);
      expect(tpl!.version).toBe('1.0');
      expect(tpl!.sections.length).toBeGreaterThan(0);
      expect(Object.keys(tpl!.variables).length).toBeGreaterThan(0);
    });
  });
});
