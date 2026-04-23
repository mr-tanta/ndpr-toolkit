# Dev.to Cross-Post Version

> Post this on Dev.to with the tag: #nigeria #react #nextjs #opensource
> Canonical URL: https://ndprtoolkit.com.ng/blog/complete-guide-ndpa-compliance-react-nextjs

---

**Title:** The Complete Guide to NDPA 2023 Compliance in React and Next.js

**Cover image:** Use a banner with "NDPA + React" branding

**Tags:** nigeria, react, nextjs, opensource

---

Does your app collect data from Nigerian users? Names, emails, phone numbers, payment details?

Then the **Nigeria Data Protection Act (NDPA) 2023** applies to you. And the fines are real — Multichoice Nigeria was hit with **N766 million** in 2024 for unlawful cross-border transfers.

I built an open-source toolkit that handles the eight compliance areas the NDPA requires. Here's the fast version.

## Install

```bash
pnpm add @tantainnovative/ndpr-toolkit
```

## 1. Consent Banner (30 seconds)

```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

export default function App() {
  return <NDPRConsent />;
}
```

One import. Legally compliant consent collection. Purpose-specific options, withdrawal mechanism, version tracking — all built in.

## 2. Data Subject Rights Portal

```tsx
import { NDPRSubjectRights } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRSubjectRights />
```

Full DSR submission form with request tracking. Covers all 8 rights under NDPA Sections 34-39.

## 3. Compliance Score

```tsx
import { getComplianceScore } from '@tantainnovative/ndpr-toolkit/core';

const report = getComplianceScore({
  consent: { hasConsentMechanism: true, /* ... */ },
  dsr: { hasRequestMechanism: true, /* ... */ },
  // ... 6 more modules
});

console.log(report.score);           // 0-100
console.log(report.rating);          // 'excellent' | 'good' | 'needs-work' | 'critical'
console.log(report.recommendations); // Sorted by priority, linked to NDPA sections
```

## What else is included?

- **DPIA Questionnaire** — guided risk assessment with conditional questions
- **Breach Notification** — 72-hour workflow with severity calculator and NDPC report generator
- **Privacy Policy Generator** — generates from structured inputs, exports to HTML/PDF/DOCX
- **Lawful Basis Tracker** — document the legal ground for every processing activity
- **Cross-Border Transfer Manager** — track transfers, assess risk, check NDPC approval requirements
- **ROPA Manager** — maintain your processing register, export for NDPC inspection

## Architecture

- 14 tree-shakeable entry points (only import what you use)
- Works with any CSS framework (Tailwind, Bootstrap, vanilla, or unstyled mode)
- Pluggable storage adapters (localStorage, cookies, REST API, compose multiple)
- 788 tests, full TypeScript, React 16.8-19 support
- Zero-config presets OR full hook-level control — your choice

## Links

- **npm:** [@tantainnovative/ndpr-toolkit](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit)
- **GitHub:** [mr-tanta/ndpr-toolkit](https://github.com/mr-tanta/ndpr-toolkit)
- **Docs & Demos:** [ndprtoolkit.com.ng](https://ndprtoolkit.com.ng)
- **Full guide:** [The Complete Guide](https://ndprtoolkit.com.ng/blog/complete-guide-ndpa-compliance-react-nextjs)

If this helps your project, a GitHub star helps other Nigerian developers find it.
