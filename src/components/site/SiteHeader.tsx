'use client';

import Link from 'next/link';
import { useState } from 'react';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              N
            </div>
            <span className="hidden sm:inline">NDPA Toolkit</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/docs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Docs
            </Link>
            <Link href="/ndpr-demos" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Demos
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Blog
            </Link>
            <a
              href="https://github.com/mr-tanta/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              npm
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden py-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <Link href="/docs" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              Docs
            </Link>
            <Link href="/ndpr-demos" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              Demos
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              Blog
            </Link>
            <a href="https://github.com/mr-tanta/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              GitHub
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
