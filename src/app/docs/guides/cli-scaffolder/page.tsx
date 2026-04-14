'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function CLIScaffolderGuide() {
  return (
    <DocLayout
      title="CLI Scaffolder"
      description="Scaffold a full NDPA-compliant backend in seconds with create-ndpr — detects your stack and generates API routes, database schema, and layout wrappers automatically"
    >
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">create-ndpr</code> is
          a zero-dependency interactive CLI that wires the NDPA compliance toolkit into an existing
          project. Run it once from your project root and it:
        </p>
        <ul className="list-disc pl-6 mb-4 text-foreground space-y-1">
          <li>Inspects your project and detects the framework and ORM automatically</li>
          <li>Asks a few questions about your organisation</li>
          <li>Generates ready-to-use API routes, database schema, and layout files</li>
          <li>Embeds your organisation name and DPO email in every generated file</li>
        </ul>
        <p className="mb-4 text-foreground">
          No extra packages are required to run the CLI itself — it ships as a single{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.mjs</code> file
          with no external dependencies, so <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">npx</code> can
          execute it straight from the npm registry on Node.js 18+.
        </p>
      </section>

      <section id="usage" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Usage</h2>
        <p className="mb-4 text-foreground">
          Run the CLI from the root of an existing project — the same directory where your{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">package.json</code> and{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">next.config.*</code> live.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# Recommended — always uses the latest published version
npx @tantainnovative/create-ndpr

# Short alias (once the package is registered on npm)
npx create-ndpr`}</code></pre>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl mb-4">
          <h4 className="text-amber-800 dark:text-amber-200 font-medium mb-1">Run from the project root</h4>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            The CLI reads <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">package.json</code>,{' '}
            <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">next.config.*</code>,{' '}
            <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">prisma/schema.prisma</code>, and{' '}
            <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">drizzle.config.*</code> from the
            current working directory. Always <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">cd</code> into
            your project root before running it.
          </p>
        </div>
      </section>

      <section id="detection" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What It Detects</h2>
        <p className="mb-4 text-foreground">
          Before prompting for anything, the CLI performs a silent stack-detection pass. The detected
          values are shown upfront and can be overridden at the framework and ORM prompts.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Signal</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Detected as</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">next.config.js / .ts / .mjs</td>
                <td className="border border-border px-4 py-2 text-foreground">Next.js project</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">app/ or src/app/ directory</td>
                <td className="border border-border px-4 py-2 text-foreground">Next.js App Router</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">No app/ directory + next.config.*</td>
                <td className="border border-border px-4 py-2 text-foreground">Next.js Pages Router</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">express in package.json deps</td>
                <td className="border border-border px-4 py-2 text-foreground">Express</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">@prisma/client or prisma in deps, or prisma/schema.prisma</td>
                <td className="border border-border px-4 py-2 text-foreground">Prisma ORM</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">drizzle-orm / drizzle-kit in deps, or drizzle.config.*</td>
                <td className="border border-border px-4 py-2 text-foreground">Drizzle ORM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="prompts" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What It Prompts For</h2>
        <p className="mb-4 text-foreground">
          The CLI walks through four short sections. Detected values are pre-selected as defaults
          so you can press Enter to confirm them.
        </p>

        <div className="space-y-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-2">1. Organisation details</h4>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-4">
              <li><strong>Organisation name</strong> — embedded in every generated file (e.g. <em>Acme Corp Nigeria Ltd</em>)</li>
              <li><strong>DPO email address</strong> — the Data Protection Officer contact used in notices and policy headers</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-2">2. Framework</h4>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-4">
              <li>Next.js — App Router</li>
              <li>Next.js — Pages Router</li>
              <li>Express</li>
              <li>None (generate shared files only)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">Auto-detected from your project; you can override the choice.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-2">3. Compliance modules</h4>
            <p className="text-sm text-muted-foreground mb-2">Multi-select. Defaults: consent, dsr, breach.</p>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-4">
              <li><code className="bg-muted px-1 rounded text-xs">consent</code> — NDPA §25-26 consent management</li>
              <li><code className="bg-muted px-1 rounded text-xs">dsr</code> — Data Subject Rights requests (§34-38)</li>
              <li><code className="bg-muted px-1 rounded text-xs">breach</code> — 72-hour breach notification workflow (§40)</li>
              <li><code className="bg-muted px-1 rounded text-xs">policy</code> — Privacy policy scaffolding</li>
              <li><code className="bg-muted px-1 rounded text-xs">dpia</code> — Data Protection Impact Assessment</li>
              <li><code className="bg-muted px-1 rounded text-xs">lawful-basis</code> — Lawful basis register (§25)</li>
              <li><code className="bg-muted px-1 rounded text-xs">cross-border</code> — Cross-border transfer management (§43)</li>
              <li><code className="bg-muted px-1 rounded text-xs">ropa</code> — Record of Processing Activities</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold text-foreground mb-2">4. ORM</h4>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-4">
              <li>Prisma — generates <code className="bg-muted px-1 rounded text-xs">prisma/schema.prisma</code> with NDPA models</li>
              <li>Drizzle — generates <code className="bg-muted px-1 rounded text-xs">src/drizzle/ndpr-schema.ts</code></li>
              <li>None — skips database schema generation</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          A summary is shown before any files are written. You can abort at the confirmation prompt
          with no changes made to your project.
        </p>
      </section>

      <section id="generated-files" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What Files It Generates</h2>
        <p className="mb-4 text-foreground">
          Every file is rendered from a template with your organisation name and DPO email
          substituted in. Files that already exist on disk are skipped rather than overwritten.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">File</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Generated when</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">.env.example</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Always</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Environment variable template with DATABASE_URL and NDPA_DPO_EMAIL pre-filled</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">prisma/schema.prisma</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">ORM = Prisma (if not already present)</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Prisma schema with ConsentRecord, DSRRequest, BreachReport, and AuditLog models</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">src/drizzle/ndpr-schema.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">ORM = Drizzle</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Drizzle table definitions mirroring the Prisma schema above</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">app/ndpr-layout.tsx</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Next.js App Router</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">NDPRProvider wrapper component — import and render around your children</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">app/api/consent/route.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">App Router + consent module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">POST handler: saves consent records; GET handler: returns current consent</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">app/api/dsr/route.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">App Router + dsr module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">POST handler: saves DSR submissions; GET handler: lists requests by email</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">app/api/breach/route.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">App Router + breach module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">POST handler: records breach reports and triggers 72-hour timer logic</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">pages/api/consent.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Pages Router + consent module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Same logic as the App Router variant, in Pages Router format</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">pages/api/dsr.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Pages Router + dsr module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Pages Router DSR handler</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">pages/api/breach.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Pages Router + breach module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Pages Router breach handler</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">src/ndpr/index.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Express</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Express router factory — exports <code className="text-xs">createNDPRRouter()</code></td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 font-mono text-foreground text-xs">src/ndpr/routes/consent.ts</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Express + consent module</td>
                <td className="border border-border px-4 py-2 text-muted-foreground text-xs">Express consent route handler</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">
          If <code className="bg-card border border-border px-1 rounded text-xs">prisma/schema.prisma</code> already
          exists the CLI skips it and prints the template path so you can merge the NDPA models manually.
        </p>
      </section>

      <section id="example-output" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Example: Next.js + Prisma</h2>
        <p className="mb-4 text-foreground">
          Below is an example session for a Next.js App Router project with Prisma, including consent,
          DSR, and breach modules.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-muted-foreground text-sm"><code>{`$ npx @tantainnovative/create-ndpr

  ███╗   ██╗██████╗ ██████╗ ██████╗
  ████╗  ██║██╔══██╗██╔══██╗██╔══██╗
  ██╔██╗ ██║██║  ██║██████╔╝██████╔╝
  ██║╚██╗██║██║  ██║██╔═══╝ ██╔══██╗
  ██║ ╚████║██████╔╝██║     ██║  ██║
  ╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝  ╚═╝

  create-ndpr — NDPA compliance scaffolder
  Powered by @tantainnovative/ndpr-toolkit

  Detected project setup:
  Framework: Next.js (App Router)
  ORM:       Prisma

  Organisation details

  Organisation name (e.g. Acme Corp Nigeria Ltd): Acme Corp Nigeria Ltd
  DPO email address (e.g. dpo@acmecorp.ng): dpo@acme.ng

  Framework
  Which framework are you using?
    1) Next.js — App Router
    2) Next.js — Pages Router
    3) Express
    4) None (generate shared files only)
  Choice [1]:

  Compliance modules [default: 1,2,3]
    1) consent      — NDPA §25-26 consent management
    2) dsr          — Data Subject Rights requests (§34-38)
    3) breach       — Breach notification workflow (§40)
    4) policy       — Privacy policy generation
    5) dpia         — Data Protection Impact Assessment
    6) lawful-basis — Lawful basis register
    7) cross-border — Cross-border transfer management
    8) ropa         — Record of Processing Activities
  Enter numbers separated by commas (or press Enter for default):

  Database / ORM
  Which ORM are you using?
    1) Prisma
    2) Drizzle
    3) None (skip database schema)
  Choice [1]:

  Summary
  Organisation: Acme Corp Nigeria Ltd
  DPO email:    dpo@acme.ng
  Framework:    Next.js — App Router
  ORM:          Prisma
  Modules:      consent, dsr, breach

  Generate files? [Y/n]:

  Generating files...

  + .env.example
  + prisma/schema.prisma
  + src/app/ndpr-layout.tsx
  + src/app/api/consent/route.ts
  + src/app/api/dsr/route.ts
  + src/app/api/breach/route.ts

  Done! Files generated:
  ✓ .env.example
  ✓ prisma/schema.prisma
  ✓ src/app/ndpr-layout.tsx
  ✓ src/app/api/consent/route.ts
  ✓ src/app/api/dsr/route.ts
  ✓ src/app/api/breach/route.ts

  Next steps:

  1. Set your database URL in .env:
     DATABASE_URL="postgresql://user:password@localhost:5432/mydb_dev"

  2. Install the Prisma client and run migrations:
     pnpm add @prisma/client
     pnpm add -D prisma
     pnpm prisma migrate dev --name ndpr-init

  3. Install the ndpr-toolkit:
     pnpm add @tantainnovative/ndpr-toolkit

  4. Wrap your root layout with NDPRLayout:
     // src/app/layout.tsx
     import NDPRLayout from './ndpr-layout';
     // Render <NDPRLayout>{children}</NDPRLayout> inside your <body>`}</code></pre>
        </div>
      </section>

      <section id="next-steps" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next Steps After Scaffolding</h2>

        <h3 className="text-xl font-bold text-foreground mb-3">With Prisma</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`# 1. Copy .env.example and set your database URL
cp .env.example .env

# 2. Install Prisma dependencies
pnpm add @prisma/client @tantainnovative/ndpr-toolkit
pnpm add -D prisma

# 3. Run the initial migration
pnpm prisma migrate dev --name ndpr-init`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">With Drizzle</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`cp .env.example .env

pnpm add drizzle-orm @paralleldrive/cuid2 @tantainnovative/ndpr-toolkit
pnpm add -D drizzle-kit

pnpm drizzle-kit push`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Wire up Next.js layout</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`// src/app/layout.tsx
import NDPRLayout from '@/app/ndpr-layout';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NDPRLayout>{children}</NDPRLayout>
      </body>
    </html>
  );
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Mount in Express</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-6">
          <pre className="text-foreground"><code>{`import express from 'express';
import { createNDPRRouter } from './src/ndpr';

const app = express();
app.use(express.json());
app.use('/api/ndpr', createNDPRRouter());`}</code></pre>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl mb-4">
          <h4 className="text-green-800 dark:text-green-200 font-medium mb-2">After wiring the layout</h4>
          <ul className="text-green-700 dark:text-green-300 text-sm space-y-1 list-disc pl-4">
            <li>Add DSR and breach pages using the toolkit&apos;s preset components</li>
            <li>Customise the consent banner position, styling, and categories</li>
            <li>Optionally pass a <code className="bg-green-100 dark:bg-green-800 px-1 rounded text-xs">locale</code> prop to translate all UI strings</li>
            <li>Replace the generated API handlers with your own persistence logic as needed</li>
          </ul>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/presets" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Zero-config Presets &rarr;
          </Link>
          <Link href="/docs/guides/backend-integration" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Backend Integration &rarr;
          </Link>
          <Link href="/docs/guides/adapters" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Storage Adapters &rarr;
          </Link>
          <Link href="/docs/guides/internationalization" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Internationalization &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
