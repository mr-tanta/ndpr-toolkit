import React, { useState, useEffect } from 'react';
import { BreachReport, RiskAssessment, RegulatoryNotification } from '../../types/breach';
import { resolveClass } from '../../utils/styling';

export interface RegulatoryReportGeneratorClassNames {
  root?: string;
  header?: string;
  title?: string;
  reportPreview?: string;
  field?: string;
  fieldLabel?: string;
  fieldValue?: string;
  generateButton?: string;
  /** Alias for generateButton */
  primaryButton?: string;
  downloadButton?: string;
  /** Alias for downloadButton */
  secondaryButton?: string;
}

export interface OrganizationInfo {
  /**
   * Name of the organization
   */
  name: string;
  
  /**
   * Registration number or business ID
   */
  registrationNumber?: string;
  
  /**
   * Physical address of the organization
   */
  address: string;
  
  /**
   * Website URL
   */
  website?: string;
  
  /**
   * Name of the Data Protection Officer
   */
  dpoName: string;
  
  /**
   * Email of the Data Protection Officer
   */
  dpoEmail: string;
  
  /**
   * Phone number of the Data Protection Officer
   */
  dpoPhone?: string;
}

export interface RegulatoryReportGeneratorProps {
  /**
   * The breach data to include in the report
   */
  breachData: BreachReport;
  
  /**
   * The risk assessment data
   */
  assessmentData?: RiskAssessment;
  
  /**
   * Organization information to include in the report
   */
  organizationInfo: OrganizationInfo;
  
  /**
   * Callback function called when the report is generated
   */
  onGenerate: (report: RegulatoryNotification) => void;
  
  /**
   * Title displayed on the generator form
   * @default "Generate NDPC Notification Report"
   */
  title?: string;

  /**
   * Description text displayed on the generator form
   * @default "Generate a report for submission to the NDPC in compliance with NDPA Section 40 breach notification requirements."
   */
  description?: string;
  
  /**
   * Text for the generate button
   * @default "Generate Report"
   */
  generateButtonText?: string;
  
  /**
   * Custom CSS class for the form
   */
  className?: string;

  /**
   * Custom CSS class for the buttons
   */
  buttonClassName?: string;

  /**
   * Override class names for individual elements
   */
  classNames?: RegulatoryReportGeneratorClassNames;

  /**
   * Remove all default styles, only applying classNames overrides
   */
  unstyled?: boolean;
  
  /**
   * Whether to show a preview of the generated report
   * @default true
   */
  showPreview?: boolean;
  
  /**
   * Whether to allow editing the report content
   * @default true
   */
  allowEditing?: boolean;
  
  /**
   * Whether to allow downloading the report
   * @default true
   */
  allowDownload?: boolean;
  
  /**
   * Format for downloading the report
   * @default "pdf"
   */
  downloadFormat?: 'pdf' | 'docx' | 'html';
}

/**
 * Regulatory report generator component. Implements NDPA Section 40 requirements for
 * generating formal breach notification reports for submission to the NDPC.
 */
export const RegulatoryReportGenerator: React.FC<RegulatoryReportGeneratorProps> = ({
  breachData,
  assessmentData,
  organizationInfo,
  onGenerate,
  title = "Generate NDPC Notification Report",
  description = "Generate a report for submission to the NDPC in compliance with NDPA Section 40 breach notification requirements.",
  generateButtonText = "Generate Report",
  className = "",
  buttonClassName = "",
  classNames: cn = {},
  unstyled = false,
  showPreview = true,
  allowEditing = true,
  allowDownload = true,
  downloadFormat = "pdf"
}) => {
  // Form state
  const [reportContent, setReportContent] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [method, setMethod] = useState<'email' | 'portal' | 'letter' | 'other'>('email');
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Generate the initial report content (regenerate when core props change)
  useEffect(() => {
    const initialContent = generateInitialContent();
    setReportContent(initialContent);
    setIsGenerated(true);
    // generateInitialContent is intentionally excluded — it's a closure
    // over the same three deps already listed; including it would just
    // create a stable identity wrapper around the same data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breachData, assessmentData, organizationInfo]);
  
  // Format a date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Generate the initial report content
  const generateInitialContent = (): string => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
NDPC DATA BREACH NOTIFICATION

Date: ${formattedDate}

Reference: NDPA Section 40 - Breach Notification

ORGANIZATION DETAILS
-------------------
Organization Name: ${organizationInfo.name}
${organizationInfo.registrationNumber ? `Registration Number: ${organizationInfo.registrationNumber}` : ''}
Address: ${organizationInfo.address}
${organizationInfo.website ? `Website: ${organizationInfo.website}` : ''}

DATA PROTECTION OFFICER
----------------------
Name: ${organizationInfo.dpoName}
Email: ${organizationInfo.dpoEmail}
${organizationInfo.dpoPhone ? `Phone: ${organizationInfo.dpoPhone}` : ''}

BREACH DETAILS
-------------
Breach Title: ${breachData.title}
Date Discovered: ${formatDate(breachData.discoveredAt)}
${breachData.occurredAt ? `Date Occurred: ${formatDate(breachData.occurredAt)}` : 'Date Occurred: Unknown'}
Status: ${breachData.status.charAt(0).toUpperCase() + breachData.status.slice(1)}

Description of the Breach:
${breachData.description}

Affected Systems/Applications:
${breachData.affectedSystems.join(', ')}

Types of Personal Data Involved:
${breachData.dataTypes.join(', ')}

Estimated Number of Data Subjects Affected:
${breachData.estimatedAffectedSubjects || 'Unknown'}

RISK ASSESSMENT
--------------
${assessmentData ? `
Overall Risk Level: ${assessmentData.riskLevel.charAt(0).toUpperCase() + assessmentData.riskLevel.slice(1)}
Risk to Rights and Freedoms of Data Subjects: ${assessmentData.risksToRightsAndFreedoms ? 'Yes' : 'No'}
High Risk to Rights and Freedoms of Data Subjects: ${assessmentData.highRisksToRightsAndFreedoms ? 'Yes' : 'No'}

Justification for Risk Assessment:
${assessmentData.justification}
` : 'Risk assessment has not been conducted yet.'}

MEASURES TAKEN
-------------
Measures taken or proposed to address the breach:
${breachData.initialActions || 'To be determined'}

Measures taken or proposed to mitigate possible adverse effects:
[Please specify measures taken to mitigate adverse effects]

NOTIFICATION TO DATA SUBJECTS (NDPA Section 40(4))
----------------------------
Have data subjects been notified: [Yes/No]
If yes, date of notification: [Date]
If no, planned date of notification: [Date]
Reason for delay (if applicable): [Reason]

ADDITIONAL INFORMATION
---------------------
[Any additional information relevant to the breach]

This notification is made in compliance with the Nigeria Data Protection Act (NDPA), Section 40.
    `;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const notification: RegulatoryNotification = {
      id: `notification_${Date.now()}`,
      breachId: breachData.id,
      sentAt: Date.now(),
      method,
      referenceNumber: referenceNumber || undefined,
      ndpcContact: contactName ? {
        name: contactName,
        email: contactEmail,
        phone: contactPhone || undefined
      } : undefined,
      content: reportContent,
      attachments: []
    };
    
    onGenerate(notification);
    setIsSubmitted(true);
  };
  
  // Handle download
  const handleDownload = () => {
    let mimeType: string;
    let extension: string;
    let content: string;

    switch (downloadFormat) {
      case 'html': {
        mimeType = 'text/html';
        extension = 'html';
        content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NDPC Breach Notification Report</title>
<style>body{font-family:monospace;white-space:pre-wrap;max-width:800px;margin:2rem auto;padding:0 1rem;}</style>
</head>
<body>${reportContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`;
        break;
      }
      case 'pdf':
        // Real PDF generation requires a library like jspdf
        mimeType = 'text/plain';
        extension = 'pdf.txt';
        content = reportContent;
        break;
      case 'docx':
        // Real DOCX generation requires a library like docx
        mimeType = 'text/plain';
        extension = 'docx.txt';
        content = reportContent;
        break;
      default:
        mimeType = 'text/plain';
        extension = 'txt';
        content = reportContent;
    }

    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `NDPC_Breach_Notification_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Render the notification method options
  const renderMethodOptions = () => {
    const options = [
      { value: 'email', label: 'Email' },
      { value: 'portal', label: 'NDPC Portal' },
      { value: 'letter', label: 'Formal Letter' },
      { value: 'other', label: 'Other' }
    ];
    
    return options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  };
  
  return (
    <div data-ndpr-component="regulatory-report-generator" className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, cn.root, unstyled)}>
      <div className={resolveClass("", cn.header, unstyled)}>
        <h2 className={resolveClass('ndpr-section-heading', cn.title, unstyled)}>{title}</h2>
        <p className='ndpr-card__subtitle'>{description}</p>
      </div>
      
      {isSubmitted ? (
        <div>
          <div className='ndpr-alert ndpr-alert--success'>
            <h3 className="text-lg font-bold ndpr-text-success mb-2">Report Generated Successfully</h3>
            <p className="ndpr-text-success">
              Your NDPC notification report has been generated and is ready for submission.
              Please review the report carefully before submitting it to the NDPC.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className='ndpr-section-heading'>Submission Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Method:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{method.charAt(0).toUpperCase() + method.slice(1)}</span></p>
                {contactName && <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Contact Name:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{contactName}</span></p>}
                {contactEmail && <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Contact Email:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{contactEmail}</span></p>}
                {contactPhone && <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Contact Phone:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{contactPhone}</span></p>}
              </div>
              <div>
                <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Date Generated:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{formatDate(Date.now())}</span></p>
                <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Breach ID:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{breachData.id}</span></p>
                {referenceNumber && <p className={resolveClass('ndpr-text-sm', cn.field, unstyled)}><span className={resolveClass("font-medium", cn.fieldLabel, unstyled)}>Reference Number:</span> <span className={resolveClass("", cn.fieldValue, unstyled)}>{referenceNumber}</span></p>}
              </div>
            </div>
          </div>
          
          {showPreview && (
            <div className="mb-6">
              <h3 className='ndpr-section-heading'>Report Preview</h3>
              <div className={resolveClass('ndpr-panel', cn.reportPreview, unstyled)}>
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
                  {reportContent}
                </pre>
              </div>
            </div>
          )}
          
          <div className='ndpr-card__footer'>
            {allowDownload && (
              <button
                onClick={handleDownload}
                className={resolveClass(`px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-white rounded hover:bg-[rgb(var(--ndpr-primary-hover))] ${buttonClassName}`, cn.secondaryButton || cn.downloadButton, unstyled)}
              >
                Download Report ({downloadFormat.toUpperCase()})
              </button>
            )}
            <button
              onClick={() => setIsSubmitted(false)}
              className={`px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${buttonClassName}`}
            >
              Edit Report
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className='ndpr-form-section'>
            {/* Notification Method */}
            <div>
              <h3 className='ndpr-section-heading'>Notification Method</h3>
              <div className='ndpr-form-grid ndpr-form-grid--2'>
                <div>
                  <label htmlFor="method" className='ndpr-form-field__label'>
                    Method of Submission <span className="ndpr-form-field__required">*</span>
                  </label>
                  <select
                    id="method"
                    value={method}
                    onChange={e => setMethod(e.target.value as 'email' | 'portal' | 'letter' | 'other')}
                    className='ndpr-form-field__input'
                    required
                  >
                    {renderMethodOptions()}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="referenceNumber" className='ndpr-form-field__label'>
                    Reference Number (if available)
                  </label>
                  <input
                    type="text"
                    id="referenceNumber"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    placeholder="e.g. NDPC/BR/2024/001"
                    className='ndpr-form-field__input'
                  />
                </div>
              </div>
            </div>
            
            {/* NDPC Contact */}
            <div>
              <h3 className='ndpr-section-heading'>NDPC Contact (if known)</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="contactName" className='ndpr-form-field__label'>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className='ndpr-form-field__input'
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className='ndpr-form-field__label'>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className='ndpr-form-field__input'
                  />
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className='ndpr-form-field__label'>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className='ndpr-form-field__input'
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div>
              <h3 className='ndpr-section-heading'>Additional Information</h3>
              <div>
                <label htmlFor="additionalInfo" className='ndpr-form-field__label'>
                  Additional Information to Include
                </label>
                <textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={e => setAdditionalInfo(e.target.value)}
                  rows={3}
                  placeholder="Any additional information you want to include in the report"
                  className='ndpr-form-field__input'
                />
              </div>
            </div>
            
            {/* Report Content */}
            {allowEditing && (
              <div>
                <h3 className='ndpr-section-heading'>Report Content</h3>
                <div>
                  <label htmlFor="reportContent" className='ndpr-form-field__label'>
                    Edit Report Content <span className="ndpr-form-field__required">*</span>
                  </label>
                  <textarea
                    id="reportContent"
                    value={reportContent}
                    onChange={e => setReportContent(e.target.value)}
                    rows={20}
                    className='ndpr-form-field__input ndpr-form-field__input--mono'
                    required
                  />
                </div>
              </div>
            )}
            
            {/* NDPA Notice */}
            <div className='ndpr-alert ndpr-alert--info'>
              <h3 className="text-sm font-bold ndpr-text-info mb-2">NDPA Breach Notification Requirements</h3>
              <p className="ndpr-text-info text-sm">
                Under the Nigeria Data Protection Act (NDPA), Section 40, data breaches that pose a risk to the rights and freedoms of data subjects must be reported to the NDPC within 72 hours of discovery.
                This report will help you comply with this requirement.
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className={resolveClass(`px-6 py-3 bg-[rgb(var(--ndpr-primary))] text-white rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] focus:ring-offset-2 ${buttonClassName}`, cn.primaryButton || cn.generateButton, unstyled)}
              >
                {generateButtonText}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
