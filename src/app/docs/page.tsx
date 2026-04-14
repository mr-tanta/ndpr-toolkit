'use client';

import React from 'react';
import {
  Container,
  SiteButton,
  SiteCard,
  SiteBadge,
  Section,
  SiteCodeBlock,
  GradientText,
  FeatureCard,
  Grid,
} from '@/components/site/ui';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { siteConfig } from '@/lib/site-config';

/* ── Data ─────────────────────────────────────────────────── */

const v3Features = [
  {
    title: 'Storage Adapters',
    description:
      'Swap storage backends at runtime — localStorage, IndexedDB, REST API, or a custom adapter — without touching component code.',
    href: '/docs/guides/adapters',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: 'Compound Components',
    description:
      'Compose granular sub-components to build exactly the UI you need, with full control over layout and structure.',
    href: '/docs/guides/compound-components',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Zero-Config Presets',
    description:
      'Drop in NDPRConsent, NDPRSubjectRights, and other presets for instant compliance with zero boilerplate.',
    href: '/docs/guides/presets',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Compliance Score',
    description:
      'Real-time compliance scoring across all NDPA 2023 obligations, surfaced through the NDPRDashboard component.',
    href: '/docs/guides/compliance-score',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'Backend Recipes',
    description:
      'Pre-built patterns for Express, Next.js API routes, and REST endpoints — drop-in compliance for your backend.',
    href: '/docs/guides/backend-integration',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'Styling & Customization',
    description:
      'Full className injection system — pass unstyled mode, merge Tailwind, or use CSS variables to match any brand.',
    href: '/docs/guides/styling-customization',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" />
        <circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" />
        <circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
];

const quickStartSteps = [
  {
    step: '01',
    title: 'Install',
    code: `pnpm add @tantainnovative/ndpr-toolkit`,
    language: 'bash',
    title_label: 'terminal',
  },
  {
    step: '02',
    title: 'Add Provider',
    code: `import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';

export default function RootLayout({ children }) {
  return (
    <NDPRProvider config={{ organizationName: 'Acme Corp' }}>
      {children}
    </NDPRProvider>
  );
}`,
    language: 'tsx',
    title_label: 'app/layout.tsx',
  },
  {
    step: '03',
    title: 'Add Preset',
    code: `import { NDPRConsent } from '@tantainnovative/ndpr-toolkit';

export default function Page() {
  return (
    <>
      <NDPRConsent />
      {/* your page content */}
    </>
  );
}`,
    language: 'tsx',
    title_label: 'app/page.tsx',
  },
];

const componentGuides = [
  {
    title: 'Consent Management',
    description: 'Banners, preference modals, and audit-ready storage for NDPA S.25–26.',
    href: '/docs/components/consent-management',
    badge: 'S.25–26',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Data Subject Rights',
    description: 'DSR forms, dashboards, and request tracking for NDPA S.34–40.',
    href: '/docs/components/data-subject-rights',
    badge: 'S.34–40',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'DPIA Questionnaire',
    description: 'Risk scoring, templates, and regulatory guidance for NDPA S.28–30.',
    href: '/docs/components/dpia-questionnaire',
    badge: 'S.28–30',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Breach Notification',
    description: 'Notification workflows, severity assessment, and NDPC reporting timelines.',
    href: '/docs/components/breach-notification',
    badge: 'S.40–41',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Privacy Policy Generator',
    description: 'Generate, preview, and manage privacy policies with full NDPA clause coverage.',
    href: '/docs/components/privacy-policy-generator',
    badge: 'S.24',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
    description: 'Document and track the lawful basis for every processing activity.',
    href: '/docs/components/lawful-basis-tracker',
    badge: 'S.25',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Cross-Border Transfers',
    description: 'Adequacy checks and safeguard recommendations for international transfers.',
    href: '/docs/components/cross-border-transfers',
    badge: 'S.41–45',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'ROPA',
    description: 'Records of Processing Activities with categorization, filtering, and export.',
    href: '/docs/components/ropa',
    badge: 'S.29',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

const implGuides = [
  {
    title: 'Storage Adapters',
    description: 'Plug in localStorage, IndexedDB, REST, or a fully custom storage backend.',
    href: '/docs/guides/adapters',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: 'Compound Components',
    description: 'Build custom UI layouts with granular sub-component control.',
    href: '/docs/guides/compound-components',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Zero-Config Presets',
    description: 'Single-component drop-ins that handle everything out of the box.',
    href: '/docs/guides/presets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Compliance Score',
    description: 'Real-time NDPA 2023 obligation scoring and dashboard integration.',
    href: '/docs/guides/compliance-score',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'Backend Integration',
    description: 'Express, Next.js API routes, and REST endpoint recipes for server-side compliance.',
    href: '/docs/guides/backend-integration',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'Styling & Customization',
    description: 'CSS variables, className injection, unstyled mode, and Tailwind integration.',
    href: '/docs/guides/styling-customization',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

/* ── Page ─────────────────────────────────────────────────── */

export default function DocsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <SiteHeader />

      <main>
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
                'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <Container size="lg">
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
              <div
                style={{ marginBottom: 'var(--space-5)' }}
                className="animate-fade-in-up"
              >
                <SiteBadge variant="default" size="md" dot>
                  v{siteConfig.version} — Latest
                </SiteBadge>
              </div>

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
                <GradientText>Documentation</GradientText>
              </h1>

              <p
                className="animate-fade-in-up stagger-2"
                style={{
                  fontSize: 'var(--text-xl)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: '0 0 var(--space-8)',
                }}
              >
                Everything you need to build NDPA 2023-compliant applications — component API references, implementation guides, adapter recipes, and NDPC best practices.
              </p>

              {/* Decorative search bar */}
              <div
                className="animate-fade-in-up stagger-3"
                style={{
                  position: 'relative',
                  maxWidth: '520px',
                  margin: '0 auto var(--space-8)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-xl)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'border-color var(--transition-base)',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-muted)',
                      flex: 1,
                      textAlign: 'left',
                    }}
                  >
                    Search documentation...
                  </span>
                  <kbd
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-elevated)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* CTAs */}
              <div
                className="animate-fade-in-up stagger-4"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  justifyContent: 'center',
                }}
              >
                <SiteButton href="/docs/components" size="lg">
                  Browse Components
                </SiteButton>
                <SiteButton href="/ndpr-demos" variant="secondary" size="lg">
                  See Live Demos
                </SiteButton>
              </div>
            </div>
          </Container>
        </section>

        {/* ── What's New in v3 ──────────────────────────────── */}
        <Section
          badge={`What's New in v${siteConfig.version}`}
          title="Everything new in the latest release"
          subtitle="Six major capabilities added to make NDPA compliance faster, more flexible, and production-ready."
          gradient
        >
          <Container>
            <Grid cols={3} gap="md">
              {v3Features.map((feat, i) => (
                <FeatureCard
                  key={feat.href}
                  icon={feat.icon}
                  title={feat.title}
                  description={feat.description}
                  href={feat.href}
                  index={i}
                />
              ))}
            </Grid>
          </Container>
        </Section>

        {/* ── Quick Start ──────────────────────────────────── */}
        <Section
          badge="Getting Started"
          title="Up and running in 3 steps"
          subtitle="From zero to NDPA-compliant in under 5 minutes. No configuration required."
        >
          <Container size="lg">
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-6)',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
              }}
            >
              {quickStartSteps.map((step, i) => (
                <div
                  key={step.step}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    opacity: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                  }}
                >
                  {/* Step header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {step.step}
                    </div>
                    <h3
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h3>
                  </div>

                  {/* Code block */}
                  <SiteCodeBlock
                    code={step.code}
                    language={step.language}
                    title={step.title_label}
                  />
                </div>
              ))}
            </div>

            {/* Full docs CTA */}
            <div
              style={{
                textAlign: 'center',
                marginTop: 'var(--space-12)',
              }}
            >
              <SiteButton href="/docs/guides" variant="secondary" size="lg">
                View all guides
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginLeft: 'var(--space-2)' }}
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </SiteButton>
            </div>
          </Container>
        </Section>

        {/* ── Browse by Category ────────────────────────────── */}
        <Section gradient>
          <Container>
            {/* Component Guides */}
            <div style={{ marginBottom: 'var(--space-16)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-8)',
                }}
              >
                <div>
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <SiteBadge variant="info" size="md">
                      Component Guides
                    </SiteBadge>
                  </div>
                  <h2
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    8 compliance modules, fully documented
                  </h2>
                  <p
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--text-secondary)',
                      marginTop: 'var(--space-2)',
                      marginBottom: 0,
                    }}
                  >
                    Each module maps to specific NDPA 2023 obligations, complete with props reference and usage examples.
                  </p>
                </div>
                <SiteButton href="/docs/components" variant="secondary" size="sm">
                  View all components
                </SiteButton>
              </div>

              <Grid cols={4} gap="md">
                {componentGuides.map((guide, i) => (
                  <FeatureCard
                    key={guide.href}
                    icon={guide.icon}
                    title={guide.title}
                    description={guide.description}
                    href={guide.href}
                    badge={guide.badge}
                    index={i}
                  />
                ))}
              </Grid>
            </div>

            {/* Implementation Guides */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-8)',
                }}
              >
                <div>
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <SiteBadge variant="success" size="md">
                      Implementation Guides
                    </SiteBadge>
                  </div>
                  <h2
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Deep-dive implementation patterns
                  </h2>
                  <p
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--text-secondary)',
                      marginTop: 'var(--space-2)',
                      marginBottom: 0,
                    }}
                  >
                    Advanced patterns for adapters, presets, backend recipes, and full NDPA compliance strategies.
                  </p>
                </div>
                <SiteButton href="/docs/guides" variant="secondary" size="sm">
                  View all guides
                </SiteButton>
              </div>

              <Grid cols={3} gap="md">
                {implGuides.map((guide, i) => (
                  <FeatureCard
                    key={guide.href}
                    icon={guide.icon}
                    title={guide.title}
                    description={guide.description}
                    href={guide.href}
                    index={i}
                  />
                ))}
              </Grid>
            </div>
          </Container>
        </Section>

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <section
          style={{
            padding: 'var(--space-20) 0',
            textAlign: 'center',
          }}
        >
          <Container size="md">
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <SiteBadge variant="default" size="md" dot>
                Ready to build?
              </SiteBadge>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                margin: '0 0 var(--space-5)',
              }}
            >
              Start shipping compliant features{' '}
              <GradientText>today</GradientText>
            </h2>
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: '0 0 var(--space-8)',
              }}
            >
              {siteConfig.moduleCount} modules, {siteConfig.testCount}+ tests, zero-config presets — everything you need to be NDPA 2023 compliant from day one.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                justifyContent: 'center',
              }}
            >
              <SiteButton href="/docs/components" size="lg">
                Browse Components
              </SiteButton>
              <SiteButton
                href={siteConfig.repoUrl}
                variant="secondary"
                size="lg"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Star on GitHub
              </SiteButton>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
