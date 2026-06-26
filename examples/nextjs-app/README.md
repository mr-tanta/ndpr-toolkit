# NDPR Toolkit — Next.js App Router Example

A minimal Next.js 15 (App Router) project demonstrating [`@tantainnovative/ndpr-toolkit`](https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit).

## What's included

| Route | Feature |
|---|---|
| `/` | Compliance dashboard showing NDPA compliance scores |
| `/privacy` | Privacy policy generator wizard |
| `/dsr` | Data subject rights request form |
| `/api/consent` | Validated REST API endpoint used by the consent banner adapter |

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
└── api/consent/route.ts # Validated consent storage + audit API
```

## Notes

- The consent API validates payloads with `validateConsentStructured` from `@tantainnovative/ndpr-toolkit/server`, records request metadata, and keeps an append-only in-memory audit trail. Replace the in-memory store with Prisma, Drizzle, or your existing database for production.
- For a database-backed consent route, copy the Prisma/Drizzle recipes from `packages/ndpr-recipes`. For a full DSR intake flow, see `examples/dsr-backend-reference`.
- The compliance dashboard data is hardcoded as an example. In a real app you would compute these values from your actual compliance state.
- No custom CSS is added — the toolkit provides its own styles.
