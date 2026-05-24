/**
 * Org-specific privacy-policy templates — pre-filled `TemplateContext`
 * factories for the most common Nigerian app shapes.
 *
 * Each template returns a fully-populated `TemplateContext` with:
 * - industry set to the matching `Industry` value
 * - the data categories the sector typically collects (selected: true)
 * - the processing purposes that match the business model
 * - sensitive-data / children / cross-border / automated-decisions flags
 *   set to the defaults that org type usually needs (a school will have
 *   children data, a hospital will have sensitive data, etc.)
 *
 * Templates are guidance starters. The wizard still walks the user through
 * every step — they can flip any flag, add/remove categories, or rewrite
 * any section before the policy is finalised. The legal-notice footer the
 * toolkit ships everywhere applies to the generated output.
 *
 * @example
 *   import { templateContextFor } from '@tantainnovative/ndpr-toolkit/server';
 *   const ctx = templateContextFor('ecommerce', { orgName: 'Acme NG' });
 *   const draft = assemblePolicy(ctx);
 */

import {
  createDefaultContext,
  DEFAULT_DATA_CATEGORIES,
  type TemplateContext,
  type ProcessingPurpose,
  type DataCategory,
} from '../types/policy-engine';

/** Identifiers for the bundled org templates. */
export type OrgPolicyTemplateId =
  | 'saas'
  | 'ecommerce'
  | 'school'
  | 'healthcare'
  | 'procurement';

/** Optional overrides applied on top of a template's defaults. */
export interface OrgPolicyTemplateOverrides {
  /** Organisation name (e.g. "Acme Nigeria Ltd"). Default: empty. */
  orgName?: string;
  /** Public website URL. */
  website?: string;
  /** Privacy contact email. */
  privacyEmail?: string;
  /** Postal address. */
  address?: string;
  /** DPO name. Required for DCPMI under NDPA Section 32. */
  dpoName?: string;
  /** DPO email. Required for the NDPC breach-notification contact. */
  dpoEmail?: string;
}

/**
 * Static metadata for every template — useful for picker UIs that need
 * to list available templates with a one-line description.
 */
export const ORG_POLICY_TEMPLATE_REGISTRY: Record<
  OrgPolicyTemplateId,
  {
    id: OrgPolicyTemplateId;
    label: string;
    description: string;
    /** Best-fit org examples to show in the picker. */
    examples: readonly string[];
  }
> = {
  saas: {
    id: 'saas',
    label: 'SaaS / B2B Software',
    description:
      'Multi-tenant cloud software. Account credentials, usage analytics, ' +
      'cross-border transfer to the SaaS vendor, automated processing for ' +
      'features like spam filtering or fraud scoring.',
    examples: ['team collaboration tools', 'CRM', 'developer tools', 'workflow automation'],
  },
  ecommerce: {
    id: 'ecommerce',
    label: 'Ecommerce / Online Store',
    description:
      'Online retail. Customer identity, payment data, shipping address, ' +
      'cart abandonment cookies, marketing analytics, third-party payment ' +
      'processors.',
    examples: ['online retail', 'D2C brand', 'marketplace', 'food delivery'],
  },
  school: {
    id: 'school',
    label: 'School / Education',
    description:
      'Educational institution or edtech platform. Student data including ' +
      'minors (NDPA Section 31 — parental consent required), academic ' +
      'records, attendance, behavioural data for learning analytics.',
    examples: ['K-12 school', 'edtech app', 'tutoring platform', 'online courses'],
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare / HealthTech',
    description:
      'Medical practice, hospital, telemedicine, or health insurance. ' +
      'Sensitive personal data (NDPA Section 30 — medical), prescription ' +
      'history, insurance claims, biometric data.',
    examples: ['hospital', 'telemedicine', 'pharmacy', 'health insurance'],
  },
  procurement: {
    id: 'procurement',
    label: 'Procurement / B2G',
    description:
      'Government procurement, vendor management, public-sector bidding. ' +
      'Vendor company data, tax IDs, beneficial-owner information, contract ' +
      'records, sometimes politically-exposed-person (PEP) data.',
    examples: ['e-procurement portal', 'vendor registry', 'government supplier database'],
  },
};

/**
 * IDs of the bundled data categories used by templates, lifted from the
 * `DEFAULT_DATA_CATEGORIES` exports so the template selection mirrors the
 * picker UI exactly.
 */
const DC = {
  fullName: 'full-name',
  contactDetails: 'contact-details',
  govIds: 'government-ids',
  credentials: 'account-credentials',
  payment: 'payment-info',
  financialRecords: 'financial-records',
  bvn: 'bvn',
  device: 'device-info',
  usage: 'usage-data',
  location: 'location-data',
  cookies: 'cookies',
  health: 'health-data',
  biometric: 'biometric-data',
  ethnicReligious: 'ethnic-religious',
  children: 'children',
} as const;

/**
 * Returns a copy of DEFAULT_DATA_CATEGORIES with the given IDs marked
 * `selected: true`. Unknown IDs are silently ignored — they just won't
 * select anything.
 */
function selectCategories(ids: readonly string[]): DataCategory[] {
  const set = new Set(ids);
  return DEFAULT_DATA_CATEGORIES.map((cat) => ({
    ...cat,
    selected: set.has(cat.id),
  }));
}

/**
 * Apply organisation overrides to a base context. Empty strings in the
 * override are treated as "don't override" so templates with empty
 * placeholders aren't clobbered.
 */
function applyOverrides(
  ctx: TemplateContext,
  overrides?: OrgPolicyTemplateOverrides,
): TemplateContext {
  if (!overrides) return ctx;
  return {
    ...ctx,
    org: {
      ...ctx.org,
      name: overrides.orgName ?? ctx.org.name,
      website: overrides.website ?? ctx.org.website,
      privacyEmail: overrides.privacyEmail ?? ctx.org.privacyEmail,
      address: overrides.address ?? ctx.org.address,
      dpoName: overrides.dpoName ?? ctx.org.dpoName,
      dpoEmail: overrides.dpoEmail ?? ctx.org.dpoEmail,
    },
  };
}

const PURPOSES_SAAS: ProcessingPurpose[] = [
  'service_delivery',
  'analytics',
  'marketing',
  'fraud_prevention',
];

const PURPOSES_ECOMMERCE: ProcessingPurpose[] = [
  'service_delivery',
  'marketing',
  'analytics',
  'fraud_prevention',
  'legal_compliance',
];

const PURPOSES_SCHOOL: ProcessingPurpose[] = [
  'service_delivery',
  'analytics',
  'legal_compliance',
];

const PURPOSES_HEALTHCARE: ProcessingPurpose[] = [
  'service_delivery',
  'legal_compliance',
  'research',
];

const PURPOSES_PROCUREMENT: ProcessingPurpose[] = [
  'service_delivery',
  'legal_compliance',
  'fraud_prevention',
];

function saasTemplate(): TemplateContext {
  const ctx = createDefaultContext();
  ctx.org.industry = 'saas';
  ctx.org.orgSize = 'startup';
  ctx.dataCategories = selectCategories([
    DC.fullName,
    DC.contactDetails,
    DC.credentials,
    DC.device,
    DC.usage,
    DC.cookies,
  ]);
  ctx.purposes = PURPOSES_SAAS;
  ctx.hasChildrenData = false;
  ctx.hasSensitiveData = false;
  ctx.hasFinancialData = false;
  ctx.hasCrossBorderTransfer = true; // most SaaS use overseas cloud infra
  ctx.hasAutomatedDecisions = false;
  return ctx;
}

function ecommerceTemplate(): TemplateContext {
  const ctx = createDefaultContext();
  ctx.org.industry = 'ecommerce';
  ctx.org.orgSize = 'midsize';
  ctx.dataCategories = selectCategories([
    DC.fullName,
    DC.contactDetails,
    DC.payment,
    DC.financialRecords,
    DC.device,
    DC.usage,
    DC.location,
    DC.cookies,
  ]);
  ctx.purposes = PURPOSES_ECOMMERCE;
  ctx.hasChildrenData = false;
  ctx.hasSensitiveData = false;
  ctx.hasFinancialData = true;
  ctx.hasCrossBorderTransfer = true; // payment processors often offshore
  ctx.hasAutomatedDecisions = true; // fraud-detection / recommendations
  return ctx;
}

function schoolTemplate(): TemplateContext {
  const ctx = createDefaultContext();
  ctx.org.industry = 'education';
  ctx.org.orgSize = 'midsize';
  ctx.dataCategories = selectCategories([
    DC.fullName,
    DC.contactDetails,
    DC.govIds,
    DC.credentials,
    DC.usage,
    DC.cookies,
    DC.children,
  ]);
  ctx.purposes = PURPOSES_SCHOOL;
  ctx.hasChildrenData = true; // NDPA Section 31 — parental consent
  ctx.hasSensitiveData = false;
  ctx.hasFinancialData = false;
  ctx.hasCrossBorderTransfer = false;
  ctx.hasAutomatedDecisions = false;
  return ctx;
}

function healthcareTemplate(): TemplateContext {
  const ctx = createDefaultContext();
  ctx.org.industry = 'healthcare';
  ctx.org.orgSize = 'enterprise';
  ctx.dataCategories = selectCategories([
    DC.fullName,
    DC.contactDetails,
    DC.govIds,
    DC.payment,
    DC.health,
    DC.biometric,
  ]);
  ctx.purposes = PURPOSES_HEALTHCARE;
  ctx.hasChildrenData = false;
  ctx.hasSensitiveData = true; // NDPA Section 30 — medical, biometric
  ctx.hasFinancialData = true; // insurance + payment
  ctx.hasCrossBorderTransfer = false;
  ctx.hasAutomatedDecisions = false;
  return ctx;
}

function procurementTemplate(): TemplateContext {
  const ctx = createDefaultContext();
  ctx.org.industry = 'government';
  ctx.org.orgSize = 'enterprise';
  ctx.dataCategories = selectCategories([
    DC.fullName,
    DC.contactDetails,
    DC.govIds,
    DC.financialRecords,
    DC.bvn,
  ]);
  ctx.purposes = PURPOSES_PROCUREMENT;
  ctx.hasChildrenData = false;
  ctx.hasSensitiveData = false; // PEP data only if applicable
  ctx.hasFinancialData = true;
  ctx.hasCrossBorderTransfer = false;
  ctx.hasAutomatedDecisions = false;
  return ctx;
}

const TEMPLATES: Record<OrgPolicyTemplateId, () => TemplateContext> = {
  saas: saasTemplate,
  ecommerce: ecommerceTemplate,
  school: schoolTemplate,
  healthcare: healthcareTemplate,
  procurement: procurementTemplate,
};

/**
 * Returns a fresh `TemplateContext` pre-filled for the given org type.
 * Pass `overrides` to set organisation details (name, DPO, etc.) inline.
 *
 * Calling without arguments throws — pass a known template id.
 *
 * @example
 *   const ctx = templateContextFor('healthcare', {
 *     orgName: 'Lagos Heart Centre',
 *     dpoEmail: 'dpo@lhc.ng',
 *   });
 */
export function templateContextFor(
  id: OrgPolicyTemplateId,
  overrides?: OrgPolicyTemplateOverrides,
): TemplateContext {
  const factory = TEMPLATES[id];
  if (!factory) {
    throw new Error(
      `[ndpr-toolkit] Unknown org template id: ${String(id)}. ` +
        `Expected one of: ${Object.keys(TEMPLATES).join(', ')}.`,
    );
  }
  return applyOverrides(factory(), overrides);
}

/** Convenience alias matching the `<NDPRPrivacyPolicy template={id} />` prop. */
export { templateContextFor as createOrgTemplate };
