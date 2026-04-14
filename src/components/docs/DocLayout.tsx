'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  isNew?: boolean;
};

type DocLayoutProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
};

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/docs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Components',
    href: '/docs/components',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    children: [
      { title: 'DPIA Questionnaire', href: '/docs/components/dpia-questionnaire' },
      { title: 'Consent Management', href: '/docs/components/consent-management' },
      { title: 'Data Subject Rights', href: '/docs/components/data-subject-rights' },
      { title: 'Breach Notification', href: '/docs/components/breach-notification' },
      { title: 'Privacy Policy Generator', href: '/docs/components/privacy-policy-generator' },
      { title: 'Hooks', href: '/docs/components/hooks' },
      { title: 'Lawful Basis Tracker', href: '/docs/components/lawful-basis-tracker', isNew: true },
      { title: 'Cross-Border Transfers', href: '/docs/components/cross-border-transfers', isNew: true },
      { title: 'ROPA', href: '/docs/components/ropa', isNew: true },
    ],
  },
  {
    title: 'Implementation Guides',
    href: '/docs/guides',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    children: [
      { title: 'NDPA Compliance Checklist', href: '/docs/guides/ndpr-compliance-checklist' },
      { title: 'Conducting a DPIA', href: '/docs/guides/conducting-dpia' },
      { title: 'Managing Consent', href: '/docs/guides/managing-consent' },
      { title: 'Handling Data Subject Requests', href: '/docs/guides/data-subject-requests' },
      { title: 'Breach Notification Process', href: '/docs/guides/breach-notification-process' },
      { title: 'Lawful Basis for Processing', href: '/docs/guides/lawful-basis', isNew: true },
      { title: 'Cross-Border Transfers', href: '/docs/guides/cross-border-transfers', isNew: true },
      { title: 'Styling & Customization', href: '/docs/guides/styling-customization', isNew: true },
      { title: 'Storage Adapters', href: '/docs/guides/adapters', isNew: true },
      { title: 'Compound Components', href: '/docs/guides/compound-components', isNew: true },
      { title: 'Zero-config Presets', href: '/docs/guides/presets', isNew: true },
      { title: 'Compliance Score', href: '/docs/guides/compliance-score', isNew: true },
      { title: 'Backend Integration', href: '/docs/guides/backend-integration', isNew: true },
      { title: 'Internationalization', href: '/docs/guides/internationalization', isNew: true },
      { title: 'CLI Scaffolder', href: '/docs/guides/cli-scaffolder', isNew: true },
    ],
  },
];

/* ── Breadcrumbs ── */

function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = useMemo(() => {
    const parts: { label: string; href: string }[] = [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
    ];

    if (pathname === '/docs') return parts;

    for (const item of navigation) {
      if (item.children) {
        const matchedChild = item.children.find((child) => child.href === pathname);
        if (matchedChild) {
          parts.push({ label: item.title, href: item.href });
          parts.push({ label: matchedChild.title, href: matchedChild.href });
          return parts;
        }
      }
      if (item.href === pathname && item.href !== '/docs') {
        parts.push({ label: item.title, href: item.href });
        return parts;
      }
    }

    const segments = pathname.replace('/docs/', '').split('/');
    let accumulated = '/docs';
    for (const seg of segments) {
      accumulated += `/${seg}`;
      const label = seg
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      parts.push({ label, href: accumulated });
    }

    return parts;
  }, [pathname]);

  return (
    <nav
      aria-label="Breadcrumb"
      style={{ marginBottom: 'var(--space-4)' }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          overflowX: 'auto',
        }}
      >
        {crumbs.map((crumb, index) => (
          <li
            key={crumb.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {index > 0 && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                style={{ marginRight: '0.375rem' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {index === crumbs.length - 1 ? (
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Table of Contents ── */

function TableOfContents() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const article = document.querySelector('.doc-prose');
    if (!article) return;

    const elements = article.querySelectorAll('h2, h3');
    const items: { id: string; text: string; level: number }[] = [];

    elements.forEach((el) => {
      if (!el.id) {
        el.id = (el.textContent || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      items.push({
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });

    setHeadings(items);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="doc-toc" aria-label="On this page">
      <div className="doc-toc-inner">
        <p className="doc-toc-title">On this page</p>
        <nav>
          <ul className="doc-toc-list">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <li key={h.id} className={h.level === 3 ? 'doc-toc-h3' : ''}>
                  <a
                    href={`#${h.id}`}
                    className={`doc-toc-link${isActive ? ' active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(h.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveId(h.id);
                      }
                    }}
                  >
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

/* ── DocLayout ── */

export function DocLayout({ children, title, description }: DocLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isExactActive = (href: string) => pathname === href;

  const isActive = (href: string) => {
    if (href === '/docs' && pathname === '/docs') return true;
    return pathname !== '/docs' && pathname.startsWith(href);
  };

  const renderNavSection = (item: NavItem, onLinkClick?: () => void) => {
    const sectionActive = isActive(item.href);
    const exactActive = isExactActive(item.href);

    return (
      <div key={item.title} style={{ marginBottom: 'var(--space-2)' }}>
        {/* Section header link */}
        <Link
          href={item.href}
          onClick={onLinkClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            fontSize: 'var(--text-sm)',
            fontWeight: exactActive || sectionActive ? 600 : 500,
            color: exactActive
              ? '#60a5fa'
              : sectionActive
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-fast)',
            background: exactActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!exactActive) {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!exactActive) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = sectionActive
                ? 'var(--text-primary)'
                : 'var(--text-secondary)';
            }
          }}
        >
          {item.icon && (
            <span style={{ color: exactActive || sectionActive ? '#60a5fa' : 'var(--text-muted)' }}>
              {item.icon}
            </span>
          )}
          <span style={{ flex: 1 }}>{item.title}</span>
        </Link>

        {/* Children */}
        {item.children && (
          <div
            style={{
              marginTop: 'var(--space-1)',
              marginLeft: '1.75rem',
              borderLeft: '1px solid var(--border-default)',
              paddingLeft: 'var(--space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1px',
            }}
          >
            {item.children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onLinkClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.3125rem 0.625rem',
                    fontSize: 'var(--text-sm)',
                    fontWeight: childActive ? 500 : 400,
                    color: childActive ? '#60a5fa' : 'var(--text-muted)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)',
                    background: childActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!childActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!childActive) {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ flex: 1 }}>{child.title}</span>
                  {child.isNew && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        padding: '0.0625rem 0.375rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--success-light)',
                        color: 'var(--success)',
                        lineHeight: 1.4,
                        letterSpacing: '0.02em',
                      }}
                    >
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Mobile menu toggle */}
      <div className="doc-mobile-toggle">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          style={{
            position: 'fixed',
            top: '0.75rem',
            left: '0.75rem',
            zIndex: 'var(--z-overlay)' as unknown as number,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {mobileMenuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className="doc-sidebar-desktop"
        aria-label="Documentation navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '16rem',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 'var(--z-sticky)' as unknown as number,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-5)',
            borderBottom: '1px solid var(--border-default)',
            flexShrink: 0,
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.625rem',
                color: '#fff',
              }}
            >
              N
            </div>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              NDPA Toolkit
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            padding: 'var(--space-4) var(--space-3)',
            overflowY: 'auto',
          }}
          aria-label="Sidebar"
        >
          {navigation.map((item) => renderNavSection(item))}
        </nav>

        {/* Bottom actions */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-4)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            flexShrink: 0,
          }}
        >
          <Link
            href="/blog"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Blog
          </Link>
          <a
            href="https://github.com/mr-tanta/ndpr-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            GitHub
          </a>
        </div>
      </aside>

      {/* Mobile overlay + sidebar */}
      {mobileMenuOpen && (
        <div className="doc-mobile-overlay">
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 149,
            }}
            onClick={() => setMobileMenuOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close navigation menu"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMobileMenuOpen(false);
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '18rem',
              maxWidth: '85vw',
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-default)',
              overflowY: 'auto',
              zIndex: 150,
              animation: 'slideInLeft 0.2s ease-out',
              display: 'flex',
              flexDirection: 'column',
            }}
            aria-label="Mobile navigation"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-5)',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    color: '#fff',
                  }}
                >
                  N
                </div>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  NDPA Toolkit
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                aria-label="Close navigation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav
              style={{
                flex: 1,
                padding: 'var(--space-4) var(--space-3)',
                overflowY: 'auto',
              }}
            >
              {navigation.map((item) =>
                renderNavSection(item, () => setMobileMenuOpen(false))
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content with TOC */}
      <div className="doc-main-content">
        <div className="doc-content-grid">
          <main className="doc-article">
            {/* Breadcrumbs */}
            <Breadcrumbs pathname={pathname} />

            {/* Title block */}
            <div
              style={{
                paddingBottom: 'var(--space-6)',
                marginBottom: 'var(--space-8)',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <h1
                style={{
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 'var(--leading-tight)',
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>
              {description && (
                <p
                  style={{
                    fontSize: 'var(--text-lg)',
                    color: 'var(--text-secondary)',
                    marginTop: 'var(--space-2)',
                    marginBottom: 0,
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {description}
                </p>
              )}
            </div>

            {/* Page content */}
            <div className="doc-prose">
              {children}
            </div>
          </main>

          {/* Right TOC sidebar */}
          <TableOfContents />
        </div>
      </div>

      {/* Responsive rules */}
      <style>{`
        .doc-sidebar-desktop {
          display: flex;
        }
        .doc-mobile-toggle {
          display: none;
        }
        .doc-main-content {
          margin-left: 16rem;
          min-height: 100vh;
        }
        .doc-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 15rem;
          max-width: 100%;
        }
        .doc-article {
          padding: var(--space-8) var(--space-10);
          min-width: 0;
        }

        /* ── TOC sidebar ── */
        .doc-toc {
          position: sticky;
          top: 0;
          align-self: start;
          height: 100vh;
          overflow-y: auto;
          border-left: 1px solid var(--border-default);
          padding: var(--space-8) var(--space-5);
          flex-shrink: 0;
        }
        .doc-toc-inner {
          width: 100%;
        }
        .doc-toc-title {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin: 0 0 var(--space-3) 0;
          padding-left: 0.625rem;
        }
        .doc-toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-left: 1px solid var(--border-default);
        }
        .doc-toc-link {
          display: block;
          font-size: 0.8125rem;
          color: var(--text-muted);
          text-decoration: none;
          padding: 0.25rem 0 0.25rem 0.625rem;
          line-height: 1.4;
          transition: color 0.15s ease, border-color 0.15s ease;
          border-left: 2px solid transparent;
          margin-left: -1px;
          word-break: break-word;
        }
        .doc-toc-h3 .doc-toc-link {
          padding-left: 1.25rem;
          font-size: 0.75rem;
        }
        .doc-toc-link:hover {
          color: var(--text-primary);
        }
        .doc-toc-link.active {
          color: #60a5fa;
          border-left-color: #2563eb;
        }

        /* ── Prose ── */
        .doc-prose {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          color: var(--text-secondary);
        }
        .doc-prose h1, .doc-prose h2, .doc-prose h3, .doc-prose h4 {
          color: var(--text-primary);
          font-weight: 600;
          letter-spacing: -0.01em;
          scroll-margin-top: 2rem;
        }
        .doc-prose h2 {
          font-size: var(--text-2xl);
          margin-top: var(--space-10);
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--border-default);
        }
        .doc-prose h3 {
          font-size: var(--text-xl);
          margin-top: var(--space-8);
          margin-bottom: var(--space-3);
        }
        .doc-prose p {
          margin-bottom: var(--space-4);
        }
        .doc-prose a {
          color: var(--accent);
          text-decoration: underline;
          text-decoration-color: rgba(37, 99, 235, 0.3);
          text-underline-offset: 2px;
          transition: text-decoration-color var(--transition-fast);
        }
        .doc-prose a:hover {
          text-decoration-color: var(--accent);
        }
        .doc-prose code {
          font-family: var(--font-mono);
          font-size: 0.875em;
          padding: 0.125em 0.375em;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          color: #60a5fa;
        }
        .doc-prose pre {
          background: var(--bg-inset);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          overflow-x: auto;
          margin-bottom: var(--space-6);
        }
        .doc-prose pre code {
          background: none;
          padding: 0;
          color: var(--text-secondary);
        }
        .doc-prose ul, .doc-prose ol {
          padding-left: var(--space-6);
          margin-bottom: var(--space-4);
        }
        .doc-prose li {
          margin-bottom: var(--space-2);
        }
        .doc-prose blockquote {
          border-left: 3px solid var(--accent);
          padding-left: var(--space-4);
          margin-left: 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .doc-prose table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: var(--space-6);
        }
        .doc-prose th, .doc-prose td {
          text-align: left;
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }
        .doc-prose th {
          font-weight: 600;
          color: var(--text-primary);
          font-size: var(--text-sm);
        }

        /* ── Dark-mode overrides for shadcn/Tailwind components inside docs ── */
        .doc-prose [data-slot="button"],
        .doc-prose button,
        .doc-prose a[class*="inline-flex"] {
          color: var(--text-secondary) !important;
          border-color: var(--border-default) !important;
          background: var(--bg-elevated) !important;
        }
        .doc-prose [data-slot="button"]:hover,
        .doc-prose button:hover {
          color: var(--text-primary) !important;
          border-color: var(--border-hover) !important;
          background: var(--bg-hover) !important;
        }
        .doc-prose [data-slot="card"] {
          background: var(--bg-surface) !important;
          border-color: var(--border-default) !important;
          color: var(--text-primary) !important;
        }
        .doc-prose .bg-white,
        .doc-prose .bg-gray-50 {
          background: var(--bg-elevated) !important;
        }
        .doc-prose .bg-blue-50 {
          background: rgba(37, 99, 235, 0.08) !important;
        }
        .doc-prose .text-blue-800,
        .doc-prose .text-blue-700 {
          color: #93c5fd !important;
        }
        .doc-prose .text-blue-300,
        .doc-prose .text-blue-200 {
          color: #93c5fd !important;
        }
        .doc-prose .text-gray-900,
        .doc-prose .font-medium {
          color: var(--text-primary);
        }
        .doc-prose .text-gray-600,
        .doc-prose .text-gray-500,
        .doc-prose .text-gray-400,
        .doc-prose .text-gray-300 {
          color: var(--text-secondary) !important;
        }
        .doc-prose .text-gray-700 {
          color: var(--text-secondary) !important;
        }
        .doc-prose .bg-gray-100 {
          background: var(--bg-elevated) !important;
        }
        .doc-prose .bg-gray-800 {
          background: var(--bg-inset) !important;
        }
        .doc-prose .bg-gray-900 {
          background: var(--bg-inset) !important;
        }
        .doc-prose .border-gray-200,
        .doc-prose .border-gray-700,
        .doc-prose .divide-gray-200 > * + *,
        .doc-prose .divide-gray-700 > * + * {
          border-color: var(--border-default) !important;
        }
        .doc-prose .text-white {
          color: var(--text-primary) !important;
        }
        .doc-prose .shadow-sm {
          box-shadow: var(--shadow-sm) !important;
        }
        .doc-prose .text-foreground {
          color: var(--text-primary) !important;
        }
        .doc-prose .text-blue-600 {
          color: #60a5fa !important;
        }
        .doc-prose .text-blue-400 {
          color: #60a5fa !important;
        }
        .doc-prose .border-border {
          border-color: var(--border-default) !important;
        }
        .doc-prose .text-primary {
          color: var(--text-primary) !important;
        }
        .doc-prose .bg-card {
          background: var(--bg-surface) !important;
        }
        .doc-prose .text-card-foreground {
          color: var(--text-primary) !important;
        }
        .doc-prose .bg-popover {
          background: var(--bg-elevated) !important;
        }
        .doc-prose .text-popover-foreground {
          color: var(--text-primary) !important;
        }
        .doc-prose .bg-secondary {
          background: var(--bg-elevated) !important;
        }
        .doc-prose .text-secondary-foreground {
          color: var(--text-primary) !important;
        }

        /* ── Responsive ── */
        @media (max-width: 1280px) {
          .doc-toc {
            display: none;
          }
          .doc-content-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 1024px) {
          .doc-sidebar-desktop {
            display: none !important;
          }
          .doc-mobile-toggle {
            display: block;
          }
          .doc-main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
