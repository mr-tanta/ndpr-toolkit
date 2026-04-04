import React, { useState, useEffect } from 'react';
import { BreachReport, RiskAssessment, RegulatoryNotification } from '../../types/breach';

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
   * @default "Generate a report for submission to the NDPC in compliance with the NDPA breach notification requirements."
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

export const RegulatoryReportGenerator: React.FC<RegulatoryReportGeneratorProps> = ({
  breachData,
  assessmentData,
  organizationInfo,
  onGenerate,
  title = "Generate NDPC Notification Report",
  description = "Generate a report for submission to the NDPC in compliance with the NDPA breach notification requirements.",
  generateButtonText = "Generate Report",
  className = "",
  buttonClassName = "",
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
  
  // Generate the initial report content
  useEffect(() => {
    if (!isGenerated) {
      const initialContent = generateInitialContent();
      setReportContent(initialContent);
      setIsGenerated(true);
    }
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
    // In a real implementation, this would generate a PDF, DOCX, or HTML file
    // For this example, we'll just create a text file
    
    const element = document.createElement('a');
    const file = new Blob([reportContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `NDPC_Breach_Notification_${new Date().toISOString().split('T')[0]}.txt`;
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
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
      
      {isSubmitted ? (
        <div>
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">Report Generated Successfully</h3>
            <p className="text-green-700 dark:text-green-300">
              Your NDPC notification report has been generated and is ready for submission.
              Please review the report carefully before submitting it to the NDPC.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Submission Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm"><span className="font-medium">Method:</span> {method.charAt(0).toUpperCase() + method.slice(1)}</p>
                {contactName && <p className="text-sm"><span className="font-medium">Contact Name:</span> {contactName}</p>}
                {contactEmail && <p className="text-sm"><span className="font-medium">Contact Email:</span> {contactEmail}</p>}
                {contactPhone && <p className="text-sm"><span className="font-medium">Contact Phone:</span> {contactPhone}</p>}
              </div>
              <div>
                <p className="text-sm"><span className="font-medium">Date Generated:</span> {formatDate(Date.now())}</p>
                <p className="text-sm"><span className="font-medium">Breach ID:</span> {breachData.id}</p>
                {referenceNumber && <p className="text-sm"><span className="font-medium">Reference Number:</span> {referenceNumber}</p>}
              </div>
            </div>
          </div>
          
          {showPreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Report Preview</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 dark:text-gray-200">
                  {reportContent}
                </pre>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            {allowDownload && (
              <button
                onClick={handleDownload}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${buttonClassName}`}
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
          <div className="space-y-6">
            {/* Notification Method */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Notification Method</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="method" className="block text-sm font-medium mb-1">
                    Method of Submission <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="method"
                    value={method}
                    onChange={e => setMethod(e.target.value as 'email' | 'portal' | 'letter' | 'other')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {renderMethodOptions()}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="referenceNumber" className="block text-sm font-medium mb-1">
                    Reference Number (if available)
                  </label>
                  <input
                    type="text"
                    id="referenceNumber"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    placeholder="e.g. NDPC/BR/2024/001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* NDPC Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-3">NDPC Contact (if known)</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">
                  Additional Information to Include
                </label>
                <textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={e => setAdditionalInfo(e.target.value)}
                  rows={3}
                  placeholder="Any additional information you want to include in the report"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Report Content */}
            {allowEditing && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Report Content</h3>
                <div>
                  <label htmlFor="reportContent" className="block text-sm font-medium mb-1">
                    Edit Report Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reportContent"
                    value={reportContent}
                    onChange={e => setReportContent(e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* NDPA Notice */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">NDPA Breach Notification Requirements</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Under the Nigeria Data Protection Act (NDPA), Section 40, data breaches that pose a risk to the rights and freedoms of data subjects must be reported to the NDPC within 72 hours of discovery.
                This report will help you comply with this requirement.
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${buttonClassName}`}
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
