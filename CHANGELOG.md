# Changelog

All notable changes to this project will be documented in this file.

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