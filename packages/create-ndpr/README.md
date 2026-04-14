# create-ndpr

CLI scaffolder for [NDPA](https://ndpr.gov.ng/) compliance using [`@tantainnovative/ndpr-toolkit`](https://github.com/tantainnovative/ndpr-toolkit).

## Usage

```bash
npx @tantainnovative/create-ndpr
```

Or with the short alias (once published to npm):

```bash
npx create-ndpr
```

Run this from the root of an existing project. The CLI detects your stack and generates the right files with no manual copy-pasting.

## What it does

1. **Detects your project setup** — checks for `next.config.*`, `express` in `package.json`, an `app/` directory (App Router vs Pages Router), `prisma/schema.prisma`, and `drizzle.config.*`.

2. **Prompts for a few details:**
   - Organisation name
   - DPO (Data Protection Officer) email address
   - Framework (auto-detected, can override)
   - ORM: Prisma / Drizzle / None
   - Which compliance modules to include

3. **Generates files** tailored to your stack.

## What it generates

| File | When |
|------|------|
| `.env.example` | Always |
| `prisma/schema.prisma` | ORM = Prisma (skips if already exists) |
| `src/drizzle/ndpr-schema.ts` | ORM = Drizzle |
| `app/ndpr-layout.tsx` | Next.js App Router |
| `app/api/consent/route.ts` | Next.js + consent module |
| `app/api/dsr/route.ts` | Next.js + dsr module |
| `app/api/breach/route.ts` | Next.js + breach module |
| `pages/api/consent.ts` | Next.js Pages Router + consent |
| `pages/api/dsr.ts` | Next.js Pages Router + dsr |
| `pages/api/breach.ts` | Next.js Pages Router + breach |
| `src/ndpr/index.ts` | Express |
| `src/ndpr/routes/consent.ts` | Express + consent module |

All generated files use `{{ORG_NAME}}` and `{{DPO_EMAIL}}` substituted with your answers.

## Modules

| Module | NDPA reference | Description |
|--------|---------------|-------------|
| `consent` | §25–26 | Consent collection, storage, and withdrawal |
| `dsr` | §34–38 | Data subject rights request intake and tracking |
| `breach` | §40 | 72-hour breach notification workflow |
| `policy` | — | Privacy policy scaffolding |
| `dpia` | — | Data Protection Impact Assessment |
| `lawful-basis` | §25 | Lawful basis register |
| `cross-border` | §43 | Cross-border data transfer management |
| `ropa` | Accountability | Record of Processing Activities |

## After generation

### With Prisma

```bash
# Copy .env.example → .env and set DATABASE_URL
cp .env.example .env

# Install dependencies
pnpm add @prisma/client @tantainnovative/ndpr-toolkit
pnpm add -D prisma

# Run migrations
pnpm prisma migrate dev --name ndpr-init
```

### With Drizzle

```bash
cp .env.example .env

pnpm add drizzle-orm @paralleldrive/cuid2 @tantainnovative/ndpr-toolkit
pnpm add -D drizzle-kit

pnpm drizzle-kit push
```

### Next.js — wire up the layout

```tsx
// app/layout.tsx
import NDPRLayout from '@/app/ndpr-layout';

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NDPRLayout>
          {children}
        </NDPRLayout>
      </body>
    </html>
  );
}
```

### Express — mount the router

```ts
import express from 'express';
import { createNDPRRouter } from './src/ndpr';

const app = express();
app.use(express.json());
app.use('/api/ndpr', createNDPRRouter());
```

## Requirements

- Node.js 18+
- Zero external dependencies — works with `npx` out of the box

## Links

- Toolkit docs: https://ndprtoolkit.com.ng
- GitHub: https://github.com/tantainnovative/ndpr-toolkit
- NDPC: https://ndpr.gov.ng
