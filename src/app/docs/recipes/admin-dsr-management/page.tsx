'use client';

import Link from 'next/link';
import { DocLayout } from '../../components/DocLayout';

export default function AdminDSRManagementRecipe() {
  return (
    <DocLayout
      title="Admin DSR Management"
      description="DPO/staff-side workflow for handling subject requests: queue, identity verification, response within 30 days, audit trail."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href="https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/dsr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" />
        </a>
        <a
          href="https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/dsr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="Open in CodeSandbox" />
        </a>
      </div>
      <p className="mb-6 text-base text-muted-foreground">
        The public DSR portal is half the story. The other half is the DPO / staff workflow: triage the queue, verify identity, generate the response, hit Section 34&apos;s 30-day deadline (extendable to 60 if complex, per GAID 2025), and keep an audit trail NDPC can ask for. This recipe wires those pieces.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">DPO dashboard</h2>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import { DSRDashboard } from '@tantainnovative/ndpr-toolkit';
import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';
import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters';
import type { DSRRequest } from '@tantainnovative/ndpr-toolkit/core';

const adapter = apiAdapter<DSRRequest[]>('/api/admin/dsr', {
  credentials: 'include',
  retry: { attempts: 2 },
});

export default function DPODashboard() {
  return (
    <DSRDashboard
      adapter={adapter}
      requestTypes={[
        { id: 'access', name: 'Access', ndpaSection: 'Section 34(1)(a)', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
        { id: 'rectification', name: 'Rectification', ndpaSection: 'Section 34(1)(c)', estimatedCompletionTime: 30, requiresAdditionalInfo: true },
        { id: 'erasure', name: 'Erasure', ndpaSection: 'Section 34(1)(d)', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
        { id: 'portability', name: 'Portability', ndpaSection: 'Section 38', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
        { id: 'objection', name: 'Objection', ndpaSection: 'Section 36', estimatedCompletionTime: 30, requiresAdditionalInfo: true },
        { id: 'withdraw_consent', name: 'Withdraw Consent', ndpaSection: 'Section 35', estimatedCompletionTime: 30, requiresAdditionalInfo: false },
      ]}
    />
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Identity verification workflow</h2>
      <p className="mb-4">
        Before fulfilling an access or erasure request, you must verify the requester actually is the data subject. NDPA doesn&apos;t prescribe the method — common patterns:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>Email magic link</strong>: send a verification link to the email on file. Cheap and good enough for low-sensitivity requests.</li>
        <li><strong>Government ID upload</strong>: NIN slip + selfie. Standard for fintech / healthcare. Be careful — you&apos;re processing fresh sensitive PII to verify; delete after verification (Section 24(1)(e)).</li>
        <li><strong>Account login</strong>: if the data subject has an active account, requiring them to log in to submit the request is sufficient.</li>
      </ul>
      <p className="mt-4">
        Transition the request status from <code>awaitingVerification</code> → <code>inProgress</code> when verification completes:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`// app/api/admin/dsr/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyDSRSession } from '@/server/dsr-verify'; // your custom auth check

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await verifyDSRSession(req); // ensure caller is the DPO / authorised staff

  // Mark verified — Section 34 30-day clock keeps running from submission
  await db.dsrRequest.update({
    where: { id: params.id },
    data: {
      status: 'inProgress',
      verifiedAt: new Date(),
      // dueDate stays at original (createdAt + 30 days)
    },
  });

  return NextResponse.json({ ok: true });
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">30-day deadline tracking</h2>
      <p className="mb-4">
        The <code>useDSR</code> hook exposes <code>getRequestsByStatus</code> — combine with a custom sort to surface requests close to the 30-day deadline:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import { useDSR } from '@tantainnovative/ndpr-toolkit/hooks';

export function OverdueAlert({ requestTypes }: { requestTypes: any[] }) {
  const { requests } = useDSR({ requestTypes });
  const now = Date.now();
  const overdue = requests.filter(
    (r) => r.status !== 'completed' && r.dueDate && r.dueDate < now,
  );
  const closeToDeadline = requests.filter(
    (r) =>
      r.status !== 'completed' &&
      r.dueDate &&
      r.dueDate > now &&
      r.dueDate - now < 5 * 24 * 60 * 60 * 1000, // 5 days
  );

  if (overdue.length === 0 && closeToDeadline.length === 0) return null;
  return (
    <aside className="rounded border border-red-200 bg-red-50 p-3 text-sm">
      {overdue.length > 0 && <p><strong>{overdue.length} DSRs are past the 30-day deadline.</strong> Section 34 violation risk.</p>}
      {closeToDeadline.length > 0 && <p>{closeToDeadline.length} DSRs due in the next 5 days.</p>}
    </aside>
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Audit trail</h2>
      <p>
        Every state transition (received → verified → in-progress → completed/rejected) should be recorded with a timestamp, the staff member who acted, and a one-line reason. NDPC asks for this trail during compliance investigations. The toolkit&apos;s <code>internalNotes</code> field on <code>DSRRequest</code> covers it.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Related</h2>
      <ul className="space-y-2">
        <li><Link href="/docs/components/data-subject-rights" className="text-primary hover:underline">DSR components — full API reference</Link></li>
        <li><Link href="/docs/recipes/careers-rights" className="text-primary hover:underline">Careers / applicant DSR recipe</Link></li>
        <li><Link href="/docs/guides/data-subject-requests" className="text-primary hover:underline">DSR handling guide</Link></li>
      </ul>
    </DocLayout>
  );
}
