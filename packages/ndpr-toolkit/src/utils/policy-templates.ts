import { PolicySection, PolicyVariable } from '../types/privacy';

/**
 * Default NDPA-compliant privacy policy sections.
 * Each section uses {{variable}} placeholders that are resolved at generation time.
 */
export const DEFAULT_POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    description: 'Describes what personal data is collected and how it is obtained.',
    order: 1,
    required: true,
    included: true,
    template:
      '{{orgName}} ("we", "us", or "our") collects personal data from users of our services at {{website}}. ' +
      'We collect information you provide directly, such as your name, email address, phone number, and any other ' +
      'details you submit through forms or communications. We may also collect data automatically, including IP ' +
      'addresses, browser type, device information, and usage patterns through cookies and similar technologies. ' +
      'All data collection is conducted in accordance with the Nigeria Data Protection Act (NDPA) 2023.',
    variables: ['orgName', 'website'],
  },
  {
    id: 'legal-basis',
    title: 'Legal Basis for Processing',
    description: 'Specifies the lawful basis for processing personal data under the NDPA.',
    order: 2,
    required: true,
    included: true,
    template:
      '{{orgName}} processes personal data under one or more of the following lawful bases as prescribed by ' +
      'the NDPA 2023:\n\n' +
      '- Consent: where you have given clear, informed, and voluntary consent for a specific purpose.\n' +
      '- Contract: where processing is necessary to fulfil a contract with you or to take steps at your request before entering a contract.\n' +
      '- Legal obligation: where processing is required to comply with applicable Nigerian law.\n' +
      '- Vital interest: where processing is necessary to protect your life or that of another person.\n' +
      '- Public interest: where processing is necessary for the performance of a task carried out in the public interest.\n' +
      '- Legitimate interest: where processing is necessary for our legitimate interests, provided these are not overridden by your rights and freedoms.',
    variables: ['orgName'],
  },
  {
    id: 'data-usage',
    title: 'Data Usage',
    description: 'Explains the purposes for which personal data is processed.',
    order: 3,
    required: true,
    included: true,
    template:
      'We use the personal data we collect for the following purposes:\n\n' +
      '- Providing and improving our services at {{website}}.\n' +
      '- Communicating with you regarding your account, enquiries, or support requests.\n' +
      '- Sending relevant updates, where you have opted in to receive them.\n' +
      '- Ensuring the security and integrity of our platform.\n' +
      '- Complying with legal and regulatory obligations under Nigerian law.\n' +
      '- Conducting analytics to improve user experience and service quality.\n\n' +
      'We will not process your data for purposes incompatible with those stated above without providing you with notice and, where required, obtaining your consent.',
    variables: ['website'],
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing and Disclosure',
    description: 'Details when and with whom personal data may be shared.',
    order: 4,
    required: true,
    included: true,
    template:
      '{{orgName}} does not sell personal data. We may share your data with the following categories of recipients:\n\n' +
      '- Service providers and processors who assist us in operating our services, under strict data processing agreements.\n' +
      '- Regulatory and law enforcement authorities when required by Nigerian law or valid legal process.\n' +
      '- Professional advisers, including lawyers, auditors, and insurers, where necessary.\n' +
      '- Business partners, only with your explicit consent and for clearly stated purposes.\n\n' +
      'Any cross-border transfer of personal data will comply with the requirements of the NDPA 2023, including ' +
      'ensuring adequate safeguards are in place in the receiving jurisdiction.',
    variables: ['orgName'],
  },
  {
    id: 'data-subject-rights',
    title: 'Data Subject Rights',
    description: 'Outlines the rights of data subjects under the NDPA.',
    order: 5,
    required: true,
    included: true,
    template:
      'Under the NDPA 2023, you have the following rights regarding your personal data:\n\n' +
      '- Right of access: request a copy of the personal data we hold about you.\n' +
      '- Right to rectification: request correction of inaccurate or incomplete data.\n' +
      '- Right to erasure: request deletion of your personal data where there is no compelling reason for continued processing.\n' +
      '- Right to restrict processing: request limitation of how we process your data.\n' +
      '- Right to data portability: receive your data in a structured, commonly used format.\n' +
      '- Right to object: object to processing based on legitimate interest or for direct marketing purposes.\n' +
      '- Right to withdraw consent: withdraw previously given consent at any time without affecting prior processing.\n\n' +
      'To exercise any of these rights, contact us at {{privacyEmail}}. We will respond to your request within 30 days.',
    variables: ['privacyEmail'],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    description: 'Describes how long personal data is retained and the criteria for retention periods.',
    order: 6,
    required: true,
    included: true,
    template:
      '{{orgName}} retains personal data only for as long as necessary to fulfil the purposes for which it was ' +
      'collected, or as required by applicable Nigerian law. Retention periods are determined based on:\n\n' +
      '- The nature of the data and the purposes for processing.\n' +
      '- Legal, regulatory, and contractual obligations.\n' +
      '- Legitimate business needs such as maintaining records for audits or dispute resolution.\n\n' +
      'When personal data is no longer needed, it will be securely deleted or anonymised in accordance with our data retention policy.',
    variables: ['orgName'],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    description: 'Describes the security measures in place to protect personal data.',
    order: 7,
    required: true,
    included: true,
    template:
      'We implement appropriate technical and organisational measures to protect personal data against unauthorised ' +
      'access, alteration, disclosure, or destruction. These measures include:\n\n' +
      '- Encryption of data in transit and at rest.\n' +
      '- Access controls and authentication mechanisms.\n' +
      '- Regular security assessments and vulnerability testing.\n' +
      '- Staff training on data protection and information security.\n' +
      '- Incident response procedures in line with NDPA breach notification requirements.\n\n' +
      'While we strive to protect your data, no method of transmission or storage is completely secure. ' +
      'If you become aware of any security incident, please contact us immediately at {{privacyEmail}}.',
    variables: ['privacyEmail'],
  },
  {
    id: 'contact-info',
    title: 'Contact Information',
    description: 'Provides contact details for privacy-related enquiries and the Data Protection Officer.',
    order: 8,
    required: true,
    included: true,
    template:
      'If you have questions, concerns, or requests regarding this privacy policy or our data practices, ' +
      'please contact us:\n\n' +
      'Organisation: {{orgName}}\n' +
      'Address: {{address}}\n' +
      'Email: {{privacyEmail}}\n' +
      'Website: {{website}}\n\n' +
      'Data Protection Officer: {{dpoName}}\n' +
      'DPO Email: {{dpoEmail}}\n\n' +
      'You also have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) ' +
      'if you believe your data protection rights have been violated.\n\n' +
      'This policy is effective as of {{effectiveDate}} and applies to all {{industry}} services provided by {{orgName}}.',
    variables: ['orgName', 'address', 'privacyEmail', 'website', 'dpoName', 'dpoEmail', 'effectiveDate', 'industry'],
  },
];

/**
 * Default policy variables for NDPA-compliant privacy policies.
 * These map to the {{variable}} placeholders used in DEFAULT_POLICY_SECTIONS.
 */
export const DEFAULT_POLICY_VARIABLES: PolicyVariable[] = [
  {
    id: 'orgName',
    name: 'orgName',
    description: 'The official name of your organisation.',
    value: '',
    inputType: 'text',
    required: true,
  },
  {
    id: 'website',
    name: 'website',
    description: 'Your organisation\'s website URL.',
    value: '',
    inputType: 'url',
    required: true,
  },
  {
    id: 'privacyEmail',
    name: 'privacyEmail',
    description: 'Email address for privacy-related enquiries.',
    value: '',
    inputType: 'email',
    required: true,
  },
  {
    id: 'dpoName',
    name: 'dpoName',
    description: 'Full name of your Data Protection Officer.',
    value: '',
    inputType: 'text',
    required: false,
  },
  {
    id: 'dpoEmail',
    name: 'dpoEmail',
    description: 'Email address of your Data Protection Officer.',
    value: '',
    inputType: 'email',
    required: false,
  },
  {
    id: 'address',
    name: 'address',
    description: 'Physical address of your organisation.',
    value: '',
    inputType: 'textarea',
    required: false,
  },
  {
    id: 'industry',
    name: 'industry',
    description: 'The industry or sector your organisation operates in.',
    value: '',
    inputType: 'text',
    required: false,
  },
  {
    id: 'effectiveDate',
    name: 'effectiveDate',
    description: 'The date this privacy policy becomes effective.',
    value: '',
    inputType: 'date',
    required: false,
  },
];

/**
 * Creates a complete business privacy policy template with default
 * NDPA-compliant sections and variables.
 *
 * @returns An object containing the default sections and variables.
 */
export function createBusinessPolicyTemplate(): {
  sections: PolicySection[];
  variables: PolicyVariable[];
} {
  return {
    sections: DEFAULT_POLICY_SECTIONS.map(section => ({ ...section })),
    variables: DEFAULT_POLICY_VARIABLES.map(variable => ({ ...variable })),
  };
}
