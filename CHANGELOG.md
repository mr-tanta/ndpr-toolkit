# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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