'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function GuidesPage() {
  return (
    <DocLayout
      title="Implementation Guides"
      description="Step-by-step guides for implementing NDPA 2023-compliant features"
    >
      <p className="mb-6">
        These comprehensive guides will help you implement NDPA 2023-compliant features in your applications.
        Each guide provides step-by-step instructions, code examples, and best practices.
      </p>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          {
            title: 'Conducting a DPIA',
            description: 'Step-by-step guide to conducting a Data Protection Impact Assessment',
            href: '/docs/guides/conducting-dpia',
          },
          {
            title: 'Managing Consent',
            description: 'Learn how to implement a complete consent management system',
            href: '/docs/guides/managing-consent',
          },
          {
            title: 'Handling Data Subject Requests',
            description: 'Best practices for handling data subject rights requests',
            href: '/docs/guides/data-subject-requests',
          },
          {
            title: 'Breach Notification Process',
            description: 'How to implement a 72-hour breach notification process',
            href: '/docs/guides/breach-notification-process',
          },
          {
            title: 'NDPA 2023 Compliance Checklist',
            description: 'A comprehensive checklist to help organizations achieve and maintain NDPA 2023 compliance',
            href: '/docs/guides/ndpr-compliance-checklist',
          },
          {
            title: 'Lawful Basis for Processing',
            description: 'Understanding and documenting lawful basis for processing under NDPA 2023 Section 25',
            href: '/docs/guides/lawful-basis',
          },
          {
            title: 'Cross-Border Data Transfers',
            description: 'Guide to managing cross-border data transfers in compliance with NDPA 2023 Section 41',
            href: '/docs/guides/cross-border-transfers',
          },
        ].map((guide) => (
          <Card key={guide.title}>
            <CardHeader>
              <CardTitle>{guide.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{guide.description}</p>
              <Button asChild variant="outline">
                <Link href={guide.href}>
                  Read Guide
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
