# @tantainnovative/ndpr-toolkit

**Compliance infrastructure for the Nigeria Data Protection Act (NDPA) 2023**

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/mr-tanta/ndpr-toolkit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mr-tanta/ndpr-toolkit/actions/workflows/ci.yml)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@tantainnovative/ndpr-toolkit)](https://bundlephobia.com/package/@tantainnovative/ndpr-toolkit)

v5 ships **zero-config presets**, **pluggable storage adapters**, **compound components**, **structured-error validators**, a **compliance score engine**, and **seven shipped locales** (en, yo, ig, ha, pcm, ar, fr) — eight production-ready modules covering consent, data subject rights, DPIA, breach notification, privacy policies, lawful basis, cross-border transfers, and ROPA. **5.2–5.5 add an NDPC GAID 2025 layer**: a DCPMI designation classifier, a Compliance Audit Returns scheduler, a Section 40 / Article 33 breach-notification checker (wired live into `BreachReportForm`), and an **`ndpr audit` CLI** that gates compliance in CI.

**[Documentation](https://ndprtoolkit.com.ng)** | **[Live Demos](https://ndprtoolkit.com.ng/ndpr-demos)** | **[npm](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)** | **[Blog](https://ndprtoolkit.com.ng/blog)** | **[Latest Release](https://github.com/mr-tanta/ndpr-toolkit/releases/latest)**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/nextjs-app)
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/nextjs-app)

> **What's new in 5.7.3:** The docs site now includes an approved **Used by** section for teams shipping NDPA compliance with the toolkit, the release workflow uses explicit serial/coverage test scripts, and the maintainer docs now clearly separate the Next.js site source from the published package source.
>
> **What's new in 5.5:** The **`ndpr audit` CLI** scores a compliance config against the toolkit engine (compliance score + GAID 2025 DCPMI / CAR / breach checks) and exits non-zero on failure — a drop-in CI gate. The same logic is exported as `runNdprAudit` / `formatNdprAuditReport` from `/server`. See the [audit CLI guide](https://ndprtoolkit.com.ng/docs/guides/audit-cli).
>
> **NDPC GAID 2025 utilities (5.2–5.4):** `classifyDCPMI` (DCPMI designation tier + fee estimate), `generateComplianceAuditReturn` (CAR initial-audit + annual filing schedule), and `assessBreachNotification` (Section 40 / Article 33 notification completeness) — each pure, React-free, and exposed as a hook. `BreachReportForm` now renders a live NDPC-notification readiness panel as it's filled in.
>
> **Earlier highlights:** Structured-result validators are the only shape — `{ field, code, message }[]` with stable codes; uniform `onAdd` / `onUpdate` / `onArchive` callbacks; `NDPRDPIA.onResult(result)` (5.0). Arabic + French locales with RTL-correct CSS (4.1.0). React 17 dropped; `^18 || ^19` (4.0.0). Full history in the [CHANGELOG](https://github.com/mr-tanta/ndpr-toolkit/blob/main/CHANGELOG.md).

> **Legal source transparency:** See [Legal Basis & Citations](https://ndprtoolkit.com.ng/docs/guides/legal-basis-and-citations) for NDPA 2023 module references, NDPC GAID 2025 DCPMI/CAR utility references, and audit CLI boundaries, plus the linked governance policy for regulatory changes.
>
> **Naming note:** The npm package remains `@tantainnovative/ndpr-toolkit` for compatibility and search continuity, but current legal positioning is **NDPA Toolkit** / **NDPA 2023 compliance**. See [NDPR vs NDPA Naming](https://ndprtoolkit.com.ng/docs/guides/ndpr-vs-ndpa-naming).
>
> **Compliance updates:** Watch [GitHub Releases](https://github.com/mr-tanta/ndpr-toolkit/releases) or npm version updates for compliance-impacting changes. Release notes call out NDPA/NDPC/GAID rule changes separately from features, bug fixes, and docs. The toolkit is implementation support, not legal advice; verify current NDPC guidance before relying on outputs for regulated filings or audit evidence.

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/main/public/screenshots/hero.png" alt="NDPA Toolkit — NDPA Compliance Made Beautiful" width="800" />
</p>

---

## Quickstart

Two files. Full NDPA-compliant consent with no backend.

**`app/layout.tsx`**
```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import '@tantainnovative/ndpr-toolkit/styles';

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

That's it — `NDPRConsent` defaults to `localStorageAdapter`, so consent persists across page loads with zero backend code.

**Want server-side persistence?** Pass any `StorageAdapter`:

```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import { cookieAdapter, apiAdapter, composeAdapters, localStorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

// Server-readable cookie (best for SSR consent gating)
<NDPRConsent adapter={cookieAdapter('ndpr_consent', { expires: 180 })} />

// Or POST to your own backend
<NDPRConsent adapter={apiAdapter('/api/consent')} />

// Or both — fan-out writes
<NDPRConsent adapter={composeAdapters(
  apiAdapter('/api/consent'),
  localStorageAdapter('ndpr_consent'),
)} />
```

The full SSR pattern (cookie read server-side → banner hydrates already-resolved, no flash) is in the [Server-Side Storage guide](https://ndprtoolkit.com.ng/docs/guides/server-side-storage).

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/main/public/screenshots/consent-demo.png" alt="Consent Management Demo — interactive consent banner with state inspector" width="800" />
  <br />
  <em>Interactive consent demo with configurable position, theme, storage, and real-time state inspector</em>
</p>

---

## Used by

The toolkit is used by Nigerian software, operations, education, laboratory, and compliance teams, including:

- [Perkflow Inc](https://perkflow.io)
- [Finlab Nigeria](https://ndprtoolkit.com.ng/case-studies#finlab-nigeria-privacy-readiness)
- [Burtech Products](https://burtechproducts.com)
- [Chibek Instruments](https://chibek.com)
- NGtaxkit
- [Tanta Innovative](https://ndprtoolkit.com.ng/case-studies#tanta-innovative-internal-compliance)

Only teams approved for public listing are included here and on the docs site. See the
[case studies and implementation stories](https://ndprtoolkit.com.ng/case-studies) for
approved proof assets; they describe implementation paths and modules used without claiming
legal certification, regulator approval, or unapproved business metrics.

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

The recommended entry for backend and serverless contexts. Pure validators, generators, scoring, locales, adapters, the aggregate compliance audit (`runNdprAudit`), and the GAID 2025 utilities (`classifyDCPMI`, `generateComplianceAuditReturn`, `assessBreachNotification`) — no React in the import graph. Safe to call from a Next.js Server Component, Edge Function, NestJS controller, or Cloudflare Worker.

```ts
import {
  validateConsentStructured,
  validateDsrSubmissionStructured,
  generatePolicyText,
  exportHTML,
  getComplianceScore,
} from '@tantainnovative/ndpr-toolkit/server';
```

Build-output guard tests assert this entry never carries a `"use client"` directive and never imports `react` — the RSC-safety contract is structurally enforced.

### Core — types + utilities + Provider

Adds the `NDPRProvider` React Context on top of `/server`'s pure surface. Use when you want types and validators alongside the provider in the same import.

```ts
import { NDPRProvider, validateConsentStructured, getComplianceScore } from '@tantainnovative/ndpr-toolkit/core';
```

### Adapters — pluggable storage

Swap where consent (and other state) is stored without changing any component code.

```ts
import { apiAdapter, localStorageAdapter, cookieAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
```

---

## When NOT to use this toolkit

The toolkit is React-first, NDPA-specific, and built for product engineers shipping a compliant app — not a generic cookie-banner library. Pick something else if:

- **You're not on React.** No Vue / Svelte / Angular bindings exist. The `/server` entry exposes framework-agnostic validators and the compliance-score engine — usable from any Node runtime — but the UI components are React-only.
- **You only need a cookie banner**, with no DSR portal, breach reporting, DPIA, ROPA, or compliance scoring. A purpose-built consent library (Iubenda, OneTrust, Cookiebot, Osano) is a better fit and will integrate with your CMP / TCF setup. The toolkit can do the banner alone, but you'd be paying for surface you don't use.
- **Your compliance regime is GDPR / CCPA-primary** and you don't operate under the Nigeria Data Protection Act 2023. The validators, statutory deadlines, and section citations are NDPA-specific. (NDPA + GDPR overlap a lot in practice; the toolkit doesn't pretend to be a GDPR product.)
- **You need an enterprise consent-management platform** with audit trails, marketing-team UIs, regional CMP exports, and a vendor SLA. That's a different product category.

The toolkit is what we wished existed when building Nigerian SaaS apps in 2025 and need NDPA components that don't fight the rest of the stack. If that's your shape, read on.

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
<NDPRConsent adapter={cookieAdapter('ndpr_consent', { expires: 180 })} />
```

`expires` defaults to **180 days** (since 3.10.5). NDPA Section 26 doesn't pin a number, but 6 months is the common practice for non-essential cookies and matches what regulators have published elsewhere — long enough to avoid daily re-prompting, short enough that consent stays meaningful.

---

## Structured-Result Validators

Every validator returns a typed `{ field, code, message }[]` so client and server code can branch on stable, locale-independent codes — not regex-matched English strings.

**Next.js Route Handler:**
```ts
import { validateDsrSubmissionStructured } from '@tantainnovative/ndpr-toolkit/server';

export async function POST(req: Request) {
  const { valid, errors, data } = validateDsrSubmissionStructured(await req.json());
  if (!valid) {
    return Response.json({ errors }, { status: 422 });
    // errors: Array<{ field: 'dataSubject.email', code: 'email_invalid_format', message: '...' }>
  }
  // `data` is the narrowed `DsrSubmissionPayload`
  await dsrStore.create(data);
  return Response.json({ ok: true }, { status: 201 });
}
```

**Client-side branching:**
```ts
import { validateConsentStructured } from '@tantainnovative/ndpr-toolkit';

const { valid, errors } = validateConsentStructured(settings);
const stale = errors.find((e) => e.code === 'consent_stale');
if (stale) showRefreshBanner();
```

Each validator's emitted `code` values are documented in its JSDoc (and listed in the [CHANGELOG 5.0 entry](https://github.com/mr-tanta/ndpr-toolkit/blob/main/CHANGELOG.md#500-2026-05-27)). The legacy string-returning shapes (`validateConsent`, `validateDsrSubmission`, `formatDSRRequest`, `validateConsentOptions`) were removed in 5.0 — see the [4.1 → 5.0 migration guide](https://ndprtoolkit.com.ng/docs/guides/migrating-4-1-to-5-0) if you're upgrading.

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

## DCPMI Designation & Compliance Audit Returns

Two pure utilities for the NDPC **General Application and Implementation Directive (GAID) 2025** registration regime — no React, safe to run server-side or in CI. DCPMI here is a designation/classification utility, not a ninth NDPA module or a substitute for DPCO-led registration.

`classifyDCPMI()` derives an organisation's **Data Controller/Processor of Major Importance** designation tier from the number of data subjects processed in a six-month window, with its annual registration fee estimate and filing obligations:

```ts
import { classifyDCPMI } from '@tantainnovative/ndpr-toolkit/core';

const result = classifyDCPMI({ dataSubjectsInSixMonths: 6200 });

result.tier;                              // "UHL"  (>5,000 → Ultra High Level)
result.isDCPMI;                           // true
result.annualFeeNGN;                      // 250000
result.registration.renewsAnnually;       // false (UHL/EHL register once, file CAR yearly)
result.compliance.auditReturnsAnnual;     // true
result.compliance.initialAuditWithinMonths; // 15
```

| Tier | Data subjects / 6 months | Annual fee (₦) |
|------|--------------------------|----------------|
| **UHL** — Ultra High Level | more than 5,000 | 250,000 |
| **EHL** — Extra High Level | 1,000 – 5,000 | 100,000 |
| **OHL** — Ordinary High Level | 200 – 999 | 10,000 |
| below 200 | — | not a DCPMI by volume |

Thresholds and fees are the September 2025 GAID baseline and are configurable (`classifyDCPMI(input, { thresholds, fees })`) since the NDPC revises them. Pass `isDesignated: true` for an organisation the Commission has separately listed — it resolves to the `'listed'` tier regardless of volume.

`generateComplianceAuditReturn()` schedules a DCPMI's **Compliance Audit Returns** — the initial audit due within 15 months of commencement, then the next annual filing deadline (NDPC baseline 31 March, filed via the NDPC Information Management Portal / NIMP):

```ts
import { generateComplianceAuditReturn } from '@tantainnovative/ndpr-toolkit/core';

const car = generateComplianceAuditReturn({
  commencementDate: '2025-01-15',
  asOf: '2026-03-21',
  tier: 'UHL',
});

car.schedule.initialAuditDueDate;     // "2026-04-15"  (commencement + 15 months)
car.schedule.nextFilingDeadline;      // "2026-03-31"
car.status.daysUntilNextDeadline;     // 10
car.status.initialAuditDue;           // false

// NDPC deadlines shift — the 2026 filing was extended to 30 May:
generateComplianceAuditReturn(
  { commencementDate: '2025-01-15', asOf: '2026-04-01', tier: 'UHL' },
  { deadlineOverrides: { 2026: '2026-05-30' } },
).schedule.nextFilingDeadline;        // "2026-05-30"
```

Both ship as memoised hooks for React UIs — `useDCPMI(input, options?)` and `useComplianceAuditReturn(input, options?)` from `@tantainnovative/ndpr-toolkit/hooks`.

> These utilities compute registration tiers and filing dates from the GAID 2025 baseline; they are not legal advice. The NDPC revises metrics and extends deadlines — verify against current NDPC guidance before relying on them.

---

## Breach Notification Completeness

`assessBreachNotification()` checks a `BreachReport` against the **NDPA 2023 Section 40** breach-notification duty as detailed by **NDPC GAID 2025 Article 33** — the mandated content of the notification to the Commission, the 72-hour deadline from discovery, and the data-subject communication owed when the risk is high.

```ts
import { assessBreachNotification } from '@tantainnovative/ndpr-toolkit/core';

const result = assessBreachNotification(breachReport, {
  asOf: Date.now(),
  assessment: riskAssessment, // optional — high risk triggers the S.40(3) data-subject duty
});

result.complete;             // false until every mandated item is present
result.completeness;         // 0–100 across applicable items
result.missing;              // ["Steps taken to reduce the risk of harm", ...]
result.timing.deadline;      // discoveredAt + 72h
result.timing.hoursRemaining;// time left to notify the NDPC (negative once overdue)
result.timing.overdue;       // true once the 72-hour window has passed
result.dataSubjectCommunicationRequired; // true on high risk (S.40(3))
result.recommendations;      // actionable, each citing its provision
```

The content checklist (`notificationToCommission`) maps each item to its source — **GAID 2025 Art. 33(5)(a)–(h)** for the description, timing, data involved, risk-of-harm, numbers at risk, mitigation, notification steps, and contact point; **NDPA S. 40(2)** for the data-subject categories and record count. Late filings are flagged with `requiresDelayJustification` (the NDPC permits phased reporting where full details aren't yet available). Also available as the memoised `useBreachNotificationAssessment(report, options?)` hook from `/hooks`.

> A documentation-completeness aid, not legal advice — verify against current NDPC guidance.

---

## Cookie Scanner

`scanCookies()` audits the cookies **actually present** against the cookies you've **declared**, surfacing undeclared cookies that put you out of step with your cookie notice (**NDPA 2023 S.25–26** / **NDPC GAID 2025** — consent must be specific and informed). It's pure and DOM-optional: pass a `cookieString` (a `Cookie:` header server-side, or a fixture) or let it read `document.cookie` in the browser.

```ts
import { scanCookies } from '@tantainnovative/ndpr-toolkit/core'; // or /server

const scan = scanCookies(
  [{ name: 'sid', category: 'necessary', provider: 'App', purpose: 'Login session' }],
  { cookieString: document.cookie }, // omit in the browser to read it automatically
);

scan.complete;     // false while any undeclared cookie is present
scan.undeclared;   // cookies on the page you didn't declare — the compliance gap
scan.identified;   // undeclared, but the built-in registry knows them (_ga → Google Analytics, …)
scan.unknown;      // undeclared and unidentifiable
scan.byCategory;   // present cookies grouped by resolved category
```

A built-in `KNOWN_COOKIES` registry recognises common third-party cookies (Google Analytics/Ads, Meta, Hotjar, Microsoft Clarity, LinkedIn, Stripe, HubSpot, TikTok, Intercom, …) so even undeclared cookies are usually identified with a provider and likely category; extend it via `knownCookies` or disable it with `useKnownRegistry: false`. Your own declarations always take precedence. Also available as the client-side `useCookieScan(declared?, options?)` hook from `/hooks`, which scans on mount and returns a stable `rescan()`.

`ConsentBanner` can surface this directly: pass `showCookieScan` (plus `declaredCookies`) and the customize view renders a "Cookies on this page" panel that flags undeclared cookies live — a transparency/self-audit aid for your visitors and DPO.

```tsx
<ConsentBanner
  options={options}
  onSave={save}
  showCookieScan
  declaredCookies={[{ name: 'sid', category: 'necessary', provider: 'App' }]}
/>
```

> A compliance-discovery aid, not legal advice — verify against current NDPC guidance.

---

## Compliance Audit CLI

The package ships an `ndpr` binary. `ndpr audit` scores a compliance config against the toolkit's engine — the compliance score plus the GAID 2025 DCPMI, CAR, and breach-notification checks — and **exits non-zero when the audit fails**, so you can drop it into CI as a compliance gate.

```bash
# with the toolkit installed in your project, the `ndpr` bin is on your PATH:
npx ndpr audit --init        # writes ndpr.audit.json
npx ndpr audit               # run the audit (exit 1 on failure)
npx ndpr audit --min-score 80
npx ndpr audit --json        # machine-readable result

# standalone (no install), use the scoped package name:
npx @tantainnovative/ndpr-toolkit audit --init
```

```text
NDPA 2023 Compliance Audit
Generated 2026-05-31

Compliance score: 82/100 (good) — minimum 70

✓ Overall compliance score
    82/100 (good); minimum 70.
! Minor (child) data protection controls (Section 31)
    Implement age-verification and parental-consent controls for processing data of minors.
✓ DCPMI designation (GAID 2025)
    Not a Data Controller/Processor of Major Importance by volume.

2 passed, 3 warning(s), 0 failed
Verdict: PASS
```

The config is `{ minScore?, compliance, dcpmi?, car?, breaches? }`. Critical NDPA gaps and overdue breach notifications hard-fail the audit; high-priority gaps and approaching CAR deadlines warn. In a GitHub Action:

```yaml
- run: npx ndpr audit --min-score 80
```

The same logic is exposed programmatically — `runNdprAudit(input, options?)` and `formatNdprAuditReport(result)` from `@tantainnovative/ndpr-toolkit/server` (pure, React-free). See [the audit CLI guide](https://ndprtoolkit.com.ng/docs/guides/audit-cli).

---

## Backend Integration

### CLI scaffolder

Scaffold a complete wiring for your stack in seconds:

```bash
npx @tantainnovative/create-ndpr
```

Detects Next.js (App Router or Pages Router) or Express, prompts for your ORM (Prisma / Drizzle / none), and generates API routes, schema, and layout files — no manual copy-pasting.

### Backend recipes

`@tantainnovative/ndpr-recipes` is the companion npm package for production backend templates. Install it as a pinned source package, copy the files you need into your app, and adapt them to your auth, tenancy, database, and audit-log conventions:

```bash
pnpm add @tantainnovative/ndpr-toolkit
pnpm add -D @tantainnovative/ndpr-recipes
```

See the [Production Recipes guide](https://ndprtoolkit.com.ng/docs/guides/production-recipes) for the recommended handoff path.

| Recipe | What you get |
|--------|-------------|
| `prisma/schema.prisma` | NDPA compliance tables for consent, DSR, breach, ROPA, DPIA, and audit logs |
| `src/adapters/prisma-consent.ts` | Prisma `StorageAdapter<ConsentSettings>` |
| `src/adapters/drizzle-consent.ts` | Drizzle `StorageAdapter<ConsentSettings>` |
| `src/nextjs/app-router/` | Consent, DSR, Breach, DPIA, ROPA, compliance route handlers; consent, breach, DPIA, and ROPA validate before writes |
| `src/express/` | Full NDPA compliance router with consent, DSR, DPIA, breach, ROPA routes; breach, DPIA, and ROPA validate before writes |
| `src/nextjs/app-router/middleware.ts` | Next.js consent gate middleware |

Copy from `node_modules/@tantainnovative/ndpr-recipes` for a pinned version, or [browse the recipes on GitHub](https://github.com/mr-tanta/ndpr-toolkit/tree/main/packages/ndpr-recipes).

The runnable examples cover the first production handoff paths:

| Example | What it demonstrates |
|---------|----------------------|
| [`examples/nextjs-app`](./examples/nextjs-app) | App Router consent endpoint that validates with `validateConsentStructured`, stores the current consent snapshot, and appends consent audit events. |
| [`examples/dsr-backend-reference`](./examples/dsr-backend-reference) | DSR intake endpoint with server validation, Prisma persistence, reference IDs, 30-day target dates, and best-effort confirmation email. |

The ROPA recipes now enforce the toolkit's production completeness checks before persistence. Include controller details, lawful-basis justification, data-subject categories, recipients, retention, security measures, and `dpiaReference` when `dpiaRequired` is true.

The breach recipes validate incident intake dates, reporter email, affected systems, data types, and lifecycle update values before persistence. Create/detail responses include `ndpcReadiness` from `assessBreachNotification` so DPO workflows can see missing GAID 2025 Article 33 notification content and 72-hour deadline status.

The DPIA recipes now provide maintained Next.js and Express persistence routes for `DPIARecord`, with validation for project metadata, `dpiaData`, risk level, score, status, and audit-log writes before records are created, updated, or deleted.

---

## Live Demos

Every module has an interactive demo. No signup, no setup — try them instantly.

<p align="center">
  <a href="https://ndprtoolkit.com.ng/ndpr-demos">
    <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/main/public/screenshots/demos-overview.png" alt="8 interactive live demos — zero setup required" width="800" />
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/main/public/screenshots/dsr-demo.png" alt="Data Subject Rights — 8 rights with request tracking" width="400" />
  <img src="https://raw.githubusercontent.com/mr-tanta/ndpr-toolkit/main/public/screenshots/breach-demo.png" alt="Breach Notification — 72-hour countdown with step-by-step workflow" width="400" />
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

## Internationalization

Wrap your app in `<NDPRProvider locale={...}>` and every shipped component picks up the translation:

```tsx
import { NDPRProvider, arabicLocale, frenchLocale } from '@tantainnovative/ndpr-toolkit/core';

<NDPRProvider locale={arabicLocale}>
  <App />
</NDPRProvider>
```

Seven locales ship out of the box:

| Locale | Export | Notes |
|---|---|---|
| English | `defaultLocale` | Default |
| Yoruba | `yorubaLocale` | |
| Igbo | `igboLocale` | |
| Hausa | `hausaLocale` | |
| Nigerian Pidgin | `pidginLocale` | |
| Arabic | `arabicLocale` | Modern Standard; RTL-aware. Set `dir="rtl"` on a parent and `styles.css` mirrors correctly (logical properties as of 4.1). |
| French | `frenchLocale` | Francophone West African register; uses GDPR-equivalent French terms where they carry meaning. |

Override individual strings via `mergeLocale(base, partial)`. Component prop overrides (`title`, `description`, etc.) still win over the provider locale — the resolution order is **prop → provider locale → English default**.

---

## All 8 Modules

| Module | Import path | NDPA reference | Key exports |
|--------|-------------|----------------|-------------|
| Consent Management | `/consent` | Sections 25–26 | `ConsentBanner`, `ConsentManager`, `Consent.*`, `useConsent` |
| Data Subject Rights | `/dsr` | Part VI §34–38 | `DSRRequestForm`, `DSRDashboard`, `useDSR` |
| DPIA | `/dpia` | Section 28 | `DPIAQuestionnaire`, `DPIAReport`, `useDPIA` |
| Breach Notification | `/breach` | Section 40 | `BreachReportForm` (live readiness panel), `BreachRiskAssessment`, `useBreach`, `useBreachNotificationAssessment` |
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
| `/server` | **Pure validators, generators, scoring, the `ndpr audit` engine + GAID 2025 utilities, locales, adapters, types — zero React** | `tslib` | **Yes** |
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
| `/policy` | Policy components + hook | `react`, `jspdf` ≥ 4.2.1, `docx` (both optional) | No |
| `/lawful-basis` | Lawful basis component + hook | `react` | No |
| `/lawful-basis/lite` | Read-only `LawfulBasisTrackerLite` — ~65% smaller than `/lawful-basis` | `react` | No |
| `/cross-border` | Cross-border component + hook | `react` | No |
| `/cross-border/lite` | Read-only `CrossBorderTransferManagerLite` — ~89% smaller (skips the 624-row adequacy dataset) | `react` | No |
| `/ropa` | ROPA component + hook | `react` | No |
| `/ropa/lite` | Read-only `ROPAManagerLite` — ~64% smaller than `/ropa` | `react` | No |
| `/unstyled` | All published components with `unstyled` defaulted to `true` | `react` | No |
| `/styles` | Default CSS stylesheet — `import "@tantainnovative/ndpr-toolkit/styles"` once in your app entry | none | N/A |

[^core]: `/core` re-exports the React `NDPRProvider` for backward compatibility. For strictly server-side imports use `/server` — it carries the same pure validators with no React surface.

### PDF / DOCX export peers

`PolicyExporter` (and `exportPDF` / `exportDOCX` from `/policy`) load `jspdf` / `docx` via dynamic `import()` only when you actually export — they're optional peers, so consumers who don't export documents never install them. If you do export to PDF:

```bash
npm install jspdf@^4.2.1 --omit=optional      # npm
pnpm add jspdf@^4.2.1 --no-optional           # pnpm
```

Use **jspdf ≥ 4.2.1** — earlier versions (≤ 4.2.0) carry advisories `GHSA-67pg-wm7f-q7fj` and `GHSA-cjw8-79x6-5cj4`, fixed in 4.2.1. The `--omit=optional` / `--no-optional` flag drops jspdf's own optional deps (`canvg`, `core-js`, `dompurify`, `html2canvas`); the toolkit's PDF export uses only core jsPDF text/vector APIs, so it works without them and you get a leaner, dependency-flag-free install.

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
