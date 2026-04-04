'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
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
        <Button asChild variant="outline" size="sm">
          <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
            NDPA 2023
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/docs">
            Toolkit Documentation
          </Link>
        </Button>
      </div>
      
      <Introduction />
      <KeyRequirements />
      <ComplianceChecklist />
      <ImplementationTools />
      <Resources />
    </DocLayout>
  );
}
