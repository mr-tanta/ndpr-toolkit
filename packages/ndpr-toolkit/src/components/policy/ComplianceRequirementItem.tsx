import React, { useState } from 'react';
import type { ComplianceGap } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';

export interface ComplianceRequirementItemProps {
  gap: ComplianceGap;
  isPassed: boolean;
  onFix: (gapId: string) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const SEVERITY_COLORS: Record<ComplianceGap['severity'], string> = {
  critical: 'text-red-600 dark:text-red-400',
  important: 'text-amber-600 dark:text-amber-400',
  recommended: 'text-blue-600 dark:text-blue-400',
};

export const ComplianceRequirementItem: React.FC<ComplianceRequirementItemProps> = ({
  gap,
  isPassed,
  onFix,
  classNames,
  unstyled,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-ndpr-component="compliance-requirement-item"
      className={resolveClass(
        'border-b border-gray-100 dark:border-gray-700 last:border-0 py-2',
        classNames?.root,
        unstyled,
      )}
    >
      {/* Main row */}
      <button
        type="button"
        onClick={() => !isPassed && setExpanded((v) => !v)}
        className={resolveClass(
          'w-full flex items-start gap-2 text-left group',
          classNames?.row,
          unstyled,
        )}
        aria-expanded={!isPassed ? expanded : undefined}
        aria-disabled={isPassed}
      >
        {/* Status icon */}
        <span
          className={resolveClass(
            [
              'mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center',
              isPassed
                ? 'bg-green-500'
                : gap.severity === 'critical'
                  ? 'bg-red-500'
                  : gap.severity === 'important'
                    ? 'bg-amber-500'
                    : 'bg-blue-400',
            ].join(' '),
            classNames?.statusIcon,
            unstyled,
          )}
          aria-hidden="true"
        >
          {isPassed ? (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p
              className={resolveClass(
                `text-xs font-medium ${isPassed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`,
                classNames?.requirementLabel,
                unstyled,
              )}
            >
              {gap.requirement}
            </p>
            {!isPassed && (
              <svg
                className={`flex-shrink-0 w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
          <p
            className={resolveClass(
              'text-xs text-gray-400 dark:text-gray-500 mt-0.5',
              classNames?.ndpaSection,
              unstyled,
            )}
          >
            NDPA {gap.ndpaSection}
          </p>
        </div>
      </button>

      {/* Expanded detail */}
      {!isPassed && expanded && (
        <div
          className={resolveClass(
            'mt-2 ml-6 space-y-2',
            classNames?.detail,
            unstyled,
          )}
        >
          <p
            className={resolveClass(
              `text-xs ${SEVERITY_COLORS[gap.severity]}`,
              classNames?.message,
              unstyled,
            )}
          >
            {gap.message}
          </p>
          <button
            type="button"
            onClick={() => {
              onFix(gap.requirementId);
              setExpanded(false);
            }}
            className={resolveClass(
              'text-xs font-medium px-3 py-1 bg-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] rounded hover:bg-[rgb(var(--ndpr-primary-hover))]',
              classNames?.fixButton,
              unstyled,
            )}
          >
            {gap.fixLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplianceRequirementItem;
