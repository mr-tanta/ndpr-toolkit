/**
 * Policy engine types for the adaptive privacy policy generator.
 * These types power the wizard-driven policy builder, compliance checker,
 * and export functionality — all aligned with the NDPA 2023.
 */

import type { OrganizationInfo, PolicySection, PrivacyPolicy } from './privacy';

// ---------------------------------------------------------------------------
// Enums & unions
// ---------------------------------------------------------------------------

/** Industry verticals with sector-specific compliance requirements. */
export type Industry =
  | 'fintech'
  | 'healthcare'
  | 'ecommerce'
  | 'saas'
  | 'education'
  | 'government'
  | 'other';

/** Organisation size tiers — affects complexity of generated language. */
export type OrgSize = 'startup' | 'midsize' | 'enterprise';

/** Lawful processing purposes recognised under the NDPA. */
export type ProcessingPurpose =
  | 'service_delivery'
  | 'marketing'
  | 'analytics'
  | 'research'
  | 'legal_compliance'
  | 'fraud_prevention';

// ---------------------------------------------------------------------------
// Data modelling
// ---------------------------------------------------------------------------

/** A logical category of personal data the organisation may collect. */
export interface DataCategory {
  /** Machine-readable identifier. */
  id: string;
  /** Human-readable label shown in the wizard. */
  label: string;
  /** Grouping for display and compliance checks. */
  group: 'identity' | 'financial' | 'behavioral' | 'sensitive' | 'children';
  /** Specific data points within this category. */
  dataPoints: string[];
  /** Whether this category is currently selected by the user. */
  selected: boolean;
}

/** A third-party entity that processes data on behalf of the organisation. */
export interface ThirdPartyProcessor {
  /** Name of the third party. */
  name: string;
  /** Purpose of sharing data with this processor. */
  purpose: string;
  /** Country where the processor is located. */
  country: string;
}

// ---------------------------------------------------------------------------
// Template context — the "input" to section generators
// ---------------------------------------------------------------------------

/** Full context used to generate an adaptive privacy policy. */
export interface TemplateContext {
  /** Organisation details, extended with industry and size. */
  org: OrganizationInfo & {
    industry: Industry;
    orgSize: OrgSize;
    country: string;
  };
  /** Data categories the organisation collects. */
  dataCategories: DataCategory[];
  /** Processing purposes relevant to the organisation. */
  purposes: ProcessingPurpose[];
  /** Whether the organisation processes children's data. */
  hasChildrenData: boolean;
  /** Whether the organisation processes sensitive/special-category data. */
  hasSensitiveData: boolean;
  /** Whether the organisation processes financial data. */
  hasFinancialData: boolean;
  /** Whether data is transferred outside Nigeria. */
  hasCrossBorderTransfer: boolean;
  /** Whether automated decision-making or profiling is used. */
  hasAutomatedDecisions: boolean;
  /** Third-party processors that receive personal data. */
  thirdPartyProcessors: ThirdPartyProcessor[];
}

// ---------------------------------------------------------------------------
// Policy draft — persisted wizard state
// ---------------------------------------------------------------------------

/** A user-defined section added to the policy outside the generated ones. */
export interface CustomSection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: false;
}

/** Represents an in-progress policy being built in the wizard. */
export interface PolicyDraft {
  /** Unique identifier for the draft. */
  id: string;
  /** The template context driving section generation. */
  templateContext: TemplateContext;
  /** Custom sections added by the user. */
  customSections: CustomSection[];
  /** Per-section content overrides keyed by section id. */
  sectionOverrides: Record<string, string>;
  /** Ordered list of section ids defining the final order. */
  sectionOrder: string[];
  /** Current wizard step (0-indexed). */
  currentStep: number;
  /** Timestamp of the last save. */
  lastSavedAt: number;
  /** The draft is always in "draft" status until finalised. */
  status: 'draft';
}

// ---------------------------------------------------------------------------
// Compliance checking
// ---------------------------------------------------------------------------

/** A single gap found during NDPA compliance evaluation. */
export interface ComplianceGap {
  /** Machine-readable requirement identifier. */
  requirementId: string;
  /** Human-readable name of the requirement. */
  requirement: string;
  /** Reference to the relevant NDPA section. */
  ndpaSection: string;
  /** How severe the gap is. */
  severity: 'critical' | 'important' | 'recommended';
  /** Explanation of what is missing. */
  message: string;
  /** Suggested fix type for the UI. */
  fixType: 'add_section' | 'add_content' | 'fill_field';
  /** Label for the fix action button. */
  fixLabel: string;
  /** Pre-written content the user can insert to close the gap. */
  suggestedContent?: string;
}

/** Result of evaluating a policy against NDPA requirements. */
export interface ComplianceResult {
  /** Points earned. */
  score: number;
  /** Maximum achievable points (115). */
  maxScore: number;
  /** Percentage score (0-100). */
  percentage: number;
  /** Overall compliance rating. */
  rating: 'compliant' | 'nearly_compliant' | 'not_compliant';
  /** List of identified compliance gaps. */
  gaps: ComplianceGap[];
  /** List of requirement ids that passed. */
  passed: string[];
}

// ---------------------------------------------------------------------------
// Export options
// ---------------------------------------------------------------------------

/** Options for PDF export of the finalised policy. */
export interface PDFExportOptions {
  includeCoverPage?: boolean;
  includeTOC?: boolean;
  includeComplianceBadge?: boolean;
  logoUrl?: string;
  filename?: string;
}

/** Options for DOCX export of the finalised policy. */
export interface DOCXExportOptions {
  includeTOC?: boolean;
  filename?: string;
}

/** Options for HTML export of the finalised policy. */
export interface HTMLExportOptions {
  includeStyles?: boolean;
  includePrintCSS?: boolean;
  customCSS?: string;
  /**
   * Theme controlling the embedded design tokens.
   *
   * - `'light'` (default): emits the light token palette only. No
   *   `prefers-color-scheme: dark` block is included, so a visitor's OS
   *   dark-mode setting will NOT recolour the policy. This is the right
   *   default for an embedded compliance widget — most consumer host sites
   *   are single-theme and Shadow DOM does not isolate `prefers-color-scheme`.
   * - `'dark'`: emits the dark token palette as the primary style.
   * - `'auto'`: emits light tokens plus a `@media (prefers-color-scheme: dark)`
   *   block that swaps to dark on the user's OS preference. Use this when
   *   your host site genuinely follows OS dark mode and you want the policy
   *   to match.
   *
   * Pre-3.4.1 the export effectively behaved like `'auto'` unconditionally,
   * which leaked dark colours into light-only host sites via Shadow DOM.
   *
   * @default 'light'
   */
  theme?: 'light' | 'dark' | 'auto';
}

// ---------------------------------------------------------------------------
// Default data categories
// ---------------------------------------------------------------------------

/**
 * Comprehensive set of 16 data categories spanning identity, financial,
 * behavioral, sensitive, and children groups. Used to populate the wizard
 * and drive adaptive section generation.
 */
export const DEFAULT_DATA_CATEGORIES: DataCategory[] = [
  // ── Identity ──
  {
    id: 'full-name',
    label: 'Full Name',
    group: 'identity',
    dataPoints: ['first name', 'last name', 'middle name', 'title'],
    selected: false,
  },
  {
    id: 'contact-details',
    label: 'Contact Details',
    group: 'identity',
    dataPoints: ['email address', 'phone number', 'postal address'],
    selected: false,
  },
  {
    id: 'government-ids',
    label: 'Government-Issued Identifiers',
    group: 'identity',
    dataPoints: ['NIN', 'passport number', 'driver\'s licence number', 'voter\'s card number'],
    selected: false,
  },
  {
    id: 'account-credentials',
    label: 'Account Credentials',
    group: 'identity',
    dataPoints: ['username', 'hashed password', 'security questions'],
    selected: false,
  },
  // ── Financial ──
  {
    id: 'payment-info',
    label: 'Payment Information',
    group: 'financial',
    dataPoints: ['credit/debit card number', 'bank account number', 'billing address'],
    selected: false,
  },
  {
    id: 'financial-records',
    label: 'Financial Records',
    group: 'financial',
    dataPoints: ['transaction history', 'account balance', 'income details'],
    selected: false,
  },
  {
    id: 'bvn',
    label: 'Bank Verification Number (BVN)',
    group: 'financial',
    dataPoints: ['BVN'],
    selected: false,
  },
  // ── Behavioral ──
  {
    id: 'device-info',
    label: 'Device & Browser Information',
    group: 'behavioral',
    dataPoints: ['IP address', 'browser type', 'operating system', 'device identifiers'],
    selected: false,
  },
  {
    id: 'usage-data',
    label: 'Usage & Analytics Data',
    group: 'behavioral',
    dataPoints: ['pages visited', 'click patterns', 'session duration', 'referral source'],
    selected: false,
  },
  {
    id: 'location-data',
    label: 'Location Data',
    group: 'behavioral',
    dataPoints: ['GPS coordinates', 'city', 'country', 'timezone'],
    selected: false,
  },
  {
    id: 'cookies',
    label: 'Cookies & Tracking Technologies',
    group: 'behavioral',
    dataPoints: ['cookie identifiers', 'pixel tags', 'local storage data'],
    selected: false,
  },
  // ── Sensitive ──
  {
    id: 'health-data',
    label: 'Health & Medical Data',
    group: 'sensitive',
    dataPoints: ['medical history', 'prescriptions', 'health insurance details', 'disability status'],
    selected: false,
  },
  {
    id: 'biometric-data',
    label: 'Biometric Data',
    group: 'sensitive',
    dataPoints: ['fingerprints', 'facial recognition data', 'voiceprints'],
    selected: false,
  },
  {
    id: 'ethnic-religious',
    label: 'Ethnic Origin & Religious Beliefs',
    group: 'sensitive',
    dataPoints: ['ethnic origin', 'religious affiliation', 'political opinions'],
    selected: false,
  },
  // ── Children ──
  {
    id: 'child-identity',
    label: 'Child Identity Information',
    group: 'children',
    dataPoints: ['child\'s name', 'date of birth', 'school name', 'parent/guardian contact'],
    selected: false,
  },
  {
    id: 'child-activity',
    label: 'Child Online Activity',
    group: 'children',
    dataPoints: ['content viewed', 'in-app activity', 'communications'],
    selected: false,
  },
];

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a default TemplateContext with sensible empty/initial values.
 * Useful for initialising the wizard state before the user begins editing.
 */
export function createDefaultContext(): TemplateContext {
  return {
    org: {
      name: '',
      website: '',
      privacyEmail: '',
      address: '',
      dpoName: '',
      dpoEmail: '',
      industry: 'other',
      orgSize: 'startup',
      country: 'Nigeria',
    },
    dataCategories: DEFAULT_DATA_CATEGORIES.map((cat) => ({ ...cat })),
    purposes: [],
    hasChildrenData: false,
    hasSensitiveData: false,
    hasFinancialData: false,
    hasCrossBorderTransfer: false,
    hasAutomatedDecisions: false,
    thirdPartyProcessors: [],
  };
}
