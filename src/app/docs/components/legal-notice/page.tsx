'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function LegalNoticeDocs() {
  return (
    <DocLayout
      title="LegalNotice"
      description="Renders the standard 'not legal advice' disclaimer the toolkit ships. Drop it under any component that surfaces an NDPA section citation or generates an artifact (policy, breach report, DPIA result)."
    >
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview</h2>
        <p className="mb-4 text-foreground leading-relaxed">
          The toolkit generates legal artifacts — privacy policies, breach reports, DPIA results — and labels them with
          NDPA section citations. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LegalNotice</code> renders the standard disclaimer making clear that the
          output is generated guidance, not legal advice, and that consumers should have a qualified Nigerian data
          protection lawyer review it before relying on it.
        </p>
        <p className="mb-4 text-foreground leading-relaxed">
          The notice text comes from the constants <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LEGAL_DISCLAIMER_SHORT</code> and
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm"> LEGAL_DISCLAIMER_LONG</code>, also exported from the root entry — use those directly if you need the
          text outside React (PDF/DOCX exports, email templates, server logs).
        </p>
      </section>

      <section id="quickstart" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Quickstart</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`import { LegalNotice } from '@tantainnovative/ndpr-toolkit';

export default function DPIASummary({ result }: { result: DPIAResult }) {
  return (
    <section>
      <DPIAReport result={result} />
      {/* short variant for footers / captions */}
      <LegalNotice />
    </section>
  );
}

// long variant for export documents and modals
<LegalNotice variant="long" />`}</code>
        </pre>
      </section>

      <section id="props" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Props</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">Prop</th>
                <th className="text-left py-2 pr-4 font-semibold">Type</th>
                <th className="text-left py-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">variant</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;short&apos; | &apos;long&apos;</code></td>
                <td className="py-2"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;short&apos;</code> is a one-liner appropriate for captions and footers. <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;long&apos;</code> is the full notice for export documents and dialogs. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;short&apos;</code>.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">className</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">string</code></td>
                <td className="py-2">Class on the wrapping <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&lt;p&gt;</code>. Defaults to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">&apos;ndpr-legal-notice&apos;</code> when omitted.</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">hidden</code></td>
                <td className="py-2 pr-4"><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">boolean</code></td>
                <td className="py-2">When <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">true</code>, renders nothing — an escape hatch when you want the disclaimer surfaced elsewhere in the layout (e.g. a global app footer).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="rendered-markup" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Rendered markup</h2>
        <pre className="bg-card border border-border rounded-md p-4 overflow-x-auto text-sm mb-4">
          <code>{`<p role="note" class="ndpr-legal-notice" data-ndpr-legal-notice="short">
  {LEGAL_DISCLAIMER_SHORT}
</p>`}</code>
        </pre>
        <p className="mb-4 text-foreground leading-relaxed">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">data-ndpr-legal-notice</code> attribute and the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">role=&quot;note&quot;</code> are stable selectors — safe to
          target from your own CSS or tests.
        </p>
      </section>

      <section id="related" className="mb-10">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Related</h2>
        <ul className="list-disc pl-6 space-y-2 text-foreground mb-4">
          <li><code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LEGAL_DISCLAIMER_SHORT</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">LEGAL_DISCLAIMER_LONG</code>, <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">legalDisclaimerBlock</code> — string constants for non-React surfaces, exported from the root entry.</li>
        </ul>
      </section>
    </DocLayout>
  );
}
