import React, { useState } from 'react';
import type { ComplianceResult, ComplianceGap } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';
import { ComplianceScoreRing } from './ComplianceScoreRing';
import { ComplianceRequirementItem } from './ComplianceRequirementItem';

export interface ComplianceCheckerSidebarProps {
  complianceResult: ComplianceResult;
  onFix: (gapId: string) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

// All known requirement IDs to show in the sidebar (gaps + passed)
function buildAllRequirements(
  gaps: ComplianceGap[],
  passed: string[],
): Array<{ gap: ComplianceGap; isPassed: boolean }> {
  // Passed items need a placeholder shape for rendering
  const passedItems: Array<{ gap: ComplianceGap; isPassed: boolean }> = passed.map((id) => ({
    gap: {
      requirementId: id,
      requirement: id
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      ndpaSection: '—',
      severity: 'recommended' as const,
      message: '',
      fixType: 'fill_field' as const,
      fixLabel: '',
    },
    isPassed: true,
  }));

  const gapItems: Array<{ gap: ComplianceGap; isPassed: boolean }> = gaps.map((g) => ({
    gap: g,
    isPassed: false,
  }));

  // Show gaps first (ordered: critical > important > recommended), then passed
  const order: Record<ComplianceGap['severity'], number> = {
    critical: 0,
    important: 1,
    recommended: 2,
  };

  gapItems.sort((a, b) => order[a.gap.severity] - order[b.gap.severity]);

  return [...gapItems, ...passedItems];
}

export const ComplianceCheckerSidebar: React.FC<ComplianceCheckerSidebarProps> = ({
  complianceResult,
  onFix,
  classNames,
  unstyled,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const allRequirements = buildAllRequirements(
    complianceResult.gaps,
    complianceResult.passed,
  );

  return (
    <aside
      data-ndpr-component="compliance-checker-sidebar"
      className={resolveClass(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        classNames?.root,
        unstyled,
      )}
      aria-label="NDPA compliance checker"
    >
      {/* Header */}
      <div
        className={resolveClass(
          'flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50',
          classNames?.header,
          unstyled,
        )}
      >
        <h2
          className={resolveClass(
            'text-sm font-semibold text-gray-900 dark:text-gray-100',
            classNames?.title,
            unstyled,
          )}
        >
          NDPA Compliance
        </h2>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={resolveClass(
            'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            classNames?.collapseButton,
            unstyled,
          )}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand compliance checker' : 'Collapse compliance checker'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div
          className={resolveClass('p-4 space-y-4', classNames?.body, unstyled)}
        >
          {/* Score ring */}
          <div className={resolveClass('flex justify-center', classNames?.ringWrapper, unstyled)}>
            <ComplianceScoreRing
              score={complianceResult.score}
              maxScore={complianceResult.maxScore}
              rating={complianceResult.rating}
              classNames={classNames}
              unstyled={unstyled}
            />
          </div>

          {/* Stats row */}
          <div
            className={resolveClass(
              'grid grid-cols-3 gap-2 text-center',
              classNames?.statsRow,
              unstyled,
            )}
          >
            {(
              [
                { count: complianceResult.gaps.filter((g) => g.severity === 'critical').length, label: 'Critical', color: 'text-red-600 dark:text-red-400' },
                { count: complianceResult.gaps.filter((g) => g.severity === 'important').length, label: 'Important', color: 'text-amber-600 dark:text-amber-400' },
                { count: complianceResult.passed.length, label: 'Passed', color: 'text-green-600 dark:text-green-400' },
              ] as const
            ).map(({ count, label, color }) => (
              <div key={label}>
                <p className={resolveClass(`text-base font-bold ${color}`, classNames?.statValue, unstyled)}>
                  {count}
                </p>
                <p className={resolveClass('text-xs text-gray-500 dark:text-gray-400', classNames?.statLabel, unstyled)}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Requirements list */}
          <div
            className={resolveClass(
              'overflow-y-auto max-h-80',
              classNames?.requirementsList,
              unstyled,
            )}
          >
            {allRequirements.length === 0 ? (
              <p className={resolveClass('text-xs text-gray-500 dark:text-gray-400 text-center py-4', classNames?.emptyState, unstyled)}>
                No requirements to display.
              </p>
            ) : (
              allRequirements.map(({ gap, isPassed }) => (
                <ComplianceRequirementItem
                  key={gap.requirementId}
                  gap={gap}
                  isPassed={isPassed}
                  onFix={onFix}
                  classNames={classNames}
                  unstyled={unstyled}
                />
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default ComplianceCheckerSidebar;
