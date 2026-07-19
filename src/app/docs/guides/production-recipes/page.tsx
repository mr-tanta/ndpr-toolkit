'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const recipeRows = [
  ['Prisma schema', 'prisma/schema.prisma', 'Use when your app already runs Prisma migrations.'],
  ['Drizzle schema', 'src/drizzle/schema.ts', 'Use when your app owns schema changes through Drizzle Kit.'],
  ['Next.js routes', 'src/nextjs/app-router/api/**', 'Copy into App Router projects that need server-side persistence.'],
  ['Express routes', 'src/express/**', 'Mount in existing Node/Express APIs.'],
  ['Storage adapters', 'src/adapters/**', 'Run tenant-scoped persistence behind your server API.'],
  ['Consent middleware', 'src/nextjs/app-router/middleware.ts', 'Gate routes by consent state.'],
];

const moduleRows = [
  ['Consent', 'Consent records, revocation, audit trail', 'Persist active and historical consent snapshots.'],
  ['DSR', 'Request intake, reference IDs, target dates', 'Track 30-day response workflows.'],
  ['Breach', 'Incident intake, lifecycle updates, NDPC readiness', 'Keep 72-hour notification evidence visible.'],
  ['DPIA', 'Assessment metadata, risk score, approval status', 'Store Section 28 assessment evidence.'],
  ['ROPA', 'Processing records and completeness checks', 'Maintain records of processing activities.'],
  ['Compliance', 'Operational indicators API route', 'Expose tenant-scoped record counts, evidence rates, and not-observed states to internal dashboards.'],
  ['DCPMI / CAR utilities', 'Designation tier and audit return schedule', 'Support GAID 2025 classification and filing planning.'],
];

export default function ProductionRecipesGuide() {
  return (
    <DocLayout
      title="Production Recipes"
      description="Use @tantainnovative/ndpr-recipes as a versioned npm source package for backend persistence, routes, adapters, and compliance workflow templates."
    >
      <section className="mb-8">
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>{' '}
          gives you the runtime components, hooks, validators, scoring, and server utilities.{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-recipes</code>{' '}
          gives you versioned backend source templates: database schema, route handlers, middleware, and storage adapters
          that you copy into your application and own.
        </p>
        <p className="mb-4 text-foreground">
          Treat the recipes package like a maintained implementation workbook. Install it to pin the source version,
          copy the pieces you need, then adapt naming, authentication, tenancy, logging, and deployment details to your stack.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`pnpm add @tantainnovative/ndpr-toolkit
pnpm add -D @tantainnovative/ndpr-recipes

# Prisma projects
cp node_modules/@tantainnovative/ndpr-recipes/prisma/schema.prisma prisma/schema.prisma

# Copy complete integration seams before adapting paths and auth
cp -r node_modules/@tantainnovative/ndpr-recipes/src/nextjs/app-router src/ndpr/nextjs
cp -r node_modules/@tantainnovative/ndpr-recipes/src/express src/ndpr/express
cp -r node_modules/@tantainnovative/ndpr-recipes/src/adapters src/ndpr/adapters`}</code></pre>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="m-0 text-sm leading-relaxed text-foreground">
            The recipes are intentionally not hidden behind a runtime abstraction. Compliance persistence needs to fit your
            authentication, data retention, audit logging, tenant isolation, and incident-response process.
          </p>
        </div>
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="m-0 text-sm leading-relaxed text-amber-950 dark:text-amber-100">
            Existing 0.1.x or 0.2.0 databases require the reviewed 0.3.0 migration artifacts and guide. Standalone psql
            or Prisma use the wrapped <code>migrations/0.3.0/postgresql.sql</code>; a Drizzle-managed migration uses the
            transaction-control-free <code>migrations/0.3.0/drizzle.sql</code> inside Drizzle&apos;s outer transaction. Do
            not use a blind Prisma or Drizzle schema push: tenant ownership, DSR subject IDs, consent deduplication, and
            ROPA evidence require reviewed backfills.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Security Contract Before Deployment</h2>
        <p className="mb-4 text-foreground">
          Set the server-only <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPR_TENANT_ID</code>{' '}
          and replace the fail-closed <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">resolveVerifiedNDPRActor</code>{' '}
          implementation with your verified session lookup. Map privacy operators to{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr:staff</code> or{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr:admin</code>.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>Tenant identity comes only from server configuration.</li>
          <li>Account subject, actor, role, reporter, and assessor identity comes only from verified server auth.</li>
          <li>Anonymous consent and DSR use a scoped <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">anon_&lt;UUID&gt;</code> capability in <code className="bg-card border border-border px-1 py-0.5 rounded text-xs">X-NDPR-Subject-Id</code>.</li>
          <li>Every database lookup and write stays tenant-scoped, and mutation/audit writes remain atomic.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Which Package Should I Use?</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Need</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Use</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-4 py-2 text-foreground">Drop-in UI</td>
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">@tantainnovative/ndpr-toolkit/presets</td>
                <td className="border border-border px-4 py-2 text-foreground">Fastest way to ship consent, DSR, DPIA, breach, and policy screens.</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Custom UI with toolkit logic</td>
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">@tantainnovative/ndpr-toolkit/hooks</td>
                <td className="border border-border px-4 py-2 text-foreground">Use hooks and bring your own design system.</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2 text-foreground">Server validation and scoring</td>
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">@tantainnovative/ndpr-toolkit/server</td>
                <td className="border border-border px-4 py-2 text-foreground">RSC-safe utilities with no React import graph.</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Production persistence examples</td>
                <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">@tantainnovative/ndpr-recipes</td>
                <td className="border border-border px-4 py-2 text-foreground">Versioned source templates for database schemas, adapters, and route handlers.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Recipe Inventory</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Area</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Path</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">When to use it</th>
              </tr>
            </thead>
            <tbody>
              {recipeRows.map(([area, path, usage], index) => (
                <tr key={area} className={index % 2 ? 'bg-muted/30' : undefined}>
                  <td className="border border-border px-4 py-2 text-foreground">{area}</td>
                  <td className="border border-border px-4 py-2 text-foreground font-mono text-xs">{path}</td>
                  <td className="border border-border px-4 py-2 text-foreground">{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Module Coverage</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Module</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Backend surface</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Production purpose</th>
              </tr>
            </thead>
            <tbody>
              {moduleRows.map(([module, surface, purpose], index) => (
                <tr key={module} className={index % 2 ? 'bg-muted/30' : undefined}>
                  <td className="border border-border px-4 py-2 text-foreground">{module}</td>
                  <td className="border border-border px-4 py-2 text-foreground">{surface}</td>
                  <td className="border border-border px-4 py-2 text-foreground">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Production Checklist</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>Pin both package versions in your lockfile before copying recipe source.</li>
          <li>Configure a server-only tenant ID and test cross-tenant isolation.</li>
          <li>Connect verified actor resolution; test anonymous subject, account subject, staff, and forbidden paths.</li>
          <li>Keep actor, subject, tenant, reporter, assessor, and role authority out of request bodies and query strings.</li>
          <li>Verify that business mutations and accountability events roll back together.</li>
          <li>Review retention periods, audit-log fields, and breach escalation routing with counsel or your DPO.</li>
          <li>Run migrations in staging and test consent revocation, DSR intake, breach and DPIA updates, and ROPA completeness.</li>
          <li>Keep copied recipe files in your own source control so future changes are reviewed as normal app code.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next Steps</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/docs/guides/backend-integration" className="rounded-xl border border-border bg-card p-4 text-foreground no-underline hover:border-blue-500/40">
            <h3 className="m-0 mb-2 text-lg font-semibold">Backend Integration</h3>
            <p className="m-0 text-sm text-muted-foreground">Detailed Prisma, Drizzle, Next.js, and Express wiring notes.</p>
          </Link>
          <Link href="/docs/guides/adapters" className="rounded-xl border border-border bg-card p-4 text-foreground no-underline hover:border-blue-500/40">
            <h3 className="m-0 mb-2 text-lg font-semibold">Storage Adapters</h3>
            <p className="m-0 text-sm text-muted-foreground">Understand the adapter interface before customizing persistence.</p>
          </Link>
        </div>
      </section>
    </DocLayout>
  );
}
