'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import Introduction from './components/Introduction';
import NotificationTimeline from './components/NotificationTimeline';
import ImplementationSteps from './components/ImplementationSteps';
import BestPractices from './components/BestPractices';
import Resources from './components/Resources';


export default function BreachNotificationProcessGuide() {
  return (
    <DocLayout
      title="Breach Notification Process"
      description="How to implement a 72-hour breach notification process with the NDPR Toolkit"
    >
      <div className="flex mb-6 space-x-2">
        <Link
          href="/ndpr-demos/breach"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          View Breach Notification Demo
        </Link>
        <Link
          href="/docs/components/breach-notification"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-primary/10 transition-colors"
        >
          Breach Notification Component Docs
        </Link>
      </div>

      <Introduction />
      <NotificationTimeline />
      <ImplementationSteps />
      <BestPractices />
      <Resources />
    </DocLayout>
  );
}
