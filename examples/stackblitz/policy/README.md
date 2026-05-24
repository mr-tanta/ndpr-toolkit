# NDPR Privacy Policy — StackBlitz demo

Minimal Next.js 15 + React 19 scaffold that boots the `NDPRPrivacyPolicy`
preset. Walks through an adaptive wizard that produces a Section 27-compliant
privacy notice. Seeded with the `saas` sector template so the page is
populated immediately; the generated policy is logged to the browser console.

Includes the optional `jspdf` and `docx` peers for in-browser PDF/DOCX export.

Covers NDPA 2023 Section 27 (information to be given to data subjects).

- Preset: `NDPRPrivacyPolicy` from `@tantainnovative/ndpr-toolkit/presets/policy`
- Run locally: `npm install && npm run dev`

Open in StackBlitz:
https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/policy
