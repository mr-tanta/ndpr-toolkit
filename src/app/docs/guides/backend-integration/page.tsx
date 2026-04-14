'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function BackendIntegrationGuide() {
  return (
    <DocLayout
      title="Backend Integration"
      description="Persist consent, DSR submissions, and breach reports to a database using @tantainnovative/ndpr-recipes"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview of ndpr-recipes</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-recipes</code> is a reference implementation — not an installable library.
          Copy the files you need directly into your project and adapt them to your architecture. Each recipe is
          self-contained, fully documented, and covers two ORM families, two server frameworks, and complete wiring examples.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Coverage area</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Implementation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Database schema</td>
                <td className="border border-border px-4 py-2 text-foreground">Prisma + Drizzle ORM (PostgreSQL)</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Consent persistence</td>
                <td className="border border-border px-4 py-2 text-foreground">Prisma adapter, Drizzle adapter</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">DSR request persistence</td>
                <td className="border border-border px-4 py-2 text-foreground">Prisma adapter, Drizzle adapter</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Breach report persistence</td>
                <td className="border border-border px-4 py-2 text-foreground">Prisma adapter</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">ROPA persistence</td>
                <td className="border border-border px-4 py-2 text-foreground">Prisma adapter</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Next.js App Router</td>
                <td className="border border-border px-4 py-2 text-foreground">Consent, DSR, Breach, ROPA, Compliance route handlers</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Express</td>
                <td className="border border-border px-4 py-2 text-foreground">Full NDPR router with all five compliance routes</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Consent middleware</td>
                <td className="border border-border px-4 py-2 text-foreground">Next.js edge middleware + Express middleware</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-4 text-foreground">Copy the files you need from the recipes package into your project:</p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# Clone the toolkit repo to access the recipes
git clone https://github.com/tantainnovative/ndpr-toolkit.git

# Copy the recipes source into your project
cp -r ndpr-toolkit/packages/ndpr-recipes/src ./ndpr`}</code></pre>
        </div>
      </section>

      <section id="prisma-schema" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Prisma Schema</h2>
        <p className="mb-4 text-foreground">
          The recipes package ships a complete Prisma schema with five tables covering every NDPA compliance module.
          Copy <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">packages/ndpr-recipes/prisma/schema.prisma</code> into your project and run a migration.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Table</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Description</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">NDPA reference</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">ndpr_consent_records</td>
                <td className="border border-border px-4 py-2 text-foreground">Immutable consent audit trail. Revocation sets <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">revokedAt</code> — rows are never deleted.</td>
                <td className="border border-border px-4 py-2 text-foreground">§25–26</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">ndpr_dsr_requests</td>
                <td className="border border-border px-4 py-2 text-foreground">Data subject rights requests. Tracks type, status, and 30-day response deadline.</td>
                <td className="border border-border px-4 py-2 text-foreground">Part IV §29–36</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">ndpr_breach_reports</td>
                <td className="border border-border px-4 py-2 text-foreground">Breach incident records with 72-hour NDPC notification tracking.</td>
                <td className="border border-border px-4 py-2 text-foreground">§40</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">ndpr_processing_records</td>
                <td className="border border-border px-4 py-2 text-foreground">Record of Processing Activities (ROPA) — purpose, lawful basis, retention periods.</td>
                <td className="border border-border px-4 py-2 text-foreground">Accountability principle</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">ndpr_audit_log</td>
                <td className="border border-border px-4 py-2 text-foreground">Append-only compliance event log written automatically by each route handler.</td>
                <td className="border border-border px-4 py-2 text-foreground">§44</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Full schema</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// prisma/schema.prisma

model ConsentRecord {
  id          String    @id @default(cuid())
  subjectId   String                          // stable user/session identifier
  consents    Json                            // { analytics: true, marketing: false, ... }
  version     String                          // consent policy version (e.g. "1.2")
  method      String                          // how consent was captured (e.g. "banner", "api")
  lawfulBasis String?                         // NDPA lawful basis, e.g. "consent"
  ipAddress   String?                         // for audit evidence
  userAgent   String?                         // for audit evidence
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?                       // null = active; non-null = withdrawn

  @@index([subjectId])
  @@map("ndpr_consent_records")
}

model DSRRequest {
  id              String    @id @default(cuid())
  type            String                      // access | erasure | portability | rectification | objection | restriction
  status          String    @default("pending") // pending | in_progress | completed | rejected
  subjectName     String
  subjectEmail    String
  subjectPhone    String?
  identifierType  String                      // how the subject identified themselves
  identifierValue String                      // the actual identifier value
  description     String?
  internalNotes   String?
  assignedTo      String?
  submittedAt     DateTime  @default(now())
  acknowledgedAt  DateTime?
  completedAt     DateTime?
  dueAt           DateTime                    // 30-day statutory deadline

  @@index([status])
  @@index([subjectEmail])
  @@map("ndpr_dsr_requests")
}

model BreachReport {
  id                   String    @id @default(cuid())
  title                String
  description          String
  category             String                 // unauthorized_access | data_loss | ransomware | ...
  severity             String                 // low | medium | high | critical
  status               String    @default("ongoing") // ongoing | contained | resolved
  discoveredAt         DateTime
  occurredAt           DateTime?
  reportedAt           DateTime  @default(now())
  ndpcNotifiedAt       DateTime?              // when 72-hour notification was sent
  reporterName         String
  reporterEmail        String
  reporterDepartment   String?
  affectedSystems      Json                   // string[]
  dataTypes            Json                   // string[] — categories of data involved
  estimatedAffected    Int?                   // number of data subjects affected
  initialActions       String?                // immediate containment steps taken
  ndpcNotificationSent Boolean   @default(false)

  @@index([status])
  @@index([severity])
  @@map("ndpr_breach_reports")
}

model ProcessingRecord {
  id                String   @id @default(cuid())
  purpose           String                    // why the data is being processed
  lawfulBasis       String                    // NDPA lawful basis for processing
  dataCategories    Json                      // string[] — types of personal data
  dataSubjects      Json                      // string[] — categories of data subjects
  recipients        Json                      // string[] — who receives the data
  retentionPeriod   String                    // human-readable (e.g. "7 years")
  securityMeasures  Json                      // string[] — technical/org measures in place
  transferCountries Json?                     // string[] — countries data is transferred to
  transferMechanism String?                   // SCCs | adequacy decision | consent | ...
  dpiaConducted     Boolean  @default(false)
  status            String   @default("active") // active | inactive | archived
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("ndpr_processing_records")
}

model ComplianceAuditLog {
  id          String   @id @default(cuid())
  module      String                          // consent | dsr | breach | ropa
  action      String                          // created | updated | revoked | completed | ...
  entityId    String                          // ID of the affected record
  entityType  String                          // ConsentRecord | DSRRequest | BreachReport | ...
  changes     Json?                           // before/after snapshot of changed fields
  performedBy String?                         // user ID who triggered the action
  createdAt   DateTime @default(now())

  @@index([module, entityId])
  @@map("ndpr_audit_log")
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Run the migration</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`npx prisma migrate dev --name init-ndpr-tables
npx prisma generate`}</code></pre>
        </div>
      </section>

      <section id="prisma-adapters" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Prisma Adapters</h2>
        <p className="mb-4 text-foreground">
          The adapters in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/adapters/prisma-*.ts</code> implement the{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">StorageAdapter&lt;T&gt;</code> interface from the toolkit. Copy
          them alongside your Prisma client, then pass them to the corresponding toolkit hook.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Consent adapter</h3>
        <p className="mb-4 text-foreground">
          Follows the immutable-audit pattern required by NDPA Section 25: records are never deleted, and revocation
          sets <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">revokedAt</code> on the existing row.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { PrismaClient } from '@prisma/client';
import { prismaConsentAdapter } from '@/ndpr/adapters/prisma-consent';

const prisma = new PrismaClient();

// In a React component or server action — pass the data subject's identifier
const adapter = prismaConsentAdapter(prisma, session.userId);

// Then pass the adapter to useConsent
const { settings, updateConsent } = useConsent({ adapter });`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">DSR adapter</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { prismaDSRAdapter } from '@/ndpr/adapters/prisma-dsr';

// Scoped to the authenticated user's email address
const adapter = prismaDSRAdapter(prisma, session.user.email);

// Pass to useDSR, or call adapter.save(requests) directly in a route handler
const { requests, submitRequest } = useDSR({ adapter });`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Breach adapter</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { prismaBreachAdapter } from '@/ndpr/adapters/prisma-breach';

const adapter = prismaBreachAdapter(prisma);

// Pass to useBreach
const { reports, submitReport } = useBreach({ adapter });`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">ROPA adapter</h3>
        <p className="mb-4 text-foreground">
          Organisation metadata (name, DPO contact, address) is not stored in the database — supply it when constructing the adapter.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { prismaROPAAdapter } from '@/ndpr/adapters/prisma-ropa';

const adapter = prismaROPAAdapter(prisma, {
  organizationName: process.env.ORG_NAME!,
  organizationContact: process.env.DPO_EMAIL!,
  organizationAddress: process.env.ORG_ADDRESS!,
  ndpcRegistrationNumber: process.env.NDPC_REG_NUMBER,  // optional
});

// Pass to useROPA
const { activities, addActivity } = useROPA({ adapter });`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">
          All four adapters are exported from the central index so you can import from one place:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import {
  prismaConsentAdapter,
  prismaDSRAdapter,
  prismaBreachAdapter,
  prismaROPAAdapter,
} from '@/ndpr/adapters';`}</code></pre>
        </div>
      </section>

      <section id="drizzle-adapters" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Drizzle Support</h2>
        <p className="mb-4 text-foreground">
          If your project uses Drizzle ORM instead of Prisma, equivalent adapters are available in{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/adapters/drizzle-consent.ts</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/adapters/drizzle-dsr.ts</code>. The Drizzle schema that mirrors the
          Prisma schema lives in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/drizzle/schema.ts</code>.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Setup</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`pnpm add drizzle-orm pg @paralleldrive/cuid2
pnpm add -D drizzle-kit @types/pg`}</code></pre>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/ndpr/drizzle/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });`}</code></pre>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Push schema to DB (no migration files) or generate migration files:
npx drizzle-kit push
# or
npx drizzle-kit generate && npx drizzle-kit migrate`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Drizzle consent adapter</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { drizzleConsentAdapter } from '@/ndpr/adapters/drizzle-consent';
import { db } from '@/db';

const adapter = drizzleConsentAdapter(db, session.userId);
const { settings, updateConsent } = useConsent({ adapter });`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Drizzle DSR adapter</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { drizzleDSRAdapter } from '@/ndpr/adapters/drizzle-dsr';
import { db } from '@/db';

const adapter = drizzleDSRAdapter(db, session.user.email);
const { requests, submitRequest } = useDSR({ adapter });`}</code></pre>
        </div>
      </section>

      <section id="nextjs-routes" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next.js API Routes</h2>
        <p className="mb-4 text-foreground">
          The recipes include ready-made Next.js App Router handlers for all five compliance modules. Copy each route
          file from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/nextjs/app-router/api/</code> into your project&apos;s{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">app/api/</code> directory:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Route file</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">HTTP methods</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">api/consent/route.ts</td>
                <td className="border border-border px-4 py-2 text-foreground">GET, POST, DELETE</td>
                <td className="border border-border px-4 py-2 text-foreground">Load, save, and revoke consent records</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">api/dsr/route.ts</td>
                <td className="border border-border px-4 py-2 text-foreground">GET, POST, PATCH</td>
                <td className="border border-border px-4 py-2 text-foreground">Submit and manage data subject rights requests</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">api/breach/route.ts</td>
                <td className="border border-border px-4 py-2 text-foreground">GET, POST, PATCH</td>
                <td className="border border-border px-4 py-2 text-foreground">Log and update breach reports</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">api/ropa/route.ts</td>
                <td className="border border-border px-4 py-2 text-foreground">GET, POST, PATCH</td>
                <td className="border border-border px-4 py-2 text-foreground">Manage processing activity records</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">api/compliance/route.ts</td>
                <td className="border border-border px-4 py-2 text-foreground">GET</td>
                <td className="border border-border px-4 py-2 text-foreground">Return the current compliance score report</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Consent route — complete example</h3>
        <p className="mb-4 text-foreground">
          Below is the full consent route from the recipes package. It follows the immutable-audit pattern mandated
          by NDPA Section 25: revocation soft-deletes via <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">revokedAt</code>{' '}
          rather than hard-deleting rows, and each write is echoed to the audit log.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/api/consent/route.ts
// Copy from: src/nextjs/app-router/api/consent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/consent?subjectId=xxx
// Returns the most recent active consent record, or null if none exists.
export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId');
  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId required' }, { status: 400 });
  }

  const record = await prisma.consentRecord.findFirst({
    where: { subjectId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(record);
}

// POST /api/consent
// Body: { subjectId, consents, version, method?, lawfulBasis? }
// Soft-revokes any existing active record, then inserts the new one.
export async function POST(req: NextRequest) {
  const { subjectId, consents, version, method, lawfulBasis } = await req.json();

  if (!subjectId || !consents || !version) {
    return NextResponse.json(
      { error: 'subjectId, consents, and version are required' },
      { status: 400 },
    );
  }

  // Revoke previous active record (immutable-audit pattern — NDPA §25)
  await prisma.consentRecord.updateMany({
    where: { subjectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const record = await prisma.consentRecord.create({
    data: {
      subjectId,
      consents,
      version,
      method: method ?? 'api',
      lawfulBasis: lawfulBasis ?? null,
      ipAddress: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent'),
    },
  });

  // Audit log — accountability under NDPA §44
  await prisma.complianceAuditLog.create({
    data: {
      module: 'consent',
      action: 'created',
      entityId: record.id,
      entityType: 'ConsentRecord',
      changes: { subjectId, version, consents },
    },
  });

  return NextResponse.json(record, { status: 201 });
}

// DELETE /api/consent?subjectId=xxx
// Revokes all active consent records for the given subject.
export async function DELETE(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get('subjectId');
  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId required' }, { status: 400 });
  }

  await prisma.consentRecord.updateMany({
    where: { subjectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.complianceAuditLog.create({
    data: {
      module: 'consent',
      action: 'revoked',
      entityId: subjectId,
      entityType: 'ConsentRecord',
    },
  });

  return NextResponse.json({ success: true });
}`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">
          Wire the front-end to these endpoints using the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> from the main toolkit:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { apiAdapter } from '@tantainnovative/ndpr-toolkit';

const consentAdapter = apiAdapter({ baseUrl: '/api/consent' });
const dsrAdapter     = apiAdapter({ baseUrl: '/api/dsr' });`}</code></pre>
        </div>
      </section>

      <section id="express-routes" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Express Routes</h2>
        <p className="mb-4 text-foreground">
          For non-Next.js Node.js backends, the recipes include an Express router factory that mounts all five
          compliance routes in one call. Copy the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/express/</code> directory
          into your project, then mount it:
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import { createNDPRRouter } from './ndpr/express';

const app = express();
app.use(express.json());
app.use(cookieParser()); // required for consent cookie fallback

// Mount all NDPR compliance routes under /api/ndpr
app.use('/api/ndpr', createNDPRRouter());

app.listen(3001);`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">This mounts the following routes:</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Route</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Module</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">GET/POST/DELETE /api/ndpr/consent</td>
                <td className="border border-border px-4 py-2 text-foreground">Consent management (NDPA §25, §26)</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">GET/POST/PATCH  /api/ndpr/dsr</td>
                <td className="border border-border px-4 py-2 text-foreground">Data subject rights (NDPA §34–38)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">GET/POST/PATCH  /api/ndpr/breach</td>
                <td className="border border-border px-4 py-2 text-foreground">Breach notification (NDPA §40)</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">GET/POST/PATCH  /api/ndpr/ropa</td>
                <td className="border border-border px-4 py-2 text-foreground">Record of Processing Activities</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">GET             /api/ndpr/compliance</td>
                <td className="border border-border px-4 py-2 text-foreground">Compliance score dashboard</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Granular mounting</h3>
        <p className="mb-4 text-foreground">
          If you only need a subset of routes, import the individual routers directly:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { consentRouter, dsrRouter } from './ndpr/express';

// Mount only the routes you need
app.use('/api/consent', consentRouter);
app.use('/api/dsr',     dsrRouter);`}</code></pre>
        </div>
      </section>

      <section id="consent-middleware" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Consent Middleware</h2>
        <p className="mb-4 text-foreground">
          Both Next.js and Express recipes include consent-gate middleware. Use it to block any route that requires
          a specific consent type before processing begins — enforcing NDPA Section 25 at the HTTP layer.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Next.js — inline guard</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          The middleware looks for a subject identifier in the <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">x-subject-id</code> header
          first, then falls back to the <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">subject_id</code> cookie. Returns{' '}
          <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">null</code> to allow through, or a 403 response to block.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/api/email/marketing/route.ts
import { NextRequest } from 'next/server';
import { consentMiddleware } from '@/ndpr/middleware';

export async function POST(req: NextRequest) {
  const guard = await consentMiddleware(req, 'marketing');
  if (guard) return guard; // 403 — consent not granted

  // Subject has consented to marketing — proceed
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Next.js — higher-order wrapper</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { withConsent } from '@/ndpr/middleware';

// Wraps the handler — consent check runs before your logic
export const POST = withConsent('marketing', async (req) => {
  // marketing consent is guaranteed here
});`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Express — single consent</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { requireConsent } from './ndpr/express/middleware/consent-check';

// Require marketing consent before sending a marketing email
app.post('/email/marketing', requireConsent('marketing'), sendEmailHandler);`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Express — multiple consents</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { requireAllConsents } from './ndpr/express/middleware/consent-check';

// All listed consents must be granted
app.post(
  '/profile/analytics',
  requireAllConsents(['analytics', 'functional']),
  handler,
);`}</code></pre>
        </div>
      </section>

      <section id="cli-scaffolder" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The create-ndpr CLI Scaffolder</h2>
        <p className="mb-4 text-foreground">
          Run the scaffolder to bootstrap an entire NDPA-compliant Next.js app — including routes, pages, Prisma schema,
          environment variable templates, and example tests — in a single command:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`npx create-ndpr@latest`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The interactive CLI will ask a few questions and then scaffold the chosen features:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`? Project name: my-app
? Framework: Next.js (App Router)
? Database: PostgreSQL (Prisma)
? Which modules would you like? (space to toggle)
  ✓ Consent management
  ✓ Data subject rights (DSR)
  ✓ Breach notification
  ○ DPIA questionnaire
  ✓ Privacy policy generator
  ○ ROPA

? Include example tests? Yes
? Install dependencies now? Yes

✓ Scaffold complete!
  → src/app/api/consent/route.ts
  → src/app/api/dsr/route.ts
  → src/app/api/breach/route.ts
  → src/app/privacy-policy/page.tsx
  → src/app/data-rights/page.tsx
  → prisma/schema.prisma (NDPR tables added)
  → .env.example
  → __tests__/consent.test.ts
  → __tests__/dsr.test.ts`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Adding modules to an existing project</h3>
        <p className="mb-4 text-foreground">
          Use the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--add</code> flag to scaffold just the files you need into an existing codebase:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`npx create-ndpr@latest --add dsr --add breach --framework nextjs`}</code></pre>
        </div>
      </section>

      <section id="environment-variables" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Environment Variables</h2>
        <p className="mb-4 text-foreground">
          The scaffolder generates a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.env.example</code> file. Copy it to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.env.local</code> and fill in your values:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"

# Optional: email notifications for DSR acknowledgements
NDPR_EMAIL_FROM="privacy@myapp.ng"
NDPR_EMAIL_PROVIDER="resend"    # resend | sendgrid | nodemailer
RESEND_API_KEY="re_..."

# Optional: NDPC submission endpoint (future)
NDPC_API_KEY=""`}</code></pre>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/adapters" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Storage Adapters &rarr;
          </Link>
          <Link href="/docs/guides/data-subject-requests" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Handling Data Subject Requests &rarr;
          </Link>
          <Link href="/docs/guides/breach-notification-process" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Breach Notification Process &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
