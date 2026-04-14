'use client';

import React from 'react';
import Link from 'next/link';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'highlighted';
  href?: string;
  className?: string;
  hover?: boolean;
}

const variantBaseStyles: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  default: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
  },
  glass: {
    background: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  highlighted: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    position: 'relative',
  },
};

export function SiteCard({
  children,
  variant = 'default',
  href,
  className = '',
  hover = true,
}: CardProps) {
  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    transition: 'all var(--transition-base)',
    ...variantBaseStyles[variant],
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!hover) return;
    const target = e.currentTarget;
    target.style.transform = 'translateY(-2px)';
    target.style.boxShadow = 'var(--shadow-lg)';

    if (variant === 'default') {
      target.style.borderColor = 'var(--border-hover)';
    } else if (variant === 'glass') {
      target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    } else if (variant === 'highlighted') {
      target.style.borderColor = 'var(--accent)';
      target.style.boxShadow = 'var(--shadow-glow)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!hover) return;
    const target = e.currentTarget;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = 'none';

    if (variant === 'default') {
      target.style.borderColor = 'var(--border-default)';
    } else if (variant === 'glass') {
      target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
    } else if (variant === 'highlighted') {
      target.style.borderColor = 'var(--border-default)';
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
          style={{ ...baseStyle, display: 'block', textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={className}
        style={{ ...baseStyle, display: 'block', textDecoration: 'none', color: 'inherit' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
