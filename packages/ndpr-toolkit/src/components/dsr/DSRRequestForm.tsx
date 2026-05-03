import React, { useState } from 'react';
import { RequestType } from '../../types/dsr';
import { resolveClass } from '../../utils/styling';
import { sanitizeInput } from '../../utils/sanitize';

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
  additionalInfo?: Record<string, string | number | boolean | null>;
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
  /** Alias for submitButton */
  primaryButton?: string;
  successMessage?: string;
  /** Custom class applied when isSubmitting is true (e.g. a loading overlay) */
  loadingOverlay?: string;
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
   * @default "Use this form to exercise your rights under the Nigeria Data Protection Act (NDPA), Part IV, Sections 29-36."
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

  /**
   * Whether the form is currently submitting.
   * When true, the submit button is disabled and shows "Submitting..." text.
   */
  isSubmitting?: boolean;

  /**
   * Default values to pre-fill form fields.
   * Useful for editing existing requests or pre-populating known data.
   */
  defaultValues?: Partial<DSRFormSubmission>;

  /**
   * Callback fired when the form is reset via the Reset button.
   * To fully remount the component (clearing all internal state),
   * change the `key` prop from the parent.
   */
  onReset?: () => void;
}

/**
 * Data Subject Request form component. Implements NDPA Part IV, Sections 29-36
 * covering data subject rights including access, rectification, erasure, and portability.
 */
export const DSRRequestForm: React.FC<DSRRequestFormProps> = ({
  requestTypes,
  onSubmit,
  onValidationError,
  title = "Submit a Data Subject Request",
  description = "Use this form to exercise your rights under the Nigeria Data Protection Act (NDPA), Part IV, Sections 29-36.",
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
  unstyled = false,
  isSubmitting = false,
  defaultValues,
  onReset
}) => {
  const [selectedRequestType, setSelectedRequestType] = useState<string>(defaultValues?.requestType || "");
  const [fullName, setFullName] = useState<string>(defaultValues?.dataSubject?.fullName || "");
  const [email, setEmail] = useState<string>(defaultValues?.dataSubject?.email || "");
  const [phone, setPhone] = useState<string>(defaultValues?.dataSubject?.phone || "");
  const [identifierType, setIdentifierType] = useState<string>(defaultValues?.dataSubject?.identifierType || identifierTypes[0]?.id || "");
  const [identifierValue, setIdentifierValue] = useState<string>(defaultValues?.dataSubject?.identifierValue || "");
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, string | number | boolean | null>>(defaultValues?.additionalInfo || {});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReset = () => {
    setSelectedRequestType("");
    setFullName("");
    setEmail("");
    setPhone("");
    setIdentifierType(identifierTypes[0]?.id || "");
    setIdentifierValue("");
    setAdditionalInfo({});
    setIsSubmitted(false);
    setErrors({});
    onReset?.();
  };

  const selectedType = requestTypes.find(type => type.id === selectedRequestType);
  
  const handleRequestTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRequestType(e.target.value);
    setAdditionalInfo({});
  };
  
  const handleAdditionalInfoChange = (id: string, value: string | number | boolean | null) => {
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
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
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

    // Sanitize all text field values to prevent XSS
    const sanitizedAdditionalInfo = Object.keys(additionalInfo).length > 0
      ? Object.fromEntries(
          Object.entries(additionalInfo).map(([key, value]) => [
            key,
            typeof value === 'string' ? sanitizeInput(value) : value,
          ])
        )
      : undefined;

    const formData: DSRFormSubmission = {
      requestType: selectedRequestType,
      dataSubject: {
        fullName: sanitizeInput(fullName),
        email: sanitizeInput(email),
        phone: phone ? sanitizeInput(phone) : undefined,
        identifierType,
        identifierValue: sanitizeInput(identifierValue)
      },
      additionalInfo: sanitizedAdditionalInfo,
      submittedAt: Date.now()
    };

    onSubmit(formData);
    
    if (showConfirmation) {
      setIsSubmitted(true);
    }
  };
  
  // 3.5: semantic class composition — defaults map to .ndpr-dsr-form BEM
  // tokens backed by dist/styles.css. Tailwind utilities removed so the
  // form renders correctly in any host without a Tailwind config.
  const defaultPrimaryButton =
    `ndpr-dsr-form__button ndpr-dsr-form__button--primary ${buttonClassName}`.trim();
  const defaultSecondaryButton = 'ndpr-dsr-form__button ndpr-dsr-form__button--secondary';

  if (isSubmitted) {
    return (
      <div
        data-ndpr-component="dsr-request-form"
        data-ndpr-state="submitted"
        className={resolveClass(
          `ndpr-dsr-form__success${className ? ` ${className}` : ''}`,
          classNames?.successMessage,
          unstyled,
        )}
        aria-live="polite"
      >
        <h2 className={resolveClass('ndpr-dsr-form__success-title', classNames?.title, unstyled)}>Request Submitted</h2>
        <p className={resolveClass('ndpr-dsr-form__success-body', classNames?.description, unstyled)}>{confirmationMessage}</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className={resolveClass(defaultPrimaryButton, classNames?.primaryButton || classNames?.submitButton, unstyled)}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div
      data-ndpr-component="dsr-request-form"
      className={resolveClass(`ndpr-dsr-form${className ? ` ${className}` : ''}`, classNames?.root, unstyled)}
    >
      <h2 className={resolveClass('ndpr-dsr-form__title', classNames?.title, unstyled)}>{title}</h2>
      <p className={resolveClass('ndpr-dsr-form__description', classNames?.description, unstyled)}>{description}</p>

      <form onSubmit={handleSubmit} className={resolveClass('', classNames?.form, unstyled)}>
        <div className={resolveClass('ndpr-dsr-form__sections', classNames?.fieldGroup, unstyled)}>
          {/* Personal Information */}
          <div>
            <h3 className={unstyled ? '' : 'ndpr-form-section__heading'}>Personal Information</h3>
            <div className={unstyled ? '' : 'ndpr-form-grid ndpr-form-grid--2'}>
              <div>
                <label htmlFor="fullName" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                  {labels.name || "Full Name"} <span className={unstyled ? '' : 'ndpr-form-field__required'}>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && <p id="fullName-error" role="alert" className={unstyled ? '' : 'ndpr-form-field__error'}>{errors.fullName}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                  {labels.email || "Email Address"} <span className={unstyled ? '' : 'ndpr-form-field__required'}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" role="alert" className={unstyled ? '' : 'ndpr-form-field__error'}>{errors.email}</p>}
              </div>
              
              {collectAdditionalContact && (
                <div>
                  <label htmlFor="phone" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Request Type */}
          <div>
            <h3 className={unstyled ? '' : 'ndpr-form-section__heading'}>Request Details</h3>
            <div className={unstyled ? '' : 'ndpr-form-field'}>
              <label htmlFor="requestType" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                {labels.requestType || "Request Type"} <span className={unstyled ? '' : 'ndpr-form-field__required'}>*</span>
              </label>
              <select
                id="requestType"
                value={selectedRequestType}
                onChange={handleRequestTypeChange}
                className={resolveClass('ndpr-form-field__select', classNames?.select, unstyled)}
                required
                aria-required="true"
                aria-invalid={!!errors.requestType}
                aria-describedby={errors.requestType ? "requestType-error" : undefined}
              >
                <option value="">Select a request type</option>
                {requestTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.requestType && <p id="requestType-error" role="alert" className={unstyled ? '' : 'ndpr-form-field__error'}>{errors.requestType}</p>}
            </div>
            
            {selectedType && (
              <div className={unstyled ? '' : 'ndpr-dsr-form__type-info'}>
                <p>{selectedType.description}</p>
                <p>
                  Estimated completion time: {selectedType.estimatedCompletionTime} {selectedType.estimatedCompletionTime === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}
            
            <div className={unstyled ? '' : 'ndpr-form-field'}>
              <label htmlFor="requestDescription" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                {labels.description || "Additional Information"}
              </label>
              <textarea
                id="requestDescription"
                className={resolveClass('ndpr-form-field__textarea', classNames?.textarea, unstyled)}
                rows={4}
                placeholder="Please provide any additional details that might help us process your request"
              />
            </div>
          </div>
          
          {/* Identity Verification */}
          {requireIdentityVerification && (
            <div>
              <h3 className={unstyled ? '' : 'ndpr-form-section__heading'}>Identity Verification</h3>
              <p className={unstyled ? '' : 'ndpr-form-section__hint'}>
                To protect your privacy, we need to verify your identity before processing your request.
              </p>
              
              <div className={unstyled ? '' : 'ndpr-form-grid ndpr-form-grid--2'}>
                <div>
                  <label htmlFor="identifierType" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                    Identifier Type <span className={unstyled ? '' : 'ndpr-form-field__required'}>*</span>
                  </label>
                  <select
                    id="identifierType"
                    value={identifierType}
                    onChange={e => setIdentifierType(e.target.value)}
                    className={resolveClass('ndpr-form-field__select', classNames?.select, unstyled)}
                    required
                    aria-required="true"
                  >
                    {identifierTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="identifierValue" className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                    Identifier Value <span className={unstyled ? '' : 'ndpr-form-field__required'}>*</span>
                  </label>
                  <input
                    type="text"
                    id="identifierValue"
                    value={identifierValue}
                    onChange={e => setIdentifierValue(e.target.value)}
                    className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.identifierValue}
                    aria-describedby={errors.identifierValue ? "identifierValue-error" : undefined}
                  />
                  {errors.identifierValue && <p id="identifierValue-error" role="alert" className={unstyled ? '' : 'ndpr-form-field__error'}>{errors.identifierValue}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          {selectedType?.requiresAdditionalInfo && selectedType.additionalFields && selectedType.additionalFields.length > 0 && (
            <div>
              <h3 className={unstyled ? '' : 'ndpr-form-section__heading'}>Additional Information</h3>
              <div className={unstyled ? '' : 'ndpr-form-section'}>
                {selectedType.additionalFields.map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                      {field.label} {field.required && <span className={unstyled ? '' : 'ndpr-form-field__required'}>*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.id}
                        value={String(additionalInfo[field.id] ?? '')}
                        onChange={e => handleAdditionalInfoChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                        required={field.required}
                        aria-required={field.required || undefined}
                        aria-invalid={!!errors[`additional_${field.id}`]}
                        aria-describedby={errors[`additional_${field.id}`] ? `additional-${field.id}-error` : undefined}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        id={field.id}
                        value={String(additionalInfo[field.id] ?? '')}
                        onChange={e => handleAdditionalInfoChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={resolveClass('ndpr-form-field__textarea', classNames?.textarea, unstyled)}
                        rows={4}
                        required={field.required}
                        aria-required={field.required || undefined}
                        aria-invalid={!!errors[`additional_${field.id}`]}
                        aria-describedby={errors[`additional_${field.id}`] ? `additional-${field.id}-error` : undefined}
                      />
                    )}

                    {field.type === 'select' && field.options && (
                      <select
                        id={field.id}
                        value={String(additionalInfo[field.id] ?? '')}
                        onChange={e => handleAdditionalInfoChange(field.id, e.target.value)}
                        className={resolveClass('ndpr-form-field__select', classNames?.select, unstyled)}
                        required={field.required}
                        aria-required={field.required || undefined}
                        aria-invalid={!!errors[`additional_${field.id}`]}
                        aria-describedby={errors[`additional_${field.id}`] ? `additional-${field.id}-error` : undefined}
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
                      <div className={unstyled ? '' : 'ndpr-form-field__checkbox-row'}>
                        <input
                          type="checkbox"
                          id={field.id}
                          checked={!!additionalInfo[field.id]}
                          onChange={e => handleAdditionalInfoChange(field.id, e.target.checked)}
                          className={unstyled ? '' : 'ndpr-form-field__checkbox'}
                          required={field.required}
                          aria-required={field.required || undefined}
                          aria-invalid={!!errors[`additional_${field.id}`]}
                          aria-describedby={errors[`additional_${field.id}`] ? `additional-${field.id}-error` : undefined}
                        />
                        <label htmlFor={field.id} className={resolveClass('ndpr-form-field__label', classNames?.label, unstyled)}>
                          {field.placeholder || field.label}
                        </label>
                      </div>
                    )}
                    
                    {field.type === 'file' && (
                      <input
                        type="file"
                        id={field.id}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAdditionalInfoChange(field.id, file.name);
                          }
                        }}
                        className={resolveClass('ndpr-form-field__input', classNames?.input, unstyled)}
                        required={field.required}
                        aria-required={field.required || undefined}
                        aria-invalid={!!errors[`additional_${field.id}`]}
                        aria-describedby={errors[`additional_${field.id}`] ? `additional-${field.id}-error` : undefined}
                      />
                    )}
                    
                    {errors[`additional_${field.id}`] && (
                      <p id={`additional-${field.id}-error`} role="alert" className={unstyled ? '' : 'ndpr-form-field__error'}>{errors[`additional_${field.id}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Privacy Notice */}
          <div className={unstyled ? '' : 'ndpr-dsr-form__notice'}>
            <h3 className={unstyled ? '' : 'ndpr-dsr-form__notice-title'}>Privacy Notice</h3>
            <p className={unstyled ? '' : 'ndpr-dsr-form__notice-body'}>
              The information you provide in this form will be used solely for the purpose of processing your data subject request.
              We will retain this information for as long as necessary to fulfill your request and to comply with our legal obligations.
              For more information, please refer to our Privacy Policy.
            </p>
          </div>

          {/* Form Actions */}
          <div className={unstyled ? '' : 'ndpr-dsr-form__actions'}>
            {isSubmitting && classNames?.loadingOverlay && (
              <div className={classNames.loadingOverlay} />
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={resolveClass(defaultPrimaryButton, classNames?.primaryButton || classNames?.submitButton, unstyled)}
            >
              {isSubmitting ? 'Submitting...' : (labels.submit || submitButtonText)}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={resolveClass(defaultSecondaryButton, undefined, unstyled)}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
