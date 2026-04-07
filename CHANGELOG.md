# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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

### [1.0.12](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.11...v1.0.12) (2025-09-30)


### Bug Fixes

* reorganize static HTML for proper GitHub Pages routing ([256b31f](https://github.com/tantainnovative/ndpr-toolkit/commit/256b31f5e4efcc99c7b0cb9c7794b3a9ae303436))

### [1.0.11](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.10...v1.0.11) (2025-09-29)


### Bug Fixes

* support custom domain and update author contact info ([cc30680](https://github.com/tantainnovative/ndpr-toolkit/commit/cc306808b63a672ae4867cfbe8ced51da11a87ec))

### [1.0.10](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.9...v1.0.10) (2025-09-29)


### Documentation

* update author information ([8f866ef](https://github.com/tantainnovative/ndpr-toolkit/commit/8f866ef59246676a0936c43777cc9ec951d19810))

### [1.0.9](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.8...v1.0.9) (2025-09-29)


### Bug Fixes

* correct ConsentManager usage in demo page and add gh-pages ([c742a9d](https://github.com/tantainnovative/ndpr-toolkit/commit/c742a9dca89ef3de6b82ea74ea6c1f694a50c503))
* migrate ESLint to v9 flat config and configure lint-staged ([dd6d5ad](https://github.com/tantainnovative/ndpr-toolkit/commit/dd6d5ad91245ce97bf610a3168bc7ddaf32963c7))
* resolve GitHub Actions failures - remove husky prepare script and fix pnpm lockfile compatibility ([c787ba8](https://github.com/tantainnovative/ndpr-toolkit/commit/c787ba81260a20fed999b2dc795fd21cc91f514e))

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