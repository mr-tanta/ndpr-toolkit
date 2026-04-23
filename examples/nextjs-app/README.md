# NDPR Toolkit — Next.js App Router Example

A minimal Next.js 15 (App Router) project demonstrating [`@tantainnovative/ndpr-toolkit`](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit).

## What's included

| Route | Feature |
|---|---|
| `/` | Compliance dashboard showing NDPA compliance scores |
| `/privacy` | Privacy policy generator wizard |
| `/dsr` | Data subject rights request form |
| `/api/consent` | REST API endpoint used by the consent banner adapter |

The root layout wraps the app in `NDPRProvider` (org name, DPO email, NDPC registration) and renders an `NDPRConsent` banner with an API-backed storage adapter.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
├── layout.tsx          # NDPRProvider + NDPRConsent preset
├── page.tsx            # Compliance dashboard
├── privacy/page.tsx    # Privacy policy generator
├── dsr/page.tsx        # Data subject rights portal
└── api/consent/route.ts # Consent storage API
```

## Notes

- The consent API uses in-memory storage. Replace with a database for production.
- The compliance dashboard data is hardcoded as an example. In a real app you would compute these values from your actual compliance state.
- No custom CSS is added — the toolkit provides its own styles.
