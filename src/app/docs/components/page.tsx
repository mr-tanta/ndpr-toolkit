'use client';

import Link from 'next/link';
import { DocLayout } from './DocLayout';

const components = [
  {
    title: 'Privacy Policy Management',
    description: 'Components for creating, previewing, and exporting NDPA-compliant privacy policies.',
    href: '/docs/components/privacy-policy-generator',
    components: ['PolicyGenerator', 'PolicyPreview', 'PolicyExporter'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Consent Management',
    description: 'Collecting, storing, and managing user consent in compliance with NDPA requirements.',
    href: '/docs/components/consent-management',
    components: ['ConsentBanner', 'ConsentManager', 'ConsentStorage'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Data Subject Rights',
    description: 'Complete system for handling data subject access requests and other rights.',
    href: '/docs/components/data-subject-rights',
    components: ['DSRRequestForm', 'DSRTracker', 'DSRDashboard'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: 'DPIA Questionnaire',
    description: 'Interactive questionnaire for conducting Data Protection Impact Assessments.',
    href: '/docs/components/dpia-questionnaire',
    components: ['DPIAQuestionnaire', 'DPIAReport', 'StepIndicator'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Breach Notification',
    description: 'Managing, assessing, and reporting data breaches within required timeframes.',
    href: '/docs/components/breach-notification',
    components: ['BreachReportForm', 'BreachRiskAssessment', 'RegulatoryReportGenerator'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Lawful Basis Assessment',
    description: 'Identifying and documenting the lawful basis for processing personal data.',
    href: '/docs/components/lawful-basis-tracker',
    components: ['LawfulBasisTracker', 'useLawfulBasis'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Cross-Border Transfer',
    description: 'Managing and documenting cross-border data transfers in compliance with NDPA.',
    href: '/docs/components/cross-border-transfers',
    components: ['CrossBorderTransferManager', 'useCrossBorderTransfer'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'Records of Processing (ROPA)',
    description: 'Maintain comprehensive records of all data processing activities.',
    href: '/docs/components/ropa',
    components: ['ROPAManager', 'useROPA'],
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

export default function ComponentsPage() {
  return (
    <DocLayout
      title="Components"
      description="Documentation for NDPR Toolkit components"
    >
      <p style={{ marginBottom: 'var(--space-8)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        The NDPR Toolkit provides a comprehensive set of components to help you implement NDPA 2023-compliant features.
        Each component addresses specific compliance requirements and integrates easily into your codebase.
      </p>

      <div className="docs-component-grid">
        {components.map((comp) => (
          <Link
            key={comp.title}
            href={comp.href}
            className="docs-component-card"
          >
            <div className="docs-component-icon">
              {comp.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 className="docs-component-title">{comp.title}</h3>
              <p className="docs-component-desc">{comp.description}</p>
              {comp.components && (
                <div className="docs-component-tags">
                  {comp.components.map((c) => (
                    <code key={c} className="docs-component-tag">{c}</code>
                  ))}
                </div>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="docs-component-arrow">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <style>{`
        .docs-component-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
        }
        .docs-component-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-5);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-default);
          background: var(--bg-surface);
          text-decoration: none;
          color: inherit;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .docs-component-card:hover {
          border-color: rgba(37, 99, 235, 0.25);
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.03), var(--bg-surface));
          transform: translateX(4px);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        }
        .docs-component-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(56, 189, 248, 0.06));
          border: 1px solid rgba(37, 99, 235, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .docs-component-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-1) 0;
          line-height: var(--leading-snug);
        }
        .docs-component-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: var(--leading-relaxed);
        }
        .docs-component-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          margin-top: var(--space-3);
        }
        .docs-component-tag {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          color: #60a5fa;
          border: 1px solid var(--border-default);
        }
        .docs-component-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 4px;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .docs-component-card:hover .docs-component-arrow {
          color: #60a5fa;
          transform: translateX(2px);
        }
        @media (min-width: 640px) {
          .docs-component-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .docs-component-card {
            flex-direction: column;
          }
          .docs-component-arrow {
            align-self: flex-end;
            margin-top: auto;
          }
        }
      `}</style>
    </DocLayout>
  );
}
