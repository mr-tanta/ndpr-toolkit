'use client';

import React from 'react';
import Link from 'next/link';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Interactive Demos', href: '/ndpr-demos' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Guides', href: '/docs/guides' },
      { label: 'npm Package', href: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit', external: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Getting Started', href: '/docs' },
      { label: 'Styling Guide', href: '/docs/guides/styling-customization' },
      { label: 'Storage Adapters', href: '/docs/guides/adapters' },
      { label: 'Blog', href: '/blog' },
      { label: 'Changelog', href: 'https://github.com/mr-tanta/ndpr-toolkit/releases', external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: 'https://github.com/mr-tanta/ndpr-toolkit', external: true },
      { label: 'Issues', href: 'https://github.com/mr-tanta/ndpr-toolkit/issues', external: true },
      { label: 'Discussions', href: 'https://github.com/mr-tanta/ndpr-toolkit/discussions', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'MIT License', href: 'https://github.com/mr-tanta/ndpr-toolkit/blob/main/LICENSE', external: true },
      { label: 'NDPA 2023 Text', href: 'https://ndpc.gov.ng', external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'var(--space-16) var(--space-6) var(--space-8)',
        }}
      >
        {/* Top section: brand + columns */}
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-10)',
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#fff',
                }}
              >
                N
              </div>
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                NDPA Toolkit
              </span>
            </Link>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '280px',
                margin: 0,
              }}
            >
              Enterprise-grade compliance components for the Nigeria Data
              Protection Act 2023. Built for Nigerian developers.
            </p>

            {/* Social links */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-5)',
              }}
            >
              <a
                href="https://github.com/mr-tanta"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                aria-label="GitHub"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/mr-tanta"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                aria-label="LinkedIn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://tantainnovatives.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}
                aria-label="Website"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 'var(--space-4)',
                  margin: 0,
                  paddingBottom: 'var(--space-4)',
                }}
              >
                {column.title}
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                          transition: 'color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                          transition: 'color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            &copy; {new Date().getFullYear()} Abraham Esandayinze Tanta. MIT
            License.
          </p>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Built for Nigerian developers, open to the world.
          </p>
        </div>
      </div>

      {/* Responsive footer grid */}
      <style>{`
        .footer-grid {
          grid-template-columns: 1.5fr repeat(4, 1fr);
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 500px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
