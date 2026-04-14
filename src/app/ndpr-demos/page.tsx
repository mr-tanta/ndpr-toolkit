'use client';

import React from 'react';
import {
  Container,
  SiteButton,
  SiteBadge,
  Section,
  GradientText,
  FeatureCard,
  Grid,
  CTASection,
} from '@/components/site/ui';
import { siteConfig } from '@/lib/site-config';

/* ── Demo data ─────────────────────────────────────────────── */

const demos = [
  {
    title: 'Consent Management',
    description:
      'Interactive consent banners, preference modals, and audit-ready storage — aligned with NDPA S.25–26.',
    href: '/ndpr-demos/consent',
    badge: 'NDPA S.25–26',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Data Subject Rights',
    description:
      'DSR request forms, real-time dashboards, and request tracking for access, rectification, and erasure.',
    href: '/ndpr-demos/dsr',
    badge: 'NDPA S.34–40',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'DPIA Tools',
    description:
      'Data Protection Impact Assessments with live risk scoring, guided templates, and regulatory guidance.',
    href: '/ndpr-demos/dpia',
    badge: 'NDPA S.28–30',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Breach Management',
    description:
      'Breach notification workflows, severity assessment, and NDPC 72-hour reporting timeline tracking.',
    href: '/ndpr-demos/breach',
    badge: 'NDPA S.40–41',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Privacy Policy',
    description:
      'Generate, preview, and manage NDPA-compliant privacy policies with full clause coverage.',
    href: '/ndpr-demos/policy',
    badge: 'NDPA S.24',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Lawful Basis Tracker',
    description:
      'Document and track the lawful basis for every processing activity with full audit trails.',
    href: '/ndpr-demos/lawful-basis',
    badge: 'NDPA S.25',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Cross-Border Transfers',
    description:
      'Assess international data transfers with adequacy checks and safeguard recommendations.',
    href: '/ndpr-demos/cross-border',
    badge: 'NDPA S.41–45',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'ROPA',
    description:
      'Maintain Records of Processing Activities with categorization, filtering, and export capabilities.',
    href: '/ndpr-demos/ropa',
    badge: 'NDPA S.29',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

const stats = [
  { value: String(siteConfig.moduleCount), label: 'Live demos' },
  { value: `${siteConfig.testCount}+`, label: 'Tests passing' },
  { value: 'Zero', label: 'Config required' },
  { value: '2023', label: 'NDPA aligned' },
];

/* ── Page ──────────────────────────────────────────────────── */

export default function NDPRDemosPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: 'var(--space-20) 0 var(--space-16)',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-10rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60rem',
            height: '30rem',
            background:
              'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container size="lg">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            {/* Badge */}
            <div
              className="animate-fade-in-up"
              style={{ marginBottom: 'var(--space-5)' }}
            >
              <SiteBadge variant="success" size="md" dot>
                Interactive — zero setup
              </SiteBadge>
            </div>

            {/* Title */}
            <h1
              className="animate-fade-in-up stagger-1"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: '-0.03em',
                margin: '0 0 var(--space-5)',
                color: 'var(--text-primary)',
              }}
            >
              <GradientText>Live Demos</GradientText>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-fade-in-up stagger-2"
              style={{
                fontSize: 'var(--text-xl)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-8)',
              }}
            >
              See every module in action — interactive, zero-config. Click any card to explore consent flows, data subject rights, breach management, and more.
            </p>

            {/* CTAs */}
            <div
              className="animate-fade-in-up stagger-3"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                justifyContent: 'center',
              }}
            >
              <SiteButton href="/ndpr-demos/consent" size="lg">
                Start with Consent
              </SiteButton>
              <SiteButton href="/docs" variant="secondary" size="lg">
                Read the Docs
              </SiteButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section style={{ paddingBottom: 'var(--space-12)' }}>
        <Container size="lg">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-4)',
              padding: 'var(--space-6) var(--space-8)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    background: 'var(--gradient-text)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Demo Grid ────────────────────────────────────── */}
      <Section
        badge="All Modules"
        title="8 compliance modules, live and interactive"
        subtitle="Each demo is a fully functional component powered by ndpr-toolkit. No mocks, no stubs — real compliance logic running in your browser."
        gradient
      >
        <Container>
          <div className="demos-grid">
            {demos.map((demo, i) => (
              <FeatureCard
                key={demo.href}
                icon={demo.icon}
                title={demo.title}
                description={demo.description}
                href={demo.href}
                badge={demo.badge}
                index={i}
              />
            ))}
          </div>
          <style>{`
            .demos-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: var(--space-5);
            }
            @media (max-width: 1100px) {
              .demos-grid { grid-template-columns: repeat(3, 1fr); }
            }
            @media (max-width: 800px) {
              .demos-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 500px) {
              .demos-grid { grid-template-columns: 1fr; }
            }
          `}</style>
        </Container>
      </Section>

      {/* ── Install CTA ──────────────────────────────────── */}
      <CTASection
        badge="Ready to use in production"
        badgeVariant="default"
        title="Add NDPA compliance to your app"
        gradientWord="today"
        subtitle={`One package, ${siteConfig.moduleCount} modules, zero configuration required. Covers all major NDPA 2023 obligations out of the box.`}
        actions={[
          { label: 'Read the Docs', href: '/docs' },
          {
            label: 'View on npm',
            href: siteConfig.npmUrl,
            variant: 'secondary',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0v24h24V0H0zm6.672 19.334H3.334V8h3.338v11.334zm6.66 0H10V8h3.332v11.334zm6.67 0H16.67V8h3.332v8.002h-3.338v3.332z" />
              </svg>
            ),
          },
        ]}
      />
    </div>
  );
}
