import { PolicyTemplate, OrganizationInfo, PrivacyPolicy } from '../types/privacy';
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
interface UsePrivacyPolicyReturn {
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
export declare function usePrivacyPolicy({ templates, initialPolicy, storageKey, useLocalStorage, onGenerate }: UsePrivacyPolicyOptions): UsePrivacyPolicyReturn;
export {};
