# @tantainnovative/ndpr-recipes

Backend recipes for NDPA compliance with @tantainnovative/ndpr-toolkit

## What is this?

This package is a **reference implementation** — not a library to install. Copy the files you need directly into your project and adapt them to fit your architecture. Each recipe is self-contained and documented.

> Do not `npm install` this package into your project. Clone or download the files and integrate them manually.

## What's included

| Directory | Contents |
|-----------|----------|
| `prisma/schema.prisma` | Prisma schema with all NDPA compliance tables |
| `src/adapters/` | Prisma `StorageAdapter<T>` implementations for all toolkit modules |
| `src/routes/nextjs/` | Next.js App Router route handlers (coming soon) |
| `src/routes/express/` | Express router recipes (coming soon) |

## Prisma Schema

The schema defines five tables:

- **`ndpr_consent_records`** — Immutable consent audit trail. Records are never deleted; revocation sets `revokedAt`.
- **`ndpr_dsr_requests`** — Data subject right requests (access, erasure, portability, etc.)
- **`ndpr_breach_reports`** — Breach incident records with NDPC notification tracking.
- **`ndpr_processing_records`** — Record of Processing Activities (ROPA) entries.
- **`ndpr_audit_log`** — General compliance audit log across all modules.

### Usage

1. Copy `prisma/schema.prisma` into your project (or merge the models into your existing schema):

```bash
cp packages/ndpr-recipes/prisma/schema.prisma prisma/schema.prisma
```

2. Set your database connection string:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"
```

3. Run migrations:

```bash
npx prisma migrate dev --name init-ndpr-tables
```

4. Generate the Prisma client:

```bash
npx prisma generate
```

## Prisma Adapters

The adapters in `src/adapters/` implement the `StorageAdapter<T>` interface from `@tantainnovative/ndpr-toolkit`. Drop them in alongside your Prisma client and pass them to the relevant toolkit hooks.

### Consent adapter

```ts
import { PrismaClient } from '@prisma/client';
import { prismaConsentAdapter } from './adapters/prisma-consent';
import { useConsent } from '@tantainnovative/ndpr-toolkit';

const prisma = new PrismaClient();
const adapter = prismaConsentAdapter(prisma, 'user-123');

// Pass to the hook
const { settings } = useConsent({ adapter });
```

### DSR adapter

```ts
import { prismaDSRAdapter } from './adapters/prisma-dsr';

const adapter = prismaDSRAdapter(prisma, 'user-123');
```

### Breach adapter

```ts
import { prismaBreachAdapter } from './adapters/prisma-breach';

const adapter = prismaBreachAdapter(prisma);
```

### ROPA adapter

```ts
import { prismaROPAAdapter } from './adapters/prisma-ropa';

const adapter = prismaROPAAdapter(prisma, {
  organizationName: 'Acme Corp',
  organizationContact: 'dpo@acme.com',
  organizationAddress: '1 Marina Road, Lagos',
});
```

## NDPA compliance references

- Consent — NDPA 2023 Sections 25–26
- Data Subject Rights — NDPA 2023 Part IV (Sections 29–36)
- Breach Notification — NDPA 2023 Section 40 (72-hour NDPC notification)
- ROPA — NDPA 2023 accountability principle

## License

MIT
