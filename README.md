# @tantainnovative/ndpr-toolkit

**Compliance infrastructure for the Nigeria Data Protection Act (NDPA) 2023**

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-1098%20passing-brightgreen.svg)](#)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tantainnovative/ndpr-toolkit)](https://bundlephobia.com/package/@tantainnovative/ndpr-toolkit)

v3 ships **zero-config presets**, **pluggable storage adapters**, **compound components**, and a **compliance score engine** — eight production-ready modules covering consent, data subject rights, DPIA, breach notification, privacy policies, lawful basis, cross-border transfers, and ROPA.

**[Documentation](https://ndprtoolkit.com.ng)** | **[Live Demos](https://ndprtoolkit.com.ng/ndpr-demos)** | **[npm](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)** | **[Blog](https://ndprtoolkit.com.ng/blog)** | **[v3.4.0 Release](https://github.com/mr-tanta/ndpr-toolkit/releases/tag/v3.4.0)**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/nextjs-app)
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/nextjs-app)

> **What's new in 3.4.0:** components now ship styled defaults via a real stylesheet — Tailwind is no longer required. Add `import "@tantainnovative/ndpr-toolkit/styles";` once in your app entry. Plus a new `/server` subpath for RSC-safe pure-logic imports (validators, generators, scoring) with zero React in the import graph. Backward-compatible at the component API level. Full notes on the [release page](https://github.com/mr-tanta/ndpr-toolkit/releases/tag/v3.4.0).

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.5.2/public/screenshots/hero.png" alt="NDPA Toolkit — NDPA Compliance Made Beautiful" width="800" />
</p>

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

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.5.2/public/screenshots/consent-demo.png" alt="Consent Management Demo — interactive consent banner with state inspector" width="800" />
  <br />
  <em>Interactive consent demo with configurable position, theme, storage, and real-time state inspector</em>
</p>

---

## Install

Pick your package manager:

```bash
# pnpm
pnpm add @tantainnovative/ndpr-toolkit

# Bun
bun add @tantainnovative/ndpr-toolkit

# npm
npm install @tantainnovative/ndpr-toolkit

# Yarn
yarn add @tantainnovative/ndpr-toolkit
```

Add the stylesheet import once in your app entry so components render with default styles:

```ts
// app/layout.tsx (Next.js App Router) or src/main.tsx (Vite/CRA/Bun)
import "@tantainnovative/ndpr-toolkit/styles";
```

The stylesheet is opinionated but token-driven — override any `--ndpr-*` CSS custom property to theme. Skip this import only if you're using `/unstyled` to bring your own design system.

Install UI peer dependencies (only needed if you use the higher-level Radix-based components from `/presets`):

```bash
# pnpm
pnpm add @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-slot lucide-react tailwind-merge clsx class-variance-authority

# Bun
bun add @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-slot lucide-react tailwind-merge clsx class-variance-authority
```

Or scaffold instantly with the CLI:

```bash
# Recommended (idiomatic):
npm create ndpr@latest

# Equivalent — pick whichever fits your muscle memory:
npx create-ndpr
npx @tantainnovative/create-ndpr
pnpm create ndpr
bun create ndpr
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

<Consent.Provider options={options} onChange={handleSave}>
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

### Server — strictly RSC-safe, zero React

The recommended entry for backend and serverless contexts. Pure validators, generators, scoring, locales, and adapters — no React in the import graph. Safe to call from a Next.js Server Component, Edge Function, NestJS controller, or Cloudflare Worker.

```ts
import {
  validateConsent,
  generatePolicyText,
  exportHTML,
  getComplianceScore,
} from '@tantainnovative/ndpr-toolkit/server';
```

Build-output guard tests assert this entry never carries a `"use client"` directive and never imports `react` — the RSC-safety contract is structurally enforced.

### Core — types + utilities + Provider

Adds the `NDPRProvider` React Context on top of `/server`'s pure surface. Use when you want types and validators alongside the provider in the same import.

```ts
import { NDPRProvider, validateConsent, getComplianceScore } from '@tantainnovative/ndpr-toolkit/core';
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
<NDPRConsent adapter={cookieAdapter('ndpr_consent', { expires: 365 })} />
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
    responseTimelineDays: 30,
  },
  dpia: { conductedForHighRisk: true, documentedRisks: true, mitigationMeasures: true },
  breach: { hasNotificationProcess: true, notifiesWithin72Hours: true, hasRiskAssessment: true, hasRecordKeeping: true },
  policy: { hasPrivacyPolicy: true, isPubliclyAccessible: true, lastUpdated: '2026-01-01', coversAllSections: true },
  lawfulBasis: { documentedForAllProcessing: true, hasLegitimateInterestAssessment: false },
  crossBorder: { hasTransferMechanisms: true, adequacyAssessed: true, ndpcApprovalObtained: false },
  ropa: { maintained: true, includesAllProcessing: true, lastReviewed: '2026-01-01' },
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

## Live Demos

Every module has an interactive demo. No signup, no setup — try them instantly.

<p align="center">
  <a href="https://ndprtoolkit.com.ng/ndpr-demos">
    <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.5.2/public/screenshots/demos-overview.png" alt="8 interactive live demos — zero setup required" width="800" />
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.5.2/public/screenshots/dsr-demo.png" alt="Data Subject Rights — 8 rights with request tracking" width="400" />
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.5.2/public/screenshots/breach-demo.png" alt="Breach Notification — 72-hour countdown with step-by-step workflow" width="400" />
</p>

<p align="center">
  <em>Left: Data Subject Rights portal with 8 NDPA rights. Right: Breach notification with 72-hour NDPC deadline countdown.</em>
</p>

### Open any module in your browser (zero install)

Each module ships a minimal Next.js scaffold you can fork in StackBlitz or CodeSandbox. One click → working app demonstrating just that module:

| Module | NDPA | Open in StackBlitz | Open in CodeSandbox |
|---|---|---|---|
| Consent | §26 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/consent) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/consent) |
| DSR | §34 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/dsr) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/dsr) |
| DPIA | §28 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/dpia) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/dpia) |
| Breach | §40 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/breach) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/breach) |
| Policy | §27 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/policy) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/policy) |
| Lawful Basis | §25 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/lawful-basis) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/lawful-basis) |
| Cross-Border | §41–43 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/cross-border) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/cross-border) |
| RoPA | §29 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/ropa) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/ropa) |

Or open the [all-in-one example](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/nextjs-app) that demos every module in a single app.

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

As of 3.4.0, components ship semantic BEM-style class names (`.ndpr-consent-banner`, `.ndpr-form-field__input`, etc.) backed by a real stylesheet. **Tailwind is no longer required** — the package works in any host so long as you import the stylesheet once.

**Default — works in any host:**
```ts
// Once in your app entry
import "@tantainnovative/ndpr-toolkit/styles";
```
```tsx
<ConsentBanner options={options} onSave={handleSave} variant="card" position="bottom" />
```

**Theme via CSS custom properties:**
```css
/* Override any --ndpr-* token at :root, [data-theme="dark"], or scoped to a parent. */
:root {
  --ndpr-primary: 22 163 74;          /* RGB triplet — green-600 */
  --ndpr-radius: 1rem;
  --ndpr-font-sans: "Inter", system-ui, sans-serif;
}
```

Light + dark mode auto-switch via `prefers-color-scheme`, plus an explicit opt-in via `data-theme="dark"` or `.dark` on any ancestor.

**Per-instance override via slot map:**
```tsx
<ConsentBanner
  options={options}
  onSave={handleSave}
  classNames={{
    root: "my-consent-banner",
    acceptButton: "btn btn-primary",
    rejectButton: "btn btn-secondary",
  }}
/>
```

**Bring your own design system entirely:**
```tsx
import { ConsentBanner } from '@tantainnovative/ndpr-toolkit/unstyled';

<ConsentBanner options={options} onSave={handleSave} classNames={{ /* yours */ }} />
```
The `/unstyled` entry defaults `unstyled` to `true`, stripping every `.ndpr-*` class so your CSS applies unfiltered. ARIA, focus management, and `data-ndpr-component` attributes are preserved (those are part of the contract, not styling).

Each component exports its `ClassNames` TypeScript interface for autocomplete. Full reference in the [docs](https://ndprtoolkit.com.ng/docs/guides/styling-customization).

---

## Available Import Paths

| Path | What you get | Dependencies | RSC-safe |
|------|-------------|--------------|:--------:|
| `.` (default) | Everything | `react`, optional Radix peers for `/presets` | No |
| `/server` | **Pure validators, generators, scoring, locales, adapters, types — zero React** | `tslib` | **Yes** |
| `/core` | Types, utility functions, NDPRProvider | `react`[^core] | Partial |
| `/hooks` | React hooks for all 8 modules | `react` | No |
| `/presets` | All zero-config preset components (barrel) | `react`, Radix peers | No |
| `/presets/consent` | **Just `NDPRConsent`** — narrower barrel for bundle size | `react`, Radix peers | No |
| `/presets/dsr` | **Just `NDPRSubjectRights`** | `react`, Radix peers | No |
| `/presets/policy` | **Just `NDPRPrivacyPolicy`** | `react`, Radix peers | No |
| `/adapters` | Storage adapters (localStorage, sessionStorage, cookie, api, memory, composeAdapters) | none | Yes |
| `/consent` | ConsentBanner, ConsentManager, `Consent.*` compound API, useConsent | `react` | No |
| `/dsr` | DSR components + hook | `react` | No |
| `/dpia` | DPIA components + hook | `react` | No |
| `/breach` | Breach components + hook | `react` | No |
| `/policy` | Policy components + hook | `react`, `jspdf`, `docx` (optional) | No |
| `/lawful-basis` | Lawful basis component + hook | `react` | No |
| `/cross-border` | Cross-border component + hook | `react` | No |
| `/ropa` | ROPA component + hook | `react` | No |
| `/unstyled` | All published components with `unstyled` defaulted to `true` | `react` | No |
| `/styles` | Default CSS stylesheet — `import "@tantainnovative/ndpr-toolkit/styles"` once in your app entry | none | N/A |

[^core]: `/core` re-exports the React `NDPRProvider` for backward compatibility. For strictly server-side imports use `/server` — it carries the same pure validators with no React surface.

### Bundle size guidance

The toolkit is published with `sideEffects: ["*.css"]`, so a modern bundler (Vite, Next.js / Webpack, esbuild, Bun) will tree-shake unused exports. A few practical rules to keep your bundle small:

1. **Prefer narrow subpaths over the root.** `import { useConsent } from '@tantainnovative/ndpr-toolkit/hooks'` is tighter than the same import from `.`. The root entry has more transitive exports and bundlers don't always trace them perfectly.

2. **Use the per-preset subpaths when you only need one preset.** `import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets/consent'` is ~4 KB; the full `/presets` barrel is ~8 KB. Same for `/presets/dsr` and `/presets/policy`.

3. **The 3 manager components are intentionally heavy** (each is ~50 KB src — full table + filter + modal + wizard UIs):
   - `LawfulBasisTracker` (from `/lawful-basis`)
   - `ROPAManager` (from `/ropa`)
   - `CrossBorderTransferManager` (from `/cross-border`)

   If your app only needs the hook (e.g. you're rendering ROPA records inside your own admin UI), import from `/hooks` instead of the feature subpath — the hook chunk doesn't drag the manager component into your bundle.

4. **`/server` carries zero React.** For Server Actions, Route Handlers, scheduled jobs, or compliance-score computation in CI, prefer `/server` and you'll pay no React-tree cost.

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
