'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export default function FormField({
  id,
  label,
  required = false,
  error,
  children,
  className = '',
  description,
}: FormFieldProps) {
  const hasError = !!error;

  return (
    <div className={cn('mb-5 space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-200"
        >
          {label} {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      </div>
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      <div className={`relative ${hasError ? 'has-error' : ''}`}>
        {children}

        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}

      <style>{`
        /* This ensures the error icon doesn&apos;t appear on elements that shouldn't have it */
        .has-error > :global(textarea),
        .has-error > :global(input:not([type="checkbox"]):not([type="radio"])),
        .has-error > :global(select) {
          padding-right: 2.5rem;
          border-color: rgb(239, 68, 68);
        }

        .has-error > :global(textarea:focus),
        .has-error > :global(input:focus),
        .has-error > :global(select:focus) {
          border-color: rgb(239, 68, 68);
          --tw-ring-color: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}
