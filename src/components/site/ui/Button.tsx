'use client';

import React from 'react';
import Link from 'next/link';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: {
    padding: '0.375rem 0.875rem',
    fontSize: 'var(--text-sm)',
    gap: '0.375rem',
    borderRadius: 'var(--radius-md)',
  },
  md: {
    padding: '0.5rem 1.25rem',
    fontSize: 'var(--text-sm)',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    padding: '0.75rem 1.75rem',
    fontSize: 'var(--text-base)',
    gap: '0.5rem',
    borderRadius: 'var(--radius-lg)',
  },
};

export function SiteButton({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  icon,
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    border: 'none',
    textDecoration: 'none',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
  };

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary)',
      color: '#ffffff',
      boxShadow: 'var(--shadow-sm), 0 0 20px var(--accent-glow)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
  };

  const mergedStyle: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
  };

  const content = (
    <>
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      {children}
    </>
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.boxShadow = 'var(--shadow-md), 0 0 40px var(--accent-glow)';
      target.style.transform = 'translateY(-1px)';
    } else if (variant === 'secondary') {
      target.style.borderColor = 'var(--border-hover)';
      target.style.background = 'var(--accent-light)';
      target.style.color = 'var(--text-primary)';
    } else if (variant === 'ghost') {
      target.style.color = 'var(--text-primary)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.boxShadow = 'var(--shadow-sm), 0 0 20px var(--accent-glow)';
      target.style.transform = 'translateY(0)';
    } else if (variant === 'secondary') {
      target.style.borderColor = 'var(--border-default)';
      target.style.background = 'transparent';
      target.style.color = 'var(--text-primary)';
    } else if (variant === 'ghost') {
      target.style.color = 'var(--text-secondary)';
    }
  };

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          style={mergedStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={className}
        style={mergedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={className}
      style={mergedStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </button>
  );
}
