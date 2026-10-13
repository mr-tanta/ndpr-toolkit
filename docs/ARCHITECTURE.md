# NDPR Toolkit Architecture

> Internal architecture reference for `@tantainnovative/ndpr-toolkit` v6.x.
> Covers the module system, entry points, key patterns, and build pipeline.

---

## Table of Contents

1. [Source Roots](#1-source-roots)
2. [Module System](#2-module-system)
3. [Entry Points](#3-entry-points)
4. [Storage Adapter Pattern](#4-storage-adapter-pattern)
5. [Compound Component Pattern](#5-compound-component-pattern)
6. [i18n System](#6-i18n-system)
7. [Compliance Score Engine](#7-compliance-score-engine)
8. [Build Pipeline](#8-build-pipeline)

---

## 1. Source Roots

The repository has two TypeScript source trees with different ownership:

| Path | Purpose |
|------|---------|
| `packages/ndpr-toolkit/src/` | Library source that is bundled by `pnpm build:lib` and published to npm. Put public package components, hooks, validators, adapters, presets, styles, and package tests here. |
| `src/` | Next.js documentation/demo site source. Put app routes, marketing pages, docs UI, blog rendering, and site-only components here. |

The root `package.json` is the published npm manifest. The inner
`packages/ndpr-toolkit/package.json` is private and exists only for local
package context; do not treat it as the publish source of truth.

`tsup.config.ts` builds the package from `packages/ndpr-toolkit/src/`, with
one compatibility entry for root `src/unstyled.ts`. The docs site imports the
built/package APIs where possible, but site-only UI belongs under root `src/`.

---

## 2. Module System

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

## 3. Entry Points

The package exposes **23 subpaths** via the `exports` field in `package.json`:
22 JavaScript entry points, each resolving to CJS (`.js`), ESM (`.mjs`), and
declaration (`.d.ts` / `.d.mts`) files, plus `./styles`, which resolves to
`dist/styles.css` (with a one-line `styles.d.ts` stub so the import
type-checks). The 22 JavaScript entries are exactly the `entry` map in
`tsup.config.ts`.

```
@tantainnovative/ndpr-toolkit
|
|-- .              (index)        Everything: all components, hooks, utilities, types
|-- /core                         Types + pure utilities only (zero React)
|-- /server                       Server-safe validators, audit helpers, and pure utilities
|-- /hooks                        All React hooks + useComplianceScore
|-- /headless                     Alias for hook/headless workflows
|-- /consent                      Consent components, hook, compound, + adapter types
|-- /dsr                          DSR components, hook, compound
|-- /dpia                         DPIA components + hook
|-- /breach                       Breach components + hook
|-- /policy                       Policy generator components + hook
|-- /lawful-basis                 Lawful basis tracker + hook
|-- /lawful-basis/lite            Read-only lawful-basis display path
|-- /cross-border                 Cross-border transfer manager + hook
|-- /cross-border/lite            Read-only cross-border display path
|-- /ropa                         ROPA manager + hook
|-- /ropa/lite                    Read-only ROPA display path
|-- /adapters                     All storage adapter factories + compose
|-- /presets                      Zero-config preset components
|-- /presets/consent              Consent preset only
|-- /presets/dsr                  DSR preset only
|-- /presets/policy               Privacy-policy preset only
|-- /unstyled                     Headless/unstyled component variants
|-- /styles                       CSS file (styles.css)
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

## 4. Storage Adapter Pattern

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

## 5. Compound Component Pattern

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

## 6. i18n System

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
  +-- lawfulBasis? (title, description)
  +-- crossBorder? (title, description)
  +-- ropa?       (title, description)
  +-- compliance? (score, excellent, good, needsWork, critical, ...)
  +-- common?     (loading, error, save, cancel, delete, edit, ...)
```

Every field at every level is **optional**. The `mergeLocale()` function
ensures that any missing key falls back to the English default from
`src/locales/en.ts`.

### Adding a new language

Seven locales ship in the package under `src/locales/` (`en`, `yo`, `ig`,
`ha`, `pcm`, `ar`, `fr`). Each is re-exported by name from
`src/locales/index.ts` (`defaultLocale`, `yorubaLocale`, ... `frenchLocale`)
and from the `/core` and `/server` entries. To add one to the package: copy
`en.ts` to `<ISO 639-1 code>.ts`, translate in place, and add the re-export
to `src/locales/index.ts`, `core.ts`, and `server.ts`.

Consumers can also supply their own locale without changing the package:

1. Create a file in your app, e.g. `locales/de.ts`, exporting a partial
   `NDPRLocale` with translated strings.
2. Pass it to `NDPRProvider`:

```tsx
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import deLocale from './locales/de';

<NDPRProvider locale={deLocale}>
  {children}
</NDPRProvider>
```

3. There is no registration step. Any partial object conforming to `NDPRLocale`
   is accepted. Missing keys fall back to English automatically.

### Using locale strings in components

```tsx
import { useNDPRLocale } from '@tantainnovative/ndpr-toolkit';

function MyComponent() {
  const locale = useNDPRLocale();
  return <h1>{locale.consent.title}</h1>;
  //          ^^^^^^^^^^^^^^^^^^^^^^^^
  //          Always defined -- never undefined thanks to mergeLocale
}
```

---

## 7. Compliance Score Engine

The compliance score engine (`src/utils/compliance-score.ts`) evaluates an
organisation's NDPA compliance posture across **eight modules** and produces a
scored report. It is a pure function with zero React dependency, usable
anywhere.

### Module weights

```
Module          Weight    NDPA Sections
-----------     ------    ------------------------------------------------
consent         20%       Section 25, Section 26
dsr             15%       Sections 34, 35, 36, 37, 38
breach          15%       Section 40
policy          12%       Section 27
dpia            12%       Section 28
lawfulBasis     10%       Section 25(1)
crossBorder      8%       Section 41, Section 42, Section 43
ropa             8%       Section 24(3); GAID 2025 Art. 13, Art. 52, Sch. 1
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

## 8. Build Pipeline

The toolkit uses [tsup](https://tsup.egoist.dev/) (esbuild-based) for
bundling and for the per-entry declaration files (`dts: true`), followed by
a declaration roll-up step. There is no separate `tsc` step.

### Build command

```bash
pnpm build:lib    # runs: tsup && cp packages/ndpr-toolkit/src/styles.d.ts dist/styles.d.ts && node scripts/rollup-dts.mjs
```

Three steps, in order:

1. `tsup` bundles the 22 entry points and emits their declaration files.
2. `styles.d.ts` is copied into `dist/` so the `./styles` export type-checks.
3. `scripts/rollup-dts.mjs` rolls each entry's declarations into one
   self-contained file (see "Declaration files" below).

`pnpm build` is the docs site (`next build`), not the library.
`prepublishOnly` runs `pnpm build:lib`.

### tsup configuration (root tsup.config.ts)

```
Entry points:  22 (index, core, server, hooks, headless, consent, dsr, dpia,
               breach, policy, lawful-basis, lawful-basis-lite, cross-border,
               cross-border-lite, ropa, ropa-lite, adapters, presets,
               presets-consent, presets-dsr, presets-policy, unstyled)

Output formats: CJS (.js) + ESM (.mjs)
Declarations:   Enabled (dts: true -- .d.ts + .d.mts per entry)
Target:         ES2015
Splitting:      Enabled (shared chunks across entry points)
Sourcemaps:     Off by default (NDPR_SOURCEMAPS=1 enables them)
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

### "use client" directive

Not every output file carries the directive. `tsup.config.ts` splits the
entries into two lists:

- `RSC_SAFE_ENTRIES` (`core`, `server`) must never carry `"use client"`, so
  they can be imported from React Server Components, edge functions, and
  plain Node.
- `CLIENT_ENTRIES` (`index`, `hooks`, `headless`, the domain entries and
  their `-lite` variants, `presets` and the per-preset entries, `unstyled`)
  must carry `"use client"`, so consumers can import components and hooks
  from a Server Component file without writing their own client wrapper.

`adapters` is in neither list (pure TypeScript, no React), so `onSuccess`
leaves it as the bundler emitted it.

The mechanism is two-stage. `esbuildOptions.banner` still sets
`"use client"` as the default for every chunk, but that banner does not
survive minification, so the directive that ships is written by the
`onSuccess` hook after the build:

1. For each RSC-safe entry, strip a leading `"use client"` from
   `dist/<entry>.js` and `dist/<entry>.mjs` if one survived.
2. For each client entry, prepend `"use client";` to `dist/<entry>.js` and
   `dist/<entry>.mjs` unless it is already there.

`packages/ndpr-toolkit/src/__tests__/server-rsc-safety.test.ts` enforces the
RSC-safe side against the built `dist/`: for `/core` and `/server` it walks
the local import graph of both module formats and asserts no `"use client"`,
no `react` / `react-dom` import, and no `NDPRProvider` reference, then loads
each artifact under Node's `react-server` condition.

### Declaration files

tsup's built-in `dts: true` emits one `.d.ts` (CJS) and one `.d.mts` (ESM)
per entry, plus hash-suffixed `chunk-*.d.mts` files for shared internal
types. `scripts/rollup-dts.mjs` then runs `@microsoft/api-extractor` over
each of the 22 entries, replaces the entry's `.d.ts` with a single
self-contained rolled-up file, copies it over the matching `.d.mts`, and
deletes every declaration file that is not one of the 22 entries or
`styles`. The chunk hashes rotate per release, which broke IDE
"go to definition" links; the sweep uses an explicit allowlist rather than a
hash-pattern match because the pattern approach also matched legitimate
hyphenated names such as `lawful-basis-lite.d.ts`.

The root `tsup.config.ts` is the only library build config. The inner
`packages/ndpr-toolkit/package.json` still lists `build` / `build:types`
scripts, but it is private, references a `tsconfig.lib.json` that does not
exist, and is not on the publish path.

### CSS handling

The `onSuccess` hook copies `packages/ndpr-toolkit/src/styles/styles.css` to
`dist/styles.css`, falling back to the legacy `animations.css` only if the
current stylesheet is missing. This file is exposed via the `./styles` export
in `package.json`; `build:lib` copies the matching `styles.d.ts` stub
alongside it.

### Output structure

```
dist/
  +-- index.js          (CJS)
  +-- index.mjs         (ESM)
  +-- index.d.ts        (types, CJS)
  +-- index.d.mts       (types, ESM -- same rolled-up content)
  +-- core.js / .mjs / .d.ts / .d.mts
  +-- server.js / .mjs / .d.ts / .d.mts
  +-- hooks.js / .mjs / .d.ts / .d.mts
  +-- headless.js / .mjs / .d.ts / .d.mts
  +-- consent.js / .mjs / .d.ts / .d.mts
  +-- dsr.js / .mjs / .d.ts / .d.mts
  +-- dpia.js / .mjs / .d.ts / .d.mts
  +-- breach.js / .mjs / .d.ts / .d.mts
  +-- policy.js / .mjs / .d.ts / .d.mts
  +-- lawful-basis.js / .mjs / .d.ts / .d.mts
  +-- lawful-basis-lite.js / .mjs / .d.ts / .d.mts
  +-- cross-border.js / .mjs / .d.ts / .d.mts
  +-- cross-border-lite.js / .mjs / .d.ts / .d.mts
  +-- ropa.js / .mjs / .d.ts / .d.mts
  +-- ropa-lite.js / .mjs / .d.ts / .d.mts
  +-- adapters.js / .mjs / .d.ts / .d.mts
  +-- presets.js / .mjs / .d.ts / .d.mts
  +-- presets-consent.js / .mjs / .d.ts / .d.mts
  +-- presets-dsr.js / .mjs / .d.ts / .d.mts
  +-- presets-policy.js / .mjs / .d.ts / .d.mts
  +-- unstyled.js / .mjs / .d.ts / .d.mts
  +-- styles.css
  +-- styles.d.ts
  +-- chunk-*.js / chunk-*.mjs   (shared code via splitting)
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
