# NDPR Toolkit Architecture

> Internal architecture reference for `@tantainnovative/ndpr-toolkit` v3.x.
> Covers the module system, entry points, key patterns, and build pipeline.

---

## Table of Contents

1. [Module System](#1-module-system)
2. [Entry Points](#2-entry-points)
3. [Storage Adapter Pattern](#3-storage-adapter-pattern)
4. [Compound Component Pattern](#4-compound-component-pattern)
5. [i18n System](#5-i18n-system)
6. [Compliance Score Engine](#6-compliance-score-engine)
7. [Build Pipeline](#7-build-pipeline)

---

## 1. Module System

The toolkit is organized into four layers. Each layer depends only on the layers
below it, never upward.

```
+------------------------------------------------------------------+
|                          PRESETS                                  |
|  Zero-config, NDPA-compliant components with sensible defaults.  |
|  import from: @tantainnovative/ndpr-toolkit/presets               |
+------------------------------------------------------------------+
        |  uses
        v
+------------------------------------------------------------------+
|                        COMPONENTS                                |
|  Configurable UI components (ConsentBanner, DSRRequestForm, ...) |
|  Also includes compound component variants (Consent.Provider).   |
|  import from: @tantainnovative/ndpr-toolkit/consent  (etc.)       |
+------------------------------------------------------------------+
        |  uses
        v
+------------------------------------------------------------------+
|                          HOOKS                                   |
|  React hooks for state management (useConsent, useDSR, ...).     |
|  Require React but have no UI opinion.                           |
|  import from: @tantainnovative/ndpr-toolkit/hooks                 |
+------------------------------------------------------------------+
        |  uses
        v
+------------------------------------------------------------------+
|                           CORE                                   |
|  Pure types + utility functions. Zero React dependency.          |
|  Works in any JS/TS environment (server, CLI, edge).             |
|  import from: @tantainnovative/ndpr-toolkit/core                  |
+------------------------------------------------------------------+
```

### When to use each layer

| Layer      | Use when...                                                     |
|------------|-----------------------------------------------------------------|
| Presets    | You want a working NDPA-compliant UI in under 5 lines of code. |
| Components | You need full control over props, styling, and composition.     |
| Hooks      | You are building custom UI but want managed compliance state.   |
| Core       | You need types or utilities in a non-React context (API route, server action, CLI script). |

---

## 2. Entry Points

The package exposes **14 entry points** via the `exports` field in `package.json`.
Each resolves to CJS (`.js`), ESM (`.mjs`), and declaration (`.d.ts`) files.

```
@tantainnovative/ndpr-toolkit
|
|-- .              (index)        Everything: all components, hooks, utilities, types
|-- /core                         Types + pure utilities only (zero React)
|-- /hooks                        All React hooks + useComplianceScore
|-- /consent                      Consent components, hook, compound, + adapter types
|-- /dsr                          DSR components, hook, compound
|-- /dpia                         DPIA components + hook
|-- /breach                       Breach components + hook
|-- /policy                       Policy generator components + hook
|-- /lawful-basis                 Lawful basis tracker + hook
|-- /cross-border                 Cross-border transfer manager + hook
|-- /ropa                         ROPA manager + hook
|-- /adapters                     All storage adapter factories + compose
|-- /presets                      Zero-config preset components
|-- /unstyled                     Headless/unstyled component variants
|-- /styles                       CSS file (animations.css)
```

### Dependency tree between entry points

```
  /presets -----> /consent, /dsr, /dpia, /breach, /policy,
  |               /lawful-basis, /cross-border, /ropa
  |
  /consent -----> /hooks (useConsent), /core (types, validators),
  |               /adapters (StorageAdapter)
  |
  /hooks -------> /core (types, utilities)
  |
  /core --------> (no dependencies -- pure TS)
  |
  /adapters ----> (no dependencies -- pure TS)
```

Domain-specific entry points (`/consent`, `/dsr`, `/dpia`, etc.) each bundle
their own components + hook + types so you can import only what you need for
tree-shaking.

---

## 3. Storage Adapter Pattern

All hooks that persist data accept a pluggable `StorageAdapter<T>` interface,
allowing any backend (browser storage, cookies, HTTP API, custom) without
changing application code.

### The interface

```ts
// src/adapters/types.ts
interface StorageAdapter<T = unknown> {
  /** Load persisted data. Called once on hook mount. */
  load(): T | null | Promise<T | null>;

  /** Persist data. Called on every state change. */
  save(data: T): void | Promise<void>;

  /** Clear persisted data. Called on reset. */
  remove(): void | Promise<void>;
}
```

Every method may return synchronously or asynchronously. Hooks handle both paths:
sync results are applied immediately; promises are awaited with cancellation
guards.

### Built-in adapters

| Factory                | Storage backend  | Sync/Async | Notes                                         |
|------------------------|------------------|------------|-----------------------------------------------|
| `localStorageAdapter`  | `localStorage`   | Sync       | Default. SSR-safe (returns `null` on server). |
| `sessionStorageAdapter`| `sessionStorage`  | Sync       | Same API, session-scoped.                     |
| `cookieAdapter`        | `document.cookie`| Sync       | Accepts `CookieAdapterOptions` (path, maxAge, sameSite, etc.). |
| `memoryAdapter`        | In-memory Map    | Sync       | Useful for tests and SSR.                     |
| `apiAdapter`           | HTTP `fetch`     | Async      | `GET` to load, `POST` to save, `DELETE` to remove. Accepts custom headers. |

### Creating a custom adapter

```ts
import type { StorageAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

function redisAdapter<T>(key: string): StorageAdapter<T> {
  return {
    async load() {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    },
    async save(data) {
      await redis.set(key, JSON.stringify(data));
    },
    async remove() {
      await redis.del(key);
    },
  };
}
```

### The compose pattern

`composeAdapters` lets you write to multiple backends at once. The primary
adapter is the source of truth for `load()`; secondary adapters receive
fire-and-forget `save`/`remove` calls with error swallowing.

```ts
import {
  localStorageAdapter,
  apiAdapter,
  composeAdapters,
} from '@tantainnovative/ndpr-toolkit/adapters';

const adapter = composeAdapters(
  localStorageAdapter('consent'),   // primary: fast reads
  apiAdapter('/api/consent'),       // secondary: server backup
);
```

```
          composeAdapters(primary, ...secondaries)
          +-----------------------------------------+
          |                                         |
 load() --+---> primary.load()                      |
          |     (secondaries ignored for reads)     |
          |                                         |
 save() --+---> primary.save(data)                  |
          |     secondaries.forEach(s => s.save())  |
          |     (errors logged, not thrown)          |
          |                                         |
 remove()-+---> primary.remove()                    |
          |     secondaries.forEach(s => s.remove())|
          +-----------------------------------------+
```

### How hooks consume adapters

Each hook (e.g. `useConsent`) accepts an optional `adapter` prop. If omitted,
it falls back to `localStorageAdapter` with a domain-specific key
(`ndpr_consent`). The legacy `storageOptions` prop is still supported but
deprecated.

```
useConsent({ options, adapter? })
  |
  +--> adapter provided?
  |      YES --> use it directly
  |      NO  --> storageOptions provided?
  |               YES --> resolve to localStorage / sessionStorage / cookie
  |               NO  --> localStorageAdapter('ndpr_consent')
```

---

## 4. Compound Component Pattern

Domain modules (consent, DSR, etc.) expose a **compound component** API
alongside the traditional monolithic components. This gives consumers full
layout control while the Provider manages all state.

### Structure (using Consent as example)

```
Consent (namespace object)
  |
  +-- Consent.Provider       Wraps children in ConsentCompoundContext
  |     |                    Internally calls useConsent() hook
  |     |
  |     +-- Consent.OptionList      Renders consent option checkboxes
  |     +-- Consent.AcceptButton    Calls acceptAll()
  |     +-- Consent.RejectButton    Calls rejectAll()
  |     +-- Consent.SaveButton      Calls updateConsent()
  |     +-- Consent.Banner          Pre-built banner (legacy)
  |     +-- Consent.Settings        Pre-built settings panel (legacy)
  |     +-- Consent.Storage         Pre-built storage viewer (legacy)
```

### How it works

1. `Consent.Provider` receives `options`, an optional `adapter`, and optional
   callbacks. It calls `useConsent()` internally and publishes the return value
   plus `options` onto a React context (`ConsentCompoundContext`).

2. Sub-components call `useConsentCompound()` to read from that context. They
   render minimal, unstyled markup by default.

3. Consumers compose the pieces freely:

```tsx
import { Consent } from '@tantainnovative/ndpr-toolkit/consent';

function MyBanner() {
  return (
    <Consent.Provider options={consentOptions} adapter={myAdapter}>
      <div className="my-banner">
        <h2>Cookie Settings</h2>
        <Consent.OptionList />
        <div className="actions">
          <Consent.RejectButton />
          <Consent.AcceptButton />
        </div>
      </div>
    </Consent.Provider>
  );
}
```

### Adding a new compound component

1. Create a context file (`context.ts`) exporting a React context and a
   `useXxxCompound()` hook.
2. Create a Provider component that calls the domain hook and publishes state
   onto the context.
3. Create sub-components that consume `useXxxCompound()`.
4. Create a `compound.ts` barrel that exports both named pieces and a namespace
   object (`export const Xxx = { Provider, ... }`).

---

## 5. i18n System

All user-facing strings in toolkit components are localisable through the
`NDPRProvider` context.

### How it works

```
NDPRProvider({ locale?: NDPRLocale })
  |
  +--> mergeLocale(partial)
  |      |
  |      +--> Deep-merges partial overrides with defaultLocale (English)
  |      +--> Returns a fully-populated locale object (no undefined keys)
  |
  +--> Stores merged result in NDPRContext
  |
  +--> Components call useNDPRLocale() to read strings
```

### Locale type

The `NDPRLocale` interface (in `src/types/locale.ts`) groups strings by domain:

```
NDPRLocale
  +-- consent?    (title, description, acceptAll, rejectAll, ...)
  +-- dsr?        (title, description, submitRequest, fullName, ...)
  +-- breach?     (title, description, submitReport, ...)
  +-- dpia?       (title, next, previous, complete, progress)
  +-- policy?     (title, generate, preview, export, ...)
  +-- compliance? (score, excellent, good, needsWork, critical, ...)
  +-- common?     (loading, error, save, cancel, delete, edit, ...)
```

Every field at every level is **optional**. The `mergeLocale()` function
ensures that any missing key falls back to the English default from
`src/locales/en.ts`.

### Adding a new language

1. Create a new file, e.g. `src/locales/fr.ts`, exporting a partial
   `NDPRLocale` with translated strings.
2. Consumers pass it to `NDPRProvider`:

```tsx
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import frLocale from './locales/fr';

<NDPRProvider locale={frLocale}>
  {children}
</NDPRProvider>
```

3. There is no registration step. Any partial object conforming to `NDPRLocale`
   is accepted. Missing keys fall back to English automatically.

### Using locale strings in components

```tsx
import { useNDPRLocale } from '@tantainnovative/ndpr-toolkit/core';

function MyComponent() {
  const locale = useNDPRLocale();
  return <h1>{locale.consent.title}</h1>;
  //          ^^^^^^^^^^^^^^^^^^^^^^^^
  //          Always defined -- never undefined thanks to mergeLocale
}
```

---

## 6. Compliance Score Engine

The compliance score engine (`src/utils/compliance-score.ts`) evaluates an
organisation's NDPA compliance posture across **eight modules** and produces a
scored report. It is a pure function with zero React dependency, usable
anywhere.

### Module weights

```
Module          Weight    NDPA Sections
-----------     ------    ------------------------------------------------
consent         20%       Section 25, Section 26
dsr             15%       Sections 34, 35, 36, 37, 38, 39
breach          15%       Section 40
policy          12%       Section 29
dpia            12%       Section 28
lawfulBasis     10%       Section 25(1)
crossBorder      8%       Section 43, Section 44
ropa             8%       Section 30
                -----
Total           100%
```

### Scoring algorithm

```
For each module:
  1. Run the module evaluator to get a list of CheckDefinitions
  2. Each check is either pass (true) or fail (false)
  3. Module score = (passed checks / total checks) * 100
  4. Weighted score = module score * module weight

Overall score = sum of all weighted scores (rounded to integer)
```

### Rating thresholds

```
Score >= 90  -->  "excellent"
Score >= 70  -->  "good"
Score >= 40  -->  "needs-work"
Score <  40  -->  "critical"
```

### Report structure

```
ComplianceReport
  +-- score: number                    (0-100)
  +-- rating: ComplianceRating         (excellent | good | needs-work | critical)
  +-- modules: Record<string, ModuleScore>
  |     +-- name, score, maxScore, weightedScore, ndpaSections, gaps[]
  +-- recommendations: Recommendation[]
  |     +-- module, key, label, priority, effort, recommendation, ndpaSection
  |     +-- Sorted: critical --> high --> medium --> low
  +-- regulatoryReferences: RegulatoryReference[]
  +-- generatedAt: string              (ISO timestamp)
```

### Usage

```ts
import { getComplianceScore } from '@tantainnovative/ndpr-toolkit/core';
import type { ComplianceInput } from '@tantainnovative/ndpr-toolkit/core';

const input: ComplianceInput = {
  consent: { hasConsentMechanism: true, /* ... */ },
  dsr:     { hasRequestMechanism: true, /* ... */ },
  // ... all 8 modules
};

const report = getComplianceScore(input);
// report.score     --> 72
// report.rating    --> "good"
// report.recommendations --> [{priority: "critical", ...}, ...]
```

The hooks layer also provides `useComplianceScore()` (from `/hooks`) which
wraps this in a React hook with memoisation.

---

## 7. Build Pipeline

The toolkit uses [tsup](https://tsup.egoist.dev/) (esbuild-based) for
bundling, with a separate `tsc` step for declaration files.

### Build command

```bash
pnpm build        # runs: tsup && pnpm build:types
```

### tsup configuration (root tsup.config.ts)

```
Entry points:  14 files (index, core, hooks, consent, dsr, dpia, breach,
               policy, lawful-basis, cross-border, ropa, adapters, presets,
               unstyled)

Output formats: CJS (.js) + ESM (.mjs)
Target:         ES2015
Splitting:      Enabled (shared chunks across entry points)
Sourcemaps:     Enabled
Tree-shaking:   Enabled
Minification:   Enabled
Clean:          Enabled (wipes dist/ before build)
```

### External dependencies

The following are marked external and not bundled:

```
react, react-dom, jspdf, docx, @radix-ui/react-label,
@radix-ui/react-slot, @radix-ui/react-switch, @radix-ui/react-tabs,
lucide-react, class-variance-authority, clsx, tailwind-merge
```

### "use client" banner

Every output JS file is prefixed with `"use client"` via esbuild's banner
option. This ensures compatibility with React Server Components in Next.js
App Router -- all toolkit components are explicitly marked as client
components.

```ts
esbuildOptions(options) {
  options.banner = { js: '"use client"' };
}
```

### Declaration files

tsup's built-in `dts: true` generates `.d.ts` files for each entry point.
The package-level `tsup.config.ts` handles this. The inner
`packages/ndpr-toolkit/tsup.config.ts` sets `dts: false` and relies on a
separate `tsc -p tsconfig.lib.json` step instead (`pnpm build:types`).

### CSS handling

The `onSuccess` hook copies `src/styles/animations.css` to `dist/styles.css`.
This file is exposed via the `./styles` export in `package.json`.

### Output structure

```
dist/
  +-- index.js          (CJS)
  +-- index.mjs         (ESM)
  +-- index.d.ts        (types)
  +-- core.js / .mjs / .d.ts
  +-- hooks-entry.js / .mjs / .d.ts
  +-- consent.js / .mjs / .d.ts
  +-- dsr.js / .mjs / .d.ts
  +-- dpia.js / .mjs / .d.ts
  +-- breach.js / .mjs / .d.ts
  +-- policy.js / .mjs / .d.ts
  +-- lawful-basis-entry.js / .mjs / .d.ts
  +-- cross-border-entry.js / .mjs / .d.ts
  +-- ropa-entry.js / .mjs / .d.ts
  +-- adapters.js / .mjs / .d.ts
  +-- presets.js / .mjs / .d.ts
  +-- unstyled.js / .mjs / .d.ts
  +-- styles.css
  +-- chunk-*.mjs       (shared code via splitting)
```

### Package resolution

The `exports` map in `package.json` ensures bundlers resolve the correct file:

```json
"./consent": {
  "types":   "./dist/consent.d.ts",
  "import":  "./dist/consent.mjs",
  "require": "./dist/consent.js"
}
```

The `typesVersions` field provides fallback resolution for older TypeScript
versions that do not support the `exports` field.
