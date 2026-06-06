'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// This interface extends the standard HTML textarea attributes
// and allows for additional props to be added in the future
export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Custom props can be added here
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "block w-full px-3 py-2 text-base",
          "border border-gray-300 dark:border-gray-600 rounded-md shadow-sm",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
          "min-h-[80px] resize-y",
          "hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

export { TextArea };
