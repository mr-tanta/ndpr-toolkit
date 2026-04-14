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
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="ndpr-header" data-scrolled={scrolled}>
        <div className="ndpr-header-inner">
          {/* Logo */}
          <Link href="/" className="ndpr-logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
              <path d="M10 22V10h3.5l4.5 7.5V10H21v12h-3.5L13 14.5V22H10z" fill="white" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#1d4ed8" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="ndpr-logo-text">NDPA Toolkit</span>
            <span className="ndpr-version-tag">v3</span>
          </Link>

          {/* Center nav */}
          <nav className="ndpr-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`ndpr-nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ndpr-actions">
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="ndpr-github"
              aria-label="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            <Link href="/docs" className="ndpr-cta">
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Mobile toggle */}
            <button
              className="ndpr-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="ndpr-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`ndpr-mobile-link ${isActive(link.href) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <a href="https://github.com/mr-tanta/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="ndpr-mobile-link">
              GitHub
            </a>
          </div>
        )}
      </header>

      <style>{`
        .ndpr-header {
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid transparent;
          background: transparent;
          transition: border-color 0.2s ease, background 0.2s ease, backdrop-filter 0.2s ease;
        }
        .ndpr-header[data-scrolled="true"] {
          border-bottom-color: rgba(22, 37, 68, 0.6);
          background: rgba(3, 7, 18, 0.88);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        .ndpr-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 3.75rem;
        }

        /* Logo */
        .ndpr-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          text-decoration: none;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .ndpr-logo-text {
          font-weight: 600;
          font-size: 0.9375rem;
          letter-spacing: -0.02em;
        }
        .ndpr-version-tag {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          background: rgba(37, 99, 235, 0.15);
          color: #60a5fa;
          line-height: 1.4;
        }

        /* Center nav */
        .ndpr-nav {
          display: flex;
          align-items: center;
          gap: 0.125rem;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .ndpr-nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 0.5rem 0.875rem;
          border-radius: 0.5rem;
          transition: color 0.15s ease, background 0.15s ease;
          position: relative;
        }
        .ndpr-nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }
        .ndpr-nav-link.active {
          color: #fff;
        }
        .ndpr-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -0.125rem;
          left: 50%;
          transform: translateX(-50%);
          width: 1.25rem;
          height: 2px;
          border-radius: 1px;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
        }

        /* Right actions */
        .ndpr-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .ndpr-github {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .ndpr-github:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .ndpr-cta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #fff;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .ndpr-cta:hover {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
          transform: translateY(-1px);
        }

        .ndpr-mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-default);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
        }

        /* Mobile menu */
        .ndpr-mobile-menu {
          display: none;
          border-top: 1px solid var(--border-default);
          padding: 0.75rem 1.5rem 1rem;
          background: var(--bg-surface);
        }
        .ndpr-mobile-link {
          display: block;
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 0.5rem;
        }
        .ndpr-mobile-link.active { color: var(--accent); }
        .ndpr-mobile-link:hover { background: var(--bg-hover); }

        @media (max-width: 768px) {
          .ndpr-nav { display: none; }
          .ndpr-cta { display: none; }
          .ndpr-mobile-toggle { display: flex; }
          .ndpr-mobile-menu { display: block; }
          .ndpr-logo-text { display: none; }
        }
      `}</style>
    </>
  );
}
