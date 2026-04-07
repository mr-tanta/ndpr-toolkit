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
export declare const StepIndicator: React.FC<StepIndicatorProps>;
