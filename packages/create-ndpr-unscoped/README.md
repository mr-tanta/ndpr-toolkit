# create-ndpr

Thin alias for [`@tantainnovative/create-ndpr`](https://www.npmjs.com/package/@tantainnovative/create-ndpr) — the Nigeria Data Protection Act (NDPA) 2023 compliance scaffolder.

## Usage

```bash
# All four of these run the same scaffolder:
npm create ndpr@latest
npx create-ndpr
npx @tantainnovative/create-ndpr
pnpm create ndpr
```

Run inside an existing Next.js / Express project to scaffold NDPA-compliant route handlers (consent / DSR / breach / DPIA / lawful basis / cross-border), a layout wrapper, optional Prisma or Drizzle schema, and a `.env.example` for your DPO contact.

## What it does

This package is a 30-line wrapper. It delegates to `@tantainnovative/create-ndpr` via `npx` so you always get the latest scaffolder without needing to re-publish this alias when the canonical package ships an update.

## Documentation

Full docs, demos, and recipes: [ndprtoolkit.com.ng](https://ndprtoolkit.com.ng)
