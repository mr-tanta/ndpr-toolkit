/**
 * Compliance Score Engine
 *
 * Evaluates an organisation's NDPA compliance posture across eight modules and
 * returns a scored, rated report with per-module breakdowns and sorted
 * recommendations.
 *
 * Pure utility — zero React dependency.
 */

// ─── Public types ────────────────────────────────────────────────────────────

export type ComplianceRating = 'excellent' | 'good' | 'needs-work' | 'critical';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type EffortLevel = 'low' | 'medium' | 'high';

export interface RegulatoryReference {
  section: string;
  title: string;
  url?: string;
}

export interface Recommendation {
  module: string;
  key: string;
  label: string;
  priority: RecommendationPriority;
  effort: EffortLevel;
  recommendation: string;
  ndpaSection: string;
}

export interface ModuleScore {
  /** Module name (e.g. "consent") */
  name: string;
  /** Raw module score 0-100 */
  score: number;
  /** Maximum possible score for this module (always 100) */
  maxScore: number;
  /** Weighted contribution to the overall score */
  weightedScore: number;
  /** NDPA sections this module maps to */
  ndpaSections: string[];
  /** Gaps found — list of human-readable gap descriptions */
  gaps: string[];
}

export interface ComplianceReport {
  /** Overall compliance score, 0–100 */
  score: number;
  /** Rating bucket */
  rating: ComplianceRating;
  /** Per-module breakdown keyed by module name */
  modules: Record<string, ModuleScore>;
  /** Recommendations sorted by priority (critical first) */
  recommendations: Recommendation[];
  /** Top-level regulatory references */
  regulatoryReferences: RegulatoryReference[];
  /** ISO date of when the report was generated */
  generatedAt: string;
}

// ─── Input types ─────────────────────────────────────────────────────────────

export interface ComplianceInput {
  consent: {
    hasConsentMechanism: boolean;
    hasPurposeSpecification: boolean;
    hasWithdrawalMechanism: boolean;
    hasMinorProtection: boolean;
    consentRecordsRetained: boolean;
  };
  dsr: {
    hasRequestMechanism: boolean;
    supportsAccess: boolean;
    supportsRectification: boolean;
    supportsErasure: boolean;
    supportsPortability: boolean;
    supportsObjection: boolean;
    /** Expected max response time in days (>30 counts as a gap) */
    responseTimelineDays: number;
  };
  dpia: {
    conductedForHighRisk: boolean;
    documentedRisks: boolean;
    mitigationMeasures: boolean;
  };
  breach: {
    hasNotificationProcess: boolean;
    notifiesWithin72Hours: boolean;
    hasRiskAssessment: boolean;
    hasRecordKeeping: boolean;
  };
  policy: {
    hasPrivacyPolicy: boolean;
    isPubliclyAccessible: boolean;
    /** ISO date string (YYYY-MM-DD); >13 months old counts as a gap */
    lastUpdated: string;
    coversAllSections: boolean;
  };
  lawfulBasis: {
    documentedForAllProcessing: boolean;
    hasLegitimateInterestAssessment: boolean;
  };
  crossBorder: {
    hasTransferMechanisms: boolean;
    adequacyAssessed: boolean;
    ndpcApprovalObtained: boolean;
  };
  ropa: {
    maintained: boolean;
    includesAllProcessing: boolean;
    /** ISO date string (YYYY-MM-DD); >6 months since review counts as a gap */
    lastReviewed: string;
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

interface CheckDefinition {
  key: string;
  label: string;
  priority: RecommendationPriority;
  effort: EffortLevel;
  recommendation: string;
  ndpaSection: string;
  pass: boolean;
}

const PRIORITY_ORDER: RecommendationPriority[] = ['critical', 'high', 'medium', 'low'];

function monthsDiff(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60 * 24 * 30.44);
}

function scoreChecks(checks: CheckDefinition[]): number {
  if (checks.length === 0) return 100;
  const passed = checks.filter(c => c.pass).length;
  return Math.round((passed / checks.length) * 100);
}

// ─── Module evaluators ────────────────────────────────────────────────────────

function evaluateConsent(input: ComplianceInput['consent']): CheckDefinition[] {
  return [
    {
      key: 'hasConsentMechanism',
      label: 'Consent collection mechanism',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Implement a clear, affirmative consent collection mechanism before processing personal data.',
      ndpaSection: 'Section 25',
      pass: input.hasConsentMechanism,
    },
    {
      key: 'hasPurposeSpecification',
      label: 'Purpose specification at collection',
      priority: 'critical',
      effort: 'medium',
      recommendation: 'Specify and communicate the purpose of data collection at the point of consent.',
      ndpaSection: 'Section 25',
      pass: input.hasPurposeSpecification,
    },
    {
      key: 'hasWithdrawalMechanism',
      label: 'Consent withdrawal mechanism',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Provide a simple mechanism for data subjects to withdraw consent at any time.',
      ndpaSection: 'Section 26',
      pass: input.hasWithdrawalMechanism,
    },
    {
      key: 'hasMinorProtection',
      label: 'Minor (child) data protection controls',
      priority: 'high',
      effort: 'high',
      recommendation: 'Implement age-verification and parental-consent controls for processing data of minors.',
      ndpaSection: 'Section 26',
      pass: input.hasMinorProtection,
    },
    {
      key: 'consentRecordsRetained',
      label: 'Consent records retained',
      priority: 'medium',
      effort: 'low',
      recommendation: 'Retain records of all consents obtained, including what was agreed to and when.',
      ndpaSection: 'Section 25',
      pass: input.consentRecordsRetained,
    },
  ];
}

function evaluateDSR(input: ComplianceInput['dsr']): CheckDefinition[] {
  const timelineOk = input.responseTimelineDays <= 30;
  return [
    {
      key: 'hasRequestMechanism',
      label: 'DSR submission mechanism',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Implement a formal channel (e.g. a web form or email address) for data subjects to submit requests.',
      ndpaSection: 'Section 34',
      pass: input.hasRequestMechanism,
    },
    {
      key: 'supportsAccess',
      label: 'Right of access supported',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Enable data subjects to request and receive a copy of their personal data.',
      ndpaSection: 'Section 34',
      pass: input.supportsAccess,
    },
    {
      key: 'supportsRectification',
      label: 'Right to rectification supported',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Allow data subjects to request correction of inaccurate or incomplete personal data.',
      ndpaSection: 'Section 35',
      pass: input.supportsRectification,
    },
    {
      key: 'supportsErasure',
      label: 'Right to erasure supported',
      priority: 'high',
      effort: 'high',
      recommendation: 'Implement processes to delete personal data upon valid erasure requests.',
      ndpaSection: 'Section 36',
      pass: input.supportsErasure,
    },
    {
      key: 'supportsPortability',
      label: 'Right to data portability supported',
      priority: 'medium',
      effort: 'high',
      recommendation: 'Provide personal data in a structured, machine-readable format upon request.',
      ndpaSection: 'Section 37',
      pass: input.supportsPortability,
    },
    {
      key: 'supportsObjection',
      label: 'Right to object supported',
      priority: 'medium',
      effort: 'medium',
      recommendation: 'Honour objections to processing where no compelling legitimate grounds override the data subject\'s interests.',
      ndpaSection: 'Section 38',
      pass: input.supportsObjection,
    },
    {
      key: 'responseTimeline',
      label: 'DSR response within 30 days',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Reduce DSR response time to 30 days or less as required by the NDPA.',
      ndpaSection: 'Section 39',
      pass: timelineOk,
    },
  ];
}

function evaluateDPIA(input: ComplianceInput['dpia']): CheckDefinition[] {
  return [
    {
      key: 'conductedForHighRisk',
      label: 'DPIA conducted for high-risk processing',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Conduct a Data Protection Impact Assessment before undertaking high-risk processing activities.',
      ndpaSection: 'Section 28',
      pass: input.conductedForHighRisk,
    },
    {
      key: 'documentedRisks',
      label: 'Risks documented in DPIA',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Document identified risks to data subjects\' rights and freedoms within the DPIA.',
      ndpaSection: 'Section 28',
      pass: input.documentedRisks,
    },
    {
      key: 'mitigationMeasures',
      label: 'Mitigation measures documented',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Document mitigation measures and residual risk acceptance within the DPIA.',
      ndpaSection: 'Section 28',
      pass: input.mitigationMeasures,
    },
  ];
}

function evaluateBreach(input: ComplianceInput['breach']): CheckDefinition[] {
  return [
    {
      key: 'hasNotificationProcess',
      label: 'Breach notification process in place',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Establish a documented breach notification process covering detection, assessment, and reporting.',
      ndpaSection: 'Section 40',
      pass: input.hasNotificationProcess,
    },
    {
      key: 'notifiesWithin72Hours',
      label: 'NDPC notified within 72 hours',
      priority: 'critical',
      effort: 'medium',
      recommendation: 'Ensure the NDPC is notified of qualifying breaches within 72 hours of discovery.',
      ndpaSection: 'Section 40',
      pass: input.notifiesWithin72Hours,
    },
    {
      key: 'hasRiskAssessment',
      label: 'Breach risk assessment performed',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Perform a risk assessment for every identified breach to determine notification obligations.',
      ndpaSection: 'Section 40',
      pass: input.hasRiskAssessment,
    },
    {
      key: 'hasRecordKeeping',
      label: 'Breach records maintained',
      priority: 'medium',
      effort: 'low',
      recommendation: 'Maintain a breach register documenting all incidents, assessments, and actions taken.',
      ndpaSection: 'Section 40',
      pass: input.hasRecordKeeping,
    },
  ];
}

function evaluatePolicy(input: ComplianceInput['policy']): CheckDefinition[] {
  const policyAge = monthsDiff(input.lastUpdated);
  const policyUpToDate = policyAge <= 13;
  return [
    {
      key: 'hasPrivacyPolicy',
      label: 'Privacy policy exists',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Draft and publish a comprehensive privacy policy that satisfies NDPA requirements.',
      ndpaSection: 'Section 29',
      pass: input.hasPrivacyPolicy,
    },
    {
      key: 'isPubliclyAccessible',
      label: 'Privacy policy publicly accessible',
      priority: 'high',
      effort: 'low',
      recommendation: 'Make the privacy policy easily accessible to data subjects on your website or app.',
      ndpaSection: 'Section 29',
      pass: input.isPubliclyAccessible,
    },
    {
      key: 'policyUpToDate',
      label: 'Privacy policy reviewed within 13 months',
      priority: 'medium',
      effort: 'medium',
      recommendation: 'Review and update the privacy policy at least annually to reflect current practices.',
      ndpaSection: 'Section 29',
      pass: policyUpToDate,
    },
    {
      key: 'coversAllSections',
      label: 'Privacy policy covers all required sections',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Ensure the privacy policy addresses all NDPA-mandated disclosures including lawful basis, retention, and subject rights.',
      ndpaSection: 'Section 29',
      pass: input.coversAllSections,
    },
  ];
}

function evaluateLawfulBasis(input: ComplianceInput['lawfulBasis']): CheckDefinition[] {
  return [
    {
      key: 'documentedForAllProcessing',
      label: 'Lawful basis documented for all processing',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Identify and document a valid lawful basis for every processing activity before it begins.',
      ndpaSection: 'Section 25(1)',
      pass: input.documentedForAllProcessing,
    },
    {
      key: 'hasLegitimateInterestAssessment',
      label: 'Legitimate interest assessment completed',
      priority: 'medium',
      effort: 'medium',
      recommendation: 'Complete a Legitimate Interest Assessment (LIA) where legitimate interests is the chosen lawful basis.',
      ndpaSection: 'Section 25(1)',
      pass: input.hasLegitimateInterestAssessment,
    },
  ];
}

function evaluateCrossBorder(input: ComplianceInput['crossBorder']): CheckDefinition[] {
  return [
    {
      key: 'hasTransferMechanisms',
      label: 'Transfer mechanisms in place',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Implement appropriate transfer mechanisms (SCCs, BCRs, or adequacy decisions) for all cross-border transfers.',
      ndpaSection: 'Section 43',
      pass: input.hasTransferMechanisms,
    },
    {
      key: 'adequacyAssessed',
      label: 'Adequacy of destination country assessed',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Assess whether the destination country provides an adequate level of data protection before transferring.',
      ndpaSection: 'Section 43',
      pass: input.adequacyAssessed,
    },
    {
      key: 'ndpcApprovalObtained',
      label: 'NDPC approval obtained where required',
      priority: 'high',
      effort: 'high',
      recommendation: 'Obtain NDPC approval for transfers to countries without adequacy decisions where required.',
      ndpaSection: 'Section 44',
      pass: input.ndpcApprovalObtained,
    },
  ];
}

function evaluateROPA(input: ComplianceInput['ropa']): CheckDefinition[] {
  const reviewAge = monthsDiff(input.lastReviewed);
  const ropaUpToDate = reviewAge <= 6;
  return [
    {
      key: 'maintained',
      label: 'Record of Processing Activities maintained',
      priority: 'critical',
      effort: 'high',
      recommendation: 'Create and maintain a comprehensive Record of Processing Activities (ROPA) as required by the NDPA.',
      ndpaSection: 'Section 30',
      pass: input.maintained,
    },
    {
      key: 'includesAllProcessing',
      label: 'ROPA includes all processing activities',
      priority: 'high',
      effort: 'medium',
      recommendation: 'Ensure the ROPA captures every processing activity across all departments and systems.',
      ndpaSection: 'Section 30',
      pass: input.includesAllProcessing,
    },
    {
      key: 'ropaUpToDate',
      label: 'ROPA reviewed within 6 months',
      priority: 'medium',
      effort: 'low',
      recommendation: 'Review and update the ROPA at least every six months to reflect changes in processing activities.',
      ndpaSection: 'Section 30',
      pass: ropaUpToDate,
    },
  ];
}

// ─── Module configuration ─────────────────────────────────────────────────────

interface ModuleConfig {
  name: string;
  weight: number;
  ndpaSections: string[];
  evaluate: (input: ComplianceInput) => CheckDefinition[];
}

const MODULE_CONFIGS: ModuleConfig[] = [
  {
    name: 'consent',
    weight: 0.20,
    ndpaSections: ['Section 25', 'Section 26'],
    evaluate: (i) => evaluateConsent(i.consent),
  },
  {
    name: 'dsr',
    weight: 0.15,
    ndpaSections: ['Section 34', 'Section 35', 'Section 36', 'Section 37', 'Section 38', 'Section 39'],
    evaluate: (i) => evaluateDSR(i.dsr),
  },
  {
    name: 'breach',
    weight: 0.15,
    ndpaSections: ['Section 40'],
    evaluate: (i) => evaluateBreach(i.breach),
  },
  {
    name: 'policy',
    weight: 0.12,
    ndpaSections: ['Section 29'],
    evaluate: (i) => evaluatePolicy(i.policy),
  },
  {
    name: 'dpia',
    weight: 0.12,
    ndpaSections: ['Section 28'],
    evaluate: (i) => evaluateDPIA(i.dpia),
  },
  {
    name: 'lawfulBasis',
    weight: 0.10,
    ndpaSections: ['Section 25(1)'],
    evaluate: (i) => evaluateLawfulBasis(i.lawfulBasis),
  },
  {
    name: 'crossBorder',
    weight: 0.08,
    ndpaSections: ['Section 43', 'Section 44'],
    evaluate: (i) => evaluateCrossBorder(i.crossBorder),
  },
  {
    name: 'ropa',
    weight: 0.08,
    ndpaSections: ['Section 30'],
    evaluate: (i) => evaluateROPA(i.ropa),
  },
];

// ─── Rating helper ────────────────────────────────────────────────────────────

function toRating(score: number): ComplianceRating {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 40) return 'needs-work';
  return 'critical';
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Evaluate an organisation's NDPA compliance across all modules.
 *
 * @param input - Compliance input object
 * @returns ComplianceReport with overall score, per-module breakdown, and sorted recommendations
 */
export function getComplianceScore(input: ComplianceInput): ComplianceReport {
  const modules: Record<string, ModuleScore> = {};
  const recommendations: Recommendation[] = [];

  let totalWeightedScore = 0;

  for (const config of MODULE_CONFIGS) {
    const checks = config.evaluate(input);
    const rawScore = scoreChecks(checks);
    const weightedScore = rawScore * config.weight;
    totalWeightedScore += weightedScore;

    const gaps: string[] = [];

    for (const check of checks) {
      if (!check.pass) {
        gaps.push(check.label);
        recommendations.push({
          module: config.name,
          key: check.key,
          label: check.label,
          priority: check.priority,
          effort: check.effort,
          recommendation: check.recommendation,
          ndpaSection: check.ndpaSection,
        });
      }
    }

    modules[config.name] = {
      name: config.name,
      score: rawScore,
      maxScore: 100,
      weightedScore: Math.round(weightedScore * 100) / 100,
      ndpaSections: config.ndpaSections,
      gaps,
    };
  }

  // Sort recommendations: critical → high → medium → low
  recommendations.sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  const overallScore = Math.round(totalWeightedScore);

  const regulatoryReferences: RegulatoryReference[] = [
    { section: 'Section 25', title: 'Consent and lawful basis for processing' },
    { section: 'Section 26', title: 'Withdrawal of consent and minor protection' },
    { section: 'Section 28', title: 'Data Protection Impact Assessment' },
    { section: 'Section 29', title: 'Privacy notice requirements' },
    { section: 'Section 30', title: 'Records of processing activities' },
    { section: 'Section 34', title: 'Right of access' },
    { section: 'Section 35', title: 'Right to rectification' },
    { section: 'Section 36', title: 'Right to erasure' },
    { section: 'Section 37', title: 'Right to data portability' },
    { section: 'Section 38', title: 'Right to object' },
    { section: 'Section 39', title: 'Response timelines for data subject requests' },
    { section: 'Section 40', title: 'Data breach notification' },
    { section: 'Section 43', title: 'Cross-border transfer restrictions' },
    { section: 'Section 44', title: 'NDPC approval for cross-border transfers' },
  ];

  return {
    score: overallScore,
    rating: toRating(overallScore),
    modules,
    recommendations,
    regulatoryReferences,
    generatedAt: new Date().toISOString(),
  };
}
