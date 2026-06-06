'use client';

import * as React from "react"

import { cn } from "@/lib/utils"

// This interface extends the standard HTML input attributes
// and allows for additional props to be added in the future
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Custom props can be added here
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "block w-full px-3 py-2 text-base",
          "border border-gray-300 dark:border-gray-600 rounded-md shadow-sm",
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
