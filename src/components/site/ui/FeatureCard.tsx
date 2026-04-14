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
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  badge,
  index = 0,
  className = '',
}: FeatureCardProps) {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    padding: 'var(--space-6)',
    borderRadius: 'var(--radius-xl)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    transition: 'all var(--transition-base)',
    textDecoration: 'none',
    color: 'inherit',
    animation: 'fadeInUp 0.5s ease-out forwards',
    animationDelay: `${index * 75}ms`,
    opacity: 0,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = 'var(--accent)';
    target.style.transform = 'translateY(-4px)';
    target.style.boxShadow = 'var(--shadow-glow)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = 'var(--border-default)';
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = 'none';
  };

  const content = (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {badge && <SiteBadge variant="success" size="sm">{badge}</SiteBadge>}
      </div>
      <div>
        <h3
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: 0,
            marginTop: 'var(--space-2)',
          }}
        >
          {description}
        </p>
      </div>
      {href && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--accent)',
            fontWeight: 500,
            marginTop: 'auto',
          }}
        >
          Learn more
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          style={cardStyle}
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
        style={cardStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </div>
  );
}
