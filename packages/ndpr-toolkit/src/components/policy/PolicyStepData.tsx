import React from 'react';
import type { DataCategory } from '../../types/policy-engine';
import { resolveClass } from '../../utils/styling';

export interface PolicyStepDataProps {
  categories: DataCategory[];
  onToggle: (categoryId: string) => void;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

const GROUP_LABELS: Record<DataCategory['group'], string> = {
  identity: 'Identity',
  financial: 'Financial',
  behavioral: 'Behavioural',
  sensitive: 'Sensitive',
  children: 'Children',
};

const GROUP_ORDER: DataCategory['group'][] = [
  'identity',
  'financial',
  'behavioral',
  'sensitive',
  'children',
];

const SENSITIVE_GROUPS: DataCategory['group'][] = ['sensitive', 'children'];

export const PolicyStepData: React.FC<PolicyStepDataProps> = ({
  categories,
  onToggle,
  classNames,
  unstyled,
}) => {
  const grouped = GROUP_ORDER.reduce<Record<string, DataCategory[]>>((acc, group) => {
    const items = categories.filter((c) => c.group === group);
    if (items.length > 0) acc[group] = items;
    return acc;
  }, {});

  return (
    <div
      data-ndpr-component="policy-step-data"
      className={resolveClass('space-y-8', classNames?.root, unstyled)}
    >
      <div>
        <h2 className={resolveClass('text-xl font-semibold text-gray-900 dark:text-gray-100', classNames?.heading, unstyled)}>
          Data Categories
        </h2>
        <p id="data-categories-desc" className={resolveClass('text-sm text-gray-500 dark:text-gray-400 mt-1', classNames?.subheading, unstyled)}>
          Select the categories of personal data your organisation collects. You must select at least one.
        </p>
      </div>

      {Object.entries(grouped).map(([group, items]) => {
        const isSensitive = SENSITIVE_GROUPS.includes(group as DataCategory['group']);

        return (
          <div key={group} className={resolveClass('space-y-3', classNames?.group, unstyled)}>
            {/* Group header */}
            <div className={resolveClass('flex items-center gap-2', classNames?.groupHeader, unstyled)}>
              <h3
                className={resolveClass(
                  'text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
                  classNames?.groupTitle,
                  unstyled,
                )}
              >
                {GROUP_LABELS[group as DataCategory['group']]}
              </h3>
              {isSensitive && (
                <span
                  className={resolveClass(
                    'text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full',
                    classNames?.sensitiveTag,
                    unstyled,
                  )}
                >
                  Sensitive
                </span>
              )}
            </div>

            {isSensitive && (
              <p
                className={resolveClass(
                  'text-xs text-amber-700 dark:text-amber-400',
                  classNames?.sensitiveWarning,
                  unstyled,
                )}
              >
                {group === 'children'
                  ? 'Processing children\'s data requires parental consent under NDPA Section 31 and imposes heightened obligations.'
                  : 'Sensitive/special-category data requires explicit consent and additional safeguards under NDPA Section 30.'}
              </p>
            )}

            {/* Category cards */}
            <div
              className={resolveClass(
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
                classNames?.cardsGrid,
                unstyled,
              )}
            >
              {items.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggle(cat.id)}
                  aria-pressed={cat.selected}
                  className={resolveClass(
                    [
                      'text-left rounded-lg border p-4 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ndpr-ring))]',
                      cat.selected
                        ? 'bg-[rgb(var(--ndpr-primary))]/5 border-[rgb(var(--ndpr-primary))] dark:bg-[rgb(var(--ndpr-primary))]/10'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                    ].join(' '),
                    classNames?.card,
                    unstyled,
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox visual */}
                    <div
                      className={resolveClass(
                        [
                          'mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center',
                          cat.selected
                            ? 'bg-[rgb(var(--ndpr-primary))] border-[rgb(var(--ndpr-primary))]'
                            : 'border-gray-300 dark:border-gray-600',
                        ].join(' '),
                        classNames?.checkbox,
                        unstyled,
                      )}
                      aria-hidden="true"
                    >
                      {cat.selected && (
                        <svg
                          className="w-2.5 h-2.5 text-[rgb(var(--ndpr-primary-foreground))]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={resolveClass(
                          'text-sm font-medium text-gray-900 dark:text-gray-100',
                          classNames?.cardLabel,
                          unstyled,
                        )}
                      >
                        {cat.label}
                      </p>
                      <p
                        className={resolveClass(
                          'text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed',
                          classNames?.cardDataPoints,
                          unstyled,
                        )}
                      >
                        {cat.dataPoints.join(', ')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PolicyStepData;
