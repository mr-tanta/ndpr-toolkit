'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

const CODE = 'bg-card border border-border px-1.5 py-0.5 rounded text-sm';

export default function MigratingFrom57To60Guide() {
  return (
    <DocLayout
      title="Migrating from 5.7.x to 6.0.0"
      description="A production-boundary hardening release. Frontend-only users get a one-line bump; anyone calling the breach assessor or running @tantainnovative/ndpr-recipes has real work to do — including a reviewed database migration."
    >
      <section id="tldr" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">TL;DR — find your upgrade path</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          6.0.0 is not a deprecation-window release. Nothing was renamed and nothing was removed, so
          your build will very likely keep compiling. What changed is <em>what the toolkit is willing
          to conclude</em>: compliance duties now stay switched on until complete, correlated evidence
          establishes otherwise, and backend identity comes from the server instead of the request.
          That means a green build does not mean you are done.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">If you…</th>
                <th className="text-left py-2 pr-4 font-semibold">Effort</th>
                <th className="text-left py-2 font-semibold">Read</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Use components, hooks, presets, or policy generation only</td>
                <td className="py-2 pr-4"><strong>One-line bump</strong></td>
                <td className="py-2">§ 5 (re-run audits), then done</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Call <code className={CODE}>assessBreachNotification</code> or the JSON audit with breach input</td>
                <td className="py-2 pr-4"><strong>Code review</strong></td>
                <td className="py-2">§ 1</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">Ran <code className={CODE}>create-ndpr</code> and copied the generated API routes</td>
                <td className="py-2 pr-4"><strong>Wire two seams</strong></td>
                <td className="py-2">§ 2, § 4</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Have a populated <code className={CODE}>@tantainnovative/ndpr-recipes</code> 0.1.x / 0.2.0 database</td>
                <td className="py-2 pr-4"><strong>Reviewed DB migration</strong></td>
                <td className="py-2">All of it — start at § 3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`pnpm up @tantainnovative/ndpr-toolkit@^6.0.0
# backend users also:
pnpm up @tantainnovative/ndpr-recipes@^0.3.0`}</code>
        </pre>
        <div className="border-l-4 border-amber-500 bg-amber-500/5 p-4 rounded-r-md mb-4">
          <p className="text-foreground leading-relaxed">
            <strong>Do not run <code className={CODE}>prisma db push</code> or <code className={CODE}>drizzle-kit push</code></strong> against
            an existing recipes database. The 0.3.0 schema is tenant-scoped and those commands cannot
            infer tenant ownership, verified DSR subjects, consent deduplication, or lossless ROPA
            facts. Use the reviewed <code className={CODE}>migrations/0.3.0</code> procedure in § 3.
          </p>
        </div>
      </section>

      <section id="breach-fail-closed" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">1. Breach duties now fail closed</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          In 5.x you could tell the assessor that a breach did not require notification by passing a
          bare boolean. A missing, malformed, or mismatched assessment also quietly resolved to
          &ldquo;no duty&rdquo;. Under NDPA 2023 S. 40 that is the wrong default — absence of evidence
          is not evidence of low risk. In 6.0 the two override options are <strong>force-on only</strong>:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`export interface BreachNotificationOptions {
  assessment?: RiskAssessment;
  notification?: RegulatoryNotification;
  asOf?: number;
  deadlineHours?: number;
  /** Force the high-risk data-subject duty on; a complete assessment is required to establish false. */
  highRisk?: true;
  /** Force Commission notification on; a complete assessment is required to establish false. */
  notificationRequired?: true;
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          The literal type <code className={CODE}>true</code> means TypeScript rejects{' '}
          <code className={CODE}>false</code> at compile time. If the value reaches the assessor at
          runtime anyway — from JSON, a database column, or an <code className={CODE}>any</code> cast —
          it is recorded in <code className={CODE}>validationErrors</code>, which sets{' '}
          <code className={CODE}>valid: false</code> and therefore <code className={CODE}>ready: false</code>.
          It does not silently waive the duty.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// Before (5.x) — this waived both duties
const assessment = assessBreachNotification(report, {
  notificationRequired: false,
  highRisk: false,
});

// After (6.0) — compile error; supply the evidence instead
const assessment = assessBreachNotification(report, {
  assessment: riskAssessment, // must correlate to report.id and validate completely
});`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">How each duty now resolves</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Both duties default to <strong>true</strong> and can only be lowered by a{' '}
          <em>correlated</em> assessment — one that is present, whose{' '}
          <code className={CODE}>breachId</code> matches the report&apos;s <code className={CODE}>id</code>,
          and which passes every field check:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`notificationRequired            = options.notificationRequired === true
                               || (correlatedAssessment?.risksToRightsAndFreedoms     ?? true)

dataSubjectCommunicationRequired = options.highRisk === true
                               || (correlatedAssessment?.highRisksToRightsAndFreedoms ?? true)`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          An assessment only counts as correlated when all of the following hold. Any single failure
          drops it, and the duty reverts to on:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><code className={CODE}>id</code> and <code className={CODE}>breachId</code> are non-empty strings, and <code className={CODE}>breachId</code> equals <code className={CODE}>report.id</code>.</li>
          <li><code className={CODE}>assessedAt</code> is a finite epoch timestamp between <code className={CODE}>report.discoveredAt</code> and <code className={CODE}>asOf</code>.</li>
          <li><code className={CODE}>assessor</code> is an object with non-empty <code className={CODE}>name</code>, <code className={CODE}>role</code>, and <code className={CODE}>email</code>.</li>
          <li>All five scores — <code className={CODE}>confidentialityImpact</code>, <code className={CODE}>integrityImpact</code>, <code className={CODE}>availabilityImpact</code>, <code className={CODE}>harmLikelihood</code>, <code className={CODE}>harmSeverity</code> — are numbers from 1 to 5.</li>
          <li><code className={CODE}>overallRiskScore</code> is non-negative and <code className={CODE}>riskLevel</code> is one of <code className={CODE}>low</code>, <code className={CODE}>medium</code>, <code className={CODE}>high</code>, <code className={CODE}>critical</code>.</li>
          <li><code className={CODE}>risksToRightsAndFreedoms</code> and <code className={CODE}>highRisksToRightsAndFreedoms</code> are real booleans — and high risk requires plain risk to also be true, because &ldquo;high risk but no risk&rdquo; is impossible.</li>
          <li><code className={CODE}>justification</code> is a non-empty string.</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed">
          Regulatory notification evidence is checked the same way: matching{' '}
          <code className={CODE}>breachId</code>, a <code className={CODE}>sentAt</code> between
          discovery and <code className={CODE}>asOf</code>, a <code className={CODE}>method</code> of{' '}
          <code className={CODE}>email</code>/<code className={CODE}>portal</code>/<code className={CODE}>letter</code>/<code className={CODE}>other</code>,
          and non-empty <code className={CODE}>content</code>. Incident chronology is enforced too:{' '}
          <code className={CODE}>occurredAt ≤ discoveredAt ≤ reportedAt ≤ asOf</code>.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">What to do</h3>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>Grep for <code className={CODE}>notificationRequired:</code> and <code className={CODE}>highRisk:</code> at your assessor callsites. Any <code className={CODE}>false</code> is now a type error — delete it.</li>
          <li>Wherever you relied on that <code className={CODE}>false</code>, supply a complete <code className={CODE}>RiskAssessment</code> whose <code className={CODE}>breachId</code> matches the report.</li>
          <li>Re-run every stored breach-readiness assessment. Reports that read &ldquo;ready&rdquo; under 5.x on thin evidence will now read not-ready — that is the correction, not a regression.</li>
          <li>The same force-on-only options apply to the breach input of the JSON audit surface and the <code className={CODE}>ndpr audit</code> CLI.</li>
        </ol>
        <p className="text-foreground leading-relaxed">
          Full field-by-field reference:{' '}
          <Link href="/docs/guides/breach-notification-completeness" className="text-primary hover:underline">Breach Notification Completeness</Link>.
        </p>
      </section>

      <section id="server-authority" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">2. Tenant and actor authority moved to the server</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          This applies to generated <code className={CODE}>create-ndpr</code> routes and{' '}
          <code className={CODE}>@tantainnovative/ndpr-recipes</code>. In 0.2.x, tenant, subject,
          actor, reporter, assessor, and role values could arrive from request bodies, query strings,
          or client headers. A caller could name themselves the approver of their own DPIA. In 0.3.0
          every one of those facts comes from server configuration or a verified session.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">Two seams to wire:</p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">a. Set <code className={CODE}>NDPR_TENANT_ID</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          A server-only environment variable. It is never read from the request. If it is missing,
          every recipe route returns <strong>503</strong> rather than defaulting to a shared or empty
          tenant.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`# .env (server-only — never NEXT_PUBLIC_)
NDPR_TENANT_ID=acme-production`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">b. Implement <code className={CODE}>resolveVerifiedNDPRActor</code></h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Shipped as a fail-closed stub that returns <code className={CODE}>null</code>. Until you
          replace it, staff routes return <strong>401</strong>. That is deliberate: an unwired
          deployment denies access rather than granting it.
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// app/api/ndpr/request-context.ts
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth'; // your server-side session provider

export async function resolveVerifiedNDPRActor(
  request: NextRequest,
): Promise<NDPRVerifiedActor | null> {
  const session = await auth(request);
  if (!session?.user) return null;

  return {
    id: session.user.id,
    displayName: session.user.name,
    email: session.user.email,
    department: session.user.department,
    // Stable data-subject id for the signed-in account, when applicable
    subjectId: session.user.subjectId,
    // Map YOUR roles onto the two NDPR roles
    roles: session.user.isPrivacyTeam ? ['ndpr:staff'] : [],
  };
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Only <code className={CODE}>ndpr:staff</code> and <code className={CODE}>ndpr:admin</code>{' '}
          grant staff authorization. Populate every attribute from the verified account — never from
          request input, or you reintroduce exactly the hole this release closes.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">The route guard contract</h3>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`const context = await resolveNDPRRequestContext(request);
const problem = getNDPRContextProblem(context, 'staff'); // 'tenant' | 'subject' | 'staff'
if (problem) {
  return NextResponse.json({ error: problem.error }, { status: problem.status });
}
// context.tenantId, context.actorId, context.subjectId, context.subjectSource, context.roles`}</code>
        </pre>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Status</th>
                <th className="text-left py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>503</code></td>
                <td className="py-2"><code>NDPR_TENANT_ID</code> is not configured on the server</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>401</code></td>
                <td className="py-2">No verified subject, or <code>resolveVerifiedNDPRActor</code> is still the stub</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code>403</code></td>
                <td className="py-2">Authenticated, but lacks <code>ndpr:staff</code> / <code>ndpr:admin</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground leading-relaxed">
          The one identity a client may still assert is an anonymous capability in the{' '}
          <code className={CODE}>X-NDPR-Subject-Id</code> header, and only when it matches{' '}
          <code className={CODE}>anon_&lt;UUID&gt;</code> exactly. It scopes access to that subject&apos;s
          own consent and DSR data and never confers staff rights. Anything else in that header is
          ignored. Values resolved this way are marked{' '}
          <code className={CODE}>subjectSource: &apos;anonymous-uuid-capability&apos;</code> in the
          accountability record, so audit output distinguishes them from{' '}
          <code className={CODE}>&apos;verified-account-subject&apos;</code>.
        </p>
      </section>

      <section id="schema-migration" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3. Tenant-scoped recipes schema (database migration)</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Consent, DSR, breach, ROPA, DPIA, lawful-basis, cross-border, and audit persistence are all
          tenant-scoped in 0.3.0. Global primary keys became tenant-scoped composite keys. If your
          recipes database is empty, generate fresh and skip to § 4. If it holds data, follow the
          reviewed procedure — it ships inside the package:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`node_modules/@tantainnovative/ndpr-recipes/migrations/0.3.0/
  README.md         # the authoritative procedure — read it in full
  postgresql.sql    # standalone psql + Prisma (owns its BEGIN;/COMMIT;)
  drizzle.sql       # Drizzle-managed migration BODY (no transaction control)`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          Pick <strong>exactly one</strong> artifact for your runner. Never concatenate them and never
          add <code className={CODE}>BEGIN;</code>/<code className={CODE}>COMMIT;</code> to the Drizzle
          body — <code className={CODE}>drizzle-kit migrate</code> supplies the outer transaction so
          the migration and its ledger entry commit or roll back together.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          Each artifact carries one guarded placeholder. The migration aborts if it is left in place
          or set empty:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`'__REPLACE_WITH_TENANT_ID__'  -- must equal the deployed NDPR_TENANT_ID`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Prisma</h3>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`mkdir -p prisma/migrations/202607180001_ndpr_recipes_0_3_hardening
cp node_modules/@tantainnovative/ndpr-recipes/migrations/0.3.0/postgresql.sql \\
  prisma/migrations/202607180001_ndpr_recipes_0_3_hardening/migration.sql
# Edit and review this exact migration.sql — especially the tenant ID.
npx prisma migrate deploy
npx prisma generate`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Drizzle</h3>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`npx drizzle-kit generate --custom --name ndpr-recipes-0-3-hardening
DRIZZLE_MIGRATION_SQL="drizzle/0007_ndpr-recipes-0-3-hardening.sql" # exact generated path
test -f "$DRIZZLE_MIGRATION_SQL"
cp node_modules/@tantainnovative/ndpr-recipes/migrations/0.3.0/drizzle.sql \\
  "$DRIZZLE_MIGRATION_SQL"
# Edit and review this exact generated SQL file — especially the tenant ID.
npx drizzle-kit migrate`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">What the backfill will not guess</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          The script assigns the tenant, normalizes column names, dedupes active consent, converts
          JSON to JSONB, and runs hard-invariant checks. Three things it deliberately refuses to
          fabricate, because inventing compliance evidence is worse than having none:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Module</th>
                <th className="text-left py-2 pr-4 font-semibold">Left fail-closed</th>
                <th className="text-left py-2 font-semibold">Your remediation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">DSR</td>
                <td className="py-2 pr-4"><code>subject_id</code> = <code>legacy_dsr_&lt;id&gt;</code> placeholders, which grant no account access</td>
                <td className="py-2">Load a reviewed request-id → account-subject-id map before enabling subject-facing DSR routes</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">ROPA</td>
                <td className="py-2 pr-4"><code>record_data</code> stays <code>NULL</code>; routes return <strong>409</strong></td>
                <td className="py-2">Stage snapshots and validate each with <code>validateProcessingRecord</code> before backfilling</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Breach</td>
                <td className="py-2 pr-4">No <code>RegulatoryNotification</code> is invented; readiness stays not-ready</td>
                <td className="py-2">Attach the original filing content and reference, with <code>sentAt</code> between discovery and <code>asOf</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4 text-foreground leading-relaxed">
          Lawful-basis <code className={CODE}>activity_data</code> and cross-border{' '}
          <code className={CODE}>transfer_data</code> stay nullable for the same reason. Legacy
          columns (<code className={CODE}>internal_notes_legacy</code>,{' '}
          <code className={CODE}>acknowledged_at</code>, <code className={CODE}>safeguards_legacy</code>)
          are retained through your rollback window — drop them only in a later reviewed migration.
        </p>
        <div className="border-l-4 border-rose-500 bg-rose-500/5 p-4 rounded-r-md mb-4">
          <p className="text-foreground leading-relaxed">
            <strong>Rollback reality.</strong> Before the transaction commits, any failed check rolls
            everything back safely. After commit but before app cutover, restore your tested snapshot —
            do not run 0.2.x code against renamed 0.3.0 columns. Once 0.3.0 writes begin there is no
            lossy down migration: freeze writes, export new audit and consent rows, and
            forward-reconcile under an incident plan. Take and <em>restore-test</em> a backup first.
          </p>
        </div>
      </section>

      <section id="consent-api" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">4. Canonical consent responses and evidence archival</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Generated consent endpoints used to return raw persistence rows — database column names,
          internal ids, and <code className={CODE}>Date</code> objects leaked into API responses and
          coupled every client to your schema. They now return the canonical{' '}
          <code className={CODE}>ConsentSettings</code> shape the toolkit&apos;s own hooks and
          adapters consume:
        </p>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`// GET /api/consent  →  ConsentSettings | null
{
  consents:      Record<string, boolean>,
  timestamp:     number,   // epoch ms, safe integer
  version:       string,
  method:        string,
  hasInteracted: boolean,
  lawfulBasis?:  string
}`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          If a client read <code className={CODE}>record.createdAt</code>,{' '}
          <code className={CODE}>record.id</code>, or any other row field, update it to the shape
          above. The subject is always the verified one from context — subject ids in the query string
          or body are ignored, not honoured.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">Replay is idempotent, conflicts are explicit</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          A repeat POST carrying the same <code className={CODE}>timestamp</code> +{' '}
          <code className={CODE}>version</code> + <code className={CODE}>method</code> returns the
          original record instead of writing a duplicate. If that same triple arrives with a{' '}
          <em>different</em> payload it is an idempotency collision and returns{' '}
          <strong>409</strong> rather than picking a winner. Two new failure modes worth handling
          client-side:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>409</strong> — concurrent update conflict under serializable isolation. Safe to retry the identical request.</li>
          <li><strong>400</strong> — fractional or unsafe-integer <code className={CODE}>timestamp</code>, rejected before any database access.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">DELETE archives, it no longer destroys</h3>
        <p className="mb-4 text-foreground leading-relaxed">
          Accountability records are the evidence you would show the Commission, so nothing is
          physically deleted any more:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><strong>Consent</strong> — sets <code className={CODE}>revokedAt</code>, clears the active key, writes a <code className={CODE}>revoked</code> audit entry, and responds <code className={CODE}>{`{ success, revoked }`}</code> with the number of rows revoked. History is preserved.</li>
          <li><strong>ROPA</strong> — archives the activity, retaining its complete evidence snapshot.</li>
          <li><strong>DPIA</strong> — soft-removes, auditing the transition in the same transaction.</li>
        </ul>
        <p className="mb-4 text-foreground leading-relaxed">
          If any test or client asserted that a record disappeared after DELETE, update it to assert
          revoked/archived state instead. Business writes and their accountability entries now commit
          in a single transaction, so you can no longer end up with a consent change that has no
          audit trail.
        </p>
      </section>

      <section id="compliance-rules" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">5. Compliance rule changes — re-run your audits</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          Two changes alter <em>output</em> for unchanged input. Everyone upgrading is affected, including
          frontend-only users, and stored results computed under 5.x are stale:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>
            <strong>2026 CAR filing deadline extended to 30 May</strong>, bundled with explicit ruleset
            provenance. Non-canonical, inherited, accessor-backed, out-of-range, or cross-year deadline
            overrides are now rejected. Re-run CAR and aggregate audit output, and confirm current NDPC
            guidance before you file.
          </li>
          <li>
            <strong>Breach duties are treated as applicable</strong> until complete correlated evidence
            establishes otherwise (§ 1). Re-run every stored breach-readiness assessment.
          </li>
        </ul>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`npx ndpr audit --json > audit-after-6.0.json
# diff against your pre-upgrade output and explain every change before filing`}</code>
        </pre>
        <p className="text-foreground leading-relaxed">
          Scores dropping after this upgrade is the expected outcome where evidence was incomplete.
          Treat the delta as a work list, not a bug. See{' '}
          <Link href="/docs/guides/legal-sources-governance" className="text-primary hover:underline">Legal Sources &amp; Update Governance</Link>{' '}
          for how regulatory changes are reviewed and released.
        </p>
      </section>

      <section id="not-changing" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">What hasn&apos;t changed</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li>No component, hook, or preset was renamed or removed.</li>
          <li>All 22 subpath exports still resolve in ESM, CJS, and TypeScript.</li>
          <li>Peer range is still <code className={CODE}>react ^18 || ^19</code>.</li>
          <li>Same seven locales (en, yo, ig, ha, pcm, ar, fr).</li>
          <li><code className={CODE}>NDPRProvider</code>, <code className={CODE}>NDPRThemeProvider</code>, and the adapter contracts are unchanged.</li>
          <li>The 5.x <code className={CODE}>@deprecated</code> aliases still work — including <code className={CODE}>nitdaNotificationRequired</code> and the <code className={CODE}>storageKey</code>/<code className={CODE}>useLocalStorage</code> hook options. They were not removed in 6.0.</li>
          <li>The unscoped <code className={CODE}>create-ndpr@1.0.0</code> alias is unchanged and delegates to the latest scoped CLI.</li>
        </ul>
      </section>

      <section id="upgrade-checklist" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Upgrade checklist</h2>
        <ol className="list-decimal pl-6 space-y-2 text-foreground mb-4">
          <li>Bump to <code className={CODE}>^6.0.0</code> and run <code className={CODE}>tsc</code>. Fix any <code className={CODE}>highRisk: false</code> / <code className={CODE}>notificationRequired: false</code> type errors by supplying real assessments.</li>
          <li>Re-run stored breach-readiness assessments and CAR/aggregate audits. Diff against pre-upgrade output.</li>
          <li><em>Backend only:</em> set server-side <code className={CODE}>NDPR_TENANT_ID</code>.</li>
          <li><em>Backend only:</em> replace the <code className={CODE}>resolveVerifiedNDPRActor</code> stub and map your roles to <code className={CODE}>ndpr:staff</code> / <code className={CODE}>ndpr:admin</code>.</li>
          <li><em>Populated database only:</em> back up, restore-test, freeze writes, then run the single correct <code className={CODE}>migrations/0.3.0</code> artifact.</li>
          <li>Apply reviewed DSR subject mappings and ROPA/breach evidence backfills. Drive the review-queue counts in the migration README to zero for every workflow you intend to enable.</li>
          <li>Update clients that read raw consent rows to the canonical <code className={CODE}>ConsentSettings</code> shape, and handle 400/409.</li>
          <li>Update tests asserting hard deletion to assert revoked/archived state.</li>
          <li>Smoke-test under two tenant fixtures (or a deliberately foreign tenant id) and verify subject vs staff authorization, consent create/replay/replace/revoke, and atomic business+audit commits.</li>
        </ol>
        <p className="text-foreground leading-relaxed">
          Stuck? Open an issue at{' '}
          <a href="https://github.com/mr-tanta/ndpr-toolkit/issues" className="text-primary hover:underline">github.com/mr-tanta/ndpr-toolkit/issues</a>.
          Related reading:{' '}
          <Link href="/docs/guides/production-recipes" className="text-primary hover:underline">Production Recipes</Link>,{' '}
          <Link href="/docs/guides/cli-scaffolder" className="text-primary hover:underline">CLI Scaffolder</Link>, and{' '}
          <Link href="/docs/guides/migrating-4-1-to-5-0" className="text-primary hover:underline">Migrating 4.1 → 5.0</Link>.
        </p>
      </section>
    </DocLayout>
  );
}
