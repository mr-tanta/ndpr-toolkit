import React from 'react';
import { Container } from './Container';
import { SiteBadge } from './Badge';
import { SiteButton } from './Button';
import { GradientText } from './GradientText';

export interface CTAAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export interface CTASectionProps {
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'info';
  title: string;
  gradientWord: string;
  subtitle: string;
  showInstallCommand?: boolean;
  actions: CTAAction[];
}

export function CTASection({
  badge = 'Open Source — MIT License',
  badgeVariant = 'success',
  title,
  gradientWord,
  subtitle,
  showInstallCommand = true,
  actions,
}: CTASectionProps) {
  return (
    <section style={{ position: 'relative', padding: 'var(--space-32) 0', overflow: 'hidden' }}>
      {/* Background layers */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-surface) 30%, var(--bg-surface) 70%, var(--bg-primary) 100%)',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '500px',
        background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.3), transparent)',
      }} />

      <Container size="md">
        <div style={{
          position: 'relative',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}>
          <SiteBadge variant={badgeVariant} dot size="md">{badge}</SiteBadge>

          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            margin: 0,
          }}>
            <span style={{ color: 'var(--text-primary)' }}>{title} </span>
            <GradientText>{gradientWord}</GradientText>
          </h2>

          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '460px',
            margin: 0,
          }}>
            {subtitle}
          </p>

          {showInstallCommand && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-inset)',
              border: '1px solid rgba(37, 99, 235, 0.12)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              maxWidth: '100%',
              overflowX: 'auto',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
              marginTop: 'var(--space-2)',
            }}>
              <span style={{ color: '#3b82f6', userSelect: 'none', fontWeight: 600 }}>$</span>
              <span>pnpm add </span>
              <span style={{ color: '#60a5fa', fontWeight: 500 }}>@tantainnovative/ndpr-toolkit</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            justifyContent: 'center',
            marginTop: 'var(--space-2)',
          }}>
            {actions.map((action) => (
              <SiteButton
                key={action.label}
                variant={action.variant || 'primary'}
                size="lg"
                href={action.href}
                icon={action.icon}
              >
                {action.label}
                {action.variant !== 'secondary' && !action.icon && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </SiteButton>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
