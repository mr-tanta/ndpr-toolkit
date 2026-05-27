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
    /** ConsentManager component title */
    managerTitle?: string;
    /** ConsentManager component description */
    managerDescription?: string;
    /** ConsentManager reset button */
    resetToDefaults?: string;
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
    /** DSRDashboard component title */
    dashboardTitle?: string;
    /** DSRDashboard component description */
    dashboardDescription?: string;
    /** DSRTracker component title */
    trackerTitle?: string;
    /** DSRTracker component description */
    trackerDescription?: string;
  };
  breach?: {
    title?: string;
    description?: string;
    submitReport?: string;
    breachTitle?: string;
    category?: string;
    discoveredAt?: string;
    detailedDescription?: string;
    /** BreachRiskAssessment component title */
    riskAssessmentTitle?: string;
    /** BreachRiskAssessment component description */
    riskAssessmentDescription?: string;
    /** BreachNotificationManager component title */
    notificationManagerTitle?: string;
    /** BreachNotificationManager component description */
    notificationManagerDescription?: string;
    /** RegulatoryReportGenerator component title */
    regulatoryReportTitle?: string;
    /** RegulatoryReportGenerator component description */
    regulatoryReportDescription?: string;
  };
  dpia?: {
    title?: string;
    next?: string;
    previous?: string;
    complete?: string;
    progress?: string;
    /** DPIAQuestionnaire submit button (last section) */
    submit?: string;
    /** DPIAReport main report title */
    reportTitle?: string;
  };
  policy?: {
    title?: string;
    generate?: string;
    preview?: string;
    export?: string;
    sections?: string;
    variables?: string;
    /** PolicyGenerator component title */
    generatorTitle?: string;
    /** PolicyGenerator component description */
    generatorDescription?: string;
    /** PolicyPreview component title */
    previewTitle?: string;
    /** PolicyPreview component description */
    previewDescription?: string;
    /** PolicyExporter component title */
    exporterTitle?: string;
    /** PolicyExporter component description */
    exporterDescription?: string;
    /** AdaptivePolicyWizard heading */
    wizardTitle?: string;
  };
  lawfulBasis?: {
    /** LawfulBasisTracker title */
    title?: string;
    /** LawfulBasisTracker description */
    description?: string;
  };
  crossBorder?: {
    /** CrossBorderTransferManager title */
    title?: string;
    /** CrossBorderTransferManager description */
    description?: string;
  };
  ropa?: {
    /** ROPAManager title */
    title?: string;
    /** ROPAManager description */
    description?: string;
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
