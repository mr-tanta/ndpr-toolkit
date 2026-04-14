'use client';

import Link from 'next/link';

export default function ImplementationTools() {
  return (
    <section id="implementation-tools" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Implementation Tools in the NDPR Toolkit</h2>
      <p className="mb-4">
        The NDPR Toolkit provides a comprehensive set of components and utilities to help you implement
        NDPA 2023-compliant features in your web applications. Here&apos;s how the toolkit can help you address
        key compliance requirements:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-foreground">Consent Management</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The Consent Management components help you collect, store, and manage valid consent from users.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm">
            <li>ConsentBanner for collecting consent when users first visit your site</li>
            <li>ConsentManager for allowing users to update their preferences</li>
            <li>ConsentStorage for securely storing consent records</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/components/consent-management" className="text-primary hover:underline text-sm">
              View Consent Management Documentation →
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-foreground">Data Subject Rights Portal</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The Data Subject Rights components help you implement a complete system for handling data subject requests.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm">
            <li>DSRRequestForm for collecting requests from data subjects</li>
            <li>DSRDashboard for managing and responding to requests</li>
            <li>DSRTracker for allowing data subjects to track their requests</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/components/data-subject-rights" className="text-primary hover:underline text-sm">
              View Data Subject Rights Documentation →
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-foreground">DPIA Questionnaire</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The DPIA Questionnaire components help you conduct and document Data Protection Impact Assessments.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm">
            <li>DPIAQuestionnaire for guiding users through the assessment process</li>
            <li>DPIAReport for generating comprehensive DPIA reports</li>
            <li>Risk assessment tools for identifying and evaluating data protection risks</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/components/dpia-questionnaire" className="text-primary hover:underline text-sm">
              View DPIA Questionnaire Documentation →
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-foreground">Breach Notification System</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The Breach Notification components help you implement a 72-hour breach notification process.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm">
            <li>BreachReportForm for internal breach reporting</li>
            <li>BreachRiskAssessment for evaluating breach severity</li>
            <li>RegulatoryReportGenerator for creating NDPC notifications</li>
            <li>BreachNotificationManager for tracking the notification process</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/components/breach-notification" className="text-primary hover:underline text-sm">
              View Breach Notification Documentation →
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-foreground">Privacy Policy Generator</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The Privacy Policy Generator helps you create a comprehensive, NDPA 2023-compliant privacy policy.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm">
            <li>PolicyGenerator for creating customized privacy policies</li>
            <li>PolicyPreview for reviewing and editing policies</li>
            <li>PolicyExporter for exporting policies in various formats</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline text-sm">
              View Privacy Policy Generator Documentation →
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-2 text-foreground">Implementation Guides</h3>
          <p className="text-muted-foreground text-sm mb-3">
            The NDPR Toolkit includes comprehensive guides for implementing key compliance features.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm">
            <li>Guide for conducting DPIAs</li>
            <li>Guide for managing consent</li>
            <li>Guide for handling data subject requests</li>
            <li>Guide for implementing a breach notification process</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/guides" className="text-primary hover:underline text-sm">
              View Implementation Guides →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-primary/10 p-4 rounded-xl border border-border">
        <h4 className="text-primary font-medium mb-2">Integrated Compliance Approach</h4>
        <p className="text-muted-foreground text-sm">
          The NDPR Toolkit is designed to provide an integrated approach to NDPA 2023 compliance. The components work together
          to create a comprehensive compliance system, with shared utilities and data structures that ensure consistency
          across different compliance areas. This integrated approach helps you implement NDPA-compliant features more
          efficiently and maintain compliance over time.
        </p>
      </div>
    </section>
  );
}
