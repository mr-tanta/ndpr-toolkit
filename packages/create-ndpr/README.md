# create-ndpr

CLI scaffolder for Nigeria [NDPA 2023](https://ndpc.gov.ng/) / NDPC GAID 2025 compliance using [`@tantainnovative/ndpr-toolkit`](https://github.com/mr-tanta/ndpr-toolkit).

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
| `src/ndpr/index.ts` | Express (Prisma only) |
| `src/ndpr/routes/consent.ts` | Express + consent module |
| `ndpr.audit.json` | Always — config for the `ndpr audit` compliance gate |
| `.github/workflows/ndpr-audit.yml` | Always — CI workflow that fails on a compliance regression |

All generated files use `{{ORG_NAME}}` and `{{DPO_EMAIL}}` substituted with your answers.

The generated breach route (`app/api/breach/route.ts`) returns an `ndpcReadiness`
summary on every report — which GAID 2025 Article 33(5) notification fields are
still missing, and how many hours remain on the 72-hour clock — so you know what
to collect before filing with the NDPC.

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

### Compliance as code (GAID 2025)

Every scaffold ships an `ndpr.audit.json` config and a GitHub Actions workflow
that runs the toolkit's `ndpr audit` CLI. The audit scores your compliance
posture (consent, DSR, DPIA, breach, policy, lawful basis, cross-border, RoPA)
plus your GAID 2025 DCPMI designation inputs, and **exits non-zero when the
score drops below the threshold** — so a regression fails CI like a broken test.

```bash
# Run it locally any time:
npx ndpr audit --min-score 70
```

Edit `ndpr.audit.json` to reflect your real posture, then raise `--min-score` as
you close gaps. See the [audit CLI guide](https://ndprtoolkit.com.ng/docs/guides/audit-cli).

## Requirements

- Node.js 18+
- Zero external dependencies — works with `npx` out of the box

## Links

- Toolkit docs: https://ndprtoolkit.com.ng
- GitHub: https://github.com/mr-tanta/ndpr-toolkit
- NDPC: https://ndpc.gov.ng
