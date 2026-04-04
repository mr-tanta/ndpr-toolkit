'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';
import { Button } from '@/components/ui/Button';
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
        <Button asChild variant="outline" size="sm">
          <Link href="/ndpr-demos/breach">
            View Breach Notification Demo
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/docs/components/breach-notification">
            Breach Notification Component Docs
          </Link>
        </Button>
      </div>
      
      <Introduction />
      <NotificationTimeline />
      <ImplementationSteps />
      <BestPractices />
      <Resources />
    </DocLayout>
  );
}
