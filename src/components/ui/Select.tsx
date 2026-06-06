'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// This interface extends the standard HTML select attributes
// and allows for additional props to be added in the future
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  // Custom props can be added here
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "block w-full px-3 py-2 text-base",
          "border border-gray-300 dark:border-gray-600 rounded-md shadow-sm",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
          "appearance-none bg-no-repeat bg-right",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]",
          "bg-[length:1.25em_1.25em] pr-10",
          "hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select };
