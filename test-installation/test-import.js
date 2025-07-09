// Test importing components from the published package
const {
  ConsentBanner,
  ConsentManager,
  DSRRequestForm,
  DPIAQuestionnaire,
  BreachReportForm,
  PolicyGenerator,
  useConsent,
  useDSR,
  useDPIA,
  useBreach,
  usePrivacyPolicy
} = require('@tantainnovative/ndpr-toolkit');

console.log('✅ Successfully imported components from @tantainnovative/ndpr-toolkit');
console.log('Available exports:', {
  ConsentBanner: typeof ConsentBanner,
  ConsentManager: typeof ConsentManager,
  DSRRequestForm: typeof DSRRequestForm,
  DPIAQuestionnaire: typeof DPIAQuestionnaire,
  BreachReportForm: typeof BreachReportForm,
  PolicyGenerator: typeof PolicyGenerator,
  useConsent: typeof useConsent,
  useDSR: typeof useDSR,
  useDPIA: typeof useDPIA,
  useBreach: typeof useBreach,
  usePrivacyPolicy: typeof usePrivacyPolicy
});