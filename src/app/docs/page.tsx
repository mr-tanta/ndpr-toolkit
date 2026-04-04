'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DocsPage() {
  return (
    <DocLayout 
      title="NDPR Toolkit Documentation" 
      description="Comprehensive guides and API reference for implementing NDPA 2023-compliant features"
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <p>
            The NDPR Toolkit is a comprehensive set of components and utilities designed to help Nigerian businesses
            implement NDPA 2023-compliant features in their web applications with minimal development effort.
          </p>
          
          <p>
            The toolkit includes components for consent management, data subject rights handling, privacy policy generation, 
            breach reporting, and data protection impact assessments. All components are built with TypeScript for type safety 
            and designed to be easily integrated into React and Next.js applications.
          </p>
          
          <p>
            <strong>Version 2.0</strong> includes significant enhancements to all components, improved type definitions, 
            and comprehensive documentation to ensure developers can quickly implement NDPA 2023-compliant features.
          </p>

          <h3>Installation</h3>
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>npm install @tantainnovative/ndpr-toolkit</code></pre>
            <pre><code># Or with legacy peer deps if using React 19
npm install @tantainnovative/ndpr-toolkit --legacy-peer-deps</code></pre>
          </div>

          <h3>Basic Setup</h3>
          <p>
            Import and use the components and hooks in your React or Next.js application:
          </p>
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
            <pre><code>{`import { ConsentBanner, ConsentManager, ConsentStorage, useConsent } from '@tantainnovative/ndpr-toolkit';

function MyApp() {
  return (
    <ConsentManager
      options={[
        {
          id: 'necessary',
          label: 'Necessary Cookies',
          description: 'Essential cookies for the website to function.',
          required: true
        },
        {
          id: 'analytics',
          label: 'Analytics Cookies',
          description: 'Cookies that help us understand how you use our website.',
          required: false
        }
      ]}
      storageKey="my-app-consent"
      autoLoad={true}
      autoSave={true}
    >
      <AppContent />
      <ConsentBanner 
        position="bottom"
        privacyPolicyUrl="/privacy-policy"
        showPreferences={true}
        onSave={({ consents }) => console.log('Consent saved:', consents)}
      />
    </ConsentManager>
  );
}

function AppContent() {
  // Use the useConsent hook to manage consent state
  const { consents, hasConsented, updateConsent } = useConsent();
  
  // Check if user has given consent for analytics
  if (hasConsented('analytics')) {
    // Initialize analytics
  }
  
  return (
    <div>
      {/* Your app content */}
    </div>
  );
}`}</code></pre>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Try the Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Explore interactive demos of all components
              </p>
              <Button asChild variant="default">
                <Link href="/#demos">View Demos</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>GitHub Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                View source code, report issues, and contribute
              </p>
              <Button asChild variant="outline">
                <a href="https://github.com/tantainnovative/ndpr-toolkit" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Components & Hooks</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'DPIA Questionnaire',
              description: 'Interactive questionnaire for data protection impact assessments with step indicator',
              href: '/docs/components/dpia-questionnaire',
              category: 'Risk Assessment',
              isNew: true,
            },
            {
              title: 'Consent Management',
              description: 'NDPA 2023-compliant cookie consent banner with storage and preference management',
              href: '/docs/components/consent-management',
              category: 'Consent Management',
              isNew: false,
            },
            {
              title: 'Data Subject Rights Portal',
              description: 'Complete system for handling DSR requests with dashboard and tracking',
              href: '/docs/components/data-subject-rights',
              category: 'Rights Management',
              isNew: false,
            },
            {
              title: 'Breach Notification System',
              description: 'Tools for reporting, assessing, and managing data breaches with regulatory reporting',
              href: '/docs/components/breach-notification',
              category: 'Incident Management',
              isNew: true,
            },
            {
              title: 'Privacy Policy Generator',
              description: 'Customizable NDPA 2023-compliant privacy policy generator with variable support',
              href: '/docs/components/privacy-policy-generator',
              category: 'Documentation',
              isNew: false,
            },
            {
              title: 'React Hooks',
              description: 'Custom hooks for managing state and logic in NDPA 2023-compliant applications',
              href: '/docs/components/hooks',
              category: 'State Management',
              isNew: true,
            },
          ].map((component) => (
            <Card key={component.title} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <Link href={component.href} className="block h-full">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <div className="bg-white dark:bg-gray-800 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {component.category}
                      </div>
                      {component.isNew && (
                        <Badge variant="success" className="text-xs">New</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {component.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      {component.description}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      <span>View Documentation</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Implementation Guides</h2>
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
              description: 'A comprehensive checklist for NDPA 2023 compliance',
              href: '/docs/guides/ndpr-compliance-checklist',
            },
            {
              title: 'Lawful Basis for Processing',
              description: 'Understanding lawful basis under NDPA 2023 Section 25',
              href: '/docs/guides/lawful-basis',
            },
            {
              title: 'Cross-Border Data Transfers',
              description: 'Guide to NDPA 2023 Section 41 cross-border transfer compliance',
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
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Latest Features</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Variable Support in Policy Generator
                <Badge className="ml-2" variant="outline">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create dynamic privacy policies with variable placeholders that can be easily updated when your organization information changes.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/privacy-policy-generator">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Enhanced DSR Types
                <Badge className="ml-2" variant="outline">Updated</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Improved type definitions for Data Subject Requests with standardized enums for request types and statuses.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/data-subject-rights">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                ConsentStorage Component
                <Badge className="ml-2" variant="outline">New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                A flexible component for handling the storage and retrieval of consent settings with support for multiple storage mechanisms.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/consent-management">
                  Learn More
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Component Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Implement NDPA 2023-compliant cookie consent banners and preference centers with flexible storage options.
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm">
                <li>ConsentBanner & ConsentManager components</li>
                <li>Customizable consent options</li>
                <li>Multiple storage mechanisms</li>
                <li>Preference management UI</li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/consent-management">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Handle data subject access requests and other rights with a complete request management system.
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm">
                <li>Request submission forms</li>
                <li>Admin dashboard for request management</li>
                <li>Status tracking and notifications</li>
                <li>Standardized request types</li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/data-subject-rights">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>DPIA Questionnaire</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Conduct Data Protection Impact Assessments with an interactive questionnaire and risk assessment tools.
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm">
                <li>Multi-section questionnaire</li>
                <li>Risk identification and assessment</li>
                <li>Report generation</li>
                <li>Compliance recommendations</li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/dpia-questionnaire">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Breach Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Manage data breach reporting, risk assessment, and notification within the NDPA 2023&apos;s 72-hour requirement.
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm">
                <li>Breach reporting forms</li>
                <li>Risk assessment tools</li>
                <li>Notification requirement determination</li>
                <li>Regulatory report generation</li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/breach-notification">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create NDPA 2023-compliant privacy policies with customizable templates and variable support.
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm">
                <li>Customizable policy sections</li>
                <li>Variable placeholder support</li>
                <li>Preview and export options</li>
                <li>Compliance checking</li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/privacy-policy-generator">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>React Hooks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Utilize custom React hooks for state management across all NDPR toolkit components.
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm">
                <li>useConsent</li>
                <li>useDSR</li>
                <li>useDPIA</li>
                <li>useBreach</li>
                <li>usePrivacyPolicy</li>
              </ul>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/components/hooks">
                  View Documentation
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Implementation Guides</h2>
        <div className="prose prose-blue max-w-none dark:prose-invert mb-6">
          <p>
            Our implementation guides provide step-by-step instructions for integrating NDPR Toolkit components 
            into your applications and addressing specific compliance scenarios.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get up and running with the NDPR Toolkit in minutes.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/guides/quick-start">
                  Read Guide
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Consent Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Implement a complete consent management system.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/guides/implementing-consent">
                  Read Guide
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>DSR Portal Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create a complete data subject rights management portal.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/guides/implementing-dsr">
                  Read Guide
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">NDPA 2023 Compliance</h2>
        <div className="prose prose-blue max-w-none dark:prose-invert">
          <p>
            The Nigeria Data Protection Act (NDPA) 2023 is Nigeria&apos;s principal data protection legislation, signed into law
            in June 2023. The NDPA establishes the Nigeria Data Protection Commission (NDPC) as the regulatory body and
            aims to safeguard the rights of natural persons to data privacy.
          </p>

          <h3>Key Requirements</h3>
          <ul>
            <li>
              <strong>Lawful Processing:</strong> Organizations must process personal data lawfully, fairly, and transparently.
            </li>
            <li>
              <strong>Consent:</strong> Valid consent must be obtained before collecting or processing personal data.
            </li>
            <li>
              <strong>Data Subject Rights:</strong> Organizations must respect and facilitate data subject rights, including access, rectification, and erasure.
            </li>
            <li>
              <strong>Data Protection Impact Assessment:</strong> Organizations must conduct DPIAs for high-risk processing activities.
            </li>
            <li>
              <strong>Breach Notification:</strong> Organizations must report data breaches to the NDPC within 72 hours.
            </li>
            <li>
              <strong>Privacy Policy:</strong> Organizations must maintain a clear and accessible privacy policy.
            </li>
          </ul>

          <h3>How the NDPR Toolkit Helps</h3>
          <p>
            Our toolkit provides ready-to-use components that address each of these key requirements:
          </p>
          <ul>
            <li><strong>Consent Management:</strong> Implement proper consent collection and management</li>
            <li><strong>Data Subject Rights Portal:</strong> Handle DSR requests efficiently and in compliance with regulations</li>
            <li><strong>DPIA Questionnaire:</strong> Conduct and document Data Protection Impact Assessments</li>
            <li><strong>Breach Notification System:</strong> Report and manage breaches within the required timeframes</li>
            <li><strong>Privacy Policy Generator:</strong> Create and maintain NDPA 2023-compliant privacy policies</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-6">
            <h4 className="text-blue-800 dark:text-blue-200">Disclaimer</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              While the NDPR Toolkit is designed to help organizations implement NDPA 2023-compliant features, using this toolkit does not guarantee
              full compliance with the NDPA 2023. Organizations should consult with legal professionals to ensure their specific implementation
              meets all regulatory requirements.
            </p>
          </div>
        </div>
      </section>
    </DocLayout>
  );
}
