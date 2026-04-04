# @tantainnovative/ndpr-toolkit

**Compliance infrastructure for the Nigeria Data Protection Act (NDPA) 2023**

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tantainnovative/ndpr-toolkit)](https://bundlephobia.com/package/@tantainnovative/ndpr-toolkit)

Eight production-ready modules covering consent, data subject rights, DPIA, breach notification, privacy policies, lawful basis tracking, cross-border transfers, and ROPA -- everything a data controller or processor needs under the NDPA.

**[Documentation](https://ndprtoolkit.com.ng)** | **[Live Demos](https://ndprtoolkit.com.ng/ndpr-demos)** | **[npm](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)**

---

## Install

```bash
pnpm add @tantainnovative/ndpr-toolkit
```

---

## Choose Your Import Style

v2.0 ships modular entry points. Pick the layer you need -- the rest stays out of your bundle.

### Lightweight (zero UI dependencies)

Types, validators, and utility functions. Works in any JS/TS environment -- Node, Deno, edge functions, or the browser.

```typescript
import { validateConsent, getLawfulBasisDescription } from '@tantainnovative/ndpr-toolkit/core';
```

### React Hooks

Stateful hooks for every module. Requires `react` only -- no Radix, no Tailwind.

```typescript
import { useConsent, useLawfulBasis } from '@tantainnovative/ndpr-toolkit/hooks';
```

### Full UI Components

Pre-built, styled components. Requires Tailwind CSS plus a handful of Radix primitives.

```typescript
import { ConsentBanner, LawfulBasisTracker } from '@tantainnovative/ndpr-toolkit';
```

Install the UI peer dependencies:

```bash
pnpm add @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-slot lucide-react tailwind-merge clsx class-variance-authority
```

### Per-Module Imports

Need just one module? Import it directly to keep your bundle minimal.

```typescript
import { ConsentBanner, useConsent } from '@tantainnovative/ndpr-toolkit/consent';
import { BreachReportForm, useBreach } from '@tantainnovative/ndpr-toolkit/breach';
```

---

## Quick Start

A consent banner in under 10 lines:

```tsx
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

function App() {
  const { hasConsent, acceptAll, rejectAll, shouldShowBanner } = useConsent({
    options: [
      { id: 'essential', label: 'Essential', description: 'Required for the site to function', required: true, purpose: 'Site operation' },
      { id: 'analytics', label: 'Analytics', description: 'Help us improve', required: false, purpose: 'Usage analytics' },
    ],
  });

  if (shouldShowBanner) {
    return (
      <div>
        <p>We use cookies to improve your experience.</p>
        <button onClick={acceptAll}>Accept All</button>
        <button onClick={rejectAll}>Reject Optional</button>
      </div>
    );
  }

  return <main>{hasConsent('analytics') && <AnalyticsScript />}</main>;
}
```

---

## Modules

### 1. Consent Management

**NDPA Sections 25-26** -- Freely given, specific, informed, and unambiguous consent.

```typescript
import { ConsentBanner, ConsentManager, useConsent, validateConsent } from '@tantainnovative/ndpr-toolkit/consent';
```

```tsx
<ConsentManager
  position="bottom"
  animation="slide"
  onConsentChange={(consent) => {
    if (consent.analytics) loadAnalytics();
  }}
>
  <App />
</ConsentManager>
```

**Key exports:** `ConsentBanner`, `ConsentManager`, `ConsentStorage`, `useConsent`, `validateConsent`, `validateConsentOptions`

---

### 2. Data Subject Rights (DSR)

**NDPA Part IV, Sections 29-36** -- All 8 rights: information, access, rectification, erasure, restriction, portability, objection, and automated decision-making.

```typescript
import { DSRRequestForm, DSRDashboard, useDSR, formatDSRRequest } from '@tantainnovative/ndpr-toolkit/dsr';
```

```tsx
const { submitRequest, requests } = useDSR({
  requestTypes: [
    { id: 'access', name: 'Access Request', description: 'Right of access (Section 30)', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
  ],
});
```

**Key exports:** `DSRRequestForm`, `DSRDashboard`, `DSRTracker`, `useDSR`, `formatDSRRequest`

---

### 3. Data Protection Impact Assessment (DPIA)

**NDPA Section 38-39** -- Mandatory risk assessment for high-risk processing activities.

```typescript
import { DPIAQuestionnaire, DPIAReport, useDPIA, assessDPIARisk } from '@tantainnovative/ndpr-toolkit/dpia';
```

```tsx
const { currentSection, answers, goToNextSection, getResult } = useDPIA({
  sections: dpiaSections,
  onComplete: (result) => saveAssessment(result),
});
```

**Key exports:** `DPIAQuestionnaire`, `DPIAReport`, `StepIndicator`, `useDPIA`, `assessDPIARisk`

---

### 4. Breach Notification

**NDPA Section 40** -- 72-hour notification to the NDPC, plus data subject notification.

```typescript
import { BreachReportForm, BreachNotificationManager, useBreach, calculateBreachSeverity } from '@tantainnovative/ndpr-toolkit/breach';
```

```tsx
const { createReport, reports, assessRisk } = useBreach({
  categories: breachCategories,
  onReport: (report) => notifyNDPC(report),
});
```

**Key exports:** `BreachReportForm`, `BreachRiskAssessment`, `BreachNotificationManager`, `RegulatoryReportGenerator`, `useBreach`, `calculateBreachSeverity`

---

### 5. Privacy Policy Generator

**NDPA Sections 27-28** -- Multi-step wizard producing NDPA-compliant privacy policies with PDF/DOCX export.

```typescript
import { PolicyGenerator, PolicyPreview, usePrivacyPolicy, generatePolicyText } from '@tantainnovative/ndpr-toolkit/policy';
```

```tsx
<PolicyGenerator />
```

The wizard covers organization info, data collection practices, data sharing, custom sections, and a preview with export.

**Key exports:** `PolicyGenerator`, `PolicyPreview`, `PolicyExporter`, `usePrivacyPolicy`, `generatePolicyText`

---

### 6. Lawful Basis Tracker

**NDPA Section 25** -- Document and manage the lawful basis for every processing activity. Covers all six bases: consent, contract, legal obligation, vital interests, public interest, and legitimate interests.

```typescript
import { LawfulBasisTracker, useLawfulBasis, validateProcessingActivity, getLawfulBasisDescription } from '@tantainnovative/ndpr-toolkit/lawful-basis';
```

```tsx
const { activities, addActivity, getSummary } = useLawfulBasis();

addActivity({
  name: 'Email marketing',
  description: 'Send promotional emails',
  lawfulBasis: 'consent',
  lawfulBasisJustification: 'Explicit opt-in at signup',
  dataCategories: ['email', 'name'],
  involvesSensitiveData: false,
  dataSubjectCategories: ['customers'],
  purposes: ['marketing'],
  retentionPeriod: '2 years',
  crossBorderTransfer: false,
  status: 'active',
});
```

**Key exports:** `LawfulBasisTracker`, `useLawfulBasis`, `validateProcessingActivity`, `getLawfulBasisDescription`, `assessComplianceGaps`, `generateLawfulBasisSummary`

---

### 7. Cross-Border Transfer Assessment

**NDPA Part VI, Sections 41-45** -- Evaluate adequacy decisions, standard contractual clauses, binding corporate rules, and derogations for international data transfers.

```typescript
import { CrossBorderTransferManager, useCrossBorderTransfer, validateTransfer, assessTransferRisk } from '@tantainnovative/ndpr-toolkit/cross-border';
```

```tsx
const { transfers, addTransfer, getSummary } = useCrossBorderTransfer({
  onAdd: (transfer) => logTransfer(transfer),
});
```

**Key exports:** `CrossBorderTransferManager`, `useCrossBorderTransfer`, `validateTransfer`, `getTransferMechanismDescription`, `assessTransferRisk`, `isNDPCApprovalRequired`

---

### 8. Record of Processing Activities (ROPA)

**NDPC Regulatory Guidance** -- Maintain comprehensive records of all processing activities for audit readiness.

```typescript
import { ROPAManager, useROPA, generateROPASummary, exportROPAToCSV } from '@tantainnovative/ndpr-toolkit/ropa';
```

```tsx
const { ropa, addRecord, getSummary } = useROPA({
  initialData: { id: 'ropa-1', organizationName: 'Acme Ltd', organizationContact: 'dpo@acme.ng', organizationAddress: 'Lagos, Nigeria', records: [], lastUpdated: Date.now(), version: '1.0' },
});
```

**Key exports:** `ROPAManager`, `useROPA`, `validateProcessingRecord`, `generateROPASummary`, `exportROPAToCSV`, `identifyComplianceGaps`

---

## Available Import Paths

| Path | What you get | Dependencies |
|------|-------------|--------------|
| `/core` | Types + utility functions | `tslib`, `uuid` |
| `/hooks` | React hooks for all 8 modules | `react` |
| `/consent` | Consent components + hook + utils | `react`, Radix, Tailwind |
| `/dsr` | DSR components + hook + utils | `react`, Radix, Tailwind |
| `/dpia` | DPIA components + hook + utils | `react`, Radix, Tailwind |
| `/breach` | Breach components + hook + utils | `react`, Radix, Tailwind |
| `/policy` | Policy components + hook + utils | `react`, Radix, Tailwind, `jspdf` |
| `/lawful-basis` | Lawful basis component + hook + utils | `react`, Radix, Tailwind |
| `/cross-border` | Cross-border component + hook + utils | `react`, Radix, Tailwind |
| `/ropa` | ROPA component + hook + utils | `react`, Radix, Tailwind |
| `/unstyled` | Unstyled consent primitives | `react` |
| `.` (default) | Everything | All peer deps |

---

## NDPA 2023 Overview

The **Nigeria Data Protection Act (NDPA) 2023** replaced the NDPR 2019 and established the **Nigeria Data Protection Commission (NDPC)** as the independent regulatory body.

| Aspect | NDPR (2019) | NDPA (2023) |
|--------|-------------|-------------|
| Legal status | NITDA regulation | Act of the National Assembly |
| Regulator | NITDA | NDPC (independent commission) |
| Scope | Organizations processing data in Nigeria | Broader territorial + extraterritorial application |
| Enforcement | Limited | Independent investigation and penalty powers |
| Data subject rights | 6 rights | 8 rights (added information + automated decision-making) |
| Cross-border transfers | Basic provisions | Comprehensive framework with adequacy decisions |
| Breach notification | 72 hours to NITDA | 72 hours to NDPC (Section 40) |
| DPIA | Recommended | Required for high-risk processing (Section 38) |

---

## TypeScript

The toolkit is written in TypeScript and exports all types:

```typescript
import type {
  // Consent
  ConsentOption, ConsentSettings, LawfulBasisType,
  // DSR
  DSRRequest, DSRType, DSRStatus, RequestType,
  // DPIA
  DPIAQuestion, DPIASection, DPIAResult, DPIARisk,
  // Breach
  BreachReport, BreachCategory, RiskAssessment,
  // Policy
  PolicySection, PolicyTemplate, OrganizationInfo, PrivacyPolicy,
  // Lawful Basis
  LawfulBasis, ProcessingActivity, LawfulBasisSummary,
  // Cross-Border
  CrossBorderTransfer, TransferMechanism, AdequacyStatus,
  // ROPA
  ProcessingRecord, RecordOfProcessingActivities, ROPASummary,
} from '@tantainnovative/ndpr-toolkit/core';
```

---

## Contributing

Contributions are welcome. Please read the [Contributing Guide](./CONTRIBUTING.md) before submitting a pull request.

---

## License

MIT

---

## Author

**Abraham Esandayinze Tanta** — Software Engineer & Data Protection Compliance Specialist

- GitHub: [@mr-tanta](https://github.com/mr-tanta)
- LinkedIn: [mr-tanta](https://linkedin.com/in/mr-tanta)
- Organization: [Tanta Innovative](https://github.com/tantainnovative)
