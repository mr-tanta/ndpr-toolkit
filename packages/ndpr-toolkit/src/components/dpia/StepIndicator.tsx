import React from 'react';

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
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  onStepClick,
  clickable = true,
  orientation = 'horizontal',
  className = '',
  activeStepClassName = '',
  completedStepClassName = '',
  incompleteStepClassName = ''
}) => {
  const handleStepClick = (stepId: string) => {
    if (clickable && onStepClick) {
      onStepClick(stepId);
    }
  };
  
  const isVertical = orientation === 'vertical';
  
  return (
    <div 
      className={`${className} ${
        isVertical 
          ? 'flex flex-col space-y-4' 
          : 'flex items-center justify-between'
      }`}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const stepClassName = step.active 
          ? `font-medium ${activeStepClassName || 'text-blue-600 dark:text-blue-400'}` 
          : step.completed 
            ? `${completedStepClassName || 'text-green-600 dark:text-green-400'}` 
            : `${incompleteStepClassName || 'text-gray-500 dark:text-gray-400'}`;
        
        return (
          <React.Fragment key={step.id}>
            <div 
              className={`
                ${isVertical ? 'flex items-start' : 'flex flex-col items-center'}
                ${clickable ? 'cursor-pointer' : ''}
              `}
              onClick={() => handleStepClick(step.id)}
            >
              <div className={`
                flex items-center justify-center
                ${isVertical ? 'mr-4' : ''}
              `}>
                <div className={`
                  flex items-center justify-center
                  w-8 h-8 rounded-full
                  ${step.active 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400' 
                    : step.completed 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                  }
                `}>
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
                <div className={`text-sm font-medium ${stepClassName}`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {!isLast && (
              <div className={`
                ${isVertical 
                  ? 'ml-4 h-8 border-l-2 border-gray-300 dark:border-gray-600' 
                  : 'w-full border-t-2 border-gray-300 dark:border-gray-600 hidden sm:block'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
