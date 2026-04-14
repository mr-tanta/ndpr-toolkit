'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        {/* Back link */}
        <Link
          href="/ndpr-demos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: 'var(--space-8)',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
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
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to demos
        </Link>

        {/* Layout: sidebar + main */}
        <div className="demo-layout-grid">
          {/* Side panel */}
          <aside
            style={{
              position: 'sticky',
              top: 'calc(3.5rem + var(--space-8))',
              alignSelf: 'start',
            }}
            className="demo-sidebar"
          >
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                padding: 'var(--space-6)',
              }}
            >
              <h1
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginTop: 'var(--space-3)',
                  marginBottom: 0,
                }}
              >
                {description}
              </p>

              {ndpaSection && (
                <div
                  style={{
                    marginTop: 'var(--space-5)',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-light)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    NDPA Reference
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      marginTop: 'var(--space-1)',
                    }}
                  >
                    {ndpaSection}
                  </p>
                </div>
              )}

              {code && (
                <button
                  onClick={() => setShowCode(!showCode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    marginTop: 'var(--space-5)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
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
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  {showCode ? 'Hide code' : 'View code'}
                </button>
              )}
            </div>
          </aside>

          {/* Main area */}
          <main style={{ minWidth: 0 }}>
            {/* Code panel (collapsible) */}
            {showCode && code && (
              <div
                style={{
                  marginBottom: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-inset)',
                  animation: 'fadeInUp 0.2s ease-out',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    Implementation
                  </span>
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: '1rem 1.25rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    overflow: 'auto',
                    tabSize: 2,
                  }}
                >
                  <code>{code}</code>
                </pre>
              </div>
            )}

            {/* Demo content */}
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                padding: 'var(--space-8)',
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .demo-layout-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: var(--space-8);
        }
        @media (max-width: 900px) {
          .demo-layout-grid {
            grid-template-columns: 1fr;
          }
          .demo-sidebar {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
}
