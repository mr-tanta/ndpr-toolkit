import React from 'react';
import { SiteBadge } from './Badge';

export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  gradient?: boolean;
  id?: string;
}

export function Section({
  children,
  title,
  subtitle,
  badge,
  className = '',
  gradient = false,
  id,
}: SectionProps) {
  const sectionStyle: React.CSSProperties = {
    position: 'relative',
    padding: 'var(--space-24) 0',
    ...(gradient
      ? {
          background:
            'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-surface) 50%, var(--bg-primary) 100%)',
        }
      : {}),
  };

  return (
    <section className={className} style={sectionStyle} id={id}>
      {(badge || title || subtitle) && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-16)',
            maxWidth: '640px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: 'var(--space-6)',
            paddingRight: 'var(--space-6)',
          }}
        >
          {badge && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <SiteBadge variant="default" size="md">{badge}</SiteBadge>
            </div>
          )}
          {title && (
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginTop: 'var(--space-4)',
                marginBottom: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
