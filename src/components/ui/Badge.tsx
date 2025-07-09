'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-700 text-white dark:bg-gray-500 focus:ring-gray-500",
        primary: "bg-blue-700 text-white dark:bg-blue-600 focus:ring-blue-500",
        secondary: "bg-gray-600 text-white dark:bg-gray-400 focus:ring-gray-500",
        success: "bg-green-700 text-white dark:bg-green-600 focus:ring-green-500",
        danger: "bg-red-700 text-white dark:bg-red-600 focus:ring-red-500",
        warning: "bg-amber-700 text-white dark:bg-amber-600 focus:ring-amber-500",
        info: "bg-blue-700 text-white dark:bg-blue-600 focus:ring-blue-500",
        outline: "border-2 border-gray-700 dark:border-gray-300 text-gray-900 dark:text-gray-100 focus:ring-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
