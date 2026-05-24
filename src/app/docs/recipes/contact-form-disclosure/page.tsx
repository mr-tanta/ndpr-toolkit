'use client';

import Link from 'next/link';
import { DocLayout } from '../../components/DocLayout';

export default function ContactFormDisclosureRecipe() {
  return (
    <DocLayout
      title="Contact Form Disclosure"
      description="NDPA Section 27 privacy notice on a public contact form — what you collect, lawful basis, retention, complaint route."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href="https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/policy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" />
        </a>
        <a
          href="https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/policy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="Open in CodeSandbox" />
        </a>
      </div>
      <p className="mb-6 text-base text-muted-foreground">
        Public contact forms collect personal data (name + email at minimum). Section 27(1) requires you to inform the data subject — before collection — of what you&apos;re doing with it. The notice doesn&apos;t have to be long; it just has to be there and link to the full policy.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Minimum-viable disclosure</h2>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import { useState } from 'react';
import Link from 'next/link';
import { sanitizeInput } from '@tantainnovative/ndpr-toolkit/core';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        message: sanitizeInput(message),
      }),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      <textarea
        required
        rows={4}
        placeholder="How can we help?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full rounded border px-3 py-2"
      />

      {/* Section 27 minimum-viable notice — directly above the submit button */}
      <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
        <strong>How we use your data.</strong> We process the name, email, and message
        you submit only to respond to your enquiry (lawful basis: legitimate interest under
        NDPA Section 25(1)(f); contract steps under Section 25(1)(b) for existing customers).
        We retain enquiries for 12 months, then delete them. You have the right to access,
        rectify, or erase your data — contact our DPO at{' '}
        <Link href="/privacy" className="underline">acme.ng/privacy</Link>{' '}
        for full details, or lodge a complaint with the NDPC (Section 46(1)).
      </div>

      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
        Send message
      </button>
    </form>
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">What Section 27(1) wants you to disclose</h2>
      <p className="mb-3">The Act gives a checklist. For a contact form, the relevant items are:</p>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        <li><strong>(a)</strong> Your identity and contact details</li>
        <li><strong>(b)</strong> The lawful basis (Section 25(1) — for a contact form it&apos;s usually legitimate interest or pre-contract)</li>
        <li><strong>(c)</strong> Recipients of the data (if any third parties — e.g. your email provider)</li>
        <li><strong>(d)</strong> The data-subject rights under Part VI (point them at your full privacy policy)</li>
        <li><strong>(e)</strong> Retention period (or the criteria — &quot;12 months&quot; is concrete and audit-friendly)</li>
        <li><strong>(f)</strong> Right to lodge a complaint with NDPC under Section 46(1)</li>
        <li><strong>(g)</strong> Automated decision-making (if any — usually n/a for contact forms)</li>
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        The short notice above covers (a)–(f); (g) is omitted because contact forms don&apos;t do automated decisions. If you DO route enquiries through an automated triage / chatbot, add a sentence per Section 37.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Don&apos;t over-collect</h2>
      <p className="mb-2">A contact form needs name + email + message. <strong>Resist the urge to ask for phone, company, country, role.</strong> NDPA Section 24(1)(c) requires data minimisation — only collect what&apos;s necessary for the stated purpose. Sales lead enrichment is not the stated purpose of a public contact form.</p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Related</h2>
      <ul className="space-y-2">
        <li><Link href="/docs/guides/lawful-basis" className="text-primary hover:underline">Guide — choosing a lawful basis (Section 25)</Link></li>
        <li><Link href="/docs/components/privacy-policy-generator" className="text-primary hover:underline">Privacy Policy Generator (full Section 27 content)</Link></li>
        <li><Link href="/nigeria-privacy-policy-generator" className="text-primary hover:underline">Nigeria Privacy Policy Generator landing</Link></li>
      </ul>
    </DocLayout>
  );
}
