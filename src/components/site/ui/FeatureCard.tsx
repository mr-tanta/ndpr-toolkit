'use client';

import React from 'react';
import Link from 'next/link';
import { SiteBadge } from './Badge';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  badge?: string;
  index?: number;
  className?: string;
  featured?: boolean;
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  badge,
  index = 0,
  className = '',
  featured = false,
}: FeatureCardProps) {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: featured ? 'var(--space-5)' : 'var(--space-4)',
    padding: featured ? 'var(--space-8)' : 'var(--space-6)',
    borderRadius: 'var(--radius-2xl)',
    background: featured
      ? 'linear-gradient(160deg, rgba(37, 99, 235, 0.06) 0%, var(--bg-surface) 40%, var(--bg-surface) 100%)'
      : 'var(--bg-surface)',
    border: featured
      ? '1px solid rgba(37, 99, 235, 0.2)'
      : '1px solid var(--border-default)',
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    color: 'inherit',
    animation: 'fadeInUp 0.5s ease-out forwards',
    animationDelay: `${index * 60}ms`,
    opacity: 0,
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(-4px)';
    if (featured) {
      target.style.borderColor = 'rgba(37, 99, 235, 0.4)';
      target.style.boxShadow = '0 0 60px rgba(37, 99, 235, 0.1), 0 20px 50px rgba(0, 0, 0, 0.25)';
    } else {
      target.style.borderColor = 'rgba(37, 99, 235, 0.25)';
      target.style.boxShadow = '0 0 30px rgba(37, 99, 235, 0.06), 0 16px 40px rgba(0, 0, 0, 0.2)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = 'none';
    target.style.borderColor = featured
      ? 'rgba(37, 99, 235, 0.2)'
      : 'var(--border-default)';
  };

  const iconSize = featured ? '3rem' : '2.5rem';
  const iconRadius = featured ? 'var(--radius-xl)' : 'var(--radius-lg)';

  const content = (
    <>
      {featured && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div
          style={{
            width: iconSize,
            height: iconSize,
            borderRadius: iconRadius,
            background: featured
              ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.1))'
              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(56, 189, 248, 0.06))',
            border: `1px solid rgba(37, 99, 235, ${featured ? '0.2' : '0.1'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: featured ? '#93c5fd' : '#60a5fa',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {badge && (
          <SiteBadge variant={badge === 'Critical' ? 'danger' : 'info'} size="sm">
            {badge}
          </SiteBadge>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: featured ? 'var(--text-lg)' : 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 'var(--leading-snug)',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          margin: 0,
          marginTop: 'var(--space-2)',
        }}>
          {description}
        </p>
      </div>

      {href && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: 'var(--text-sm)',
          color: '#60a5fa',
          fontWeight: 600,
          marginTop: 'auto',
          paddingTop: 'var(--space-2)',
        }}>
          Explore
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      )}
    </>
  );

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={className} style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {content}
    </div>
  );
}
