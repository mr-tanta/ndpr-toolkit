import React, { useState } from 'react';
import type { ComplianceResult } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';

export interface PolicyExportPanelProps {
  complianceResult: ComplianceResult;
  onExportPDF: () => Promise<void>;
  onExportDOCX: () => Promise<void>;
  onExportHTML: () => void;
  onExportMarkdown: () => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const RATING_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  compliant: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-700',
  },
  nearly_compliant: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-700',
  },
  not_compliant: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700',
  },
};

const RATING_LABELS: Record<string, string> = {
  compliant: 'Compliant',
  nearly_compliant: 'Nearly Compliant',
  not_compliant: 'Not Compliant',
};

interface FormatCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  actionLabel: string;
  loading?: boolean;
  onClick: () => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const FormatCard: React.FC<FormatCardProps> = ({
  icon,
  label,
  description,
  actionLabel,
  loading,
  onClick,
  classNames,
  unstyled,
}) => (
  <div
    className={resolveClass(
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3',
      classNames?.formatCard,
      unstyled,
    )}
  >
    <div className={resolveClass('flex items-center gap-3', classNames?.formatHeader, unstyled)}>
      <div
        className={resolveClass(
          'w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0',
          classNames?.formatIcon,
          unstyled,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={resolveClass('text-sm font-semibold text-gray-900 dark:text-gray-100', classNames?.formatLabel, unstyled)}>
          {label}
        </p>
        <p className={resolveClass('text-xs text-gray-500 dark:text-gray-400', classNames?.formatDescription, unstyled)}>
          {description}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={resolveClass(
        'w-full px-4 py-2 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded-md hover:bg-[rgb(var(--ndpr-primary-hover))] text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2',
        classNames?.formatButton,
        unstyled,
      )}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 10l-1.73-3A8 8 0 014 12z" />
          </svg>
          Generating…
        </>
      ) : (
        actionLabel
      )}
    </button>
  </div>
);

export const PolicyExportPanel: React.FC<PolicyExportPanelProps> = ({
  complianceResult,
  onExportPDF,
  onExportDOCX,
  onExportHTML,
  onExportMarkdown,
  classNames,
  unstyled,
}) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);

  const ratingStyles = RATING_STYLES[complianceResult.rating] ?? RATING_STYLES.not_compliant;

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      await onExportPDF();
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDOCX = async () => {
    setDocxLoading(true);
    try {
      await onExportDOCX();
    } finally {
      setDocxLoading(false);
    }
  };

  return (
    <div
      data-ndpr-component="policy-export-panel"
      className={resolveClass('space-y-6', classNames?.root, unstyled)}
    >
      {/* Compliance summary */}
      <div
        className={resolveClass(
          `rounded-lg border p-4 flex items-center gap-4 ${ratingStyles.bg} ${ratingStyles.border}`,
          classNames?.complianceSummary,
          unstyled,
        )}
      >
        <div
          className={resolveClass(
            `text-3xl font-bold ${ratingStyles.text}`,
            classNames?.complianceScore,
            unstyled,
          )}
          aria-label={`Compliance score: ${complianceResult.percentage}%`}
        >
          {complianceResult.percentage}%
        </div>
        <div>
          <p
            className={resolveClass(
              `text-sm font-semibold ${ratingStyles.text}`,
              classNames?.complianceRating,
              unstyled,
            )}
          >
            {RATING_LABELS[complianceResult.rating]}
          </p>
          <p className={resolveClass('text-xs text-gray-500 dark:text-gray-400 mt-0.5', classNames?.complianceDetail, unstyled)}>
            {complianceResult.score} / {complianceResult.maxScore} points &bull;{' '}
            {complianceResult.gaps.length} gap
            {complianceResult.gaps.length !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </div>

      {/* Format cards */}
      <div>
        <h3
          className={resolveClass(
            'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3',
            classNames?.formatsHeading,
            unstyled,
          )}
        >
          Export Format
        </h3>
        <div
          className={resolveClass(
            'grid grid-cols-1 sm:grid-cols-2 gap-3',
            classNames?.formatsGrid,
            unstyled,
          )}
        >
          <FormatCard
            icon={
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 7v-1h4v1h-4zm0-3v-1h4v1h-4zm-2-5h8v1H8v-1z" />
              </svg>
            }
            label="PDF"
            description="Professional formatted document, ideal for publishing."
            actionLabel="Download PDF"
            loading={pdfLoading}
            onClick={handlePDF}
            classNames={classNames}
            unstyled={unstyled}
          />

          <FormatCard
            icon={
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-5 8v-5h1.5l1 3 1-3H13v5h-1v-3.5l-.75 2.25h-.5L10 13.5V17H9zm5-1.5h.75c.55 0 .75-.25.75-.75 0-.4-.2-.65-.75-.65H14V15.5zm1 1.5h-2v-4h2c1.1 0 1.75.6 1.75 1.5 0 .55-.25.95-.65 1.15.5.2.8.65.8 1.2 0 1-.65 1.65-1.9 1.65V17zm-.25-1c.6 0 .9-.25.9-.75 0-.45-.3-.75-.9-.75H14V16h.75z" />
              </svg>
            }
            label="DOCX"
            description="Editable Word document for further customisation."
            actionLabel="Download DOCX"
            loading={docxLoading}
            onClick={handleDOCX}
            classNames={classNames}
            unstyled={unstyled}
          />

          <FormatCard
            icon={
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V8h2v9zm4 0h-2V8h2v9z" />
                <path d="M9.5 6.5h1v1h-1zm4 0h1v1h-1z" />
                <path d="M5 5h14v2H5zm0 12h14v2H5z" />
              </svg>
            }
            label="HTML"
            description="Copy-ready HTML to embed on your website."
            actionLabel="Copy HTML"
            onClick={onExportHTML}
            classNames={classNames}
            unstyled={unstyled}
          />

          <FormatCard
            icon={
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z" />
              </svg>
            }
            label="Markdown"
            description="Plain-text format for documentation or Git repos."
            actionLabel="Copy Markdown"
            onClick={onExportMarkdown}
            classNames={classNames}
            unstyled={unstyled}
          />
        </div>
      </div>
    </div>
  );
};

export default PolicyExportPanel;
