/**
 * Smoke tests verifying all entry points export the expected items.
 * Each test imports an entry point and checks that key exports are defined.
 */

describe('Entry point: index', () => {
  const mod = require('../../src/index');

  it.each([
    'ConsentBanner',
    'ConsentManager',
    'ConsentStorage',
    'DSRRequestForm',
    'DSRDashboard',
    'DPIAQuestionnaire',
    'DPIAReport',
    'BreachReportForm',
    'BreachRiskAssessment',
    'PolicyGenerator',
    'PolicyPreview',
    'PolicyExporter',
    'NDPRProvider',
    'NDPRThemeProvider',
    'useDSR',
    'useConsent',
    'useDPIA',
    'useBreach',
    'usePrivacyPolicy',
    'useLawfulBasis',
    'useCrossBorderTransfer',
    'useROPA',
    'getComplianceScore',
    'validateConsentStructured',
    'LawfulBasisTracker',
    'CrossBorderTransferManager',
    'ROPAManager',
    'NDPRDashboard',
    'exportROPAToCSV',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: core', () => {
  const mod = require('../../src/core');

  it.each([
    'NDPRProvider',
    'useNDPRConfig',
    'useNDPRLocale',
    'defaultLocale',
    'mergeLocale',
    'validateConsentStructured',
    'validateConsentOptionsStructured',
    'createAuditEntry',
    'getAuditLog',
    'appendAuditEntry',
    'formatDSRRequestStructured',
    'assessDPIARisk',
    'calculateBreachSeverity',
    'generatePolicyText',
    'DEFAULT_POLICY_SECTIONS',
    'DEFAULT_POLICY_VARIABLES',
    'createBusinessPolicyTemplate',
    'validateProcessingActivity',
    'getLawfulBasisDescription',
    'assessComplianceGaps',
    'generateLawfulBasisSummary',
    'validateTransfer',
    'getTransferMechanismDescription',
    'assessTransferRisk',
    'isNDPCApprovalRequired',
    'validateProcessingRecord',
    'generateROPASummary',
    'exportROPAToCSV',
    'identifyComplianceGaps',
    'sanitizeInput',
    'getComplianceScore',
    'createDefaultContext',
    'evaluatePolicyCompliance',
    'assemblePolicy',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: server', () => {
  const mod = require('../../src/server');

  it.each([
    // Validators
    'validateConsentStructured',
    'validateConsentOptionsStructured',
    'validateProcessingActivity',
    'validateTransfer',
    'validateProcessingRecord',
    // Domain utilities
    'formatDSRRequestStructured',
    'validateDsrSubmissionStructured',
    'assessDPIARisk',
    'calculateBreachSeverity',
    'createAuditEntry',
    'getAuditLog',
    'appendAuditEntry',
    'sanitizeInput',
    // Privacy-policy generation
    'generatePolicyText',
    'findUnfilledTokens',
    'DEFAULT_POLICY_SECTIONS',
    'DEFAULT_POLICY_VARIABLES',
    'createBusinessPolicyTemplate',
    'assemblePolicy',
    'UNFILLED_PREFIX',
    'UNFILLED_SUFFIX',
    'evaluatePolicyCompliance',
    'createDefaultContext',
    'DEFAULT_DATA_CATEGORIES',
    // Policy export
    'exportHTML',
    'exportMarkdown',
    'exportDOCX',
    'exportPDF',
    // Compliance scoring
    'getComplianceScore',
    // Locales + i18n helpers
    'defaultLocale',
    'yorubaLocale',
    'igboLocale',
    'hausaLocale',
    'pidginLocale',
    'mergeLocale',
    // Adapters
    'localStorageAdapter',
    'sessionStorageAdapter',
    'cookieAdapter',
    'apiAdapter',
    'memoryAdapter',
    'composeAdapters',
    // Lawful basis / cross-border / ROPA helpers
    'getLawfulBasisDescription',
    'assessComplianceGaps',
    'generateLawfulBasisSummary',
    'getTransferMechanismDescription',
    'assessTransferRisk',
    'isNDPCApprovalRequired',
    'generateROPASummary',
    'exportROPAToCSV',
    'identifyComplianceGaps',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });

  it.each([
    'NDPRProvider',
    'useNDPRConfig',
    'useNDPRLocale',
    'ConsentBanner',
    'PolicyPage',
    'useDSR',
    'useConsent',
    'usePrivacyPolicy',
  ])('does NOT export React-touching %s', (name) => {
    expect(mod[name]).toBeUndefined();
  });
});

describe('Entry point: hooks', () => {
  const mod = require('../../src/hooks-entry');

  it.each([
    'useConsent',
    'useDSR',
    'useDPIA',
    'useBreach',
    'usePrivacyPolicy',
    'useDefaultPrivacyPolicy',
    'useLawfulBasis',
    'useCrossBorderTransfer',
    'useROPA',
    'useComplianceScore',
    'useAdaptivePolicyWizard',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: headless', () => {
  const mod = require('../../src/headless');
  const hooksMod = require('../../src/hooks-entry');

  it.each([
    'useConsent',
    'useDSR',
    'useDPIA',
    'useBreach',
    'useLawfulBasis',
    'useCrossBorderTransfer',
    'useROPA',
    'useComplianceScore',
    'useAdaptivePolicyWizard',
    'useFocusTrap',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });

  it('mirrors the /hooks entry exactly (same exported keys)', () => {
    expect(new Set(Object.keys(mod))).toEqual(new Set(Object.keys(hooksMod)));
  });

  it('exports the same hook references as /hooks (alias, not redefinition)', () => {
    for (const key of Object.keys(hooksMod)) {
      expect(mod[key]).toBe(hooksMod[key]);
    }
  });
});

describe('Entry point: consent', () => {
  const mod = require('../../src/consent');

  it.each([
    'ConsentBanner',
    'ConsentManager',
    'ConsentStorage',
    'useConsent',
    'Consent',
    'ConsentProvider',
    'ConsentOptionList',
    'ConsentAcceptButton',
    'ConsentRejectButton',
    'ConsentSaveButton',
    'useConsentCompound',
    'validateConsentStructured',
    'validateConsentOptionsStructured',
    'resolveClass',
    'createAuditEntry',
    'getAuditLog',
    'appendAuditEntry',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: dsr', () => {
  const mod = require('../../src/dsr');

  it.each([
    'DSRRequestForm',
    'DSRDashboard',
    'DSRTracker',
    'useDSR',
    'formatDSRRequestStructured',
    'validateDsrSubmissionStructured',
    'DSR',
    'DSRProvider',
    'useDSRCompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: dpia', () => {
  const mod = require('../../src/dpia');

  it.each([
    'DPIAQuestionnaire',
    'DPIAReport',
    'StepIndicator',
    'useDPIA',
    'assessDPIARisk',
    'DPIA',
    'DPIAProvider',
    'useDPIACompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: breach', () => {
  const mod = require('../../src/breach');

  it.each([
    'BreachReportForm',
    'BreachRiskAssessment',
    'BreachNotificationManager',
    'RegulatoryReportGenerator',
    'useBreach',
    'calculateBreachSeverity',
    'Breach',
    'BreachProvider',
    'useBreachCompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: policy', () => {
  const mod = require('../../src/policy');

  it.each([
    'PolicyGenerator',
    'PolicyPreview',
    'PolicyExporter',
    'usePrivacyPolicy',
    'useDefaultPrivacyPolicy',
    'generatePolicyText',
    'DEFAULT_POLICY_SECTIONS',
    'DEFAULT_POLICY_VARIABLES',
    'createBusinessPolicyTemplate',
    'Policy',
    'PolicyProvider',
    'usePolicyCompound',
    'AdaptivePolicyWizard',
    'PolicyPage',
    'useAdaptivePolicyWizard',
    'evaluatePolicyCompliance',
    'assemblePolicy',
    'exportPDF',
    'exportDOCX',
    'exportHTML',
    'exportMarkdown',
    'createDefaultContext',
    'DEFAULT_DATA_CATEGORIES',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: lawful-basis', () => {
  const mod = require('../../src/lawful-basis-entry');

  it.each([
    'LawfulBasisTracker',
    'useLawfulBasis',
    'validateProcessingActivity',
    'getLawfulBasisDescription',
    'assessComplianceGaps',
    'generateLawfulBasisSummary',
    'LawfulBasis',
    'LawfulBasisProvider',
    'useLawfulBasisCompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: cross-border', () => {
  const mod = require('../../src/cross-border-entry');

  it.each([
    'CrossBorderTransferManager',
    'useCrossBorderTransfer',
    'validateTransfer',
    'getTransferMechanismDescription',
    'assessTransferRisk',
    'isNDPCApprovalRequired',
    'CrossBorder',
    'CrossBorderProvider',
    'useCrossBorderCompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: ropa', () => {
  const mod = require('../../src/ropa-entry');

  it.each([
    'ROPAManager',
    'useROPA',
    'validateProcessingRecord',
    'generateROPASummary',
    'exportROPAToCSV',
    'identifyComplianceGaps',
    'ROPA',
    'ROPAProvider',
    'useROPACompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: adapters', () => {
  const mod = require('../../src/adapters-entry');

  it.each([
    'localStorageAdapter',
    'sessionStorageAdapter',
    'cookieAdapter',
    'apiAdapter',
    'memoryAdapter',
    'composeAdapters',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: presets', () => {
  const mod = require('../../src/presets-entry');

  it.each([
    'NDPRConsent',
    'NDPRSubjectRights',
    'NDPRBreachReport',
    'NDPRPrivacyPolicy',
    'NDPRDPIA',
    'NDPRLawfulBasis',
    'NDPRCrossBorder',
    'NDPRROPA',
    'NDPRComplianceDashboard',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: unstyled', () => {
  const mod = require('../../src/unstyled');

  it.each([
    'ConsentBanner',
    'ConsentManager',
    'DSRRequestForm',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});
