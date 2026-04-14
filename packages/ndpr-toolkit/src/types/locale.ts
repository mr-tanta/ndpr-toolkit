/**
 * Locale strings for all toolkit components.
 * Pass partial overrides — missing keys fall back to English defaults.
 */
export interface NDPRLocale {
  consent?: {
    title?: string;
    description?: string;
    acceptAll?: string;
    rejectAll?: string;
    customize?: string;
    savePreferences?: string;
    selectAll?: string;
    deselectAll?: string;
    required?: string;
    cookieNotice?: string;
  };
  dsr?: {
    title?: string;
    description?: string;
    submitRequest?: string;
    reset?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    requestType?: string;
    additionalInfo?: string;
    identityVerification?: string;
    identifierType?: string;
    identifierValue?: string;
    privacyNotice?: string;
    successMessage?: string;
  };
  breach?: {
    title?: string;
    description?: string;
    submitReport?: string;
    breachTitle?: string;
    category?: string;
    discoveredAt?: string;
    detailedDescription?: string;
  };
  dpia?: {
    title?: string;
    next?: string;
    previous?: string;
    complete?: string;
    progress?: string;
  };
  policy?: {
    title?: string;
    generate?: string;
    preview?: string;
    export?: string;
    sections?: string;
    variables?: string;
  };
  compliance?: {
    score?: string;
    excellent?: string;
    good?: string;
    needsWork?: string;
    critical?: string;
    recommendations?: string;
    passed?: string;
    gaps?: string;
  };
  common?: {
    loading?: string;
    error?: string;
    save?: string;
    cancel?: string;
    delete?: string;
    edit?: string;
    add?: string;
    back?: string;
    next?: string;
    search?: string;
    noResults?: string;
  };
}
