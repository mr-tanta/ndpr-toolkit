'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const guides = [
  {
    title: 'Conducting a DPIA',
    description: 'Step-by-step guide to conducting a Data Protection Impact Assessment.',
    href: '/docs/guides/conducting-dpia',
    category: 'Assessment',
  },
  {
    title: 'Managing Consent',
    description: 'Implement a complete consent management system with audit trails.',
    href: '/docs/guides/managing-consent',
    category: 'Core',
  },
  {
    title: 'Handling Data Subject Requests',
    description: 'Best practices for handling data subject rights requests.',
    href: '/docs/guides/data-subject-requests',
    category: 'Core',
  },
  {
    title: 'Breach Notification Process',
    description: 'Implement a 72-hour breach notification process.',
    href: '/docs/guides/breach-notification-process',
    category: 'Critical',
  },
  {
    title: 'NDPA 2023 Compliance Checklist',
    description: 'Comprehensive checklist for achieving and maintaining NDPA 2023 compliance.',
    href: '/docs/guides/ndpr-compliance-checklist',
    category: 'Overview',
  },
  {
    title: 'Lawful Basis for Processing',
    description: 'Understanding and documenting lawful basis under NDPA 2023 Section 25.',
    href: '/docs/guides/lawful-basis',
    category: 'Core',
  },
  {
    title: 'Cross-Border Data Transfers',
    description: 'Managing cross-border data transfers in compliance with NDPA 2023 Section 41.',
    href: '/docs/guides/cross-border-transfers',
    category: 'Advanced',
  },
  {
    title: 'Styling & Customization',
    description: 'Customize styles using classNames, unstyled mode, CSS Modules, or vanilla CSS.',
    href: '/docs/guides/styling-customization',
    category: 'Customization',
  },
  {
    title: 'Storage Adapters',
    description: 'Plug in localStorage, IndexedDB, REST, or a custom storage backend.',
    href: '/docs/guides/adapters',
    category: 'Advanced',
  },
  {
    title: 'Compound Components',
    description: 'Build custom UI layouts with granular sub-component control.',
    href: '/docs/guides/compound-components',
    category: 'Advanced',
  },
  {
    title: 'Zero-Config Presets',
    description: 'Single-component drop-ins that handle everything out of the box.',
    href: '/docs/guides/presets',
    category: 'Getting Started',
  },
  {
    title: 'Compliance Score',
    description: 'Real-time NDPA 2023 obligation scoring and dashboard integration.',
    href: '/docs/guides/compliance-score',
    category: 'Assessment',
  },
  {
    title: 'Backend Integration',
    description: 'Express, Next.js API routes, and REST endpoint recipes.',
    href: '/docs/guides/backend-integration',
    category: 'Advanced',
  },
];

const categoryColors: Record<string, string> = {
  Core: '#3b82f6',
  Critical: '#f43f5e',
  Assessment: '#f59e0b',
  Advanced: '#8b5cf6',
  Overview: '#10b981',
  Customization: '#06b6d4',
  'Getting Started': '#10b981',
};

export default function GuidesPage() {
  return (
    <DocLayout
      title="Implementation Guides"
      description="Step-by-step guides for implementing NDPA 2023-compliant features"
    >
      <p style={{ marginBottom: 'var(--space-8)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
        Comprehensive guides to help you implement NDPA 2023-compliant features.
        Each guide provides step-by-step instructions, code examples, and best practices.
      </p>

      <div className="docs-guides-grid">
        {guides.map((guide) => (
          <Link
            key={guide.title}
            href={guide.href}
            className="docs-guide-card"
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <h3 className="docs-guide-title">{guide.title}</h3>
                <span
                  className="docs-guide-category"
                  style={{
                    color: categoryColors[guide.category] || '#60a5fa',
                    background: `${categoryColors[guide.category] || '#3b82f6'}15`,
                    borderColor: `${categoryColors[guide.category] || '#3b82f6'}25`,
                  }}
                >
                  {guide.category}
                </span>
              </div>
              <p className="docs-guide-desc">{guide.description}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="docs-guide-arrow">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <style>{`
        .docs-guides-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .docs-guide-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-default);
          background: var(--bg-surface);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .docs-guide-card:hover {
          border-color: rgba(37, 99, 235, 0.2);
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.03), var(--bg-surface));
          transform: translateX(4px);
        }
        .docs-guide-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          line-height: var(--leading-snug);
        }
        .docs-guide-category {
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.0625rem 0.5rem;
          border-radius: var(--radius-full);
          border: 1px solid;
          line-height: 1.6;
          letter-spacing: 0.02em;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .docs-guide-desc {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin: 0;
          line-height: var(--leading-relaxed);
        }
        .docs-guide-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .docs-guide-card:hover .docs-guide-arrow {
          color: #60a5fa;
          transform: translateX(2px);
        }
      `}</style>
    </DocLayout>
  );
}
