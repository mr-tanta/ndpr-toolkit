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
    background: 'rgba(10, 17, 32, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  highlighted: {
    background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.03) 0%, var(--bg-surface) 100%)',
    border: '1px solid rgba(37, 99, 235, 0.15)',
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
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...variantBaseStyles[variant],
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!hover) return;
    const target = e.currentTarget;
    target.style.transform = 'translateY(-3px)';

    if (variant === 'default') {
      target.style.borderColor = 'var(--border-hover)';
      target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.25)';
    } else if (variant === 'glass') {
      target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.25)';
    } else if (variant === 'highlighted') {
      target.style.borderColor = 'rgba(37, 99, 235, 0.3)';
      target.style.boxShadow = '0 0 40px rgba(37, 99, 235, 0.1), 0 12px 40px rgba(0, 0, 0, 0.2)';
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
      target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    } else if (variant === 'highlighted') {
      target.style.borderColor = 'rgba(37, 99, 235, 0.15)';
    }
  };

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={{ ...baseStyle, display: 'block', textDecoration: 'none', color: 'inherit' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className} style={{ ...baseStyle, display: 'block', textDecoration: 'none', color: 'inherit' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </Link>
    );
  }

  return (
    <div className={className} style={baseStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}
