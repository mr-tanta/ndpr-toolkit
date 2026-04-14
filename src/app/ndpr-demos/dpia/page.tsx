'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { DemoLayout } from '@/components/site/DemoLayout';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectDetails {
  name: string;
  description: string;
  dataTypes: string[];
  processingPurpose: string;
}

interface RiskAnswer {
  questionId: string;
  value: 'low' | 'medium' | 'high';
}

interface IdentifiedRisk {
  id: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  level: 'low' | 'medium' | 'high' | 'critical';
}

interface Mitigation {
  id: string;
  riskId: string;
  text: string;
  implemented: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DATA_TYPE_OPTIONS = [
  { id: 'basic', label: 'Basic personal information (name, email, phone)' },
  { id: 'identification', label: 'Government-issued identification (NIN, BVN, passport)' },
  { id: 'financial', label: 'Financial data (bank details, payment cards, income)' },
  { id: 'location', label: 'Location and geolocation data' },
  { id: 'health', label: 'Health and medical records' },
  { id: 'biometric', label: 'Biometric data (fingerprints, facial recognition)' },
  { id: 'children', label: "Children's personal data (under 18)" },
  { id: 'communications', label: 'Communication content (emails, messages, call logs)' },
  { id: 'behavioural', label: 'Behavioural and profiling data' },
];

const RISK_QUESTIONS = [
  {
    id: 'q1',
    question: 'How large is the population of data subjects affected?',
    guidance: 'Consider the total number of individuals whose data will be processed.',
    low: 'Under 1,000 individuals',
    medium: '1,000 to 100,000 individuals',
    high: 'Over 100,000 individuals',
  },
  {
    id: 'q2',
    question: 'Does the processing involve sensitive or special-category data?',
    guidance: 'E.g., health data, biometric data, political opinions, religious beliefs, data concerning children.',
    low: 'No sensitive data involved',
    medium: 'Limited sensitive data with strict access controls',
    high: 'Extensive sensitive data processing',
  },
  {
    id: 'q3',
    question: 'Is automated decision-making or profiling used?',
    guidance: 'This includes algorithms that make decisions without meaningful human involvement.',
    low: 'No automated decisions',
    medium: 'Automated decisions with human review',
    high: 'Fully automated decisions with legal or significant effects',
  },
  {
    id: 'q4',
    question: 'Will personal data be transferred outside Nigeria?',
    guidance: 'Consider whether data flows to countries that may lack adequate data protection.',
    low: 'No international transfers',
    medium: 'Transfers to countries with adequate protection',
    high: 'Transfers to countries without adequate protection',
  },
  {
    id: 'q5',
    question: 'How long will personal data be retained?',
    guidance: 'Longer retention increases risk exposure.',
    low: 'Less than 1 year with clear deletion policy',
    medium: '1 to 5 years with periodic review',
    high: 'Over 5 years or indefinite retention',
  },
  {
    id: 'q6',
    question: 'What is the level of data subject awareness and control?',
    guidance: 'Consider whether individuals understand and can control how their data is used.',
    low: 'Full transparency with consent mechanisms and data subject rights portal',
    medium: 'Privacy notice provided but limited self-service controls',
    high: 'Minimal or no transparency to data subjects',
  },
];

const RISK_VALUE_MAP: Record<string, number> = { low: 1, medium: 2, high: 3 };

function riskLevelFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 16) return 'high';
  return 'critical';
}

function riskColorClasses(level: string) {
  switch (level) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

function riskBorderColor(level: string) {
  switch (level) {
    case 'low': return 'border-emerald-300 dark:border-emerald-700';
    case 'medium': return 'border-amber-300 dark:border-amber-700';
    case 'high': return 'border-orange-300 dark:border-orange-700';
    case 'critical': return 'border-red-300 dark:border-red-700';
    default: return 'border-gray-300 dark:border-gray-700';
  }
}

function overallRiskLabel(level: string) {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'medium': return 'Medium Risk';
    case 'high': return 'High Risk';
    case 'critical': return 'Critical Risk';
    default: return 'Unknown';
  }
}

// Derive risks from answers
function deriveRisks(answers: RiskAnswer[], dataTypes: string[]): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  const q1 = answers.find((a) => a.questionId === 'q1');
  const q2 = answers.find((a) => a.questionId === 'q2');
  const q3 = answers.find((a) => a.questionId === 'q3');
  const q4 = answers.find((a) => a.questionId === 'q4');
  const q5 = answers.find((a) => a.questionId === 'q5');
  const q6 = answers.find((a) => a.questionId === 'q6');

  // Determine whether multiple high-risk factors compound each other
  const highRiskCount = [q1, q2, q3].filter(
    (a) => a && RISK_VALUE_MAP[a.value] === 3
  ).length;
  // When 2+ of scale/sensitivity/automation are all high, escalate the compound risk
  const compoundEscalation = highRiskCount >= 2 ? 1 : 0;

  if (q1 && RISK_VALUE_MAP[q1.value] >= 2) {
    const likelihood = RISK_VALUE_MAP[q1.value] + 1 + compoundEscalation;
    const impact = RISK_VALUE_MAP[q1.value] + 1;
    risks.push({
      id: 'r1',
      title: 'Large-scale data processing',
      description: 'Processing affects a significant number of data subjects, increasing the potential scope of harm if a breach or misuse occurs.',
      likelihood: Math.min(likelihood, 5),
      impact: Math.min(impact, 5),
      level: riskLevelFromScore(Math.min(likelihood, 5) * Math.min(impact, 5)),
    });
  }

  if (q2 && RISK_VALUE_MAP[q2.value] >= 2) {
    const likelihood = RISK_VALUE_MAP[q2.value] + compoundEscalation;
    const impact = RISK_VALUE_MAP[q2.value] + 2;
    risks.push({
      id: 'r2',
      title: 'Sensitive data exposure risk',
      description: 'Processing includes sensitive or special-category personal data which carries heightened risk to data subjects if compromised.',
      likelihood: Math.min(likelihood, 5),
      impact: Math.min(impact, 5),
      level: riskLevelFromScore(Math.min(likelihood, 5) * Math.min(impact, 5)),
    });
  }

  if (q3 && RISK_VALUE_MAP[q3.value] >= 2) {
    const likelihood = RISK_VALUE_MAP[q3.value] + 1;
    const impact = RISK_VALUE_MAP[q3.value] + 1 + compoundEscalation;
    risks.push({
      id: 'r3',
      title: 'Automated decision-making risk',
      description: 'Use of automated decision-making or profiling may produce unfair or discriminatory outcomes without adequate human oversight.',
      likelihood: Math.min(likelihood, 5),
      impact: Math.min(impact, 5),
      level: riskLevelFromScore(Math.min(likelihood, 5) * Math.min(impact, 5)),
    });
  }

  if (q4 && RISK_VALUE_MAP[q4.value] >= 2) {
    risks.push({
      id: 'r4',
      title: 'Cross-border transfer risk',
      description: 'Transfer of personal data outside Nigeria may expose it to jurisdictions with weaker protections, inconsistent with NDPA requirements.',
      likelihood: RISK_VALUE_MAP[q4.value],
      impact: RISK_VALUE_MAP[q4.value] + 1,
      level: riskLevelFromScore(RISK_VALUE_MAP[q4.value] * (RISK_VALUE_MAP[q4.value] + 1)),
    });
  }

  if (q5 && RISK_VALUE_MAP[q5.value] >= 2) {
    risks.push({
      id: 'r5',
      title: 'Excessive data retention',
      description: 'Retaining personal data beyond the necessary period increases the window of exposure and potential for unauthorized access.',
      likelihood: RISK_VALUE_MAP[q5.value] + 1,
      impact: RISK_VALUE_MAP[q5.value],
      level: riskLevelFromScore((RISK_VALUE_MAP[q5.value] + 1) * RISK_VALUE_MAP[q5.value]),
    });
  }

  if (q6 && RISK_VALUE_MAP[q6.value] >= 2) {
    risks.push({
      id: 'r6',
      title: 'Inadequate transparency',
      description: 'Insufficient transparency or control for data subjects undermines their ability to exercise rights under the NDPA.',
      likelihood: RISK_VALUE_MAP[q6.value],
      impact: RISK_VALUE_MAP[q6.value] + 1,
      level: riskLevelFromScore(RISK_VALUE_MAP[q6.value] * (RISK_VALUE_MAP[q6.value] + 1)),
    });
  }

  // Add a risk if biometric or children data is selected regardless
  const hasBiometric = dataTypes.includes('biometric');
  const hasChildren = dataTypes.includes('children');
  if (hasBiometric && !risks.find((r) => r.id === 'r2')) {
    risks.push({
      id: 'r7',
      title: 'Biometric data processing',
      description: 'Biometric data is irreplaceable and its compromise can cause irreversible harm to data subjects.',
      likelihood: 3,
      impact: 4,
      level: riskLevelFromScore(3 * 4),
    });
  }
  if (hasChildren && !risks.find((r) => r.id === 'r2')) {
    risks.push({
      id: 'r8',
      title: "Processing children's data",
      description: "Personal data of minors requires enhanced protection. Additional safeguards and parental consent are mandatory under the NDPA.",
      likelihood: 3,
      impact: 4,
      level: riskLevelFromScore(3 * 4),
    });
  }

  return risks;
}

// Derive mitigations from risks
function deriveMitigations(risks: IdentifiedRisk[]): Mitigation[] {
  const mitigationMap: Record<string, Mitigation[]> = {
    r1: [
      { id: 'm1a', riskId: 'r1', text: 'Implement data minimization to reduce the volume of personal data processed', implemented: false },
      { id: 'm1b', riskId: 'r1', text: 'Deploy pseudonymization or anonymization techniques where feasible', implemented: false },
      { id: 'm1c', riskId: 'r1', text: 'Establish comprehensive access control with role-based permissions', implemented: false },
    ],
    r2: [
      { id: 'm2a', riskId: 'r2', text: 'Apply encryption at rest and in transit for all sensitive data', implemented: false },
      { id: 'm2b', riskId: 'r2', text: 'Restrict access to sensitive data to authorized personnel only', implemented: false },
      { id: 'm2c', riskId: 'r2', text: 'Conduct regular security audits and vulnerability assessments', implemented: false },
    ],
    r3: [
      { id: 'm3a', riskId: 'r3', text: 'Implement meaningful human oversight for automated decisions', implemented: false },
      { id: 'm3b', riskId: 'r3', text: 'Provide data subjects with the right to contest automated decisions', implemented: false },
      { id: 'm3c', riskId: 'r3', text: 'Conduct regular bias and fairness audits on algorithms', implemented: false },
    ],
    r4: [
      { id: 'm4a', riskId: 'r4', text: 'Execute Standard Contractual Clauses with receiving parties', implemented: false },
      { id: 'm4b', riskId: 'r4', text: 'Obtain NDPC approval for transfers to countries without adequate protection', implemented: false },
      { id: 'm4c', riskId: 'r4', text: 'Conduct transfer impact assessments for each recipient jurisdiction', implemented: false },
    ],
    r5: [
      { id: 'm5a', riskId: 'r5', text: 'Define and enforce clear data retention schedules', implemented: false },
      { id: 'm5b', riskId: 'r5', text: 'Implement automated data deletion upon retention period expiry', implemented: false },
      { id: 'm5c', riskId: 'r5', text: 'Conduct periodic reviews to identify and purge unnecessary data', implemented: false },
    ],
    r6: [
      { id: 'm6a', riskId: 'r6', text: 'Publish a clear and accessible privacy notice', implemented: false },
      { id: 'm6b', riskId: 'r6', text: 'Provide a self-service portal for data subject rights requests', implemented: false },
      { id: 'm6c', riskId: 'r6', text: 'Implement granular consent mechanisms with easy withdrawal', implemented: false },
    ],
    r7: [
      { id: 'm7a', riskId: 'r7', text: 'Store biometric templates in encrypted, isolated environments', implemented: false },
      { id: 'm7b', riskId: 'r7', text: 'Implement liveness detection to prevent spoofing attacks', implemented: false },
      { id: 'm7c', riskId: 'r7', text: 'Obtain explicit consent before collecting biometric data', implemented: false },
    ],
    r8: [
      { id: 'm8a', riskId: 'r8', text: 'Implement verifiable parental/guardian consent mechanisms', implemented: false },
      { id: 'm8b', riskId: 'r8', text: 'Apply age-appropriate design principles to all interfaces', implemented: false },
      { id: 'm8c', riskId: 'r8', text: 'Minimize data collection for children to the absolute necessary', implemented: false },
    ],
  };

  const result: Mitigation[] = [];
  risks.forEach((risk) => {
    const m = mitigationMap[risk.id];
    if (m) result.push(...m);
  });
  return result;
}

// ---------------------------------------------------------------------------
// Step Indicator
// ---------------------------------------------------------------------------

const STEP_LABELS = ['Project Details', 'Risk Assessment', 'Mitigation', 'Report'];

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick?: (step: number) => void }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEP_LABELS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        const isClickable = isCompleted && !!onStepClick;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick!(stepNum)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold border-2 transition-all duration-300
                  ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                    : isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-600 hover:border-emerald-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }
                  ${!isClickable && !isActive ? 'cursor-default' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </button>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap hidden sm:block ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-3 mt-[-1rem] transition-colors duration-300 ${
                  stepNum < currentStep
                    ? 'bg-emerald-400 dark:bg-emerald-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Meter (animated bar)
// ---------------------------------------------------------------------------

function RiskMeter({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  let barColor = 'bg-emerald-500';
  if (pct > 75) barColor = 'bg-red-500';
  else if (pct > 50) barColor = 'bg-orange-500';
  else if (pct > 25) barColor = 'bg-amber-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Low</span>
        <span>Score: {value}/{max}</span>
        <span>Critical</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Matrix (5x5)
// ---------------------------------------------------------------------------

function RiskMatrix({ risks }: { risks: IdentifiedRisk[] }) {
  const matrixColors: Record<string, string> = {};
  // Precompute cell colors (likelihood x impact -> color)
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      const score = l * i;
      let color: string;
      if (score <= 4) color = 'bg-emerald-100 dark:bg-emerald-900/30';
      else if (score <= 9) color = 'bg-amber-100 dark:bg-amber-900/30';
      else if (score <= 16) color = 'bg-orange-100 dark:bg-orange-900/30';
      else color = 'bg-red-100 dark:bg-red-900/30';
      matrixColors[`${l}-${i}`] = color;
    }
  }

  const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Significant', 'Severe'];
  const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        <div className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Risk Matrix: Likelihood vs Impact
        </div>
        <div className="flex">
          {/* Y-axis label */}
          <div className="flex items-center mr-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 [writing-mode:vertical-rl] rotate-180">
              Likelihood
            </span>
          </div>

          <div className="flex-1">
            {/* Grid rows (likelihood 5 -> 1, top to bottom) */}
            {[5, 4, 3, 2, 1].map((likelihood) => (
              <div key={likelihood} className="flex items-center">
                <div className="w-20 text-right pr-2 text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  {likelihoodLabels[likelihood - 1]}
                </div>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const cellRisks = risks.filter(
                    (r) => r.likelihood === likelihood && r.impact === impact
                  );
                  return (
                    <div
                      key={`${likelihood}-${impact}`}
                      className={`relative flex-1 aspect-square border border-white dark:border-gray-800 rounded-sm ${matrixColors[`${likelihood}-${impact}`]} flex items-center justify-center`}
                    >
                      {cellRisks.map((r) => (
                        <div
                          key={r.id}
                          className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 border-2 border-white dark:border-gray-900 shadow-md"
                          title={r.title}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* X-axis labels */}
            <div className="flex items-center mt-1">
              <div className="w-20" />
              {impactLabels.map((label) => (
                <div key={label} className="flex-1 text-center text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  {label}
                </div>
              ))}
            </div>
            <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
              Impact
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center text-xs">
          {[
            { label: 'Low (1-4)', color: 'bg-emerald-200 dark:bg-emerald-800' },
            { label: 'Medium (5-9)', color: 'bg-amber-200 dark:bg-amber-800' },
            { label: 'High (10-16)', color: 'bg-orange-200 dark:bg-orange-800' },
            { label: 'Critical (17-25)', color: 'bg-red-200 dark:bg-red-800' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 border border-white dark:border-gray-700" />
            <span className="text-gray-600 dark:text-gray-400">Identified risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function DPIADemoPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: '',
    description: '',
    dataTypes: [],
    processingPurpose: '',
  });

  // Step 2
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswer[]>([]);

  // Step 3
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);

  // Derived state
  const identifiedRisks = useMemo(
    () => deriveRisks(riskAnswers, projectDetails.dataTypes),
    [riskAnswers, projectDetails.dataTypes]
  );

  const totalRiskScore = useMemo(() => {
    if (identifiedRisks.length === 0) return 0;
    return identifiedRisks.reduce((sum, r) => sum + r.likelihood * r.impact, 0);
  }, [identifiedRisks]);

  const maxPossibleScore = identifiedRisks.length * 25 || 1;

  const overallRiskLevel = useMemo(() => {
    if (identifiedRisks.length === 0) return 'low';
    const avgScore = totalRiskScore / identifiedRisks.length;
    return riskLevelFromScore(avgScore);
  }, [identifiedRisks, totalRiskScore]);

  const requiresNdpcConsultation = overallRiskLevel === 'high' || overallRiskLevel === 'critical';

  const mitigationProgress = useMemo(() => {
    if (mitigations.length === 0) return 0;
    return Math.round((mitigations.filter((m) => m.implemented).length / mitigations.length) * 100);
  }, [mitigations]);

  const canProceed = useMemo(() => {
    if (overallRiskLevel === 'critical') return false;
    if (overallRiskLevel === 'high' && mitigationProgress < 80) return false;
    return true;
  }, [overallRiskLevel, mitigationProgress]);

  // Handlers
  const toggleDataType = useCallback((id: string) => {
    setProjectDetails((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(id)
        ? prev.dataTypes.filter((t) => t !== id)
        : [...prev.dataTypes, id],
    }));
  }, []);

  const setRiskAnswer = useCallback((questionId: string, value: 'low' | 'medium' | 'high') => {
    setRiskAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, value };
        return updated;
      }
      return [...prev, { questionId, value }];
    });
  }, []);

  const toggleMitigation = useCallback((id: string) => {
    setMitigations((prev) =>
      prev.map((m) => (m.id === id ? { ...m, implemented: !m.implemented } : m))
    );
  }, []);

  const goNext = () => {
    if (currentStep === 2) {
      // Generate mitigations when moving to step 3
      const newMitigations = deriveMitigations(identifiedRisks);
      setMitigations(newMitigations);
    }
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Validation
  const step1Valid =
    projectDetails.name.trim().length > 0 &&
    projectDetails.description.trim().length > 0 &&
    projectDetails.dataTypes.length > 0 &&
    projectDetails.processingPurpose.trim().length > 0;

  const step2Valid = riskAnswers.length === RISK_QUESTIONS.length;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <DemoLayout
      title="Data Protection Impact Assessment"
      description="Conduct a structured impact assessment for processing activities likely to result in high risk to data subjects. Where residual risk remains high, prior consultation with the NDPC is mandatory."
      ndpaSection="Sections 38-39"
      code={`import { DPIAForm } from '@tantainnovative/ndpr-toolkit/dpia';

<DPIAForm
  onComplete={(report) => {
    console.log('DPIA completed:', report);
    // report.requiresNdpcConsultation indicates
    // whether NDPC consultation is mandatory
  }}
/>`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

        {/* ================================================================= */}
        {/* STEP 1: Project Details */}
        {/* ================================================================= */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Project Details</CardTitle>
              <CardDescription>
                Describe the data processing activity you are assessing. This forms the foundation of your DPIA.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Project name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Project / Processing Activity Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Customer Onboarding Platform"
                    value={projectDetails.name}
                    onChange={(e) => setProjectDetails((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <TextArea
                    placeholder="Describe the processing activity, including its scope and objectives..."
                    rows={4}
                    value={projectDetails.description}
                    onChange={(e) => setProjectDetails((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                {/* Data types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Types of Personal Data Involved <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DATA_TYPE_OPTIONS.map((dt) => {
                      const checked = projectDetails.dataTypes.includes(dt.id);
                      return (
                        <label
                          key={dt.id}
                          className={`
                            flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                            ${checked
                              ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/40'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={checked}
                            onChange={() => toggleDataType(dt.id)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{dt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Processing purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Processing Purpose <span className="text-red-500">*</span>
                  </label>
                  <TextArea
                    placeholder="What is the lawful basis and business purpose for processing this data?"
                    rows={3}
                    value={projectDetails.processingPurpose}
                    onChange={(e) => setProjectDetails((p) => ({ ...p, processingPurpose: e.target.value }))}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={goNext} disabled={!step1Valid}>
                    Continue to Risk Assessment
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================================================================= */}
        {/* STEP 2: Risk Assessment */}
        {/* ================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Risk Assessment</CardTitle>
                <CardDescription>
                  Answer each question to evaluate the risk level of your processing activity. The risk meter
                  updates in real time as you answer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Real-time risk meter */}
                <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Risk Level
                    </span>
                    <span className={`text-sm font-semibold px-3 py-0.5 rounded-full ${riskColorClasses(overallRiskLevel)}`}>
                      {overallRiskLabel(overallRiskLevel)}
                    </span>
                  </div>
                  <RiskMeter value={totalRiskScore} max={maxPossibleScore} />
                </div>

                {/* Questions */}
                <div className="space-y-8">
                  {RISK_QUESTIONS.map((rq, idx) => {
                    const currentAnswer = riskAnswers.find((a) => a.questionId === rq.id)?.value;
                    return (
                      <div key={rq.id} className="space-y-3">
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {idx + 1}. {rq.question}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rq.guidance}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(['low', 'medium', 'high'] as const).map((level) => {
                            const isSelected = currentAnswer === level;
                            const labelText = rq[level];
                            const levelColors: Record<string, string> = {
                              low: isSelected
                                ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40 ring-1 ring-emerald-400 dark:ring-emerald-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700',
                              medium: isSelected
                                ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40 ring-1 ring-amber-400 dark:ring-amber-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700',
                              high: isSelected
                                ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/40 ring-1 ring-red-400 dark:ring-red-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700',
                            };
                            return (
                              <label
                                key={level}
                                className={`
                                  flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                                  ${levelColors[level]}
                                `}
                              >
                                <input
                                  type="radio"
                                  name={rq.id}
                                  className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={isSelected}
                                  onChange={() => setRiskAnswer(rq.id, level)}
                                />
                                <div>
                                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${riskColorClasses(level)}`}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </span>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{labelText}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
                  <Button variant="outline" onClick={goBack}>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button onClick={goNext} disabled={!step2Valid}>
                    Continue to Mitigations
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Risk Matrix (shows alongside questions as they answer) */}
            {identifiedRisks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Risk Matrix</CardTitle>
                  <CardDescription>
                    Visual mapping of identified risks by likelihood and impact. Dots represent individual risks plotted on the matrix.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskMatrix risks={identifiedRisks} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 3: Mitigation */}
        {/* ================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* NDPC consultation alert */}
            {requiresNdpcConsultation && (
              <div className="p-4 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-red-800 dark:text-red-300">
                      Prior Consultation with the NDPC Is Required
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      Under <strong>NDPA Section 39</strong>, when a DPIA indicates that the processing would result
                      in a high risk in the absence of measures taken by the controller to mitigate the risk, the
                      controller must consult the Nigeria Data Protection Commission (NDPC) before commencing
                      the processing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Mitigation Measures</CardTitle>
                <CardDescription>
                  Based on the risks identified, the following mitigation measures are recommended.
                  Check each measure as you implement it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress */}
                <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mitigation Progress
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{mitigationProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mitigationProgress === 100
                          ? 'bg-emerald-500'
                          : mitigationProgress >= 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                      }`}
                      style={{ width: `${mitigationProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {mitigations.filter((m) => m.implemented).length} of {mitigations.length} measures implemented
                  </p>
                </div>

                {/* Group mitigations by risk */}
                {identifiedRisks.map((risk) => {
                  const riskMitigations = mitigations.filter((m) => m.riskId === risk.id);
                  if (riskMitigations.length === 0) return null;

                  return (
                    <div key={risk.id} className={`mb-6 p-4 rounded-lg border ${riskBorderColor(risk.level)} bg-white dark:bg-gray-900`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${riskColorClasses(risk.level)}`}>
                          {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{risk.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{risk.description}</p>
                      <div className="space-y-2">
                        {riskMitigations.map((m) => (
                          <label
                            key={m.id}
                            className={`
                              flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                              ${m.implemented
                                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                              checked={m.implemented}
                              onChange={() => toggleMitigation(m.id)}
                            />
                            <span className={`text-sm ${m.implemented ? 'text-emerald-800 dark:text-emerald-300 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                              {m.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" onClick={goBack}>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button onClick={goNext}>
                    Generate Report
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Risk matrix in step 3 too */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMatrix risks={identifiedRisks} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================================================================= */}
        {/* STEP 4: Report */}
        {/* ================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* NDPC alert if needed */}
            {requiresNdpcConsultation && (
              <div className="p-4 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-red-800 dark:text-red-300">
                      Prior Consultation with the NDPC Is Required
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      This assessment has identified residual high risk. Under <strong>NDPA Section 39</strong>,
                      you must consult the Nigeria Data Protection Commission before commencing this processing activity.
                      Submit this report as part of your consultation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`rounded-xl border-2 p-5 text-center ${riskBorderColor(overallRiskLevel)} ${riskColorClasses(overallRiskLevel)}`}>
                <div className="text-3xl font-bold">{overallRiskLabel(overallRiskLevel)}</div>
                <div className="text-sm mt-1 opacity-80">Overall Risk Level</div>
              </div>
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-5 text-center bg-white dark:bg-gray-900">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{identifiedRisks.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Risks Identified</div>
              </div>
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-5 text-center bg-white dark:bg-gray-900">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{mitigationProgress}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mitigations Implemented</div>
              </div>
            </div>

            {/* Report document */}
            <Card className="border-2">
              <CardContent className="pt-8">
                <div className="max-w-3xl mx-auto space-y-8 print:space-y-6">
                  {/* Document header */}
                  <div className="text-center border-b-2 border-gray-900 dark:border-gray-200 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      Data Protection Impact Assessment
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Prepared in accordance with the Nigeria Data Protection Act (NDPA), Sections 38 &ndash; 39
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date: {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Section 1: Project */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      1. Processing Activity Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Project Name</span>
                        <p className="text-gray-900 dark:text-white mt-0.5">{projectDetails.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Assessment Date</span>
                        <p className="text-gray-900 dark:text-white mt-0.5">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Description</span>
                      <p className="text-gray-900 dark:text-white mt-0.5">{projectDetails.description}</p>
                    </div>
                    <div className="mt-4 text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Processing Purpose</span>
                      <p className="text-gray-900 dark:text-white mt-0.5">{projectDetails.processingPurpose}</p>
                    </div>
                    <div className="mt-4 text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Data Types Processed</span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {projectDetails.dataTypes.map((dt) => {
                          const label = DATA_TYPE_OPTIONS.find((o) => o.id === dt)?.label || dt;
                          return (
                            <Badge key={dt} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Risk Assessment Summary */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      2. Risk Assessment Summary
                    </h2>
                    <div className="mb-4">
                      <RiskMatrix risks={identifiedRisks} />
                    </div>
                    <div className="space-y-3 mt-6">
                      {identifiedRisks.map((risk) => (
                        <div key={risk.id} className={`p-4 rounded-lg border ${riskBorderColor(risk.level)}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColorClasses(risk.level)}`}>
                              {risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{risk.title}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                              Score: {risk.likelihood * risk.impact} (L:{risk.likelihood} x I:{risk.impact})
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{risk.description}</p>
                        </div>
                      ))}
                      {identifiedRisks.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No significant risks identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Mitigation Status */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      3. Mitigation Measures
                    </h2>
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${mitigationProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${mitigationProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mitigationProgress}% complete</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Measure</th>
                          <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400 w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mitigations.map((m) => (
                          <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2.5 text-gray-700 dark:text-gray-300">{m.text}</td>
                            <td className="py-2.5">
                              {m.implemented ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Done
                                </span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 4: Conclusion */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      4. Conclusion
                    </h2>
                    <div className={`p-4 rounded-lg border-2 ${canProceed ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30' : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'}`}>
                      {canProceed ? (
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h3 className="font-semibold text-emerald-800 dark:text-emerald-300">Processing May Proceed</h3>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                              Based on the assessment, the identified risks have been adequately addressed through the
                              proposed mitigation measures. The processing activity may proceed subject to the
                              implementation and ongoing monitoring of all mitigation measures. This DPIA should be
                              reviewed periodically as required by NDPA Section 38.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h3 className="font-semibold text-red-800 dark:text-red-300">Processing Cannot Proceed Without NDPC Consultation</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                              The residual risk remains high after mitigation. Under NDPA Section 39, prior consultation
                              with the Nigeria Data Protection Commission is required before this processing activity
                              commences. Submit this DPIA report to the NDPC as part of the consultation process.
                              {mitigationProgress < 80 && (
                                <span className="block mt-2">
                                  Additionally, only {mitigationProgress}% of mitigation measures have been implemented.
                                  Ensure at least 80% of measures are in place before seeking NDPC consultation.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      5. Recommendations
                    </h2>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">&#8226;</span>
                        Document all security measures implemented as required under the NDPA
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">&#8226;</span>
                        Conduct regular reviews of this DPIA, especially when processing operations change
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">&#8226;</span>
                        Ensure all personnel involved in data processing are trained on NDPA obligations
                      </li>
                      {requiresNdpcConsultation && (
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">&#8226;</span>
                          <span className="text-red-700 dark:text-red-400 font-medium">
                            Consult the NDPC prior to processing as required by NDPA Section 39
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">&#8226;</span>
                        Maintain a record of processing activities and update this DPIA at least annually
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">&#8226;</span>
                        Ensure data subject rights mechanisms are accessible and functional
                      </li>
                    </ul>
                  </div>

                  {/* Signature block */}
                  <div className="border-t-2 border-gray-900 dark:border-gray-200 pt-6 mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <div className="border-b border-gray-300 dark:border-gray-600 mb-2 h-12" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Assessor Signature / Date</p>
                      </div>
                      <div>
                        <div className="border-b border-gray-300 dark:border-gray-600 mb-2 h-12" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">DPO Approval / Date</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <Button variant="outline" onClick={goBack}>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Mitigations
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.print()}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </Button>
                <Button
                  onClick={() => {
                    const report = {
                      title: 'DPIA Report',
                      date: new Date().toISOString(),
                      project: projectDetails,
                      risks: identifiedRisks,
                      mitigations: mitigations,
                      overallRiskLevel,
                      mitigationProgress,
                      canProceed,
                      requiresNdpcConsultation,
                    };
                    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dpia-${projectDetails.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </Button>
              </div>
            </div>

            {/* Start over */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setProjectDetails({ name: '', description: '', dataTypes: [], processingPurpose: '' });
                  setRiskAnswers([]);
                  setMitigations([]);
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors"
              >
                Start a new assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </DemoLayout>
  );
}
