# NDPR ecommerce starter

A complete, multi-page Next.js 15 + React 19 app that wires the
`@tantainnovative/ndpr-toolkit` modules into a realistic Nigerian ecommerce
flow. Unlike the per-module scaffolds in `examples/stackblitz/*` (which each
demonstrate one module in isolation), this starter shows the pieces working
together end-to-end:

- a site-wide **consent banner** (NDPA Section 26)
- a **privacy notice** generated from the ecommerce template (Section 27)
- a **data-subject rights portal** posting to a working API route (Sections 34–38)
- an editable **cookie preferences** page that reads/writes the same store the
  banner uses
- a **checkout** flow that makes the consent / contract distinction explicit
  (Section 25(1)(b))

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/ecommerce-starter)
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/ecommerce-starter)

## File tree

```
examples/ecommerce-starter/
├── README.md
├── package.json
├── next.config.mjs
├── tsconfig.json
├── app/
│   ├── layout.tsx              Root layout, nav, styles, ConsentRoot mount
│   ├── page.tsx                Storefront with 3 fake products + Section 27 footer
│   ├── ConsentRoot.tsx         Client wrapper around NDPRConsent
│   ├── checkout/page.tsx       Demo checkout — explains consent vs contract
│   ├── privacy/page.tsx        NDPRPrivacyPolicy seeded with the ecommerce template
│   ├── dsr/page.tsx            NDPRSubjectRights → POSTs to /api/dsr
│   ├── cookie-preferences/page.tsx   Toggle consent after the banner via useConsent
│   └── api/dsr/route.ts        Working DSR endpoint — returns referenceId + ETA
└── lib/
    └── consent-categories.ts   Shared category list used by banner + prefs page
```

The package uses the toolkit's subpath imports — `/presets/consent`,
`/presets/dsr`, `/presets/policy`, `/hooks` — so the example also serves as a
guide to the granular import surface.

## Run locally

```sh
bun install && bun dev
# or
pnpm install && pnpm dev
# or
npm install && npm run dev
```

Then open <http://localhost:3000>. The consent banner appears at the bottom
on first load; clear `localStorage` to see it again.

## What's intentionally NOT included

- A real database — DSR submissions are accepted but not persisted.
- Real email / SMS — production would email the data subject to verify
  identity and notify the DPO via your case-management system.
- A real payment provider — the checkout form is a static demo.
- Authentication — there's no signed-in user concept here. Add NextAuth or
  similar before shipping.

For a richer reference implementation with persistence and a DPO dashboard,
see `examples/nextjs-app/` in this repo.
