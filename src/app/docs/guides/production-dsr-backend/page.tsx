'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function ProductionDsrBackendGuide() {
  return (
    <DocLayout
      title="Production DSR backend"
      description="A reference implementation of a production-grade Data Subject Rights submission backend: validate, persist (Prisma), email-confirm (Resend), and return the typed shape NDPRSubjectRights.onSubmitSuccess expects."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The quickstart route handler stores DSR submissions in an in-memory <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">let store = null</code> —
          fine for demos, useless for production. This guide describes the reference implementation under
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> examples/dsr-backend-reference/</code> in the repo: a Next.js 15 App Router app that wires
          the toolkit&apos;s validator, a Prisma model, and Resend email confirmations into a single endpoint.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Both Prisma and Resend are shipped behind <em>dual-mode shims</em>: the example runs out of the box
          with no env vars (mocks log to stdout); set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DATABASE_URL</code> and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RESEND_API_KEY</code> to flip to
          real services without touching the route handler. Useful for evaluating the pattern before
          provisioning infrastructure.
        </p>
      </section>

      <section id="pipeline" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The four-layer pipeline</h2>
        <ol className="list-decimal pl-6 space-y-3 text-foreground mb-4">
          <li>
            <strong>Form</strong> — the client page mounts <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;NDPRSubjectRights submitTo=&quot;/api/dsr&quot;
              onSubmitSuccess={`{ … }`} /&gt;</code>. The success handler reads the typed
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> body</code> and navigates to a confirmation page with the reference number in the URL.
          </li>
          <li>
            <strong>Validation</strong> — the route handler runs <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">validateDsrSubmissionStructured</code> from
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> /server</code>. Bad payloads return <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">400</code> with
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> {`{ error, fields }`}</code>; the preset surfaces those messages to the user. Then a defense-in-depth check
            rejects e-mails on a configurable disposable-domain blocklist.
          </li>
          <li>
            <strong>Persistence (Prisma)</strong> — a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSRRequest</code> row is created with a server-generated
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> referenceId</code>, the submitter&apos;s details, and an
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> estimatedCompletionAt</code> 30 days out (per NDPA Part VI §34-38).
          </li>
          <li>
            <strong>Confirmation (Resend)</strong> — a confirmation e-mail with the reference number and
            deadline is sent best-effort. If sending fails, the request still succeeds (the DSR is already
            persisted) — the failure is logged for manual follow-up.
          </li>
        </ol>
      </section>

      <section id="response-shape" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The 201 response contract</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          On success, the handler returns exactly:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`{
  "referenceId": "DSR-LXTYZ-7K4P",
  "status": "received",
  "estimatedCompletionAt": "2026-06-24T10:14:00.000Z"
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          That matches the shape <Link href="/docs/components/data-subject-rights#submission-payload" className="text-primary hover:underline">the toolkit&apos;s DSR docs</Link> document for
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> NDPRSubjectRights.onSubmitSuccess</code>. The client reads
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> body.referenceId</code> and <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">body.estimatedCompletionAt</code> directly, with no transformation layer.
        </p>
      </section>

      <section id="getting-started" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Run the example locally</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`git clone https://github.com/mr-tanta/ndpr-toolkit.git
cd ndpr-toolkit/examples/dsr-backend-reference
bun install   # or pnpm / npm
bun dev`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Visit <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">http://localhost:3000/dsr</code> and submit a request. With no env vars set, the request
          is held in an in-memory Map and the confirmation e-mail is printed to your terminal.
        </p>
      </section>

      <section id="going-real" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Swapping in real services</h2>
        <ol className="list-decimal pl-6 space-y-3 text-foreground mb-4">
          <li>
            Provision a database. The example ships <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">prisma/schema.prisma</code> with
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> datasource = sqlite</code> for local-dev convenience — change it to
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> postgresql</code> for production, then <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">npx prisma migrate dev</code>.
          </li>
          <li>
            Sign up at <a href="https://resend.com" className="text-primary hover:underline">resend.com</a>, verify a sending domain, and create an API key.
          </li>
          <li>
            Set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DATABASE_URL</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">RESEND_API_KEY</code>, and
            <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> DSR_FROM_EMAIL</code> in <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.env</code>. The shims detect those env vars and switch to real clients
            with no code changes.
          </li>
          <li>
            Optional: set <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSR_BLOCKED_EMAIL_DOMAINS=&quot;mailinator.com,tempmail.com&quot;</code> to enable the
            disposable-email rejection.
          </li>
        </ol>
      </section>

      <section id="when-to-adapt" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Adapting it to your stack</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The Prisma + Resend choices are illustrative, not prescriptive. The two interfaces you actually
          need to honour are:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>Persist</strong> — anything that can store the validated <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">DSRFormSubmission</code> and read it back by <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">referenceId</code>. Drizzle, Kysely, raw SQL, Firestore, DynamoDB — anything.</li>
          <li><strong>Notify</strong> — anything that can send transactional e-mail. Resend, Postmark, SES, your existing SMTP — the route handler just <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">await</code>s a function.</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed">
          The validator and the response contract are the contract; everything between them is yours.
        </p>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><Link href="/docs/components/data-subject-rights" className="text-primary hover:underline">Data Subject Rights component</Link> — the form that POSTs to your endpoint.</li>
          <li><Link href="/docs/guides/data-subject-requests" className="text-primary hover:underline">Handling Data Subject Requests</Link> — the higher-level workflow.</li>
          <li><Link href="/docs/guides/backend-integration" className="text-primary hover:underline">Backend Integration</Link> — overview of toolkit + backend patterns across modules.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
