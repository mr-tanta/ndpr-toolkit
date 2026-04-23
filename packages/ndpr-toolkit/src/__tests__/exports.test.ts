/**
 * Smoke tests verifying all entry points export the expected items.
 * Each test imports an entry point and checks that key exports are defined.
 */

describe('Entry point: index', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    'useDSR',
    'useConsent',
    'useDPIA',
    'useBreach',
    'usePrivacyPolicy',
    'useLawfulBasis',
    'useCrossBorderTransfer',
    'useROPA',
    'getComplianceScore',
    'validateConsent',
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('../../src/core');

  it.each([
    'NDPRProvider',
    'useNDPRConfig',
    'useNDPRLocale',
    'defaultLocale',
    'mergeLocale',
    'validateConsent',
    'validateConsentOptions',
    'createAuditEntry',
    'getAuditLog',
    'appendAuditEntry',
    'formatDSRRequest',
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

describe('Entry point: hooks', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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

describe('Entry point: consent', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    'validateConsent',
    'validateConsentOptions',
    'resolveClass',
    'createAuditEntry',
    'getAuditLog',
    'appendAuditEntry',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: dsr', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('../../src/dsr');

  it.each([
    'DSRRequestForm',
    'DSRDashboard',
    'DSRTracker',
    'useDSR',
    'formatDSRRequest',
    'DSR',
    'DSRProvider',
    'useDSRCompound',
  ])('exports %s', (name) => {
    expect(mod[name]).toBeDefined();
  });
});

describe('Entry point: dpia', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  // The unstyled entry point is declared in package.json exports but has no
  // source file yet — skip until the module is implemented.
  it.skip('not yet implemented — no source file exists', () => {
    // placeholder
  });
});
