import React from 'react';
import { resolveClass } from '../../utils/styling';

export interface Step {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * Display label for the step
   */
  label: string;

  /**
   * Optional description for the step
   */
  description?: string;

  /**
   * Whether the step is completed
   */
  completed: boolean;

  /**
   * Whether the step is the current active step
   */
  active: boolean;

  /**
   * Optional icon for the step
   */
  icon?: React.ReactNode;
}

export interface StepIndicatorClassNames {
  /** Outermost wrapper */
  root?: string;
  /** Individual step wrapper */
  step?: string;
  /** Active step circle / indicator */
  stepActive?: string;
  /** Completed step circle / indicator */
  stepCompleted?: string;
  /** Pending (incomplete, inactive) step circle / indicator */
  stepPending?: string;
  /** Connector line between steps */
  connector?: string;
  /** Step label text */
  label?: string;
}

export interface StepIndicatorProps {
  /**
   * Array of steps to display
   */
  steps: Step[];

  /**
   * Callback function called when a step is clicked
   */
  onStepClick?: (stepId: string) => void;

  /**
   * Whether the steps are clickable
   * @default true
   */
  clickable?: boolean;

  /**
   * Orientation of the step indicator
   * @default "horizontal"
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Custom CSS class for the container
   */
  className?: string;

  /**
   * Custom CSS class for the active step
   */
  activeStepClassName?: string;

  /**
   * Custom CSS class for completed steps
   */
  completedStepClassName?: string;

  /**
   * Custom CSS class for incomplete steps
   */
  incompleteStepClassName?: string;

  /**
   * Per-section class name overrides
   */
  classNames?: StepIndicatorClassNames;

  /**
   * When true, all default classes are stripped.
   * Only explicit overrides from `classNames` are applied.
   * @default false
   */
  unstyled?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  clickable = true,
  orientation = 'horizontal',
  className = '',
  activeStepClassName = '',
  completedStepClassName = '',
  incompleteStepClassName = '',
  classNames = {},
  unstyled = false,
}) => {
  const cx = (defaultClass: string, key?: keyof StepIndicatorClassNames) =>
    resolveClass(defaultClass, key ? classNames[key] : undefined, unstyled);

  const handleStepClick = (stepId: string) => {
    if (clickable && onStepClick) {
      onStepClick(stepId);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      role="navigation"
      aria-label="Step progress"
      className={`${cx(
        isVertical
          ? 'flex flex-col space-y-4'
          : 'flex items-center justify-between',
        'root',
      )} ${className}`}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        // Resolve the text-level class using legacy props as first fallback,
        // then the new classNames keys, and finally the built-in defaults.
        const labelClass = step.active
          ? cx(
              `font-medium ${activeStepClassName || 'text-[rgb(var(--ndpr-primary))] dark:text-[rgb(var(--ndpr-primary))]'}`,
              'label',
            )
          : step.completed
            ? cx(
                completedStepClassName || 'text-green-600 dark:text-green-400',
                'label',
              )
            : cx(
                incompleteStepClassName || 'text-gray-600 dark:text-gray-400',
                'label',
              );

        // Circle indicator class
        const circleClass = step.active
          ? cx(
              'flex items-center justify-center w-8 h-8 rounded-full bg-[rgb(var(--ndpr-primary)/0.1)] dark:bg-[rgb(var(--ndpr-primary)/0.2)] text-[rgb(var(--ndpr-primary))] dark:text-[rgb(var(--ndpr-primary))] border-2 border-[rgb(var(--ndpr-primary))] dark:border-[rgb(var(--ndpr-primary))]',
              'stepActive',
            )
          : step.completed
            ? cx(
                'flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-400',
                'stepCompleted',
              )
            : cx(
                'flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600',
                'stepPending',
              );

        return (
          <React.Fragment key={step.id}>
            <div
              className={cx(
                `${isVertical ? 'flex items-start' : 'flex flex-col items-center'} ${clickable ? 'cursor-pointer' : ''}`,
                'step',
              )}
              onClick={() => handleStepClick(step.id)}
              aria-current={step.active ? 'step' : undefined}
            >
              <div className={`
                flex items-center justify-center
                ${isVertical ? 'mr-4' : ''}
              `}>
                <div className={circleClass}>
                  {step.icon ? (
                    step.icon
                  ) : step.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>

              <div className={`
                ${isVertical ? 'flex-1' : 'mt-2 text-center'}
              `}>
                <div className={`text-sm font-medium ${labelClass}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {!isLast && (
              <div className={cx(
                isVertical
                  ? 'ml-4 h-8 border-l-2 border-gray-300 dark:border-gray-600'
                  : 'w-full border-t-2 border-gray-300 dark:border-gray-600 hidden sm:block',
                'connector',
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
