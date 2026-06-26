import React, { useState, useMemo } from 'react';
import { BreachCategory, BreachReport } from '../../types/breach';
import { resolveClass } from '../../utils/styling';
import { sanitizeInput } from '../../utils/sanitize';
import { assessBreachNotification } from '../../utils/breach-notification';
import { useNDPRLocale } from '../NDPRProvider';

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
  /**
   * Approximate number of personal data RECORDS concerned. Distinct from
   * subject count (one subject may have many records). NDPA Section 40(2).
   */
  approximateRecordCount?: number;
  /**
   * Categories of data subjects affected (e.g. customers, employees, minors).
   * NDPA Section 40(2).
   */
  dataSubjectCategories?: string[];
  /** Whether sensitive personal data (NDPA Section 30) is involved */
  involvesSensitiveData?: boolean;
  /**
   * Likely consequences of the breach for affected data subjects.
   * Required content for the NDPC report and Section 40(3) communications.
   */
  likelyConsequences?: string;
  /**
   * Measures taken or proposed to mitigate adverse effects.
   * NDPA Section 40(3).
   */
  mitigationMeasures?: string;
  /**
   * Data Protection Officer contact details (Section 32(3)(c) — DPO is the
   * named NDPC contact). Falls back to organisation-level DPO if omitted.
   */
  dpoContact?: {
    name: string;
    email: string;
    phone?: string;
  };
  /**
   * Whether this is a phased / interim report submitted under Section 40(2)
   * before complete information is available.
   */
  isPhasedReport?: boolean;
  /** ID of the prior phased report this report supplements, if any. */
  supplementsReportId?: string;
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
  /** Live NDPC-notification completeness panel */
  completeness?: string;
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
   * Description text displayed on the form.
   *
   * @default "Use this form to report a suspected or confirmed data breach in accordance with NDPA Section 40. All fields marked with * are required."
   */
  description?: string;
  
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

  /**
   * Show a live NDPC-notification readiness panel that scores the form against
   * the NDPA S. 40 / GAID 2025 Article 33 mandated content and the 72-hour
   * deadline as the user fills it in.
   * @default true
   */
  showCompleteness?: boolean;
}

/**
 * Breach report form component. Implements NDPA Section 40 breach notification requirements,
 * enabling organizations to document and report data breaches within the mandated 72-hour window.
 */
export const BreachReportForm: React.FC<BreachReportFormProps> = ({
  categories,
  onSubmit,
  onValidationError,
  // Text-override props default to `undefined` so the i18n fallback chain
  // (prop → useNDPRLocale → English default) works. Pre-3.10.4 these
  // defaulted directly to English.
  title,
  description,
  submitButtonText,
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
  onReset,
  showCompleteness = true
}) => {
  // i18n: explicit prop > provider locale > English default.
  // (4.0: legacy `formDescription` alias removed — use `description`.)
  const locale = useNDPRLocale();
  const resolvedTitle = title ?? locale.breach.title ?? 'Report a Data Breach';
  const resolvedFormDescription =
    description ?? locale.breach.description ??
    'Use this form to report a suspected or confirmed data breach in accordance with NDPA Section 40. All fields marked with * are required.';
  const resolvedSubmit = submitButtonText ?? locale.breach.submitReport ?? 'Submit Report';

  // Helper to format a timestamp (ms) to datetime-local string
  const formatDateTimeLocal = (timestamp?: number): string => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [breachTitle, setBreachTitle] = useState<string>(defaultValues?.title || "");
  // Renamed in 3.13 from `description` to `breachDescription` because the
  // canonical 3.13+ prop is also called `description` (the title-card text
  // displayed above the form). The state variable holds the breach's own
  // free-text description from the textarea field.
  const [breachDescription, setBreachDescription] = useState<string>(defaultValues?.description || "");
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
  const [approximateRecordCount, setApproximateRecordCount] = useState<string>(
    defaultValues?.approximateRecordCount != null ? String(defaultValues.approximateRecordCount) : ""
  );
  const [dataSubjectCategoriesInput, setDataSubjectCategoriesInput] = useState<string>(
    defaultValues?.dataSubjectCategories?.join(', ') || ""
  );
  const [involvesSensitiveData, setInvolvesSensitiveData] = useState<boolean>(
    defaultValues?.involvesSensitiveData ?? false
  );
  const [likelyConsequences, setLikelyConsequences] = useState<string>(defaultValues?.likelyConsequences || "");
  const [mitigationMeasures, setMitigationMeasures] = useState<string>(defaultValues?.mitigationMeasures || "");
  const [dpoName, setDpoName] = useState<string>(defaultValues?.dpoContact?.name || "");
  const [dpoEmail, setDpoEmail] = useState<string>(defaultValues?.dpoContact?.email || "");
  const [dpoPhone, setDpoPhone] = useState<string>(defaultValues?.dpoContact?.phone || "");
  const [isPhasedReport, setIsPhasedReport] = useState<boolean>(defaultValues?.isPhasedReport ?? false);
  const [supplementsReportId, setSupplementsReportId] = useState<string>(defaultValues?.supplementsReportId || "");
  const [status, setStatus] = useState<'ongoing' | 'contained' | 'resolved'>(defaultValues?.status || 'ongoing');
  const [initialActions, setInitialActions] = useState<string>(defaultValues?.initialActions || "");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Live NDPC-notification readiness derived from the current field values.
  const assessment = useMemo(() => {
    const liveReport: BreachReport = {
      id: '',
      title: breachTitle,
      description: breachDescription,
      category,
      discoveredAt: discoveredAt ? new Date(discoveredAt).getTime() : NaN,
      occurredAt: occurredAt ? new Date(occurredAt).getTime() : undefined,
      reportedAt: 0,
      reporter: { name: reporterName, email: reporterEmail, department: reporterDepartment, phone: reporterPhone || undefined },
      affectedSystems,
      dataTypes,
      estimatedAffectedSubjects: estimatedAffectedSubjects ? Number(estimatedAffectedSubjects) : undefined,
      approximateRecordCount: approximateRecordCount ? Number(approximateRecordCount) : undefined,
      dataSubjectCategories: dataSubjectCategoriesInput
        ? dataSubjectCategoriesInput.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      involvesSensitiveData,
      likelyConsequences: likelyConsequences || undefined,
      mitigationMeasures: mitigationMeasures || undefined,
      dpoContact: (dpoName || dpoEmail) ? { name: dpoName, email: dpoEmail, phone: dpoPhone || undefined } : undefined,
      status,
      initialActions: initialActions || undefined,
    };
    return assessBreachNotification(liveReport, { highRisk: involvesSensitiveData });
  }, [
    breachTitle, breachDescription, category, discoveredAt, occurredAt,
    reporterName, reporterEmail, reporterDepartment, reporterPhone,
    affectedSystems, dataTypes, estimatedAffectedSubjects, approximateRecordCount,
    dataSubjectCategoriesInput, involvesSensitiveData, likelyConsequences, mitigationMeasures,
    dpoName, dpoEmail, dpoPhone, status, initialActions,
  ]);
  const allItems = [...assessment.notificationToCommission, ...assessment.dataSubjectCommunication];
  const totalItems = allItems.length;
  const satisfiedItems = totalItems - assessment.missing.length;

  // Reset all fields to empty state
  const handleReset = () => {
    setBreachTitle("");
    setBreachDescription("");
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
    setApproximateRecordCount("");
    setDataSubjectCategoriesInput("");
    setInvolvesSensitiveData(false);
    setLikelyConsequences("");
    setMitigationMeasures("");
    setDpoName("");
    setDpoEmail("");
    setDpoPhone("");
    setIsPhasedReport(false);
    setSupplementsReportId("");
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
    
    if (newFiles.length > 0) {
      setAttachments(prev => [...prev, ...newFiles]);
    }
    if (Object.keys(fileErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...fileErrors }));
    } else {
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

    if (!breachDescription.trim()) {
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
      description: sanitizeInput(breachDescription),
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
      approximateRecordCount: approximateRecordCount ? Number(approximateRecordCount) : undefined,
      dataSubjectCategories: dataSubjectCategoriesInput
        ? dataSubjectCategoriesInput.split(',').map(s => sanitizeInput(s.trim())).filter(Boolean)
        : undefined,
      involvesSensitiveData,
      likelyConsequences: likelyConsequences ? sanitizeInput(likelyConsequences) : undefined,
      mitigationMeasures: mitigationMeasures ? sanitizeInput(mitigationMeasures) : undefined,
      dpoContact: (dpoName || dpoEmail)
        ? {
            name: sanitizeInput(dpoName),
            email: sanitizeInput(dpoEmail),
            phone: dpoPhone ? sanitizeInput(dpoPhone) : undefined,
          }
        : undefined,
      isPhasedReport: isPhasedReport || undefined,
      supplementsReportId: supplementsReportId ? sanitizeInput(supplementsReportId) : undefined,
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
      <div data-ndpr-component="breach-report-form" className={`p-4 bg-green-50 dark:bg-green-900/20 rounded-md ${className}`}>
        <h2 className="text-lg font-bold ndpr-text-success mb-2">Report Submitted</h2>
        <p className="ndpr-text-success">{confirmationMessage}</p>
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <h3 className="text-sm font-bold ndpr-text-warning mb-2">Important: Next Steps</h3>
          <p className="ndpr-text-warning text-sm">
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
      <h2 className={resolveClass('ndpr-section-heading', cn.title, unstyled)}>{resolvedTitle}</h2>
      <p className='ndpr-card__subtitle'>{resolvedFormDescription}</p>

      {showCompleteness && (
        <div
          data-ndpr-section="breach-completeness"
          className={resolveClass('ndpr-alert ndpr-alert--info mb-4', cn.completeness, unstyled)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold ndpr-text-info">NDPC notification readiness</h3>
            <span className="text-sm font-semibold ndpr-text-info">{assessment.completeness}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={assessment.completeness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Breach notification completeness"
            className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2"
          >
            <div className="h-full bg-[rgb(var(--ndpr-primary))]" style={{ width: `${assessment.completeness}%` }} />
          </div>
          <p className="text-sm ndpr-text-info">
            {satisfiedItems} of {totalItems} mandated items provided (GAID 2025 Art. 33(5) / NDPA S. 40(2)).
          </p>
          {Number.isFinite(assessment.timing.deadline) ? (
            assessment.timing.overdue ? (
              <p className="text-sm ndpr-text-warning mt-1">
                72-hour deadline passed {Math.abs(assessment.timing.hoursRemaining)}h ago — notify the NDPC now and state the reason for the delay (NDPA S. 40(2)).
              </p>
            ) : (
              <p className="text-sm ndpr-text-info mt-1">
                {Math.max(0, assessment.timing.hoursRemaining)}h remaining to notify the NDPC (72-hour window, NDPA S. 40(2)).
              </p>
            )
          ) : (
            <p className="text-sm ndpr-text-muted mt-1">Set the discovery date to start the 72-hour clock.</p>
          )}
          {assessment.dataSubjectCommunicationRequired && (
            <p className="text-sm ndpr-text-warning mt-1">
              High risk: affected data subjects must be notified in plain, clear language (NDPA S. 40(3)).
            </p>
          )}
          {assessment.missing.length > 0 && (
            <details className="mt-2">
              <summary className="text-sm ndpr-text-info cursor-pointer">{assessment.missing.length} item(s) still needed</summary>
              <ul className="mt-1 list-disc pl-5">
                {allItems.filter(i => !i.satisfied).map(i => (
                  <li key={i.id} className="text-xs ndpr-text-muted">
                    {i.label} <span className="opacity-70">({i.section})</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={resolveClass("", cn.form, unstyled)}>
        <div className='ndpr-form-section'>
          {/* Basic Breach Information */}
          <div className={resolveClass("", cn.fieldGroup, unstyled)}>
            <h3 className='ndpr-section-heading'>Breach Information</h3>
            <div className='ndpr-form-grid ndpr-form-grid--2'>
              <div>
                <label htmlFor="breachTitle" className={resolveClass('ndpr-form-field__label', cn.label, unstyled)}>
                  Breach Title/Summary <span className="ndpr-form-field__required">*</span>
                </label>
                <input
                  type="text"
                  id="breachTitle"
                  value={breachTitle}
                  onChange={e => setBreachTitle(e.target.value)}
                  className={resolveClass('ndpr-form-field__input', cn.input, unstyled)}
                  required
                  aria-invalid={!!errors.breachTitle}
                  aria-describedby={errors.breachTitle ? "breachTitle-error" : undefined}
                />
                {errors.breachTitle && <p id="breachTitle-error" role="alert" className="ndpr-form-field__error">{errors.breachTitle}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className={resolveClass('ndpr-form-field__label', cn.label, unstyled)}>
                  Breach Category <span className="ndpr-form-field__required">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={resolveClass('ndpr-form-field__input', cn.select, unstyled)}
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
                {errors.category && <p id="category-error" role="alert" className="ndpr-form-field__error">{errors.category}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className={resolveClass('ndpr-form-field__label', cn.label, unstyled)}>
                  Detailed Description <span className="ndpr-form-field__required">*</span>
                </label>
                <textarea
                  id="description"
                  value={breachDescription}
                  onChange={e => setBreachDescription(e.target.value)}
                  rows={4}
                  className={resolveClass('ndpr-form-field__input', cn.textarea, unstyled)}
                  required
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                />
                {errors.description && <p id="description-error" role="alert" className="ndpr-form-field__error">{errors.description}</p>}
              </div>
              
              <div>
                <label htmlFor="discoveredAt" className='ndpr-form-field__label'>
                  Date Discovered <span className="ndpr-form-field__required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="discoveredAt"
                  value={discoveredAt}
                  onChange={e => setDiscoveredAt(e.target.value)}
                  className='ndpr-form-field__input'
                  required
                  aria-invalid={!!errors.discoveredAt}
                  aria-describedby={errors.discoveredAt ? "discoveredAt-error" : undefined}
                />
                {errors.discoveredAt && <p id="discoveredAt-error" role="alert" className="ndpr-form-field__error">{errors.discoveredAt}</p>}
              </div>
              
              <div>
                <label htmlFor="occurredAt" className='ndpr-form-field__label'>
                  Date Occurred (if known)
                </label>
                <input
                  type="datetime-local"
                  id="occurredAt"
                  value={occurredAt}
                  onChange={e => setOccurredAt(e.target.value)}
                  className='ndpr-form-field__input'
                />
              </div>
            </div>
          </div>
          
          {/* Reporter Information */}
          <div>
            <h3 className='ndpr-section-heading'>Reporter Information</h3>
            <div className='ndpr-form-grid ndpr-form-grid--2'>
              <div>
                <label htmlFor="reporterName" className='ndpr-form-field__label'>
                  Your Name <span className="ndpr-form-field__required">*</span>
                </label>
                <input
                  type="text"
                  id="reporterName"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  className='ndpr-form-field__input'
                  required
                  aria-invalid={!!errors.reporterName}
                  aria-describedby={errors.reporterName ? "reporterName-error" : undefined}
                />
                {errors.reporterName && <p id="reporterName-error" role="alert" className="ndpr-form-field__error">{errors.reporterName}</p>}
              </div>
              
              <div>
                <label htmlFor="reporterEmail" className='ndpr-form-field__label'>
                  Your Email <span className="ndpr-form-field__required">*</span>
                </label>
                <input
                  type="email"
                  id="reporterEmail"
                  value={reporterEmail}
                  onChange={e => setReporterEmail(e.target.value)}
                  className='ndpr-form-field__input'
                  required
                  aria-invalid={!!errors.reporterEmail}
                  aria-describedby={errors.reporterEmail ? "reporterEmail-error" : undefined}
                />
                {errors.reporterEmail && <p id="reporterEmail-error" role="alert" className="ndpr-form-field__error">{errors.reporterEmail}</p>}
              </div>
              
              <div>
                <label htmlFor="reporterDepartment" className='ndpr-form-field__label'>
                  Your Department <span className="ndpr-form-field__required">*</span>
                </label>
                <input
                  type="text"
                  id="reporterDepartment"
                  value={reporterDepartment}
                  onChange={e => setReporterDepartment(e.target.value)}
                  className='ndpr-form-field__input'
                  required
                  aria-invalid={!!errors.reporterDepartment}
                  aria-describedby={errors.reporterDepartment ? "reporterDepartment-error" : undefined}
                />
                {errors.reporterDepartment && <p id="reporterDepartment-error" role="alert" className="ndpr-form-field__error">{errors.reporterDepartment}</p>}
              </div>
              
              <div>
                <label htmlFor="reporterPhone" className='ndpr-form-field__label'>
                  Your Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="reporterPhone"
                  value={reporterPhone}
                  onChange={e => setReporterPhone(e.target.value)}
                  className='ndpr-form-field__input'
                />
              </div>
            </div>
          </div>
          
          {/* Impact Information */}
          <div>
            <h3 className='ndpr-section-heading'>Impact Information</h3>
            <div className='ndpr-form-grid ndpr-form-grid--2'>
              <div>
                <label htmlFor="affectedSystems" className='ndpr-form-field__label'>
                  Affected Systems/Applications <span className="ndpr-form-field__required">*</span>
                </label>
                <input
                  type="text"
                  id="affectedSystems"
                  value={affectedSystemsInput}
                  onChange={handleAffectedSystemsChange}
                  placeholder="e.g. CRM, Email Server, Website (comma separated)"
                  className='ndpr-form-field__input'
                  required
                  aria-invalid={!!errors.affectedSystems}
                  aria-describedby={errors.affectedSystems ? "affectedSystems-error" : undefined}
                />
                {errors.affectedSystems && <p id="affectedSystems-error" role="alert" className="ndpr-form-field__error">{errors.affectedSystems}</p>}
              </div>
              
              <div>
                <label htmlFor="estimatedAffectedSubjects" className='ndpr-form-field__label'>
                  Estimated Number of Affected Data Subjects
                </label>
                <input
                  type="text"
                  id="estimatedAffectedSubjects"
                  value={estimatedAffectedSubjects}
                  onChange={e => setEstimatedAffectedSubjects(e.target.value)}
                  placeholder="e.g. 100"
                  className='ndpr-form-field__input'
                  aria-invalid={!!errors.estimatedAffectedSubjects}
                  aria-describedby={errors.estimatedAffectedSubjects ? "estimatedAffectedSubjects-error" : undefined}
                />
                {errors.estimatedAffectedSubjects && <p id="estimatedAffectedSubjects-error" role="alert" className="ndpr-form-field__error">{errors.estimatedAffectedSubjects}</p>}
              </div>
              
              <fieldset
                className="md:col-span-2"
                aria-invalid={!!errors.dataTypes}
                aria-describedby={errors.dataTypes ? 'dataTypes-error' : undefined}
              >
                <legend className='ndpr-form-field__label'>
                  Types of Data Involved <span className="ndpr-form-field__required" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </legend>
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
                      <label htmlFor={`dataType_${type.id}`} className="ml-2 text-sm ndpr-text-muted">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.dataTypes && <p id="dataTypes-error" role="alert" className="ndpr-form-field__error">{errors.dataTypes}</p>}
              </fieldset>
              
              <div>
                <label htmlFor="status" className='ndpr-form-field__label'>
                  Current Status <span className="ndpr-form-field__required">*</span>
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value as 'ongoing' | 'contained' | 'resolved')}
                  className={resolveClass('ndpr-form-field__input', cn.select, unstyled)}
                  required
                >
                  <option value="ongoing">Ongoing (breach is still active)</option>
                  <option value="contained">Contained (breach is stopped but not resolved)</option>
                  <option value="resolved">Resolved (breach is fully addressed)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="approximateRecordCount" className='ndpr-form-field__label'>
                  Approximate Number of Records Concerned
                </label>
                <input
                  type="text"
                  id="approximateRecordCount"
                  value={approximateRecordCount}
                  onChange={e => setApproximateRecordCount(e.target.value)}
                  placeholder="e.g. 5000"
                  className='ndpr-form-field__input'
                />
                <p className="text-xs ndpr-text-muted mt-1">Required for the NDPC report (NDPA Section 40(2)).</p>
              </div>

              <div>
                <label htmlFor="dataSubjectCategories" className='ndpr-form-field__label'>
                  Categories of Data Subjects Affected
                </label>
                <input
                  type="text"
                  id="dataSubjectCategories"
                  value={dataSubjectCategoriesInput}
                  onChange={e => setDataSubjectCategoriesInput(e.target.value)}
                  placeholder="e.g. customers, employees, minors"
                  className='ndpr-form-field__input'
                />
                <p className="text-xs ndpr-text-muted mt-1">Comma-separated. Required for the NDPC report (NDPA Section 40(2)).</p>
              </div>

              <div className="md:col-span-2 flex items-center">
                <input
                  id="involvesSensitiveData"
                  type="checkbox"
                  checked={involvesSensitiveData}
                  onChange={e => setInvolvesSensitiveData(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
                />
                <label htmlFor="involvesSensitiveData" className="ml-2 text-sm ndpr-text-muted">
                  Sensitive personal data (NDPA Section 30) is involved
                </label>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="likelyConsequences" className='ndpr-form-field__label'>
                  Likely Consequences for Data Subjects
                </label>
                <textarea
                  id="likelyConsequences"
                  value={likelyConsequences}
                  onChange={e => setLikelyConsequences(e.target.value)}
                  placeholder="e.g. identity theft, financial loss, reputational damage, discrimination"
                  rows={3}
                  className={resolveClass('ndpr-form-field__input', cn.textarea, unstyled)}
                />
                <p className="text-xs ndpr-text-muted mt-1">Required content for NDPC report and Section 40(3) communications to data subjects.</p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="mitigationMeasures" className='ndpr-form-field__label'>
                  Mitigation Measures
                </label>
                <textarea
                  id="mitigationMeasures"
                  value={mitigationMeasures}
                  onChange={e => setMitigationMeasures(e.target.value)}
                  placeholder="Measures taken or proposed to mitigate possible adverse effects (NDPA Section 40(3))"
                  rows={3}
                  className={resolveClass('ndpr-form-field__input', cn.textarea, unstyled)}
                />
              </div>

              <div className="md:col-span-2">
                <h4 className="ndpr-section-heading text-sm mt-4">Data Protection Officer (NDPC contact)</h4>
                <p className="text-xs ndpr-text-muted mb-2">Defaults to organisation-level DPO if left blank.</p>
              </div>

              <div>
                <label htmlFor="dpoName" className='ndpr-form-field__label'>DPO Name</label>
                <input
                  type="text"
                  id="dpoName"
                  value={dpoName}
                  onChange={e => setDpoName(e.target.value)}
                  className='ndpr-form-field__input'
                />
              </div>

              <div>
                <label htmlFor="dpoEmail" className='ndpr-form-field__label'>DPO Email</label>
                <input
                  type="email"
                  id="dpoEmail"
                  value={dpoEmail}
                  onChange={e => setDpoEmail(e.target.value)}
                  className='ndpr-form-field__input'
                />
              </div>

              <div>
                <label htmlFor="dpoPhone" className='ndpr-form-field__label'>DPO Phone</label>
                <input
                  type="tel"
                  id="dpoPhone"
                  value={dpoPhone}
                  onChange={e => setDpoPhone(e.target.value)}
                  className='ndpr-form-field__input'
                />
              </div>

              <div className="md:col-span-2 flex items-center mt-2">
                <input
                  id="isPhasedReport"
                  type="checkbox"
                  checked={isPhasedReport}
                  onChange={e => setIsPhasedReport(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[rgb(var(--ndpr-primary))] focus:ring-[rgb(var(--ndpr-ring))]"
                />
                <label htmlFor="isPhasedReport" className="ml-2 text-sm ndpr-text-muted">
                  This is a phased / interim report (Section 40(2) — complete info not yet available)
                </label>
              </div>

              {isPhasedReport && (
                <div className="md:col-span-2">
                  <label htmlFor="supplementsReportId" className='ndpr-form-field__label'>
                    Supplements Report ID (if applicable)
                  </label>
                  <input
                    type="text"
                    id="supplementsReportId"
                    value={supplementsReportId}
                    onChange={e => setSupplementsReportId(e.target.value)}
                    placeholder="Prior report ID this report supplements"
                    className='ndpr-form-field__input'
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label htmlFor="initialActions" className='ndpr-form-field__label'>
                  Initial Actions Taken
                </label>
                <textarea
                  id="initialActions"
                  value={initialActions}
                  onChange={e => setInitialActions(e.target.value)}
                  placeholder="Describe any immediate actions that have been taken to address the breach"
                  rows={3}
                  className={resolveClass('ndpr-form-field__input', cn.textarea, unstyled)}
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          {allowAttachments && (
            <div>
              <h3 className='ndpr-section-heading'>Attachments</h3>
              <div className='ndpr-form-field'>
                <label htmlFor="breach-attachments" className='ndpr-form-field__label'>
                  Upload Supporting Files (Optional)
                </label>
                <p className="text-xs ndpr-text-muted mb-2">
                  Max {maxAttachments} files, {maxFileSize / (1024 * 1024)}MB each. Allowed types: {allowedFileTypes.join(', ')}
                </p>
                <input
                  id="breach-attachments"
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  className='ndpr-form-field__input'
                  accept={allowedFileTypes.join(',')}
                />
                {errors.attachments && <p id="attachments-error" role="alert" className="ndpr-form-field__error">{errors.attachments}</p>}
              </div>
              
              {attachments.length > 0 && (
                <div className='ndpr-form-field'>
                  <h4 className='ndpr-form-field__label'>Attached Files:</h4>
                  <ul className='ndpr-form-section'>
                    {attachments.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center">
                          <svg aria-hidden="true" focusable="false" className="w-4 h-4 ndpr-text-muted mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm ndpr-text-muted">{file.name}</span>
                          <span className="ml-2 text-xs ndpr-text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          aria-label={`Remove attachment ${file.name}`}
                          className="text-red-500 hover:ndpr-text-destructive p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          <svg aria-hidden="true" focusable="false" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="sr-only">Remove</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* NDPA Notice */}
          <div className={resolveClass('ndpr-alert ndpr-alert--info', cn.notice, unstyled)}>
            <h3 className="text-sm font-bold ndpr-text-info mb-2">NDPA Breach Notification Requirements</h3>
            <p className="ndpr-text-info text-sm">
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
              {isSubmitting ? 'Submitting...' : resolvedSubmit}
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
