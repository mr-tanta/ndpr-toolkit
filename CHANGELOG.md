# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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