# @tantainnovative/ndpr-recipes

Backend recipes for NDPA compliance with [@tantainnovative/ndpr-toolkit](https://github.com/tantainnovative/ndpr-toolkit).

## What is this?

This package is a **reference implementation** — not a library to install. Copy the files you need directly into your project and adapt them to fit your architecture. Each recipe is self-contained and heavily documented.

> Do not `npm install` this package into your project. Clone or download the files and integrate them manually.

---

## Overview

`ndpr-recipes` provides everything you need to back the `@tantainnovative/ndpr-toolkit` with a real database. It covers two ORM families, two server frameworks, and includes complete examples for wiring it all together.

### What's covered

| Coverage area | Implementation |
|---|---|
| Database schema | Prisma + Drizzle ORM (PostgreSQL) |
| Consent persistence | Prisma adapter, Drizzle adapter |
| DSR request persistence | Prisma adapter, Drizzle adapter |
| Breach report persistence | Prisma adapter |
| ROPA persistence | Prisma adapter |
| Next.js App Router | Consent, DSR, Breach, ROPA, Compliance route handlers |
| Express | Full NDPR router with consent, DSR, breach, ROPA, compliance routes |
| Consent middleware | Next.js edge middleware + Express middleware |

---

## Available Recipes

| File | Description |
|---|---|
| `prisma/schema.prisma` | Prisma schema — all 5 NDPA compliance tables |
| `src/drizzle/schema.ts` | Drizzle ORM schema — mirrors the Prisma schema |
| `src/adapters/prisma-consent.ts` | Prisma `StorageAdapter<ConsentSettings>` |
| `src/adapters/prisma-dsr.ts` | Prisma `StorageAdapter<DSRRequest[]>` |
| `src/adapters/prisma-breach.ts` | Prisma `StorageAdapter<BreachState>` |
| `src/adapters/prisma-ropa.ts` | Prisma `StorageAdapter<RecordOfProcessingActivities>` |
| `src/adapters/drizzle-consent.ts` | Drizzle `StorageAdapter<ConsentSettings>` |
| `src/adapters/drizzle-dsr.ts` | Drizzle `StorageAdapter<DSRRequest[]>` |
| `src/nextjs/app-router/api/consent/route.ts` | Next.js consent API route |
| `src/nextjs/app-router/api/dsr/route.ts` | Next.js DSR API route |
| `src/nextjs/app-router/api/breach/route.ts` | Next.js breach API route |
| `src/nextjs/app-router/api/ropa/route.ts` | Next.js ROPA API route |
| `src/nextjs/app-router/api/compliance/route.ts` | Next.js compliance score API route |
| `src/nextjs/app-router/middleware.ts` | Next.js consent gate middleware |
| `src/nextjs/app-router/layout-example.tsx` | Full wiring example for App Router |
| `src/express/index.ts` | Express router factory — mounts all routes |
| `src/express/routes/consent.ts` | Express consent router |
| `src/express/routes/dsr.ts` | Express DSR router |
| `src/express/routes/breach.ts` | Express breach router |
| `src/express/routes/ropa.ts` | Express ROPA router |
| `src/express/routes/compliance.ts` | Express compliance score router |
| `src/express/middleware/consent-check.ts` | Express consent gate middleware |

---

## Quick Start

### 1. Copy the database schema

**Prisma:**

```bash
# Copy into your project
cp packages/ndpr-recipes/prisma/schema.prisma prisma/schema.prisma
```

**Drizzle:**

```bash
# Copy the schema file
cp packages/ndpr-recipes/src/drizzle/schema.ts src/db/ndpr-schema.ts
```

### 2. Set up the database connection

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"
```

### 3. Run migrations

**Prisma:**

```bash
npx prisma migrate dev --name init-ndpr-tables
npx prisma generate
```

**Drizzle:**

```bash
npx drizzle-kit push
# or generate a migration file:
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4. Copy and wire the adapters

Pick the adapter for your ORM (see sections below), copy it into your project, and pass it to the relevant toolkit hook.

---

## Prisma Adapters

The adapters in `src/adapters/prisma-*.ts` implement the `StorageAdapter<T>` interface from `@tantainnovative/ndpr-toolkit`. Copy them alongside your Prisma client and pass them to the corresponding toolkit hook.

### Consent adapter

Follows the immutable-audit pattern required by NDPA Section 25: records are never deleted, and revocation sets `revokedAt` on the existing row.

```ts
import { PrismaClient } from '@prisma/client';
import { useConsent } from '@tantainnovative/ndpr-toolkit';
import { prismaConsentAdapter } from './adapters/prisma-consent';

const prisma = new PrismaClient();

function ConsentBanner() {
  const adapter = prismaConsentAdapter(prisma, session.userId);
  const { settings, updateConsent } = useConsent({ adapter });
  // ...
}
```

### DSR adapter

```ts
import { prismaDSRAdapter } from './adapters/prisma-dsr';

const adapter = prismaDSRAdapter(prisma, session.user.email);
// Pass to useDSR({ adapter }) or call adapter.save(requests) in a route handler
```

### Breach adapter

```ts
import { prismaBreachAdapter } from './adapters/prisma-breach';

const adapter = prismaBreachAdapter(prisma);
// Pass to useBreach({ adapter })
```

### ROPA adapter

Organisation metadata (name, DPO contact, address) is not stored in the database — supply it when constructing the adapter.

```ts
import { prismaROPAAdapter } from './adapters/prisma-ropa';

const adapter = prismaROPAAdapter(prisma, {
  organizationName: process.env.ORG_NAME!,
  organizationContact: process.env.DPO_EMAIL!,
  organizationAddress: process.env.ORG_ADDRESS!,
  ndpcRegistrationNumber: process.env.NDPC_REG_NUMBER,
});
// Pass to useROPA({ adapter })
```

---

## Drizzle Adapters

The adapters in `src/adapters/drizzle-*.ts` use the same `StorageAdapter<T>` interface but target a Drizzle `db` instance instead of Prisma. The schema lives in `src/drizzle/schema.ts`.

### Setup

```bash
pnpm add drizzle-orm pg @paralleldrive/cuid2
pnpm add -D drizzle-kit @types/pg
```

```ts
// src/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './drizzle/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

### Consent adapter

```ts
import { drizzleConsentAdapter } from './adapters/drizzle-consent';

const adapter = drizzleConsentAdapter(db, session.userId);
const { settings, updateConsent } = useConsent({ adapter });
```

### DSR adapter

```ts
import { drizzleDSRAdapter } from './adapters/drizzle-dsr';

const adapter = drizzleDSRAdapter(db, session.user.email);
const { requests, submitRequest } = useDSR({ adapter });
```

---

## Next.js Integration

### App Router route handlers

Copy the API routes from `src/nextjs/app-router/api/` into your project's `app/api/` directory:

```bash
# Consent management
cp src/nextjs/app-router/api/consent/route.ts app/api/consent/route.ts

# Data subject rights
cp src/nextjs/app-router/api/dsr/route.ts app/api/dsr/route.ts

# Breach reports
cp src/nextjs/app-router/api/breach/route.ts app/api/breach/route.ts

# ROPA
cp src/nextjs/app-router/api/ropa/route.ts app/api/ropa/route.ts

# Compliance score
cp src/nextjs/app-router/api/compliance/route.ts app/api/compliance/route.ts
```

Each route is fully documented with its HTTP methods, query params, and body shape at the top of the file.

### Consent middleware (route protection)

Protect any route that requires a specific consent type:

```ts
// app/api/email/marketing/route.ts
import { consentMiddleware } from '@/ndpr/middleware';

export async function POST(req: NextRequest) {
  const guard = await consentMiddleware(req, 'marketing');
  if (guard) return guard; // 403 if consent not granted

  // Proceed — subject has consented to marketing
}
```

Or use the higher-order wrapper:

```ts
import { withConsent } from '@/ndpr/middleware';

export const POST = withConsent('marketing', async (req) => {
  // marketing consent guaranteed here
});
```

### Full layout example

See `src/nextjs/app-router/layout-example.tsx` for a complete wiring example. Copy it to `components/ndpr-layout.tsx` and add it to your root layout:

```tsx
// app/layout.tsx
import NDPRLayout from '@/components/ndpr-layout';

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <NDPRLayout userId={session?.user?.id}>
          {children}
        </NDPRLayout>
      </body>
    </html>
  );
}
```

---

## Express Integration

### Mount the full compliance router

```ts
import express from 'express';
import cookieParser from 'cookie-parser';
import { createNDPRRouter } from './ndpr/express';

const app = express();
app.use(express.json());
app.use(cookieParser()); // required for consent cookie fallback

// Mount all NDPR compliance routes under /api/ndpr
app.use('/api/ndpr', createNDPRRouter());
```

This mounts:

| Route | Module |
|---|---|
| `GET/POST/DELETE /api/ndpr/consent` | Consent management |
| `GET/POST/PATCH  /api/ndpr/dsr` | Data subject rights |
| `GET/POST/PATCH  /api/ndpr/breach` | Breach notification |
| `GET/POST/PATCH  /api/ndpr/ropa` | Record of Processing Activities |
| `GET             /api/ndpr/compliance` | Compliance score |

### Consent middleware (route protection)

```ts
import { requireConsent } from './ndpr/express/middleware/consent-check';

// Require marketing consent before sending a marketing email
app.post('/email/marketing', requireConsent('marketing'), sendEmailHandler);

// Require multiple consents — all must be granted
import { requireAllConsents } from './ndpr/express/middleware/consent-check';
app.post('/profile/analytics', requireAllConsents(['analytics', 'functional']), handler);
```

### Use individual routers (granular mounting)

```ts
import { consentRouter, dsrRouter } from './ndpr/express';

// Mount only the routes you need
app.use('/api/consent', consentRouter);
app.use('/api/dsr', dsrRouter);
```

---

## Full Example

Below is the complete `layout-example.tsx` showing the toolkit wired up in a Next.js App Router layout with a server-backed consent adapter:

```tsx
'use client';

import React from 'react';
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit/core';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

export default function NDPRLayout({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const subjectId = userId ?? 'anonymous';

  return (
    <NDPRProvider
      organizationName="Your Company"
      dpoEmail="dpo@yourcompany.ng"
    >
      {children}

      <NDPRConsent
        adapter={apiAdapter(`/api/consent?subjectId=${subjectId}`)}
      />
    </NDPRProvider>
  );
}
```

The `apiAdapter` hits your `/api/consent` route handler (from `src/nextjs/app-router/api/consent/route.ts`), which persists consent to PostgreSQL via Prisma or Drizzle.

---

## Database Schema

### Tables

| Table | Description | NDPA reference |
|---|---|---|
| `ndpr_consent_records` | Immutable consent audit trail. `revokedAt` marks withdrawal — rows are never deleted. | §25–26 |
| `ndpr_dsr_requests` | Data subject rights requests. Tracks type, status, and 30-day response deadline. | Part IV §29–36 |
| `ndpr_breach_reports` | Breach incident records with 72-hour NDPC notification tracking. | §40 |
| `ndpr_processing_records` | Record of Processing Activities (ROPA). | Accountability principle |
| `ndpr_audit_log` | Append-only compliance event log. | §44 |

### Consent immutability

The consent table follows an immutable-audit pattern: when a subject updates or withdraws consent, the old row has `revokedAt` set and a new row is inserted. At most one row per `subjectId` has `revokedAt = NULL` at any time. This pattern ensures the full consent history is available for regulatory inspection without requiring separate audit log queries.

---

## NDPA Compliance References

| Module | NDPA provision |
|---|---|
| Consent | Sections 25–26 (lawful basis, consent withdrawal) |
| Data Subject Rights | Part IV, Sections 29–36 (access, erasure, portability, etc.) |
| Breach Notification | Section 40 (72-hour notification to NDPC) |
| ROPA | Accountability principle; Schedule 1, Part 1 |
| Audit Log | Section 44 (accountability and record-keeping) |

---

## License

MIT
