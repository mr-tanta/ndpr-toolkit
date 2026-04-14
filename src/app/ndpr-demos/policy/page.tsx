'use client';

import React from 'react';
import { DemoLayout } from '@/components/site/DemoLayout';
import { AdaptivePolicyWizard } from '../../../packages/ndpr-toolkit/src/components/policy/AdaptivePolicyWizard';
import type { PrivacyPolicy } from '../../../packages/ndpr-toolkit/src/types/privacy';

export default function PolicyDemoPage() {
  const handleComplete = (policy: PrivacyPolicy) => {
    console.log('Policy generated:', policy);
  };

  return (
    <DemoLayout
      title="Privacy Policy Generator"
      description="Generate NDPA-compliant privacy policies with an adaptive step-by-step wizard. Covers all mandatory disclosures under Sections 27–28 of the Nigeria Data Protection Act 2023."
      ndpaSection="Sections 27-28"
      code={`import { AdaptivePolicyWizard } from '@tantainnovative/ndpr-toolkit/policy';

export default function PrivacyPolicyPage() {
  return (
    <AdaptivePolicyWizard
      onComplete={(policy) => {
        // Save or display the generated policy
        console.log(policy);
      }}
    />
  );
}`}
    >
      <div
        style={{
          '--ndpr-bg': 'var(--bg-secondary)',
          '--ndpr-surface': 'var(--bg-primary)',
          '--ndpr-border': 'var(--border-primary)',
          '--ndpr-text': 'var(--text-primary)',
          '--ndpr-text-muted': 'var(--text-secondary)',
          '--ndpr-accent': 'var(--accent-primary)',
          '--ndpr-accent-hover': 'var(--accent-hover)',
          '--ndpr-radius': '0.5rem',
          '--ndpr-shadow': 'var(--shadow-sm)',
        } as React.CSSProperties}
      >
        <AdaptivePolicyWizard
          onComplete={handleComplete}
        />
      </div>
    </DemoLayout>
  );
}
