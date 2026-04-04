'use client';

import Link from 'next/link';
import { DocLayout } from './DocLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ComponentsPage() {
  return (
    <DocLayout
      title="Components"
      description="Documentation for NDPR Toolkit components"
    >
      <p className="mb-6">
        The NDPR Toolkit provides a comprehensive set of components to help you implement NDPA 2023-compliant features in your applications.
        Each component is designed to address specific compliance requirements and can be easily integrated into your existing codebase.
      </p>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          {
            title: 'Privacy Policy Management',
            description: 'Components for creating, previewing, and exporting NDPA-compliant privacy policies',
            href: '/docs/components/privacy-policy-generator',
            components: ['PolicyGenerator', 'PolicyPreview', 'PolicyExporter']
          },
          {
            title: 'Consent Management',
            description: 'Components for collecting, storing, and managing user consent in compliance with NDPA requirements',
            href: '/docs/components/consent-management',
            components: ['ConsentBanner', 'ConsentManager', 'ConsentStorage']
          },
          {
            title: 'Data Subject Rights',
            description: 'Complete system for handling data subject access requests and other rights',
            href: '/docs/components/data-subject-rights',
            components: ['DSRRequestForm', 'DSRTracker', 'DSRDashboard']
          },
          {
            title: 'DPIA Questionnaire',
            description: 'Interactive questionnaire for conducting Data Protection Impact Assessments with reporting capabilities',
            href: '/docs/components/dpia-questionnaire',
            components: ['DPIAQuestionnaire', 'DPIAReport', 'StepIndicator']
          },
          {
            title: 'Breach Notification',
            description: 'Comprehensive tools for managing, assessing, and reporting data breaches within required timeframes',
            href: '/docs/components/breach-notification',
            components: ['BreachReportForm', 'BreachRiskAssessment', 'RegulatoryReportGenerator', 'BreachNotificationManager']
          },
          {
            title: 'Lawful Basis Assessment',
            description: 'Tools for identifying and documenting the lawful basis for processing personal data under the NDPA 2023',
            href: '/docs/components/lawful-basis-tracker',
            components: ['LawfulBasisTracker', 'useLawfulBasis']
          },
          {
            title: 'Cross-Border Transfer',
            description: 'Components for managing and documenting cross-border data transfers in compliance with NDPA requirements',
            href: '/docs/components/cross-border-transfers',
            components: ['CrossBorderTransferManager', 'useCrossBorderTransfer']
          },
          {
            title: 'Records of Processing Activities (ROPA)',
            description: 'Maintain comprehensive records of all data processing activities as required by the NDPA 2023',
            href: '/docs/components/ropa',
            components: ['ROPAManager', 'useROPA']
          },
        ].map((component) => (
          <Card key={component.title}>
            <CardHeader>
              <CardTitle>{component.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{component.description}</p>
              
              {component.components && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Components:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400">
                    {component.components.map((comp: string) => (
                      <li key={comp}><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{comp}</code></li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button asChild variant="outline">
                <Link href={component.href}>
                  View Documentation
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DocLayout>
  );
}
