'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

const NEW_MODULES = ['Lawful Basis Tracker', 'Cross-Border Transfers', 'ROPA'];

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/docs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Components',
    href: '/docs/components',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
    ],
  },
];

function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = useMemo(() => {
    const parts: { label: string; href: string }[] = [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
    ];

    if (pathname === '/docs') {
      return parts;
    }

    // Find matching nav item for richer labels
    for (const item of navigation) {
      if (item.children) {
        // Check if current page is a child
        const matchedChild = item.children.find(
          (child) => child.href === pathname
        );
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

    // Fallback: build from path segments
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
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 overflow-x-auto">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className={`flex items-center flex-shrink-0 ${
            index > 0 && index < crumbs.length - 1 ? 'hidden sm:flex' : 'flex'
          }`}>
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
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

function NavItemLink({
  item,
  isActive,
  isChildActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isChildActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'border-l-3 border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200'
          : isChildActive
            ? 'text-blue-700 dark:text-blue-200'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      {item.icon && (
        <span
          className={`mr-3 ${
            isActive || isChildActive
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {item.icon}
        </span>
      )}
      <span className="flex-1">{item.title}</span>
      {item.isNew && (
        <Badge variant="success" className="ml-2 text-[10px] px-1.5 py-0">
          New
        </Badge>
      )}
    </Link>
  );
}

export function DocLayout({ children, title, description }: DocLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to check if a nav item is the exact active page
  const isExactActive = (href: string) => {
    return pathname === href;
  };

  // Function to check if a nav item or any of its children is active
  const isActive = (href: string) => {
    if (href === '/docs' && pathname === '/docs') {
      return true;
    }
    return pathname !== '/docs' && pathname.startsWith(href);
  };

  const renderNavSection = (item: NavItem, onLinkClick?: () => void) => {
    const sectionActive = isActive(item.href);
    const exactActive = isExactActive(item.href);

    return (
      <div key={item.title} className="py-1">
        <NavItemLink
          item={item}
          isActive={exactActive}
          isChildActive={sectionActive && !exactActive}
          onClick={onLinkClick}
        />
        {/* Always show children -- all nav sections expanded by default */}
        {item.children && (
          <div className="mt-1 ml-8 space-y-1">
            {item.children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.title}
                  href={child.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    childActive
                      ? 'border-l-3 border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  onClick={onLinkClick}
                >
                  <span className="flex-1">{child.title}</span>
                  {child.isNew && (
                    <Badge variant="success" className="ml-2 text-[10px] px-1.5 py-0">
                      New
                    </Badge>
                  )}
                  {childActive && (
                    <svg
                      className="h-4 w-4 text-blue-500 dark:text-blue-400 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          type="button"
          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span className="sr-only">{mobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}</span>
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0" aria-label="Documentation navigation">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-white">NDPA Toolkit</span>
            </Link>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-4 space-y-1" aria-label="Sidebar">
              {navigation.map((item) => renderNavSection(item))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/blog" className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="https://github.com/mr-tanta/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`lg:hidden fixed inset-0 z-40 ${mobileMenuOpen ? 'block' : 'hidden'}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          role="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
              e.preventDefault();
              setMobileMenuOpen(false);
            }
          }}
        ></div>
        <aside className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-lg overflow-y-auto" aria-label="Mobile navigation">
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">NDPA Toolkit</span>
            </Link>
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-4 space-y-1" aria-label="Mobile sidebar">
              {navigation.map((item) =>
                renderNavSection(item, () => setMobileMenuOpen(false))
              )}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/blog" className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="https://github.com/mr-tanta/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            </Button>
          </div>
        </aside>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 pt-10 lg:pt-0 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <Breadcrumbs pathname={pathname} />

            <div className="pb-5 border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                  {description && <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{description}</p>}
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/ndpr-demos">View Demos</Link>
                  </Button>
                  <Button asChild variant="default" size="sm">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="prose prose-blue max-w-none dark:prose-invert">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
