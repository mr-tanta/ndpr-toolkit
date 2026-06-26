export type CaseStudyStatus = 'approved' | 'draft-template';

export interface CaseStudy {
  slug: string;
  organization: string;
  sector: string;
  status: CaseStudyStatus;
  consentToPublish: string;
  summary: string;
  problem: string;
  implementation: string;
  modulesUsed: string[];
  outcome: string;
  nextStep: string;
  logo?: {
    src: string;
    width: number;
    height: number;
  };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'tanta-innovative-internal-compliance',
    organization: 'Tanta Innovative',
    sector: 'Software and technology consulting',
    status: 'approved',
    consentToPublish: 'Maintainer-owned implementation; approved for public use.',
    summary:
      'The maintainer team uses the toolkit as the reference implementation for NDPA workflows across demos, docs, audit scoring, and production recipes.',
    problem:
      'The team needed a repeatable way to demonstrate consent, data-subject rights, DPIA, breach, lawful-basis, cross-border, ROPA, DCPMI, CAR, and audit CLI workflows without rewriting compliance UI for every project.',
    implementation:
      'Tanta Innovative ships the public docs, live demos, NDPA audit flow, legal citation blocks, production recipes, and module examples from the same package surface that downstream teams install from npm.',
    modulesUsed: [
      'Consent',
      'Data Subject Rights',
      'DPIA',
      'Breach',
      'Lawful Basis',
      'Cross-Border',
      'ROPA',
      'Audit CLI',
      'Production Recipes',
    ],
    outcome:
      'The toolkit now has a maintained reference path for public docs, static demos, CI audit examples, and backend recipes that adopters can inspect before integrating.',
    nextStep:
      'Continue turning internal implementation patterns into documented recipes, tests, and example routes.',
    logo: { src: '/logos/tanta.png', width: 180, height: 48 },
  },
  {
    slug: 'finlab-nigeria-privacy-readiness',
    organization: 'Finlab Nigeria',
    sector: 'Scientific and educational equipment',
    status: 'approved',
    consentToPublish: 'Approved for public listing; implementation story uses conservative public details.',
    summary:
      'Finlab Nigeria is listed as an approved public adopter while its implementation story is kept deliberately lightweight until deeper metrics are approved.',
    problem:
      'The team needed a practical path for publishing privacy-facing workflows that could support customer trust without exposing internal compliance records.',
    implementation:
      'The toolkit provides reusable consent, privacy notice, data-subject request, and audit-readiness building blocks that can be adapted into customer-facing web properties.',
    modulesUsed: [
      'Consent',
      'Privacy Policy',
      'Data Subject Rights',
      'Compliance Score',
    ],
    outcome:
      'The public proof asset confirms approved adoption and the relevant module path without overstating deployment metrics, legal conclusions, or internal operating data.',
    nextStep:
      'Replace this lightweight implementation story with a deeper case study once quote, metrics, and implementation details are approved.',
    logo: { src: '/logos/finlab.webp', width: 180, height: 48 },
  },
  {
    slug: 'future-case-study-template',
    organization: 'Future approved adopter',
    sector: 'Template',
    status: 'draft-template',
    consentToPublish: 'Do not publish as a customer story until logo, quote, company description, and metrics are approved.',
    summary:
      'Use this structure for future case studies so every proof asset carries the same approval and evidence boundaries.',
    problem:
      'Describe the privacy, compliance, engineering, or buyer-trust problem in neutral language.',
    implementation:
      'Name the toolkit modules used, integration surface, deployment environment, and reviewer workflow.',
    modulesUsed: [
      'Module names',
      'Storage or backend path',
      'Audit or evidence workflow',
    ],
    outcome:
      'State approved outcomes only. Avoid revenue, compliance, or legal-success claims unless they are documented and approved.',
    nextStep:
      'Capture consent-to-publish status, quote approval, logo approval, metrics approval, and review owner before moving to approved.',
  },
];

export const APPROVED_CASE_STUDIES = CASE_STUDIES.filter((study) => study.status === 'approved');

export function getCaseStudyByOrganization(organization: string): CaseStudy | undefined {
  return APPROVED_CASE_STUDIES.find((study) => study.organization === organization);
}
