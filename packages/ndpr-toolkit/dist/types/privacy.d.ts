/**
 * Privacy policy types aligned with NDPA 2023
 * Privacy policies must clearly inform data subjects of their rights under the NDPA
 */
/**
 * Represents a section in a privacy policy
 */
export interface PolicySection {
    /** Unique identifier for the section */
    id: string;
    /** Title of the section */
    title: string;
    /** Description of the section */
    description?: string;
    /** Order of the section in the policy */
    order?: number;
    /** Whether the section is required by NDPA */
    required: boolean;
    /** Template text for the section */
    template: string;
    /**
     * Default content for the section (legacy field)
     * @deprecated Use template instead
     */
    defaultContent?: string;
    /**
     * Custom content for the section (overrides default content)
     * @deprecated Use template instead
     */
    customContent?: string;
    /** Whether the section is included in the policy */
    included: boolean;
    /** Variables that can be used in the section content */
    variables?: string[];
}
/**
 * Represents a privacy policy template
 */
export interface PolicyTemplate {
    /** Unique identifier for the template */
    id: string;
    /** Name of the template */
    name: string;
    /** Description of the template */
    description: string;
    /** Type of organization the template is designed for */
    organizationType: 'business' | 'nonprofit' | 'government' | 'educational';
    /** Sections included in the template */
    sections: PolicySection[];
    /** Variables used across the template */
    variables: Record<string, {
        name: string;
        description: string;
        required: boolean;
        defaultValue?: string;
    }>;
    /** Version of the template */
    version: string;
    /** Last updated date of the template */
    lastUpdated: number;
    /**
     * Whether this template is NDPA 2023 compliant
     */
    ndpaCompliant: boolean;
}
/**
 * Represents organization information for a privacy policy
 */
export interface OrganizationInfo {
    /** Name of the organization */
    name: string;
    /** Website URL of the organization */
    website: string;
    /** Contact email for privacy inquiries */
    privacyEmail: string;
    /** Physical address of the organization */
    address?: string;
    /** Phone number for privacy inquiries */
    privacyPhone?: string;
    /** Name of the Data Protection Officer */
    dpoName?: string;
    /** Email of the Data Protection Officer */
    dpoEmail?: string;
    /** Industry or sector of the organization */
    industry?: string;
    /** NDPC registration number (if registered) */
    ndpcRegistrationNumber?: string;
}
/**
 * Represents a variable in a privacy policy
 */
export interface PolicyVariable {
    /** Unique identifier for the variable */
    id: string;
    /** Name of the variable as it appears in the template */
    name: string;
    /** Description of the variable */
    description: string;
    /** Default value for the variable */
    defaultValue?: string;
    /** Current value of the variable */
    value: string;
    /** Type of input for the variable */
    inputType: 'text' | 'textarea' | 'email' | 'url' | 'date' | 'select';
    /** Options for select inputs */
    options?: string[];
    /** Whether the variable is required */
    required: boolean;
}
/**
 * Represents a generated privacy policy
 */
export interface PrivacyPolicy {
    /** Unique identifier for the policy */
    id: string;
    /** Title of the policy */
    title: string;
    /** Template used to generate the policy */
    templateId: string;
    /** Organization information */
    organizationInfo: OrganizationInfo;
    /** Sections of the policy */
    sections: PolicySection[];
    /** Values for the variables used in the policy */
    variableValues: Record<string, string>;
    /** Effective date of the policy */
    effectiveDate: number;
    /** Last updated date of the policy */
    lastUpdated: number;
    /** Version of the policy */
    version: string;
    /**
     * Applicable legal frameworks
     */
    applicableFrameworks?: ('ndpa' | 'ndpr' | 'gdpr' | 'ccpa')[];
}
