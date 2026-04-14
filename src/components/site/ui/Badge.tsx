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
    background: 'var(--accent-light)',
    color: 'var(--accent-hover)',
  },
  success: {
    background: 'var(--success-light)',
    color: 'var(--success)',
  },
  warning: {
    background: 'var(--warning-light)',
    color: 'var(--warning)',
  },
  danger: {
    background: 'var(--danger-light)',
    color: 'var(--danger)',
  },
  info: {
    background: 'var(--info-light)',
    color: 'var(--info)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
  },
};

const dotColors: Record<NonNullable<SiteBadgeProps['variant']>, string> = {
  default: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  outline: 'var(--text-muted)',
};

const sizeStyles: Record<NonNullable<SiteBadgeProps['size']>, React.CSSProperties> = {
  sm: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
  },
  md: {
    fontSize: 'var(--text-xs)',
    padding: '0.1875rem 0.625rem',
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
          }}
        />
      )}
      {children}
    </span>
  );
}
