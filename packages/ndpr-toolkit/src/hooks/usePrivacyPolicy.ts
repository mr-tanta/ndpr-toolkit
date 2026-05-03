import { useState, useEffect, useRef, useCallback } from 'react';
import { PolicySection, PolicyTemplate, OrganizationInfo, PrivacyPolicy } from '../types/privacy';
import { generatePolicyText } from '../utils/privacy';
import type { StorageAdapter } from '../adapters/types';
import { localStorageAdapter } from '../adapters/local-storage';

function resolveAdapter(storageKey: string, useLocalStorage: boolean): StorageAdapter<PrivacyPolicy> {
  if (!useLocalStorage) {
    return { load: () => null, save: () => {}, remove: () => {} };
  }
  return localStorageAdapter<PrivacyPolicy>(storageKey);
}

interface UsePrivacyPolicyOptions {
  /**
   * Available policy templates
   */
  templates: PolicyTemplate[];

  /**
   * Initial policy data (if editing an existing policy)
   */
  initialPolicy?: PrivacyPolicy;

  /**
   * Pluggable storage adapter. When provided, takes precedence over storageKey/useLocalStorage.
   */
  adapter?: StorageAdapter<PrivacyPolicy>;

  /**
   * Storage key for policy data
   * @default "ndpr_privacy_policy"
   * @deprecated Use adapter instead
   */
  storageKey?: string;

  /**
   * Whether to persist policy data in storage. When `false`, the hook
   * uses an in-memory no-op adapter and nothing survives a page reload.
   * Prefer `adapter` for richer control (custom backends, async APIs).
   *
   * @default true
   */
  persist?: boolean;

  /**
   * @deprecated Renamed to `persist` in v3.5.0 — `useLocalStorage` is
   * still accepted for backward compatibility and will be removed in
   * v4.0. Use `persist` (or pass an explicit `adapter`) instead.
   * @default true
   */
  useLocalStorage?: boolean;

  /**
   * Callback function called when a policy is generated
   */
  onGenerate?: (policy: PrivacyPolicy) => void;
}

export interface UsePrivacyPolicyReturn {
  /**
   * Current policy data
   */
  policy: PrivacyPolicy | null;
  
  /**
   * Selected template
   */
  selectedTemplate: PolicyTemplate | null;
  
  /**
   * Organization information
   */
  organizationInfo: OrganizationInfo;
  
  /**
   * Select a template
   */
  selectTemplate: (templateId: string) => boolean;
  
  /**
   * Update organization information
   */
  updateOrganizationInfo: (updates: Partial<OrganizationInfo>) => void;
  
  /**
   * Toggle whether a section is included in the policy
   */
  toggleSection: (sectionId: string, included: boolean) => void;
  
  /**
   * Update section content
   */
  updateSectionContent: (sectionId: string, content: string) => void;
  
  /**
   * Update variable values
   */
  updateVariableValue: (variable: string, value: string) => void;
  
  /**
   * Generate the policy
   */
  generatePolicy: () => PrivacyPolicy | null;
  
  /**
   * Get the generated policy text
   */
  getPolicyText: () => {
    fullText: string;
    sectionTexts: Record<string, string>;
    missingVariables: string[];
  };
  
  /**
   * Reset the policy
   */
  resetPolicy: () => void;
  
  /**
   * Check if the policy is valid
   */
  isValid: () => {
    valid: boolean;
    errors: string[];
  };

  /**
   * Whether the adapter is still loading data (relevant for async adapters)
   */
  isLoading: boolean;
}

/**
 * Hook for generating NDPA-compliant privacy policies
 */
export function usePrivacyPolicy({
  templates,
  initialPolicy,
  adapter,
  storageKey = 'ndpr_privacy_policy',
  persist,
  useLocalStorage,
  onGenerate,
}: UsePrivacyPolicyOptions): UsePrivacyPolicyReturn {
  // v3.5.0: `persist` is the new canonical name; `useLocalStorage` is the
  // deprecated alias kept for backward compatibility. If a consumer passes
  // either explicitly, honor it; otherwise default to true (persist).
  const persistResolved = persist ?? useLocalStorage ?? true;
  const resolvedAdapter = adapter ?? resolveAdapter(storageKey, persistResolved);
  const adapterRef = useRef(resolvedAdapter);
  adapterRef.current = resolvedAdapter;

  const [policy, setPolicy] = useState<PrivacyPolicy | null>(initialPolicy || null);
  const [selectedTemplate, setSelectedTemplate] = useState<PolicyTemplate | null>(null);
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationInfo>({
    name: '',
    website: '',
    privacyEmail: '',
    address: '',
    privacyPhone: '',
    dpoName: '',
    dpoEmail: '',
    industry: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const templatesRef = useRef(templates);
  templatesRef.current = templates;

  // Load policy data from storage on mount (skip if initialPolicy provided)
  useEffect(() => {
    if (initialPolicy) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    try {
      const result = adapterRef.current.load();

      const applyLoaded = (loaded: PrivacyPolicy | null) => {
        if (loaded) {
          setPolicy(loaded);
          // Restore template selection from loaded policy
          if (loaded.templateId) {
            const foundTemplate = templatesRef.current.find(t => t.id === loaded.templateId);
            if (foundTemplate) setSelectedTemplate(foundTemplate);
          }
          if (loaded.organizationInfo) {
            setOrganizationInfo(loaded.organizationInfo);
          }
        }
        setIsLoading(false);
      };

      if (result instanceof Promise) {
        result.then(
          (loaded) => {
            if (!cancelled) applyLoaded(loaded);
          },
          () => {
            if (!cancelled) setIsLoading(false);
          }
        );
      } else {
        applyLoaded(result);
      }
    } catch {
      if (!cancelled) setIsLoading(false);
    }

    return () => { cancelled = true; };
  }, [initialPolicy]);

  // Persist policy to adapter (fire-and-forget)
  const persistPolicy = (nextPolicy: PrivacyPolicy) => {
    Promise.resolve(adapterRef.current.save(nextPolicy)).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to save policy:', err);
    });
  };
  
  // Select a template
  const selectTemplate = useCallback((templateId: string): boolean => {
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return false;
    }

    setSelectedTemplate(template);

    // Initialize sections from the template
    const sections = template.sections.map(section => ({
      ...section,
      customContent: undefined
    }));

    // Initialize variable values
    const variableValues: Record<string, string> = {};
    Object.keys(template.variables).forEach(variable => {
      variableValues[variable] = template.variables[variable].defaultValue || '';
    });

    // Store the initialized sections and variable values in policy state
    const now = Date.now();
    setPolicy({
      id: 'policy_' + now + '_' + Math.random().toString(36).substr(2, 9),
      title: '',
      templateId: template.id,
      organizationInfo,
      sections,
      variableValues,
      effectiveDate: now,
      lastUpdated: now,
      version: '1.0',
    });

    return true;
  }, [templates, organizationInfo]);
  
  // Update organization information
  const updateOrganizationInfo = useCallback((updates: Partial<OrganizationInfo>) => {
    setOrganizationInfo(prev => ({
      ...prev,
      ...updates
    }));
  }, []);
  
  // Toggle whether a section is included in the policy
  const toggleSection = useCallback((sectionId: string, included: boolean) => {
    if (!selectedTemplate) {
      return;
    }

    if (policy) {
      setPolicy(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? { ...section, included } : section
          )
        };
      });
    } else {
      // If no policy exists yet, update the template sections
      setSelectedTemplate(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? { ...section, included } : section
          )
        };
      });
    }
  }, [selectedTemplate, policy]);
  
  // Update section content
  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    if (!selectedTemplate) {
      return;
    }

    if (policy) {
      setPolicy(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? { ...section, customContent: content } : section
          )
        };
      });
    } else {
      // If no policy exists yet, update the template sections
      setSelectedTemplate(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId ? { ...section, customContent: content } : section
          )
        };
      });
    }
  }, [selectedTemplate, policy]);
  
  // Update variable values
  const updateVariableValue = useCallback((variable: string, value: string) => {
    if (!policy) {
      return;
    }

    setPolicy(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        variableValues: {
          ...prev.variableValues,
          [variable]: value
        }
      };
    });
  }, [policy]);
  
  // Generate a unique ID
  const generateId = (): string => {
    return 'policy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };
  
  // Generate the policy
  const generatePolicy = useCallback((): PrivacyPolicy | null => {
    if (!selectedTemplate) {
      return null;
    }

    const now = Date.now();

    const newPolicy: PrivacyPolicy = {
      id: policy?.id || generateId(),
      title: `Privacy Policy for ${organizationInfo.name}`,
      templateId: selectedTemplate.id,
      organizationInfo,
      sections: selectedTemplate.sections.map(section => ({
        ...section,
        customContent: policy?.sections.find(s => s.id === section.id)?.customContent,
      })),
      variableValues: policy?.variableValues || {},
      effectiveDate: now,
      lastUpdated: now,
      version: '1.0',
    };

    setPolicy(newPolicy);
    persistPolicy(newPolicy);

    if (onGenerate) {
      onGenerate(newPolicy);
    }

    return newPolicy;
  }, [selectedTemplate, policy, organizationInfo, onGenerate]);
  
  // Get the generated policy text
  const getPolicyText = useCallback(() => {
    if (!policy) {
      return {
        fullText: '',
        sectionTexts: {},
        missingVariables: []
      };
    }

    const result = generatePolicyText(policy.sections, policy.organizationInfo);

    // Handle both string and object return types from generatePolicyText
    if (typeof result === 'string') {
      return {
        fullText: result,
        sectionTexts: { 'full': result },
        missingVariables: []
      };
    }

    return result;
  }, [policy]);
  
  // Reset the policy
  const resetPolicy = useCallback(() => {
    setPolicy(null);
    setSelectedTemplate(null);
    setOrganizationInfo({
      name: '',
      website: '',
      privacyEmail: '',
      address: '',
      privacyPhone: '',
      dpoName: '',
      dpoEmail: '',
      industry: '',
    });
    Promise.resolve(adapterRef.current.remove()).catch((err) => {
      console.warn('[ndpr-toolkit] Failed to remove policy:', err);
    });
  }, []);
  
  // Check if the policy is valid
  const isValid = useCallback(() => {
    const errors: string[] = [];

    if (!selectedTemplate) {
      errors.push('No template selected');
    }

    if (!organizationInfo.name) {
      errors.push('Organization name is required');
    }

    if (!organizationInfo.website) {
      errors.push('Organization website is required');
    }

    if (!organizationInfo.privacyEmail) {
      errors.push('Privacy contact email is required');
    }

    // Check if all required sections are included
    if (selectedTemplate) {
      const requiredSections = selectedTemplate.sections.filter(section => section.required);
      const includedSections = policy?.sections.filter(section => section.included) || [];

      requiredSections.forEach(section => {
        if (!includedSections.some(s => s.id === section.id)) {
          errors.push(`Required section "${section.title}" must be included`);
        }
      });
    }

    // Check if all required variables have values
    if (selectedTemplate && policy) {
      Object.entries(selectedTemplate.variables).forEach(([variable, info]) => {
        if (info.required && !policy.variableValues[variable]) {
          errors.push(`Required variable "${info.name}" must have a value`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, [selectedTemplate, organizationInfo, policy]);
  
  return {
    policy,
    selectedTemplate,
    organizationInfo,
    selectTemplate,
    updateOrganizationInfo,
    toggleSection,
    updateSectionContent,
    updateVariableValue,
    generatePolicy,
    getPolicyText,
    resetPolicy,
    isValid,
    isLoading,
  };
}
