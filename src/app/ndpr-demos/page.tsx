'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const demos = [
  {
    title: 'Consent Management',
    section: 'NDPA S.25-26',
    description: 'Consent banners, preference management, and audit-ready storage aligned with NDPA provisions.',
    href: '/ndpr-demos/consent',
    icon: '\u2714',
  },
  {
    title: 'Data Subject Rights',
    section: 'NDPA S.34-40',
    description: 'DSR request forms, dashboards, and real-time tracking for access, rectification, and erasure requests.',
    href: '/ndpr-demos/dsr',
    icon: '\uD83D\uDC64',
  },
  {
    title: 'DPIA Tools',
    section: 'NDPA S.28-30',
    description: 'Data Protection Impact Assessments with risk scoring, templates, and regulatory guidance.',
    href: '/ndpr-demos/dpia',
    icon: '\uD83D\uDCCB',
  },
  {
    title: 'Breach Management',
    section: 'NDPA S.40-41',
    description: 'Breach notification workflows, severity assessment, and NDPC reporting timelines.',
    href: '/ndpr-demos/breach',
    icon: '\uD83D\uDEA8',
  },
  {
    title: 'Privacy Policy',
    section: 'NDPA S.24',
    description: 'Generate, preview, and manage privacy policies with full NDPA-compliant clause coverage.',
    href: '/ndpr-demos/policy',
    icon: '\uD83D\uDCC4',
  },
  {
    title: 'Lawful Basis Tracker',
    section: 'NDPA S.25',
    description: 'Document and track the lawful basis for every processing activity with full audit trails.',
    href: '/ndpr-demos/lawful-basis',
    icon: '\u2696\uFE0F',
  },
  {
    title: 'Cross-Border Transfers',
    section: 'NDPA S.41-45',
    description: 'Assess international data transfers with adequacy checks and safeguard recommendations.',
    href: '/ndpr-demos/cross-border',
    icon: '\uD83C\uDF10',
  },
  {
    title: 'ROPA',
    section: 'NDPA S.29',
    description: 'Maintain a Record of Processing Activities with categorization, filtering, and export.',
    href: '/ndpr-demos/ropa',
    icon: '\uD83D\uDCD2',
  },
];

const stats = [
  { label: 'Modules', value: '8' },
  { label: 'NDPA 2023 Aligned', value: null },
  { label: 'TypeScript Native', value: null },
  { label: '190+ Tests', value: null },
];

export default function NDPRDemosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20" />
        <div className="relative container mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0 px-3 py-1 text-sm">
              NDPA Toolkit
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Interactive Demos
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-2">
              Explore NDPA 2023 compliance modules in action
            </p>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Each module below is a fully functional demonstration of the{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">ndpr-toolkit</span>{' '}
              components. Click any card to explore consent flows, data subject rights,
              breach management, and more &mdash; all built for the Nigeria Data Protection Act.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="container mx-auto px-4 -mt-2 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-0 sm:divide-x sm:divide-slate-200 dark:sm:divide-slate-700 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 py-4 px-6 shadow-sm">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 sm:px-6 first:sm:pl-0 last:sm:pr-0"
            >
              {stat.value ? (
                <>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {stat.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Demo Cards Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {demos.map((demo) => (
            <Link
              key={demo.href}
              href={demo.href}
              className="group no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            >
              <Card
                className="
                  h-full border-l-4 border-blue-600 dark:border-blue-500
                  bg-white dark:bg-slate-800/50
                  transition-all duration-200
                  group-hover:scale-[1.02] group-hover:shadow-lg
                  cursor-pointer
                "
              >
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {demo.icon}
                    </div>
                    <span
                      className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {demo.section}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                    {demo.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col justify-between flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {demo.description}
                  </p>
                  <span
                    className="
                      inline-flex items-center gap-1 text-sm font-medium
                      text-blue-600 dark:text-blue-400
                      group-hover:gap-2 transition-all duration-200
                    "
                  >
                    Explore
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Get Started
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Add NDPA compliance to your project in seconds.
            </p>
          </div>

          {/* Install Command */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 mb-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-auto text-xs text-slate-500 font-mono">terminal</span>
            </div>
            <div className="font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400 select-none">$</span>
                <code className="text-slate-100">npm install @tantainnovative/ndpr-toolkit</code>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 no-underline"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Documentation
            </Link>
            <a
              href="https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors duration-200 no-underline"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 0v24h24V0H0zm6.672 19.334H3.334V8h3.338v11.334zm6.66 0H10V8h3.332v11.334zm6.67 0H16.67V8h3.332v8.002h-3.338v3.332z" />
              </svg>
              View on npm
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
