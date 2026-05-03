import React, { useState, useEffect } from 'react';
import { BreachReport, RiskAssessment } from '../../types/breach';
import { calculateBreachSeverity } from '../../utils/breach';
import { resolveClass } from '../../utils/styling';

export interface BreachRiskAssessmentClassNames {
  root?: string;
  header?: string;
  title?: string;
  slider?: string;
  riskBadge?: string;
  riskScore?: string;
  notificationStatus?: string;
  submitButton?: string;
  /** Alias for submitButton */
  primaryButton?: string;
}

export interface BreachRiskAssessmentProps {
  /**
   * The breach data to assess
   */
  breachData: BreachReport;
  
  /**
   * Initial assessment data (if editing an existing assessment)
   */
  initialAssessment?: Partial<RiskAssessment>;
  
  /**
   * Callback function called when assessment is completed
   */
  onComplete: (assessment: RiskAssessment) => void;
  
  /**
   * Title displayed on the assessment form
   * @default "Breach Risk Assessment"
   */
  title?: string;
  
  /**
   * Description text displayed on the assessment form
   * @default "Assess the risk level of this data breach to determine notification requirements under NDPA Section 40."
   */
  description?: string;
  
  /**
   * Text for the submit button
   * @default "Complete Assessment"
   */
  submitButtonText?: string;
  
  /**
   * Custom CSS class for the form
   */
  className?: string;

  /**
   * Custom CSS class for the submit button
   */
  buttonClassName?: string;

  /**
   * Override class names for individual elements
   */
  classNames?: BreachRiskAssessmentClassNames;

  /**
   * Remove all default styles, only applying classNames overrides
   */
  unstyled?: boolean;
  
  /**
   * Whether to show the breach summary
   * @default true
   */
  showBreachSummary?: boolean;
  
  /**
   * Whether to show notification requirements after assessment
   * @default true
   */
  showNotificationRequirements?: boolean;
}

/**
 * Breach risk assessment component. Implements NDPA Section 40 requirements for assessing
 * breach severity and determining whether NDPC notification is required within 72 hours.
 */
export const BreachRiskAssessment: React.FC<BreachRiskAssessmentProps> = ({
  breachData,
  initialAssessment = {},
  onComplete,
  title = "Breach Risk Assessment",
  description = "Assess the risk level of this data breach to determine notification requirements under NDPA Section 40.",
  submitButtonText = "Complete Assessment",
  className = "",
  buttonClassName = "",
  classNames: cn = {},
  unstyled = false,
  showBreachSummary = true,
  showNotificationRequirements = true
}) => {
  // Assessment form state
  const [confidentialityImpact, setConfidentialityImpact] = useState<number>(initialAssessment.confidentialityImpact || 3);
  const [integrityImpact, setIntegrityImpact] = useState<number>(initialAssessment.integrityImpact || 3);
  const [availabilityImpact, setAvailabilityImpact] = useState<number>(initialAssessment.availabilityImpact || 3);
  const [harmLikelihood, setHarmLikelihood] = useState<number>(initialAssessment.harmLikelihood || 3);
  const [harmSeverity, setHarmSeverity] = useState<number>(initialAssessment.harmSeverity || 3);
  const [risksToRightsAndFreedoms, setRisksToRightsAndFreedoms] = useState<boolean>(initialAssessment.risksToRightsAndFreedoms !== undefined ? initialAssessment.risksToRightsAndFreedoms : false);
  const [highRisksToRightsAndFreedoms, setHighRisksToRightsAndFreedoms] = useState<boolean>(initialAssessment.highRisksToRightsAndFreedoms !== undefined ? initialAssessment.highRisksToRightsAndFreedoms : false);
  const [justification, setJustification] = useState<string>(initialAssessment.justification || '');
  
  // Calculated values
  const [overallRiskScore, setOverallRiskScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [notificationRequired, setNotificationRequired] = useState<boolean>(false);
  const [notificationDeadline, setNotificationDeadline] = useState<number>(0);
  const [hoursRemaining, setHoursRemaining] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [assessedOn] = useState(() => Date.now());
  
  // Calculate risk score and level when inputs change
  useEffect(() => {
    // Calculate overall risk score (weighted average)
    const ciWeight = 0.2; // Confidentiality impact weight
    const iiWeight = 0.1; // Integrity impact weight
    const aiWeight = 0.1; // Availability impact weight
    const hlWeight = 0.3; // Harm likelihood weight
    const hsWeight = 0.3; // Harm severity weight
    
    const score = 
      (confidentialityImpact * ciWeight) +
      (integrityImpact * iiWeight) +
      (availabilityImpact * aiWeight) +
      (harmLikelihood * hlWeight) +
      (harmSeverity * hsWeight);
    
    setOverallRiskScore(Number(score.toFixed(1)));
    
    // Determine risk level based on score
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score < 2) {
      level = 'low';
    } else if (score < 3) {
      level = 'medium';
    } else if (score < 4) {
      level = 'high';
    } else {
      level = 'critical';
    }
    setRiskLevel(level);
    
    // Determine notification requirements
    const requiresNotification = risksToRightsAndFreedoms || level === 'high' || level === 'critical';
    setNotificationRequired(requiresNotification);
    
    // Calculate notification deadline (72 hours from discovery under NDPA Section 40)
    const deadline = breachData.discoveredAt + (72 * 60 * 60 * 1000);
    setNotificationDeadline(deadline);
    
    // Calculate hours remaining
    const now = Date.now();
    const remaining = (deadline - now) / (60 * 60 * 1000);
    setHoursRemaining(Number(remaining.toFixed(1)));
  }, [
    confidentialityImpact,
    integrityImpact,
    availabilityImpact,
    harmLikelihood,
    harmSeverity,
    risksToRightsAndFreedoms,
    breachData.discoveredAt
  ]);
  
  // Format a date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assessment: RiskAssessment = {
      id: initialAssessment.id || `assessment_${Date.now()}`,
      breachId: breachData.id,
      assessedAt: Date.now(),
      assessor: initialAssessment.assessor || {
        name: 'Assessment User', // This would typically come from the user context
        role: 'Data Protection Officer',
        email: 'dpo@example.com'
      },
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
      harmLikelihood,
      harmSeverity,
      overallRiskScore,
      riskLevel,
      risksToRightsAndFreedoms,
      highRisksToRightsAndFreedoms,
      justification
    };
    
    onComplete(assessment);
    setIsSubmitted(true);
  };
  
  // Render impact level description
  const renderImpactDescription = (level: number): string => {
    switch (level) {
      case 1: return 'Minimal';
      case 2: return 'Low';
      case 3: return 'Moderate';
      case 4: return 'High';
      case 5: return 'Severe';
      default: return 'Unknown';
    }
  };
  
  // Render risk level badge
  const renderRiskLevelBadge = (level: 'low' | 'medium' | 'high' | 'critical') => {
    const colorClasses = {
      low: 'ndpr-badge ndpr-badge--success',
      medium: 'ndpr-badge ndpr-badge--warning',
      high: 'ndpr-badge ndpr-badge--warning',
      critical: 'ndpr-badge ndpr-badge--destructive'
    };
    
    return (
      <span className={resolveClass(`px-2 py-1 rounded text-xs font-medium ${colorClasses[level]}`, cn.riskBadge, unstyled)}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  return (
    <div data-ndpr-component="breach-risk-assessment" className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, cn.root, unstyled)}>
      <h2 className={resolveClass('ndpr-section-heading', cn.title, unstyled)}>{title}</h2>
      <p className='ndpr-card__subtitle'>{description}</p>
      
      {/* Breach Summary */}
      {showBreachSummary && (
        <div className='ndpr-panel'>
          <h3 className="text-lg font-medium mb-2">Breach Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p className='ndpr-text-sm'><span className="font-medium">Title:</span> {breachData.title}</p>
              <p className='ndpr-text-sm'><span className="font-medium">Discovered:</span> {formatDate(breachData.discoveredAt)}</p>
              <p className='ndpr-text-sm'><span className="font-medium">Status:</span> {breachData.status.charAt(0).toUpperCase() + breachData.status.slice(1)}</p>
            </div>
            <div>
              <p className='ndpr-text-sm'><span className="font-medium">Data Types:</span> {breachData.dataTypes.join(', ')}</p>
              <p className='ndpr-text-sm'><span className="font-medium">Affected Systems:</span> {breachData.affectedSystems.join(', ')}</p>
              <p className='ndpr-text-sm'><span className="font-medium">Affected Subjects:</span> {breachData.estimatedAffectedSubjects || 'Unknown'}</p>
            </div>
          </div>
        </div>
      )}
      
      {isSubmitted ? (
        <div>
          {/* Assessment Results */}
          <div className='ndpr-alert ndpr-alert--info'>
            <h3 className="text-lg font-medium mb-3">Assessment Results</h3>
            <div className='ndpr-form-grid ndpr-form-grid--2'>
              <div>
                <p className="text-sm mb-2">
                  <span className="font-medium">Overall Risk Level:</span>{' '}
                  {renderRiskLevelBadge(riskLevel)}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">Risk Score:</span> {overallRiskScore} / 5
                </p>
                <p className='ndpr-text-sm'>
                  <span className="font-medium">Assessed On:</span> {formatDate(assessedOn)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-2">
                  <span className="font-medium">Risks to Rights and Freedoms:</span>{' '}
                  {risksToRightsAndFreedoms ? 'Yes' : 'No'}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">High Risks to Rights and Freedoms:</span>{' '}
                  {highRisksToRightsAndFreedoms ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm mb-1"><span className="font-medium">Justification:</span></p>
              <p className="text-sm bg-white dark:bg-gray-800 p-2 rounded">{justification}</p>
            </div>
          </div>
          
          {/* Notification Requirements */}
          {showNotificationRequirements && (
            <div className={resolveClass(`mb-6 p-4 rounded-md ${
              notificationRequired
                ? hoursRemaining > 24
                  ? 'ndpr-alert ndpr-alert--warning'
                  : 'ndpr-alert ndpr-alert--destructive'
                : 'ndpr-alert ndpr-alert--success'
            }`, cn.notificationStatus, unstyled)}>
              <h3 className="text-lg font-medium mb-3">Notification Requirements</h3>
              
              {notificationRequired ? (
                <div>
                  <p className={`text-sm font-bold mb-2 ${
                    hoursRemaining > 24
                      ? 'ndpr-text-warning'
                      : 'ndpr-text-destructive'
                  }`}>
                    NDPC Notification Required
                  </p>
                  <p className="text-sm mb-2">
                    Under the NDPA (Section 40), this breach must be reported to the NDPC within 72 hours of discovery.
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Notification Deadline:</span> {formatDate(notificationDeadline)}
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Time Remaining:</span>{' '}
                    <span className={hoursRemaining < 24 ? 'ndpr-text-destructive font-bold' : ''}>
                      {hoursRemaining > 0 ? `${hoursRemaining} hours` : 'Deadline passed'}
                    </span>
                  </p>
                  <p className="text-sm mb-2">
                    <span className="font-medium">Data Subject Notification:</span>{' '}
                    {highRisksToRightsAndFreedoms ? 'Required (NDPA Section 40(4))' : 'Not required unless directed by NDPC'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold mb-2 ndpr-text-success">
                    NDPC Notification Not Required
                  </p>
                  <p className="text-sm mb-2">
                    Based on this assessment, this breach does not need to be reported to the NDPC.
                  </p>
                  <p className="text-sm mb-2">
                    However, the breach should still be documented internally for compliance purposes.
                  </p>
                </div>
              )}
              
              <div className="mt-3 text-sm">
                <p className="font-medium">Next Steps:</p>
                <ul className="list-disc pl-5 mt-1">
                  {notificationRequired ? (
                    <>
                      <li>Prepare a notification report for the NDPC</li>
                      <li>Document all aspects of the breach and your response</li>
                      {highRisksToRightsAndFreedoms && <li>Prepare communications for affected data subjects</li>}
                      <li>Implement measures to mitigate the impact of the breach</li>
                    </>
                  ) : (
                    <>
                      <li>Document the breach and this assessment in your internal records</li>
                      <li>Implement measures to prevent similar breaches in the future</li>
                      <li>Review and update security measures as needed</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setIsSubmitted(false)}
            className={resolveClass(`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`, cn.primaryButton || cn.submitButton, unstyled)}
          >
            Edit Assessment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className='ndpr-form-section'>
            {/* Impact Assessment */}
            <div>
              <h3 className='ndpr-section-heading'>Impact Assessment</h3>
              
              <div className='ndpr-form-field'>
                <label htmlFor="confidentialityImpact" className='ndpr-form-field__label'>
                  Confidentiality Impact (1-5)
                  <span className="ml-2 text-sm ndpr-text-muted">
                    How much has the confidentiality of data been compromised?
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="confidentialityImpact"
                    min="1"
                    max="5"
                    step="1"
                    value={confidentialityImpact}
                    onChange={e => setConfidentialityImpact(parseInt(e.target.value))}
                    className={resolveClass('ndpr-form-field__range', cn.slider, unstyled)}
                  />
                  <span className="ml-3 w-24 text-sm">
                    {renderImpactDescription(confidentialityImpact)} ({confidentialityImpact})
                  </span>
                </div>
              </div>
              
              <div className='ndpr-form-field'>
                <label htmlFor="integrityImpact" className='ndpr-form-field__label'>
                  Integrity Impact (1-5)
                  <span className="ml-2 text-sm ndpr-text-muted">
                    How much has the integrity of data been compromised?
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="integrityImpact"
                    min="1"
                    max="5"
                    step="1"
                    value={integrityImpact}
                    onChange={e => setIntegrityImpact(parseInt(e.target.value))}
                    className={resolveClass('ndpr-form-field__range', cn.slider, unstyled)}
                  />
                  <span className="ml-3 w-24 text-sm">
                    {renderImpactDescription(integrityImpact)} ({integrityImpact})
                  </span>
                </div>
              </div>
              
              <div className='ndpr-form-field'>
                <label htmlFor="availabilityImpact" className='ndpr-form-field__label'>
                  Availability Impact (1-5)
                  <span className="ml-2 text-sm ndpr-text-muted">
                    How much has the availability of data or systems been compromised?
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="availabilityImpact"
                    min="1"
                    max="5"
                    step="1"
                    value={availabilityImpact}
                    onChange={e => setAvailabilityImpact(parseInt(e.target.value))}
                    className={resolveClass('ndpr-form-field__range', cn.slider, unstyled)}
                  />
                  <span className="ml-3 w-24 text-sm">
                    {renderImpactDescription(availabilityImpact)} ({availabilityImpact})
                  </span>
                </div>
              </div>
            </div>
            
            {/* Risk to Data Subjects */}
            <div>
              <h3 className='ndpr-section-heading'>Risk to Data Subjects</h3>
              
              <div className='ndpr-form-field'>
                <label htmlFor="harmLikelihood" className='ndpr-form-field__label'>
                  Likelihood of Harm (1-5)
                  <span className="ml-2 text-sm ndpr-text-muted">
                    How likely is it that data subjects will experience harm?
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="harmLikelihood"
                    min="1"
                    max="5"
                    step="1"
                    value={harmLikelihood}
                    onChange={e => setHarmLikelihood(parseInt(e.target.value))}
                    className={resolveClass('ndpr-form-field__range', cn.slider, unstyled)}
                  />
                  <span className="ml-3 w-24 text-sm">
                    {renderImpactDescription(harmLikelihood)} ({harmLikelihood})
                  </span>
                </div>
              </div>
              
              <div className='ndpr-form-field'>
                <label htmlFor="harmSeverity" className='ndpr-form-field__label'>
                  Severity of Harm (1-5)
                  <span className="ml-2 text-sm ndpr-text-muted">
                    How severe would the harm be to affected data subjects?
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="harmSeverity"
                    min="1"
                    max="5"
                    step="1"
                    value={harmSeverity}
                    onChange={e => setHarmSeverity(parseInt(e.target.value))}
                    className={resolveClass('ndpr-form-field__range', cn.slider, unstyled)}
                  />
                  <span className="ml-3 w-24 text-sm">
                    {renderImpactDescription(harmSeverity)} ({harmSeverity})
                  </span>
                </div>
              </div>
              
              <div className='ndpr-form-field'>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="risksToRightsAndFreedoms"
                    checked={risksToRightsAndFreedoms}
                    onChange={e => setRisksToRightsAndFreedoms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
                  />
                  <label htmlFor="risksToRightsAndFreedoms" className="ml-2 text-sm font-medium">
                    This breach poses a risk to the rights and freedoms of data subjects
                  </label>
                </div>
                <p className="text-xs ndpr-text-muted ml-6">
                  Under the NDPA (Section 40), breaches that pose a risk to rights and freedoms must be reported to the NDPC within 72 hours.
                </p>
              </div>
              
              <div className='ndpr-form-field'>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="highRisksToRightsAndFreedoms"
                    checked={highRisksToRightsAndFreedoms}
                    onChange={e => setHighRisksToRightsAndFreedoms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
                  />
                  <label htmlFor="highRisksToRightsAndFreedoms" className="ml-2 text-sm font-medium">
                    This breach poses a high risk to the rights and freedoms of data subjects
                  </label>
                </div>
                <p className="text-xs ndpr-text-muted ml-6">
                  Under the NDPA (Section 40(4)), breaches that pose a high risk to rights and freedoms also require notification to affected data subjects without undue delay.
                </p>
              </div>
            </div>
            
            {/* Overall Assessment */}
            <div>
              <h3 className='ndpr-section-heading'>Overall Assessment</h3>
              
              <div className='ndpr-panel'>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Risk Score:</span>
                  <span className={resolveClass("", cn.riskScore, unstyled)}>{overallRiskScore} / 5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Risk Level:</span>
                  {renderRiskLevelBadge(riskLevel)}
                </div>
              </div>
              
              <div className='ndpr-form-field'>
                <label htmlFor="justification" className='ndpr-form-field__label'>
                  Justification for Assessment <span className="ndpr-form-field__required">*</span>
                </label>
                <textarea
                  id="justification"
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  rows={4}
                  placeholder="Explain the reasoning behind your assessment, including any factors that influenced your decision."
                  className='ndpr-form-field__input'
                  required
                />
              </div>
            </div>
            
            {/* NDPA Notice */}
            <div className='ndpr-alert ndpr-alert--info'>
              <h3 className="text-sm font-bold ndpr-text-info mb-2">NDPA Breach Notification Requirements</h3>
              <p className="ndpr-text-info text-sm">
                Under the Nigeria Data Protection Act (NDPA), Section 40, data breaches that pose a risk to the rights and freedoms of data subjects must be reported to the NDPC within 72 hours of discovery.
                This assessment will determine if notification is required for this breach.
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className={resolveClass(`px-6 py-3 bg-[rgb(var(--ndpr-primary))] text-white rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] focus:ring-offset-2 ${buttonClassName}`, cn.primaryButton || cn.submitButton, unstyled)}
              >
                {submitButtonText}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
