# @tantainnovative/ndpr-recipes

Backend recipes for Nigeria NDPA 2023 / NDPC GAID 2025 compliance with [@tantainnovative/ndpr-toolkit](https://github.com/mr-tanta/ndpr-toolkit).

## What is this?

This package is a **versioned reference implementation**. Install it when you want a pinned copy of the backend recipes in `node_modules`, then copy the files you need into your application and adapt them to fit your architecture. Each recipe is self-contained and heavily documented.

> The recipes are source templates, not runtime abstractions. They are published on npm so teams can pin and audit the exact recipe version they copied.

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
| DPIA persistence | Drizzle adapter, validated Next.js and Express routes |
| Next.js App Router | Consent, DSR, DPIA, Breach, ROPA, Compliance, Registration route handlers |
| Express | Full NDPR router with consent, DSR, DPIA, breach, ROPA, compliance, registration routes |
| Consent middleware | Next.js edge middleware + Express middleware |
| GAID 2025 (DCPMI + CAR) | `/registration` route — designation classification + Compliance Audit Return schedule |
| Breach Article-33 readiness | Breach detail routes return which NDPC notification fields are still missing |

---

## Available Recipes

| File | Description |
|---|---|
| `prisma/schema.prisma` | Prisma schema — NDPA compliance tables plus audit log |
| `migrations/0.3.0/postgresql.sql` | Wrapped 0.1.x/0.2.0 → 0.3.0 PostgreSQL migration for standalone psql or Prisma |
| `migrations/0.3.0/drizzle.sql` | Transaction-control-free body for a Drizzle-managed migration |
| `migrations/0.3.0/derive-drizzle.mjs` | Deterministically regenerates/checks `drizzle.sql` from the wrapped canonical script |
| `migrations/0.3.0/README.md` | Tenant/subject mapping, runner-specific commands, verification, deployment, and rollback guide |
| `src/drizzle/schema.ts` | Drizzle ORM schema — mirrors the Prisma schema |
| `src/adapters/prisma-consent.ts` | Prisma `StorageAdapter<ConsentSettings>` |
| `src/adapters/prisma-dsr.ts` | Prisma `StorageAdapter<DSRRequest[]>` |
| `src/adapters/prisma-breach.ts` | Prisma `StorageAdapter<BreachState>` |
| `src/adapters/prisma-ropa.ts` | Prisma `StorageAdapter<RecordOfProcessingActivities>` |
| `src/adapters/server-storage.ts` | Trusted tenant/subject context contracts and server capability metadata |
| `src/adapters/drizzle-consent.ts` | Drizzle `StorageAdapter<ConsentSettings>` |
| `src/adapters/drizzle-dsr.ts` | Drizzle `StorageAdapter<DSRRequest[]>` |
| `src/adapters/drizzle-breach.ts` | Drizzle `StorageAdapter<BreachState>` |
| `src/adapters/drizzle-ropa.ts` | Drizzle `StorageAdapter<RecordOfProcessingActivities>` |
| `src/adapters/drizzle-dpia.ts` | Drizzle `StorageAdapter<DPIAResult[]>` |
| `src/adapters/drizzle-lawful-basis.ts` | Drizzle `StorageAdapter<ProcessingActivity[]>` |
| `src/adapters/drizzle-cross-border.ts` | Drizzle `StorageAdapter<CrossBorderTransfer[]>` |
| `src/nextjs/app-router/request-context.ts` | Fail-closed tenant, subject, and verified-actor context seam |
| `src/nextjs/shared-contracts.ts` | Shared lossless validation and persistence contracts |
| `src/nextjs/operational-indicators.ts` | Deterministic operational evidence metadata |
| `src/nextjs/app-router/api/consent/route.ts` | Next.js consent API route with toolkit server validation |
| `src/nextjs/app-router/api/dsr/route.ts` | Next.js DSR intake and staff-list route |
| `src/nextjs/app-router/api/dsr/[id]/route.ts` | Subject-scoped detail and staff-only update route |
| `src/nextjs/app-router/api/dpia/route.ts` | Next.js DPIA API route with intake/update validation + audit logging |
| `src/nextjs/app-router/api/breach/route.ts` | Next.js breach API route with intake validation + GAID 2025 Art. 33 readiness |
| `src/nextjs/app-router/api/breach/[id]/route.ts` | Next.js breach detail/update route with lifecycle validation + readiness |
| `src/nextjs/app-router/api/ropa/route.ts` | Next.js ROPA API route with toolkit server validation |
| `src/nextjs/app-router/api/compliance/route.ts` | Next.js operational indicators API route |
| `src/nextjs/app-router/api/registration/route.ts` | Next.js DCPMI designation + CAR schedule route (GAID 2025) |
| `src/nextjs/app-router/middleware.ts` | Next.js consent gate middleware |
| `src/nextjs/app-router/layout-example.tsx` | Full wiring example for App Router |
| `src/express/index.ts` | Express router factory — mounts all routes |
| `src/express/request-context.ts` | Fail-closed Express tenant, subject, and actor context seam |
| `src/express/routes/consent.ts` | Express consent router |
| `src/express/routes/dsr.ts` | Express DSR router |
| `src/express/routes/dpia.ts` | Express DPIA router with intake/update validation + audit logging |
| `src/express/routes/breach.ts` | Express breach router with intake/update validation + GAID 2025 Art. 33 readiness |
| `src/express/routes/ropa.ts` | Express ROPA router with toolkit server validation |
| `src/express/routes/compliance.ts` | Express operational indicators router |
| `src/express/routes/registration.ts` | Express DCPMI designation + CAR schedule router (GAID 2025) |
| `src/express/middleware/consent-check.ts` | Express consent gate middleware |

---

## Quick Start

### 1. Install a pinned recipe version

```bash
pnpm add -D @tantainnovative/ndpr-recipes
pnpm add @tantainnovative/ndpr-toolkit
```

You can also browse the same files in GitHub if you prefer manual copy/paste from the repository.

### 2. Copy the database schema

**Prisma:**

```bash
# Copy into your project
cp node_modules/@tantainnovative/ndpr-recipes/prisma/schema.prisma prisma/schema.prisma
```

**Drizzle:**

```bash
# Copy the schema file
cp node_modules/@tantainnovative/ndpr-recipes/src/drizzle/schema.ts src/db/ndpr-schema.ts
```

### 3. Set up the database connection

```bash
# .env — both values are server-only
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"
NDPR_TENANT_ID="tenant-production-id"
```

### 3a. Connect verified request context

Copy the framework-specific `request-context.ts` with the routes. Its default `resolveVerifiedNDPRActor` returns `null`, so staff routes fail closed until you replace it with a verified server-session lookup. Map application roles to `ndpr:staff` or `ndpr:admin`; source actor ID, profile fields, roles, and account subject ID only from that verified lookup.

Consent and subject DSR operations require either the verified account subject or an `anon_<UUID>` capability sent in `X-NDPR-Subject-Id`. The anonymous capability grants access only to matching tenant/subject records and never grants staff privileges. Do not use bodies, query parameters, cookies, or ordinary client headers as tenant, actor, account-subject, or role authority.

### 4. Run migrations

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

### Upgrading an existing 0.1.x or 0.2.0 database

Do **not** run the initial-schema commands above against populated 0.1.x or 0.2.0 recipe tables. The 0.3.0 hardening adds required tenant/subject keys, consent replay metadata and uniqueness, composite primary keys, and lossless snapshots that a generated migration cannot safely infer.

Follow the complete [`migration and rollback guide`](./migrations/0.3.0/README.md) and use exactly one runner-specific artifact: standalone psql and Prisma copy the wrapped [`migrations/0.3.0/postgresql.sql`](./migrations/0.3.0/postgresql.sql), while a Drizzle-managed migration copies only the transaction-control-free [`migrations/0.3.0/drizzle.sql`](./migrations/0.3.0/drizzle.sql). Never put `postgresql.sql` inside Drizzle's outer transaction or add `BEGIN;`/`COMMIT;` to `drizzle.sql`. Both support the legacy Prisma camel-case and Drizzle snake-case layouts, require one explicit tenant mapping, acquire the same advisory transaction lock, deduplicate active consent without deleting history, preserve lossy fields for review, and leave unreconstructable ROPA evidence fail-closed until a human completes the documented backfill.

### 5. Copy and wire the adapters

Pick the adapter for your ORM (see sections below) and copy it into your server code. Construct database adapters only after resolving trusted tenant/subject context. Browser hooks and presets should use `apiAdapter` to call that server boundary rather than importing Prisma or Drizzle.

---

## Prisma Adapters

The adapters in `src/adapters/prisma-*.ts` implement the `StorageAdapter<T>` interface from `@tantainnovative/ndpr-toolkit`. They are server-only recipes and require explicit trusted context objects so every lookup and mutation is tenant-scoped.

### Consent adapter

Follows the immutable-audit pattern required by NDPA Section 25: records are never deleted, and revocation sets `revokedAt` on the existing row.

```ts
import { prismaConsentAdapter } from './adapters/prisma-consent';

const adapter = prismaConsentAdapter(prisma, {
  tenantId: context.tenantId,
  subjectId: context.subjectId!,
  ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
  userAgent: request.headers.get('user-agent') ?? undefined,
});

await adapter.save(validatedConsent);
```

### DSR adapter

```ts
import { prismaDSRAdapter } from './adapters/prisma-dsr';

const adapter = prismaDSRAdapter(prisma, {
  tenantId: context.tenantId,
  subjectId: context.subjectId!,
});
await adapter.save(requests);
```

### Breach adapter

```ts
import { prismaBreachAdapter } from './adapters/prisma-breach';

// Construct only after enforcing the staff context requirement.
const adapter = prismaBreachAdapter(prisma, {
  tenantId: context.tenantId,
});
```

### ROPA adapter

Organisation metadata (name, DPO contact, address) is not stored in the database — supply it when constructing the adapter.

```ts
import { prismaROPAAdapter } from './adapters/prisma-ropa';

const adapter = prismaROPAAdapter(
  prisma,
  { tenantId: context.tenantId },
  {
    organizationName: process.env.ORG_NAME!,
    organizationContact: process.env.DPO_EMAIL!,
    organizationAddress: process.env.ORG_ADDRESS!,
    ndpcRegistrationNumber: process.env.NDPC_REG_NUMBER,
  },
);
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

const adapter = drizzleConsentAdapter(db, {
  tenantId: context.tenantId,
  subjectId: context.subjectId!,
  ipAddress: request.ip,
  userAgent: request.get('user-agent'),
});
```

### DSR adapter

```ts
import { drizzleDSRAdapter } from './adapters/drizzle-dsr';

const adapter = drizzleDSRAdapter(db, {
  tenantId: context.tenantId,
  subjectId: context.subjectId!,
});
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

# Operational indicators
cp src/nextjs/app-router/api/compliance/route.ts app/api/compliance/route.ts
```

Copy `src/nextjs/app-router/request-context.ts`, `shared-contracts.ts`, and `operational-indicators.ts` with the routes and adapt their import paths. Every route is documented with its HTTP methods and body shape. Consent is tenant/subject-scoped; breach, DPIA, ROPA, compliance, registration, and DSR administration are staff-only. Mutation and accountability-audit writes occur in one transaction. Reporter, assessor/conductor, risk evidence, and audit provenance are derived from verified server context rather than client actor fields.

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NDPRLayout>{children}</NDPRLayout>
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
import { createNDPRRouter } from './ndpr/express';

const app = express();
app.use(express.json());
app.use(yourVerifiedSessionMiddleware());

// Replace resolveVerifiedNDPRActor before exposing staff routes.
app.use('/api/ndpr', createNDPRRouter());
```

This mounts:

| Route | Module |
|---|---|
| `GET/POST/DELETE /api/ndpr/consent` | Consent management |
| `GET/POST/PATCH  /api/ndpr/dsr` | Data subject rights |
| `GET/POST/PATCH  /api/ndpr/breach` | Breach notification |
| `GET/POST/PUT/DELETE /api/ndpr/dpia` | Data Protection Impact Assessments |
| `GET/POST/PATCH/DELETE /api/ndpr/ropa` | Record of Processing Activities |
| `GET             /api/ndpr/compliance` | Operational indicators |
| `GET             /api/ndpr/registration` | DCPMI designation + CAR schedule (GAID 2025) |

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

The maintained `src/nextjs/app-router/layout-example.tsx` is the complete anonymous-consent client boundary. It generates and retains a UUID capability, sends it only through `X-NDPR-Subject-Id`, enables observable load/mutation failures, retries acknowledged writes, and avoids showing a false persisted state.

The essential browser boundary is:

```tsx
import { NDPRProvider } from '@tantainnovative/ndpr-toolkit';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

const subjectId = `anon_${crypto.randomUUID()}`; // generate once, then retain
const adapter = apiAdapter('/api/consent', {
  credentials: 'same-origin',
  headers: { 'X-NDPR-Subject-Id': subjectId },
  loadFailureMode: 'throw',
  mutationFailureMode: 'throw',
});

<NDPRProvider organizationName="Your Company" dpoEmail="dpo@yourcompany.ng">
  <NDPRConsent adapter={adapter} />
</NDPRProvider>
```

Authenticated account subjects come from `resolveVerifiedNDPRActor` on the server; do not send them as trusted query/body values.

---

## GAID 2025 — DCPMI designation & breach readiness

The NDPC's General Application and Implementation Directive (GAID) 2025 added
obligations the original recipes predate. Two recipes cover them, both built on
the toolkit's React-free `/server` utilities (no extra database tables needed).

### DCPMI designation + Compliance Audit Return (`/registration`)

`classifyDCPMI` derives a likely designation tier and annual fee estimate from
the number of data subjects you process in a six-month window;
`generateComplianceAuditReturn` derives the filing schedule for those that must
file. It is classification and scheduling support, not a DPCO registration
workflow or NDPC filing portal:

- **UHL** (> 5,000 subjects) — ₦250,000/yr, files a **CAR annually**
- **EHL** (1,000–5,000) — ₦100,000/yr, files a **CAR annually**
- **OHL** (200–999) — ₦10,000/yr, **renews registration** (no CAR)

```ts
// GET /api/registration?dataSubjects=6200&commencementDate=2025-01-15
import { classifyDCPMI, generateComplianceAuditReturn } from '@tantainnovative/ndpr-toolkit/server';

const classification = classifyDCPMI({ dataSubjectsInSixMonths: 6200 });
const auditReturn = generateComplianceAuditReturn({
  commencementDate: '2025-01-15',
  tier: classification.tier, // CAR applies to UHL/EHL only
});
```

> Thresholds, fees, and deadlines follow the NDPC GAID 2025 baseline and can
> change — verify against current NDPC guidance before relying on them.

### Breach Article-33 readiness

The breach create and detail routes (`POST /api/breach`, `GET /api/breach/[id]`
in Next.js; `POST /breach`, `GET /breach/:id` in Express) return an
`ndpcReadiness` object via `assessBreachNotification` — which GAID 2025 Article
33(5) notification fields are still missing and how many hours remain on the
72-hour clock — so you know what to collect before filing. The update routes
also reject invalid status and severity values before persistence. Supply the incident contact point in the validated
`dpoContact` request field (name and email, with phone optional); the routes persist it as incident evidence. Do not set
`NDPR_DPO_NAME` or `NDPR_DPO_EMAIL` expecting these recipes to read them—the maintained routes have no such fallback.

---

## Database Schema

### Tables

| Table | Description | NDPA reference |
|---|---|---|
| `ndpr_consent_records` | Immutable consent audit trail. `revokedAt` marks withdrawal — rows are never deleted. | §25–26 |
| `ndpr_dsr_requests` | Data subject rights requests. Tracks type, status, and 30-day response deadline. | Part VI §34–38 |
| `ndpr_breach_reports` | Breach incident records with 72-hour NDPC notification tracking. | §40 |
| `ndpr_processing_records` | Record of Processing Activities (ROPA). | Accountability principle |
| `ndpr_audit_log` | Append-only compliance event log. | §44 |

### Consent immutability

The consent table follows an immutable-audit pattern: when a subject updates or withdraws consent, the old row has `revokedAt` set and a new row is inserted. At most one row per `subjectId` has `revokedAt = NULL` at any time. The route also validates the consent snapshot server-side before any write. This pattern ensures the full consent history is available for regulatory inspection without requiring separate audit log queries.

### ROPA validation before persistence

The ROPA routes accept a production-oriented processing record payload and map it to the simplified Prisma table. Before writing, they call `validateProcessingRecord` so incomplete accountability records fail fast with structured field errors. Required fields include `controllerDetails`, `lawfulBasisJustification`, `dataCategories`, `dataSubjects`, `recipients`, `retentionPeriod`, `securityMeasures`, and a `dpiaReference` whenever `dpiaRequired` is true. Use `public_interest` for public-interest processing; `public_task` is not part of the toolkit lawful-basis union.

---

## NDPA Compliance References

| Module | NDPA provision |
|---|---|
| Consent | Sections 25–26 (lawful basis, consent withdrawal) |
| Data Subject Rights | Part VI, Sections 34–38 (access, erasure, portability, etc.) |
| Breach Notification | Section 40 (72-hour notification to NDPC) |
| ROPA | Accountability principle; Schedule 1, Part 1 |
| Audit Log | Section 44 (accountability and record-keeping) |

---

## License

MIT
