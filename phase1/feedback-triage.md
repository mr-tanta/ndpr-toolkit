# v3.3.1 Integration Feedback Triage

Source: external integration team, 2026-05-03
Stack hit: Next 16 App Router + Turbopack + Tailwind v4

Severity scale: **P0** = ships broken policies/UI to end users. **P1** = blocks integration without a workaround. **P2** = costs hours of integrator time. **P3** = polish, strategy, future product.

Effort: **S** = <1 day. **M** = 1–3 days. **L** = >3 days, may need design discussion.

---

## P0 — must land in 3.4.0 (correctness bugs hitting end users)

| # | Issue | Files | Effort | Notes |
|---|-------|-------|--------|-------|
| B3 | Mixed `{{var}}` (substituted) and `[[var]]` (literal) placeholders; several `[[var]]` references aren't even declared, so they ship to production as `[[city]]`, `[[postalCode]]`, `[[phone]]` | `src/utils/policy/*` (templates), `src/hooks/policy/usePrivacyPolicy.ts` | S | Pick one syntax (`{{var}}`). Expand `DEFAULT_POLICY_VARIABLES`. Add `isValid()` check that scans rendered text for unfilled tokens. Add CI test: `expect(rendered).not.toMatch(/\[\[|\{\{/)` for canonical fixture. |
| B1 | `PolicyPage` injects unscoped global CSS via `exportHTML({ includeStyles: true })` — bare selectors (`body`, `article`, `h1`...) leak into host app | `src/components/policy/PolicyPage.tsx`, `src/utils/policy/exportHTML.ts` | S–M | Default `includeStyles: false`. Accept `HTMLExportOptions` prop. If keeping styles, scope every selector to `[data-ndpr-component="policy-page"]`. Better: render `policy.sections` as React, not raw HTML. |

## P1 — must land in 3.4.0 (integration blockers)

| # | Issue | Files | Effort | Notes |
|---|-------|-------|--------|-------|
| B2 | `useDefaultPrivacyPolicy` returns `policy: null` on first render; consumer has to chain `selectTemplate` → `generatePolicy` in effects | `src/hooks/policy/useDefaultPrivacyPolicy.ts` | S | When `orgInfo` is provided, auto-select default template and auto-generate. Or add sibling `useReadyPrivacyPolicy({ orgInfo })`. |
| B5 | `./styles` export has no `style` condition → Tailwind v4 / PostCSS `@import` fails | `packages/ndpr-toolkit/package.json` | XS | Add `"style": "./dist/styles.css"` to `./styles` export. One-line. |
| B4 | ~~`ConsentBanner` has no default panel/background styles~~ **DONE** in 3.5.0 — replaced inline Tailwind utilities with `.ndpr-consent-banner__*` BEM classes backed by a real `dist/styles.css`. Added `variant: 'bar'\|'card'\|'modal'` prop. Same treatment applied to ConsentManager, DSRRequestForm, and the consent compound primitives (Accept/Reject/Save/OptionList). | ~~M~~ | |

## P2 — should land in 3.4.x (DX / docs)

| # | Issue | Effort | Notes |
|---|-------|--------|-------|
| B6 | Homepage `<NDPRProvider config={...}>` snippet doesn't compile against published types | M | Add Twoslash/Shiki Twoslash on docs site so samples typecheck at build time. Also update the snippet now. |
| B7 | Demo pages return no source code when fetched (bad for LLM-assisted integration) | S | Embed literal source `<pre>` blocks on each `/ndpr-demos/*` page. |
| D1 | No "minimal Next 16 App Router" recipe in README | S | 20-line example per module showing the effect-driven init pattern. |
| D2 | Public types spread across hash-suffixed chunks (`ConsentBanner-Vxyt8SCX.d.ts`); links rot per release | S–M | Run api-extractor or typedoc to produce stable `index.d.ts`. |
| D3 | No `CHANGELOG.md` in published tarball | XS | Add `CHANGELOG.md` to `files` in `package.json`. |
| D4 | `useDefaultPrivacyPolicy({ useLocalStorage: false })` uses no-op storage instead of disabling persistence — confusing | XS | Rename to `persist`; keep deprecated alias for one minor. |
| D5 | No `"use client"` directives or SSR warnings on client-only components | S | Audit components, prefix with `"use client"` in built output (tsup `banner` or per-entry). |
| D6 | `ConsentBanner.classNames` slot map undocumented except in `.d.ts` | S | Add slot-map page with visual diagram. |
| D7 | Validation messages are English-only despite Yo/Ig/Ha/Pidgin label locales | M | Localise `useDSR().validate()` error messages via the existing i18n keys. |

## P3 — strategic / future (3.5+ or new packages)

| # | Suggestion | Effort | Notes |
|---|-----------|--------|-------|
| S1 | **Pick a UI strategy.** ~~Today: logic kit with React wrappers but no real default styles.~~ **DONE (option B)** in 3.5.0 — fully-styled drop-in via `dist/styles.css` (1442 lines, 210 BEM rules). All 30+ public components migrated from Tailwind utility classes to semantic BEM tokens: ConsentBanner, ConsentManager, DSRRequestForm, all consent compound primitives, DPIA (Questionnaire / Report / StepIndicator), Breach (Report Form / Risk Assessment / Notification Manager / Regulatory Report Generator), ROPAManager, LawfulBasisTracker, CrossBorderTransferManager, the entire Policy stack (Generator / Preview / Exporter / SectionCard / AdaptiveWizard / StepProcessing / wizard steps), and NDPRDashboard. `./unstyled` subpath shipped as the opt-out for consumers with their own design system. Stylesheet-contract tests guard 130+ BEM selectors against silent regression. Option A (shadcn-style copy CLI) deferred to 4.0 as documented. | ~~L~~ | |
| S2 | Server companion package: `@tantainnovative/ndpr-toolkit/next`, `/nest`, `/express` with typed DSR route handlers, storage adapter, mailer adapter, 30-day SLA scheduler | L | Biggest market gap — every consumer rebuilds this. |
| S3 | Compliance Console admin app (separate package or hosted SaaS): DSR queue with SLA countdown, DPIA dashboard, breach 72-hour timer, ROPA editor, audit log | XL | The upsell. OSS toolkit drives adoption; console pays bills. |
| S4 | `npx @tantainnovative/ndpr-audit <url>` — crawls a site, scores compliance, outputs fix list | M | Marketing surface + lead gen. |
| S5 | ~~RSC-safe split: `@tantainnovative/ndpr-toolkit/server` (pure logic, no React) vs `/react` (components + hooks)~~ **DONE** in 3.4.0 — `/server` subpath shipped with zero-React surface, RSC-safety enforced by build-output guard tests. The `/react` half remains optional cleanup. | ~~M~~ | |
| S6 | Discriminated DSR payload types (`requestType: 'rectification'` requires `correction_details`); branded NDPA section IDs | S | Type-system polish; high impact on consumer DX. |
| S7 | Audit `storageKeyPrefix` propagation — reviewer reports it's not applied to all internal `localStorage.setItem` calls | S | |
| S8 | Storybook + Chromatic visual regression for `<PolicyPage />`, `<ConsentBanner />`, etc. — would have caught B1 and B4 | M | |
| S9 | Consent Context publisher so consumers can react to live consent changes without each module re-reading storage | S | |
| S10 | "Tested with Next X-Y / Tailwind X-Y / Vite X-Y" matrix in docs | XS | |

---

## Recommended 3.4.0 scope (1 sprint)

Goal: zero broken policies in production, integration in <30 minutes for a default Next App Router project.

1. **B3** — fix placeholder syntax + add CI guard. (P0)
2. **B1** — scope or remove embedded CSS in `PolicyPage`. (P0)
3. **B5** — add `style` condition. (P1, one-liner)
4. **B2** — auto-init `useDefaultPrivacyPolicy`. (P1)
5. **D5** — `"use client"` directives in dist. (P2, but trivial and clears a class of consumer pain)
6. **D3** — ship `CHANGELOG.md` in tarball. (P2, one-liner)

That gives a credible 3.4.0 patch within a week. Defer B4 (banner styles) until S1 (UI strategy) is decided — fixing it twice is worse than fixing it late.

## Recommended 3.5.0 scope (next major-minor)

Pick **one** of:
- **(A)** S1 = decide + implement UI strategy → fix B4 properly → land styled defaults.
- **(B)** S2 = ship server companion package as `@tantainnovative/ndpr-toolkit/next` first; this unlocks the largest amount of consumer time-saved per LOC of toolkit code.

My take: do **B first**. Server integration is the half that's universally missing; styling is the half consumers can hack around (as the integration team did). Server companion also opens the door to S3 (console).

## Open questions for the team

1. UI strategy: A (shadcn copy-paste) or B (fully-styled drop-in)? Or keep both via `./unstyled` and a new `./styled`?
2. Is there appetite to ship a server companion now, or wait?
3. Do we want to invite the integration team's video walkthrough? Could double as a recorded reproduction of every blocker.
