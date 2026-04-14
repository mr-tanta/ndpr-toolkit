'use client';

import Link from 'next/link';

export default function Resources() {
  return (
    <section id="resources" className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
      <p className="mb-4">
        To help you implement an effective breach notification process, here are some additional resources:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">NDPA 2023 Official Text</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Official text of the Nigeria Data Protection Act 2023, including breach notification requirements.
          </p>
          <a
            href="https://ndpc.gov.ng/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            View Act
          </a>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">Breach Notification Component Docs</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Technical documentation for the Breach Notification components.
          </p>
          <Link
            href="/docs/components/breach-notification"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            View Documentation
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">Breach Response Plan Template</h3>
          <p className="text-muted-foreground text-sm mb-3">
            A customizable template for creating your organization&apos;s breach response plan.
          </p>
          <a
            href="https://github.com/mr-tanta/ndpr-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            Download Template
          </a>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">NDPC Contact Information</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Contact details for reporting breaches to the Nigeria Data Protection Commission.
          </p>
          <a
            href="https://ndpc.gov.ng/contact/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
          >
            View Contact Info
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-3">Breach Notification Checklist</h3>
        <p className="mb-3">
          Use this checklist to ensure you&apos;ve covered all the essential elements of the breach notification process:
        </p>

        <div className="bg-card border border-border rounded-xl p-6">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Implement a breach detection and reporting system</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Establish a breach response team with clearly defined roles and responsibilities</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Develop criteria for assessing breach severity and notification requirements</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Create templates for NDPC and data subject notifications</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Implement a system for tracking breach notifications and deadlines</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Establish a process for documenting breaches and response actions</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Develop procedures for post-breach review and improvement</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary mr-2 flex-shrink-0 mt-0.5 text-xs font-bold">✓</span>
              <span className="text-foreground">Conduct regular training and testing of the breach notification process</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
