import React from 'react';

export interface SiteBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<NonNullable<SiteBadgeProps['variant']>, React.CSSProperties> = {
  default: {
    background: 'rgba(37, 99, 235, 0.1)',
    color: '#60a5fa',
    border: '1px solid rgba(37, 99, 235, 0.15)',
  },
  success: {
    background: 'var(--success-light)',
    color: 'var(--success)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
  },
  warning: {
    background: 'var(--warning-light)',
    color: 'var(--warning)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
  },
  danger: {
    background: 'var(--danger-light)',
    color: 'var(--danger)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
  },
  info: {
    background: 'rgba(56, 189, 248, 0.1)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.15)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
  },
};

const dotColors: Record<NonNullable<SiteBadgeProps['variant']>, string> = {
  default: '#3b82f6',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: '#38bdf8',
  outline: 'var(--text-muted)',
};

const sizeStyles: Record<NonNullable<SiteBadgeProps['size']>, React.CSSProperties> = {
  sm: {
    fontSize: '0.6875rem',
    padding: '0.1875rem 0.625rem',
  },
  md: {
    fontSize: 'var(--text-xs)',
    padding: '0.25rem 0.75rem',
  },
};

export function SiteBadge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}: SiteBadgeProps) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: 500,
    borderRadius: 'var(--radius-full)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    letterSpacing: '0.01em',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <span className={className} style={style}>
      {dot && (
        <span
          style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            backgroundColor: dotColors[variant],
            flexShrink: 0,
            boxShadow: `0 0 6px ${dotColors[variant]}`,
          }}
        />
      )}
      {children}
    </span>
  );
}
