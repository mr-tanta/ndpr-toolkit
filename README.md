# @tantainnovative/ndpr-toolkit

**Compliance infrastructure for the Nigeria Data Protection Act (NDPA) 2023**

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tantainnovative/ndpr-toolkit)](https://bundlephobia.com/package/@tantainnovative/ndpr-toolkit)

v3 ships **zero-config presets**, **pluggable storage adapters**, **compound components**, and a **compliance score engine** — eight production-ready modules covering consent, data subject rights, DPIA, breach notification, privacy policies, lawful basis, cross-border transfers, and ROPA.

**[Documentation](https://ndprtoolkit.com.ng)** | **[Live Demos](https://ndprtoolkit.com.ng/ndpr-demos)** | **[npm](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)**

---

## The 3-File Quickstart

Three files. Full NDPA consent compliance.

**`app/layout.tsx`**
```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <NDPRConsent />
      </body>
    </html>
  );
}
```

**`app/api/consent/route.ts`**
```ts
import { NextRequest, NextResponse } from 'next/server';

let store: unknown = null;

export async function GET() { return NextResponse.json(store ?? {}); }
export async function POST(req: NextRequest) {
  store = await req.json();
  return NextResponse.json({ ok: true });
}
```

**Persist to your API instead of localStorage:**
```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<NDPRConsent adapter={apiAdapter('/api/consent')} />
```

That's it. NDPA-compliant consent with server-side persistence in under 20 lines.

---

## Install

```bash
pnpm add @tantainnovative/ndpr-toolkit
```

Install UI peer dependencies (only needed for styled components):

```bash
pnpm add @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-slot lucide-react tailwind-merge clsx class-variance-authority
```

Or scaffold instantly with the CLI:

```bash
npx @tantainnovative/create-ndpr
```

---

## Choose Your Layer

Pick exactly what your project needs.

### Presets — zero-config

Drop-in components with sensible defaults. No configuration required.

```tsx
import {
  NDPRConsent,           // Consent banner — works with zero props
  NDPRSubjectRights,     // DSR request form
  NDPRBreachReport,      // Breach report form
  NDPRPrivacyPolicy,     // Policy generator wizard
  NDPRDPIA,              // DPIA questionnaire
  NDPRComplianceDashboard, // Visual compliance dashboard
} from '@tantainnovative/ndpr-toolkit/presets';
```

### Components — compound pattern

Full control over layout without rebuilding logic.

```tsx
import { Consent } from '@tantainnovative/ndpr-toolkit/consent';

<Consent.Provider options={options} onSave={handleSave}>
  <div className="my-layout">
    <Consent.OptionList />
    <div className="flex gap-2">
      <Consent.AcceptButton />
      <Consent.RejectButton />
    </div>
  </div>
</Consent.Provider>
```

### Hooks — headless

Stateful hooks for every module. Bring your own UI entirely.

```tsx
import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks';

const { hasConsent, acceptAll, rejectAll, shouldShowBanner } = useConsent({ options });
```

### Core — no React

Pure TypeScript utilities and validators. Works anywhere — Node, edge functions, Deno.

```ts
import { validateConsent, getComplianceScore } from '@tantainnovative/ndpr-toolkit/core';
```

### Adapters — pluggable storage

Swap where consent (and other state) is stored without changing any component code.

```ts
import { apiAdapter, localStorageAdapter, cookieAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
```

---

## Pluggable Storage

Every stateful component accepts an `adapter` prop. Built-in adapters ship out of the box.

```ts
import {
  localStorageAdapter,    // default for browsers
  sessionStorageAdapter,  // cleared on tab close
  cookieAdapter,          // server-readable cookies
  apiAdapter,             // HTTP endpoint (any backend)
  memoryAdapter,          // in-process, good for SSR / tests
  composeAdapters,        // fan-out writes to multiple stores
} from '@tantainnovative/ndpr-toolkit/adapters';
```

**localStorage (default browser behaviour):**
```tsx
<NDPRConsent adapter={localStorageAdapter('ndpr_consent')} />
```

**API endpoint:**
```tsx
<NDPRConsent adapter={apiAdapter('/api/consent', {
  headers: { Authorization: `Bearer ${token}` },
})} />
```

**Write to API + keep a local cache:**
```tsx
import { composeAdapters, apiAdapter, localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

<NDPRConsent adapter={composeAdapters(
  apiAdapter('/api/consent'),
  localStorageAdapter('ndpr_consent'),
)} />
```

**Cookie (server-readable, for SSR consent gating):**
```tsx
<NDPRConsent adapter={cookieAdapter({ name: 'ndpr_consent', maxAge: 365 * 24 * 60 * 60 })} />
```

---

## Compliance Score

`getComplianceScore()` evaluates your posture across all 8 NDPA modules and returns a 0–100 score with rated gaps and prioritised recommendations.

```ts
import { getComplianceScore } from '@tantainnovative/ndpr-toolkit/core';

const report = getComplianceScore({
  consent: {
    hasConsentMechanism: true,
    hasPurposeSpecification: true,
    hasWithdrawalMechanism: true,
    hasMinorProtection: false,
    consentRecordsRetained: true,
  },
  dsr: {
    hasRequestMechanism: true,
    supportsAccess: true,
    supportsRectification: false,
    supportsErasure: false,
    supportsPortability: false,
    supportsObjection: false,
    maxResponseDays: 30,
  },
  // ... other modules
});

console.log(report.score);         // e.g. 74
console.log(report.rating);        // "good" | "excellent" | "needs-work" | "critical"
console.log(report.recommendations[0].priority); // "critical"
```

Render a live dashboard:

```tsx
import { NDPRComplianceDashboard } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRComplianceDashboard
  input={complianceInput}
  showRecommendations
  maxRecommendations={5}
/>
```

---

## Backend Integration

### CLI scaffolder

Scaffold a complete wiring for your stack in seconds:

```bash
npx @tantainnovative/create-ndpr
```

Detects Next.js (App Router or Pages Router) or Express, prompts for your ORM (Prisma / Drizzle / none), and generates API routes, schema, and layout files — no manual copy-pasting.

### Backend recipes

`@tantainnovative/ndpr-recipes` is a reference implementation with production-ready patterns:

| Recipe | What you get |
|--------|-------------|
| `prisma/schema.prisma` | All 5 NDPA compliance tables |
| `src/adapters/prisma-consent.ts` | Prisma `StorageAdapter<ConsentSettings>` |
| `src/adapters/drizzle-consent.ts` | Drizzle `StorageAdapter<ConsentSettings>` |
| `src/nextjs/app-router/` | Consent, DSR, Breach, ROPA, compliance route handlers |
| `src/express/` | Full NDPR router with consent, DSR, breach, ROPA routes |
| `src/nextjs/app-router/middleware.ts` | Next.js consent gate middleware |

Copy the files you need into your project. [Browse the recipes →](https://github.com/tantainnovative/ndpr-toolkit/tree/main/packages/ndpr-recipes)

---

## All 8 Modules

| Module | Import path | NDPA reference | Key exports |
|--------|-------------|----------------|-------------|
| Consent Management | `/consent` | Sections 25–26 | `ConsentBanner`, `ConsentManager`, `Consent.*`, `useConsent` |
| Data Subject Rights | `/dsr` | Part IV §29–36 | `DSRRequestForm`, `DSRDashboard`, `useDSR` |
| DPIA | `/dpia` | Sections 38–39 | `DPIAQuestionnaire`, `DPIAReport`, `useDPIA` |
| Breach Notification | `/breach` | Section 40 | `BreachReportForm`, `BreachRiskAssessment`, `useBreach` |
| Privacy Policy | `/policy` | Sections 27–28 | `PolicyGenerator`, `PolicyPreview`, `PolicyExporter` |
| Lawful Basis | `/lawful-basis` | Section 25 | `LawfulBasisTracker`, `useLawfulBasis` |
| Cross-Border Transfers | `/cross-border` | Part VI §41–45 | `CrossBorderTransferManager`, `useCrossBorderTransfer` |
| ROPA | `/ropa` | Section 28(2) | `ROPAManager`, `useROPA`, `exportROPAToCSV` |

---

## Styling & Customization

Every component supports three modes:

**Default (Tailwind CSS):**
```tsx
<ConsentBanner options={options} onSave={handleSave} />
```

**Override specific sections:**
```tsx
<ConsentBanner
  options={options}
  onSave={handleSave}
  classNames={{
    root: "fixed bottom-0 inset-x-0 bg-white shadow-xl p-6",
    acceptButton: "bg-green-600 text-white px-6 py-2 rounded-full",
  }}
/>
```

**Fully unstyled (BYO CSS — Bootstrap, CSS Modules, vanilla):**
```tsx
<ConsentBanner
  options={options}
  onSave={handleSave}
  unstyled
  classNames={{
    root: "my-consent-banner",
    acceptButton: "btn btn-primary",
  }}
/>
```

Each component exports its `ClassNames` TypeScript interface for autocomplete. Full reference in the [docs](https://ndprtoolkit.com.ng/docs/styling).

---

## Available Import Paths

| Path | What you get | Dependencies |
|------|-------------|--------------|
| `.` (default) | Everything | All peer deps |
| `/core` | Types + utility functions | `tslib` |
| `/hooks` | React hooks for all 8 modules | `react` |
| `/presets` | Zero-config preset components | `react`, Radix, Tailwind |
| `/adapters` | Storage adapters | none |
| `/consent` | Consent components + `Consent.*` compound API | `react`, Radix, Tailwind |
| `/dsr` | DSR components + hook | `react`, Radix, Tailwind |
| `/dpia` | DPIA components + hook | `react`, Radix, Tailwind |
| `/breach` | Breach components + hook | `react`, Radix, Tailwind |
| `/policy` | Policy components + hook | `react`, Radix, Tailwind, `jspdf` |
| `/lawful-basis` | Lawful basis component + hook | `react`, Radix, Tailwind |
| `/cross-border` | Cross-border component + hook | `react`, Radix, Tailwind |
| `/ropa` | ROPA component + hook | `react`, Radix, Tailwind |
| `/unstyled` | Unstyled consent primitives | `react` |

---

## NDPA 2023 Overview

The **Nigeria Data Protection Act (NDPA) 2023** replaced the NDPR 2019 and established the **Nigeria Data Protection Commission (NDPC)** as the independent regulatory body.

| Aspect | NDPR (2019) | NDPA (2023) |
|--------|-------------|-------------|
| Legal status | NITDA regulation | Act of the National Assembly |
| Regulator | NITDA | NDPC (independent commission) |
| Enforcement | Limited | Independent investigation and penalty powers |
| Data subject rights | 6 rights | 8 rights (added information + automated decision-making) |
| Cross-border transfers | Basic provisions | Comprehensive framework with adequacy decisions |
| Breach notification | 72 hours to NITDA | 72 hours to NDPC (Section 40) |
| DPIA | Recommended | Required for high-risk processing (Section 38) |

---

## TypeScript

Written in TypeScript. All types are exported:

```typescript
import type {
  // Consent
  ConsentOption, ConsentSettings,
  // DSR
  DSRRequest, DSRType, DSRStatus,
  // DPIA
  DPIAQuestion, DPIASection, DPIAResult,
  // Breach
  BreachReport, BreachCategory, RiskAssessment,
  // Policy
  PolicySection, PolicyTemplate, PrivacyPolicy,
  // Lawful Basis
  LawfulBasis, ProcessingActivity,
  // Cross-Border
  CrossBorderTransfer, TransferMechanism,
  // ROPA
  ProcessingRecord, RecordOfProcessingActivities,
  // Compliance score
  ComplianceInput, ComplianceReport, ComplianceRating,
  // Storage
  StorageAdapter,
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
