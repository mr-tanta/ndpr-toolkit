'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const routeRows = [
  ['Consent', 'GET, POST, DELETE', 'Verified subject', 'Tenant/subject-scoped snapshots and revocation'],
  ['DSR', 'GET, POST, PATCH', 'Subject intake; staff administration', 'Tenant/subject intake and staff workflow'],
  ['DPIA', 'GET, POST, PUT, DELETE', 'NDPR staff', 'Lossless assessment snapshots and derived risk evidence'],
  ['Breach', 'GET, POST, PATCH', 'NDPR staff', 'Incident evidence and NDPC readiness metadata'],
  ['ROPA', 'GET, POST, PATCH, DELETE', 'NDPR staff', 'Complete processing records and lossless snapshots'],
  ['Compliance', 'GET', 'NDPR staff', 'Server-calculated implementation-readiness indicators; not legal certification'],
  ['Registration', 'GET', 'NDPR staff', 'DCPMI classification and CAR schedule'],
] as const;

export default function BackendIntegrationGuide() {
  return (
    <DocLayout
      title="Backend Integration"
      description="Deploy the tenant-scoped, fail-closed Next.js, Express, Prisma, and Drizzle source recipes from @tantainnovative/ndpr-recipes."
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Use the recipes as owned source</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-recipes</code>{' '}
          is a versioned source package, not a hosted persistence service. Pin a version, copy the schema, request-context
          seam, routes, and adapters that you need, then connect them to your authentication and deployment conventions.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`pnpm add @tantainnovative/ndpr-toolkit
pnpm add -D @tantainnovative/ndpr-recipes

# Prisma schema
cp node_modules/@tantainnovative/ndpr-recipes/prisma/schema.prisma prisma/schema.prisma

# Copy source before adapting imports and auth integration
cp -r node_modules/@tantainnovative/ndpr-recipes/src src/ndpr-recipes`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Keep copied recipe files in your own source control. Future package updates should be reviewed and merged like
          application code rather than copied over local authentication, retention, or audit changes.
        </p>
      </section>

      <section id="security-context" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Connect the security context first</h2>
        <p className="mb-4 text-foreground">
          Every maintained route resolves identity through{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">request-context.ts</code> before
          accessing Prisma. The default actor resolver returns no actor, so staff routes fail closed until you connect a
          verified server session.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# Server-only configuration
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"
NDPR_TENANT_ID="tenant-production-id"`}</code></pre>
        </div>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-6">
          <li><code className="bg-card border border-border px-1 py-0.5 rounded text-xs">NDPR_TENANT_ID</code> is the only tenant authority used by the recipes.</li>
          <li>Map verified application roles to <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">ndpr:staff</code> or <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">ndpr:admin</code>.</li>
          <li>Resolve actor ID, profile fields, roles, and account subject ID from a verified server session, never a body, query string, cookie, or arbitrary identity header.</li>
          <li>Validate and normalize authoritative profile fields, especially staff email, in your authentication integration; server derivation prevents client impersonation but does not certify arbitrary profile strings.</li>
          <li>Consent and subject DSR operations require a verified account subject or an <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">anon_&lt;UUID&gt;</code> capability in <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">X-NDPR-Subject-Id</code>.</li>
          <li>DPIA, breach, ROPA, compliance, registration, and DSR administration require a verified staff actor.</li>
        </ul>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Replace the fail-closed default in request-context.ts.
export async function resolveVerifiedNDPRActor(request: NextRequest) {
  const session = await resolveYourVerifiedSession(request);
  if (!session?.user) return null;

  return {
    id: session.user.id,
    displayName: session.user.name,
    email: session.user.email,
    subjectId: session.user.dataSubjectId,
    roles: session.user.canManagePrivacy ? ['ndpr:staff'] : [],
  };
}`}</code></pre>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
          <p className="m-0 text-sm leading-relaxed text-foreground">
            Do not restore the old <code className="px-1">?subjectId=...</code> pattern. Request bodies and query
            parameters cannot choose a tenant, subject, actor, role, reporter, assessor, or audit principal.
          </p>
        </div>
      </section>

      <section id="database-schema" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Install the canonical database schema</h2>
        <p className="mb-4 text-foreground">
          Copy the schema file instead of recreating it from a shortened documentation model. The maintained Prisma and
          Drizzle schemas include tenant keys and indexes, active-consent uniqueness, soft-removal fields, lossless JSON
          snapshots, and tenant/actor-scoped audit indexes.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# Fresh databases only — review before applying
# Prisma
cp node_modules/@tantainnovative/ndpr-recipes/prisma/schema.prisma prisma/schema.prisma
pnpm exec prisma migrate dev --name add-ndpr-compliance
pnpm exec prisma generate

# Drizzle
cp node_modules/@tantainnovative/ndpr-recipes/src/drizzle/schema.ts src/db/ndpr-schema.ts
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate`}</code></pre>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
          <p className="m-0 text-sm leading-relaxed text-foreground">
            Those generation commands are for a fresh database. For populated 0.1.x or 0.2.0 recipe tables, do not use a blind{' '}
            <code className="px-1">db push</code> or an auto-generated replacement migration. Use the packaged,
            reviewed <code className="px-1">migrations/0.3.0/postgresql.sql</code> for standalone psql/Prisma, or the
            transaction-control-free <code className="px-1">migrations/0.3.0/drizzle.sql</code> inside Drizzle&apos;s
            managed transaction so schema changes and its ledger insert remain atomic. Follow the mapping, rehearsal,
            evidence-backfill, verification, and rollback steps in the{' '}
            <Link href="/docs/guides/production-recipes" className="text-primary hover:underline">
              Production Recipes guide
            </Link>.
          </p>
        </div>
        <p className="mb-4 text-foreground">
          Review every fresh-install or upgrade migration before applying it. Preserve compound tenant keys and tenant
          predicates if you merge the models into an existing schema.
        </p>
      </section>

      <section id="server-adapters" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Construct database adapters on the server</h2>
        <p className="mb-4 text-foreground">
          Prisma and Drizzle adapters require explicit trusted context objects. They are server-only persistence code;
          do not import a database client into a React component. A browser hook or preset should call your route through
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> instead.
        </p>
        <h3 className="text-xl font-bold text-foreground mb-3">Prisma contexts</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import {
  prismaBreachAdapter,
  prismaConsentAdapter,
  prismaDSRAdapter,
  prismaROPAAdapter,
} from '@/ndpr-recipes/adapters';

// Resolve this context and enforce its requirement before construction.
const subject = {
  tenantId: context.tenantId,
  subjectId: context.subjectId!,
};

const consent = prismaConsentAdapter(prisma, {
  ...subject,
  ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
  userAgent: request.headers.get('user-agent') ?? undefined,
});
const dsr = prismaDSRAdapter(prisma, subject);

// Staff-only workflows still receive tenant scope explicitly.
const breach = prismaBreachAdapter(prisma, { tenantId: context.tenantId });
const ropa = prismaROPAAdapter(
  prisma,
  { tenantId: context.tenantId },
  {
    organizationName: process.env.ORG_NAME!,
    organizationContact: process.env.DPO_EMAIL!,
    organizationAddress: process.env.ORG_ADDRESS!,
  },
);`}</code></pre>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">Drizzle contexts</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`const subject = {
  tenantId: context.tenantId,
  subjectId: context.subjectId!,
};

const consent = drizzleConsentAdapter(db, {
  ...subject,
  ipAddress: request.ip,
  userAgent: request.get('user-agent'),
});
const dsr = drizzleDSRAdapter(db, subject);`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The adapters advertise server-acknowledged storage capabilities, but your application remains responsible for
          database availability, backups, retention, encryption, concurrency policy, and evidentiary controls.
        </p>
      </section>

      <section id="nextjs-routes" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next.js App Router recipes</h2>
        <p className="mb-4 text-foreground">
          Copy the API routes together with{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">request-context.ts</code>,{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">shared-contracts.ts</code>, and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">operational-indicators.ts</code>.
          Adapt import paths after placing them in your application.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Route</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Methods</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Requirement</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Behavior</th>
              </tr>
            </thead>
            <tbody>
              {routeRows.map(([route, methods, requirement, behavior], index) => (
                <tr key={route} className={index % 2 ? 'bg-muted/30' : undefined}>
                  <td className="border border-border px-4 py-2 text-foreground">{route}</td>
                  <td className="border border-border px-4 py-2 text-foreground">{methods}</td>
                  <td className="border border-border px-4 py-2 text-foreground">{requirement}</td>
                  <td className="border border-border px-4 py-2 text-foreground">{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          Every lookup and mutation includes the server tenant. Consent is additionally subject-scoped. Mutating routes
          write the business record and accountability event in one transaction; breach reporter details, DPIA assessor
          and conductor details, risk evidence, and audit principals are derived on the server.
        </p>
        <h3 className="text-xl font-bold text-foreground mb-3">Anonymous consent client</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';

// Generate once and retain it in first-party storage. It is a scoped capability,
// not an authenticated account or a staff credential.
const subjectId = \`anon_\${crypto.randomUUID()}\`;

const consentAdapter = apiAdapter('/api/consent', {
  credentials: 'same-origin',
  headers: { 'X-NDPR-Subject-Id': subjectId },
  loadFailureMode: 'throw',
  mutationFailureMode: 'throw',
  retry: { attempts: 2, baseDelayMs: 250 },
});`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The maintained{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">layout-example.tsx</code> shows
          stable capability storage, cookie fallback, idempotency keys, hydration without a false success state, and
          observable persistence failures.
        </p>
      </section>

      <section id="express-routes" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Express recipes</h2>
        <p className="mb-4 text-foreground">
          Copy the complete <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">src/express</code>{' '}
          directory so routes and the shared request-context seam stay together. Connect verified auth middleware state in
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">resolveVerifiedNDPRActor</code>{' '}
          before exposing staff routes.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import express from 'express';
import { createNDPRRouter } from './ndpr/express';

const app = express();
app.use(express.json());
app.use(yourVerifiedSessionMiddleware());
app.use('/api/ndpr', createNDPRRouter());`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The default actor resolver is intentionally empty. Mounting the router without replacing it leaves staff routes
          unavailable rather than trusting request data.
        </p>
      </section>

      <section id="consent-middleware" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Consent guards use the same identity boundary</h2>
        <p className="mb-4 text-foreground">
          Next.js <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">consentMiddleware</code> and
          Express <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">requireConsent</code> resolve
          the tenant and subject through the shared context. They do not accept query parameters or ordinary cookies as
          identity authority, and the Next.js helper requires a Node route-handler runtime because it queries Prisma.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// Next.js route handler
const guard = await consentMiddleware(request, 'marketing');
if (guard) return guard;

// Express
app.post(
  '/email/marketing',
  requireConsent('marketing'),
  sendEmailHandler,
);`}</code></pre>
        </div>
      </section>

      <section id="production-checklist" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Production checklist</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>Pin toolkit and recipe versions and review copied source in your repository.</li>
          <li>Configure a server-only tenant ID and test cross-tenant isolation.</li>
          <li>Connect verified actor resolution and test anonymous, authenticated subject, staff, and forbidden paths.</li>
          <li>Keep record and audit writes atomic and test rollback behavior.</li>
          <li>Exercise consent revocation, DSR intake, breach updates, DPIA lifecycle changes, and ROPA completeness in staging.</li>
          <li>Review retention, backups, access controls, incident escalation, and current NDPC requirements with your DPO or counsel.</li>
        </ul>
      </section>

      <section id="cli-scaffolder" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Scaffold or audit</h2>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`npm create ndpr@latest
npx ndpr audit --init
npx ndpr audit --min-score 80`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Generated request-context files also fail closed until connected to your authentication provider. See the{' '}
          <Link href="/docs/guides/audit-cli" className="text-primary hover:underline">Compliance Audit CLI guide</Link>{' '}
          for CI configuration.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/production-recipes" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Production Recipes &rarr;
          </Link>
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
