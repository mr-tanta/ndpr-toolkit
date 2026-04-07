import React, { useState } from 'react';
import { RequestType } from '../../types/dsr';
import { resolveClass } from '../../utils/styling';

/**
 * Represents the data submitted by the DSR request form.
 */
export interface DSRFormSubmission {
  /** The selected request type identifier */
  requestType: string;
  /** Data subject personal information */
  dataSubject: {
    fullName: string;
    email: string;
    phone?: string;
    identifierType: string;
    identifierValue: string;
  };
  /** Additional information provided for the selected request type */
  additionalInfo?: Record<string, any>;
  /** Timestamp (ms) when the form was submitted */
  submittedAt: number;
}

export interface DSRRequestFormClassNames {
  root?: string;
  title?: string;
  description?: string;
  form?: string;
  fieldGroup?: string;
  label?: string;
  input?: string;
  select?: string;
  textarea?: string;
  submitButton?: string;
  successMessage?: string;
}

export interface DSRRequestFormProps {
  /**
   * Array of request types that can be submitted
   */
  requestTypes: RequestType[];
  
  /**
   * Callback function called when form is submitted
   */
  onSubmit: (data: DSRFormSubmission) => void;

  /**
   * Callback function called when form validation fails
   */
  onValidationError?: (errors: Record<string, string>) => void;
  
  /**
   * Title displayed on the form
   * @default "Submit a Data Subject Request"
   */
  title?: string;
  
  /**
   * Description text displayed on the form
   * @default "Use this form to exercise your rights under the Nigeria Data Protection Act (NDPA)."
   */
  description?: string;
  
  /**
   * Text for the submit button
   * @default "Submit Request"
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
   * @default "Your request has been submitted successfully. You will receive a confirmation email shortly."
   */
  confirmationMessage?: string;
  
  /**
   * Whether to require identity verification
   * @default true
   */
  requireIdentityVerification?: boolean;
  
  /**
   * Types of identifiers accepted for verification
   * @default ["email", "account", "customer_id"]
   */
  identifierTypes?: Array<{
    id: string;
    label: string;
  }>;
  
  /**
   * Whether to collect additional contact information
   * @default true
   */
  collectAdditionalContact?: boolean;

  /**
   * Custom labels for form fields
   */
  labels?: {
    name?: string;
    email?: string;
    requestType?: string;
    description?: string;
    submit?: string;
  };

  /**
   * Object of CSS class overrides keyed by semantic section name.
   */
  classNames?: DSRRequestFormClassNames;

  /**
   * When true, all default Tailwind classes are removed so consumers
   * can style from scratch using classNames.
   */
  unstyled?: boolean;
}

export const DSRRequestForm: React.FC<DSRRequestFormProps> = ({
  requestTypes,
  onSubmit,
  onValidationError,
  title = "Submit a Data Subject Request",
  description = "Use this form to exercise your rights under the Nigeria Data Protection Act (NDPA).",
  submitButtonText = "Submit Request",
  className = "",
  buttonClassName = "",
  showConfirmation = true,
  confirmationMessage = "Your request has been submitted successfully. You will receive a confirmation email shortly.",
  requireIdentityVerification = true,
  identifierTypes = [
    { id: "email", label: "Email Address" },
    { id: "account", label: "Account Number" },
    { id: "customer_id", label: "Customer ID" }
  ],
  collectAdditionalContact = true,
  labels = {},
  classNames,
  unstyled = false
}) => {
  const [selectedRequestType, setSelectedRequestType] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [identifierType, setIdentifierType] = useState<string>(identifierTypes[0]?.id || "");
  const [identifierValue, setIdentifierValue] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const selectedType = requestTypes.find(type => type.id === selectedRequestType);
  
  const handleRequestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRequestType(e.target.value);
    setAdditionalInfo({});
  };
  
  const handleAdditionalInfoChange = (id: string, value: any) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!selectedRequestType) {
      newErrors.requestType = "Please select a request type";
    }

    if (requireIdentityVerification && !identifierValue.trim()) {
      newErrors.identifierValue = "Identifier value is required";
    }

    // Validate additional fields if required
    if (selectedType?.requiresAdditionalInfo && selectedType.additionalFields) {
      selectedType.additionalFields.forEach(field => {
        if (field.required && !additionalInfo[field.id]) {
          newErrors[`additional_${field.id}`] = `${field.label} is required`;
        }
      });
    }

    setErrors(newErrors);
    return newErrors;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      onValidationError?.(validationErrors);
      return;
    }

    const formData: DSRFormSubmission = {
      requestType: selectedRequestType,
      dataSubject: {
        fullName,
        email,
        phone: phone || undefined,
        identifierType,
        identifierValue
      },
      additionalInfo: Object.keys(additionalInfo).length > 0 ? additionalInfo : undefined,
      submittedAt: Date.now()
    };

    onSubmit(formData);
    
    if (showConfirmation) {
      setIsSubmitted(true);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className={resolveClass(`p-4 bg-green-50 dark:bg-green-900/20 rounded-md ${className}`, classNames?.successMessage, unstyled)}>
        <h2 className={resolveClass("text-lg font-bold text-green-800 dark:text-green-200 mb-2", classNames?.title, unstyled)}>Request Submitted</h2>
        <p className={resolveClass("text-green-700 dark:text-green-300", classNames?.description, unstyled)}>{confirmationMessage}</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className={resolveClass(`mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${buttonClassName}`, classNames?.submitButton, unstyled)}
        >
          Submit Another Request
        </button>
      </div>
    );
  }
  
  return (
    <div className={resolveClass(`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${className}`, classNames?.root, unstyled)}>
      <h2 className={resolveClass("text-xl font-bold mb-2", classNames?.title, unstyled)}>{title}</h2>
      <p className={resolveClass("mb-6 text-gray-600 dark:text-gray-300", classNames?.description, unstyled)}>{description}</p>

      <form onSubmit={handleSubmit} className={resolveClass("", classNames?.form, unstyled)}>
        <div className={resolveClass("space-y-4", classNames?.fieldGroup, unstyled)}>
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="fullName" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                  {labels.name || "Full Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.input, unstyled)}
                  required
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                  {labels.email || "Email Address"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.input, unstyled)}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              
              {collectAdditionalContact && (
                <div>
                  <label htmlFor="phone" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.input, unstyled)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Request Type */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Request Details</h3>
            <div className="mb-4">
              <label htmlFor="requestType" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                {labels.requestType || "Request Type"} <span className="text-red-500">*</span>
              </label>
              <select
                id="requestType"
                value={selectedRequestType}
                onChange={handleRequestTypeChange}
                className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.select, unstyled)}
                required
              >
                <option value="">Select a request type</option>
                {requestTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.requestType && <p className="mt-1 text-sm text-red-500">{errors.requestType}</p>}
            </div>
            
            {selectedType && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedType.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Estimated completion time: {selectedType.estimatedCompletionTime} {selectedType.estimatedCompletionTime === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="requestDescription" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                {labels.description || "Additional Information"}
              </label>
              <textarea
                id="requestDescription"
                className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.textarea, unstyled)}
                rows={4}
                placeholder="Please provide any additional details that might help us process your request"
              />
            </div>
          </div>
          
          {/* Identity Verification */}
          {requireIdentityVerification && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Identity Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                To protect your privacy, we need to verify your identity before processing your request.
              </p>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="identifierType" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                    Identifier Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="identifierType"
                    value={identifierType}
                    onChange={e => setIdentifierType(e.target.value)}
                    className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.select, unstyled)}
                    required
                  >
                    {identifierTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="identifierValue" className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                    Identifier Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="identifierValue"
                    value={identifierValue}
                    onChange={e => setIdentifierValue(e.target.value)}
                    className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.input, unstyled)}
                    required
                  />
                  {errors.identifierValue && <p className="mt-1 text-sm text-red-500">{errors.identifierValue}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          {selectedType?.requiresAdditionalInfo && selectedType.additionalFields && selectedType.additionalFields.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              <div className="space-y-4">
                {selectedType.additionalFields.map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className={resolveClass("block text-sm font-medium mb-1", classNames?.label, unstyled)}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.id}
                        value={additionalInfo[field.id] || ''}
                        onChange={e => handleAdditionalInfoChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.input, unstyled)}
                        required={field.required}
                      />
                    )}
                    
                    {field.type === 'textarea' && (
                      <textarea
                        id={field.id}
                        value={additionalInfo[field.id] || ''}
                        onChange={e => handleAdditionalInfoChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.textarea, unstyled)}
                        rows={4}
                        required={field.required}
                      />
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <select
                        id={field.id}
                        value={additionalInfo[field.id] || ''}
                        onChange={e => handleAdditionalInfoChange(field.id, e.target.value)}
                        className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.select, unstyled)}
                        required={field.required}
                      >
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'checkbox' && (
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id={field.id}
                            checked={!!additionalInfo[field.id]}
                            onChange={e => handleAdditionalInfoChange(field.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            required={field.required}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={field.id} className="text-gray-700 dark:text-gray-300">
                            {field.placeholder || field.label}
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {field.type === 'file' && (
                      <input
                        type="file"
                        id={field.id}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAdditionalInfoChange(field.id, file);
                          }
                        }}
                        className={resolveClass("w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", classNames?.input, unstyled)}
                        required={field.required}
                      />
                    )}
                    
                    {errors[`additional_${field.id}`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`additional_${field.id}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Privacy Notice</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              The information you provide in this form will be used solely for the purpose of processing your data subject request.
              We will retain this information for as long as necessary to fulfill your request and to comply with our legal obligations.
              For more information, please refer to our Privacy Policy.
            </p>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className={resolveClass(`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${buttonClassName}`, classNames?.submitButton, unstyled)}
            >
              {labels.submit || submitButtonText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
