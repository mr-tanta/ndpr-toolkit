'use client';

import React from 'react';
import { DemoLayout } from '@/components/site/DemoLayout';
import { AdaptivePolicyWizard } from '@tantainnovative/ndpr-toolkit/policy';

export default function PolicyDemoPage() {
  return (
    <DemoLayout
      title="Privacy Policy Generator"
      description="Generate NDPA-compliant privacy policies with a step-by-step wizard. Covers all mandatory disclosures under Sections 27-28 of the Nigeria Data Protection Act 2023."
      ndpaSection="Sections 27-28"
      code={`import { NDPRPrivacyPolicy } from '@tantainnovative/ndpr-toolkit/presets';

// Zero-config — renders the full adaptive wizard
<NDPRPrivacyPolicy />

// Or with custom adapter for backend persistence
import { AdaptivePolicyWizard } from '@tantainnovative/ndpr-toolkit/policy';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<AdaptivePolicyWizard
  adapter={apiAdapter('/api/policy/draft')}
  onComplete={(policy) => console.log('Generated:', policy)}
/>`}
    >
      <div className="policy-demo-wrapper">
        <AdaptivePolicyWizard onComplete={(policy) => console.log('Generated:', policy)} />
      </div>

      <style>{`
        /* ── NDPR component CSS variables — blue palette ── */
        .policy-demo-wrapper {
          --ndpr-primary: 37 99 235;
          --ndpr-primary-hover: 59 130 246;
          --ndpr-primary-foreground: 255 255 255;
          --ndpr-background: 10 17 32;
          --ndpr-foreground: 241 245 249;
          --ndpr-muted: 19 26 43;
          --ndpr-muted-foreground: 148 163 184;
          --ndpr-border: 255 255 255;
        }

        /* ── Step indicator — indigo → blue ── */
        .policy-demo-wrapper .bg-indigo-600 {
          background-color: #2563eb !important;
        }
        .policy-demo-wrapper .ring-indigo-100 {
          --tw-ring-color: rgba(37, 99, 235, 0.2) !important;
        }
        .policy-demo-wrapper .ring-indigo-900\\/30 {
          --tw-ring-color: rgba(37, 99, 235, 0.15) !important;
        }

        /* ── Cards ── */
        .policy-demo-wrapper [data-slot="card"] {
          background: var(--bg-elevated) !important;
          border-color: var(--border-default) !important;
        }
        .policy-demo-wrapper [data-slot="card-header"] {
          background: var(--bg-elevated) !important;
        }
        .policy-demo-wrapper .from-slate-100,
        .policy-demo-wrapper .to-gray-100,
        .policy-demo-wrapper .from-slate-800,
        .policy-demo-wrapper .to-gray-800 {
          --tw-gradient-from: var(--bg-elevated) !important;
          --tw-gradient-to: var(--bg-elevated) !important;
        }
        .policy-demo-wrapper .bg-gradient-to-r {
          background: var(--bg-elevated) !important;
        }

        /* ── Backgrounds ── */
        .policy-demo-wrapper .bg-white { background: var(--bg-elevated) !important; }
        .policy-demo-wrapper .bg-gray-50,
        .policy-demo-wrapper .bg-gray-100 { background: var(--bg-elevated) !important; }
        .policy-demo-wrapper .bg-gray-200 { background: var(--bg-hover) !important; }
        .policy-demo-wrapper .bg-gray-700 { background: var(--bg-hover) !important; }
        .policy-demo-wrapper .bg-gray-800 { background: var(--bg-inset) !important; }
        .policy-demo-wrapper .bg-gray-900 { background: var(--bg-inset) !important; }

        /* ── Text ── */
        .policy-demo-wrapper .text-gray-900,
        .policy-demo-wrapper .text-gray-800 { color: var(--text-primary) !important; }
        .policy-demo-wrapper .text-gray-700,
        .policy-demo-wrapper .text-gray-600 { color: var(--text-secondary) !important; }
        .policy-demo-wrapper .text-gray-500,
        .policy-demo-wrapper .text-gray-400 { color: var(--text-muted) !important; }
        .policy-demo-wrapper .text-gray-300 { color: var(--text-muted) !important; }

        /* ── Borders ── */
        .policy-demo-wrapper .border-gray-200,
        .policy-demo-wrapper .border-gray-300,
        .policy-demo-wrapper .border-gray-700 { border-color: var(--border-default) !important; }
        .policy-demo-wrapper .divide-gray-200 > * + * { border-color: var(--border-default) !important; }

        /* ── Inputs ── */
        .policy-demo-wrapper input[type="text"],
        .policy-demo-wrapper input[type="email"],
        .policy-demo-wrapper input[type="url"],
        .policy-demo-wrapper input[type="date"],
        .policy-demo-wrapper input[type="number"],
        .policy-demo-wrapper textarea,
        .policy-demo-wrapper select {
          background: var(--bg-inset) !important;
          border-color: var(--border-default) !important;
          color: var(--text-primary) !important;
        }
        .policy-demo-wrapper input::placeholder,
        .policy-demo-wrapper textarea::placeholder {
          color: var(--text-muted) !important;
        }
        .policy-demo-wrapper input:focus,
        .policy-demo-wrapper textarea:focus,
        .policy-demo-wrapper select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
          outline: none !important;
        }

        /* ── Buttons ── */
        .policy-demo-wrapper button {
          transition: all 0.2s ease;
        }
        .policy-demo-wrapper .bg-indigo-600 {
          background-color: #2563eb !important;
        }
        .policy-demo-wrapper .bg-indigo-600:hover,
        .policy-demo-wrapper .hover\\:bg-indigo-700:hover {
          background-color: #1d4ed8 !important;
        }
        .policy-demo-wrapper .bg-indigo-50 {
          background-color: rgba(37, 99, 235, 0.08) !important;
        }
        .policy-demo-wrapper .text-indigo-600,
        .policy-demo-wrapper .text-indigo-700 {
          color: #60a5fa !important;
        }
        .policy-demo-wrapper .border-indigo-200 {
          border-color: rgba(37, 99, 235, 0.2) !important;
        }

        /* ── Checkboxes ── */
        .policy-demo-wrapper input[type="checkbox"] {
          accent-color: #2563eb;
        }
        .policy-demo-wrapper [data-slot="checkbox"] {
          border-color: var(--border-hover) !important;
        }
        .policy-demo-wrapper [data-slot="checkbox"][data-state="checked"] {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }

        /* ── Labels ── */
        .policy-demo-wrapper label {
          color: var(--text-secondary);
        }
        .policy-demo-wrapper .font-medium {
          color: var(--text-primary);
        }

        /* ── Badges / pills ── */
        .policy-demo-wrapper .bg-blue-50 { background: rgba(37, 99, 235, 0.08) !important; }
        .policy-demo-wrapper .text-blue-700,
        .policy-demo-wrapper .text-blue-600 { color: #60a5fa !important; }
        .policy-demo-wrapper .bg-green-50,
        .policy-demo-wrapper .bg-emerald-50 { background: rgba(16, 185, 129, 0.08) !important; }
        .policy-demo-wrapper .text-green-700,
        .policy-demo-wrapper .text-emerald-700 { color: #34d399 !important; }
        .policy-demo-wrapper .bg-red-50 { background: rgba(244, 63, 94, 0.08) !important; }
        .policy-demo-wrapper .text-red-700,
        .policy-demo-wrapper .text-red-600 { color: #fca5a5 !important; }
        .policy-demo-wrapper .bg-yellow-50,
        .policy-demo-wrapper .bg-amber-50 { background: rgba(245, 158, 11, 0.08) !important; }
        .policy-demo-wrapper .text-yellow-700,
        .policy-demo-wrapper .text-amber-700 { color: #fcd34d !important; }

        /* ── Shadows ── */
        .policy-demo-wrapper .shadow-md { box-shadow: var(--shadow-md) !important; }
        .policy-demo-wrapper .shadow-sm { box-shadow: var(--shadow-sm) !important; }
        .policy-demo-wrapper .shadow-lg { box-shadow: var(--shadow-lg) !important; }

        /* ── Policy preview ── */
        .policy-demo-wrapper .prose,
        .policy-demo-wrapper [class*="prose"] {
          color: var(--text-secondary) !important;
        }
        .policy-demo-wrapper .prose h1,
        .policy-demo-wrapper .prose h2,
        .policy-demo-wrapper .prose h3 {
          color: var(--text-primary) !important;
        }

        /* ── Misc theme overrides ── */
        .policy-demo-wrapper .text-foreground { color: var(--text-primary) !important; }
        .policy-demo-wrapper .text-muted-foreground { color: var(--text-muted) !important; }
        .policy-demo-wrapper .bg-background { background: var(--bg-surface) !important; }
        .policy-demo-wrapper .bg-muted { background: var(--bg-elevated) !important; }
        .policy-demo-wrapper .border-border { border-color: var(--border-default) !important; }
        .policy-demo-wrapper .bg-primary { background: #2563eb !important; }
        .policy-demo-wrapper .text-primary-foreground { color: #fff !important; }
        .policy-demo-wrapper .bg-secondary { background: var(--bg-elevated) !important; }
        .policy-demo-wrapper .text-secondary-foreground { color: var(--text-primary) !important; }
        .policy-demo-wrapper .ring-ring { --tw-ring-color: rgba(37, 99, 235, 0.3) !important; }

        /* ── Scrollbar ── */
        .policy-demo-wrapper ::-webkit-scrollbar { width: 6px; height: 6px; }
        .policy-demo-wrapper ::-webkit-scrollbar-track { background: transparent; }
        .policy-demo-wrapper ::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 3px; }
      `}</style>
    </DemoLayout>
  );
}
