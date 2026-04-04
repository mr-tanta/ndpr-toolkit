'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function Resources() {
  return (
    <section id="resources" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
      <p className="mb-4">
        To help you implement an effective breach notification process, here are some additional resources:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPA 2023 Official Text</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              Official text of the Nigeria Data Protection Act 2023, including breach notification requirements.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://ndpc.gov.ng/" target="_blank" rel="noopener noreferrer">
                View Act
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Breach Notification Component Docs</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              Technical documentation for the Breach Notification components.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/docs/components/breach-notification">
                View Documentation
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Breach Response Plan Template</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              A customizable template for creating your organization&apos;s breach response plan.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://github.com/tantainnovative/ndpr-toolkit" target="_blank" rel="noopener noreferrer">
                Download Template
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">NDPC Contact Information</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              Contact details for reporting breaches to the Nigeria Data Protection Commission.
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="https://ndpc.gov.ng/contact/" target="_blank" rel="noopener noreferrer">
                View Contact Info
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-3">Breach Notification Checklist</h3>
        <p className="mb-3">
          Use this checklist to ensure you&apos;ve covered all the essential elements of the breach notification process:
        </p>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Implement a breach detection and reporting system</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Establish a breach response team with clearly defined roles and responsibilities</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Develop criteria for assessing breach severity and notification requirements</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Create templates for NDPC and data subject notifications</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Implement a system for tracking breach notifications and deadlines</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Establish a process for documenting breaches and response actions</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Develop procedures for post-breach review and improvement</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 flex-shrink-0 mt-0.5">✓</span>
              <span>Conduct regular training and testing of the breach notification process</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
