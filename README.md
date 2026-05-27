# @tantainnovative/ndpr-toolkit

**Compliance infrastructure for the Nigeria Data Protection Act (NDPA) 2023**

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/mr-tanta/ndpr-toolkit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mr-tanta/ndpr-toolkit/actions/workflows/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tantainnovative/ndpr-toolkit)](https://bundlephobia.com/package/@tantainnovative/ndpr-toolkit)

v3 ships **zero-config presets**, **pluggable storage adapters**, **compound components**, and a **compliance score engine** — eight production-ready modules covering consent, data subject rights, DPIA, breach notification, privacy policies, lawful basis, cross-border transfers, and ROPA.

**[Documentation](https://ndprtoolkit.com.ng)** | **[Live Demos](https://ndprtoolkit.com.ng/ndpr-demos)** | **[npm](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)** | **[Blog](https://ndprtoolkit.com.ng/blog)** | **[v3.10.3 Release](https://github.com/mr-tanta/ndpr-toolkit/releases/tag/v3.10.3)**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/nextjs-app)
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/nextjs-app)

> **What's new in 3.10.x:** Typed theming via `<NDPRThemeProvider>`, a `/headless` subpath alias of `/hooks` for headless-UI consumers, and a production-grade DSR backend reference at `examples/dsr-backend-prod/` (Prisma + Resend behind no-infra shims). New docs guides: [theming](https://ndprtoolkit.com.ng/docs/guides/theming), [headless](https://ndprtoolkit.com.ng/docs/guides/headless), [production-dsr-backend](https://ndprtoolkit.com.ng/docs/guides/production-dsr-backend).
>
> **Upgrading from 3.7.x?** See the [3.7 → 3.10 upgrade guide](https://ndprtoolkit.com.ng/docs/guides/upgrading-3-7-to-3-10) — fully additive, no API breaks. Full changelog on [GitHub](https://github.com/mr-tanta/ndpr-toolkit/blob/main/CHANGELOG.md).

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.10.3/public/screenshots/hero.png" alt="NDPA Toolkit — NDPA Compliance Made Beautiful" width="800" />
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
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.10.3/public/screenshots/consent-demo.png" alt="Consent Management Demo — interactive consent banner with state inspector" width="800" />
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

## Bun quickstart

Bun is a first-class runtime for the toolkit. Both common React app shapes work without extra config.

### Bun + Vite + React

```bash
bun create vite@latest my-ndpr-app --template react-ts
cd my-ndpr-app
bun install
bun add @tantainnovative/ndpr-toolkit
```

```tsx
// src/App.tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets/consent';
import '@tantainnovative/ndpr-toolkit/styles';

export default function App() {
  return (
    <>
      <NDPRConsent
        options={[
          { id: 'essential', label: 'Essential', description: 'Required for the site to function', required: true, purpose: 'Site operation' },
          { id: 'analytics', label: 'Analytics', description: 'Anonymous usage measurement', required: false, purpose: 'Product analytics' },
          { id: 'marketing', label: 'Marketing', description: 'Personalised offers and ads', required: false, purpose: 'Marketing communications' },
        ]}
      />
      <main className="p-6">
        <h1 className="text-3xl font-semibold">My NDPA-compliant app</h1>
      </main>
    </>
  );
}
```

```bash
bun dev
```

Vite is client-only by default — no extra wiring needed. The toolkit's preset components ship with the `"use client"` directive already injected.

### Bun + Next.js 15 (App Router)

```bash
bun create next-app@latest my-ndpr-app --typescript --app --tailwind
cd my-ndpr-app
bun add @tantainnovative/ndpr-toolkit
```

The consent banner is a stateful client component. Mount it from a small client wrapper so the rest of your layout can stay in RSC:

```tsx
// app/ConsentRoot.tsx
'use client';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets/consent';

export function ConsentRoot() {
  return (
    <NDPRConsent
      options={[
        { id: 'essential', label: 'Essential', description: 'Required for the site to function', required: true, purpose: 'Site operation' },
        { id: 'analytics', label: 'Analytics', description: 'Anonymous usage measurement', required: false, purpose: 'Product analytics' },
        { id: 'marketing', label: 'Marketing', description: 'Personalised offers and ads', required: false, purpose: 'Marketing communications' },
      ]}
    />
  );
}
```

```tsx
// app/layout.tsx
import '@tantainnovative/ndpr-toolkit/styles';
import { ConsentRoot } from './ConsentRoot';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConsentRoot />
        {children}
      </body>
    </html>
  );
}
```

```bash
bun dev
```

You don't need to manually mark the import with `"use client"` from `app/layout.tsx` — the preset module already ships the directive in its bundled output, so React Server Components import it cleanly via the client wrapper. For RSC-safe, zero-React imports use `/server` or `/core` instead.

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
    <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.10.3/public/screenshots/demos-overview.png" alt="8 interactive live demos — zero setup required" width="800" />
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.10.3/public/screenshots/dsr-demo.png" alt="Data Subject Rights — 8 rights with request tracking" width="400" />
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/v3.10.3/public/screenshots/breach-demo.png" alt="Breach Notification — 72-hour countdown with step-by-step workflow" width="400" />
</p>

<p align="center">
  <em>Left: Data Subject Rights portal with 8 NDPA rights. Right: Breach notification with 72-hour NDPC deadline countdown.</em>
</p>

### Open any module in your browser (zero install)

Each module ships a minimal Next.js scaffold you can fork in StackBlitz or CodeSandbox. One click → working app demonstrating just that module:

| Module | NDPA | Open in StackBlitz | Open in CodeSandbox |
|---|---|---|---|
| **Ecommerce starter (full app)** | §25–27, §34–38 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/ecommerce-starter) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/ecommerce-starter) |
| Consent | §26 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/consent) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/consent) |
| DSR | §34 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/dsr) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/dsr) |
| DPIA | §28 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/dpia) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/dpia) |
| Breach | §40 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/breach) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/breach) |
| Policy | §27 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/policy) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/policy) |
| Lawful Basis | §25 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/lawful-basis) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/lawful-basis) |
| Cross-Border | §41–43 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/cross-border) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/cross-border) |
| RoPA | §29 | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/ropa) | [![Open](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/ropa) |

Or open the [all-in-one example](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/nextjs-app) that demos every module in a single app.

### SSR-safe consent scaffolds

Cookie-bridged consent that hydrates without a flash. Each scaffold reads the `ndpr-consent` cookie on the server, seeds the banner's `show` prop, then lets the browser `cookieAdapter` take over. See the [Server-Side Storage guide](https://ndprtoolkit.com.ng/docs/guides/server-side-storage) for the pattern.

| Framework | Path | Open in StackBlitz |
|---|---|---|
| Next.js App Router | [`examples/ssr/nextjs-app-router`](./examples/ssr/nextjs-app-router) | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/ssr/nextjs-app-router) |
| Remix | [`examples/ssr/remix`](./examples/ssr/remix) | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/ssr/remix) |
| Astro | [`examples/ssr/astro`](./examples/ssr/astro) | [![Open](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/ssr/astro) |

---

## All 8 Modules

| Module | Import path | NDPA reference | Key exports |
|--------|-------------|----------------|-------------|
| Consent Management | `/consent` | Sections 25–26 | `ConsentBanner`, `ConsentManager`, `Consent.*`, `useConsent` |
| Data Subject Rights | `/dsr` | Part VI §34–38 | `DSRRequestForm`, `DSRDashboard`, `useDSR` |
| DPIA | `/dpia` | Section 28 | `DPIAQuestionnaire`, `DPIAReport`, `useDPIA` |
| Breach Notification | `/breach` | Section 40 | `BreachReportForm`, `BreachRiskAssessment`, `useBreach` |
| Privacy Policy | `/policy` | Section 27 | `PolicyGenerator`, `PolicyPreview`, `PolicyExporter` |
| Lawful Basis | `/lawful-basis` | Section 25 | `LawfulBasisTracker`, `useLawfulBasis` |
| Cross-Border Transfers | `/cross-border` | Part VIII §41–43 | `CrossBorderTransferManager`, `useCrossBorderTransfer` |
| ROPA | `/ropa` | Section 29 | `ROPAManager`, `useROPA`, `exportROPAToCSV` |

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

**Theme via typed JS object — `NDPRThemeProvider` (new in 3.10.0):**
```tsx
import { NDPRThemeProvider, type NDPRTheme } from '@tantainnovative/ndpr-toolkit';

const theme: NDPRTheme = {
  colors: { primary: '22 163 74', primaryHover: '21 128 61' },
  radius: { base: '0.75rem' },
  font: { sans: '"Inter", system-ui, sans-serif' },
};

<NDPRThemeProvider theme={theme}>
  <App />
</NDPRThemeProvider>
```
The provider wraps children in a single `div` with the `--ndpr-*` variables set inline. Every `NDPRTheme` field is optional and maps 1:1 to a CSS variable defined in the stylesheet — unset fields fall through to defaults. Same end result as raw CSS overrides; pick what fits your codebase. Full reference in [the theming guide](https://ndprtoolkit.com.ng/docs/guides/theming).

Light + dark mode auto-switch via `prefers-color-scheme`, plus an explicit opt-in via `data-theme="dark"` or `.dark` on any ancestor (or `mode: 'dark'` on `NDPRThemeProvider`).

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
| `/headless` | **Alias of `/hooks`** — identical exports under a more discoverable name (3.10.0) | `react` | No |
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
| `/lawful-basis/lite` | Read-only `LawfulBasisTrackerLite` — ~65% smaller than `/lawful-basis` | `react` | No |
| `/cross-border` | Cross-border component + hook | `react` | No |
| `/cross-border/lite` | Read-only `CrossBorderTransferManagerLite` — ~89% smaller (skips the 624-row adequacy dataset) | `react` | No |
| `/ropa` | ROPA component + hook | `react` | No |
| `/ropa/lite` | Read-only `ROPAManagerLite` — ~64% smaller than `/ropa` | `react` | No |
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

   If your page only needs to *display* records (no Add / Edit / Archive / CSV export), reach for the new **Lite** variants from `/lawful-basis/lite`, `/cross-border/lite`, and `/ropa/lite` instead — they save ~65%, 89%, and 64% respectively. See [Lite vs Full managers](https://ndprtoolkit.com.ng/docs/guides/lite-vs-full).

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
| DPIA | Recommended | Required for high-risk processing (Section 28) |

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
