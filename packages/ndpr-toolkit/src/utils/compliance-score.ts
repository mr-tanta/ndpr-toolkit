/**
 * Compliance Score Engine
 *
 * Evaluates an organisation's NDPA compliance posture across eight modules and
 * returns a scored, rated report with per-module breakdowns, sorted
 * recommendations, and the ruleset provenance needed to reproduce the result.
 *
 * Pure utility — zero React dependency. This is an implementation-readiness
 * aid, not a legal determination.
 */

export type ComplianceRating = 'excellent' | 'good' | 'needs-work' | 'critical';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type EffortLevel = 'low' | 'medium' | 'high';
export type ComplianceModuleName =
  | 'consent'
  | 'dsr'
  | 'breach'
  | 'policy'
  | 'dpia'
  | 'lawfulBasis'
  | 'crossBorder'
  | 'ropa';

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
  name: string;
  score: number;
  maxScore: number;
  weightedScore: number;
  ndpaSections: string[];
  gaps: string[];
  /** Whether this module contributed to the overall score. */
  applicable: boolean;
  /** Number of checks included in this module's denominator. */
  applicableChecks: number;
  /** Check keys explicitly excluded as not applicable. */
  notApplicableChecks: string[];
}

export interface ComplianceRuleset {
  /** Stable machine identifier for the legal/implementation assumptions. */
  id: string;
  /** Human-readable, caller-pinnable ruleset version. */
  version: string;
  /** Date on which this baseline took effect. */
  effectiveDate: string;
  moduleWeights: Record<ComplianceModuleName, number>;
  timelines: {
    dsrResponseDays: number;
    policyReviewMonths: number;
    ropaReviewMonths: number;
  };
}

export interface ComplianceRulesetOverrides {
  id?: string;
  version?: string;
  effectiveDate?: string;
  moduleWeights?: Partial<Record<ComplianceModuleName, number>>;
  timelines?: Partial<ComplianceRuleset['timelines']>;
}

/**
 * A module can be disabled entirely with `false`, or individual check keys can
 * be marked not applicable. Unmentioned modules/checks remain applicable.
 */
export type ComplianceApplicability = Partial<
  Record<ComplianceModuleName, boolean | Record<string, boolean>>
>;

export interface ComplianceScoreOptions {
  /** Reproducible evaluation instant. Defaults to the current time. */
  asOf?: string | number | Date;
  /** Overrides for organisations that pin a reviewed legal ruleset. */
  ruleset?: ComplianceRulesetOverrides;
  /** Explicit not-applicable decisions; skipped checks are retained in output. */
  applicability?: ComplianceApplicability;
}

export interface ComplianceProvenance {
  rulesetId: string;
  rulesetVersion: string;
  rulesetEffectiveDate: string;
  asOf: string;
  moduleWeights: Record<ComplianceModuleName, number>;
  timelines: ComplianceRuleset['timelines'];
}

export interface ComplianceReport {
  score: number;
  rating: ComplianceRating;
  modules: Record<string, ModuleScore>;
  recommendations: Recommendation[];
  regulatoryReferences: RegulatoryReference[];
  generatedAt: string;
  /** Complete scoring assumptions required to reproduce the result. */
  provenance: ComplianceProvenance;
  /** Prominent scope warning for downstream reports and dashboards. */
  advisoryNotice: string;
}

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
    lastReviewed: string;
  };
}

interface CheckDefinition {
  key: string;
  label: string;
  priority: RecommendationPriority;
  effort: EffortLevel;
  recommendation: string;
  ndpaSection: string;
  pass: boolean;
}

interface ModuleConfig {
  name: ComplianceModuleName;
  ndpaSections: string[];
  evaluate: (input: ComplianceInput, ruleset: ComplianceRuleset, asOf: Date) => CheckDefinition[];
}

const PRIORITY_ORDER: RecommendationPriority[] = ['critical', 'high', 'medium', 'low'];
const MODULE_NAMES: ComplianceModuleName[] = [
  'consent', 'dsr', 'breach', 'policy', 'dpia', 'lawfulBasis', 'crossBorder', 'ropa',
];

/** Reviewed implementation baseline. Override and pin it when legal guidance changes. */
export const DEFAULT_COMPLIANCE_RULESET: ComplianceRuleset = {
  id: 'ndpa-2023-gaid-2025-readiness',
  version: '2026.07',
  effectiveDate: '2026-07-01',
  moduleWeights: {
    consent: 0.20,
    dsr: 0.15,
    breach: 0.15,
    policy: 0.12,
    dpia: 0.12,
    lawfulBasis: 0.10,
    crossBorder: 0.08,
    ropa: 0.08,
  },
  timelines: {
    dsrResponseDays: 30,
    policyReviewMonths: 13,
    ropaReviewMonths: 6,
  },
};

function resolveRuleset(overrides: ComplianceRulesetOverrides = {}): ComplianceRuleset {
  const ruleset: ComplianceRuleset = {
    ...DEFAULT_COMPLIANCE_RULESET,
    ...overrides,
    moduleWeights: {
      ...DEFAULT_COMPLIANCE_RULESET.moduleWeights,
      ...overrides.moduleWeights,
    },
    timelines: {
      ...DEFAULT_COMPLIANCE_RULESET.timelines,
      ...overrides.timelines,
    },
  };

  for (const moduleName of MODULE_NAMES) {
    const weight = ruleset.moduleWeights[moduleName];
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`ruleset.moduleWeights.${moduleName} must be a non-negative number.`);
    }
  }
  const totalWeight = Object.values(ruleset.moduleWeights).reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) throw new RangeError('At least one module weight must be greater than zero.');

  for (const [key, value] of Object.entries(ruleset.timelines)) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`ruleset.timelines.${key} must be a positive number.`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ruleset.effectiveDate)) {
    throw new RangeError('ruleset.effectiveDate must use YYYY-MM-DD format.');
  }
  return ruleset;
}

function resolveAsOf(value: ComplianceScoreOptions['asOf']): Date {
  const date = value === undefined ? new Date() : value instanceof Date ? new Date(value) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new RangeError('asOf must be a valid date or epoch timestamp.');
  return date;
}

function monthsDiff(dateStr: string, asOf: Date): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return Infinity;
  const then = new Date(`${dateStr}T00:00:00.000Z`);
  if (!Number.isFinite(then.getTime()) || then.getTime() > asOf.getTime()) return Infinity;
  return (asOf.getTime() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

function isApplicable(
  applicability: ComplianceApplicability | undefined,
  moduleName: ComplianceModuleName,
  key: string,
): boolean {
  const decision = applicability?.[moduleName];
  if (decision === false) return false;
  if (decision === true || decision === undefined) return true;
  return decision[key] !== false;
}

function evaluateConsent(input: ComplianceInput['consent']): CheckDefinition[] {
  return [
    { key: 'hasConsentMechanism', label: 'Consent collection mechanism', priority: 'critical', effort: 'high', recommendation: 'Implement a clear, affirmative consent collection mechanism before processing personal data.', ndpaSection: 'Section 25', pass: input.hasConsentMechanism },
    { key: 'hasPurposeSpecification', label: 'Purpose specification at collection', priority: 'critical', effort: 'medium', recommendation: 'Specify and communicate the purpose of data collection at the point of consent.', ndpaSection: 'Section 25', pass: input.hasPurposeSpecification },
    { key: 'hasWithdrawalMechanism', label: 'Consent withdrawal mechanism', priority: 'high', effort: 'medium', recommendation: 'Provide a simple mechanism for data subjects to withdraw consent at any time.', ndpaSection: 'Section 26', pass: input.hasWithdrawalMechanism },
    { key: 'hasMinorProtection', label: 'Minor (child) data protection controls', priority: 'high', effort: 'high', recommendation: 'Implement age-verification and parental-consent controls where the organisation processes data of minors.', ndpaSection: 'Section 31', pass: input.hasMinorProtection },
    { key: 'consentRecordsRetained', label: 'Consent records retained', priority: 'medium', effort: 'low', recommendation: 'Retain records of all consents obtained, including what was agreed to and when.', ndpaSection: 'Section 25', pass: input.consentRecordsRetained },
  ];
}

function evaluateDSR(input: ComplianceInput['dsr'], ruleset: ComplianceRuleset): CheckDefinition[] {
  const maxDays = ruleset.timelines.dsrResponseDays;
  return [
    { key: 'hasRequestMechanism', label: 'DSR submission mechanism', priority: 'critical', effort: 'high', recommendation: 'Implement a formal channel for data subjects to submit requests.', ndpaSection: 'Section 34', pass: input.hasRequestMechanism },
    { key: 'supportsAccess', label: 'Right of access supported', priority: 'high', effort: 'medium', recommendation: 'Enable data subjects to request and receive a copy of their personal data.', ndpaSection: 'Section 34(1)(a)–(b)', pass: input.supportsAccess },
    { key: 'supportsRectification', label: 'Right to rectification supported', priority: 'high', effort: 'medium', recommendation: 'Allow data subjects to request correction of inaccurate or incomplete personal data.', ndpaSection: 'Section 34(1)(c)', pass: input.supportsRectification },
    { key: 'supportsErasure', label: 'Right to erasure supported', priority: 'high', effort: 'high', recommendation: 'Implement processes to delete personal data upon valid erasure requests.', ndpaSection: 'Section 34(1)(d), Section 34(2)', pass: input.supportsErasure },
    { key: 'supportsPortability', label: 'Right to data portability supported', priority: 'medium', effort: 'high', recommendation: 'Provide personal data in a structured, machine-readable format upon request.', ndpaSection: 'Section 38', pass: input.supportsPortability },
    { key: 'supportsObjection', label: 'Right to object supported', priority: 'medium', effort: 'medium', recommendation: "Honour objections to processing where no compelling legitimate grounds override the data subject's interests.", ndpaSection: 'Section 36', pass: input.supportsObjection },
    { key: 'responseTimeline', label: `DSR response within ${maxDays} days`, priority: 'high', effort: 'medium', recommendation: `Reduce DSR response time to ${maxDays} days or less under the pinned ruleset.`, ndpaSection: 'Section 34 (NDPC timeline guidance)', pass: Number.isFinite(input.responseTimelineDays) && input.responseTimelineDays >= 0 && input.responseTimelineDays <= maxDays },
  ];
}

function evaluateDPIA(input: ComplianceInput['dpia']): CheckDefinition[] {
  return [
    { key: 'conductedForHighRisk', label: 'DPIA conducted for high-risk processing', priority: 'critical', effort: 'high', recommendation: 'Conduct a Data Protection Impact Assessment before undertaking applicable high-risk processing activities.', ndpaSection: 'Section 28', pass: input.conductedForHighRisk },
    { key: 'documentedRisks', label: 'Risks documented in DPIA', priority: 'high', effort: 'medium', recommendation: "Document identified risks to data subjects' rights and freedoms within the DPIA.", ndpaSection: 'Section 28', pass: input.documentedRisks },
    { key: 'mitigationMeasures', label: 'Mitigation measures documented', priority: 'high', effort: 'medium', recommendation: 'Document mitigation measures and residual risk acceptance within the DPIA.', ndpaSection: 'Section 28', pass: input.mitigationMeasures },
  ];
}

function evaluateBreach(input: ComplianceInput['breach']): CheckDefinition[] {
  return [
    { key: 'hasNotificationProcess', label: 'Breach notification process in place', priority: 'critical', effort: 'high', recommendation: 'Establish a documented breach notification process covering detection, assessment, and reporting.', ndpaSection: 'Section 40', pass: input.hasNotificationProcess },
    { key: 'notifiesWithin72Hours', label: 'NDPC notified within 72 hours', priority: 'critical', effort: 'medium', recommendation: 'Ensure the NDPC is notified of qualifying breaches within 72 hours of discovery.', ndpaSection: 'Section 40', pass: input.notifiesWithin72Hours },
    { key: 'hasRiskAssessment', label: 'Breach risk assessment performed', priority: 'high', effort: 'medium', recommendation: 'Perform a risk assessment for every identified breach to determine notification obligations.', ndpaSection: 'Section 40', pass: input.hasRiskAssessment },
    { key: 'hasRecordKeeping', label: 'Breach records maintained', priority: 'medium', effort: 'low', recommendation: 'Maintain a breach register documenting all incidents, assessments, and actions taken.', ndpaSection: 'Section 40', pass: input.hasRecordKeeping },
  ];
}

function evaluatePolicy(input: ComplianceInput['policy'], ruleset: ComplianceRuleset, asOf: Date): CheckDefinition[] {
  const months = ruleset.timelines.policyReviewMonths;
  return [
    { key: 'hasPrivacyPolicy', label: 'Privacy policy exists', priority: 'critical', effort: 'high', recommendation: 'Draft and publish a comprehensive privacy policy that satisfies applicable NDPA requirements.', ndpaSection: 'Section 27', pass: input.hasPrivacyPolicy },
    { key: 'isPubliclyAccessible', label: 'Privacy policy publicly accessible', priority: 'high', effort: 'low', recommendation: 'Make the privacy policy easily accessible to data subjects.', ndpaSection: 'Section 27', pass: input.isPubliclyAccessible },
    { key: 'policyUpToDate', label: `Privacy policy reviewed within ${months} months`, priority: 'medium', effort: 'medium', recommendation: `Review the privacy policy within the pinned ${months}-month review interval. Future or invalid review dates do not satisfy this check.`, ndpaSection: 'Section 27', pass: monthsDiff(input.lastUpdated, asOf) <= months },
    { key: 'coversAllSections', label: 'Privacy policy covers all required sections', priority: 'high', effort: 'medium', recommendation: 'Ensure the privacy policy addresses applicable disclosures including lawful basis, retention, and subject rights.', ndpaSection: 'Section 27', pass: input.coversAllSections },
  ];
}

function evaluateLawfulBasis(input: ComplianceInput['lawfulBasis']): CheckDefinition[] {
  return [
    { key: 'documentedForAllProcessing', label: 'Lawful basis documented for all processing', priority: 'critical', effort: 'high', recommendation: 'Identify and document a valid lawful basis for every processing activity before it begins.', ndpaSection: 'Section 25(1)', pass: input.documentedForAllProcessing },
    { key: 'hasLegitimateInterestAssessment', label: 'Legitimate interest assessment completed', priority: 'medium', effort: 'medium', recommendation: 'Complete a Legitimate Interest Assessment where legitimate interests is the chosen lawful basis, or mark this check not applicable.', ndpaSection: 'Section 25(1)', pass: input.hasLegitimateInterestAssessment },
  ];
}

function evaluateCrossBorder(input: ComplianceInput['crossBorder']): CheckDefinition[] {
  return [
    { key: 'hasTransferMechanisms', label: 'Transfer mechanisms in place', priority: 'critical', effort: 'high', recommendation: 'Implement appropriate mechanisms for applicable cross-border transfers, or mark this check not applicable.', ndpaSection: 'Section 41', pass: input.hasTransferMechanisms },
    { key: 'adequacyAssessed', label: 'Adequacy of destination country assessed', priority: 'high', effort: 'medium', recommendation: 'Assess whether each destination provides an adequate level of data protection.', ndpaSection: 'Section 42', pass: input.adequacyAssessed },
    { key: 'ndpcApprovalObtained', label: 'NDPC approval obtained where required', priority: 'high', effort: 'high', recommendation: 'Obtain NDPC approval where the selected transfer mechanism requires it, or mark this check not applicable.', ndpaSection: 'Section 42(5)', pass: input.ndpcApprovalObtained },
  ];
}

function evaluateROPA(input: ComplianceInput['ropa'], ruleset: ComplianceRuleset, asOf: Date): CheckDefinition[] {
  const months = ruleset.timelines.ropaReviewMonths;
  return [
    { key: 'maintained', label: 'Record of Processing Activities maintained', priority: 'critical', effort: 'high', recommendation: 'Create and maintain a comprehensive Record of Processing Activities.', ndpaSection: 'Section 29', pass: input.maintained },
    { key: 'includesAllProcessing', label: 'ROPA includes all processing activities', priority: 'high', effort: 'medium', recommendation: 'Ensure the ROPA captures every processing activity across departments and systems.', ndpaSection: 'Section 29', pass: input.includesAllProcessing },
    { key: 'ropaUpToDate', label: `ROPA reviewed within ${months} months`, priority: 'medium', effort: 'low', recommendation: `Review the ROPA within the pinned ${months}-month review interval. Future or invalid review dates do not satisfy this check.`, ndpaSection: 'Section 29', pass: monthsDiff(input.lastReviewed, asOf) <= months },
  ];
}

const MODULE_CONFIGS: ModuleConfig[] = [
  { name: 'consent', ndpaSections: ['Section 25', 'Section 26'], evaluate: (i) => evaluateConsent(i.consent) },
  { name: 'dsr', ndpaSections: ['Section 34', 'Section 35', 'Section 36', 'Section 37', 'Section 38'], evaluate: (i, r) => evaluateDSR(i.dsr, r) },
  { name: 'breach', ndpaSections: ['Section 40'], evaluate: (i) => evaluateBreach(i.breach) },
  { name: 'policy', ndpaSections: ['Section 27'], evaluate: (i, r, a) => evaluatePolicy(i.policy, r, a) },
  { name: 'dpia', ndpaSections: ['Section 28'], evaluate: (i) => evaluateDPIA(i.dpia) },
  { name: 'lawfulBasis', ndpaSections: ['Section 25(1)'], evaluate: (i) => evaluateLawfulBasis(i.lawfulBasis) },
  { name: 'crossBorder', ndpaSections: ['Section 41', 'Section 42', 'Section 43'], evaluate: (i) => evaluateCrossBorder(i.crossBorder) },
  { name: 'ropa', ndpaSections: ['Section 29'], evaluate: (i, r, a) => evaluateROPA(i.ropa, r, a) },
];

function toRating(score: number): ComplianceRating {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 40) return 'needs-work';
  return 'critical';
}

export function getComplianceScore(
  input: ComplianceInput,
  options: ComplianceScoreOptions = {},
): ComplianceReport {
  const ruleset = resolveRuleset(options.ruleset);
  const asOf = resolveAsOf(options.asOf);
  const modules: Record<string, ModuleScore> = {};
  const recommendations: Recommendation[] = [];
  const evaluated = MODULE_CONFIGS.map((config) => {
    const checks = config.evaluate(input, ruleset, asOf);
    const applicableChecks = checks.filter((check) => isApplicable(options.applicability, config.name, check.key));
    const notApplicableChecks = checks.filter((check) => !isApplicable(options.applicability, config.name, check.key));
    const score = applicableChecks.length === 0
      ? 100
      : Math.round((applicableChecks.filter((check) => check.pass).length / applicableChecks.length) * 100);
    return { config, applicableChecks, notApplicableChecks, score };
  });

  const activeWeight = evaluated.reduce(
    (sum, item) => sum + (item.applicableChecks.length > 0 ? ruleset.moduleWeights[item.config.name] : 0),
    0,
  );
  let totalWeightedScore = 0;

  for (const item of evaluated) {
    const { config, applicableChecks, notApplicableChecks, score } = item;
    const normalizedWeight = activeWeight > 0 && applicableChecks.length > 0
      ? ruleset.moduleWeights[config.name] / activeWeight
      : 0;
    const weightedScore = score * normalizedWeight;
    totalWeightedScore += weightedScore;

    const gaps: string[] = [];
    for (const check of applicableChecks) {
      if (check.pass) continue;
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

    modules[config.name] = {
      name: config.name,
      score,
      maxScore: 100,
      weightedScore: Math.round(weightedScore * 100) / 100,
      ndpaSections: config.ndpaSections,
      gaps,
      applicable: applicableChecks.length > 0,
      applicableChecks: applicableChecks.length,
      notApplicableChecks: notApplicableChecks.map((check) => check.key),
    };
  }

  recommendations.sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  );

  const score = activeWeight === 0 ? 100 : Math.round(totalWeightedScore);
  const regulatoryReferences: RegulatoryReference[] = [
    { section: 'Section 25', title: 'Consent and lawful basis for processing' },
    { section: 'Section 26', title: 'Consent' },
    { section: 'Section 27', title: 'Privacy notice requirements' },
    { section: 'Section 28', title: 'Data Protection Impact Assessment' },
    { section: 'Section 29', title: 'Records of processing activities' },
    { section: 'Sections 34–38', title: 'Data subject rights' },
    { section: 'Section 40', title: 'Data breach notification' },
    { section: 'Sections 41–43', title: 'Cross-border transfers' },
  ];

  return {
    score,
    rating: toRating(score),
    modules,
    recommendations,
    regulatoryReferences,
    generatedAt: new Date().toISOString(),
    provenance: {
      rulesetId: ruleset.id,
      rulesetVersion: ruleset.version,
      rulesetEffectiveDate: ruleset.effectiveDate,
      asOf: asOf.toISOString(),
      moduleWeights: { ...ruleset.moduleWeights },
      timelines: { ...ruleset.timelines },
    },
    advisoryNotice: 'Implementation-readiness score only; verify applicability, evidence, and current NDPC guidance with qualified advisers.',
  };
}
