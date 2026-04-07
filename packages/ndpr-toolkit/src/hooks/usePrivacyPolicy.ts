import { useState, useEffect } from 'react';
import { PolicySection, PolicyTemplate, OrganizationInfo, PrivacyPolicy } from '../types/privacy';
import { generatePolicyText } from '../utils/privacy';

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
   * Storage key for policy data
   * @default "ndpr_privacy_policy"
   */
  storageKey?: string;
  
  /**
   * Whether to use local storage to persist policy data
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
  generatePolicy: () => PrivacyPolicy;
  
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
}

/**
 * Hook for generating NDPA-compliant privacy policies
 */
export function usePrivacyPolicy({
  templates,
  initialPolicy,
  storageKey = "ndpr_privacy_policy",
  useLocalStorage = true,
  onGenerate
}: UsePrivacyPolicyOptions): UsePrivacyPolicyReturn {
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
    industry: ''
  });
  
  // Load policy data from storage on mount
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined' && !initialPolicy) {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const { policy, template, organizationInfo } = JSON.parse(savedData);
          
          if (policy) {
            setPolicy(policy);
          }
          
          if (template) {
            const foundTemplate = templates.find(t => t.id === template.id);
            if (foundTemplate) {
              setSelectedTemplate(foundTemplate);
            }
          }
          
          if (organizationInfo) {
            setOrganizationInfo(organizationInfo);
          }
        }
      } catch (error) {
        console.error('Error loading privacy policy data:', error);
      }
    }
  }, [storageKey, useLocalStorage, initialPolicy, templates]);
  
  // Save policy data to storage when it changes
  useEffect(() => {
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          policy,
          template: selectedTemplate,
          organizationInfo
        }));
      } catch (error) {
        console.error('Error saving privacy policy data:', error);
      }
    }
  }, [policy, selectedTemplate, organizationInfo, storageKey, useLocalStorage]);
  
  // Select a template
  const selectTemplate = (templateId: string): boolean => {
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
    
    return true;
  };
  
  // Update organization information
  const updateOrganizationInfo = (updates: Partial<OrganizationInfo>) => {
    setOrganizationInfo(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Toggle whether a section is included in the policy
  const toggleSection = (sectionId: string, included: boolean) => {
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
  };
  
  // Update section content
  const updateSectionContent = (sectionId: string, content: string) => {
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
  };
  
  // Update variable values
  const updateVariableValue = (variable: string, value: string) => {
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
  };
  
  // Generate a unique ID
  const generateId = (): string => {
    return 'policy_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };
  
  // Generate the policy
  const generatePolicy = (): PrivacyPolicy => {
    if (!selectedTemplate) {
      throw new Error('No template selected');
    }
    
    const now = Date.now();
    
    const newPolicy: PrivacyPolicy = {
      id: policy?.id || generateId(),
      title: `Privacy Policy for ${organizationInfo.name}`,
      templateId: selectedTemplate.id,
      organizationInfo,
      sections: selectedTemplate.sections.map(section => ({
        ...section,
        customContent: policy?.sections.find(s => s.id === section.id)?.customContent
      })),
      variableValues: policy?.variableValues || {},
      effectiveDate: now,
      lastUpdated: now,
      version: '1.0'
    };
    
    setPolicy(newPolicy);
    
    if (onGenerate) {
      onGenerate(newPolicy);
    }
    
    return newPolicy;
  };
  
  // Get the generated policy text
  const getPolicyText = () => {
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
  };
  
  // Reset the policy
  const resetPolicy = () => {
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
      industry: ''
    });
    
    if (useLocalStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };
  
  // Check if the policy is valid
  const isValid = () => {
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
  };
  
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
    isValid
  };
}
