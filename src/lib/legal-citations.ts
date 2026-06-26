export type CitationModuleId =
  | 'consent'
  | 'dsr'
  | 'dpia'
  | 'breach'
  | 'policy'
  | 'lawful-basis'
  | 'cross-border'
  | 'ropa'
  | 'audit-cli'
  | 'dcpmi-car';

export type LegalReference = {
  label: string;
  href: string;
  detail: string;
};

export type LegalCitationBlock = {
  title: string;
  references: LegalReference[];
  automates: string[];
  doesNotReplace: string[];
};

const ndpa2023: LegalReference = {
  label: 'Nigeria Data Protection Act, 2023',
  href: 'https://ndpc.gov.ng/wp-content/uploads/2024/03/Nigeria_Data_Protection_Act_2023.pdf',
  detail: 'Primary statutory source for NDPA controller, processor, rights, security, DPIA, breach, ROPA, and transfer duties.',
};

const gaid2025: LegalReference = {
  label: 'NDP Act General Application and Implementation Directive, 2025',
  href: 'https://ndpc.gov.ng/wp-content/uploads/2025/07/NDP-ACT-GAID-2025-MARCH-20TH.pdf',
  detail: 'NDPC implementation guidance used for DCPMI, CAR, breach-notification content, and operational compliance checks.',
};

const registrationGuidance: LegalReference = {
  label: 'Guidance Notice on Registration of Data Controllers and Processors of Major Importance',
  href: 'https://ndpc.gov.ng/wp-content/uploads/2025/07/Updated-Guidance-Notice-on-Registtration-2024.pdf',
  detail: 'Supplemental NDPC registration source used for DCPMI classification and filing assumptions.',
};

export const requiredCitationModuleIds: CitationModuleId[] = [
  'consent',
  'dsr',
  'dpia',
  'breach',
  'policy',
  'lawful-basis',
  'cross-border',
  'ropa',
  'audit-cli',
  'dcpmi-car',
];

export const legalCitationBlocks: Record<CitationModuleId, LegalCitationBlock> = {
  consent: {
    title: 'Consent management citations',
    references: [{ ...ndpa2023, detail: 'NDPA S.25-S.26: lawful basis, valid consent, withdrawal, and demonstrable consent records.' }],
    automates: ['Consent presentation, preference capture, withdrawal flow support, and storage adapter integration.'],
    doesNotReplace: ['A legal review of whether consent is the right lawful basis for each processing purpose.'],
  },
  dsr: {
    title: 'Data subject rights citations',
    references: [{ ...ndpa2023, detail: 'NDPA Part VI, S.34-S.38: access, rectification, erasure, portability, objection, and request handling.' }],
    automates: ['Request intake, request type structure, status tracking, and response workflow scaffolding.'],
    doesNotReplace: ['Identity verification, legal privilege review, exemptions analysis, or final response approval.'],
  },
  dpia: {
    title: 'DPIA citations',
    references: [{ ...ndpa2023, detail: 'NDPA S.28: impact assessment requirements for processing likely to create high risk.' }],
    automates: ['Questionnaire flow, risk capture, scoring support, and mitigation documentation.'],
    doesNotReplace: ['A controller-specific DPIA review by privacy, security, legal, and business owners.'],
  },
  breach: {
    title: 'Breach notification citations',
    references: [
      { ...ndpa2023, detail: 'NDPA S.40: breach notification duties to the NDPC and affected data subjects.' },
      { ...gaid2025, detail: 'GAID 2025 Art. 33: breach notification content, timing, and high-risk data-subject communication details.' },
    ],
    automates: ['Breach intake, severity triage, 72-hour readiness checks, and notification content completeness prompts.'],
    doesNotReplace: ['Incident-response investigation, containment decisions, regulator submission approval, or counsel review.'],
  },
  policy: {
    title: 'Privacy policy citations',
    references: [{ ...ndpa2023, detail: 'NDPA S.27: transparent privacy notices and data-subject information requirements.' }],
    automates: ['Policy drafting workflow, section assembly, preview, and export support.'],
    doesNotReplace: ['A final privacy notice review against your actual processing, vendors, retention, and transfer practices.'],
  },
  'lawful-basis': {
    title: 'Lawful basis citations',
    references: [{ ...ndpa2023, detail: 'NDPA S.25: lawful bases for processing personal data and purpose-specific documentation.' }],
    automates: ['Processing activity capture, basis selection, and gap-oriented review prompts.'],
    doesNotReplace: ['A defensible legal basis assessment for sensitive, high-risk, employment, or marketing processing.'],
  },
  'cross-border': {
    title: 'Cross-border transfer citations',
    references: [{ ...ndpa2023, detail: 'NDPA S.41-S.43: adequacy, safeguards, transfer conditions, and approval-oriented requirements.' }],
    automates: ['Transfer inventory, destination and safeguard capture, adequacy prompts, and risk review scaffolding.'],
    doesNotReplace: ['Transfer impact analysis, contractual drafting, NDPC approval strategy, or country-law assessment.'],
  },
  ropa: {
    title: 'ROPA citations',
    references: [{ ...ndpa2023, detail: 'NDPA S.29: records of processing activities and accountability documentation.' }],
    automates: ['Processing record capture, categorisation, filtering, summary, and CSV export support.'],
    doesNotReplace: ['Organisation-wide data mapping, audit evidence review, or validation that every process is represented.'],
  },
  'audit-cli': {
    title: 'Audit CLI citations',
    references: [ndpa2023, gaid2025, registrationGuidance],
    automates: ['Developer-facing completeness checks across compliance score, DCPMI, CAR, and breach-notification inputs.'],
    doesNotReplace: ['A statutory audit, DPCO engagement, NDPC filing, or legal sign-off on compliance posture.'],
  },
  'dcpmi-car': {
    title: 'DCPMI and CAR citations',
    references: [gaid2025, registrationGuidance],
    automates: ['DCPMI tier classification, configurable fee baselines, initial audit timing, and annual CAR schedule support.'],
    doesNotReplace: ['NDPC designation review, current fee confirmation, NIMP filing, or advice on sector-specific registration duties.'],
  },
};
