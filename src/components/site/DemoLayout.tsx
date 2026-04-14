'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Scales } from '@phosphor-icons/react';

export interface DemoLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  ndpaSection?: string;
  code?: string;
  className?: string;
}

export function DemoLayout({
  children,
  title,
  description,
  ndpaSection,
  code,
  className = '',
}: DemoLayoutProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div
      className={className}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        {/* Back link */}
        <Link
          href="/ndpr-demos"
          className="demo-back-link"
        >
          <ArrowLeft size={14} weight="bold" />
          All Demos
        </Link>

        {/* Layout: sidebar + main */}
        <div className="demo-layout-grid">
          {/* Side panel */}
          <aside style={{ position: 'sticky', top: 'calc(3.75rem + var(--space-6))', alignSelf: 'start' }} className="demo-sidebar">
            <div className="demo-sidebar-card">
              <h1 className="demo-sidebar-title">{title}</h1>
              <p className="demo-sidebar-desc">{description}</p>

              {ndpaSection && (
                <div className="demo-ndpa-ref">
                  <div className="demo-ndpa-ref-header">
                    <Scales size={14} weight="duotone" />
                    <span>NDPA Reference</span>
                  </div>
                  <p className="demo-ndpa-ref-text">{ndpaSection}</p>
                </div>
              )}

              {code && (
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="demo-code-toggle"
                >
                  <Code size={14} weight="bold" />
                  {showCode ? 'Hide code' : 'View code'}
                </button>
              )}

              {/* Quick links */}
              <div className="demo-sidebar-links">
                <Link href="/docs" className="demo-sidebar-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                  Documentation
                </Link>
                <a href="https://github.com/mr-tanta/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="demo-sidebar-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                  Source Code
                </a>
              </div>
            </div>
          </aside>

          {/* Main area */}
          <main style={{ minWidth: 0 }}>
            {showCode && code && (
              <div className="demo-code-panel">
                <div className="demo-code-header">
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Quick Start
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(37, 99, 235, 0.08)' }}>
                    tsx
                  </span>
                </div>
                <pre style={{ margin: 0, padding: '1.25rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.75, color: 'var(--text-secondary)', overflow: 'auto', tabSize: 2 }}>
                  <code>{code}</code>
                </pre>
              </div>
            )}

            <div className="demo-content">
              {children}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        /* ── Layout ── */
        .demo-layout-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-6);
        }
        @media (max-width: 900px) {
          .demo-layout-grid { grid-template-columns: 1fr; }
          .demo-sidebar { position: static !important; }
        }

        /* ── Back link ── */
        .demo-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: var(--space-6);
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-md);
          transition: all 0.15s ease;
        }
        .demo-back-link:hover {
          color: #60a5fa;
          background: rgba(37, 99, 235, 0.06);
        }

        /* ── Sidebar ── */
        .demo-sidebar-card {
          border-radius: var(--radius-xl);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          padding: var(--space-6);
        }
        .demo-sidebar-title {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: var(--leading-tight);
          letter-spacing: -0.01em;
        }
        .demo-sidebar-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin: var(--space-3) 0 0 0;
        }

        /* ── NDPA reference ── */
        .demo-ndpa-ref {
          margin-top: var(--space-5);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          background: rgba(37, 99, 235, 0.06);
          border: 1px solid rgba(37, 99, 235, 0.12);
        }
        .demo-ndpa-ref-header {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #60a5fa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .demo-ndpa-ref-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: var(--space-1) 0 0 0;
        }

        /* ── Code toggle ── */
        .demo-code-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          margin-top: var(--space-4);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .demo-code-toggle:hover {
          border-color: rgba(37, 99, 235, 0.25);
          color: #60a5fa;
          background: rgba(37, 99, 235, 0.04);
        }

        /* ── Sidebar links ── */
        .demo-sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-default);
        }
        .demo-sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-decoration: none;
          padding: 0.3125rem 0;
          transition: color 0.15s ease;
        }
        .demo-sidebar-link:hover {
          color: #60a5fa;
        }

        /* ── Code panel ── */
        .demo-code-panel {
          margin-bottom: var(--space-5);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--border-default);
          background: var(--bg-inset);
          animation: fadeInUp 0.2s ease-out;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        }
        .demo-code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 1.25rem;
          border-bottom: 1px solid var(--border-default);
          background: linear-gradient(180deg, var(--bg-elevated), var(--bg-surface));
        }

        /* ── Demo content ── */
        .demo-content {
          border-radius: var(--radius-xl);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          padding: var(--space-8);
        }

        /* ── Dark-mode overrides for shadcn/Tailwind inside demos ── */
        .demo-content [data-slot="card"],
        .demo-content .rounded-lg.border,
        .demo-content .rounded-xl.border {
          background: var(--bg-elevated) !important;
          border-color: var(--border-default) !important;
        }
        .demo-content [data-slot="button"],
        .demo-content button.border {
          color: var(--text-secondary) !important;
          border-color: var(--border-default) !important;
        }
        .demo-content [data-slot="button"]:hover,
        .demo-content button.border:hover {
          color: var(--text-primary) !important;
          border-color: var(--border-hover) !important;
        }
        .demo-content .bg-white { background: var(--bg-elevated) !important; }
        .demo-content .bg-gray-50,
        .demo-content .bg-gray-100 { background: var(--bg-elevated) !important; }
        .demo-content .bg-gray-800 { background: var(--bg-inset) !important; }
        .demo-content .bg-gray-900 { background: var(--bg-inset) !important; }
        .demo-content .bg-gray-950 { background: var(--bg-primary) !important; }
        .demo-content .text-gray-900,
        .demo-content .text-gray-800 { color: var(--text-primary) !important; }
        .demo-content .text-gray-700,
        .demo-content .text-gray-600,
        .demo-content .text-gray-500 { color: var(--text-secondary) !important; }
        .demo-content .text-gray-400,
        .demo-content .text-gray-300 { color: var(--text-muted) !important; }
        .demo-content .border-gray-200,
        .demo-content .border-gray-300,
        .demo-content .border-gray-700 { border-color: var(--border-default) !important; }
        .demo-content .divide-gray-200 > * + *,
        .demo-content .divide-gray-700 > * + * { border-color: var(--border-default) !important; }
        .demo-content .text-muted-foreground { color: var(--text-muted) !important; }
        .demo-content .bg-muted { background: var(--bg-elevated) !important; }
        .demo-content .bg-background { background: var(--bg-surface) !important; }
        .demo-content .bg-primary { background: #2563eb !important; }
        .demo-content .text-primary-foreground { color: #fff !important; }
        .demo-content .bg-accent { background: var(--bg-hover) !important; }
        .demo-content .border-border { border-color: var(--border-default) !important; }
        .demo-content .shadow-sm { box-shadow: var(--shadow-sm) !important; }
        .demo-content .bg-blue-50,
        .demo-content .bg-blue-50\\/50 { background: rgba(37, 99, 235, 0.06) !important; }
        .demo-content .bg-blue-950\\/20 { background: rgba(37, 99, 235, 0.08) !important; }
        .demo-content .text-blue-900,
        .demo-content .text-blue-800,
        .demo-content .text-blue-700 { color: #93c5fd !important; }
        .demo-content .text-blue-400,
        .demo-content .text-blue-300,
        .demo-content .text-blue-200 { color: #93c5fd !important; }
        .demo-content .border-blue-200,
        .demo-content .border-blue-800 { border-color: rgba(37, 99, 235, 0.2) !important; }
        .demo-content .bg-emerald-50 { background: rgba(16, 185, 129, 0.06) !important; }
        .demo-content .text-emerald-700,
        .demo-content .text-emerald-600\\/70 { color: #34d399 !important; }
        .demo-content .border-emerald-200,
        .demo-content .border-emerald-800 { border-color: rgba(16, 185, 129, 0.2) !important; }
        .demo-content .bg-red-50 { background: rgba(244, 63, 94, 0.06) !important; }
        .demo-content .text-red-700,
        .demo-content .text-red-800 { color: #fca5a5 !important; }
        .demo-content .bg-amber-50,
        .demo-content .bg-yellow-50 { background: rgba(245, 158, 11, 0.06) !important; }
        .demo-content .text-amber-700,
        .demo-content .text-yellow-700,
        .demo-content .text-amber-800 { color: #fcd34d !important; }
        .demo-content .bg-green-50 { background: rgba(16, 185, 129, 0.06) !important; }
        .demo-content .text-green-700,
        .demo-content .text-green-800 { color: #6ee7b7 !important; }
        .demo-content .ring-ring { --tw-ring-color: rgba(37, 99, 235, 0.3) !important; }

        /* ── Headings inside demo content ── */
        .demo-content h2 {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .demo-content h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }
        .demo-content h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
