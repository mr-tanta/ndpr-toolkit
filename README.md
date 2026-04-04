# Nigeria Data Protection Toolkit (NDPR-Toolkit)

**Enterprise-grade React components for NDPA 2023 compliance**

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://react.dev/)

An open-source toolkit that helps developers implement compliance with the **Nigeria Data Protection Act (NDPA) 2023** in React applications. Built with TypeScript, fully typed, and designed for production use.

**[Documentation](https://ndprtoolkit.com.ng)** | **[Live Demos](https://ndprtoolkit.com.ng/ndpr-demos)** | **[npm](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)**

---

## What's New in v2.0

Version 2.0 aligns the toolkit with the **Nigeria Data Protection Act (NDPA) 2023**, which replaced the NDPR framework. The NDPA established the **Nigeria Data Protection Commission (NDPC)** as the independent regulatory body (replacing NITDA's role under the former NDPR).

**Three new modules** have been added:

- **Lawful Basis Tracker** -- Document and manage lawful basis for every processing activity per NDPA Section 25
- **Cross-Border Transfer Assessment** -- Evaluate and document compliance for international data transfers under NDPA Part VI (Sections 41-45)
- **ROPA (Record of Processing Activities)** -- Maintain comprehensive processing records as required by NDPC regulatory guidance

All existing modules have been updated to reference NDPA sections and NDPC as the supervisory authority.

---

## Features

| Module | Description | NDPA Reference |
|--------|-------------|----------------|
| **Consent Management** | Granular consent collection with banner, settings panel, headless mode, and event-driven architecture | Sections 25-26 |
| **Data Subject Rights** | Request forms covering all 8 rights: access, rectification, erasure, restriction, portability, objection, information, and automated decision-making | Part IV (Sections 29-36) |
| **DPIA** | Questionnaire-based Data Protection Impact Assessment with risk scoring and mitigation recommendations | Section 38 |
| **Breach Notification** | 72-hour NDPC notification workflow with severity assessment, timeline tracking, and authority reporting | Section 40 |
| **Privacy Policy Generator** | Multi-step wizard generating NDPA-compliant privacy policies with PDF/DOCX export | Sections 27-28 |
| **Lawful Basis Tracker** | Document lawful basis for each processing activity with audit trail | Section 25 |
| **Cross-Border Transfer Assessment** | Evaluate adequacy decisions, safeguards, and derogations for international transfers | Part VI (Sections 41-45) |
| **ROPA** | Record of Processing Activities with data flow mapping and retention schedules | NDPC Regulatory Guidance |

---

## Quick Start

### Installation

```bash
pnpm add @tantainnovative/ndpr-toolkit
```

### Basic Usage

```tsx
import { ConsentManager, useConsent } from '@tantainnovative/ndpr-toolkit';

function App() {
  return (
    <ConsentManager
      onConsentChange={(consent) => console.log('Consent updated:', consent)}
    >
      <MainApp />
    </ConsentManager>
  );
}

function MainApp() {
  const { consentState, openSettings } = useConsent();

  return (
    <div>
      {consentState.analytics && <AnalyticsScript />}
      <button onClick={openSettings}>Manage Privacy Settings</button>
    </div>
  );
}
```

---

## Module Documentation

### 1. Consent Management

Implements NDPA Sections 25-26 for lawful consent collection. Supports pre-built UI, headless mode, render props, custom components, and event-driven architecture.

```tsx
import {
  ConsentManager,
  useConsent,
  useConsentManager,
} from '@tantainnovative/ndpr-toolkit';
```

**Pre-built UI with banner and settings panel:**

```tsx
<ConsentManager
  position="bottom"
  animation="slide"
  onConsentChange={(consent) => {
    // Fires when user updates consent preferences
    if (consent.analytics) loadAnalytics();
  }}
>
  <App />
</ConsentManager>
```

**Headless mode for fully custom UI:**

```tsx
<ConsentManager headless>
  <CustomConsentBanner />
  <CustomConsentSettings />
</ConsentManager>
```

**Event-driven with `useConsentManager`:**

```tsx
function Analytics() {
  const manager = useConsentManager();

  useEffect(() => {
    const unsub = manager.on('consent:accepted', (data) => {
      // Initialize analytics after consent
    });
    return unsub;
  }, [manager]);

  return null;
}
```

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `headless` | `boolean` | Disable built-in UI, use context hooks instead |
| `position` | `'top' \| 'bottom' \| 'center'` | Banner position |
| `animation` | `'slide' \| 'fade' \| 'none'` | Banner animation style |
| `onConsentChange` | `(consent: ConsentCategories) => void` | Callback on consent update |
| `initialConsent` | `Partial<ConsentCategories>` | Override default consent values |
| `storageKey` | `string` | Custom localStorage key for persistence |
| `renderBanner` | `(props: BannerProps) => ReactNode` | Custom banner renderer |
| `renderSettings` | `(props: SettingsProps) => ReactNode` | Custom settings renderer |

---

### 2. Data Subject Rights

Implements all 8 data subject rights from NDPA Part IV (Sections 29-36): access, rectification, erasure, restriction of processing, data portability, objection, right to information, and rights related to automated decision-making.

```tsx
import { DSRRequestForm } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
<DSRRequestForm
  onSubmit={(data) => {
    // data.requestType: 'access' | 'rectification' | 'erasure' | ...
    // data.name, data.email, data.details, data.consent
    submitToBackend(data);
  }}
/>
```

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: DSRSubmission) => void` | Handler for form submission |
| `className` | `string` | Custom CSS class for the form container |

**Supported request types:** `access`, `rectification`, `erasure`, `restriction`, `portability`, `objection`, `information`, `automated_decision_making`

---

### 3. Data Protection Impact Assessment (DPIA)

Implements NDPA Section 38 requirements for assessing risks of data processing activities.

```tsx
import { DPIAQuestionnaire } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
const dpiaQuestions = [
  {
    id: 'q1',
    text: 'Does the processing involve large-scale profiling?',
    type: 'scale',
    category: 'Risk Assessment',
    required: true,
    minValue: 1,
    maxValue: 5,
    scaleLabels: { '1': 'Very Low', '5': 'Very High' },
  },
  // ... more questions
];

<DPIAQuestionnaire
  questions={dpiaQuestions}
  onSubmit={(answers, projectName) => {
    // answers: Record<string, number> — question ID to risk score
    generateReport(answers, projectName);
  }}
/>
```

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `questions` | `DPIAQuestion[]` | Array of assessment questions |
| `onSubmit` | `(answers: Record<string, number>, projectName: string) => void` | Handler with scored answers |
| `className` | `string` | Custom CSS class |

**Question types supported:** `text`, `textarea`, `number`, `select`, `radio`, `checkbox`, `scale`, `yes-no`, `multiple-choice`

---

### 4. Breach Notification

Implements NDPA Section 40 requiring notification to the NDPC within 72 hours of becoming aware of a data breach.

```tsx
import { BreachNotificationForm } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
<BreachNotificationForm
  onSubmit={(report) => {
    // report.title, report.description, report.discoveryDate
    // report.severity: 'low' | 'medium' | 'high' | 'critical'
    // report.affectedDataSubjects: number
    // report.dataCategories: string[]
    // report.mitigationSteps: string[]
    // report.reportedToAuthorities: boolean
    // report.reportedToDataSubjects: boolean
    notifyNDPC(report);
  }}
/>
```

**Key props:**

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: BreachReport) => void` | Handler for breach report submission |
| `className` | `string` | Custom CSS class |

**Built-in features:** severity classification, data category selection (with custom categories), mitigation step tracking, NDPC and data subject notification checkboxes, and field validation.

---

### 5. Privacy Policy Generator

Generates NDPA-compliant privacy policies through a multi-step wizard covering organization info, data collection practices, data sharing, and custom sections. Supports PDF and DOCX export.

```tsx
import { PolicyGenerator } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
<PolicyGenerator />
```

The `PolicyGenerator` is a self-contained wizard component that walks through:

1. **Organization Information** -- name, contact, website, industry, registration
2. **Data Collection** -- purposes, categories, retention periods, legal basis
3. **Data Sharing** -- third parties, international transfers, safeguards
4. **Custom Sections** -- add organization-specific policy sections
5. **Preview & Export** -- review the generated policy and export as PDF or DOCX

---

### 6. Lawful Basis Tracker

Documents the lawful basis for each processing activity as required by NDPA Section 25. The six lawful bases under the NDPA are: consent, contract, legal obligation, vital interests, public task, and legitimate interests.

```tsx
import { LawfulBasisTracker } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
<LawfulBasisTracker
  onSave={(activities) => {
    // activities: array of processing activities with lawful basis documentation
    persistToDatabase(activities);
  }}
/>
```

**Tracks per processing activity:** lawful basis selection, purpose of processing, categories of data subjects, data categories, retention period, and assessment notes.

---

### 7. Cross-Border Transfer Assessment

Evaluates international data transfers for compliance with NDPA Part VI (Sections 41-45). Covers adequacy decisions, appropriate safeguards, binding corporate rules, and derogations.

```tsx
import { CrossBorderTransferAssessment } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
<CrossBorderTransferAssessment
  onComplete={(assessment) => {
    // assessment includes: destination country, transfer mechanism,
    // safeguards in place, risk evaluation, and compliance determination
    recordTransferAssessment(assessment);
  }}
/>
```

**Evaluates:** adequacy of destination country protections, standard contractual clauses, binding corporate rules, explicit consent as a derogation, and supplementary measures.

---

### 8. Record of Processing Activities (ROPA)

Maintains a comprehensive record of all processing activities as recommended by NDPC regulatory guidance. Required for data controllers and processors operating at scale.

```tsx
import { ROPA } from '@tantainnovative/ndpr-toolkit';
```

**Usage:**

```tsx
<ROPA
  onSave={(records) => {
    // records: array of processing activity records
    exportForNDPCAudit(records);
  }}
/>
```

**Records per activity:** controller/processor details, purposes of processing, categories of data subjects and personal data, recipients, international transfers, retention periods, and technical/organizational security measures.

---

## NDPA 2023 Overview

The **Nigeria Data Protection Act (NDPA) 2023** is the primary legislation governing data protection in Nigeria. It replaced the Nigeria Data Protection Regulation (NDPR) 2019 and established a comprehensive legal framework for the processing of personal data.

**Key changes from NDPR to NDPA:**

| Aspect | NDPR (2019) | NDPA (2023) |
|--------|-------------|-------------|
| Legal status | Regulation issued by NITDA | Act of the National Assembly |
| Regulator | NITDA | Nigeria Data Protection Commission (NDPC) |
| Scope | Organizations processing data in Nigeria | Broader territorial scope including extraterritorial application |
| Enforcement | Limited enforcement powers | Independent commission with investigation and penalty powers |
| Data subject rights | 6 rights | 8 rights (added information and automated decision-making) |
| Cross-border transfers | Basic provisions | Comprehensive framework with adequacy decisions (Part VI) |
| Breach notification | 72 hours to NITDA | 72 hours to NDPC (Section 40) |
| DPIA | Recommended | Required for high-risk processing (Section 38) |

**NDPA structure relevant to this toolkit:**

- **Part III (Sections 24-28)** -- Obligations of data controllers and processors
- **Part IV (Sections 29-36)** -- Rights of data subjects
- **Section 38** -- Data Protection Impact Assessment
- **Section 40** -- Breach notification
- **Part VI (Sections 41-45)** -- Transfer of personal data to foreign countries

---

## TypeScript Support

The toolkit is written in TypeScript and exports all types for full IDE support:

```tsx
import type {
  ConsentCategories,
  ConsentState,
  ConsentActions,
  DSRRequest,
  DSRType,
  DSRStatus,
  BreachReport,
  BreachSeverity,
  DPIAQuestion,
  DPIAResult,
  PolicySection,
  PolicyTemplate,
  ConsentRecord,
  ConsentHistoryEntry,
} from '@tantainnovative/ndpr-toolkit';
```

---

## API Reference

Full API documentation, interactive demos, and implementation guides are available at:

**[https://ndprtoolkit.com.ng](https://ndprtoolkit.com.ng)**

---

## Development

```bash
# Clone the repository
git clone https://github.com/tantainnovative/ndpr-toolkit.git
cd ndpr-toolkit

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build the library
pnpm build:lib

# Run tests
pnpm test
```

---

## Contributing

Contributions are welcome. Please read the [Contributing Guide](./CONTRIBUTING.md) before submitting a pull request.

For major changes, open an issue first to discuss the proposed change.

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Author

**Abraham Esandayinze Tanta**

Senior Software Engineer specializing in data protection compliance engineering, with over a decade of experience in software development, security, and systems architecture. Based in Lagos, Nigeria.

- GitHub: [@mr-tanta](https://github.com/mr-tanta)
- LinkedIn: [linkedin.com/in/mr-tanta](https://linkedin.com/in/mr-tanta)
- Organization: [Tanta Innovative](https://github.com/tantainnovative)
