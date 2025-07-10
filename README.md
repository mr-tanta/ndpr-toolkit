# Nigerian Data Protection Compliance Toolkit (NDPR-Toolkit)

[![npm version](https://img.shields.io/npm/v/@tantainnovative/ndpr-toolkit.svg)](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An open-source toolkit that helps Nigerian developers implement Nigeria Data Protection Regulation (NDPR) and Data Protection Act (DPA) compliant features in their web applications.

## Installation

```bash
npm install @tantainnovative/ndpr-toolkit
# or
yarn add @tantainnovative/ndpr-toolkit
# or
pnpm add @tantainnovative/ndpr-toolkit
```

## Project Vision

This toolkit simplifies regulatory compliance for startups and businesses operating in Nigeria by providing ready-to-use components and tools for implementing data protection requirements.

## Key Components

### 1. Consent Management System

**New in v1.0.7:** Complete flexibility with headless mode, custom UI support, and event-driven architecture.

#### Features:
- **Flexible Implementation**: Use pre-built UI, headless mode, or hybrid approach
- **Full Customization**: Override any component or behavior
- **Event-Driven**: Subscribe to consent changes with event listeners
- **TypeScript Support**: Fully typed with generic support for custom categories
- **Granular Consent**: Analytics, marketing, functional, and custom categories
- **Audit Trail**: Time-stamped consent history tracking

#### Quick Start:

```tsx
import { ConsentManager } from '@tantainnovative/ndpr-toolkit';

// Basic usage with pre-built UI
function App() {
  return (
    <ConsentManager>
      {/* Your app content */}
    </ConsentManager>
  );
}

// Headless mode with custom UI
function HeadlessApp() {
  return (
    <ConsentManager headless>
      <YourCustomBanner />
      <YourCustomSettings />
    </ConsentManager>
  );
}
```

[See full consent management documentation](./docs/CONSENT_MANAGEMENT.md)

### 2. Data Subject Rights Portal
- Pre-built UI components for handling:
  - Right to access personal data
  - Right to rectification
  - Right to erasure ("right to be forgotten")
  - Right to restrict processing
  - Right to data portability
  - Dashboard for data controllers to manage requests
  - Local storage requestService to track and update requests in demos

### 3. Privacy Policy Generator
- Interactive wizard to create NDPR-compliant privacy policies
- Template system with customizable sections
- Auto-update notifications when regulatory requirements change
- Version history tracking

### 4. Data Protection Impact Assessment (DPIA) Tool
- Questionnaire-based tool to help organizations assess data processing risks
- Risk scoring matrix
- Mitigation recommendation engine
- Exportable reports for compliance documentation

### 5. Breach Notification Module
- Templates for mandatory breach notifications
- Workflow for documenting breach details
- Timeline tracking to ensure 72-hour notification compliance
- Notification delivery to authorities via API (if available)
### 6. Data Subject Request Service
- Lightweight requestService storing requests in browser localStorage for demos
- Helper methods to update request status and retrieve history

## Quick Start

### Using the Toolkit in Your Project

```tsx
import { ConsentManager, useConsent } from '@tantainnovative/ndpr-toolkit';

function App() {
  return (
    <ConsentManager onConsentChange={(consent) => console.log('Consent updated:', consent)}>
      <YourApp />
    </ConsentManager>
  );
}

function YourApp() {
  const { consentState, openSettings } = useConsent();
  
  return (
    <div>
      {consentState.analytics && <AnalyticsScript />}
      <button onClick={openSettings}>Manage Cookies</button>
    </div>
  );
}
```

### Development

To contribute or run the demo locally:

```bash
# Clone the repository
git clone https://github.com/tantainnovative/ndpr-toolkit.git
cd ndpr-toolkit

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Deployment

### GitHub Pages

This project is configured to deploy automatically to GitHub Pages using GitHub Actions. When you push changes to the `main` branch, the following will happen:

1. The GitHub Actions workflow will build the project
2. The built files will be deployed to GitHub Pages
3. Your site will be available at `https://[your-username].github.io/ndpr-toolkit/`

To manually deploy to GitHub Pages:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (if you have gh-pages installed)
npm run deploy
```

#### Configuration

The GitHub Pages deployment is configured in the following files:
- `next.config.ts` - Contains the Next.js configuration for static export
- `.github/workflows/deploy.yml` - Contains the GitHub Actions workflow for automated deployment

## Technical Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- React

## License

MIT License

## Developed by

Tanta Innovative - Positioning as a thought leader in regulatory tech solutions for Nigeria
