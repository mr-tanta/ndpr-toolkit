# NDPR Toolkit

<div align="center">

![NDPR Toolkit Logo](https://via.placeholder.com/200x200?text=NDPR+Toolkit)

A comprehensive enterprise solution for implementing NDPA-compliant features in web applications, aligned with the Nigeria Data Protection Act (NDPA) 2023 and its subsidiary regulations.

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![license](https://img.shields.io/npm/l/@tantainnovative/ndpr-toolkit.svg)](https://github.com/tantainnovative/ndpr-toolkit/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0%2B-blue)](https://reactjs.org/)

</div>

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

## Import Styles

The toolkit supports three import styles so you can pull in only what your application needs:

### 1. Lightweight (Core) — Types and Utilities Only

No React dependency. Works in any JavaScript or TypeScript environment — Node.js servers, edge functions, CLI tools, or shared validation libraries.

```ts
import {
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

### 2. Hooks Only — React State Management Without UI

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

### 3. Full UI — Components, Hooks, and Utilities

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

| Path | Contents | React Required |
|------|----------|:--------------:|
| `@tantainnovative/ndpr-toolkit` | All components, hooks, utilities, types | Yes |
| `@tantainnovative/ndpr-toolkit/core` | Types and utility functions only | No |
| `@tantainnovative/ndpr-toolkit/hooks` | All React hooks and related types | Yes |
| `@tantainnovative/ndpr-toolkit/consent` | ConsentBanner, ConsentManager, ConsentStorage, useConsent | Yes |
| `@tantainnovative/ndpr-toolkit/dsr` | DSRRequestForm, DSRDashboard, DSRTracker, useDSR | Yes |
| `@tantainnovative/ndpr-toolkit/dpia` | DPIAQuestionnaire, DPIAReport, StepIndicator, useDPIA | Yes |
| `@tantainnovative/ndpr-toolkit/breach` | BreachReportForm, BreachRiskAssessment, BreachNotificationManager, RegulatoryReportGenerator, useBreach | Yes |
| `@tantainnovative/ndpr-toolkit/policy` | PolicyGenerator, PolicyPreview, PolicyExporter, usePrivacyPolicy | Yes |
| `@tantainnovative/ndpr-toolkit/lawful-basis` | LawfulBasisTracker, useLawfulBasis | Yes |
| `@tantainnovative/ndpr-toolkit/cross-border` | CrossBorderTransferManager, useCrossBorderTransfer | Yes |
| `@tantainnovative/ndpr-toolkit/ropa` | ROPAManager, useROPA | Yes |
| `@tantainnovative/ndpr-toolkit/unstyled` | All components without default styles | Yes |
| `@tantainnovative/ndpr-toolkit/styles` | Default CSS stylesheet | No |

## Quick Start

### Consent Management

```tsx
import { ConsentBanner, ConsentManager } from '@tantainnovative/ndpr-toolkit/consent';
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

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
        onSave={(consents) => console.log('Consent saved:', consents)}
      />
    </ConsentManager>
  );
}

function AppContent() {
  const { consents, hasConsented, updateConsent } = useConsent();
  
  if (hasConsented('analytics')) {
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
import { usePrivacyPolicy } from '@tantainnovative/ndpr-toolkit/hooks';
import { generatePolicyText } from '@tantainnovative/ndpr-toolkit/core';

function PrivacyPolicyPage() {
  const { policy, updateVariableValue, generatePolicy } = usePrivacyPolicy();
  const [generatedPolicy, setGeneratedPolicy] = useState(null);
  
  const variables = {
    organizationName: 'Acme Corporation',
    websiteUrl: 'https://acme.com',
    contactEmail: 'privacy@acme.com',
    lastUpdated: new Date().toLocaleDateString()
  };
  
  return (
    <div>
      {!generatedPolicy ? (
        <PolicyGenerator 
          templates={[
            {
              id: 'standard',
              name: 'Standard Privacy Policy',
              description: 'A comprehensive privacy policy suitable for most websites and applications.',
              sections: [
                {
                  id: 'introduction',
                  title: 'Introduction',
                  template: 'This Privacy Policy explains how {{organizationName}} collects, uses, and protects your personal data when you visit {{websiteUrl}}.',
                  required: true,
                  included: true
                },
                // More sections...
              ]
            }
          ]}
          variables={variables}
          onComplete={(data) => {
            const result = generatePolicyText(data.sections, variables);
            setGeneratedPolicy({
              title: `Privacy Policy for ${variables.organizationName}`,
              content: result.fullText,
              lastUpdated: new Date()
            });
          }}
        />
      ) : (
        <>
          <PolicyPreview 
            policy={generatedPolicy}
            variables={variables}
            onVariableChange={(newVariables) => {
              // Update variables and regenerate policy
            }}
          />
          
          <PolicyExporter
            policy={generatedPolicy}
            formats={['html', 'pdf', 'markdown']}
            filename="privacy-policy"
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
  const { activities, addActivity, assessGaps, summary } = useLawfulBasis();

  return (
    <LawfulBasisTracker
      activities={activities}
      onAddActivity={addActivity}
      onAssessGaps={assessGaps}
      summary={summary}
    />
  );
}
```

### Cross-Border Data Transfers

```tsx
import { CrossBorderTransferManager } from '@tantainnovative/ndpr-toolkit/cross-border';
import { useCrossBorderTransfer } from '@tantainnovative/ndpr-toolkit/hooks';
import { isNDPCApprovalRequired } from '@tantainnovative/ndpr-toolkit/core';

function TransferManagement() {
  const { transfers, addTransfer, assessRisk } = useCrossBorderTransfer();

  return (
    <CrossBorderTransferManager
      transfers={transfers}
      onAddTransfer={addTransfer}
      onAssessRisk={assessRisk}
    />
  );
}
```

### Record of Processing Activities

```tsx
import { ROPAManager } from '@tantainnovative/ndpr-toolkit/ropa';
import { useROPA } from '@tantainnovative/ndpr-toolkit/hooks';
import { exportROPAToCSV } from '@tantainnovative/ndpr-toolkit/core';

function ProcessingRecords() {
  const { records, addRecord, summary } = useROPA();

  return (
    <div>
      <ROPAManager
        records={records}
        onAddRecord={addRecord}
        summary={summary}
      />
      <button onClick={() => exportROPAToCSV(records)}>
        Export to CSV
      </button>
    </div>
  );
}
```

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
// 1. Wrap your application with ConsentManager
import { ConsentManager } from '@tantainnovative/ndpr-toolkit/consent';

function App() {
  return (
    <ConsentManager
      options={[
        { id: 'necessary', label: 'Necessary', description: '...', required: true },
        { id: 'analytics', label: 'Analytics', description: '...', required: false },
        { id: 'marketing', label: 'Marketing', description: '...', required: false }
      ]}
      storageKey="my-app-consent"
      autoLoad={true}
      autoSave={true}
    >
      <YourApp />
    </ConsentManager>
  );
}

// 2. Add the ConsentBanner to your layout
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/consent';

function Layout({ children }) {
  return (
    <>
      {children}
      <ConsentBanner
        position="bottom"
        privacyPolicyUrl="/privacy-policy"
        showPreferences={true}
      />
    </>
  );
}

// 3. Use the consent values in your components
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

function AnalyticsComponent() {
  const { hasConsented } = useConsent();
  
  useEffect(() => {
    if (hasConsented('analytics')) {
      // Initialize analytics
    }
  }, [hasConsented]);
  
  return null;
}
```

### Implementing a Data Subject Rights Portal

```tsx
import { DSRRequestForm, DSRDashboard } from '@tantainnovative/ndpr-toolkit/dsr';
import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';

// 1. Create a form for data subjects to submit requests
function DSRPortal() {
  const { submitRequest } = useDSR();
  
  const handleSubmit = (formData) => {
    const request = submitRequest({
      type: formData.type,
      subject: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      },
      details: formData.details
    });
    
    alert(`Your request has been submitted. Your tracking ID is: ${request.id}`);
  };
  
  return (
    <DSRRequestForm
      onSubmit={handleSubmit}
      requestTypes={[
        { id: 'access', label: 'Access my data' },
        { id: 'rectification', label: 'Correct my data' },
        { id: 'erasure', label: 'Delete my data' },
        { id: 'restriction', label: 'Restrict processing of my data' },
        { id: 'portability', label: 'Data portability' },
        { id: 'objection', label: 'Object to processing' }
      ]}
    />
  );
}

// 2. Create an admin dashboard for managing requests
function AdminDashboard() {
  const { requests, updateRequest, deleteRequest } = useDSR();
  
  return (
    <DSRDashboard
      requests={requests}
      onUpdateRequest={updateRequest}
      onDeleteRequest={deleteRequest}
    />
  );
}
```

### Setting Up a Breach Notification System

```tsx
import { BreachReportForm, BreachRiskAssessment } from '@tantainnovative/ndpr-toolkit/breach';
import { useBreach } from '@tantainnovative/ndpr-toolkit/hooks';

// 1. Create a form for reporting breaches
function BreachReporting() {
  const { submitBreachReport } = useBreach();
  
  const handleSubmit = (formData) => {
    const report = submitBreachReport({
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
      categories={[
        { id: 'unauthorized-access', label: 'Unauthorized Access' },
        { id: 'data-loss', label: 'Data Loss' },
        { id: 'system-compromise', label: 'System Compromise' }
      ]}
    />
  );
}

// 2. Create a risk assessment component
function RiskAssessment({ breachId }) {
  const { performRiskAssessment, determineNotificationRequirements } = useBreach();
  
  const handleAssessment = (assessmentData) => {
    const assessment = performRiskAssessment({
      breachId,
      assessor: {
        name: 'Jane Smith',
        role: 'Data Protection Officer',
        email: 'jane@example.com'
      },
      ...assessmentData
    });
    
    const requirements = determineNotificationRequirements({
      breachId,
      riskAssessmentId: assessment.id
    });
    
    if (requirements.nitdaNotificationRequired) {
      const deadline = new Date(requirements.nitdaNotificationDeadline);
      alert(`NDPC notification required by ${deadline.toLocaleString()}`);
    }
  };
  
  return (
    <BreachRiskAssessment
      breachId={breachId}
      onComplete={handleAssessment}
    />
  );
}
```

## Documentation

For detailed documentation, visit [https://ndpr-toolkit.tantainnovative.com/docs](https://ndpr-toolkit.tantainnovative.com/docs)

### API Reference

Detailed API documentation is available for all components:

- [Consent Management](https://ndpr-toolkit.tantainnovative.com/docs/components/consent-management)
- [Data Subject Rights](https://ndpr-toolkit.tantainnovative.com/docs/components/data-subject-rights)
- [DPIA Questionnaire](https://ndpr-toolkit.tantainnovative.com/docs/components/dpia-questionnaire)
- [Breach Notification](https://ndpr-toolkit.tantainnovative.com/docs/components/breach-notification)
- [Privacy Policy Generator](https://ndpr-toolkit.tantainnovative.com/docs/components/privacy-policy-generator)
- [Lawful Basis Tracking](https://ndpr-toolkit.tantainnovative.com/docs/components/lawful-basis-tracking)
- [Cross-Border Transfers](https://ndpr-toolkit.tantainnovative.com/docs/components/cross-border-transfers)
- [Record of Processing Activities](https://ndpr-toolkit.tantainnovative.com/docs/components/ropa)
- [React Hooks](https://ndpr-toolkit.tantainnovative.com/docs/components/hooks)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

**Abraham Esandayinze Tanta** — Software Engineer & Data Protection Compliance Specialist

- GitHub: [@mr-tanta](https://github.com/mr-tanta)
- LinkedIn: [mr-tanta](https://linkedin.com/in/mr-tanta)
- Organization: [Tanta Innovative](https://github.com/tantainnovative)

## License

MIT (c) Abraham Esandayinze Tanta
