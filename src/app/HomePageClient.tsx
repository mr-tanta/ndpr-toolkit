'use client';

import React from 'react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
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
  SiteTabs,
  CTASection,
} from '@/components/site/ui';

// ─── Code samples ──────────────────────────────────────────────────────────────

const HERO_CODE = `// app/layout.tsx
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import '@tantainnovative/ndpr-toolkit/styles';

export default function RootLayout({ children }) {
  return (
    <NDPRProvider organizationName="MyApp">
      {children}
    </NDPRProvider>
  );
}`;

const LAYOUT_CODE = `// app/layout.tsx
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import '@tantainnovative/ndpr-toolkit/styles';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NDPRProvider
          organizationName="Acme Corp"
          dpoEmail="privacy@acme.ng"
          ndpcRegistrationNumber="NDPC-2026-12345"
        >
          {children}
        </NDPRProvider>
      </body>
    </html>
  );
}`;

const PRIVACY_PAGE_CODE = `// app/privacy/page.tsx
import { useDefaultPrivacyPolicy, PolicyPage } from '@tantainnovative/ndpr-toolkit';

export default function PrivacyPage() {
  const { policy } = useDefaultPrivacyPolicy({
    orgInfo: {
      name: 'Acme Corp',
      email: 'privacy@acme.ng',
      website: 'https://acme.ng',
    },
  });

  return policy ? <PolicyPage policy={policy} /> : null;
}`;

const DSR_PAGE_CODE = `// app/data-request/page.tsx
import { DSRRequestForm } from '@tantainnovative/ndpr-toolkit';

const REQUEST_TYPES = [
  { id: 'access', name: 'Access', description: 'Get a copy of my data',
    estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'erasure', name: 'Erasure', description: 'Delete my data',
    estimatedCompletionTime: 30, requiresAdditionalInfo: false },
];

export default function DataRequestPage() {
  return (
    <DSRRequestForm
      requestTypes={REQUEST_TYPES}
      onSubmit={async (submission) => {
        await fetch('/api/dsr', {
          method: 'POST',
          body: JSON.stringify(submission),
        });
      }}
    />
  );
}

// app/api/dsr/route.ts (server-side, RSC-safe)
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';

export async function POST(req: Request) {
  const result = validateDsrSubmission(await req.json());
  if (!result.valid) return Response.json({ errors: result.errors }, { status: 422 });
  // result.data is the typed DsrSubmissionPayload
  return Response.json({ ok: true }, { status: 201 });
}`;

const SCORE_CODE = `import { getComplianceScore } from '@tantainnovative/ndpr-toolkit';

const score = getComplianceScore({
  hasConsentManagement: true,
  hasDSRPortal: true,
  hasDPIA: true,
  hasBreachNotification: true,
  hasPrivacyPolicy: true,
  hasLawfulBasis: false,
  hasCrossBorder: false,
  hasROPA: false,
});

// { score: 63, grade: 'C', modules: [...] }`;

const PRESETS_CODE = `// One import — fully styled, NDPA-ready
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit';

export default function App() {
  return (
    <ConsentBanner
      position="bottom"
      theme="dark"
      onAccept={handleAccept}
    />
  );
}`;

const COMPONENTS_CODE = `// Mix-and-match headless + styled
import {
  ConsentModal,
  ConsentToggle,
  ConsentAuditLog,
} from '@tantainnovative/ndpr-toolkit';

export default function CustomConsent() {
  return (
    <ConsentModal>
      <ConsentToggle category="analytics" />
      <ConsentToggle category="marketing" />
      <ConsentAuditLog limit={10} />
    </ConsentModal>
  );
}`;

const HOOKS_CODE = `// Hooks-only — bring your own UI
import {
  useConsent,
  useDSR,
  useComplianceScore,
} from '@tantainnovative/ndpr-toolkit';

function MyApp() {
  const { consented, grant, revoke } = useConsent();
  const { submitRequest } = useDSR();
  const { score, grade } = useComplianceScore();

  return <div>Score: {score}/100 ({grade})</div>;
}`;

const CORE_CODE = `// Core utilities — framework agnostic
import {
  validateConsent,
  generateDPIAReport,
  formatBreachNotification,
  computeRetentionDeadline,
} from '@tantainnovative/ndpr-toolkit/core';

const report = generateDPIAReport({
  processingPurpose: 'Marketing analytics',
  dataCategories: ['email', 'behavioural'],
  recipients: ['Segment', 'Mixpanel'],
});`;

const ADAPTERS_CODE = `// Storage adapters — plug in anything
import {
  LocalStorageAdapter,
  PostgresAdapter,
  RedisAdapter,
} from '@tantainnovative/ndpr-toolkit/adapters';

const provider = new NDPRProvider({
  storage: new PostgresAdapter({
    connectionString: process.env.DATABASE_URL,
    table: 'ndpa_consents',
  }),
});`;

// ─── Feature definitions ────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: 'Consent Management',
    description: 'Granular consent banners with audit trails, category management, and NDPA-compliant withdrawal flows.',
    href: '/ndpr-demos/consent',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    badge: 'Core',
  },
  {
    title: 'DSR Portal',
    description: 'Pre-built portal for access, erasure, rectification, portability, and objection requests — ready in one import.',
    href: '/ndpr-demos/dsr',
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    title: 'DPIA Toolkit',
    description: 'Questionnaire-driven risk assessments with severity scoring, mitigation tracking, and PDF export.',
    href: '/ndpr-demos/dpia',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    title: 'Breach Notification',
    description: '72-hour NDPC deadline tracking, breach severity triage, and pre-filled notification templates.',
    href: '/ndpr-demos/breach',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    badge: 'Critical',
  },
  {
    title: 'Privacy Policy',
    description: 'Interactive wizard generating NDPA-compliant privacy policies with custom sections and version history.',
    href: '/ndpr-demos/policy',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Lawful Basis',
    description: 'Document and manage legal grounds for each processing activity with purpose limitation checks.',
    href: '/ndpr-demos/lawful-basis',
    iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  },
  {
    title: 'Cross-Border Transfers',
    description: 'Safeguard evaluator for international data transfers with adequacy decisions and SCCs management.',
    href: '/ndpr-demos/cross-border',
    iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'ROPA Builder',
    description: "Maintain your Record of Processing Activities with asset linking, controller mapping, and audit exports.",
    href: '/ndpr-demos/ropa',
    iconPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 3.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  },
];

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

// ─── Score ring component ───────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const empty = circumference - filled;

  return (
    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth="12"
        />
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Stat card component ────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <SiteCard variant="glass" hover={false}>
      <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
        <div style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          background: 'var(--gradient-text)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-2)',
          fontWeight: 500,
        }}>
          {label}
        </div>
      </div>
    </SiteCard>
  );
}

// ─── Architecture layer component ───────────────────────────────────────────────

function ArchLayer({
  number,
  name,
  description,
  color,
}: {
  number: number;
  name: string;
  description: string;
  color: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
    }}>
      <div style={{
        width: '2rem',
        height: '2rem',
        borderRadius: 'var(--radius-md)',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 'var(--text-sm)',
        color: '#fff',
        flexShrink: 0,
      }}>
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
          {name}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
          {description}
        </div>
      </div>
    </div>
  );
}

// ─── Page client component ──────────────────────────────────────────────────────

export function HomePageClient() {
  return (
    <>
      <SiteHeader />

      <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: 'var(--space-24) 0 var(--space-20)',
          }}
        >
          {/* Background glow orbs */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: '-10rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '600px',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute',
            bottom: 0,
            right: '-8rem',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <Container>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(480px, 100%), 1fr))',
              gap: 'var(--space-16)',
              alignItems: 'center',
            }}>
              {/* Left: headline + CTAs */}
              <div className="animate-fade-in-up" style={{ maxWidth: '560px' }}>
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <SiteBadge variant="default" dot size="md">v3.0 — Now Available</SiteBadge>
                </div>
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}>
                  NDPA Compliance
                  <br />
                  <GradientText>Made Beautiful</GradientText>
                </h1>
                <p style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginTop: 'var(--space-6)',
                  marginBottom: 0,
                  maxWidth: '440px',
                }}>
                  The complete React toolkit for Nigeria Data Protection Act 2023 compliance — ship consent, DSR, DPIA, breach notifications, and more in minutes, not months.
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  marginTop: 'var(--space-8)',
                }}>
                  <SiteButton variant="primary" size="lg" href="/docs">
                    Get Started
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </SiteButton>
                  <SiteButton
                    variant="secondary"
                    size="lg"
                    href="https://github.com/mr-tanta/ndpr-toolkit"
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    View on GitHub
                  </SiteButton>
                </div>
              </div>

              {/* Right: code example */}
              <div className="animate-slide-in-right stagger-2" style={{ width: '100%' }}>
                <SiteCodeBlock
                  code={HERO_CODE}
                  language="tsx"
                  title="app/layout.tsx"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* ── 2. STATS ─────────────────────────────────────────────────────── */}
        <section style={{
          padding: 'var(--space-10) 0',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
        }}>
          <Container>
            <Grid cols={4} gap="md">
              <StatCard value="8" label="Compliance Modules" />
              <StatCard value="788" label="Passing Tests" />
              <StatCard value="0" label="Peer Dependencies" />
              <StatCard value="16–19" label="React Versions" />
            </Grid>
          </Container>
        </section>

        {/* ── 3. 3-FILE QUICKSTART ─────────────────────────────────────────── */}
        <Section
          badge="Quickstart"
          title="Full Compliance in 3 Files"
          subtitle="Drop in three files and you have a consent banner, a privacy policy page, and a data request portal — all NDPA-compliant."
          gradient
        >
          <Container>
            <SiteTabs
              items={[
                {
                  label: 'app/layout.tsx',
                  content: <SiteCodeBlock code={LAYOUT_CODE} language="tsx" title="app/layout.tsx" />,
                },
                {
                  label: 'app/privacy/page.tsx',
                  content: <SiteCodeBlock code={PRIVACY_PAGE_CODE} language="tsx" title="app/privacy/page.tsx" />,
                },
                {
                  label: 'app/data-request/page.tsx',
                  content: <SiteCodeBlock code={DSR_PAGE_CODE} language="tsx" title="app/data-request/page.tsx" />,
                },
              ]}
            />
          </Container>
        </Section>

        {/* ── 4. FEATURES GRID ─────────────────────────────────────────────── */}
        <Section
          badge="Modules"
          title="Everything Compliance Needs"
          subtitle="Eight purpose-built modules covering every requirement of the Nigeria Data Protection Act 2023."
        >
          <Container>
            {/* Bento grid: 2 featured cards on top, 3+3 below */}
            <div className="features-bento">
              {/* Row 1: Two featured cards */}
              {FEATURES.filter(f => f.badge).map((feature, i) => (
                <FeatureCard
                  key={feature.title}
                  icon={<FeatureIcon path={feature.iconPath} />}
                  title={feature.title}
                  description={feature.description}
                  href={feature.href}
                  badge={feature.badge}
                  index={i}
                  featured
                />
              ))}
              {/* Row 2+3: Remaining cards */}
              {FEATURES.filter(f => !f.badge).map((feature, i) => (
                <FeatureCard
                  key={feature.title}
                  icon={<FeatureIcon path={feature.iconPath} />}
                  title={feature.title}
                  description={feature.description}
                  href={feature.href}
                  index={i + 2}
                />
              ))}
            </div>
          </Container>

          <style>{`
            .features-bento {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: var(--space-5);
            }
            .features-bento > :nth-child(n+3) {
              /* After the 2 featured cards, switch to 3-col */
            }
            @media (min-width: 768px) {
              .features-bento {
                grid-template-columns: repeat(2, 1fr);
              }
              .features-bento > :nth-child(n+3) {
                /* 3-col for the remaining 6 */
              }
            }
            @media (min-width: 900px) {
              .features-bento {
                grid-template-columns: repeat(6, 1fr);
              }
              /* First 2 featured cards: span 3 cols each */
              .features-bento > :nth-child(1),
              .features-bento > :nth-child(2) {
                grid-column: span 3;
              }
              /* Remaining 6 cards: span 2 cols each (3 per row) */
              .features-bento > :nth-child(n+3) {
                grid-column: span 2;
              }
            }
            @media (max-width: 600px) {
              .features-bento {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </Section>

        {/* ── 5. ARCHITECTURE ──────────────────────────────────────────────── */}
        <Section
          badge="Architecture"
          title="Choose Your Layer"
          subtitle="Use the high-level presets, drop down to composable components, or go full-headless with hooks and core utilities."
          gradient
        >
          <Container>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
              gap: 'var(--space-8)',
              alignItems: 'start',
            }}>
              {/* Layer visual */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <ArchLayer number={1} name="Presets" description="Drop-in components with zero config. Works out of the box." color="var(--accent)" />
                <ArchLayer number={2} name="Components" description="Composable, styled building blocks you control." color="rgba(37,99,235,0.7)" />
                <ArchLayer number={3} name="Hooks" description="Logic-only hooks — bring your own UI." color="rgba(37,99,235,0.5)" />
                <ArchLayer number={4} name="Core" description="Pure TypeScript utilities, framework agnostic." color="rgba(37,99,235,0.3)" />
                <ArchLayer number={5} name="Adapters" description="Swap storage backends: localStorage, Postgres, Redis." color="rgba(37,99,235,0.15)" />
              </div>

              {/* Code tab switcher */}
              <div>
                <SiteTabs
                  items={[
                    { label: 'Presets', content: <SiteCodeBlock code={PRESETS_CODE} language="tsx" /> },
                    { label: 'Components', content: <SiteCodeBlock code={COMPONENTS_CODE} language="tsx" /> },
                    { label: 'Hooks', content: <SiteCodeBlock code={HOOKS_CODE} language="tsx" /> },
                    { label: 'Core', content: <SiteCodeBlock code={CORE_CODE} language="tsx" /> },
                    { label: 'Adapters', content: <SiteCodeBlock code={ADAPTERS_CODE} language="tsx" /> },
                  ]}
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* ── 6. COMPLIANCE SCORE ──────────────────────────────────────────── */}
        <Section
          badge="Compliance Score"
          title="Know Your Score"
          subtitle="Run a real-time compliance audit against the NDPA 2023 framework and get an actionable breakdown of gaps."
        >
          <Container>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
              gap: 'var(--space-8)',
              alignItems: 'center',
            }}>
              {/* Score visual */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-8)' }}>
                <ScoreRing score={73} />

                {/* Module breakdown */}
                <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { module: 'Consent Management', done: true },
                    { module: 'DSR Portal', done: true },
                    { module: 'Privacy Policy', done: true },
                    { module: 'Breach Notification', done: true },
                    { module: 'DPIA', done: true },
                    { module: 'Lawful Basis', done: false },
                    { module: 'Cross-Border', done: false },
                    { module: 'ROPA', done: false },
                  ].map(({ module, done }) => (
                    <div
                      key={module}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-2) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        background: done ? 'var(--success-light)' : 'var(--bg-elevated)',
                        border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border-default)'}`,
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-sm)', color: done ? 'var(--success)' : 'var(--text-muted)' }}>
                        {module}
                      </span>
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code example */}
              <div>
                <SiteCodeBlock code={SCORE_CODE} language="ts" title="compliance-check.ts" />
                <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    '73/100 overall score with letter grade',
                    'Per-module pass/fail breakdown',
                    'Actionable gap recommendations',
                    'Grades from A to F scale',
                  ].map((point) => (
                    <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* ── 7. CTA ───────────────────────────────────────────────────────── */}
        <CTASection
          title="Ready to Ship"
          gradientWord="Compliance?"
          subtitle="One package, eight modules, zero excuses. Get NDPA-compliant in an afternoon."
          actions={[
            { label: 'Read the Docs', href: '/docs' },
            { label: 'Browse Demos', href: '/ndpr-demos', variant: 'secondary' },
          ]}
        />

      </main>

      <SiteFooter />
    </>
  );
}
