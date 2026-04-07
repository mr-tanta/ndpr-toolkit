import React, { useState } from 'react';
import { BreachCategory } from '../../types/breach';
import { resolveClass } from '../../utils/styling';
import { sanitizeInput } from '../../utils/sanitize';

/**
 * Represents the data submitted by the breach report form.
 */
export interface BreachFormSubmission {
  /** Title/summary of the breach */
  title: string;
  /** Detailed description of the breach */
  description: string;
  /** Breach category identifier */
  category: string;
  /** Timestamp (ms) when the breach was discovered */
  discoveredAt: number;
  /** Timestamp (ms) when the breach occurred (if known) */
  occurredAt?: number;
  /** Timestamp (ms) when the form was submitted */
  reportedAt: number;
  /** Person reporting the breach */
  reporter: {
    name: string;
    email: string;
    department: string;
    phone?: string;
  };
  /** Systems or applications affected by the breach */
  affectedSystems: string[];
  /** Types of data involved in the breach */
  dataTypes: string[];
  /** Estimated number of affected data subjects */
  estimatedAffectedSubjects?: number;
  /** Current status of the breach */
  status: 'ongoing' | 'contained' | 'resolved';
  /** Initial actions taken to address the breach */
  initialActions?: string;
  /** File attachments included with the report */
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    file: File;
  }>;
}

export interface BreachReportFormClassNames {
  root?: string;
  title?: string;
  form?: string;
  fieldGroup?: string;
  label?: string;
  input?: string;
  select?: string;
  textarea?: string;
  submitButton?: string;
  /** Alias for submitButton */
  primaryButton?: string;
  notice?: string;
  /** Custom class applied when isSubmitting is true (e.g. a loading overlay) */
  loadingOverlay?: string;
}

export interface BreachReportFormProps {
  /**
   * Available breach categories
   */
  categories: BreachCategory[];
  
  /**
   * Callback function called when form is submitted
   */
  onSubmit: (data: BreachFormSubmission) => void;

  /**
   * Callback function called when form validation fails
   */
  onValidationError?: (errors: Record<string, string>) => void;
  
  /**
   * Title displayed on the form
   * @default "Report a Data Breach"
   */
  title?: string;
  
  /**
   * Description text displayed on the form
   * @default "Use this form to report a suspected or confirmed data breach in accordance with NDPA Section 40. All fields marked with * are required."
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
   * Override class names for individual elements
   */
  classNames?: BreachReportFormClassNames;

  /**
   * Remove all default styles, only applying classNames overrides
   */
  unstyled?: boolean;

  /**
   * Whether the form is currently submitting.
   * When true, the submit button is disabled and shows "Submitting..." text.
   */
  isSubmitting?: boolean;

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

  /**
   * Default values to pre-fill form fields.
   * Useful for editing existing breach reports or pre-populating known data.
   */
  defaultValues?: Partial<BreachFormSubmission>;

  /**
   * Callback fired when the form is reset via the Reset button.
   * To fully remount the component (clearing all internal state),
   * change the `key` prop from the parent.
   */
  onReset?: () => void;
}

/**
 * Breach report form component. Implements NDPA Section 40 breach notification requirements,
 * enabling organizations to document and report data breaches within the mandated 72-hour window.
 */
export const BreachReportForm: React.FC<BreachReportFormProps> = ({
  categories,
  onSubmit,
  onValidationError,
  title = "Report a Data Breach",
  formDescription = "Use this form to report a suspected or confirmed data breach in accordance with NDPA Section 40. All fields marked with * are required.",
  submitButtonText = "Submit Report",
  className = "",
  buttonClassName = "",
  classNames: cn = {},
  unstyled = false,
  isSubmitting = false,
  showConfirmation = true,
  confirmationMessage = "Your breach report has been submitted successfully. The data protection team has been notified.",
  allowAttachments = true,
  maxAttachments = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  defaultValues,
  onReset
}) => {
  // Helper to format a timestamp (ms) to datetime-local string
  const formatDateTimeLocal = (timestamp?: number): string => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [breachTitle, setBreachTitle] = useState<string>(defaultValues?.title || "");
  const [description, setDescription] = useState<string>(defaultValues?.description || "");
  const [category, setCategory] = useState<string>(defaultValues?.category || "");
  const [discoveredAt, setDiscoveredAt] = useState<string>(formatDateTimeLocal(defaultValues?.discoveredAt));
  const [occurredAt, setOccurredAt] = useState<string>(formatDateTimeLocal(defaultValues?.occurredAt));
  const [reporterName, setReporterName] = useState<string>(defaultValues?.reporter?.name || "");
  const [reporterEmail, setReporterEmail] = useState<string>(defaultValues?.reporter?.email || "");
  const [reporterDepartment, setReporterDepartment] = useState<string>(defaultValues?.reporter?.department || "");
  const [reporterPhone, setReporterPhone] = useState<string>(defaultValues?.reporter?.phone || "");
  const [affectedSystems, setAffectedSystems] = useState<string[]>(defaultValues?.affectedSystems || []);
  const [affectedSystemsInput, setAffectedSystemsInput] = useState<string>(defaultValues?.affectedSystems?.join(', ') || "");
  const [dataTypes, setDataTypes] = useState<string[]>(defaultValues?.dataTypes || []);
  const [estimatedAffectedSubjects, setEstimatedAffectedSubjects] = useState<string>(
    defaultValues?.estimatedAffectedSubjects != null ? String(defaultValues.estimatedAffectedSubjects) : ""
  );
  const [status, setStatus] = useState<'ongoing' | 'contained' | 'resolved'>(defaultValues?.status || 'ongoing');
  const [initialActions, setInitialActions] = useState<string>(defaultValues?.initialActions || "");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset all fields to empty state
  const handleReset = () => {
    setBreachTitle("");
    setDescription("");
    setCategory("");
    setDiscoveredAt("");
    setOccurredAt("");
    setReporterName("");
    setReporterEmail("");
    setReporterDepartment("");
    setReporterPhone("");
    setAffectedSystems([]);
    setAffectedSystemsInput("");
    setDataTypes([]);
    setEstimatedAffectedSubjects("");
    setStatus('ongoing');
    setInitialActions("");
    setAttachments([]);
    setIsSubmitted(false);
    setErrors({});
    onReset?.();
  };

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
  const validateForm = (): Record<string, string> => {
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
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(reporterEmail)) {
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
    return newErrors;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      onValidationError?.(validationErrors);
      return;
    }

    // Sanitize all text field values to prevent XSS
    const formData: BreachFormSubmission = {
      title: sanitizeInput(breachTitle),
      description: sanitizeInput(description),
      category,
      discoveredAt: new Date(discoveredAt).getTime(),
      occurredAt: occurredAt ? new Date(occurredAt).getTime() : undefined,
      reportedAt: Date.now(),
      reporter: {
        name: sanitizeInput(reporterName),
        email: sanitizeInput(reporterEmail),
        department: sanitizeInput(reporterDepartment),
        phone: reporterPhone ? sanitizeInput(reporterPhone) : undefined
      },
      affectedSystems: affectedSystems.map(s => sanitizeInput(s)),
      dataTypes,
      estimatedAffectedSubjects: estimatedAffectedSubjects ? Number(estimatedAffectedSubjects) : undefined,
      status,
      initialActions: initialActions ? sanitizeInput(initialActions) : undefined,
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
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, cn.root, unstyled)}>
      <h2 className={resolveClass("text-xl font-bold mb-2", cn.title, unstyled)}>{title}</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{formDescription}</p>

      <form onSubmit={handleSubmit} className={resolveClass("", cn.form, unstyled)}>
        <div className="space-y-6">
          {/* Basic Breach Information */}
          <div className={resolveClass("", cn.fieldGroup, unstyled)}>
            <h3 className="text-lg font-semibold mb-3">Breach Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="breachTitle" className={resolveClass("block text-sm font-medium mb-1", cn.label, unstyled)}>
                  Breach Title/Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="breachTitle"
                  value={breachTitle}
                  onChange={e => setBreachTitle(e.target.value)}
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]", cn.input, unstyled)}
                  required
                  aria-invalid={!!errors.breachTitle}
                  aria-describedby={errors.breachTitle ? "breachTitle-error" : undefined}
                />
                {errors.breachTitle && <p id="breachTitle-error" role="alert" className="mt-1 text-sm text-red-500">{errors.breachTitle}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className={resolveClass("block text-sm font-medium mb-1", cn.label, unstyled)}>
                  Breach Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]", cn.select, unstyled)}
                  required
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? "category-error" : undefined}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p id="category-error" role="alert" className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className={resolveClass("block text-sm font-medium mb-1", cn.label, unstyled)}>
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]", cn.textarea, unstyled)}
                  required
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && <p id="description-error" role="alert" className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  required
                  aria-invalid={!!errors.discoveredAt}
                  aria-describedby={errors.discoveredAt ? "discoveredAt-error" : undefined}
                />
                {errors.discoveredAt && <p id="discoveredAt-error" role="alert" className="mt-1 text-sm text-red-500">{errors.discoveredAt}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  required
                  aria-invalid={!!errors.reporterName}
                  aria-describedby={errors.reporterName ? "reporterName-error" : undefined}
                />
                {errors.reporterName && <p id="reporterName-error" role="alert" className="mt-1 text-sm text-red-500">{errors.reporterName}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  required
                  aria-invalid={!!errors.reporterEmail}
                  aria-describedby={errors.reporterEmail ? "reporterEmail-error" : undefined}
                />
                {errors.reporterEmail && <p id="reporterEmail-error" role="alert" className="mt-1 text-sm text-red-500">{errors.reporterEmail}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  required
                  aria-invalid={!!errors.reporterDepartment}
                  aria-describedby={errors.reporterDepartment ? "reporterDepartment-error" : undefined}
                />
                {errors.reporterDepartment && <p id="reporterDepartment-error" role="alert" className="mt-1 text-sm text-red-500">{errors.reporterDepartment}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  required
                  aria-invalid={!!errors.affectedSystems}
                  aria-describedby={errors.affectedSystems ? "affectedSystems-error" : undefined}
                />
                {errors.affectedSystems && <p id="affectedSystems-error" role="alert" className="mt-1 text-sm text-red-500">{errors.affectedSystems}</p>}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  aria-invalid={!!errors.estimatedAffectedSubjects}
                  aria-describedby={errors.estimatedAffectedSubjects ? "estimatedAffectedSubjects-error" : undefined}
                />
                {errors.estimatedAffectedSubjects && <p id="estimatedAffectedSubjects-error" role="alert" className="mt-1 text-sm text-red-500">{errors.estimatedAffectedSubjects}</p>}
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
                        className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
                      />
                      <label htmlFor={`dataType_${type.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.dataTypes && <p id="dataTypes-error" role="alert" className="mt-1 text-sm text-red-500">{errors.dataTypes}</p>}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Current Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value as 'ongoing' | 'contained' | 'resolved')}
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]", cn.select, unstyled)}
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
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]", cn.textarea, unstyled)}
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
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Max {maxAttachments} files, {maxFileSize / (1024 * 1024)}MB each. Allowed types: {allowedFileTypes.join(', ')}
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]"
                  accept={allowedFileTypes.join(',')}
                />
                {errors.attachments && <p id="attachments-error" role="alert" className="mt-1 text-sm text-red-500">{errors.attachments}</p>}
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
                          <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
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
          <div className={resolveClass("mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md", cn.notice, unstyled)}>
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">NDPA Breach Notification Requirements</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Under the Nigeria Data Protection Act (NDPA), Section 40, data breaches that pose a risk to the rights and freedoms of data subjects must be reported to the NDPC within 72 hours of discovery.
              The data protection team will assess this breach and determine if notification is required.
            </p>
          </div>
          
          {/* Form Actions */}
          <div className="mt-6 relative flex gap-3">
            {isSubmitting && cn.loadingOverlay && (
              <div className={cn.loadingOverlay} />
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={resolveClass(`px-6 py-3 bg-[rgb(var(--ndpr-primary))] text-white rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))] focus:ring-offset-2 ${buttonClassName} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`, cn.primaryButton || cn.submitButton, unstyled)}
            >
              {isSubmitting ? 'Submitting...' : submitButtonText}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className={resolveClass("px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2", undefined, unstyled)}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
