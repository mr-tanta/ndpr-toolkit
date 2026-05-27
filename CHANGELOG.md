# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.11.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.6...v3.11.0) (2026-05-27)

Release 3 of 6 on the post-audit roadmap. Strictly additive — every change here adds to the public surface or fixes a docs lie. Existing consumers keep working without changes.

### Type-export baseline — `*Props` interfaces, adapter ecosystem types, hook return types now reachable

Every component's `Props` interface is now re-exported from `src/index.ts` (the default entry):

`ConsentBannerProps`, `ConsentManagerProps`, `ConsentStorageProps`, `DSRRequestFormProps`, `DSRDashboardProps`, `DSRTrackerProps`, `DPIAQuestionnaireProps`, `DPIAReportProps`, `StepIndicatorProps`, `BreachReportFormProps`, `BreachRiskAssessmentProps`, `BreachNotificationManagerProps`, `RegulatoryReportGeneratorProps`, `PolicyGeneratorProps`, `PolicyPreviewProps`, `PolicyExporterProps`, `LawfulBasisTrackerProps`, `CrossBorderTransferManagerProps`, `ROPAManagerProps`.

Consumers can now type-safely wrap the toolkit's components — e.g.

```ts
import type { ConsentBannerProps, NDPRThemeProvider } from '@tantainnovative/ndpr-toolkit';

function MyConsentBanner(props: ConsentBannerProps & { brand?: string }) { … }
```

Adapter ecosystem types reachable too:
- `ApiAdapterErrorContext<T>`, `ApiAdapterSuccessContext<T>`, `ApiAdapterRetryConfig`, `ApiAdapterMethod` from `/adapters` and root
- `CookieAdapterOptions`, `StorageAdapter<T>` from `/adapters` and root

DSR validator types reachable:
- `DsrSubmissionPayload`, `DsrSubmissionValidationResult`, `ValidateDsrSubmissionOptions` from `/server` (canonical) and root

Hook option/return interfaces promoted to `export interface` and re-exported through `hooks-entry.ts` (auto-flows to `/headless`):
- `UseConsentOptions`/`Return`, `UseDSROptions`, `UseBreachOptions`, `UseDPIAOptions`, `UseLawfulBasisOptions`, `UseCrossBorderTransferOptions`, `UseComplianceScoreOptions`, `UsePrivacyPolicyOptions`.

### JSDoc `@example` blocks on every public hook + adapter

Added `@example` blocks to all 10 public hooks (`useConsent`, `useDSR`, `useBreach`, `useDPIA`, `useLawfulBasis`, `useCrossBorderTransfer`, `usePrivacyPolicy`, `useROPA`, `useAdaptivePolicyWizard`, `useComplianceScore`) and 5 adapters (`cookieAdapter`, `localStorageAdapter`, `sessionStorageAdapter`, `memoryAdapter`, `composeAdapters`). `useComplianceScore` previously had zero JSDoc; full block added (description + `@param` + `@returns` + `@example`).

### Internal: `validateDsrSubmission` type-guard refactor

Replaced the `as string` cast chain in `utils/dsr.ts` with a `isDsrPayloadRaw(payload): payload is DsrPayloadRaw` type guard. External signature unchanged. Safer narrowing; no consumer-visible difference.

### Docs

**9 new component pages** under `src/app/docs/components/`, all wired into the sidebar nav:

- `ndpr-theme-provider`, `ndpr-provider`, `ndpr-dashboard`, `adaptive-policy-wizard`, `policy-page`, `legal-notice` (previously had no dedicated pages)
- `lawful-basis-tracker-lite`, `cross-border-transfer-manager-lite`, `ropa-manager-lite` (Lite variants previously only mentioned inline)

**Fixed broken docs** that taught fictitious symbol names:
- 5 `useDSR()` calls without the required `requestTypes` arg, in `components/data-subject-rights/page.tsx`, `components/hooks/page.tsx`, and `guides/data-subject-requests/page.tsx`. All now show `useDSR({ requestTypes })` with the correct API.
- `getRequestById` → `getRequest`, `filterRequestsByStatus` → `getRequestsByStatus`, `filterRequestsByType` → `getRequestsByType` (the docs were inventing names that don't exist). `deleteRequest` removed — no such function ships.
- `onSubmit` prop on the DSR component page now typed `DSRFormSubmission`, not the fictitious `DSRFormData`.

### README compact pass

- Bumped version refs `v3.10.3` → `v3.11.0` (6 occurrences: header release link + 5 screenshot URL tags).
- Replaced the 3-File Quickstart's throwaway `let store: unknown = null` API route with a clean 2-file quickstart that uses `localStorageAdapter` by default and shows `cookieAdapter` / `apiAdapter` / `composeAdapters` as opt-ins. The throwaway demo always looked unprofessional next to claims of production-readiness.
- New **"When NOT to use this toolkit"** section between Adapters and Pluggable Storage. Honest framing: non-React stacks, banner-only use cases, GDPR-primary regimes, enterprise CMP shoppers should pick something else. Builds trust with the people who are the right fit.
- "What's new" notice rewritten for 3.11.0 (less narrative, more skimmable).

### CONTRIBUTING.md rewritten

The previous file was generic boilerplate. The new one covers the practical things contributors actually need: pnpm 10 / Node ≥20 setup, repo layout (with a callout that the root `package.json` is the publish surface, not the inner one), how to run a single test, the `verify:tarball` gate, the release flow, branch conventions, patch/minor/major decision table, i18n contribution guide.

### Verification

- Jest: **1212 / 1212 passing** (no behaviour changes)
- `tsc --noEmit -p tsconfig.json` — clean
- `pnpm verify:tarball --skip-ts` — clean across all 22 subpaths

## [3.10.6](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.5...v3.10.6) (2026-05-27)

Release 2 of 6 on the post-audit roadmap. CI / repo plumbing only — zero `dist/` changes, zero behaviour changes for consumers.

### CI workflows hardened

- **`ci.yml`** — synced the `Verify entry points` loop with `publish.yml` (17 → 22 entries). Pre-3.10.6 a PR could pass CI while failing the publish workflow at release time. Both now check the same 22 entries plus `dist/styles.css`. Also added the **`verify:tarball` step**: the same ESM + CJS + TS resolution gate that runs in `publish.yml` now runs on every PR, so the 3.8.0–3.10.2 missing-exports class of bug can never reach a tag again.
- **`concurrency:` groups + `timeout-minutes:`** added to all three workflows.
- **`publish.yml`** — `npm install -g npm@11` (was `npm@latest`). Pin deliberately so a future npm major can't break release day.
- **`nextjs.yml`** — moved `id-token: write` from workflow-level to the `deploy` job only (least privilege). Added a docs-site typecheck step on PR builds, closing the "docs site never typechecks" gap. PRs build without deploying.

### New workflows

- **`.github/workflows/codeql.yml`** — CodeQL SAST on push + PR + weekly cron.
- **`.github/dependabot.yml`** — weekly automated PRs for `github-actions` + `npm`, grouped.

### Governance docs

- `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/FUNDING.yml`, `CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.{md,yml}`.

### Example apps hygiene

- `engines.node: >=20.0.0` added to all **14** example `package.json` files (was 2 of 14).
- `.gitignore` added to `examples/ssr/{remix,astro}`. `examples/ssr/remix/public/.gitkeep` so the conventional dir exists.
- `examples/dsr-backend-prod/README.md` — added a "Switching to PostgreSQL for production" subsection with the schema diff.

### README

- Tests badge swapped from a static `tests-1192 passing` shield to a live `CI` badge driven by the actual workflow status.

### Known follow-up

- The plan called for switching all three workflows to `--frozen-lockfile`. Defer: significant pre-existing lockfile drift (next 16.2.2 → 16.2.6, the docs-site self-dep, `@phosphor-icons/react` addition all pre-date proper lockfile maintenance). Tightening alongside the lockfile regeneration warrants its own dedicated release rather than risking unrelated breakage here.

### Verification

- Workflow YAML lints; CI green on the new entry-point loop and verify-tarball step.
- Jest: 1212 / 1212 passing (no functional changes).
- `tsc --noEmit -p tsconfig.json` clean for the docs site.
- `pnpm verify:tarball` clean across all 22 subpaths.

## [3.10.5](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.4...v3.10.5) (2026-05-27)

First of six releases on the post-audit roadmap (3.10.5 → 3.10.6 → 3.11.0 → 3.12.0 → 3.13.0 → 4.0.0). This patch covers the "real bugs consumers actively hit" tier — no API changes observable to consumers.

### `ConsentManager` no longer resets user toggles on parent re-render

The options-init `useEffect` previously depended on the `options` reference identity. When a parent re-rendered with an inline-literal `options` array (the common case), the effect re-ran and reset every toggled consent. The effect now depends on a stable hash of `(id + defaultValue)` pairs, so re-init only fires when the option set actually changes. Regression test added (`ConsentManager-stable-options.test.tsx`).

### `apiAdapter` default error handler surfaces the response body

When a `save()` or `remove()` failed with a 4xx/5xx, the default `console.warn` previously only printed the status code — the body (often `{"error":"…","fields":{…}}`) was dropped. The new handler emits the status line synchronously, then asynchronously clones the response and appends up to 256 chars of body text. Robust against mock-Response objects that lack `.clone()`.

### `PolicyExporter` failure message is actionable

The catch-all "An error occurred during export. Please try again." string masked the real cause (typically a missing `jspdf` / `docx` peer dep). The new message includes the underlying error text (capped 200 chars) with the `[ndpr-toolkit/policy]` prefix.

### `cookieAdapter` default `expires` 365 → 180 days

6 months is a more privacy-conservative consent-refresh cadence and aligns with typical NDPA + GDPR commentary on consent longevity. Existing callers can pass `expires: 365` explicitly to preserve the old behaviour.

### `examples/dsr-backend-prod` PII hygiene

- The Resend mock-mode stdout transport no longer prints the full email body by default (the body contains the requester's full name and reference). Set `DSR_MOCK_PRINT_BODY=1` in dev if you really want the body. Only the metadata (from/to/subject) prints by default.
- The Prisma persist-failure log path was spreading `err.meta`, which on Prisma errors often contains the failing column VALUES (email, fullName, identifierValue). It now logs `{ code, message: truncated(200) }` only.

### Build / dependency / repo hygiene

- `next` bumped to `^16.2.6` (clears 7 dev-only High advisories).
- `lucide-react` removed from root `peerDependencies` + `peerDependenciesMeta`. Zero internal importers exist, so listing it as a peer was bloat for consumers (an optional install they'd never actually use).
- Root `package.json#devDependencies` self-reference to `@tantainnovative/ndpr-toolkit` widened from `^3.7.0` to `^3.10.0`. (Initially attempted removal — turns out the docs site's `import …from '@tantainnovative/ndpr-toolkit/{core,policy,server}'` paths rely on the self-dep for TS resolution under pnpm. Properly killing it requires switching to `tsconfig.paths` mapping at the docs site, deferred to 3.11.0.)
- `packages/ndpr-toolkit/package.json` marked `"private": true` so it's clear it's the drift surface, not the publish surface. Slated for full removal in 4.0.
- Deleted 3 dead root tsconfigs (`tsconfig.lib.json`, `tsconfig.lib-check.json`, `tsconfig.declarations.json`) — referenced from nowhere.
- Deleted orphan files: `examples/consent-examples.tsx`, `UPGRADE_SUMMARY.md` (April-2025 doc superseded by the docs site upgrade guides), `public/screenshots/dpia-demo.png` (referenced from nowhere).
- Untracked `test-installation/` (already in `.gitignore`).
- `CHANGELOG.md`: 155 wrong-org links repaired (`tantainnovative/ndpr-toolkit` → `mr-tanta/ndpr-toolkit`) so historical compare-links resolve.

### Verification

- Jest: **1212 / 1212 passing** (was 1211 — +1 ConsentManager stability test)
- `tsc --noEmit` clean
- `pnpm verify:tarball --skip-ts`: clean across all 22 subpaths

## [3.10.4](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.3...v3.10.4) (2026-05-26)

A 20-agent audit surfaced six ship-blocker-class issues. All six are fixed in this patch.

### Security: XSS in policy export

`exportHTML` rendered `policy.organizationInfo.website` straight into an `<a href="...">` after HTML-escaping but without URL-scheme validation. A `javascript:`, `data:`, or `vbscript:` URL would execute on click. The risk escalated to critical for multi-tenant SaaS where one tenant's policy is rendered to another tenant's users.

Fix: added an explicit `http` / `https` / `mailto` allowlist (`safeUrl()` helper in `utils/policy-export/html.ts`). Disallowed schemes are stripped — the original text still renders, just not as a clickable link. 6 new tests cover `javascript:`, `data:`, `vbscript:`, scheme-less URLs (auto-upgraded to `https://`), and mailto local-part smuggling attempts.

### Bug: NDPA section citations contradicted each other across files

Multiple modules had different statutory citations in different files. The CHANGELOG of 3.5.2 declared corrections that were only partially applied. After this patch, the canonical mapping is enforced everywhere:

- **DPIA**: Section 28 (was inconsistently §28 / §38 / §39)
- **DSR**: Part VI §34-38 (was Part IV §29-36 in several files)
- **Cross-border**: Part VIII §41-43 (was Part VI §41-45)
- **ROPA**: Section 29 (was §28(2) in some places)
- **Privacy Policy**: Section 27
- **Breach**: Section 40

39 files updated covering library source, types, demos, docs, examples, Yoruba/Igbo/Hausa locales, and the regulatoryReferences table in `compliance-score.ts` (which had a systematically misaligned section-to-right mapping). Two test assertions updated to match. CHANGELOG history and the `migrating-3-5-to-3-8` guide deliberately left intact since they are historical records.

### Bug: docs taught fictitious API names

Two guide pages documented symbols that don't exist:

- `/docs/guides/compound-components` referenced `useConsentContext`, `Consent.Title`, `Consent.Description`, `Consent.CategoryList`, `Consent.AcceptAllButton`, `Consent.RejectAllButton`, `Consent.PreferencesButton` — none of which are exported.
- `/docs/guides/presets` invented `ndprPreset`, `ConsentPreset`, `DSRPreset`, `DPIAPreset`, `BreachPreset`, `PrivacyPolicyPreset`, `LawfulBasisPreset`, `ROPAPreset` and an `NDPRProvider preset={...}` prop that doesn't exist.

Both rewritten against the real API: `Consent.Provider` / `.OptionList` / `.AcceptButton` / `.RejectButton` / `.SaveButton` / `.Banner` / `.Settings` / `.Storage`, plus `useConsentCompound`; the 9 real presets (`NDPRConsent`, `NDPRSubjectRights`, `NDPRBreachReport`, `NDPRPrivacyPolicy`, `NDPRDPIA`, `NDPRLawfulBasis`, `NDPRCrossBorder`, `NDPRROPA`, `NDPRComplianceDashboard`). The rewrites also document gaps honestly — e.g. only `NDPRConsent` exposes a typed `copy` prop today; only `consent`/`dsr`/`policy` have narrowed subpaths.

### Bug: `examples/nextjs-app` (the headline StackBlitz CTA) was broken

The example linked from the README's "Open in StackBlitz" / "Open in CodeSandbox" header buttons had two issues:

- `app/layout.tsx` was missing `import "@tantainnovative/ndpr-toolkit/styles"` — the consent banner and every toolkit component rendered unstyled.
- `app/dsr/page.tsx` alerted `submission.id` — a field that doesn't exist on `DSRFormSubmission` (the form-level payload has no server-issued reference). The alert printed `undefined`.

Both fixed. The DSR handler now reports the requester's own email instead, and points users at `examples/dsr-backend-prod` for the full server-side flow.

### Bug: async storage adapters silently failed in two presets

`NDPRLawfulBasis` and `NDPRCrossBorder` called `adapter.load()` synchronously and ignored the returned Promise. With `cookieAdapter` or `apiAdapter` (both async), saved state never seeded after mount — the presets always rendered with empty `initialActivities` / `initialTransfers`, no warning, no error. Only `NDPRROPA` did it correctly.

Fix: both presets now mirror the `NDPRROPA` pattern — a `useEffect` that awaits `adapter.load()` and rehydrates state when the Promise resolves. The synchronous fast-path is preserved for sync adapters (localStorage, memory) so there's no flash. 3 new regression tests confirm async adapters now seed correctly.

### Bug: `<NDPRProvider locale={...}>` had no visible effect

The toolkit shipped 5 locale files (English, Yoruba, Igbo, Hausa, Pidgin), `NDPRProvider` exposed a `locale` prop, and `useNDPRLocale()` was exported and documented — but **no component actually consumed the hook**. Passing a locale to the provider changed nothing visible. The i18n docs page misled consumers.

Fix: wired `useNDPRLocale()` into the three most-visible components — `ConsentBanner`, `DSRRequestForm`, `BreachReportForm`. Resolution chain: **explicit prop wins, then provider locale, then English default**. Existing consumers passing per-prop overrides see no change; consumers passing a locale to the provider now see their translations rendered. 10 new tests cover the three precedence cases plus partial-locale fallback. Wiring the remaining 15+ components is a tracked follow-up for 3.11.x.

### Verification

- **Jest: 1211 / 1211 passing** (was 1192 — +19 new tests: 6 XSS, 3 async-adapter, 10 i18n)
- `tsc --noEmit` clean for the docs site and the toolkit package
- `verify:tarball` gate passes (would have run on tag push)

## [3.10.3](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.2...v3.10.3) (2026-05-25)

### Bug fix: 4 missing subpath exports

The published `exports` map in the root `package.json` was missing four subpaths whose dist files were always being built and shipped in the tarball but were never wired into the import resolver. Affected paths:

- `./headless` — added in 3.10.0 (alias of `/hooks`)
- `./lawful-basis/lite` — added in 3.8.0
- `./cross-border/lite` — added in 3.8.0
- `./ropa/lite` — added in 3.8.0

Consumers running `import { … } from '@tantainnovative/ndpr-toolkit/headless'` (or any of the three `/lite` paths) on 3.8.0 through 3.10.2 got a Node resolution error despite the dist files being present in their `node_modules`. The bug was that the inner `packages/ndpr-toolkit/package.json` had the exports right, but only the root `package.json` is consumed by the publish workflow — and the root never got them.

3.10.3 adds all four entries to both the `exports` map and the `typesVersions["*"]` block in the root `package.json`. Verified by inspecting the published 3.10.3 tarball's `package.json` to confirm `npm view @tantainnovative/ndpr-toolkit@3.10.3 exports` lists all 23 paths.

### Docs

- New **`/docs/guides/upgrading-3-7-to-3-10`** guide — concise upgrade path for the common case of consumers stuck on 3.7.0 (the last version that reached npm before the publish-pipeline regression). Covers what's new, what didn't change, the post-bump verify checklist, and the reason 3.10.3 is the right target rather than any intermediate.
- README — compacted the "What's new" notice. The 700-word historical narrative is now a brief 3.10.x summary with links to the new upgrade guide and the full CHANGELOG. Reverted the StackBlitz / CodeSandbox "Open in" links from `examples/ecommerce-starter` back to `examples/nextjs-app` (the comprehensive all-in-one demo — the ecommerce-starter is great as a deeper example but `examples/nextjs-app` is the better headline first-look).

### Verification

- All 23 exports keys present in both `exports` and `typesVersions["*"]` (was 19 in 3.10.2)
- Build outputs verified locally — every claimed import path resolves to an existing `dist/<name>.{js,mjs,d.ts}`
- Tests: 1192 / 1192 passing (no runtime changes)
- `tsc --noEmit` clean for the docs site

## [3.10.2](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.1...v3.10.2) (2026-05-25)

README-only patch — runtime is byte-identical to 3.10.1. Fixes the npm-rendered README so it reflects the current state of the toolkit.

### What was wrong

The npm publish workflow runs `npm publish` from `working-directory: .` (the repo root), so the README that lands on the npm package page is **`/README.md`**, not `packages/ndpr-toolkit/README.md`. Three earlier releases (3.8.1, 3.9.0, 3.10.0) updated the inner README — wrong file — leaving the npm-visible header stuck at the v3.4.0 "What's new" notice with the v3.4.0 release link and the `1098 passing` tests badge.

### What changed in this patch

- "What's new" notice — v3.4.0 paragraph → consolidated 3.5 → 3.10.x highlights (NDPRThemeProvider, `/headless`, production DSR backend example, ecommerce starter, SSR-safe templates, Bun quickstart, typed DSR callbacks, Lite manager variants, focus management).
- Header release link — `v3.4.0 Release` → `v3.10.1 Release`.
- Tests badge — `1098 passing` → `1192 passing`.
- StackBlitz / CodeSandbox "Open in" links — `examples/nextjs-app` (no longer exists) → `examples/ecommerce-starter`.
- Screenshot image URLs — pinned tag `v3.5.2` → `v3.10.1` so the images come from the current release tree.

The body of the README already had the correct content for everything below the header (Bun quickstart, Choose Your Layer, Adapters, Live Demos table, etc.).

## [3.10.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.10.0...v3.10.1) (2026-05-25)

Hotfix release. Code and runtime are identical to 3.10.0 — this patch fixes the build/publish pipeline that silently failed every release from 3.8.0 onward, so 3.10.1 is the first version since 3.7.0 to actually reach npm.

### Root cause

The dts-rollup post-build step (`scripts/rollup-dts.mjs`) deletes "leftover" hash-suffixed declaration files that tsup emits alongside each rolled-up entry. The 3.8.0 release added new entry names with two hyphens (`lawful-basis-lite`, `cross-border-lite`) — and the hash-suffix regex `/-[A-Za-z0-9_-]{8,}\.d\.m?ts$/` matched those legitimate entries because the trailing `basis-lite` / `border-lite` segments fall inside the 8-char dash-inclusive window. The sweep then deleted `dist/lawful-basis-lite.d.ts` and `dist/cross-border-lite.d.ts` right after rollup, the workflow's entry-points check then failed, and `npm publish` never ran. The git tags / GitHub releases for 3.8.0, 3.8.1, 3.9.0, and 3.10.0 existed; only npm was stuck on 3.7.0.

### Fix

- Replaced the regex-based sweep with an explicit allowlist (`new Set([...ENTRIES, 'styles'])`). Any `.d.ts` / `.d.mts` whose basename isn't in the allowed entries gets swept. No more pattern matching against names.
- Wired the 3.10.0 `/headless` entry into the root `tsup.config.ts` (it had only been wired in `packages/ndpr-toolkit/tsup.config.ts`, which the publish workflow doesn't use) and added it to `CLIENT_ENTRIES` so the `"use client"` banner is injected.
- Workflow's `Verify entry points` step now covers 22 entries (was 21) — added `headless`.

### Recovery

After this patch lands and 3.10.1 publishes successfully, the failed tags (v3.8.0, v3.8.1, v3.9.0, v3.10.0) will be backfilled to npm by cherry-picking this fix onto each tagged commit and re-running the workflow.

## [3.10.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.9.0...v3.10.0) (2026-05-25)

Phase J of the feedback work — new API surface (theme provider + headless alias) and a production-grade DSR backend reference. Fully additive — no breaking changes.

### `NDPRThemeProvider` — typed theme object → CSS variables

A small React Context provider that takes a TypeScript theme object and injects matching `--ndpr-*` CSS custom properties on a wrapping `div`. Syntactic sugar over the existing CSS-variable theming model — unset fields fall through to stylesheet defaults.

```tsx
import { NDPRThemeProvider, type NDPRTheme } from '@tantainnovative/ndpr-toolkit';

const theme: NDPRTheme = {
  colors: { primary: '22 163 74', primaryHover: '21 128 61' },  // RGB triplets
  radius: { base: '0.75rem' },
  font: { sans: '"Inter", system-ui, sans-serif' },
};

<NDPRThemeProvider theme={theme}>
  <App />
</NDPRThemeProvider>
```

The `NDPRTheme` interface keys are derived 1:1 from the variables actually defined in `styles.css` — no inventing tokens. Setting `mode: 'dark'` stamps `data-theme="dark"` on the wrapper to activate the stylesheet's dark-mode block. **6 new tests** cover variable injection, key isolation, dark-mode wiring, and className passthrough. Exported from the default entry only (not `/core`) to keep the RSC-safe surface clean.

### `/headless` subpath — alias of `/hooks` for discoverability

A pure rename of the existing `/hooks` entry under a more discoverable name. Same exports, same source, same identifiers — `export *` from `hooks-entry.ts`. Useful when consumers grep for "headless" looking for a hooks-only API.

```tsx
import { useConsent, useDSR, useFocusTrap } from '@tantainnovative/ndpr-toolkit/headless';
```

**12 new tests** verify that `/headless` and `/hooks` export identical keys and identity-equal values (so the alias can never silently drift). Wired into `package.json` exports, `typesVersions`, and `tsup.config.ts`.

### `examples/dsr-backend-prod/` — production-grade DSR backend

A 14-file Next.js 15 / React 19 reference implementation that wires `NDPRSubjectRights` to a real backend pipeline:

1. **Validate** via `validateDsrSubmission` from `/server` — 400 with `{ error, fields }` on invalid payloads.
2. **Defense-in-depth** disposable-email blocklist (configurable via `DSR_BLOCKED_EMAIL_DOMAINS`).
3. **Persist** to a Prisma `DSRRequest` model with a 30-day `estimatedCompletionAt` (NDPA Part IV §29-36).
4. **Confirm** by sending a Resend transactional email — best-effort: the request still succeeds if email fails.

Both Prisma and Resend are wrapped in **dual-mode shims**: real clients when `DATABASE_URL` / `RESEND_API_KEY` are set, otherwise a Map-backed mock and a stdout logger. The example runs out of the box with no infrastructure.

The 201 response is exactly `{ referenceId, status, estimatedCompletionAt }` — the shape `NDPRSubjectRights.onSubmitSuccess` consumers read from `body` per the 3.8.1 contract.

### Three new docs guides

Wired into the Implementation Guides sidebar:

- `/docs/guides/theming` — `NDPRThemeProvider`, the full `NDPRTheme` reference, RGB-triplet convention, dark mode, when not to use the provider
- `/docs/guides/headless` — `/headless` quickstart, the 10 hooks it exposes, adapter wiring, bundle-size note, the relationship to `/hooks`
- `/docs/guides/production-dsr-backend` — walks through the `examples/dsr-backend-prod` pipeline, response contract, and how to swap in your own database/email stack

### Verification

- `tsc --noEmit` clean for the docs site
- **Full Jest suite: 1192/1192 passing** (was 1173 — +19: 6 ThemeProvider + 12 headless-parity + 1 default-entry exports check)
- No changes to existing prop types, hook signatures, or storage adapters

## [3.9.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.8.1...v3.9.0) (2026-05-25)

Examples expansion + Bun quickstart + SSR-safe storage docs. Fully additive — no breaking changes.

### Runnable example apps

- **`examples/ecommerce-starter`** — multi-page Next.js 15 / React 19 storefront ("Zuri Market") wiring the toolkit into a realistic Nigerian ecommerce flow: home page, checkout, privacy notice, data-subject rights portal (with `submitTo` + `onSubmitSuccess` rendering a server-issued reference), and an editable cookie preferences page using `useConsent`. Demonstrates the `/presets/consent`, `/presets/dsr`, `/presets/policy`, and `/hooks` subpaths together.
- **`examples/ssr/nextjs-app-router`** — SSR-safe consent on Next.js 15. Layout reads the consent cookie via `next/headers`, parses it with a small typed helper, and passes the result to a client `ConsentRoot` so the banner hydrates already-resolved (no flash, no hydration warning).
- **`examples/ssr/remix`** — the same cookie-bridge pattern wired from a Remix `loader` and Vite's `?url` asset import for the stylesheet.
- **`examples/ssr/astro`** — `Astro.cookies.get` in the page frontmatter, then `<ConsentRoot client:load>` as a React island.

Each example is self-contained (own `package.json`, `tsconfig.json`, `next.config.mjs` / `vite.config.ts` / `astro.config.mjs`) so you can copy a directory and `bun install && bun dev` to run it.

### Bun quickstart in the README

Root README now includes copy-pasteable Bun + Vite + React and Bun + Next.js 15 (App Router) recipes that go from zero to a working banner in three commands. The npm-published README also gets a one-line Bun install command alongside pnpm/npm.

### SSR-safe storage guide

New docs page at **`/docs/guides/server-side-storage`** documenting the cookie-bridge pattern in detail: why `localStorageAdapter` flashes on SSR, how `cookieAdapter` solves it, and worked examples for Next.js App Router, Remix, Astro, and SvelteKit. Wired into the docs sidebar under Implementation Guides.

### npm-published README brought current (3.4.0 → 3.9.0)

The README that ships to npm was stale at the 3.4.0 highlights. It now leads with a 3.9.0 "what's new", references back to 3.8.1 (`onSubmitSuccess`), 3.8.0 (Lite Manager variants), 3.6.0 (`onSubmitError`), and 3.5.x (focus management + reduced motion). Adds a "Runnable Examples" section, a typed DSR callbacks snippet in the Presets section, and a Bun install command. Screenshot URLs bumped from `v3.5.2` → `v3.9.0`. Tests badge bumped to 1173.

### Verification

- `tsc --noEmit` clean for the docs site
- **Full Jest suite: 1173/1173 passing** (unchanged from 3.8.1 — no logic changes in the published package)
- No changes to runtime exports, prop types, or storage adapters

## [3.8.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.8.0...v3.8.1) (2026-05-25)

Documentation + small API addition patch. Fully additive — no breaking changes.

### `NDPRSubjectRights` — typed `onSubmitSuccess` callback

Counterpart to the existing `onSubmitError`. Fires when the `submitTo` POST returns a 2xx response. Receives the `Response`, the submitted `DSRFormSubmission` payload, and the parsed JSON body (or `undefined` if the response had no body or was not valid JSON).

```tsx
<NDPRSubjectRights
  submitTo="/api/dsr"
  onSubmitSuccess={({ response, data, body }) => {
    const ref = (body as { referenceId?: string })?.referenceId;
    if (ref) router.push(`/dsr-confirmation?ref=${ref}`);
  }}
  onSubmitError={({ error, response }) => {
    console.error('DSR submit failed', error, response?.status);
  }}
/>
```

The `body` field is `unknown` to force consumers to narrow it themselves before reading fields. **4 new tests** cover both success and failure paths.

### Documentation

- **DSR submission payload contract** documented on the Data Subject Rights component page (`/docs/components/data-subject-rights#submission-payload`). Includes the canonical `DSRFormSubmission` TypeScript interface, a concrete JSON example, the recommended response shape, and a working Next.js App Router backend handler.
- **Accessibility sections** added to ConsentBanner and DSRRequestForm docs pages. Each lists CONCRETE a11y features verified against the source — `useFocusTrap`, escape-to-dismiss, `prefers-reduced-motion` block in the BEM stylesheet, `role="alert"` on errors, `aria-required` + `aria-invalid` wiring on form fields, etc. Features that aren't implemented (e.g. auto-focusing the first invalid field) are NOT claimed — they're suggested as consumer-side recipes instead.
- **Migration guide 3.5 → 3.8** at `/docs/guides/migrating-3-5-to-3-8`. Covers every minor and patch from 3.5.4 through 3.8.1 with a "what changed / action required" breakdown, a net migration diff for the most common upgrade path (adapter → submitTo + onSubmitSuccess), and a verify checklist. Sidebar entry added under Implementation Guides.

### Verification

- `tsc --noEmit` clean for both the library and the docs site
- **Full Jest suite: 1173/1173 passing** (was 1169 — +4 new submit-callback tests)
- No changes to the existing `onSubmitError`, `submitTo`, or `submitOptions` props (backward compatible)

## [3.8.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.6.2...v3.8.0) (2026-05-24)

### Lite (read-only) variants of the heavy Manager components

Three new components — `LawfulBasisTrackerLite`, `ROPAManagerLite`, `CrossBorderTransferManagerLite` — that render the same list-and-summary view as their Full counterparts without the form, validation, write callbacks, or CSV-export utilities. Built for dashboards, audit pages, embedded compliance widgets, and customer-facing transparency pages where users only need to *see* the records.

Exposed at new subpath entries:

```ts
import { LawfulBasisTrackerLite } from '@tantainnovative/ndpr-toolkit/lawful-basis/lite';
import { ROPAManagerLite } from '@tantainnovative/ndpr-toolkit/ropa/lite';
import { CrossBorderTransferManagerLite } from '@tantainnovative/ndpr-toolkit/cross-border/lite';
```

Bundle deltas (minified + tree-shaken, pre-gzip; **transitive closure** of each subpath):

| Module | Full | Lite | Saved |
|---|---|---|---|
| `/lawful-basis` → `/lawful-basis/lite` | 36.7 KB | 12.7 KB | **65%** |
| `/cross-border` → `/cross-border/lite` | 53.3 KB | 5.6 KB | **89%** |
| `/ropa` → `/ropa/lite` | 36.9 KB | 13.2 KB | **64%** |

The cross-border Lite saves the most because it does NOT import the 624-row country-adequacy dataset — Lite displays `adequacyStatus` from each transfer record directly instead of recomputing it.

Each Lite component accepts an optional `onActivityClick` / `onRecordClick` / `onTransferClick` callback so consumers can render their own detail view on row click. All other props (`title`, `description`, `unstyled`, `classNames`, `showSummary`, `showComplianceGaps`/`showRiskAlerts`) carry the same names and semantics as the Full versions.

Existing `/lawful-basis`, `/cross-border`, and `/ropa` entries are unchanged. This release is fully additive — no consumers need to migrate.

See the new guide: [Lite vs Full managers](https://ndprtoolkit.com.ng/docs/guides/lite-vs-full).

### Other

- Added `lawful-basis-lite`, `cross-border-lite`, `ropa-lite` to the publish workflow's entry-point verification loop. Total verified entries: 21.

## [3.6.2](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.7.0...v3.6.2) (2026-05-24)

Compressed Phase D + E + F patch — companion-CLI templates, per-module StackBlitz scaffolds, and a real backend for the `/score` lead-magnet. Main `@tantainnovative/ndpr-toolkit` library has no code changes; the bump is for changelog alignment.

### Companion packages

- **`@tantainnovative/create-ndpr@0.3.0`** — the 9 remaining route templates now support all three ORM choices via `{{#if ORM=prisma|drizzle|none}}` conditional blocks. Picking `ORM=none` now scaffolds a fully working in-memory app for every endpoint, not just consent:
  - Next.js routes: dsr, breach, dpia, lawful-basis, cross-border
  - Express routes: consent, dpia, lawful-basis, cross-border
- **`create-ndpr@1.0.0` (unscoped alias)** — `packages/create-ndpr-unscoped/PUBLISHING.md` documents the one-time manual publish + Trusted Publisher setup so future updates flow through CI.

### Docs

- **8 per-module StackBlitz scaffolds** under `examples/stackblitz/{consent,dsr,dpia,breach,policy,lawful-basis,cross-border,ropa}/`. Each is a minimal Next.js 15 + React 19 app that demonstrates ONE preset. Boot any of them in StackBlitz / CodeSandbox with one click — no clone, no install. README has a per-module badge table.
- **Each recipe page** (`/docs/recipes/*`) now has "Open in StackBlitz" + "Open in CodeSandbox" badges pointing at the matching module's scaffold.
- **`/score` email capture** now uses a real backend (Web3Forms) when `NEXT_PUBLIC_WEB3FORMS_KEY` is set, with the mailto: path preserved as a graceful fallback when the env var is missing or the request fails. Lead emails arrive as structured fields (name, email, org, score, top recommendations) instead of free-form mail-client output.

### No library code changes

`@tantainnovative/ndpr-toolkit` package is unchanged; consumers don't need to upgrade. The version bump keeps the repo, npm, and CHANGELOG in lockstep so the next library feature (3.8.0 with manager-component bundle splitting) lands cleanly.

## [3.7.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.6.1...v3.7.0) (2026-05-24)

Phase B — Template + Recipe Library. Closes the dev-feedback content gap (feedback items #7 and #9). New API additions are all backward-compatible — 3.6.x consumers upgrade without changes.

### Features

* **5 org-specific privacy-policy templates.** New `templateContextFor(id, overrides?)` factory exported from `/`, `/core`, `/server`, and `/policy`. Pre-fills a complete `TemplateContext` with sector-appropriate data categories, lawful-basis defaults, and the right flags for children/sensitive/financial/cross-border/automated-decisions:
  - **`saas`** — startup-shape, cross-border on (overseas cloud), no sensitive
  - **`ecommerce`** — financial on, cross-border on (payment processors), automated-decisions on (fraud)
  - **`school`** — `hasChildrenData: true` (NDPA Section 31 parental consent), education industry
  - **`healthcare`** — `hasSensitiveData: true` (Section 30 medical/biometric), financial on (insurance)
  - **`procurement`** — government industry, financial on, BVN + gov IDs selected
* **`<NDPRPrivacyPolicy template="…" />` prop.** Drop a template id and the wizard opens already populated. Optional `templateOverrides` for org name/DPO/address. Existing `adapter` + `onComplete` API unchanged.
* **`ORG_POLICY_TEMPLATE_REGISTRY` constant** — listing of all 5 templates with id, label, description, and example org types. Useful for building a template-picker UI.
* **`initialContext` prop** added to `<AdaptivePolicyWizard>` and `useAdaptivePolicyWizard()` — lets advanced consumers bypass the template lookup and seed with a hand-built `TemplateContext`.

### Docs

* **5 new recipe pages at `/docs/recipes/*`** — production-tested patterns drawn from real adopter feedback:
  - `ecommerce-consent` — checkout flow, cart-abandonment cookies, marketing-pixel gating with `useConsent`
  - `newsletter-consent` — Section 26 affirmative opt-in (no pre-checked boxes), double opt-in pattern, audit-trail snippet
  - `contact-form-disclosure` — minimum-viable Section 27 notice on a public contact form, data-minimisation guidance
  - `careers-rights` — applicant data lawful basis, retention by candidate outcome, automated CV-screening disclosure (Section 37)
  - `admin-dsr-management` — DPO/staff-side workflow: queue, identity verification, 30-day deadline tracking, audit trail
* **Recipes section added to docs nav + sitemap.** Each recipe page has full SEO meta and is canonicalised.

### Tests

* 12 new tests for the org templates (1 per template + override behaviour + registry consistency). Suite now at **1146 passing**.

## [3.6.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.6.0...v3.6.1) (2026-05-24)

Phase A of the post-3.6.0 backlog — tooling foundation. Pure plumbing; no API changes on the main library, but `create-ndpr` (scoped) bumps to 0.2.0 and a new unscoped `create-ndpr` alias package ships.

### Companion packages

* **`@tantainnovative/create-ndpr@0.2.0`** — scaffolder no longer emits broken Prisma imports when you pick `ORM=None`. Templates now support `{{#if ORM=prisma|drizzle|none}}` conditional blocks. The consent route template emits working code for all three ORMs (Prisma queries, Drizzle queries, or an in-memory stub with TODO comments). Other route templates (still hardcoded to Prisma) are skipped with a clear message when `ORM=none` instead of generating broken output. Also fixes the `StorageAdapter<unknown>` type error in the generated `ndpr-layout.tsx` (now correctly types the apiAdapter as `StorageAdapter<ConsentSettings>` and adds a CSRF header example).
* **`create-ndpr@1.0.0` (NEW, unscoped)** — 30-line alias that delegates to the scoped CLI via `npx`. Lets `npm create ndpr@latest`, `npx create-ndpr`, `pnpm create ndpr`, and `bun create ndpr` all work alongside the existing `npx @tantainnovative/create-ndpr`.

### Docs

* README install block now shows all four idiomatic CLI invocations (`npm create ndpr@latest`, `npx create-ndpr`, the scoped form, pnpm and bun variants).
* README header now has "Open in StackBlitz" and "Open in CodeSandbox" badges that boot `examples/nextjs-app` zero-install in either environment.
* New "Bundle size guidance" subsection under "Available Import Paths" explains: (1) prefer narrow subpaths over root, (2) use `/presets/{consent,dsr,policy}` over the full `/presets` barrel when only one preset is needed, (3) the 3 manager components are heavy by design (they're full table+filter+modal UIs) — import from `/hooks` if you only need the hook, (4) `/server` carries zero React for SSR/edge/CI use.

### No library code changes

The main `@tantainnovative/ndpr-toolkit` package is unchanged from 3.6.0; the version bump is for changelog clarity and so the repo, npm, and CHANGELOG all reference the same version.

## [3.6.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.5.5...v3.6.0) (2026-05-24)

### Features (developer feedback)

This release lands changes flagged by integrating teams using the toolkit in production. All additions are backward-compatible — 3.5.x consumers can upgrade without changes.

* **`apiAdapter` is now production-ready.** Adds `credentials` (defaults to `'same-origin'`, set `'include'` for cross-origin), dynamic `headers` (function form for runtime CSRF token lookup), `loadMethod`/`saveMethod` overrides (e.g. `PUT` for upsert APIs), `unwrap` (transform `{ data: ... }` envelopes), configurable `retry` with exponential backoff and a `shouldRetry` predicate (default: retry on network errors + 5xx, skip 4xx), and `onError`/`onSuccess` hooks for telemetry. The pre-3.6.0 `console.warn` behavior is preserved when no `onError` is configured.
* **`NDPRConsent` exposes a `copy` prop.** Override `title` / `description` / `acceptAll` / `rejectAll` / `customize` / `save` strings without dropping to the lower-level `<ConsentBanner>` API.
* **`NDPRSubjectRights` adds public-form `submitTo` mode.** Public sites can POST to their backend instead of being state-managed by an adapter. Pairs with `submitOptions` (credentials, headers) and `onSubmitError`. The state-managed `adapter` mode is unchanged.
* **Per-preset subpath entries** for bundle-size-sensitive consumers:
  - `@tantainnovative/ndpr-toolkit/presets/consent` — just `NDPRConsent` (~4KB vs ~8KB for the full barrel)
  - `@tantainnovative/ndpr-toolkit/presets/dsr` — just `NDPRSubjectRights`
  - `@tantainnovative/ndpr-toolkit/presets/policy` — just `NDPRPrivacyPolicy`
  The full `/presets` barrel is unchanged. These are additive narrower entries.

### Docs

* README install block now shows Bun, npm, and Yarn alongside pnpm.

### Coming next (3.6.1+)

- Recipe pages for ecommerce / newsletter / contact-form / careers / admin DSR patterns
- Org-specific privacy policy templates (SaaS, ecommerce, school, healthcare, procurement)
- Continued bundle reduction

## [3.5.5](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.5.4...v3.5.5) (2026-05-24)

### Features (tests + types)

* **Tests:** 8 new tests for the 72-hour NDPC notification deadline (`useBreach.getBreachesRequiringNotification`) — covers 1h / 24h / 48h / 71.5h / expired / sort-by-urgency / already-notified cases. Test suite now at 1134 passing (up from 1126).
* **CI:** Tests now run with `--coverage` and the report uploads as a workflow artifact on each run. Thresholds re-set as a ratchet (45% branches, 50% functions, 65% lines/statements — at or just below current to catch regressions, raised in follow-up patches).
* **types:** `DPIAAnswerMap` and `DPIAAnswerValue` exported from `/` and `/hooks`. `DPIAProvider` and `<NDPRDPIA>` props now use these instead of `Record<string, any>`, restoring callsite type-safety on `onComplete`, `initialAnswers`, and `adapter`.

### Bug Fixes (API contract)

* **useDSR:** `submitRequest` previously declared `Omit<DSRRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt' | 'estimatedCompletionDate'>` — but `submittedAt` and `estimatedCompletionDate` don't exist on `DSRRequest`. Corrected to `Omit<DSRRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'dueDate'>` so the type contract matches the implementation.
* **useDSR:** `getRequestsByStatus` now accepts `DSRStatus | RequestStatus` instead of only the deprecated `RequestStatus`. Callers using the modern `DSRStatus` literals (e.g. `'awaitingVerification'`) no longer get a type error.

## [3.5.4](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.5.3...v3.5.4) (2026-05-23)

### Features (accessibility)

* **useFocusTrap:** New shared hook that captures `document.activeElement` on activation, traps Tab cycling inside the container, optionally handles Escape, and restores focus on deactivation (WCAG 2.4.3). Exported from `/`, `/hooks`. Drops a previously-missing piece — closing `<ConsentBanner>` now correctly returns focus to whatever triggered it.
* **prefers-reduced-motion:** Stylesheet now neutralises all toolkit animations (slide-in, fade-in, scale-in) and transitions when the user sets `prefers-reduced-motion: reduce` at the OS level (WCAG 2.3.3). Applies to banners, modals, dashboards, and policy previews.

### Bug Fixes (accessibility)

* **ConsentBanner:** Internal focus trap now restores focus on close (was previously leaving focus at `<body>`). Replaced the duplicated trap implementation with the new shared `useFocusTrap` hook.
* **BreachReportForm:** Icon-only "remove attachment" button now has an accessible label (`aria-label="Remove attachment {filename}"`) and a 44×44 px touch target. SVG marked `aria-hidden`. WCAG 4.1.2 / 2.5.5.
* **BreachReportForm:** `dataTypes` fieldset is now properly wired to its error message via `aria-invalid` + `aria-describedby="dataTypes-error"`. Required-asterisk now announced via `<span className="sr-only">(required)</span>` (was visual-only). WCAG 1.3.1 / 3.3.2.

## [3.5.3](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.5.2...v3.5.3) (2026-05-23)

### Bug Fixes (developer experience)

* **dsr:** `<DSRRequestForm>` now throws a clear `[ndpr-toolkit] <DSRRequestForm requestTypes={...}> requires an array of RequestType[]` error when the required prop is missing — previously crashed deep in a minified chunk with `Cannot read properties of undefined (reading 'find')`. Points users at the `<NDPRSubjectRights>` preset for defaults.
* **dsr:** Default form description updated from "NDPA Part IV, Sections 29-36" to "NDPA Part VI" (matching the 3.5.2 citation fixes).

### Features

* **package.json:** `sideEffects: ["*.css"]` is now declared on both root and workspace manifests — bundlers can reliably tree-shake unused subpaths.
* **package.json:** `engines.node: ">=18.0.0"` declared. Quiets installer warnings on Node 16 setups and matches React 18/19 requirements.
* **package.json:** `funding` field added (GitHub Sponsors URL).
* **keywords:** Added high-intent search terms developers actually type — `ndpa-2023`, `nigeria-compliance`, `data-privacy`, `compliance-tools`, `nitda`, `gdpr`, `gdpr-nigeria`, `africa`, `cookie-banner`, `nextjs`. Improves npm search ranking for queries like "react NDPA" and "cookie consent Nigeria".
* **root exports:** `useComplianceScore` and `useAdaptivePolicyWizard` now re-exported from the root entry. Previously only on `/hooks` — caused silent discoverability gap when users autocompleted from the bare `@tantainnovative/ndpr-toolkit`.

## [3.5.2](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.5.1...v3.5.2) (2026-05-23)

### ⚠️ Legal correctness — please re-review generated artifacts

3.5.2 corrects NDPA 2023 section citations across the toolkit against the gazetted text of the Act. If you embedded any pre-3.5.2 output (privacy policy text, DPIA labels, breach report templates) in a regulatory submission, please regenerate or manually update the citations. See the migration table below.

### Bug Fixes (legal correctness)

* **dsr:** Right citations now follow NDPA Part VI as gazetted — access = Section 34(1)(a)–(b), rectification = Section 34(1)(c), erasure = Section 34(1)(d) + 34(2), restriction = Section 34(1)(e), withdraw consent = Section 35, object = Section 36, automated decisions = Section 37, portability = Section 38. Previously cited Sections 30–36 in a way that did not match the Act.
* **dpia:** DPIA + NDPC prior-consultation citations corrected from Section 38/39 to **Section 28** (which covers both per Section 28(1) and 28(2)).
* **cross-border:** Transfer-mechanism citations now follow NDPA Part VIII — adequacy decision = Section 42, SCCs / BCRs = Section 41(1)(a), NDPC-approved instruments = Section 42(5), and all derogations = Section 43(1)(a)–(f). Previously cited Sections 41–45 in a way that did not match the Act.
* **lawful-basis, breach:** Sensitive personal data citation corrected from Section 27 to **Section 30**.
* **policy:** Privacy notice provisions now cite Section 27 (provision of information) rather than Section 29 (controller obligations).
* **country-adequacy:** Removed fabricated NDPC adequacy claims. NDPC has not (as of publication) published a Section 42 adequacy list. The 22 entries previously labelled `recognizedBy: 'NDPC'` are now `recognizedBy: 'self-assessment'` with a clear disclaimer in the module header.
* **dsr (types):** DSRType union extends with `'withdraw_consent'` to reflect the explicit Section 35 right.

### Features

* **legal-notice:** New `LEGAL_DISCLAIMER_SHORT`, `LEGAL_DISCLAIMER_LONG`, and `legalDisclaimerBlock()` exports (from `/`, `/core`, `/server`), plus a `<LegalNotice>` component. Injected into all generated artifacts (HTML / Markdown / DOCX / PDF policy exports, regulatory breach report output, DPIA report footer, breach form preview).
* **breach (NDPC report content):** `BreachReport` / `BreachFormSubmission` extended with the fields the NDPC actually requires under Section 40(2)–(3) — `approximateRecordCount`, `dataSubjectCategories`, `likelyConsequences`, `mitigationMeasures`, `dpoContact`, `isPhasedReport`, `supplementsReportId`. `BreachReportForm` now collects them; `RegulatoryReportGenerator` includes them in the printed NDPC report.
* **core:** `StorageAdapter` is now re-exported from `/core` for ergonomics (the concrete adapters still live in `/adapters`).

### Build / packaging

* **build:** Sourcemaps are no longer published. Pass `NDPR_SOURCEMAPS=1` to emit them for local debugging. Cuts the published tarball by ~3 MB.
* **build:** `dist/` is no longer tracked in git. CI rebuilds from source on every publish.
* **packaging:** Workspace `packages/ndpr-toolkit/package.json` exports now match the root manifest (drops accidental `-entry` suffixes that pointed at non-existent files). Workspace tsup config also aligned.
* **packaging:** README is now synced from the repo root via `prepublishOnly`, with absolute image URLs so npm renders the hero correctly.

### Release pipeline

* **publish workflow:** Now publishes with `--provenance` (sigstore attestation) and checks out the tagged commit (not main HEAD).
* **repo:** `main` is now branch-protected — PRs + 1 approval + green CI required, no force-push, no deletions.

### Docs

* **README:** Fixed broken code examples — `Consent.Provider` uses `onChange` (not `onSave`); `getComplianceScore` example now includes all 8 required module inputs; `StorageAdapter` re-export documented.

### Migration table — old → new NDPA citation

| Concept | Old (pre-3.5.2) | Correct (3.5.2+) |
|---|---|---|
| Right of access | Section 30 | Section 34(1)(a)–(b) |
| Right to rectification | Section 31 | Section 34(1)(c) |
| Right to erasure | Section 32 | Section 34(1)(d), Section 34(2) |
| Right to restrict processing | Section 33 | Section 34(1)(e) |
| Right to portability | Section 34 | Section 38 |
| Right to object | Section 35 | Section 36 |
| Right to automated-decision opt-out | Section 36 | Section 37 |
| Right to withdraw consent | (missing) | Section 35 |
| DPIA + prior consultation | Section 38 / 39 | Section 28 |
| Sensitive personal data | Section 27 | Section 30 |
| Cross-border adequacy | Section 41 | Section 42 |
| Cross-border SCCs / BCRs | Section 42 / 43 | Section 41(1)(a) |
| Cross-border derogations | Section 45(a)–(e) | Section 43(1)(a)–(f) |
| Right to complain to NDPC | (missing) | Section 46(1) |

> The toolkit produces guidance artifacts only — not legal advice. Verify with your DPO or qualified Nigerian privacy counsel before relying on any output for a regulatory submission.

## [3.5.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.5.0...v3.5.1) (2026-05-03)


### Bug Fixes

* **ndpr-toolkit:** TOC anchor links + unblock docs site deploy ([c2f977b](https://github.com/mr-tanta/ndpr-toolkit/commit/c2f977b6be423f633860b80331a6ee4de1dcfaf0))

## [3.5.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.4.1...v3.5.0) (2026-05-03)


### Features

* **ndpr-toolkit:** persist alias, validateDsrSubmission, hooks plugin v7, dts rollup ([f1fd29d](https://github.com/mr-tanta/ndpr-toolkit/commit/f1fd29d7ccd3fc6002ddd762d9dbc4c483e1952c))


### Documentation

* **site:** fix homepage + docs code snippets to match published API ([0ed4b13](https://github.com/mr-tanta/ndpr-toolkit/commit/0ed4b1305e57603a20bb08004479e1862740d14d))

## [3.4.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.4.0...v3.4.1) (2026-05-03)


### Bug Fixes

* **ndpr-toolkit:** {{var}} substitution + dark-mode opt-in + use-client + effectiveDate ([d8deab0](https://github.com/mr-tanta/ndpr-toolkit/commit/d8deab0876e308dd0a8fc9aef3b5dcc757c32884))


### Documentation

* **phase1:** annotate triage doc with v3.4.0 ship status ([9fb1744](https://github.com/mr-tanta/ndpr-toolkit/commit/9fb17449413ff418f263c9ac3bfbf153db438fb4))
* **readme:** sync to v3.4.0 — styled defaults, /server entry, real logo ([bf7f632](https://github.com/mr-tanta/ndpr-toolkit/commit/bf7f63239ebac623868f20d69c7d2229303d5869))

## [3.4.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.3.1...v3.4.0) (2026-05-03)


### Features

* **ndpr-toolkit:** complete BEM migration for all remaining components (3.5.x) ([052827a](https://github.com/mr-tanta/ndpr-toolkit/commit/052827a1c10390998c681d222070e797aa75acde))
* **ndpr-toolkit:** ship /server subpath for RSC-safe pure-logic imports ([5dbb24d](https://github.com/mr-tanta/ndpr-toolkit/commit/5dbb24dcd88235a4e184ef8cca7fdf105c35934d))
* **ndpr-toolkit:** styled-defaults UI strategy (B4 + S1) ([b875d3b](https://github.com/mr-tanta/ndpr-toolkit/commit/b875d3b66ad36a9df8b12431e1d95f9257537db1))


### Bug Fixes

* **ndpr-toolkit:** auto-init useDefaultPrivacyPolicy + isolate PolicyPage CSS ([550e015](https://github.com/mr-tanta/ndpr-toolkit/commit/550e015f1011d975dea90e417cd699ee2fb9187d))
* **ndpr-toolkit:** packaging — style export, CHANGELOG, RSC directives ([d0bf85b](https://github.com/mr-tanta/ndpr-toolkit/commit/d0bf85b6990f02cb4aeb3dbaa448e5d5643cde29))
* **ndpr-toolkit:** policy templates no longer ship literal placeholders to production ([6c373a8](https://github.com/mr-tanta/ndpr-toolkit/commit/6c373a8dadf21a565539888042e2be36a1ba9510))
* **ndpr-toolkit:** unblock pnpm build, document core entry honestly ([ab2f5d7](https://github.com/mr-tanta/ndpr-toolkit/commit/ab2f5d7a031300e11180e093e9b3c14b793f957a))
* **ndpr-toolkit:** use direct localStorage check to detect rehydration race ([df81d9b](https://github.com/mr-tanta/ndpr-toolkit/commit/df81d9b42720b9265964a6f6405f767cf2c152c7))


### Documentation

* **phase1:** add v3.3.1 integration feedback triage ([37b4a92](https://github.com/mr-tanta/ndpr-toolkit/commit/37b4a922f5364da8da595ca971785ddabf1a9074))
* rename external-feedback references for public release ([afb7fa0](https://github.com/mr-tanta/ndpr-toolkit/commit/afb7fa000c2c9d575bf46c26b0271896b49db04e))

## [3.3.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.3.0...v3.3.1) (2026-04-23)


### Features

* add Next.js App Router example project ([8772478](https://github.com/mr-tanta/ndpr-toolkit/commit/8772478e6cf642bc5da278ca771824f0a1d44825)), closes [#13](https://github.com/mr-tanta/ndpr-toolkit/issues/13)
* add Nigerian Pidgin (pcm) locale support ([dc31a10](https://github.com/mr-tanta/ndpr-toolkit/commit/dc31a102853c6206f86d990663ea1318e41f0297)), closes [#12](https://github.com/mr-tanta/ndpr-toolkit/issues/12)


### Bug Fixes

* patch 6 Dependabot vulnerabilities via pnpm overrides ([51695a6](https://github.com/mr-tanta/ndpr-toolkit/commit/51695a6dbe257826f5ff6c45a68d76920c9987b2))
* resolve all audit findings — docs, hydration, hooks, DX, and tests ([a0fa3a5](https://github.com/mr-tanta/ndpr-toolkit/commit/a0fa3a50a78b249e64d4e604890b4ca7c0da48e0))
* resolve type errors in DSR test files after any-to-unknown migration ([6412195](https://github.com/mr-tanta/ndpr-toolkit/commit/64121956635c65e588351b8249497a4b8aa2f56e))
* update outdated test counts and stats across docs and marketing ([b8d3845](https://github.com/mr-tanta/ndpr-toolkit/commit/b8d38453a0347d01fa79cbe4a83d87c05a98a4f2))

## [3.3.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.2.1...v3.3.0) (2026-04-23)


### Features

* i18n, accessibility, type safety, backend completion, and DX improvements ([8fa6d83](https://github.com/mr-tanta/ndpr-toolkit/commit/8fa6d830eeeec50d53b8e28076a790c31e423852))


### Bug Fixes

* resolve type errors in adapter test files for CI ([7c4b5b9](https://github.com/mr-tanta/ndpr-toolkit/commit/7c4b5b9194776f6d92b347064f447d6f681f6f7d))


### Documentation

* add comprehensive NDPA compliance guide for React/Next.js ([9be4502](https://github.com/mr-tanta/ndpr-toolkit/commit/9be450253fed53efcfe095cabe161b97a8834e05))
* add screenshots and visual badges to README ([4aff0df](https://github.com/mr-tanta/ndpr-toolkit/commit/4aff0dfb5d8d1ffb07a388ccee445aec5bdcaa54)), closes [#11](https://github.com/mr-tanta/ndpr-toolkit/issues/11)
* add v3.2.1 release blog post covering all 42 fixes ([1dd9310](https://github.com/mr-tanta/ndpr-toolkit/commit/1dd93105b6f4444cf9a6287ae6f21845c0d998d9))

## [3.2.1](https://github.com/mr-tanta/ndpr-toolkit/compare/v1.0.11...v3.2.1) (2026-04-15)


### Features

* add adapter support and compound components to Breach module ([27bc8c4](https://github.com/mr-tanta/ndpr-toolkit/commit/27bc8c4e9aec0f665e8cd2854c4a4febaf411596))
* add adapter support and compound components to CrossBorder module ([810d04f](https://github.com/mr-tanta/ndpr-toolkit/commit/810d04ff17cdf452942ba1ef1b3908efe73f3cfe))
* add adapter support and compound components to DPIA module ([87f15fb](https://github.com/mr-tanta/ndpr-toolkit/commit/87f15fb465af118e15b1ba06a92275283872984a))
* add adapter support and compound components to DSR module ([0099a4f](https://github.com/mr-tanta/ndpr-toolkit/commit/0099a4f61eb7a3a99892e2101eed151bf772829c))
* add adapter support and compound components to LawfulBasis module ([a973de4](https://github.com/mr-tanta/ndpr-toolkit/commit/a973de407b721fc20f37b2f2c1ecbee3e78bb3e8))
* add adapter support and compound components to Policy module ([4b58327](https://github.com/mr-tanta/ndpr-toolkit/commit/4b5832757249824f9b3c20cf8c375a4f80d1ab25))
* add adapter support and compound components to ROPA module ([22ee47c](https://github.com/mr-tanta/ndpr-toolkit/commit/22ee47c284e7523453d2f36719708cabdae38544))
* add adapter support to useConsent hook ([3aee8fe](https://github.com/mr-tanta/ndpr-toolkit/commit/3aee8fede3a29d5b4f94f99b0894abc5177a017e))
* add adapters entry point ([13971d1](https://github.com/mr-tanta/ndpr-toolkit/commit/13971d15abbbe25e6cb8ea677d4a9c60a5b84d2b))
* add adaptive policy section generators ([7bb28a6](https://github.com/mr-tanta/ndpr-toolkit/commit/7bb28a6b1c0d724036fe15b354c635eeece2cbc5))
* add blog system with MDX posts and SEO ([8388e0f](https://github.com/mr-tanta/ndpr-toolkit/commit/8388e0fd3fce4904bcfa98b6325743e84f22250c))
* add classNames + unstyled props to all 19 components ([c1731ff](https://github.com/mr-tanta/ndpr-toolkit/commit/c1731ff8a15fc51c88f33888703fac468be8311b))
* add compliance checker sidebar and draft save indicator ([aaa34df](https://github.com/mr-tanta/ndpr-toolkit/commit/aaa34df035d71bfcf2cabf1ef120ac0a45928c0c))
* add compliance score engine ([fc6d92a](https://github.com/mr-tanta/ndpr-toolkit/commit/fc6d92ab10814571605882cf85ddf045b5bcddd6))
* add composeAdapters for multi-target persistence ([b92f072](https://github.com/mr-tanta/ndpr-toolkit/commit/b92f07251c33b53e05df50d54e2b6daf697272f7))
* add comprehensive design system and site components ([28fc38f](https://github.com/mr-tanta/ndpr-toolkit/commit/28fc38ff2880171774761931192728c8e89425f4))
* add Consent compound sub-components ([598ea5a](https://github.com/mr-tanta/ndpr-toolkit/commit/598ea5a152b6223cb3f68056eb01ece6209285e1))
* add Consent.Provider compound component ([8b1c622](https://github.com/mr-tanta/ndpr-toolkit/commit/8b1c6225e6b5695be1d0e6bcb11009ffedfd592b))
* add create-ndpr CLI scaffolder ([60ae4dd](https://github.com/mr-tanta/ndpr-toolkit/commit/60ae4dd0b9048f9f7163509307b5e7293b8dc1f6))
* add cross-border transfer assessment module (NDPA Part VI) ([36e8160](https://github.com/mr-tanta/ndpr-toolkit/commit/36e8160f31c8103c611cc9249f9862fc9e7183ec))
* add DOCX policy export with optional dependency ([2ead6a3](https://github.com/mr-tanta/ndpr-toolkit/commit/2ead6a3152491928716ef2f2d6928a947f0c60e7))
* add Drizzle ORM schema and adapters ([dab8a2e](https://github.com/mr-tanta/ndpr-toolkit/commit/dab8a2e5680ac6339bc510090aa2864df5e5981c))
* add Drizzle schema, integration example, and documentation ([fe95508](https://github.com/mr-tanta/ndpr-toolkit/commit/fe95508528db5e57cdaba1af94031523b76af5cd))
* add Express routes and middleware ([35fcf69](https://github.com/mr-tanta/ndpr-toolkit/commit/35fcf69bf74176f25226d56ca23f7d9102b04eff))
* add HTML and Markdown policy export ([f30ea3d](https://github.com/mr-tanta/ndpr-toolkit/commit/f30ea3d72b80b2fd90e937d66abb8d820c0d279e))
* add i18n locale support with default English strings ([a0aa702](https://github.com/mr-tanta/ndpr-toolkit/commit/a0aa70221396bef638d7ddbae4f23052d7878074))
* add JSON-LD structured data to key pages for Google rich results ([ebf9298](https://github.com/mr-tanta/ndpr-toolkit/commit/ebf929887da8c0e215d334758101e7b6d23d0842))
* add lawful basis tracker module (NDPA Section 25) ([cdd39e3](https://github.com/mr-tanta/ndpr-toolkit/commit/cdd39e3e997cf81277dd0fbac1dfc571c1bd6729))
* add localStorage adapter ([a49e565](https://github.com/mr-tanta/ndpr-toolkit/commit/a49e565081b5d73f2e9806ad1e326ad689af90f5))
* add NDPA policy compliance checker with 15 requirements ([596fb27](https://github.com/mr-tanta/ndpr-toolkit/commit/596fb27c75c8588cc367f10d344dcaf21cbd67e4))
* add NDPRConsent zero-config preset ([1720afa](https://github.com/mr-tanta/ndpr-toolkit/commit/1720afad2d734ec210f6dafe5249689ac2d77100))
* add NDPRDashboard compliance dashboard component ([8579c5d](https://github.com/mr-tanta/ndpr-toolkit/commit/8579c5d41c36f74d21626406eea3013a1c4fb34b))
* add Next.js App Router API routes ([0053bdc](https://github.com/mr-tanta/ndpr-toolkit/commit/0053bdc3b7e598535fd8ae757fde432ac1b3c46e))
* add PDF policy export with cover page and TOC ([6aa2515](https://github.com/mr-tanta/ndpr-toolkit/commit/6aa251575a440936b0b120db161baf6dc75adfec))
* add policy engine types and template context ([b5fea8c](https://github.com/mr-tanta/ndpr-toolkit/commit/b5fea8c29b8ffe2edf77e785b9c9da9f276e0999))
* add policy review step with section cards and export panel ([c00e697](https://github.com/mr-tanta/ndpr-toolkit/commit/c00e697ef22b02e7afc4c472139ae408b7fe1ca1))
* add policy wizard step components (about, data, processing) ([3be7142](https://github.com/mr-tanta/ndpr-toolkit/commit/3be7142869ac3a94298425b630538bc500a4559b))
* add PolicyPage, update preset and entry points for adaptive wizard ([b2da198](https://github.com/mr-tanta/ndpr-toolkit/commit/b2da1988c19f872b658431e9ed8a5b4549705abf))
* add PostHog analytics integration ([f154d41](https://github.com/mr-tanta/ndpr-toolkit/commit/f154d41e10379fde1fd52a7dd3dda92d04c8b5ef))
* add Prisma ORM adapters for all modules ([8200979](https://github.com/mr-tanta/ndpr-toolkit/commit/820097903e3ab5eb43bf980dee7eb93d7499769d))
* add record of processing activities (ROPA) module ([54ab04e](https://github.com/mr-tanta/ndpr-toolkit/commit/54ab04ec27b1c35f80d4276f6be8313486ad5ebb))
* add REST API adapter ([42207bc](https://github.com/mr-tanta/ndpr-toolkit/commit/42207bcbe09ebccd9c924ce44790b652c44d0221))
* add sessionStorage, cookie, and memory adapters ([cc419e5](https://github.com/mr-tanta/ndpr-toolkit/commit/cc419e5ef7ad35dd3613de0b931e384337fa141d))
* add site header/footer, 5 SEO blog posts, updated sitemap ([5278c18](https://github.com/mr-tanta/ndpr-toolkit/commit/5278c1878052f32aa93f51d5d98b09d470c670ca))
* add StorageAdapter interface ([98eec0a](https://github.com/mr-tanta/ndpr-toolkit/commit/98eec0a454fd96406fc1057c8d548bde51b0bfe1))
* add useAdaptivePolicyWizard hook ([f6abf13](https://github.com/mr-tanta/ndpr-toolkit/commit/f6abf13f5bb907d435734545533478b80e01ba62))
* add zero-config presets for all remaining modules ([9ecc714](https://github.com/mr-tanta/ndpr-toolkit/commit/9ecc714d631554e384a1b64dc5a8700cde898a17))
* auto-update version and stats across the site ([cfe468f](https://github.com/mr-tanta/ndpr-toolkit/commit/cfe468f299f28b7840603ab579fc23db9be83f93))
* complete site redesign with blue primary palette ([410fac6](https://github.com/mr-tanta/ndpr-toolkit/commit/410fac688cd6ae9e860e8e36dfb3074af5f52201)), closes [#2563](https://github.com/mr-tanta/ndpr-toolkit/issues/2563)
* comprehensive SEO overhaul for organic discovery ([97d3b79](https://github.com/mr-tanta/ndpr-toolkit/commit/97d3b799b106a31b06b753fce131f79689f5ba28))
* export compliance score from core and hooks entry points ([3310797](https://github.com/mr-tanta/ndpr-toolkit/commit/3310797f2d9cadbb1a66b6234a28a4f1bce03ee7))
* export Consent compound components from consent entry point ([be2ea70](https://github.com/mr-tanta/ndpr-toolkit/commit/be2ea70dba820502732f94fbad81ae69afc261f3))
* improve internal linking and update sitemap ([2b50f33](https://github.com/mr-tanta/ndpr-toolkit/commit/2b50f33defa03cde2eef3c6ac963930ea5ed16c2))
* modular imports and lightweight core — v2.1.0 ([3cbb5a6](https://github.com/mr-tanta/ndpr-toolkit/commit/3cbb5a6ad1f4d5417d400ed43d8331b3c84739cd))
* privacy policy upgrade — adaptive wizard, compliance checker, professional exports ([a84e4f9](https://github.com/mr-tanta/ndpr-toolkit/commit/a84e4f9ca061a911a562b04022b3459e0b1a61bb))
* redesign 7 implementation guide pages ([19711fa](https://github.com/mr-tanta/ndpr-toolkit/commit/19711fad8d0e7aed22b9c1444511f3c2969a8e0f))
* redesign consent, dsr, dpia, breach demo pages ([5373a2f](https://github.com/mr-tanta/ndpr-toolkit/commit/5373a2ffffb2f100c498239d3da183e6dc803933))
* redesign consent, dsr, dpia, breach, policy component doc pages ([248ee0f](https://github.com/mr-tanta/ndpr-toolkit/commit/248ee0fb71b6c2cce36bc4f31e7116ac13c4e93c))
* redesign demo site with interactive playgrounds ([1cedd1b](https://github.com/mr-tanta/ndpr-toolkit/commit/1cedd1ba4e6b9b3a0fedd5cd9b2bfc80396945c6))
* redesign docs landing and demos landing pages ([27de488](https://github.com/mr-tanta/ndpr-toolkit/commit/27de488cbf71b7218293920b28f3bfcf3f11ac84))
* redesign homepage with new design system ([31a74ee](https://github.com/mr-tanta/ndpr-toolkit/commit/31a74ee185e7ccf681999fe970a0de16fc437e3a))
* redesign lawful-basis, cross-border, ropa, hooks doc pages ([c2455cb](https://github.com/mr-tanta/ndpr-toolkit/commit/c2455cb5c2e7821264a40453efc07a7d94c9283c))
* redesign policy, lawful-basis, cross-border, ropa demo pages ([9e00802](https://github.com/mr-tanta/ndpr-toolkit/commit/9e008025e35c51747eff2c5fb09876972e6f45ab))
* redesign v3 guide pages (adapters, compounds, presets, score, backend, styling) ([5bbc7e3](https://github.com/mr-tanta/ndpr-toolkit/commit/5bbc7e3366c98ffebb759333c772496c5dea842c))
* scaffold ndpr-recipes package with Prisma schema ([20b6943](https://github.com/mr-tanta/ndpr-toolkit/commit/20b69435f6b0f56bc057b42bd2c0577b744e50e2))
* update policy demo page with AdaptivePolicyWizard ([428176b](https://github.com/mr-tanta/ndpr-toolkit/commit/428176bb763a5a6baa0ab60de373f900d381c6d3))
* update SEO metadata, sitemap, and structured data for v3 ([aea1a06](https://github.com/mr-tanta/ndpr-toolkit/commit/aea1a060e1ec7dd8e104e3fa5ad9e4fec6cc0a32))
* use published AdaptivePolicyWizard in policy demo ([0b2d7fc](https://github.com/mr-tanta/ndpr-toolkit/commit/0b2d7fc6d4afe3fe25a7a2400cdce22b12b41990))
* use published toolkit imports in consent and DSR demos ([8d86102](https://github.com/mr-tanta/ndpr-toolkit/commit/8d86102a41b02ee7d775eaf6d1e2501cd647b562))
* use published toolkit imports in lawful-basis, cross-border, ropa demos ([bac2b3a](https://github.com/mr-tanta/ndpr-toolkit/commit/bac2b3a894009a2bd1df37b966202f152741fb0f))
* v2.2.0 — fully customizable styling with classNames + unstyled ([3558c27](https://github.com/mr-tanta/ndpr-toolkit/commit/3558c275a0d9d3dd286f8f8e242ab35f7e7bc4ae))
* v2.3.0 — theming, portal, typed callbacks, templates, provider ([9743c44](https://github.com/mr-tanta/ndpr-toolkit/commit/9743c4445d7882659bb5c45afcbea22bf580639f))
* v2.4.0 — resolve 30 developer feedback items ([01a9930](https://github.com/mr-tanta/ndpr-toolkit/commit/01a99301d4c655b8f34536284adbe8557866d022))
* v3.0.0 — layered architecture, adapters, compound components, presets, compliance score, backend recipes, CLI scaffolder, dashboard ([d46b641](https://github.com/mr-tanta/ndpr-toolkit/commit/d46b641086d10ea061191289bcaf96fe5674e0e3))


### Bug Fixes

* add @testing-library/dom peer dependency for CI compatibility ([626b517](https://github.com/mr-tanta/ndpr-toolkit/commit/626b5172e0a6c8960bcdba50b5bb298a504f8075))
* add adapters and presets to root package.json exports, exclude template packages from tsc ([178bf7f](https://github.com/mr-tanta/ndpr-toolkit/commit/178bf7fc612dd4824f9ee3a57afd15b6007a6f5b))
* add dark-mode overrides for Related Guides links and Tailwind theme classes in docs ([e26aef6](https://github.com/mr-tanta/ndpr-toolkit/commit/e26aef6d939b21650b5b1b3c480822f4cc5c3c07))
* add force-static export to robots and sitemap for static build ([b1a5791](https://github.com/mr-tanta/ndpr-toolkit/commit/b1a5791d3ccaba85a847796664a3f848d4039bdd))
* add PostHog env variables to build:lib step ([5401268](https://github.com/mr-tanta/ndpr-toolkit/commit/54012681b0fb103293675e3ee865443cadc74c26))
* add presets entry to tsup config and fix types paths ([d3805da](https://github.com/mr-tanta/ndpr-toolkit/commit/d3805da3555055bd3ddbc903f2966972be1574b6))
* consent demo toggles now update state correctly ([fc710d2](https://github.com/mr-tanta/ndpr-toolkit/commit/fc710d2841088ef936f0aeccb932748dd367807f))
* correct all ComplianceInput and ComplianceReport field names in docs ([2e64943](https://github.com/mr-tanta/ndpr-toolkit/commit/2e64943cc7ffe8b5d899e7deda4067b102db336f))
* correct code snippets in consent demo ([b6c3edf](https://github.com/mr-tanta/ndpr-toolkit/commit/b6c3edfab78df5ac1eadc4fc9aa396e06541c307))
* correct consent component and hook API references in docs ([c5b6b84](https://github.com/mr-tanta/ndpr-toolkit/commit/c5b6b8473cc0099ec8ae2980fa884fbcd86836da))
* correct consent demo code examples to match actual API ([5040aad](https://github.com/mr-tanta/ndpr-toolkit/commit/5040aadb3cd32b6b8e16bdc0159dd70d760064d0))
* correct documentation URLs to ndprtoolkit.com.ng ([7be38fe](https://github.com/mr-tanta/ndpr-toolkit/commit/7be38fecaa5b67b680ddd5a6cb52ab0018e7850c))
* correct StorageAdapter interface in docs, expand compound components guide ([92fd16e](https://github.com/mr-tanta/ndpr-toolkit/commit/92fd16e72d1aa9247811fffc9ba483f5202be080))
* deep QA audit — 50+ fixes across entire project ([adbd94c](https://github.com/mr-tanta/ndpr-toolkit/commit/adbd94cdfc74636ab02fe4910bbc68837c81c0fb))
* eliminate all 404s, broken links, and misinformation ([8d1bdb7](https://github.com/mr-tanta/ndpr-toolkit/commit/8d1bdb7725e1255025b4b2063b6e764a07d46621))
* eliminate all vulnerabilities (52 → 0) ([e6dc1b7](https://github.com/mr-tanta/ndpr-toolkit/commit/e6dc1b7455471fef453082a56ef659f16bab82cc))
* explicitly add PostHog env variables to Next.js config ([5ba341d](https://github.com/mr-tanta/ndpr-toolkit/commit/5ba341dcc20fd8968dedf842b39468b191fc86e0))
* export DSRFormSubmission and BreachFormSubmission from per-module entry points ([ae5cf79](https://github.com/mr-tanta/ndpr-toolkit/commit/ae5cf79c8301d83b910dcca2e4d8479f384ed69c)), closes [#14](https://github.com/mr-tanta/ndpr-toolkit/issues/14)
* handle missing PostHog env variables gracefully ([6851e24](https://github.com/mr-tanta/ndpr-toolkit/commit/6851e2445fb43bcc14faa424c28c8e38e26a0b8f))
* improve mobile responsiveness across all demo pages and homepage ([1027de7](https://github.com/mr-tanta/ndpr-toolkit/commit/1027de731b0b1bd8c34c5497c9439f7cec6a2f46))
* improve privacy policy demo UI with comprehensive dark-mode overrides ([ce7f3ea](https://github.com/mr-tanta/ndpr-toolkit/commit/ce7f3ea08fcdaef625d3c1a604e8726fb7dbff2a)), closes [#2563](https://github.com/mr-tanta/ndpr-toolkit/issues/2563)
* move force-static export before function declaration in sitemap ([36ee87a](https://github.com/mr-tanta/ndpr-toolkit/commit/36ee87a95594a6accecd131e010bf0c5130ab941))
* pass onGenerate prop to PolicyGenerator in demo ([dff0c05](https://github.com/mr-tanta/ndpr-toolkit/commit/dff0c059a1f55fdb2843331c56ab2b915dcc3c3c))
* preserve code block indentation and add language labels ([4cb8fca](https://github.com/mr-tanta/ndpr-toolkit/commit/4cb8fca1fca96241b4959b3ceaa6c62835f673de))
* QA audit — resolve bugs, type conflicts, and stale references ([4884735](https://github.com/mr-tanta/ndpr-toolkit/commit/48847354b7e6a187544e783a49b6f2f92942c2a2))
* redesign footer with proper attribution ([d8c9bac](https://github.com/mr-tanta/ndpr-toolkit/commit/d8c9bac0fa69f28fc5612fb8a22584df3be7a688))
* redesign navbar with better contrast and SVG logo ([4946b10](https://github.com/mr-tanta/ndpr-toolkit/commit/4946b105785882439d72a6222030fd1590ef8d33))
* reduce vulnerabilities from 60 to 14 ([9dd5614](https://github.com/mr-tanta/ndpr-toolkit/commit/9dd5614d3fade0768c1fd99d8093920931a52816))
* remove blue left border from demo cards ([a112678](https://github.com/mr-tanta/ndpr-toolkit/commit/a11267886ba00e83f37bd6f72c6a686b74f13d3c))
* reorganize static HTML for proper GitHub Pages routing ([256b31f](https://github.com/mr-tanta/ndpr-toolkit/commit/256b31f5e4efcc99c7b0cb9c7794b3a9ae303436))
* replace rainbow color palette with unified blue brand identity ([c140ff0](https://github.com/mr-tanta/ndpr-toolkit/commit/c140ff078165263a19cc36bcbe25a50ea02a992b))
* resolve 42 bugs across security, hooks, adapters, components, and utils ([d5f160f](https://github.com/mr-tanta/ndpr-toolkit/commit/d5f160f4bdbae6601b5c683c2a3c6245e2fd2727))
* resolve picomatch and flatted security vulnerabilities ([82cb446](https://github.com/mr-tanta/ndpr-toolkit/commit/82cb4463fc6a3bd8699c9a3d51e426ae3c701437))
* resolve strict TypeScript errors in test files ([085ca52](https://github.com/mr-tanta/ndpr-toolkit/commit/085ca52db4c9732c9436bf53ca2a8d3c904c411b))
* resolve type mismatches in cross-border, ropa, lawful-basis demos ([1269e6e](https://github.com/mr-tanta/ndpr-toolkit/commit/1269e6e9931eceb3c01ea0d1efa9806b3e2285fa))
* standardize docs to use pnpm and per-module imports ([fbdbf16](https://github.com/mr-tanta/ndpr-toolkit/commit/fbdbf16647d31afc28caf3347818ece2018a8b6d))
* transparent nav background, explicit gradient on CTA button ([45bd144](https://github.com/mr-tanta/ndpr-toolkit/commit/45bd144393640c1e7e8634505c8037b50bc74c94))
* unify color scheme, fix links, remove legacy-peer-deps ([e35d4c1](https://github.com/mr-tanta/ndpr-toolkit/commit/e35d4c1737f76206bc75c1a824033f8d1f570c7e))
* update demo imports to use local source and fix React bundling ([831a501](https://github.com/mr-tanta/ndpr-toolkit/commit/831a501b5b9c909e535e2f020484cab22970fedd))
* update homepage hero with accurate data ([b931230](https://github.com/mr-tanta/ndpr-toolkit/commit/b931230d8dcc1c772cee019c33870ad9d6a6c924))
* update nav colors and design tokens ([b9fb7c2](https://github.com/mr-tanta/ndpr-toolkit/commit/b9fb7c2ad45742cfcf0afc09153eee79e3de4173))
* use async useEffect for adapter load in NDPRROPA preset ([a1b3820](https://github.com/mr-tanta/ndpr-toolkit/commit/a1b38207ac488c7a400e272157894ec62afb26a1))
* use constants for PostHog env variables to ensure build-time inlining ([4ed9c1c](https://github.com/mr-tanta/ndpr-toolkit/commit/4ed9c1ca65eba51cc51c638f7c16eaed7ea93f5e))
* use existing PolicyGenerator in demo until adaptive wizard is published ([d5f195f](https://github.com/mr-tanta/ndpr-toolkit/commit/d5f195f55fa1977e3a910a6824a38f327ec45176))
* useDPIA isComplete() no longer mutates state during render ([fd7ea9d](https://github.com/mr-tanta/ndpr-toolkit/commit/fd7ea9d5f22a9987fa7e62f54704b3ed28a5fd9f))
* wrap consent demo page in ConsentProvider to fix loading issue ([8ba7cf0](https://github.com/mr-tanta/ndpr-toolkit/commit/8ba7cf09112f3a74a0187100c2291b8bd7b0fd7c))


### Documentation

* add import paths guide to docs site ([6d7e19a](https://github.com/mr-tanta/ndpr-toolkit/commit/6d7e19a6584bdc0f22e8947b1fa51375ee2f51e8))
* add internationalization and CLI scaffolder guide pages ([2dab79a](https://github.com/mr-tanta/ndpr-toolkit/commit/2dab79a46728c88a218cec32a0c9af7584d1b6f9))
* add privacy and analytics disclosure to README ([aac2c69](https://github.com/mr-tanta/ndpr-toolkit/commit/aac2c69593265d59e6cd5552a9f5b1802cdb384a))
* add v3 guides for adapters, compounds, presets, compliance score, and backend integration ([47503e2](https://github.com/mr-tanta/ndpr-toolkit/commit/47503e2a3738e951d6103205ecbc31579cd9ab9a))
* add v3 quick start sections to consent, dsr, breach component docs ([1519501](https://github.com/mr-tanta/ndpr-toolkit/commit/1519501041885c2608b3044f06f9da4aa3f2d4a6))
* expand backend integration guide and add NDPRDashboard docs ([592d63d](https://github.com/mr-tanta/ndpr-toolkit/commit/592d63d5b85f8a07d50562fef73b17403cd33141))
* overhaul documentation and demo site for NDPA 2023 ([cde6517](https://github.com/mr-tanta/ndpr-toolkit/commit/cde651729bc40436ec2b5bf062151fa1bb8eb5c6))
* rewrite README for v3.0.0 ([97fca14](https://github.com/mr-tanta/ndpr-toolkit/commit/97fca1462f813ecfbfdda9cfbc94a0d7eec493c9))
* update site homepage and docs landing for v3.0.0 ([9f6c37c](https://github.com/mr-tanta/ndpr-toolkit/commit/9f6c37c3e74c30b142de6c89bd8fd04067b02b77))


### Code Refactoring

* migrate existing modules from NDPR to NDPA 2023 ([abbec76](https://github.com/mr-tanta/ndpr-toolkit/commit/abbec7640a816c7c64a1b249581aa57e162cfe56))
* update type definitions for NDPA 2023 ([db6e5e3](https://github.com/mr-tanta/ndpr-toolkit/commit/db6e5e305f47bb729587a2cf49ef5f992d81d761))

## [3.2.0] — 2026-04-14

### Added
- **Adaptive Policy Wizard** (`AdaptivePolicyWizard`) — 4-step question-driven privacy policy generator
  - Step 1: Organization details + industry + size
  - Step 2: Data category selection (16 categories across 5 groups)
  - Step 3: Processing purposes, third-party processors, cross-border/automated toggles
  - Step 4: Review, edit, reorder sections, add custom sections, export
- **Policy section engine** (`assemblePolicy()`) — context-aware section generator producing 13 possible sections based on user answers, with industry-adapted language
- **NDPA compliance checker** (`evaluatePolicyCompliance()`) — real-time 15-requirement checklist (115 points max) with auto-fix suggestions
- **Professional PDF export** (`exportPDF()`) — cover page, table of contents, page numbers, headers/footers, NDPA compliance badge
- **DOCX export** (`exportDOCX()`) — Word document with heading styles, headers, footers (optional `docx` peer dependency)
- **HTML export** (`exportHTML()`) — self-contained responsive HTML with embedded styles, print CSS, semantic markup
- **Markdown export** (`exportMarkdown()`) — clean markdown with TOC and metadata
- **PolicyPage component** — embeddable React component for rendering policies at `/privacy-policy`
- **Draft auto-save** — adapter-backed persistence with debounced save and restore-on-reload
- **Custom sections** — UI to add, edit, reorder, and delete custom policy sections (max 10)
- **Compliance checker sidebar** — collapsible panel with score ring, requirement checklist, and "Fix it" buttons
- `useAdaptivePolicyWizard` hook with full state management, compliance tracking, and export functions
- `docx` added as optional peer dependency for Word export

### Changed
- `NDPRPrivacyPolicy` preset now renders the AdaptivePolicyWizard instead of the basic PolicyGenerator

## [3.1.0] — 2026-04-14

### Added
- Complete site redesign with new design system (dark theme, blue primary palette)
- Shared UI component library (Button, Card, Badge, Section, CodeBlock, FeatureCard, Grid, Tabs, CTASection)
- DemoLayout component for consistent demo page presentation
- Redesigned SiteHeader with sticky blur, gradient logo, and responsive mobile menu
- Redesigned SiteFooter with multi-column layout
- Redesigned DocLayout with collapsible sidebar navigation
- i18n locale support — `NDPRLocale` type, `defaultLocale` (English), `mergeLocale()` utility
- `locale` prop on NDPRProvider for global text customization
- Comprehensive SEO updates (sitemap, robots.txt, structured data)
- Prepared `@tantainnovative/create-ndpr` and `@tantainnovative/ndpr-recipes` for npm publishing

### Changed
- All documentation pages restyled with dark theme and consistent design system
- All 8 demo pages wrapped in shared DemoLayout
- Homepage hero with animated code example and 3-file quickstart tabs
- Blog listing and post pages redesigned

## [3.0.0] — 2026-04-14

### Architecture

v3 introduces a layered architecture that separates UI, state, and storage concerns. Every module now supports pluggable persistence, composable sub-components, and zero-config presets.

### Added

- **StorageAdapter pattern** — all 8 hooks accept an optional `adapter` prop for pluggable persistence
  - Built-in adapters: `localStorageAdapter`, `sessionStorageAdapter`, `cookieAdapter`, `apiAdapter`, `memoryAdapter`, `composeAdapters`
  - New `./adapters` entry point: `import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters'`
  - `composeAdapters()` writes to multiple targets simultaneously (e.g. localStorage + API)
  - `isLoading` state on all hooks for async adapter support

- **Compound components** — all 8 modules decomposed into composable sub-components
  - `Consent.Provider`, `Consent.Banner`, `Consent.AcceptButton`, `Consent.RejectButton`, `Consent.OptionList`, `Consent.SaveButton`, `Consent.Settings`, `Consent.Storage`
  - `DSR.Provider`, `DSR.Form`, `DSR.Dashboard`, `DSR.Tracker`
  - `DPIA.Provider`, `DPIA.Questionnaire`, `DPIA.Report`, `DPIA.StepIndicator`
  - `Breach.Provider`, `Breach.ReportForm`, `Breach.RiskAssessment`, `Breach.NotificationManager`, `Breach.ReportGenerator`
  - `Policy.Provider`, `Policy.Generator`, `Policy.Preview`, `Policy.Exporter`
  - `LawfulBasis.Provider`, `LawfulBasis.Tracker`
  - `CrossBorder.Provider`, `CrossBorder.Manager`
  - `ROPA.Provider`, `ROPA.Manager`

- **Zero-config presets** — 8 components that work with zero required props
  - `NDPRConsent`, `NDPRSubjectRights`, `NDPRBreachReport`, `NDPRPrivacyPolicy`, `NDPRDPIA`, `NDPRLawfulBasis`, `NDPRCrossBorder`, `NDPRROPA`
  - New `./presets` entry point: `import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets'`
  - Each preset includes NDPA-compliant defaults and accepts optional overrides

- **Compliance score engine** — `getComplianceScore()` and `useComplianceScore()`
  - Scores 0–100 across all 8 modules with NDPA section references
  - Weighted scoring (consent 20%, DSR 15%, breach 15%, policy 12%, DPIA 12%, lawful basis 10%, ROPA 8%, cross-border 8%)
  - Prioritised recommendations with effort estimates
  - Available from `/core` (no React) and `/hooks`

- **@tantainnovative/ndpr-recipes** — backend integration package (separate)
  - Prisma schema (5 NDPA compliance tables)
  - Drizzle ORM schema
  - Next.js App Router API routes (consent, DSR, breach, ROPA, compliance)
  - Express routes and middleware
  - Prisma and Drizzle ORM adapters implementing `StorageAdapter`
  - Consent verification middleware
  - Integration examples

### Changed

- All hooks now use `useCallback` and `useRef` for stable references
- `storageOptions` prop on `useConsent` deprecated in favor of `adapter` prop
- `storageKey`/`useLocalStorage` props on other hooks deprecated in favor of `adapter`

### Migration from v2

All v2 APIs continue to work unchanged. The deprecated `storageOptions`/`storageKey`/`useLocalStorage` props are mapped to built-in adapters internally. To adopt v3 features:

1. **Adapters**: Replace `storageOptions` with `adapter` prop on any hook
2. **Compound components**: Use `<Consent.Provider>` + sub-components for custom layouts
3. **Presets**: Replace boilerplate with zero-config components like `<NDPRConsent />`
4. **Compliance score**: Add `getComplianceScore()` calls to assess compliance posture

## [2.4.0] — 2026-04-07

### Added
- CSS custom properties applied to ALL 19 components (was only consent)
- Consent analytics callback (`onAnalytics` prop with ConsentAnalyticsEvent)
- Consent version enforcement — auto-shows banner when policy version changes
- Consent audit trail utility (createAuditEntry, getAuditLog, appendAuditEntry)
- `manageStorage` prop on ConsentBanner to prevent storage race conditions
- `isSubmitting` prop on DSRRequestForm and BreachReportForm with loading state
- `defaultValues` and `onReset` props on DSRRequestForm and BreachReportForm
- `useDefaultPrivacyPolicy` convenience hook (zero-config privacy policy)
- `primaryButton`/`secondaryButton` classNames aliases across 13 components
- Select All / Deselect All toggle on ConsentBanner customize panel
- Smooth transition animation on ConsentBanner customize panel
- `sanitizeInput` utility for XSS prevention on form submissions
- `data-ndpr-component` attribute with baseline focus-visible styles
- Migration guide blog post (v1.x → v2.x)
- Full classNames reference table in styling documentation (169 keys)

### Fixed
- `show` prop changes after mount now properly sync ConsentBanner visibility
- Email validation regex strengthened (was accepting "a@b.c")
- Color contrast: text-gray-500 → text-gray-600 across 14 components (WCAG AA)
- ARIA: aria-invalid, aria-describedby, role="alert" on form validation errors
- ARIA: focus management on ConsentBanner open
- Responsive: buttons stack vertically on mobile
- Input sanitization prevents XSS in form submissions

### Changed
- Zero runtime dependencies (uuid replaced with crypto.randomUUID)
- lucide-react peer dep widened from ^0.507.0 to >=0.400.0
- TypeScript module declaration added for ./styles import
- All 15 components have NDPA section reference JSDoc comments
- NDPA section references added to default component descriptions

## [2.3.0] — 2026-04-07

### Added
- CSS custom properties (design tokens) for framework-agnostic theming
  - `--ndpr-primary`, `--ndpr-primary-hover`, `--ndpr-background`, etc.
  - Dark mode tokens via `.dark` and `[data-theme="dark"]` selectors
  - Consumers can theme all components by overriding CSS variables once
- `NDPRProvider` context for shared configuration across components
  - Provides organizationName, dpoEmail, theme, unstyled globally
  - `useNDPRConfig()` hook to access config from any component
- Default policy templates — `PolicyGenerator` now works without props
  - `DEFAULT_POLICY_SECTIONS` (8 NDPA-compliant sections)
  - `DEFAULT_POLICY_VARIABLES` (8 common variables)
  - `createBusinessPolicyTemplate()` factory function
- `onValidationError` callback on DSRRequestForm and BreachReportForm
- ConsentBanner `inline` position option for embedding without portal
- ConsentBanner `zIndex` prop (default: 9999)
- Escape key dismisses ConsentBanner

### Fixed
- ConsentBanner now renders via `createPortal` to `document.body` — properly overlays page content instead of rendering inline
- ConsentBanner center position now shows with backdrop overlay
- `onSubmit` callbacks typed — `DSRFormSubmission` and `BreachFormSubmission` replace `any`
- Consent components use CSS variables instead of hardcoded `blue-600`

### Changed
- `PolicyGenerator` sections and variables props are now optional
- `./styles` CSS export now includes design tokens (was animation-only)

## [2.2.0] — 2026-04-07

### Added
- `classNames` prop on all 19 components for granular CSS class overrides
- `unstyled` prop to strip all default Tailwind classes (BYO CSS)
- `resolveClass` utility exported from `/core` and all module paths
- 194 customizable class sections across all components
- Styling & Customization guide in documentation
- Blog post: "Fully Customizable Styling"

### Changed
- Components now work with any CSS framework (Bootstrap, CSS Modules, vanilla CSS)
- Default Tailwind styling preserved — zero breaking changes
- All ClassNames type interfaces exported from barrel files

### Fixed
- Eliminated all npm audit vulnerabilities (52 → 0)
- Reduced package size 67% (512 KB → 170 KB) by excluding source maps
- Upgraded jspdf 3.x → 4.x, replaced abandoned standard-version

## [2.1.2] — 2026-04-06

### Changed
- Exclude source maps from published package (512 KB → 168 KB, 67% reduction)
- Use granular `files` globs instead of blanket `dist/` include

## [2.1.1] — 2026-04-04

### Fixed
- `useDPIA` hook: `isComplete()` no longer mutates state during render (caused infinite re-renders)
- 15 incorrect NDPA section references in PolicyGenerator and ComplianceChecklist
- NDPC naming consistency ("Nigerian" → "Nigeria" Data Protection Commission)
- Breach demo reference number flickering
- DSR demo rejected request timeline, sample due date, and scroll behavior
- DPIA demo step indicator now clickable, critical risk level reachable
- CSV export double-quote escaping per RFC 4180
- 32 form label associations for accessibility
- ARIA attributes on risk sliders and file inputs
- 22 GitHub links corrected to mr-tanta/ndpr-toolkit
- 11 incorrect API examples in READMEs
- 12 fabricated component names removed from docs
- Added MIT LICENSE file
- Removed dead tslib dependency
- Added sideEffects field for tree-shaking
- Added metadataBase for social sharing

## [2.1.0] — 2026-04-04

### Added
- Modular import paths: `/core`, `/hooks`, `/consent`, `/dsr`, `/dpia`, `/breach`, `/policy`, `/lawful-basis`, `/cross-border`, `/ropa`
- Zero-dependency `/core` entry point with all types and utility functions
- React-only `/hooks` entry point for hook consumers
- Per-module entry points for granular tree-shaking
- TypeScript `typesVersions` for IDE auto-completion on all subpaths
- Code splitting via tsup for optimal bundle size

### Changed
- UI dependencies (Radix UI, lucide-react, jspdf, class-variance-authority, clsx, tailwind-merge) moved from `dependencies` to optional `peerDependencies`
- Consumers using only `/core` or `/hooks` no longer install any UI dependencies
- Bundle is now split into shared chunks for better tree-shaking

## [2.0.0] — 2026-04-04

### Breaking Changes
- Rebranded from NDPR focus to NDPA 2023 (Nigeria Data Protection Act)
- `NotificationRequirement.nitdaNotificationRequired` → `ndpcNotificationRequired` (old field deprecated)
- `NotificationRequirement.nitdaNotificationDeadline` → `ndpcNotificationDeadline` (old field deprecated)
- `RegulatoryNotification.nitdaContact` → `ndpcContact` (old field deprecated)

### Added
- Lawful Basis Tracker module (NDPA Section 25)
- Cross-Border Transfer Assessment module (NDPA Part VI)
- Record of Processing Activities (ROPA) module
- New DSR types: 'information' (Section 29) and 'automated_decision_making' (Section 36)
- NDPC consultation fields in DPIA results
- Lawful basis field in consent settings
- NDPC registration number in organization info
- Transfer Impact Assessment types

### Changed
- All legal references updated from NDPR to NDPA 2023
- Regulatory body references updated from NITDA to NDPC
- Section references updated to NDPA sections
- Privacy policy templates updated for NDPA compliance
- Breach notification workflow targets NDPC instead of NITDA
- PostHog moved from dependencies to devDependencies

### [1.0.12](https://github.com/mr-tanta/ndpr-toolkit/compare/v1.0.11...v1.0.12) (2025-09-30)


### Bug Fixes

* reorganize static HTML for proper GitHub Pages routing ([256b31f](https://github.com/mr-tanta/ndpr-toolkit/commit/256b31f5e4efcc99c7b0cb9c7794b3a9ae303436))

### [1.0.11](https://github.com/mr-tanta/ndpr-toolkit/compare/v1.0.10...v1.0.11) (2025-09-29)


### Bug Fixes

* support custom domain and update author contact info ([cc30680](https://github.com/mr-tanta/ndpr-toolkit/commit/cc306808b63a672ae4867cfbe8ced51da11a87ec))

### [1.0.10](https://github.com/mr-tanta/ndpr-toolkit/compare/v1.0.9...v1.0.10) (2025-09-29)


### Documentation

* update author information ([8f866ef](https://github.com/mr-tanta/ndpr-toolkit/commit/8f866ef59246676a0936c43777cc9ec951d19810))

### [1.0.9](https://github.com/mr-tanta/ndpr-toolkit/compare/v1.0.8...v1.0.9) (2025-09-29)


### Bug Fixes

* correct ConsentManager usage in demo page and add gh-pages ([c742a9d](https://github.com/mr-tanta/ndpr-toolkit/commit/c742a9dca89ef3de6b82ea74ea6c1f694a50c503))
* migrate ESLint to v9 flat config and configure lint-staged ([dd6d5ad](https://github.com/mr-tanta/ndpr-toolkit/commit/dd6d5ad91245ce97bf610a3168bc7ddaf32963c7))
* resolve GitHub Actions failures - remove husky prepare script and fix pnpm lockfile compatibility ([c787ba8](https://github.com/mr-tanta/ndpr-toolkit/commit/c787ba81260a20fed999b2dc795fd21cc91f514e))

## [1.0.7] - 2025-01-10

### Added
- **Headless Mode**: Complete separation of state management from UI components
- **Enhanced useConsent Hook**: Added all requested methods (hasUserConsented, showBanner, showSettings, etc.)
- **Unstyled Components**: New unstyled component variants for complete design freedom
- **Render Props Pattern**: Support for maximum flexibility in custom implementations
- **Component Composition**: Mix and match components as needed
- **Event System**: Comprehensive event-driven consent management with `useConsentManager`
- **Position & Animation Controls**: Full control over banner positioning and animations
- **TypeScript Generics**: Support for custom consent categories with full type safety
- **Exported Utilities**: All core utilities and contexts are now accessible
- **Cookie Utils**: Helper functions for cookie management
- **Consent Storage**: Utilities for persisting consent data

### Changed
- Moved React and React DOM to peerDependencies for better compatibility
- Improved package structure with proper exports for different module systems
- Enhanced documentation with comprehensive examples

### Fixed
- Removed circular dependency (package depending on itself)
- Fixed TypeScript declarations generation
- Improved build configuration for library mode

## [1.0.6] - Previous Releases

- Initial public release with core NDPR compliance features
- Consent management system
- Data subject rights portal
- Privacy policy generator
- DPIA assessment tool
- Breach notification module