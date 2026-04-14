'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import Introduction from './components/Introduction';
import KeyRequirements from './components/KeyRequirements';
import ComplianceChecklist from './components/ComplianceChecklist';
import ImplementationTools from './components/ImplementationTools';
import Resources from './components/Resources';

export default function NDPRComplianceChecklistGuide() {
  return (
    <DocLayout
      title="NDPA 2023 Compliance Checklist"
      description="A comprehensive checklist to help organizations achieve and maintain NDPA 2023 compliance"
    >
      <div className="flex mb-6 space-x-2">
        <a
          href="https://ndpc.gov.ng/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          NDPA 2023
        </a>
        <Link
          href="/docs"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          Toolkit Documentation
        </Link>
      </div>

      <Introduction />
      <KeyRequirements />
      <ComplianceChecklist />
      <ImplementationTools />
      <Resources />
    </DocLayout>
  );
}
