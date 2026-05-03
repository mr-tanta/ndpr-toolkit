import React from 'react';
import type { PrivacyPolicy } from '../../types/privacy';
import type { PolicyDraft } from '../../types/policy-engine';
import type { StorageAdapter } from '../../adapters/types';
import { resolveClass } from '../../utils/styling';
import { useAdaptivePolicyWizard } from '../../hooks/useAdaptivePolicyWizard';
import { PolicyStepIndicator } from './PolicyStepIndicator';
import { PolicyStepAbout } from './PolicyStepAbout';
import { PolicyStepData } from './PolicyStepData';
import { PolicyStepProcessing } from './PolicyStepProcessing';
import { PolicyStepReview } from './PolicyStepReview';
import { ComplianceCheckerSidebar } from './ComplianceCheckerSidebar';
import { DraftSaveIndicator } from './DraftSaveIndicator';

export interface AdaptivePolicyWizardProps {
  adapter?: StorageAdapter<PolicyDraft>;
  onComplete?: (policy: PrivacyPolicy) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

export const AdaptivePolicyWizard: React.FC<AdaptivePolicyWizardProps> = ({
  adapter,
  onComplete,
  classNames,
  unstyled,
}) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    canProceed,
    context,
    updateOrg,
    updateContext,
    toggleDataCategory,
    togglePurpose,
    addProcessor,
    removeProcessor,
    sections,
    customSections,
    sectionOverrides,
    editSectionContent,
    addCustomSection,
    removeCustomSection,
    reorderSections,
    complianceResult,
    applyFix,
    handleExportPDF,
    handleExportDOCX,
    handleExportHTML,
    handleExportMarkdown,
    lastSavedAt,
    isLoading,
  } = useAdaptivePolicyWizard({ adapter, onComplete });

  // -------------------------------------------------------------------
  // Export helpers — trigger browser download or clipboard copy
  // -------------------------------------------------------------------

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const blob = await handleExportPDF();
    triggerDownload(blob, 'privacy-policy.pdf');
  };

  const exportDOCX = async () => {
    const blob = await handleExportDOCX();
    triggerDownload(blob, 'privacy-policy.docx');
  };

  const exportHTML = () => {
    const html = handleExportHTML();
    navigator.clipboard.writeText(html).catch(() => {
      // Fallback: open in new tab using blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.addEventListener('load', () => URL.revokeObjectURL(url));
      } else {
        URL.revokeObjectURL(url);
      }
    });
  };

  const exportMarkdown = () => {
    const md = handleExportMarkdown();
    navigator.clipboard.writeText(md).catch(() => {
      const blob = new Blob([md], { type: 'text/markdown' });
      triggerDownload(blob, 'privacy-policy.md');
    });
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  if (isLoading) {
    return (
      <div
        data-ndpr-component="adaptive-policy-wizard"
        className={resolveClass(
          'flex items-center justify-center min-h-64 text-gray-400 dark:text-gray-500',
          classNames?.root,
          unstyled,
        )}
        aria-busy="true"
        aria-label="Loading policy wizard"
      >
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10l-1.73-3A8 8 0 014 12z" />
        </svg>
        <span className='ndpr-text-sm'>Loading…</span>
      </div>
    );
  }

  return (
    <div
      data-ndpr-component="adaptive-policy-wizard"
      className={resolveClass(
        'min-h-screen bg-gray-50 dark:bg-gray-900',
        classNames?.root,
        unstyled,
      )}
    >
      {/* Inner container */}
      <div
        className={resolveClass(
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
          classNames?.container,
          unstyled,
        )}
      >
        {/* Top bar: title + draft indicator */}
        <div
          className={resolveClass(
            'flex items-center justify-between mb-6',
            classNames?.topBar,
            unstyled,
          )}
        >
          <h1
            className={resolveClass(
              'text-2xl font-bold ndpr-text-foreground',
              classNames?.wizardTitle,
              unstyled,
            )}
          >
            Privacy Policy Builder
          </h1>
          <DraftSaveIndicator
            lastSavedAt={lastSavedAt}
            isSaving={false}
            hasError={false}
            classNames={classNames}
            unstyled={unstyled}
          />
        </div>

        {/* Step indicator */}
        <div
          className={resolveClass(
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 mb-6',
            classNames?.stepIndicatorWrapper,
            unstyled,
          )}
        >
          <PolicyStepIndicator
            currentStep={currentStep}
            classNames={classNames}
            unstyled={unstyled}
          />
        </div>

        {/* Two-panel layout */}
        <div
          className={resolveClass(
            'flex flex-col lg:flex-row gap-6 items-start',
            classNames?.panels,
            unstyled,
          )}
        >
          {/* Main panel */}
          <main
            aria-live="polite"
            className={resolveClass(
              'flex-1 min-w-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6',
              classNames?.mainPanel,
              unstyled,
            )}
          >
            {currentStep === 1 && (
              <PolicyStepAbout
                context={context}
                onUpdateOrg={updateOrg}
                classNames={classNames}
                unstyled={unstyled}
              />
            )}
            {currentStep === 2 && (
              <PolicyStepData
                categories={context.dataCategories}
                onToggle={toggleDataCategory}
                classNames={classNames}
                unstyled={unstyled}
              />
            )}
            {currentStep === 3 && (
              <PolicyStepProcessing
                context={context}
                onTogglePurpose={togglePurpose}
                onUpdateContext={updateContext}
                onAddProcessor={addProcessor}
                onRemoveProcessor={removeProcessor}
                classNames={classNames}
                unstyled={unstyled}
              />
            )}
            {currentStep === 4 && (
              <PolicyStepReview
                sections={sections}
                customSections={customSections}
                sectionOverrides={sectionOverrides}
                complianceResult={complianceResult}
                onEditSection={editSectionContent}
                onAddCustomSection={addCustomSection}
                onRemoveCustomSection={removeCustomSection}
                onReorderSection={reorderSections}
                onExportPDF={exportPDF}
                onExportDOCX={exportDOCX}
                onExportHTML={exportHTML}
                onExportMarkdown={exportMarkdown}
                classNames={classNames}
                unstyled={unstyled}
              />
            )}

            {/* Navigation buttons */}
            <div
              className={resolveClass(
                'flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700',
                classNames?.navigation,
                unstyled,
              )}
            >
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={resolveClass(
                  'px-4 py-2 bg-gray-200 dark:bg-gray-700 ndpr-text-foreground rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',
                  classNames?.backButton,
                  unstyled,
                )}
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={resolveClass(
                    'ndpr-form-field__hint',
                    classNames?.stepCounter,
                    unstyled,
                  )}
                >
                  Step {currentStep} of 4
                </span>
              </div>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed}
                  className={resolveClass(
                    'px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
                    classNames?.nextButton,
                    unstyled,
                  )}
                >
                  Next
                </button>
              ) : (
                <span />
              )}
            </div>
          </main>

          {/* Compliance sidebar */}
          <aside
            className={resolveClass(
              'w-full lg:w-80 flex-shrink-0',
              classNames?.sidebarWrapper,
              unstyled,
            )}
          >
            <ComplianceCheckerSidebar
              complianceResult={complianceResult}
              onFix={applyFix}
              classNames={classNames}
              unstyled={unstyled}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdaptivePolicyWizard;
