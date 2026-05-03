'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function ServerRenderingGuide() {
  return (
    <DocLayout
      title="Server-Side Rendering & RSC"
      description="Use the NDPA Toolkit on the server: /server subpath, validateDsrSubmission, and React Server Components."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The NDPA Toolkit ships <strong>two distinct surfaces</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            A <strong>client surface</strong> — the React components, hooks, and providers exported from{' '}
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit</code>.
            These carry <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;use client&quot;</code> directives and depend on React.
          </li>
          <li>
            A <strong>pure-logic surface</strong> — validators, generators, scoring, locales, and storage
            adapters exported from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-toolkit/server</code>. <strong>Zero React in the import graph.</strong>
          </li>
        </ul>
        <p className="mb-4 text-foreground">
          Use <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/server</code> for any server-side context: Next.js Route Handlers and Server
          Components, NestJS controllers, Express middleware, Cloudflare Workers, Edge Functions, or scheduled
          background jobs. Build-output guard tests assert this entry never carries a{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&quot;use client&quot;</code> directive and never imports{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">react</code> or{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">react-dom</code> — the RSC-safety contract is structurally enforced.
        </p>
      </section>

      <section id="exports" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What&apos;s in /server</h2>
        <p className="mb-4 text-foreground">All 50 exports are pure functions or types — no React, no DOM dependency.</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Category</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Exports</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Validators</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">validateConsent</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">validateDsrSubmission</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">validateProcessingActivity</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">validateTransfer</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">validateProcessingRecord</code>
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Generators &amp; export</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">generatePolicyText</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">assemblePolicy</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">findUnfilledTokens</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">exportHTML</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">exportMarkdown</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">exportPDF</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">exportDOCX</code>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Domain helpers</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">formatDSRRequest</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">assessDPIARisk</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">calculateBreachSeverity</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">getComplianceScore</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">sanitizeInput</code>
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Locales</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">defaultLocale</code> (en),{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">yorubaLocale</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">igboLocale</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">hausaLocale</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">pidginLocale</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">mergeLocale</code>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Storage adapters</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">apiAdapter</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">memoryAdapter</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">localStorageAdapter</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">sessionStorageAdapter</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">cookieAdapter</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">composeAdapters</code>
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground font-medium">Types</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  Every type from the public API plus <code className="bg-muted px-1 py-0.5 rounded">DsrSubmissionPayload</code>,{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">DsrSubmissionValidationResult</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="dsr-route-handler" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Validating DSR submissions on the server</h2>
        <p className="mb-4 text-foreground">
          The most common server-side use case: receiving a payload from{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'<DSRRequestForm onSubmit>'}</code>{' '}
          and validating it before persisting. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateDsrSubmission</code> mirrors the rules
          the client form enforces, so client and server stay in sync without you hand-rolling zod or
          class-validator schemas.
        </p>
        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Next.js App Router</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/api/dsr/route.ts
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';
import { dsrStore } from '@/lib/dsr-store';

export async function POST(req: Request) {
  const result = validateDsrSubmission(await req.json(), {
    allowedRequestTypes: ['access', 'erasure', 'rectification', 'objection'],
  });
  if (!result.valid) {
    return Response.json({ errors: result.errors }, { status: 422 });
  }

  // result.data is the typed DsrSubmissionPayload — narrowed and safe to persist.
  await dsrStore.create({
    ...result.data,
    receivedAt: Date.now(),
    status: 'pending',
  });
  return Response.json({ ok: true }, { status: 201 });
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">NestJS controller</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// dsr.controller.ts
import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';

@Controller('dsr')
export class DsrController {
  constructor(private readonly dsrService: DsrService) {}

  @Post()
  async submit(@Body() body: unknown) {
    const result = validateDsrSubmission(body);
    if (!result.valid) {
      throw new HttpException(
        { errors: result.errors },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return this.dsrService.create(result.data);
  }
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Express middleware</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// routes/dsr.ts
import { Router } from 'express';
import { validateDsrSubmission } from '@tantainnovative/ndpr-toolkit/server';

export const dsrRouter: Router = Router();

dsrRouter.post('/dsr', async (req, res) => {
  const result = validateDsrSubmission(req.body);
  if (!result.valid) {
    return res.status(422).json({ errors: result.errors });
  }
  await dsrStore.create(result.data);
  res.status(201).json({ ok: true });
});`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          Skip the identity-verification check (e.g. when the consumer&apos;s session already authenticated
          the user) by passing{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">{'{ requireIdentityVerification: false }'}</code> as the second argument.
        </p>
      </section>

      <section id="server-policy" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Generating policies on the server</h2>
        <p className="mb-4 text-foreground">
          Render a privacy policy server-side (for SSR, scheduled email reports, or PDF generation) without
          loading any React:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// app/api/privacy-policy/pdf/route.ts
import {
  assemblePolicy,
  exportPDF,
  createDefaultContext,
  findUnfilledTokens,
} from '@tantainnovative/ndpr-toolkit/server';

export async function GET() {
  const ctx = createDefaultContext();
  ctx.org.name = 'Acme Nigeria Ltd';
  ctx.org.privacyEmail = 'privacy@acme.ng';
  ctx.org.website = 'https://acme.ng';

  const sections = assemblePolicy(ctx);
  const policy = {
    id: 'p',
    title: 'Acme Privacy Policy',
    templateId: 'default-business',
    organizationInfo: ctx.org,
    sections,
    variableValues: { orgName: ctx.org.name, /* ... */ },
    effectiveDate: Date.now(),
    lastUpdated: Date.now(),
    version: '1.0',
  };

  // CI-style guard before sending to the wire.
  const missing = findUnfilledTokens(JSON.stringify(sections));
  if (missing.length) {
    throw new Error(\`Policy is missing: \${missing.join(', ')}\`);
  }

  const blob = await exportPDF(policy);
  return new Response(blob, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}`}</code></pre>
        </div>
      </section>

      <section id="rsc-imports" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">RSC imports — picking the right entry</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">From</th>
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">Import</th>
                <th className="border border-border px-4 py-2 text-center font-semibold text-foreground">RSC-safe</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Server Component / Route Handler</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/server</code></td>
                <td className="border border-border px-4 py-2 text-center text-foreground">✅</td>
              </tr>
              <tr className="border-b border-border bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Client Component (form, banner, etc.)</td>
                <td className="border border-border px-4 py-2 text-foreground">root <code className="bg-muted px-1 py-0.5 rounded">@tantainnovative/ndpr-toolkit</code> or feature subpath</td>
                <td className="border border-border px-4 py-2 text-center text-foreground">N/A</td>
              </tr>
              <tr className="border-b border-border">
                <td className="border border-border px-4 py-2 text-foreground">Storage adapters in any context</td>
                <td className="border border-border px-4 py-2 text-foreground"><code className="bg-muted px-1 py-0.5 rounded">/adapters</code></td>
                <td className="border border-border px-4 py-2 text-center text-foreground">✅</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-border px-4 py-2 text-foreground">Types (only)</td>
                <td className="border border-border px-4 py-2 text-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">/server</code> (preferred) or feature subpath as <code className="bg-muted px-1 py-0.5 rounded">type</code> imports
                </td>
                <td className="border border-border px-4 py-2 text-center text-foreground">✅ when typed</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/core</code>{' '}
          entry exists for back-compat — it includes the React{' '}
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">NDPRProvider</code>{' '}
          alongside the pure logic. Prefer <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">/server</code> for new server-side code.
        </p>
      </section>

      <section id="see-also" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">See also</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground">
          <li>
            <Link href="/docs/guides/backend-integration" className="text-primary hover:underline">
              Backend Integration
            </Link>{' '}
            — full database wiring with Prisma and Drizzle.
          </li>
          <li>
            <Link href="/docs/guides/adapters" className="text-primary hover:underline">
              Storage Adapters
            </Link>{' '}
            — composing storage backends with <code className="bg-muted px-1 py-0.5 rounded">apiAdapter</code> and friends.
          </li>
          <li>
            <Link href="/docs/guides/upgrading-from-3-3" className="text-primary hover:underline">
              Upgrading from 3.3.x
            </Link>{' '}
            — when <code className="bg-muted px-1 py-0.5 rounded">/server</code> arrived and what it replaced.
          </li>
        </ul>
      </section>
    </DocLayout>
  );
}
