'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

export default function ImplementationTools() {
  return (
    <section id="implementation-tools" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Implementation Tools in the NDPR Toolkit</h2>
      <p className="mb-4">
        The NDPR Toolkit provides a comprehensive set of components and utilities to help you implement 
        NDPR-compliant features in your web applications. Here's how the toolkit can help you address 
        key compliance requirements:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Consent Management</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The Consent Management components help you collect, store, and manage valid consent from users.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm">
              <li>ConsentBanner for collecting consent when users first visit your site</li>
              <li>ConsentManager for allowing users to update their preferences</li>
              <li>ConsentStorage for securely storing consent records</li>
            </ul>
            <div className="mt-4">
              <Link href="/docs/components/consent-management" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Consent Management Documentation →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Data Subject Rights Portal</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The Data Subject Rights components help you implement a complete system for handling data subject requests.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm">
              <li>DSRRequestForm for collecting requests from data subjects</li>
              <li>DSRDashboard for managing and responding to requests</li>
              <li>DSRTracker for allowing data subjects to track their requests</li>
            </ul>
            <div className="mt-4">
              <Link href="/docs/components/data-subject-rights" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Data Subject Rights Documentation →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">DPIA Questionnaire</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The DPIA Questionnaire components help you conduct and document Data Protection Impact Assessments.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm">
              <li>DPIAQuestionnaire for guiding users through the assessment process</li>
              <li>DPIAReport for generating comprehensive DPIA reports</li>
              <li>Risk assessment tools for identifying and evaluating data protection risks</li>
            </ul>
            <div className="mt-4">
              <Link href="/docs/components/dpia-questionnaire" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View DPIA Questionnaire Documentation →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Breach Notification System</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The Breach Notification components help you implement a 72-hour breach notification process.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm">
              <li>BreachReportForm for internal breach reporting</li>
              <li>BreachRiskAssessment for evaluating breach severity</li>
              <li>RegulatoryReportGenerator for creating NITDA notifications</li>
              <li>BreachNotificationManager for tracking the notification process</li>
            </ul>
            <div className="mt-4">
              <Link href="/docs/components/breach-notification" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Breach Notification Documentation →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Privacy Policy Generator</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The Privacy Policy Generator helps you create a comprehensive, NDPR-compliant privacy policy.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm">
              <li>PolicyGenerator for creating customized privacy policies</li>
              <li>PolicyPreview for reviewing and editing policies</li>
              <li>PolicyExporter for exporting policies in various formats</li>
            </ul>
            <div className="mt-4">
              <Link href="/docs/components/privacy-policy-generator" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Privacy Policy Generator Documentation →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Implementation Guides</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              The NDPR Toolkit includes comprehensive guides for implementing key compliance features.
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 text-sm">
              <li>Guide for conducting DPIAs</li>
              <li>Guide for managing consent</li>
              <li>Guide for handling data subject requests</li>
              <li>Guide for implementing a breach notification process</li>
            </ul>
            <div className="mt-4">
              <Link href="/docs/guides" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View Implementation Guides →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
        <h4 className="text-green-800 dark:text-green-200 font-medium mb-2">Integrated Compliance Approach</h4>
        <p className="text-green-700 dark:text-green-300 text-sm">
          The NDPR Toolkit is designed to provide an integrated approach to NDPR compliance. The components work together 
          to create a comprehensive compliance system, with shared utilities and data structures that ensure consistency 
          across different compliance areas. This integrated approach helps you implement NDPR-compliant features more 
          efficiently and maintain compliance over time.
        </p>
      </div>
    </section>
  );
}
