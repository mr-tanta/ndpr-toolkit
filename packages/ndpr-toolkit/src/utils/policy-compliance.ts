/**
 * NDPA policy compliance checker.
 *
 * Evaluates a {@link PrivacyPolicy} against 15 requirements drawn from
 * the Nigeria Data Protection Act (NDPA) 2023, producing a scored
 * {@link ComplianceResult} with actionable gaps.
 *
 * Scoring:
 *   6 critical  @ 10 pts = 60
 *   5 important @  7 pts = 35
 *   4 recommended @ 5 pts = 20
 *   Total max = 115
 *
 * Rating thresholds:
 *   >= 100 → compliant
 *   >=  80 → nearly_compliant
 *   <   80 → not_compliant
 */

import type { PrivacyPolicy, PolicySection } from '../types/privacy';
import type {
  ComplianceGap,
  ComplianceResult,
  TemplateContext,
} from '../types/policy-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasSection(policy: PrivacyPolicy, id: string): boolean {
  return policy.sections.some(
    (s: PolicySection) => s.id === id && s.included,
  );
}

function sectionContent(policy: PrivacyPolicy, id: string): string {
  const s = policy.sections.find(
    (sec: PolicySection) => sec.id === id && sec.included,
  );
  return s?.template ?? '';
}

function anyContent(policy: PrivacyPolicy): string {
  return policy.sections
    .filter((s: PolicySection) => s.included)
    .map((s: PolicySection) => s.template)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Requirement definitions
// ---------------------------------------------------------------------------

interface Requirement {
  id: string;
  name: string;
  ndpaSection: string;
  severity: 'critical' | 'important' | 'recommended';
  points: number;
  check: (policy: PrivacyPolicy, context: TemplateContext) => boolean;
  gap: (context: TemplateContext) => Omit<ComplianceGap, 'requirementId' | 'requirement' | 'ndpaSection' | 'severity'>;
}

const REQUIREMENTS: Requirement[] = [
  // ─── Critical (10 pts each) ───
  {
    id: 'controller-identity',
    name: 'Controller Identity',
    ndpaSection: 'NDPA Section 24(1)(a)',
    severity: 'critical',
    points: 10,
    check: (policy) =>
      (policy.organizationInfo.name ?? '').trim().length > 0 &&
      (policy.organizationInfo.privacyEmail ?? '').trim().length > 0,
    gap: () => ({
      message:
        'The policy does not identify the data controller. The organisation name and contact email must be provided so data subjects know who is responsible for their data.',
      fixType: 'fill_field',
      fixLabel: 'Add organisation details',
      suggestedContent:
        'Provide your organisation\'s registered name and a valid privacy contact email address in the Organisation Info section.',
    }),
  },
  {
    id: 'purpose-of-processing',
    name: 'Purpose of Processing',
    ndpaSection: 'NDPA Section 24(1)(b)',
    severity: 'critical',
    points: 10,
    check: (_policy, context) => context.purposes.length > 0,
    gap: () => ({
      message:
        'No processing purposes have been selected. The NDPA requires you to clearly state the specific purposes for which personal data is collected and processed.',
      fixType: 'fill_field',
      fixLabel: 'Select processing purposes',
      suggestedContent:
        'Select at least one processing purpose (e.g. service delivery, analytics, marketing) in the wizard.',
    }),
  },
  {
    id: 'lawful-basis',
    name: 'Lawful Basis Identified',
    ndpaSection: 'NDPA Section 25',
    severity: 'critical',
    points: 10,
    check: (policy) => hasSection(policy, 'legal-basis'),
    gap: () => ({
      message:
        'The policy does not include a section identifying the lawful basis for processing. Under the NDPA, every processing activity must be grounded in a lawful basis such as consent, contract, or legitimate interest.',
      fixType: 'add_section',
      fixLabel: 'Add legal basis section',
      suggestedContent:
        'We process personal data under one or more of the following lawful bases as prescribed by the NDPA 2023:\n\n' +
        '- Consent: where you have given clear, informed, and voluntary consent.\n' +
        '- Contract: where processing is necessary for the performance of a contract.\n' +
        '- Legal Obligation: where processing is required by Nigerian law.\n' +
        '- Legitimate Interest: where processing is necessary for our legitimate interests, provided they do not override your rights.',
    }),
  },
  {
    id: 'data-categories-disclosed',
    name: 'Data Categories Disclosed',
    ndpaSection: 'NDPA Section 24(1)(c)',
    severity: 'critical',
    points: 10,
    check: (_policy, context) =>
      context.dataCategories.some((c) => c.selected),
    gap: () => ({
      message:
        'No data categories have been selected. The NDPA requires you to disclose the categories of personal data you collect (e.g. identity, financial, behavioral data).',
      fixType: 'fill_field',
      fixLabel: 'Select data categories',
      suggestedContent:
        'Select the categories of personal data your organisation collects in the Data Collection step of the wizard.',
    }),
  },
  {
    id: 'recipients-disclosed',
    name: 'Recipients Disclosed',
    ndpaSection: 'NDPA Section 24(1)(e)',
    severity: 'critical',
    points: 10,
    check: (policy, context) => {
      if (!hasSection(policy, 'data-sharing')) return false;
      // If processors exist, they should be mentioned in the section
      if (context.thirdPartyProcessors.length > 0) {
        const content = sectionContent(policy, 'data-sharing');
        return context.thirdPartyProcessors.every((p) =>
          content.includes(p.name),
        );
      }
      return true;
    },
    gap: (context) => ({
      message:
        context.thirdPartyProcessors.length > 0
          ? 'The data sharing section does not list all third-party processors. Each processor must be named with its purpose and location.'
          : 'The policy does not include a data sharing section. Even if you do not share data, you must state this clearly.',
      fixType: context.thirdPartyProcessors.length > 0 ? 'add_content' : 'add_section',
      fixLabel: context.thirdPartyProcessors.length > 0 ? 'Update sharing section' : 'Add data sharing section',
      suggestedContent:
        'We do not sell personal data. We may share your data with service providers under strict data processing agreements that comply with the NDPA 2023.',
    }),
  },
  {
    id: 'retention-periods',
    name: 'Retention Periods Specified',
    ndpaSection: 'NDPA Section 24(1)(f)',
    severity: 'critical',
    points: 10,
    check: (policy) => hasSection(policy, 'data-retention'),
    gap: () => ({
      message:
        'The policy does not include a data retention section. The NDPA requires you to specify the period for which personal data will be stored, or the criteria used to determine that period.',
      fixType: 'add_section',
      fixLabel: 'Add retention schedule',
      suggestedContent:
        'We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable Nigerian law. When personal data is no longer needed, it is securely deleted or anonymised.',
    }),
  },

  // ─── Important (7 pts each) ───
  {
    id: 'data-subject-rights',
    name: 'Data Subject Rights Listed',
    ndpaSection: 'NDPA Sections 34-39',
    severity: 'important',
    points: 7,
    check: (policy) => {
      if (!hasSection(policy, 'data-subject-rights')) return false;
      const content = sectionContent(policy, 'data-subject-rights').toLowerCase();
      const rights = ['access', 'rectification', 'erasure', 'portability', 'restrict', 'object'];
      return rights.every((r) => content.includes(r));
    },
    gap: () => ({
      message:
        'The data subject rights section is missing or does not cover all six NDPA rights: access, rectification, erasure, portability, restriction, and objection.',
      fixType: 'add_content',
      fixLabel: 'Add missing rights',
      suggestedContent:
        'Under the NDPA 2023, you have the following rights:\n' +
        '1. Right of Access (Section 34)\n' +
        '2. Right to Rectification (Section 35)\n' +
        '3. Right to Erasure (Section 36)\n' +
        '4. Right to Restrict Processing (Section 37)\n' +
        '5. Right to Data Portability (Section 38)\n' +
        '6. Right to Object (Section 37)',
    }),
  },
  {
    id: 'right-to-withdraw-consent',
    name: 'Right to Withdraw Consent',
    ndpaSection: 'NDPA Section 25(2)',
    severity: 'important',
    points: 7,
    check: (policy) => {
      const all = anyContent(policy).toLowerCase();
      return all.includes('withdraw') && all.includes('consent');
    },
    gap: () => ({
      message:
        'The policy does not mention the right to withdraw consent. Data subjects must be informed that they can withdraw consent at any time without affecting the lawfulness of prior processing.',
      fixType: 'add_content',
      fixLabel: 'Add withdrawal clause',
      suggestedContent:
        'You have the right to withdraw your consent at any time, without affecting the lawfulness of processing carried out prior to withdrawal. To withdraw your consent, contact us at the email address provided in this policy.',
    }),
  },
  {
    id: 'right-to-lodge-complaint',
    name: 'Right to Lodge Complaint with NDPC',
    ndpaSection: 'NDPA Section 40',
    severity: 'important',
    points: 7,
    check: (policy) => {
      const all = anyContent(policy).toLowerCase();
      return all.includes('ndpc') || all.includes('nigeria data protection commission');
    },
    gap: () => ({
      message:
        'The policy does not mention the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC). Data subjects must be informed of this right.',
      fixType: 'add_content',
      fixLabel: 'Add NDPC complaint reference',
      suggestedContent:
        'You have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your data protection rights have been infringed. Website: https://ndpc.gov.ng',
    }),
  },
  {
    id: 'cross-border-safeguards',
    name: 'Cross-Border Transfer Safeguards',
    ndpaSection: 'NDPA Sections 43-44',
    severity: 'important',
    points: 7,
    check: (policy, context) => {
      if (!context.hasCrossBorderTransfer) return true; // not applicable
      return hasSection(policy, 'cross-border-transfers');
    },
    gap: () => ({
      message:
        'Cross-border data transfers are indicated but the policy lacks a section describing the safeguards in place. The NDPA requires disclosure of transfer mechanisms and adequacy assessments.',
      fixType: 'add_section',
      fixLabel: 'Add cross-border section',
      suggestedContent:
        'Where we transfer personal data outside Nigeria, we ensure compliance with Sections 43 and 44 of the NDPA 2023 by implementing appropriate safeguards, including adequacy assessments and Standard Contractual Clauses.',
    }),
  },
  {
    id: 'automated-decision-disclosure',
    name: 'Automated Decision-Making Disclosure',
    ndpaSection: 'NDPA Section 39',
    severity: 'important',
    points: 7,
    check: (policy, context) => {
      if (!context.hasAutomatedDecisions) return true; // not applicable
      return hasSection(policy, 'automated-decision-making');
    },
    gap: () => ({
      message:
        'Automated decision-making is indicated but the policy does not include a section disclosing this. The NDPA requires you to inform data subjects about automated decisions, including the logic involved and the right to human intervention.',
      fixType: 'add_section',
      fixLabel: 'Add automated decisions section',
      suggestedContent:
        'We use automated decision-making in certain processes. You have the right to request human intervention, express your point of view, and contest automated decisions, in accordance with Section 39 of the NDPA 2023.',
    }),
  },

  // ─── Recommended (5 pts each) ───
  {
    id: 'children-data-protection',
    name: "Children's Data Protection",
    ndpaSection: 'NDPA Section 31',
    severity: 'recommended',
    points: 5,
    check: (policy, context) => {
      if (!context.hasChildrenData) return true; // not applicable
      return hasSection(policy, 'children-data-protection');
    },
    gap: () => ({
      message:
        "Children's data processing is indicated but the policy does not include a dedicated children's data protection section. The NDPA requires enhanced protections including parental consent for children under 13.",
      fixType: 'add_section',
      fixLabel: "Add children's data section",
      suggestedContent:
        "We do not knowingly collect personal data from children under the age of 13 without verifiable parental or guardian consent. Parents and guardians may request access to, correction of, or deletion of their child's data at any time.",
    }),
  },
  {
    id: 'dpo-contact-info',
    name: 'DPO Contact Information',
    ndpaSection: 'NDPA Section 30',
    severity: 'recommended',
    points: 5,
    check: (policy) =>
      (policy.organizationInfo.dpoName ?? '').trim().length > 0 &&
      (policy.organizationInfo.dpoEmail ?? '').trim().length > 0,
    gap: () => ({
      message:
        'The Data Protection Officer (DPO) contact information is not provided. While not always mandatory, appointing a DPO and publishing their contact details is strongly recommended under the NDPA.',
      fixType: 'fill_field',
      fixLabel: 'Add DPO details',
      suggestedContent:
        'Provide the full name and email address of your Data Protection Officer in the Organisation Info section.',
    }),
  },
  {
    id: 'security-measures',
    name: 'Security Measures Described',
    ndpaSection: 'NDPA Section 28',
    severity: 'recommended',
    points: 5,
    check: (policy) => hasSection(policy, 'data-security'),
    gap: () => ({
      message:
        'The policy does not describe the technical and organisational security measures in place to protect personal data. Describing these measures builds trust and demonstrates NDPA compliance.',
      fixType: 'add_section',
      fixLabel: 'Add security section',
      suggestedContent:
        'We implement appropriate technical and organisational measures to protect personal data, including encryption in transit and at rest, access controls, regular security assessments, and incident response procedures aligned with NDPA breach notification requirements.',
    }),
  },
  {
    id: 'policy-effective-date',
    name: 'Policy Effective Date',
    ndpaSection: 'NDPA Section 24',
    severity: 'recommended',
    points: 5,
    check: (policy) => policy.effectiveDate > 0,
    gap: () => ({
      message:
        'The policy does not have an effective date set. An effective date is important for version control and for data subjects to know when the policy was last updated.',
      fixType: 'fill_field',
      fixLabel: 'Set effective date',
      suggestedContent:
        "Set the policy's effective date to the date you intend to publish it.",
    }),
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluates a privacy policy against 15 NDPA 2023 requirements and
 * returns a scored compliance result with actionable gap information.
 *
 * @param policy  - The privacy policy to evaluate.
 * @param context - The template context that was used to generate the policy.
 * @returns A {@link ComplianceResult} with score, rating, gaps, and passed ids.
 */
export function evaluatePolicyCompliance(
  policy: PrivacyPolicy,
  context: TemplateContext,
): ComplianceResult {
  const maxScore = REQUIREMENTS.reduce((sum, r) => sum + r.points, 0); // 115
  let score = 0;
  const gaps: ComplianceGap[] = [];
  const passed: string[] = [];

  for (const req of REQUIREMENTS) {
    if (req.check(policy, context)) {
      score += req.points;
      passed.push(req.id);
    } else {
      const gapInfo = req.gap(context);
      gaps.push({
        requirementId: req.id,
        requirement: req.name,
        ndpaSection: req.ndpaSection,
        severity: req.severity,
        ...gapInfo,
      });
    }
  }

  const percentage = Math.round((score / maxScore) * 100);
  let rating: ComplianceResult['rating'];
  if (score >= 100) {
    rating = 'compliant';
  } else if (score >= 80) {
    rating = 'nearly_compliant';
  } else {
    rating = 'not_compliant';
  }

  return { score, maxScore, percentage, rating, gaps, passed };
}
