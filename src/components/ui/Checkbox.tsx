'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={id}
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-blue-600",
              "focus:ring-blue-500 focus:ring-offset-0",
              "disabled:opacity-70 disabled:cursor-not-allowed",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label 
                htmlFor={id} 
                className={cn(
                  "font-medium text-gray-900 dark:text-white",
                  props.disabled && "text-gray-500 dark:text-gray-400"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
