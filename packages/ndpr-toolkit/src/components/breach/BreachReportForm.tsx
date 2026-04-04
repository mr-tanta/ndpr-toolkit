import React, { useState } from 'react';
import { BreachCategory } from '../../types/breach';

export interface BreachReportFormProps {
  /**
   * Available breach categories
   */
  categories: BreachCategory[];
  
  /**
   * Callback function called when form is submitted
   */
  onSubmit: (formData: any) => void;
  
  /**
   * Title displayed on the form
   * @default "Report a Data Breach"
   */
  title?: string;
  
  /**
   * Description text displayed on the form
   * @default "Use this form to report a suspected or confirmed data breach. All fields marked with * are required."
   */
  formDescription?: string;
  
  /**
   * Text for the submit button
   * @default "Submit Report"
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
   * Whether to show a confirmation message after submission
   * @default true
   */
  showConfirmation?: boolean;
  
  /**
   * Confirmation message to display after submission
   * @default "Your breach report has been submitted successfully. The data protection team has been notified."
   */
  confirmationMessage?: string;
  
  /**
   * Whether to allow file attachments
   * @default true
   */
  allowAttachments?: boolean;
  
  /**
   * Maximum number of attachments allowed
   * @default 5
   */
  maxAttachments?: number;
  
  /**
   * Maximum file size for attachments (in bytes)
   * @default 5242880 (5MB)
   */
  maxFileSize?: number;
  
  /**
   * Allowed file types for attachments
   * @default ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.txt']
   */
  allowedFileTypes?: string[];
}

export const BreachReportForm: React.FC<BreachReportFormProps> = ({
  categories,
  onSubmit,
  title = "Report a Data Breach",
  formDescription = "Use this form to report a suspected or confirmed data breach. All fields marked with * are required.",
  submitButtonText = "Submit Report",
  className = "",
  buttonClassName = "",
  showConfirmation = true,
  confirmationMessage = "Your breach report has been submitted successfully. The data protection team has been notified.",
  allowAttachments = true,
  maxAttachments = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.txt']
}) => {
  const [breachTitle, setBreachTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [discoveredAt, setDiscoveredAt] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>("");
  const [reporterName, setReporterName] = useState<string>("");
  const [reporterEmail, setReporterEmail] = useState<string>("");
  const [reporterDepartment, setReporterDepartment] = useState<string>("");
  const [reporterPhone, setReporterPhone] = useState<string>("");
  const [affectedSystems, setAffectedSystems] = useState<string[]>([]);
  const [affectedSystemsInput, setAffectedSystemsInput] = useState<string>("");
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [estimatedAffectedSubjects, setEstimatedAffectedSubjects] = useState<string>("");
  const [status, setStatus] = useState<'ongoing' | 'contained' | 'resolved'>('ongoing');
  const [initialActions, setInitialActions] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle affected systems input
  const handleAffectedSystemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store the raw input value so the input field shows exactly what the user typed
    const inputValue = e.target.value;
    setAffectedSystemsInput(inputValue);
    
    // Also update the parsed array for validation and submission
    const systems = inputValue.split(',').map(system => system.trim()).filter(Boolean);
    setAffectedSystems(systems);
  };
  
  // Handle data types change
  const handleDataTypesChange = (type: string) => {
    setDataTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles: File[] = [];
    const fileErrors: Record<string, string> = {};
    
    // Check if adding these files would exceed the maximum
    if (attachments.length + files.length > maxAttachments) {
      fileErrors.attachments = `Maximum of ${maxAttachments} files allowed`;
      setErrors(prev => ({ ...prev, ...fileErrors }));
      return;
    }
    
    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxFileSize) {
        fileErrors.attachments = `File ${file.name} exceeds the maximum size of ${maxFileSize / (1024 * 1024)}MB`;
        continue;
      }
      
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedFileTypes.includes(fileExtension)) {
        fileErrors.attachments = `File type ${fileExtension} is not allowed`;
        continue;
      }
      
      newFiles.push(file);
    }
    
    if (Object.keys(fileErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...fileErrors }));
    } else {
      setAttachments(prev => [...prev, ...newFiles]);
      setErrors(prev => ({ ...prev, attachments: '' }));
    }
  };
  
  // Remove an attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!breachTitle.trim()) {
      newErrors.breachTitle = "Breach title is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!category) {
      newErrors.category = "Category is required";
    }
    
    if (!discoveredAt) {
      newErrors.discoveredAt = "Discovery date is required";
    }
    
    if (!reporterName.trim()) {
      newErrors.reporterName = "Reporter name is required";
    }
    
    if (!reporterEmail.trim()) {
      newErrors.reporterEmail = "Reporter email is required";
    } else if (!/\S+@\S+\.\S+/.test(reporterEmail)) {
      newErrors.reporterEmail = "Reporter email is invalid";
    }
    
    if (!reporterDepartment.trim()) {
      newErrors.reporterDepartment = "Reporter department is required";
    }
    
    if (affectedSystems.length === 0) {
      newErrors.affectedSystems = "At least one affected system is required";
    }
    
    if (dataTypes.length === 0) {
      newErrors.dataTypes = "At least one data type is required";
    }
    
    if (estimatedAffectedSubjects && isNaN(Number(estimatedAffectedSubjects))) {
      newErrors.estimatedAffectedSubjects = "Estimated affected subjects must be a number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const formData = {
      title: breachTitle,
      description,
      category,
      discoveredAt: new Date(discoveredAt).getTime(),
      occurredAt: occurredAt ? new Date(occurredAt).getTime() : undefined,
      reportedAt: Date.now(),
      reporter: {
        name: reporterName,
        email: reporterEmail,
        department: reporterDepartment,
        phone: reporterPhone || undefined
      },
      affectedSystems,
      dataTypes,
      estimatedAffectedSubjects: estimatedAffectedSubjects ? Number(estimatedAffectedSubjects) : undefined,
      status,
      initialActions: initialActions || undefined,
      attachments: attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file
      }))
    };
    
    onSubmit(formData);
    
    if (showConfirmation) {
      setIsSubmitted(true);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className={`p-4 bg-green-50 dark:bg-green-900/20 rounded-md ${className}`}>
        <h2 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">Report Submitted</h2>
        <p className="text-green-700 dark:text-green-300">{confirmationMessage}</p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">Important: Next Steps</h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Under the NDPA (Section 40), data breaches that pose a risk to the rights and freedoms of data subjects must be reported to the NDPC within 72 hours of discovery.
            The data protection team will assess this breach and determine if notification is required.
          </p>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className={`mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${buttonClassName}`}
        >
          Report Another Breach
        </button>
      </div>
    );
  }
  
  // Common data types for breaches
  const commonDataTypes = [
    { id: 'personal', label: 'Personal Information (names, addresses)' },
    { id: 'contact', label: 'Contact Information (email, phone)' },
    { id: 'financial', label: 'Financial Information (bank details, payment info)' },
    { id: 'health', label: 'Health Information' },
    { id: 'identification', label: 'Identification Documents (ID cards, passports)' },
    { id: 'login', label: 'Login Credentials' },
    { id: 'biometric', label: 'Biometric Data' },
    { id: 'children', label: 'Children\'s Data' },
    { id: 'location', label: 'Location Data' },
    { id: 'communications', label: 'Communications Content' }
  ];
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{formDescription}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Breach Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Breach Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="breachTitle" className="block text-sm font-medium mb-1">
                  Breach Title/Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="breachTitle"
                  value={breachTitle}
                  onChange={e => setBreachTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.breachTitle && <p className="mt-1 text-sm text-red-500">{errors.breachTitle}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Breach Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              
              <div>
                <label htmlFor="discoveredAt" className="block text-sm font-medium mb-1">
                  Date Discovered <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="discoveredAt"
                  value={discoveredAt}
                  onChange={e => setDiscoveredAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.discoveredAt && <p className="mt-1 text-sm text-red-500">{errors.discoveredAt}</p>}
              </div>
              
              <div>
                <label htmlFor="occurredAt" className="block text-sm font-medium mb-1">
                  Date Occurred (if known)
                </label>
                <input
                  type="datetime-local"
                  id="occurredAt"
                  value={occurredAt}
                  onChange={e => setOccurredAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Reporter Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Reporter Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="reporterName" className="block text-sm font-medium mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reporterName"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.reporterName && <p className="mt-1 text-sm text-red-500">{errors.reporterName}</p>}
              </div>
              
              <div>
                <label htmlFor="reporterEmail" className="block text-sm font-medium mb-1">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="reporterEmail"
                  value={reporterEmail}
                  onChange={e => setReporterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.reporterEmail && <p className="mt-1 text-sm text-red-500">{errors.reporterEmail}</p>}
              </div>
              
              <div>
                <label htmlFor="reporterDepartment" className="block text-sm font-medium mb-1">
                  Your Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reporterDepartment"
                  value={reporterDepartment}
                  onChange={e => setReporterDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.reporterDepartment && <p className="mt-1 text-sm text-red-500">{errors.reporterDepartment}</p>}
              </div>
              
              <div>
                <label htmlFor="reporterPhone" className="block text-sm font-medium mb-1">
                  Your Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="reporterPhone"
                  value={reporterPhone}
                  onChange={e => setReporterPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Impact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Impact Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="affectedSystems" className="block text-sm font-medium mb-1">
                  Affected Systems/Applications <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="affectedSystems"
                  value={affectedSystemsInput}
                  onChange={handleAffectedSystemsChange}
                  placeholder="e.g. CRM, Email Server, Website (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.affectedSystems && <p className="mt-1 text-sm text-red-500">{errors.affectedSystems}</p>}
              </div>
              
              <div>
                <label htmlFor="estimatedAffectedSubjects" className="block text-sm font-medium mb-1">
                  Estimated Number of Affected Data Subjects
                </label>
                <input
                  type="text"
                  id="estimatedAffectedSubjects"
                  value={estimatedAffectedSubjects}
                  onChange={e => setEstimatedAffectedSubjects(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.estimatedAffectedSubjects && <p className="mt-1 text-sm text-red-500">{errors.estimatedAffectedSubjects}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Types of Data Involved <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonDataTypes.map(type => (
                    <div key={type.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`dataType_${type.id}`}
                        checked={dataTypes.includes(type.id)}
                        onChange={() => handleDataTypesChange(type.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`dataType_${type.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.dataTypes && <p className="mt-1 text-sm text-red-500">{errors.dataTypes}</p>}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Current Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value as 'ongoing' | 'contained' | 'resolved')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ongoing">Ongoing (breach is still active)</option>
                  <option value="contained">Contained (breach is stopped but not resolved)</option>
                  <option value="resolved">Resolved (breach is fully addressed)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="initialActions" className="block text-sm font-medium mb-1">
                  Initial Actions Taken
                </label>
                <textarea
                  id="initialActions"
                  value={initialActions}
                  onChange={e => setInitialActions(e.target.value)}
                  placeholder="Describe any immediate actions that have been taken to address the breach"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Attachments */}
          {allowAttachments && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Attachments</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Upload Supporting Files (Optional)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Max {maxAttachments} files, {maxFileSize / (1024 * 1024)}MB each. Allowed types: {allowedFileTypes.join(', ')}
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept={allowedFileTypes.join(',')}
                />
                {errors.attachments && <p className="mt-1 text-sm text-red-500">{errors.attachments}</p>}
              </div>
              
              {attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Attached Files:</h4>
                  <ul className="space-y-2">
                    {attachments.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* NDPA Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">NDPA Breach Notification Requirements</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Under the Nigeria Data Protection Act (NDPA), Section 40, data breaches that pose a risk to the rights and freedoms of data subjects must be reported to the NDPC within 72 hours of discovery.
              The data protection team will assess this breach and determine if notification is required.
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${buttonClassName}`}
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
