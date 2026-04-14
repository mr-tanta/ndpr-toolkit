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
    padding: '0.4375rem 1rem',
    fontSize: 'var(--text-sm)',
    gap: '0.375rem',
    borderRadius: 'var(--radius-lg)',
  },
  md: {
    padding: '0.5625rem 1.375rem',
    fontSize: 'var(--text-sm)',
    gap: '0.5rem',
    borderRadius: 'var(--radius-lg)',
  },
  lg: {
    padding: '0.75rem 1.75rem',
    fontSize: 'var(--text-base)',
    gap: '0.5rem',
    borderRadius: 'var(--radius-xl)',
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
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    textDecoration: 'none',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
    letterSpacing: '-0.01em',
    ...sizeStyles[size],
  };

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
      color: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 99, 235, 0.2)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.03)',
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
      target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 40px rgba(37, 99, 235, 0.25)';
      target.style.transform = 'translateY(-2px)';
    } else if (variant === 'secondary') {
      target.style.borderColor = 'rgba(37, 99, 235, 0.3)';
      target.style.background = 'rgba(37, 99, 235, 0.06)';
      target.style.color = 'var(--text-primary)';
    } else if (variant === 'ghost') {
      target.style.color = 'var(--text-primary)';
      target.style.background = 'rgba(255, 255, 255, 0.04)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 99, 235, 0.2)';
      target.style.transform = 'translateY(0)';
    } else if (variant === 'secondary') {
      target.style.borderColor = 'var(--border-default)';
      target.style.background = 'rgba(255, 255, 255, 0.03)';
      target.style.color = 'var(--text-primary)';
    } else if (variant === 'ghost') {
      target.style.color = 'var(--text-secondary)';
      target.style.background = 'transparent';
    }
  };

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={mergedStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={className} style={mergedStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={className} style={mergedStyle} onClick={onClick} disabled={disabled} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {content}
    </button>
  );
}
