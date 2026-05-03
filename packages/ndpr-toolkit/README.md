# NDPR Toolkit

<div align="center">

<img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.4.0/public/icon-blue.png" alt="NDPR Toolkit" width="160" height="160" />

A comprehensive enterprise solution for implementing NDPA-compliant features in web applications, aligned with the Nigeria Data Protection Act (NDPA) 2023 and its subsidiary regulations.

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![license](https://img.shields.io/npm/l/@tantainnovative/ndpr-toolkit.svg)](https://github.com/mr-tanta/ndpr-toolkit/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-blue)](https://reactjs.org/)

</div>

## What's new in 3.4.0

3.4.0 is the [integration-feedback response release](https://github.com/mr-tanta/ndpr-toolkit/releases/tag/v3.4.0). Three things are worth knowing if you're upgrading:

1. **Components ship styled defaults via a real stylesheet — Tailwind is no longer required.** Add one import in your app entry and every component renders correctly:
   ```ts
   // app/layout.tsx (Next.js) or src/main.tsx (Vite/CRA)
   import "@tantainnovative/ndpr-toolkit/styles";
   ```
   Defaults are driven by `--ndpr-*` CSS custom properties (override at any level), with light/dark mode via `prefers-color-scheme` and an explicit `data-theme="dark"` opt-in. If you want to bring your own design system, import from `@tantainnovative/ndpr-toolkit/unstyled` instead.

2. **New `/server` subpath** — RSC-safe pure-logic surface (validators, generators, scoring, locales, adapters) with **zero React in the import graph**. Safe to call from a Next.js Server Component, Edge Function, NestJS controller, or Cloudflare Worker:
   ```ts
   import { validateConsent, generatePolicyText } from '@tantainnovative/ndpr-toolkit/server';
   ```

3. **`<ConsentBanner />` has a new `variant` prop** — `'bar'` (default), `'card'` (floating bounded card), or `'modal'` (centered with backdrop). Pair with `position` for placement.

Backward-compatible at the component API level — existing `classNames` slot maps, ARIA contracts, and prop shapes are unchanged. See the [GitHub release notes](https://github.com/mr-tanta/ndpr-toolkit/releases/tag/v3.4.0) for the full upgrade guide.

## Overview

The NDPR Toolkit is an enterprise-grade solution that provides a comprehensive set of React components, hooks, and utilities to help organizations implement NDPA-compliant features in their web applications with minimal development effort. Designed by compliance experts and developers, this toolkit offers a complete solution for privacy policy management, consent handling, data subject rights, breach notification, data protection impact assessments, lawful basis tracking, cross-border data transfers, and records of processing activities.

> **NDPR Toolkit is actively maintained and regularly updated to ensure compliance with the latest Nigerian data protection regulations.**

## Key Features

### Privacy Policy Management

- **PolicyGenerator**: Create customizable, NDPA-compliant privacy policies with an intuitive form interface
- **PolicyPreview**: Display generated policies with professional formatting and section navigation
- **PolicyExporter**: Export policies in multiple formats (PDF, HTML, Markdown) with compliance notices

### Consent Management

- **ConsentBanner**: Implement cookie consent banners with customizable appearance and behavior
- **ConsentManager**: Track and manage user consent preferences across your application
- **ConsentStorage**: Securely store and retrieve consent records with built-in persistence

### Data Subject Rights (DSR)

- **DSRRequestForm**: Collect and validate data subject requests with comprehensive form validation
- **DSRTracker**: Monitor the status and progress of data subject requests
- **DSRDashboard**: Visualize and manage all data subject requests in one place

### Data Protection Impact Assessment (DPIA)

- **DPIAQuestionnaire**: Guide users through the DPIA process with step-by-step questionnaires
- **DPIAReport**: Generate comprehensive DPIA reports based on questionnaire responses
- **StepIndicator**: Track progress through multi-step DPIA processes

### Breach Notification

- **BreachReportForm**: Collect essential information about data breaches
- **BreachRiskAssessment**: Evaluate the risk level of reported breaches
- **RegulatoryReportGenerator**: Create NDPA-compliant breach notification reports for NDPC submission
- **BreachNotificationManager**: Manage the entire breach notification workflow

### Lawful Basis Tracking

- **LawfulBasisTracker**: Document and manage lawful basis for each processing activity under NDPA Section 25
- **useLawfulBasis**: Hook for managing lawful basis state across your application
- Utility functions for validation, compliance gap assessment, and summary generation

### Cross-Border Data Transfers

- **CrossBorderTransferManager**: Assess and document international data transfers under NDPA Part VI (Sections 41-45)
- **useCrossBorderTransfer**: Hook for managing transfer assessments and compliance state
- Utility functions for transfer validation, risk assessment, and NDPC approval checks

### Record of Processing Activities (ROPA)

- **ROPAManager**: Maintain comprehensive processing records as required by NDPA's accountability principle
- **useROPA**: Hook for managing processing records and generating summaries
- Utility functions for record validation, CSV export, and compliance gap identification

### Enterprise Features

- **Advanced Conditional Logic**: Support for complex conditional blocks in policy templates
- **Professional Formatting**: Enterprise-ready formatting for all exported documents
- **Comprehensive Type System**: Full TypeScript support with detailed interfaces and type definitions
- **Modular Architecture**: Use only what you need — from lightweight core utilities to full UI components
- **Accessibility**: WCAG 2.1 AA compliant components for inclusive user experiences

## Installation

```bash
# Using pnpm (recommended)
pnpm add @tantainnovative/ndpr-toolkit

# Using bun
bun add @tantainnovative/ndpr-toolkit

# Using npm
npm install @tantainnovative/ndpr-toolkit
```

Then add the stylesheet import once in your app entry so components render with their default styling:

```ts
// app/layout.tsx (Next.js App Router) or src/main.tsx (Vite/CRA)
import "@tantainnovative/ndpr-toolkit/styles";
```

Skip this step only if you're using the `/unstyled` entry — see [Import Styles](#import-styles) below.

## Import Styles

The toolkit supports four import styles so you can pull in only what your application needs:

### 1. Server / Edge — Strictly Pure Logic, Zero React

The recommended entry for backend and serverless environments. Safe to import from a Next.js Server Component, Edge Function, NestJS controller, Cloudflare Worker, or any non-browser runtime — **no React lands in your server bundle.**

```ts
import {
  validateConsent,
  formatDSRRequest,
  assessDPIARisk,
  calculateBreachSeverity,
  generatePolicyText,
  findUnfilledTokens,
  exportHTML,
  exportPDF,
  getComplianceScore,
} from '@tantainnovative/ndpr-toolkit/server';

import type { DSRRequest, BreachReport, PrivacyPolicy } from '@tantainnovative/ndpr-toolkit/server';
```

Build-output guards in CI assert this entry never carries a `"use client"` directive and never imports `react`/`react-dom` — the RSC-safety contract is structurally enforced.

### 2. Lightweight (Core) — Types, Utilities, and the Provider

A broader entry that adds the `NDPRProvider` React Context on top of the pure-logic surface. Use when you want types and validators alongside the provider in the same import.

```ts
import {
  NDPRProvider,
  validateConsent,
  assessDPIARisk,
  calculateBreachSeverity,
  validateTransfer,
  assessTransferRisk,
  validateProcessingRecord,
  generateROPASummary,
} from '@tantainnovative/ndpr-toolkit/core';

import type { ConsentOption, BreachReport, CrossBorderTransfer } from '@tantainnovative/ndpr-toolkit/core';
```

### 3. Hooks Only — React State Management Without UI

Requires React as a peer dependency but ships zero UI components. Ideal when you need compliance logic with your own custom UI.

```ts
import {
  useConsent,
  useDSR,
  useDPIA,
  useBreach,
  usePrivacyPolicy,
  useLawfulBasis,
  useCrossBorderTransfer,
  useROPA,
} from '@tantainnovative/ndpr-toolkit/hooks';
```

### 4. Full UI — Components, Hooks, and Utilities

The default import path. Ships everything: React components, hooks, utilities, and types.

```tsx
import {
  ConsentBanner,
  ConsentManager,
  useConsent,
  DSRRequestForm,
  LawfulBasisTracker,
  CrossBorderTransferManager,
  ROPAManager,
} from '@tantainnovative/ndpr-toolkit';
```

### Per-Module Imports

For maximum tree-shaking, import from individual module entry points. Each module bundles only its own component(s), hook, utilities, and types.

```tsx
// Only consent management — nothing else is bundled
import { ConsentBanner, ConsentManager, useConsent } from '@tantainnovative/ndpr-toolkit/consent';

// Only breach notification
import { BreachReportForm, useBreach } from '@tantainnovative/ndpr-toolkit/breach';

// Only lawful basis tracking
import { LawfulBasisTracker, useLawfulBasis } from '@tantainnovative/ndpr-toolkit/lawful-basis';

// Only cross-border transfers
import { CrossBorderTransferManager, useCrossBorderTransfer } from '@tantainnovative/ndpr-toolkit/cross-border';

// Only ROPA
import { ROPAManager, useROPA } from '@tantainnovative/ndpr-toolkit/ropa';
```

## Import Paths Reference

| Path | Contents | React Required | RSC-safe |
|------|----------|:--------------:|:--------:|
| `@tantainnovative/ndpr-toolkit` | All components, hooks, utilities, types | Yes | No |
| `@tantainnovative/ndpr-toolkit/server` | Pure validators, generators, scoring, locales, adapters, types — **zero React in import graph** | No | **Yes** |
| `@tantainnovative/ndpr-toolkit/core` | Types, utility functions, locales, NDPRProvider | Optional | Partial[^1] |
| `@tantainnovative/ndpr-toolkit/hooks` | All React hooks and related types | Yes | No |
| `@tantainnovative/ndpr-toolkit/consent` | ConsentBanner, ConsentManager, ConsentStorage, useConsent | Yes | No |
| `@tantainnovative/ndpr-toolkit/dsr` | DSRRequestForm, DSRDashboard, DSRTracker, useDSR | Yes | No |
| `@tantainnovative/ndpr-toolkit/dpia` | DPIAQuestionnaire, DPIAReport, StepIndicator, useDPIA | Yes | No |
| `@tantainnovative/ndpr-toolkit/breach` | BreachReportForm, BreachRiskAssessment, BreachNotificationManager, RegulatoryReportGenerator, useBreach | Yes | No |
| `@tantainnovative/ndpr-toolkit/policy` | PolicyGenerator, PolicyPreview, PolicyExporter, PolicyPage, usePrivacyPolicy, useDefaultPrivacyPolicy | Yes | No |
| `@tantainnovative/ndpr-toolkit/lawful-basis` | LawfulBasisTracker, useLawfulBasis | Yes | No |
| `@tantainnovative/ndpr-toolkit/cross-border` | CrossBorderTransferManager, useCrossBorderTransfer | Yes | No |
| `@tantainnovative/ndpr-toolkit/ropa` | ROPAManager, useROPA | Yes | No |
| `@tantainnovative/ndpr-toolkit/adapters` | Storage adapters (localStorage, sessionStorage, cookie, api, memory, composeAdapters) | No | Yes |
| `@tantainnovative/ndpr-toolkit/presets` | Higher-level presets (NDPRConsent, NDPRSubjectRights, NDPRPrivacyPolicy, etc.) | Yes | No |
| `@tantainnovative/ndpr-toolkit/unstyled` | Components with `unstyled` defaulted to `true` — bring your own design system | Yes | No |
| `@tantainnovative/ndpr-toolkit/styles` | Default CSS stylesheet — `import "@tantainnovative/ndpr-toolkit/styles"` once in your app entry | No | N/A (CSS) |

[^1]: `/core` re-exports `NDPRProvider` for backward compatibility, which pulls in React. For strictly server-side imports use `/server` instead — it carries the same pure validators and generators with no React surface.

## Quick Start

### Consent Management

```tsx
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/consent';
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

const consentOptions = [
  {
    id: 'necessary',
    label: 'Necessary Cookies',
    description: 'Essential cookies for the website to function.',
    required: true,
    purpose: 'Site operation'
  },
  {
    id: 'analytics',
    label: 'Analytics Cookies',
    description: 'Cookies that help us understand how you use our website.',
    required: false,
    purpose: 'Usage analytics'
  }
];

function MyApp() {
  const { hasConsent, acceptAll, rejectAll, shouldShowBanner } = useConsent({
    options: consentOptions,
  });

  return (
    <div>
      {shouldShowBanner && (
        <ConsentBanner
          options={consentOptions}
          position="bottom"
          onSave={(settings) => console.log('Consent saved:', settings)}
        />
      )}
      <AppContent hasConsent={hasConsent} />
    </div>
  );
}

function AppContent({ hasConsent }: { hasConsent: (id: string) => boolean }) {
  if (hasConsent('analytics')) {
    // Initialize analytics
  }

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

### Privacy Policy Generator

```tsx
import { PolicyGenerator, PolicyPreview, PolicyExporter } from '@tantainnovative/ndpr-toolkit/policy';
import { useState } from 'react';

const policySections = [
  {
    id: 'introduction',
    title: 'Introduction',
    template: 'This Privacy Policy explains how {{name}} collects, uses, and protects your personal data when you visit {{website}}.',
    required: true,
    included: true
  },
  // More sections...
];

const policyVariables = [
  { id: 'org-name', name: 'name', description: 'Organization name', value: 'Acme Corporation', inputType: 'text' as const, required: true },
  { id: 'org-website', name: 'website', description: 'Website URL', value: 'https://acme.com', inputType: 'url' as const, required: true },
];

function PrivacyPolicyPage() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  return (
    <div>
      {!generatedContent ? (
        <PolicyGenerator
          sections={policySections}
          variables={policyVariables}
          onGenerate={({ content }) => {
            setGeneratedContent(content);
          }}
        />
      ) : (
        <>
          <PolicyPreview
            content={generatedContent}
            sections={policySections}
            variables={policyVariables}
          />

          <PolicyExporter
            content={generatedContent}
            title="Privacy Policy for Acme Corporation"
            organizationName="Acme Corporation"
          />
        </>
      )}
    </div>
  );
}
```

### Lawful Basis Tracking

```tsx
import { LawfulBasisTracker } from '@tantainnovative/ndpr-toolkit/lawful-basis';
import { useLawfulBasis } from '@tantainnovative/ndpr-toolkit/hooks';

function LawfulBasisPage() {
  const { activities, addActivity, updateActivity, removeActivity } = useLawfulBasis();

  return (
    <LawfulBasisTracker
      activities={activities}
      onAddActivity={addActivity}
      onUpdateActivity={updateActivity}
      onArchiveActivity={removeActivity}
    />
  );
}
```

### Cross-Border Data Transfers

```tsx
import { CrossBorderTransferManager } from '@tantainnovative/ndpr-toolkit/cross-border';
import { useCrossBorderTransfer } from '@tantainnovative/ndpr-toolkit/hooks';

function TransferManagement() {
  const { transfers, addTransfer, updateTransfer, removeTransfer, getSummary } = useCrossBorderTransfer();

  return (
    <CrossBorderTransferManager
      transfers={transfers}
      onAddTransfer={addTransfer}
      onUpdateTransfer={updateTransfer}
      onRemoveTransfer={removeTransfer}
      summary={getSummary()}
    />
  );
}
```

### Record of Processing Activities

```tsx
import { ROPAManager } from '@tantainnovative/ndpr-toolkit/ropa';
import { useROPA } from '@tantainnovative/ndpr-toolkit/hooks';

function ProcessingRecords() {
  const { ropa, addRecord, updateRecord, archiveRecord, exportCSV } = useROPA({
    initialData: { id: 'ropa-1', organizationName: 'Acme Ltd', organizationContact: 'dpo@acme.ng', organizationAddress: 'Lagos, Nigeria', records: [], lastUpdated: Date.now(), version: '1.0' },
  });

  return (
    <div>
      <ROPAManager
        ropa={ropa}
        onAddRecord={addRecord}
        onUpdateRecord={updateRecord}
        onArchiveRecord={archiveRecord}
      />
      <button onClick={() => { const csv = exportCSV(); console.log(csv); }}>
        Export to CSV
      </button>
    </div>
  );
}
```

## Styling & Customization

Every component supports three styling modes:

**Default (Tailwind CSS built-in):**

```tsx
<ConsentBanner options={options} onSave={handleSave} />
```

**Override specific sections:**

```tsx
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/consent';

<ConsentBanner
  options={options}
  onSave={handleSave}
  classNames={{
    root: "fixed bottom-0 inset-x-0 bg-white shadow-xl p-6 z-50",
    title: "text-xl font-serif text-gray-900",
    acceptButton: "bg-green-600 text-white px-6 py-2 rounded-full",
    rejectButton: "border border-gray-300 px-6 py-2 rounded-full",
  }}
/>
```

**Fully unstyled (BYO CSS -- works with Bootstrap, CSS Modules, vanilla CSS):**

```tsx
<ConsentBanner
  options={options}
  onSave={handleSave}
  unstyled
  classNames={{
    root: "my-consent-banner",
    acceptButton: "btn btn-primary",
    rejectButton: "btn btn-outline-secondary",
  }}
/>
```

### classNames Reference

| Component | Key classNames | Total keys |
|-----------|---------------|------------|
| ConsentBanner | root, title, acceptButton, rejectButton, optionsList | 14 |
| DSRRequestForm | root, form, input, select, submitButton | 11 |
| BreachReportForm | root, form, input, submitButton, notice | 10 |
| LawfulBasisTracker | root, table, form, statusBadge, complianceScore | 15 |
| All 19 components | -- | 194 total |

Every component follows the same pattern. Pass `classNames` to override specific sections, or set `unstyled` to strip all default styles.

## Component Categories

### Consent Management
- `ConsentBanner`: Cookie consent banner with customizable options
- `ConsentManager`: Component for managing consent preferences
- `ConsentStorage`: Storage mechanism for consent settings with support for localStorage, sessionStorage, and cookies
- `useConsent`: Hook for managing consent state

### Data Subject Rights
- `DSRRequestForm`: Form for submitting data subject rights requests
- `DSRDashboard`: Admin dashboard for managing DSR requests
- `DSRTracker`: Component for tracking the status of DSR requests
- `useDSR`: Hook for managing DSR state
- Types: `DSRType`, `DSRStatus`, `DSRRequest` for type-safe implementation

### DPIA (Data Protection Impact Assessment)
- `DPIAQuestionnaire`: Interactive questionnaire for conducting DPIAs
- `DPIAReport`: Component for generating DPIA reports
- `StepIndicator`: Progress indicator for multi-step processes
- `useDPIA`: Hook for managing DPIA state
- Types: `DPIAQuestion`, `DPIASection`, `DPIARisk`, `DPIAResult` for structured assessments

### Breach Notification
- `BreachReportForm`: Form for reporting data breaches
- `BreachRiskAssessment`: Tool for assessing breach risk and severity
- `BreachNotificationManager`: Component for managing breach notifications
- `RegulatoryReportGenerator`: Tool for generating regulatory reports for NDPC
- `useBreach`: Hook for managing breach notification state
- Types: `BreachReport`, `RiskAssessment`, `NotificationRequirement` for compliance with 72-hour notification requirements

### Privacy Policy
- `PolicyGenerator`: Component for generating privacy policies
- `PolicyPreview`: Preview component for privacy policies
- `PolicyExporter`: Tool for exporting privacy policies to different formats
- `generatePolicyText`: Utility for creating dynamic policies with variable support
- `usePrivacyPolicy`: Hook for managing privacy policy state

### Lawful Basis Tracking
- `LawfulBasisTracker`: Component for documenting lawful basis per processing activity (NDPA Section 25)
- `useLawfulBasis`: Hook for managing lawful basis state
- `validateProcessingActivity`, `assessComplianceGaps`, `generateLawfulBasisSummary`: Utility functions
- Types: `LawfulBasis`, `ProcessingActivity`, `LawfulBasisSummary` for structured tracking

### Cross-Border Data Transfers
- `CrossBorderTransferManager`: Component for assessing and documenting international transfers (NDPA Part VI)
- `useCrossBorderTransfer`: Hook for managing transfer state
- `validateTransfer`, `assessTransferRisk`, `isNDPCApprovalRequired`: Utility functions
- Types: `CrossBorderTransfer`, `TransferImpactAssessment`, `CrossBorderSummary` for compliance documentation

### Record of Processing Activities (ROPA)
- `ROPAManager`: Component for maintaining processing records (NDPA accountability principle)
- `useROPA`: Hook for managing processing records
- `validateProcessingRecord`, `generateROPASummary`, `exportROPAToCSV`, `identifyComplianceGaps`: Utility functions
- Types: `ProcessingRecord`, `RecordOfProcessingActivities`, `ROPASummary` for structured records

## Implementation Guides

### Setting Up Consent Management

```tsx
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/consent';
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

const consentOptions = [
  { id: 'necessary', label: 'Necessary', description: 'Required for the site to function', required: true, purpose: 'Site operation' },
  { id: 'analytics', label: 'Analytics', description: 'Help us understand usage', required: false, purpose: 'Usage analytics' },
  { id: 'marketing', label: 'Marketing', description: 'Personalized ads', required: false, purpose: 'Marketing' }
];

// 1. Use the useConsent hook and ConsentBanner in your app
function App() {
  const { hasConsent, shouldShowBanner } = useConsent({ options: consentOptions });

  return (
    <div>
      {shouldShowBanner && (
        <ConsentBanner
          options={consentOptions}
          position="bottom"
          onSave={(settings) => console.log('Consent saved:', settings)}
        />
      )}
      <AnalyticsLoader hasConsent={hasConsent} />
      <YourApp />
    </div>
  );
}

// 2. Check consent before loading third-party scripts
function AnalyticsLoader({ hasConsent }: { hasConsent: (id: string) => boolean }) {
  useEffect(() => {
    if (hasConsent('analytics')) {
      // Initialize analytics
    }
  }, [hasConsent]);

  return null;
}
```

### Implementing a Data Subject Rights Portal

```tsx
import { DSRRequestForm, DSRDashboard } from '@tantainnovative/ndpr-toolkit/dsr';
import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';

const requestTypes = [
  { id: 'access', name: 'Access my data', description: 'Right of access (Section 30)', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'rectification', name: 'Correct my data', description: 'Right to rectification (Section 31)', estimatedCompletionTime: 30, requiresAdditionalInfo: true },
  { id: 'erasure', name: 'Delete my data', description: 'Right to erasure (Section 32)', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'restriction', name: 'Restrict processing', description: 'Right to restrict processing (Section 33)', estimatedCompletionTime: 30, requiresAdditionalInfo: true },
  { id: 'portability', name: 'Data portability', description: 'Right to data portability (Section 34)', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  { id: 'objection', name: 'Object to processing', description: 'Right to object (Section 35)', estimatedCompletionTime: 30, requiresAdditionalInfo: true },
];

// 1. Create a form for data subjects to submit requests
function DSRPortal() {
  const { submitRequest } = useDSR({ requestTypes });

  const handleSubmit = (formData: any) => {
    const request = submitRequest({
      type: formData.type,
      subject: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },
      description: formData.details
    });

    alert(`Your request has been submitted. Your tracking ID is: ${request.id}`);
  };

  return (
    <DSRRequestForm
      onSubmit={handleSubmit}
      requestTypes={requestTypes}
    />
  );
}

// 2. Create an admin dashboard for managing requests
function AdminDashboard() {
  const { requests, updateRequest } = useDSR({ requestTypes });

  return (
    <DSRDashboard
      requests={requests}
      onUpdateStatus={(id, status) => updateRequest(id, { status })}
    />
  );
}
```

### Setting Up a Breach Notification System

```tsx
import { BreachReportForm, BreachRiskAssessment } from '@tantainnovative/ndpr-toolkit/breach';
import { useBreach } from '@tantainnovative/ndpr-toolkit/hooks';

const breachCategories = [
  { id: 'unauthorized-access', name: 'Unauthorized Access', description: 'Unauthorized person accessed data', defaultSeverity: 'high' as const },
  { id: 'data-loss', name: 'Data Loss', description: 'Data was lost or destroyed', defaultSeverity: 'high' as const },
  { id: 'system-compromise', name: 'System Compromise', description: 'System was compromised', defaultSeverity: 'critical' as const }
];

// 1. Create a form for reporting breaches
function BreachReporting() {
  const { reportBreach, getReport } = useBreach({ categories: breachCategories });

  const handleSubmit = (formData: any) => {
    const report = reportBreach({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      discoveredAt: Date.now(),
      reporter: {
        name: formData.reporterName,
        email: formData.reporterEmail,
        department: formData.department
      },
      affectedSystems: formData.systems,
      dataTypes: formData.dataTypes,
      status: 'ongoing'
    });

    navigate(`/breach/${report.id}/assess`);
  };

  return (
    <BreachReportForm
      onSubmit={handleSubmit}
      categories={breachCategories}
    />
  );
}

// 2. Create a risk assessment component
function RiskAssessmentView({ breachId }: { breachId: string }) {
  const { assessRisk, calculateNotificationRequirements, getReport } = useBreach({ categories: breachCategories });
  const report = getReport(breachId);

  if (!report) return <div>Breach not found</div>;

  const handleAssessment = (assessment: any) => {
    assessRisk(breachId, assessment);

    const requirements = calculateNotificationRequirements(breachId);
    if (requirements?.ndpcNotificationRequired) {
      const deadline = new Date(requirements.ndpcNotificationDeadline);
      alert(`NDPC notification required by ${deadline.toLocaleString()}`);
    }
  };

  return (
    <BreachRiskAssessment
      breachData={report}
      onComplete={handleAssessment}
    />
  );
}
```

## Documentation

For detailed documentation, visit [https://ndprtoolkit.com.ng/docs](https://ndprtoolkit.com.ng/docs)

### API Reference

Detailed API documentation is available for all components:

- [Consent Management](https://ndprtoolkit.com.ng/docs/components/consent-management)
- [Data Subject Rights](https://ndprtoolkit.com.ng/docs/components/data-subject-rights)
- [DPIA Questionnaire](https://ndprtoolkit.com.ng/docs/components/dpia-questionnaire)
- [Breach Notification](https://ndprtoolkit.com.ng/docs/components/breach-notification)
- [Privacy Policy Generator](https://ndprtoolkit.com.ng/docs/components/privacy-policy-generator)
- [Lawful Basis Tracking](https://ndprtoolkit.com.ng/docs/components/lawful-basis-tracking)
- [Cross-Border Transfers](https://ndprtoolkit.com.ng/docs/components/cross-border-transfers)
- [Record of Processing Activities](https://ndprtoolkit.com.ng/docs/components/ropa)
- [React Hooks](https://ndprtoolkit.com.ng/docs/components/hooks)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

**Abraham Esandayinze Tanta** — Software Engineer & Data Protection Compliance Specialist

- GitHub: [@mr-tanta](https://github.com/mr-tanta)
- LinkedIn: [mr-tanta](https://linkedin.com/in/mr-tanta)
- Organization: [Tanta Innovative](https://github.com/tantainnovative)

## License

MIT (c) Abraham Esandayinze Tanta
