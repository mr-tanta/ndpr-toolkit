'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Demos', href: '/ndpr-demos' },
  { label: 'Blog', href: '/blog' },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as unknown as number,
        transition: 'all var(--transition-base)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-default)' : 'transparent'}`,
        background: scrolled
          ? 'rgba(10, 13, 20, 0.85)'
          : 'rgba(10, 13, 20, 0.5)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 var(--space-6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '3.5rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
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
                boxShadow: '0 0 12px var(--accent-glow)',
              }}
            >
              N
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                letterSpacing: '-0.01em',
              }}
            >
              NDPA Toolkit
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            className="site-nav-desktop"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-0.5rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '1rem',
                        height: '2px',
                        borderRadius: '1px',
                        background: 'var(--accent)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            className="site-nav-actions"
          >
            {/* GitHub */}
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '0.375rem 0.625rem',
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
              aria-label="Star on GitHub"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="github-label">Star</span>
            </a>

            {/* Get Started CTA */}
            <Link
              href="/docs"
              className="header-cta"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.375rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 12px var(--accent-glow)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Get Started
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="site-nav-mobile-toggle"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
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
        </div>
      </div>

      {/* Mobile slide-down nav */}
      {mobileOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-default)',
            padding: 'var(--space-4) var(--space-6)',
            background: 'var(--bg-surface)',
            animation: 'fadeInUp 0.2s ease-out',
          }}
          className="site-nav-mobile-menu"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'block',
                    padding: '0.625rem 0.75rem',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>
          </nav>
        </div>
      )}

      {/* Responsive CSS — scoped with a style tag */}
      <style>{`
        @media (max-width: 768px) {
          .site-nav-desktop { display: none !important; }
          .site-nav-mobile-toggle { display: flex !important; }
          .header-cta { display: none !important; }
          .github-label { display: none !important; }
        }
        @media (min-width: 769px) {
          .site-nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}
