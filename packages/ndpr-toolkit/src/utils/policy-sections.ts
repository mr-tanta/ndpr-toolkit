/**
 * Adaptive privacy policy section generators.
 *
 * Builds NDPA 2023-compliant policy sections based on the organisation's
 * template context (industry, data categories, purposes, flags, etc.).
 *
 * Every section produces a {@link PolicySection} matching the existing
 * interface from `types/privacy.ts`.
 */

import type { PolicySection } from '../types/privacy';
import type {
  DataCategory,
  ProcessingPurpose,
  TemplateContext,
  ThirdPartyProcessor,
} from '../types/policy-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Sentinel prefix for missing required fields. Chosen so that:
// - It's visually unmistakable in rendered policy output (will not be confused
//   with legitimate content the way `[Address]` was).
// - It's machine-greppable via `findUnfilledTokens()` for CI / runtime checks.
// - It survives HTML / Markdown / DOCX / PDF export unchanged.
export const UNFILLED_PREFIX = '«TODO: ';
export const UNFILLED_SUFFIX = '»';

function unfilled(field: string): string {
  return `${UNFILLED_PREFIX}${field}${UNFILLED_SUFFIX}`;
}

function makeSection(
  id: string,
  title: string,
  template: string,
  order: number,
  required: boolean,
): PolicySection {
  return { id, title, template, order, required, included: true };
}

function selectedCategories(cats: DataCategory[]): DataCategory[] {
  return cats.filter((c) => c.selected);
}

function categoriesByGroup(
  cats: DataCategory[],
  group: DataCategory['group'],
): DataCategory[] {
  return selectedCategories(cats).filter((c) => c.group === group);
}

function purposeLabel(p: ProcessingPurpose): string {
  const map: Record<ProcessingPurpose, string> = {
    service_delivery:
      'Service Delivery — to provide, maintain, and improve the services you have requested from us',
    marketing:
      'Marketing — to send promotional communications where you have opted in to receive them',
    analytics:
      'Analytics — to analyse usage patterns and improve user experience',
    research:
      'Research — to conduct research and development for service improvement',
    legal_compliance:
      'Legal Compliance — to meet our obligations under Nigerian law, including the NDPA 2023',
    fraud_prevention:
      'Fraud Prevention — to detect, prevent, and respond to fraud, security threats, and abuse',
  };
  return map[p];
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildIntroduction(ctx: TemplateContext, order: number): PolicySection {
  const orgName = ctx.org.name || unfilled('orgName');
  const website = ctx.org.website || unfilled('website');
  const date = new Date().toISOString().slice(0, 10);

  return makeSection(
    'introduction',
    'Introduction & Scope',
    `This Privacy Policy explains how ${orgName} ("we", "us", or "our") collects, uses, stores, ` +
      `and protects personal data when you use our services and visit our website at ${website}. ` +
      `This policy is issued in compliance with the Nigeria Data Protection Act (NDPA) 2023 and ` +
      `the Nigeria Data Protection Regulation (NDPR). It applies to all personal data processed ` +
      `by ${orgName}, whether collected online or offline.\n\n` +
      `Effective Date: ${date}.\n\n` +
      `We are committed to protecting your privacy and ensuring that your personal data is ` +
      `handled responsibly and in accordance with applicable data protection legislation.`,
    order,
    true,
  );
}

function buildDataCollection(
  ctx: TemplateContext,
  order: number,
): PolicySection {
  const orgName = ctx.org.name || unfilled('orgName');
  const selected = selectedCategories(ctx.dataCategories);

  const groupLabels: Record<string, string> = {
    identity: 'Identity & Contact Information',
    financial: 'Financial Information',
    behavioral: 'Technical & Behavioral Data',
    sensitive: 'Sensitive / Special-Category Data',
    children: "Children's Data",
  };

  let listing = '';
  const groups = ['identity', 'financial', 'behavioral', 'sensitive', 'children'] as const;
  for (const g of groups) {
    const items = selected.filter((c) => c.group === g);
    if (items.length > 0) {
      listing += `\n${groupLabels[g]}:\n`;
      for (const item of items) {
        listing += `- ${item.label}: ${item.dataPoints.join(', ')}.\n`;
      }
    }
  }

  if (listing === '') {
    listing = '\n- Personal data categories have not yet been specified.\n';
  }

  return makeSection(
    'data-collection',
    'Data We Collect',
    `${orgName} collects the following categories of personal data in the course of ` +
      `providing our services. Data may be collected directly from you (e.g. through forms, ` +
      `account registration, or correspondence) or automatically (e.g. through cookies, server ` +
      `logs, and similar technologies).\n` +
      listing +
      `\nWe only collect personal data that is adequate, relevant, and limited to what is ` +
      `necessary for the purposes described in this policy, in accordance with the NDPA 2023.`,
    order,
    true,
  );
}

function buildLegalBasis(ctx: TemplateContext, order: number): PolicySection {
  const orgName = ctx.org.name || unfilled('orgName');

  const bases: string[] = [];

  if (
    ctx.purposes.includes('service_delivery') ||
    ctx.purposes.length === 0
  ) {
    bases.push(
      '- Consent: where you have given clear, informed, and voluntary consent for specific processing activities (NDPA Section 25).',
    );
    bases.push(
      '- Contract: where processing is necessary for the performance of a contract to which you are a party, or to take pre-contractual steps at your request (NDPA Section 25).',
    );
  }
  if (ctx.purposes.includes('legal_compliance')) {
    bases.push(
      '- Legal Obligation: where processing is required for compliance with a legal obligation to which we are subject under Nigerian law.',
    );
  }
  if (ctx.purposes.includes('fraud_prevention')) {
    bases.push(
      '- Legitimate Interest: where processing is necessary for our legitimate interests (such as fraud prevention and network security), provided those interests are not overridden by your rights and freedoms (NDPA Section 25).',
    );
  }
  if (ctx.purposes.includes('research')) {
    bases.push(
      '- Public Interest / Research: where processing is necessary for scientific or historical research purposes, or statistical purposes, subject to appropriate safeguards.',
    );
  }

  // Always include consent and contract as fallback
  if (bases.length === 0) {
    bases.push(
      '- Consent: where you have given clear, informed, and voluntary consent for specific processing activities (NDPA Section 25).',
    );
    bases.push(
      '- Contract: where processing is necessary for the performance of a contract to which you are a party (NDPA Section 25).',
    );
  }

  return makeSection(
    'legal-basis',
    'Legal Basis for Processing',
    `${orgName} processes personal data under one or more of the following lawful bases ` +
      `as prescribed by the Nigeria Data Protection Act (NDPA) 2023:\n\n` +
      bases.join('\n') +
      `\n\nWe will always inform you of the specific legal basis applicable to each ` +
      `processing activity at the time of data collection.`,
    order,
    true,
  );
}

function buildDataUsage(ctx: TemplateContext, order: number): PolicySection {
  const purposes = ctx.purposes.length > 0 ? ctx.purposes : (['service_delivery'] as ProcessingPurpose[]);
  const items = purposes.map((p) => `- ${purposeLabel(p)}`).join('\n');

  return makeSection(
    'data-usage',
    'How We Use Your Data',
    `We process the personal data we collect for the following purposes:\n\n` +
      items +
      `\n\nWe will not process your personal data for purposes incompatible with those ` +
      `stated above without providing you with prior notice and, where required by the NDPA, ` +
      `obtaining your consent.`,
    order,
    true,
  );
}

function buildDataSharing(ctx: TemplateContext, order: number): PolicySection {
  const orgName = ctx.org.name || unfilled('orgName');
  const processors = ctx.thirdPartyProcessors;

  let processorText: string;
  if (processors.length > 0) {
    const rows = processors
      .map(
        (p: ThirdPartyProcessor) =>
          `| ${p.name} | ${p.purpose} | ${p.country} |`,
      )
      .join('\n');
    processorText =
      `We share personal data with the following third-party processors under ` +
      `data processing agreements that comply with the NDPA 2023:\n\n` +
      `| Processor | Purpose | Country |\n` +
      `| --- | --- | --- |\n` +
      rows +
      `\n\nAll processors are contractually required to implement appropriate technical ` +
      `and organisational measures to protect personal data.`;
  } else {
    processorText =
      `We do not currently share your personal data with third-party processors. ` +
      `Should this change, we will update this policy and, where required, obtain your consent ` +
      `before any sharing takes place.`;
  }

  return makeSection(
    'data-sharing',
    'Data Sharing & Disclosure',
    `${orgName} does not sell personal data under any circumstances.\n\n` +
      processorText +
      `\n\nWe may also disclose personal data where required by law, regulation, ` +
      `or valid legal process, including requests from Nigerian regulatory and law ` +
      `enforcement authorities.`,
    order,
    true,
  );
}

function buildDataSubjectRights(
  ctx: TemplateContext,
  order: number,
): PolicySection {
  const email = ctx.org.privacyEmail || unfilled('privacyEmail');

  return makeSection(
    'data-subject-rights',
    'Your Rights as a Data Subject',
    `Under the Nigeria Data Protection Act (NDPA) 2023, you are entitled to the ` +
      `following rights regarding your personal data:\n\n` +
      `1. Right of Access — You may request confirmation of whether we process your personal ` +
      `data and obtain a copy of that data (NDPA Section 34).\n` +
      `2. Right to Rectification — You may request correction of inaccurate or incomplete ` +
      `personal data we hold about you (NDPA Section 35).\n` +
      `3. Right to Erasure — You may request deletion of your personal data where there ` +
      `is no compelling legal reason for its continued processing (NDPA Section 36).\n` +
      `4. Right to Data Portability — You may request to receive your personal data in a ` +
      `structured, commonly used, and machine-readable format (NDPA Section 38).\n` +
      `5. Right to Restrict Processing — You may request that we limit the processing of ` +
      `your personal data in certain circumstances (NDPA Section 37).\n` +
      `6. Right to Object — You may object to the processing of your personal data where ` +
      `processing is based on legitimate interest or is carried out for direct marketing ` +
      `purposes (NDPA Section 37).\n\n` +
      `You also have the right to withdraw your consent at any time, without affecting the ` +
      `lawfulness of processing carried out prior to withdrawal.\n\n` +
      `To exercise any of these rights, please contact us at ${email}. We will respond to ` +
      `your request within 30 days, as required by the NDPA. If you are unsatisfied with our ` +
      `response, you have the right to lodge a complaint with the Nigeria Data Protection ` +
      `Commission (NDPC).`,
    order,
    true,
  );
}

function buildDataSecurity(ctx: TemplateContext, order: number): PolicySection {
  const email = ctx.org.privacyEmail || unfilled('privacyEmail');
  const industry = ctx.org.industry;

  let industrySpecific = '';
  if (industry === 'fintech') {
    industrySpecific =
      `\n- Compliance with Payment Card Industry Data Security Standard (PCI-DSS) for ` +
      `cardholder data protection.\n` +
      `- End-to-end encryption of financial transactions.\n` +
      `- Multi-factor authentication for account access.`;
  } else if (industry === 'healthcare') {
    industrySpecific =
      `\n- HIPAA-aligned safeguards for health information, including access controls ` +
      `and audit logging.\n` +
      `- Segregation of medical data from other personal data.\n` +
      `- Role-based access controls restricting health data to authorised personnel.`;
  } else if (industry === 'ecommerce') {
    industrySpecific =
      `\n- PCI-DSS compliant payment processing.\n` +
      `- Secure checkout and tokenisation of payment credentials.`;
  } else if (industry === 'government') {
    industrySpecific =
      `\n- Compliance with Nigeria\'s Cybercrimes Act 2015 requirements.\n` +
      `- Government-grade access controls and audit trails.`;
  }

  return makeSection(
    'data-security',
    'Data Security Measures',
    `We implement appropriate technical and organisational measures to protect personal ` +
      `data against unauthorised access, alteration, disclosure, or destruction. ` +
      `These measures include:\n\n` +
      `- Encryption of personal data in transit (TLS 1.2+) and at rest (AES-256).\n` +
      `- Access controls and least-privilege principles for all systems handling personal data.\n` +
      `- Regular security assessments, penetration testing, and vulnerability scanning.\n` +
      `- Staff training on data protection obligations and information security best practices.\n` +
      `- Incident response procedures aligned with NDPA breach notification requirements ` +
      `(72-hour notification to NDPC).` +
      industrySpecific +
      `\n\nWhile we employ industry-standard safeguards, no method of electronic transmission ` +
      `or storage is entirely secure. If you become aware of any security incident affecting ` +
      `your data, please contact us immediately at ${email}.`,
    order,
    true,
  );
}

function buildContactInfo(ctx: TemplateContext, order: number): PolicySection {
  // Required: orgName + privacyEmail. If absent, render the unfilled marker
  // so it's visually obvious *and* greppable.
  const orgName = ctx.org.name || unfilled('orgName');
  const email = ctx.org.privacyEmail || unfilled('privacyEmail');

  // Optional: only render the line when present. Avoids shipping a "DPO Email:
  // [DPO Email]" line for organisations that don't have a DPO.
  const optionalLines: string[] = [];
  if (ctx.org.address) optionalLines.push(`Address: ${ctx.org.address}`);
  if (ctx.org.website) optionalLines.push(`Website: ${ctx.org.website}`);

  const dpoLines: string[] = [];
  if (ctx.org.dpoName) dpoLines.push(`Data Protection Officer: ${ctx.org.dpoName}`);
  if (ctx.org.dpoEmail) dpoLines.push(`DPO Email: ${ctx.org.dpoEmail}`);

  const dpoBlock = dpoLines.length > 0 ? `\n\n${dpoLines.join('\n')}` : '';

  return makeSection(
    'contact-info',
    'Contact Information',
    `If you have questions, concerns, or requests regarding this privacy policy or our ` +
      `data protection practices, please contact us:\n\n` +
      `Organisation: ${orgName}\n` +
      `Email: ${email}` +
      (optionalLines.length > 0 ? `\n${optionalLines.join('\n')}` : '') +
      dpoBlock +
      `\n\nYou also have the right to lodge a complaint with the Nigeria Data Protection ` +
      `Commission (NDPC) if you believe your data protection rights have been infringed.\n\n` +
      `Nigeria Data Protection Commission\n` +
      `Website: https://ndpc.gov.ng\n` +
      `Email: info@ndpc.gov.ng`,
    order,
    true,
  );
}

// ---------------------------------------------------------------------------
// Conditional sections
// ---------------------------------------------------------------------------

function buildChildrenDataProtection(order: number): PolicySection {
  return makeSection(
    'children-data-protection',
    "Children's Data Protection",
    `We recognise the importance of protecting the privacy of children. In accordance ` +
      `with Section 31 of the NDPA 2023, we implement the following safeguards when ` +
      `processing children's personal data:\n\n` +
      `- We do not knowingly collect personal data from children under the age of 13 ` +
      `without verifiable parental or guardian consent.\n` +
      `- Where we process data of children between the ages of 13 and 17, we obtain ` +
      `consent from a parent or guardian, taking into account the child's age and maturity.\n` +
      `- Parents and guardians may request access to, correction of, or deletion of their ` +
      `child's personal data at any time by contacting us.\n` +
      `- We limit the collection of children's data to what is strictly necessary for the ` +
      `service provided and do not use it for marketing or profiling.\n` +
      `- A Data Protection Impact Assessment (DPIA) is conducted before any new processing ` +
      `activity involving children's data.\n\n` +
      `If we discover that we have inadvertently collected personal data from a child without ` +
      `appropriate consent, we will delete that data promptly.`,
    order,
    true,
  );
}

function buildSensitiveDataProcessing(order: number): PolicySection {
  return makeSection(
    'sensitive-data-processing',
    'Sensitive / Special-Category Data',
    `Certain categories of personal data are considered sensitive under the NDPA 2023 and ` +
      `require additional safeguards. Sensitive data includes information relating to health, ` +
      `biometric identifiers, ethnic origin, religious or political beliefs, and genetic data.\n\n` +
      `We process sensitive personal data only where:\n\n` +
      `- You have given explicit consent for the specific processing purpose.\n` +
      `- Processing is necessary to protect your vital interests or those of another person.\n` +
      `- Processing is required for the establishment, exercise, or defence of legal claims.\n` +
      `- Processing is necessary for reasons of substantial public interest under Nigerian law.\n\n` +
      `Enhanced security measures are applied to all sensitive data, including additional ` +
      `encryption, strict access controls, and enhanced audit logging. Sensitive data is ` +
      `stored separately from other personal data where technically feasible.`,
    order,
    true,
  );
}

function buildCrossBorderTransfers(
  ctx: TemplateContext,
  order: number,
): PolicySection {
  const processors = ctx.thirdPartyProcessors.filter(
    (p) => p.country.toLowerCase() !== 'nigeria',
  );
  let transferDetail = '';
  if (processors.length > 0) {
    const countries = Array.from(new Set(processors.map((p) => p.country)));
    transferDetail =
      `\n\nWe currently transfer personal data to the following jurisdictions: ` +
      `${countries.join(', ')}. Each transfer is subject to the safeguards described above.`;
  }

  return makeSection(
    'cross-border-transfers',
    'Cross-Border Data Transfers',
    `Where we transfer personal data outside Nigeria, we do so in strict compliance ` +
      `with Sections 43 and 44 of the NDPA 2023. We ensure that any cross-border transfer ` +
      `of personal data is subject to one or more of the following safeguards:\n\n` +
      `- The receiving country has been assessed by the NDPC as providing an adequate level ` +
      `of data protection.\n` +
      `- We have put in place appropriate contractual safeguards, such as Standard Contractual ` +
      `Clauses approved by the NDPC.\n` +
      `- You have provided explicit consent to the transfer after being informed of the ` +
      `associated risks.\n` +
      `- The transfer is necessary for the performance of a contract between you and us, ` +
      `or for pre-contractual steps taken at your request.\n` +
      `- The NDPC has granted an administrative authorisation for the transfer.` +
      transferDetail,
    order,
    true,
  );
}

function buildAutomatedDecisions(order: number): PolicySection {
  return makeSection(
    'automated-decision-making',
    'Automated Decision-Making & Profiling',
    `In accordance with Section 39 of the NDPA 2023, we inform you of any automated ` +
      `decision-making processes, including profiling, that produce legal effects or ` +
      `similarly significant effects on you.\n\n` +
      `Where we use automated decision-making:\n\n` +
      `- We will inform you that automated processing is being used and provide meaningful ` +
      `information about the logic involved.\n` +
      `- You have the right to request human intervention in any automated decision.\n` +
      `- You have the right to express your point of view and contest the decision.\n` +
      `- We will carry out regular reviews of automated decision-making systems to ensure ` +
      `fairness, accuracy, and absence of bias.\n` +
      `- We will not base automated decisions solely on sensitive personal data unless you ` +
      `have given explicit consent or the processing is authorised by Nigerian law.\n\n` +
      `You may object to automated decision-making at any time by contacting us using the ` +
      `details provided in this policy.`,
    order,
    true,
  );
}

function buildDataRetention(ctx: TemplateContext, order: number): PolicySection {
  const orgName = ctx.org.name || unfilled('orgName');
  const industry = ctx.org.industry;

  let industryRetention = '';
  if (industry === 'fintech') {
    industryRetention =
      `\n\nFinancial transaction records are retained for a minimum of six (6) years ` +
      `in compliance with the Central Bank of Nigeria (CBN) guidelines and the ` +
      `Money Laundering (Prevention and Prohibition) Act.`;
  } else if (industry === 'healthcare') {
    industryRetention =
      `\n\nMedical and health records are retained for a minimum of ten (10) years ` +
      `after the last date of treatment, or longer where required by applicable health ` +
      `regulations.`;
  } else if (industry === 'ecommerce') {
    industryRetention =
      `\n\nOrder and transaction records are retained for six (6) years in accordance ` +
      `with Nigerian tax and commercial law requirements.`;
  } else if (industry === 'education') {
    industryRetention =
      `\n\nStudent academic records may be retained indefinitely for verification ` +
      `purposes. Other personal data is retained only for the duration of enrolment ` +
      `plus five (5) years.`;
  }

  return makeSection(
    'data-retention',
    'Data Retention Schedule',
    `${orgName} retains personal data only for as long as necessary to fulfil the ` +
      `purposes for which it was collected, or as required by applicable Nigerian law. ` +
      `Our retention periods are determined based on the following criteria:\n\n` +
      `- The nature and sensitivity of the personal data.\n` +
      `- The purposes for which the data is processed.\n` +
      `- Legal, regulatory, and contractual obligations (including NDPA 2023 requirements).\n` +
      `- Legitimate business needs such as maintaining records for audits, dispute ` +
      `resolution, and regulatory examinations.\n\n` +
      `General retention periods:\n` +
      `- Account data: retained for the duration of your relationship with us, ` +
      `plus three (3) years.\n` +
      `- Communication records: retained for two (2) years from the date of correspondence.\n` +
      `- Analytics and usage data: retained in identifiable form for twelve (12) months, ` +
      `then aggregated or anonymised.` +
      industryRetention +
      `\n\nWhen personal data is no longer required, it is securely deleted or irreversibly ` +
      `anonymised in accordance with our internal data retention and disposal policy.`,
    order,
    true,
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Assembles an ordered array of privacy policy sections based on the
 * provided template context. Core sections are always included; conditional
 * sections are added based on context flags (children, sensitive data,
 * cross-border transfers, automated decisions).
 *
 * @param context - The template context describing the organisation and its data practices.
 * @returns An array of {@link PolicySection} objects, ordered and ready for rendering.
 */
export function assemblePolicy(context: TemplateContext): PolicySection[] {
  let order = 1;
  const sections: PolicySection[] = [];

  // ── Core sections (always included) ──
  sections.push(buildIntroduction(context, order++));
  sections.push(buildDataCollection(context, order++));
  sections.push(buildLegalBasis(context, order++));
  sections.push(buildDataUsage(context, order++));
  sections.push(buildDataSharing(context, order++));
  sections.push(buildDataSubjectRights(context, order++));
  sections.push(buildDataSecurity(context, order++));
  sections.push(buildContactInfo(context, order++));

  // ── Conditional sections ──
  if (context.hasChildrenData) {
    sections.push(buildChildrenDataProtection(order++));
  }
  if (context.hasSensitiveData) {
    sections.push(buildSensitiveDataProcessing(order++));
  }
  if (context.hasCrossBorderTransfer) {
    sections.push(buildCrossBorderTransfers(context, order++));
  }
  if (context.hasAutomatedDecisions) {
    sections.push(buildAutomatedDecisions(order++));
  }

  // ── Always-included adaptive section ──
  sections.push(buildDataRetention(context, order++));

  return sections;
}
