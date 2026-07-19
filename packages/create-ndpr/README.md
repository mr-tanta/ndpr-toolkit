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

Run the CLI from an existing project root. It detects the framework and ORM, asks which modules you need, and writes stack-specific integration files without overwriting an existing Prisma schema.

## What it does

1. Detects `next.config.*`, Express dependencies, App vs Pages Router directories, `prisma/schema.prisma`, and `drizzle.config.*`.
2. Prompts for the organisation, DPO email, framework, ORM, and compliance modules.
3. Generates tenant-scoped routes, a fail-closed authentication integration seam, persistence schemas, client wiring, and an `ndpr audit` CI gate.

## Generated files

| File | When |
|------|------|
| `.env.example` | Always |
| `ndpr.audit.json` and `.github/workflows/ndpr-audit.yml` | Always |
| `prisma/schema.prisma` | Prisma; skipped when a schema already exists so it can be merged manually |
| `src/drizzle/ndpr-schema.ts` and `src/drizzle/index.ts` | Drizzle |
| `ndpr/request-context.ts` or `src/ndpr/request-context.ts` | Next.js |
| `app/ndpr-layout.tsx` or `pages/ndpr-provider.tsx` | Next.js + consent |
| `app/api/<module>/route.ts` | Next.js App Router backend modules |
| `pages/api/<module>.ts` | Next.js Pages Router backend modules |
| `src/ndpr/request-context.ts`, `src/ndpr/index.ts` | Express |
| `src/ndpr/routes/<module>.ts` | Express backend modules |

Maintained persistence routes are generated for consent, DSR, breach, DPIA, lawful-basis, and cross-border modules. Policy and ROPA choices remain represented in the compliance-audit configuration but do not currently generate backend routes.

The breach create route returns an `ndpcReadiness` summary showing missing GAID 2025 Article 33(5) notification evidence and the remaining time in the 72-hour window. Reporter identity is taken from the verified staff profile, never from request-body reporter fields.

## Security contract

Generated routes intentionally fail closed until you connect `resolveVerifiedNDPRActor` in the request-context file to verified server authentication:

- `NDPR_TENANT_ID` is the server-controlled tenant boundary. Request bodies, query parameters, cookies, and arbitrary headers are not tenant authority.
- A verified actor contains `id`, `displayName`, `email`, optional `department` and account `subjectId`, plus server-mapped roles.
- Staff routes require exactly `ndpr:staff` or `ndpr:admin`; authentication without one of those roles returns 403.
- Anonymous consent/DSR access accepts only an `anon_<UUID>` capability in `X-NDPR-Subject-Id`. It never grants staff access.
- Account actor, profile, subject, and role values must come from a verified session—not client input.
- Prisma and Drizzle business mutations write their accountability audit row in the same transaction.
- Consent replacement is serializable, replay-aware, and protected by one-active-record uniqueness. Preserve the generated `timestamp` and `hasInteracted` fields and apply the generated unique index in your migration.
- The no-ORM stores are development-only and are not durable compliance evidence.

## Modules

| Module | NDPA reference | Generated backend |
|--------|----------------|:-----------------:|
| `consent` | §25–26 | Yes |
| `dsr` | §34–38 | Yes |
| `breach` | §40 | Yes |
| `dpia` | §28 | Yes |
| `lawful-basis` | §25 | Yes |
| `cross-border` | §41–43 | Yes |
| `policy` | §27 | Audit config only |
| `ropa` | §29 | Audit config only |

## After generation

### Prisma

```bash
cp .env.example .env
pnpm add @prisma/client @tantainnovative/ndpr-toolkit
pnpm add -D prisma
pnpm prisma migrate dev --name ndpr-init
```

If the CLI skipped an existing `prisma/schema.prisma`, merge the generated models and indexes deliberately before migrating.

### Drizzle

```bash
cp .env.example .env
pnpm add drizzle-orm @paralleldrive/cuid2 @tantainnovative/ndpr-toolkit
pnpm add -D drizzle-kit
```

Pass your existing Drizzle instance to the generated seam once during server startup, then run the migration command appropriate to your pinned Drizzle setup:

```ts
import { configureNDPRDatabase } from './src/drizzle';
import { db } from './src/db';

configureNDPRDatabase(db);
```

### Next.js App Router

```tsx
// app/layout.tsx
import NDPRClientProvider from './ndpr-layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NDPRClientProvider>{children}</NDPRClientProvider>
      </body>
    </html>
  );
}
```

For Pages Router, wrap your page component with the generated provider from `pages/ndpr-provider.tsx` in `pages/_app.tsx`.

### Express

```ts
import express from 'express';
import { createNDPRRouter } from './src/ndpr';

const app = express();
app.use(express.json());
app.use('/api/ndpr', createNDPRRouter());
```

## Compliance as code

Every scaffold includes `ndpr.audit.json` and a GitHub Actions workflow that runs `ndpr audit`. Update the configuration to match the real implementation, then use a minimum score as a CI gate:

```bash
npx ndpr audit --min-score 70
```

The audit is implementation support, not legal advice. Verify current NDPC requirements before relying on its output for a filing.

## Requirements

- Node.js 18+
- The CLI itself has zero runtime dependencies.

## Links

- Toolkit docs: https://ndprtoolkit.com.ng
- GitHub: https://github.com/mr-tanta/ndpr-toolkit
- NDPC: https://ndpc.gov.ng
