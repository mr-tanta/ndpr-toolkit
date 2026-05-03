import React from 'react';
import { resolveClass } from '../../utils/styling';

const STEPS = ['Organization', 'Data Collection', 'Processing', 'Review & Export'];

export interface PolicyStepIndicatorProps {
  currentStep: number;
  classNames?: Record<string, string>;
  unstyled?: boolean;
}

export const PolicyStepIndicator: React.FC<PolicyStepIndicatorProps> = ({
  currentStep,
  classNames,
  unstyled,
}) => {
  return (
    <nav
      data-ndpr-component="policy-step-indicator"
      aria-label="Policy wizard progress"
      className={resolveClass(
        'w-full flex items-center justify-between px-2 py-4',
        classNames?.root,
        unstyled,
      )}
    >
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step circle + label */}
            <div
              className={resolveClass(
                'flex flex-col items-center gap-1',
                classNames?.stepWrapper,
                unstyled,
              )}
            >
              <div
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${stepNumber}: ${label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                className={resolveClass(
                  [
                    'flex items-center justify-center rounded-full border-2 font-semibold transition-all',
                    isCompleted
                      ? 'w-8 h-8 bg-[rgb(var(--ndpr-primary))] border-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))]'
                      : isCurrent
                        ? 'w-9 h-9 bg-[rgb(var(--ndpr-primary))] border-[rgb(var(--ndpr-primary))] text-[rgb(var(--ndpr-primary-foreground))] shadow-md'
                        : 'w-8 h-8 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
                  ].join(' '),
                  isCompleted
                    ? classNames?.stepCompleted
                    : isCurrent
                      ? classNames?.stepCurrent
                      : classNames?.stepUpcoming,
                  unstyled,
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs leading-none">{stepNumber}</span>
                )}
              </div>
              <span
                className={resolveClass(
                  [
                    'text-xs font-medium hidden sm:block',
                    isCompleted || isCurrent
                      ? 'text-[rgb(var(--ndpr-primary))]'
                      : 'ndpr-card__subtitle',
                  ].join(' '),
                  classNames?.stepLabel,
                  unstyled,
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {!isLast && (
              <div
                className={resolveClass(
                  [
                    'flex-1 h-0.5 mx-2',
                    isCompleted
                      ? 'bg-[rgb(var(--ndpr-primary))]'
                      : 'bg-gray-200 dark:bg-gray-700',
                  ].join(' '),
                  classNames?.connector,
                  unstyled,
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default PolicyStepIndicator;
