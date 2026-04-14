'use client';

import React, { useState } from 'react';
import { DemoLayout } from '@/components/site/DemoLayout';

// Use the existing published PolicyGenerator until the adaptive wizard is published
import PolicyGenerator from '@/components/privacy-policy/PolicyGenerator';

export default function PolicyDemoPage() {
  return (
    <DemoLayout
      title="Privacy Policy Generator"
      description="Generate NDPA-compliant privacy policies with a step-by-step wizard. Covers all mandatory disclosures under Sections 27-28 of the Nigeria Data Protection Act 2023."
      ndpaSection="Sections 27-28"
      code={`import { NDPRPrivacyPolicy } from '@tantainnovative/ndpr-toolkit/presets';

// Zero-config — renders the full adaptive wizard
<NDPRPrivacyPolicy />

// Or with custom adapter for backend persistence
import { AdaptivePolicyWizard } from '@tantainnovative/ndpr-toolkit/policy';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<AdaptivePolicyWizard
  adapter={apiAdapter('/api/policy/draft')}
  onComplete={(policy) => console.log('Generated:', policy)}
/>`}
    >
      <div
        style={{
          '--ndpr-primary': '99 102 241',
          '--ndpr-primary-hover': '129 140 248',
          '--ndpr-primary-foreground': '255 255 255',
          '--ndpr-background': '17 24 39',
          '--ndpr-foreground': '241 245 249',
          '--ndpr-muted': '26 34 53',
          '--ndpr-muted-foreground': '148 163 184',
          '--ndpr-border': '30 41 59',
        } as React.CSSProperties}
      >
        <PolicyGenerator onGenerate={(policy) => console.log('Policy generated:', policy)} />
      </div>
    </DemoLayout>
  );
}
