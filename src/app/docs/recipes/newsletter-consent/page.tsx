'use client';

import Link from 'next/link';
import { DocLayout } from '../../components/DocLayout';

export default function NewsletterConsentRecipe() {
  return (
    <DocLayout
      title="Newsletter Consent"
      description="NDPA Section 26 affirmative opt-in for newsletter signups — no pre-checked boxes, double opt-in compatible."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        <a
          href="https://stackblitz.com/github/mr-tanta/ndpr-toolkit/tree/main/examples/stackblitz/consent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt="Open in StackBlitz" />
        </a>
        <a
          href="https://codesandbox.io/p/github/mr-tanta/ndpr-toolkit/main/examples/stackblitz/consent"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="Open in CodeSandbox" />
        </a>
      </div>
      <p className="mb-6 text-base text-muted-foreground">
        Most newsletter signups in Nigerian apps still fail NDPA Section 26. The classic trap is a pre-checked &quot;subscribe me&quot; box on the signup form — that&apos;s inferred consent, which 26(7)(a) explicitly disallows. The fix is small but easy to get wrong.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Correct opt-in shape</h2>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`'use client';
import { useState } from 'react';
import { sanitizeInput } from '@tantainnovative/ndpr-toolkit/core';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [marketing, setMarketing] = useState(false);
  const [transactional, setTransactional] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Section 26 requires consent to be SPECIFIC to a stated purpose.
    // We collect two separate opt-ins, both default unchecked.
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sanitizeInput(email),
        consents: {
          marketing,
          transactional,
        },
        version: 'newsletter-2026-05',
        timestamp: Date.now(),
      }),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="block text-sm font-medium">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>

      {/* DEFAULT UNCHECKED. Each consent is its own line with a clear purpose. */}
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        <span>
          <strong>Marketing emails.</strong> Send me product updates, promotions, and offers.
          You can unsubscribe anytime from the footer of any email (NDPA Section 26).
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={transactional} onChange={(e) => setTransactional(e.target.checked)} />
        <span>
          <strong>Account emails.</strong> Receipts, security alerts, and account changes.
          Required for service — see our <a href="/privacy">privacy policy</a>.
        </span>
      </label>

      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
        Subscribe
      </button>
    </form>
  );
}`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Why two checkboxes?</h2>
      <p className="mb-4">
        NDPA Section 26(7)(a) requires consent to be <strong>specific</strong> and <strong>not based on a pre-selected confirmation</strong>. A single &quot;send me everything&quot; box bundling marketing with transactional emails fails both tests. Splitting them lets the user separately consent to marketing (which they can withdraw) while still receiving transactional emails (necessary for the service contract under Section 25(1)(b)).
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Double opt-in</h2>
      <p className="mb-4">
        Most email providers (Mailchimp, Brevo, ConvertKit, Resend) support double opt-in out of the box. NDPA doesn&apos;t require it, but it&apos;s strong evidence of the consent burden of proof under Section 26(1) and is also recommended by NDPC guidance. Keep the &quot;confirm subscription&quot; email template short:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`Subject: Confirm your subscription to Acme NG

You requested updates from Acme NG.

Confirm: [https://acme.ng/confirm?token=…]

If you didn't sign up, ignore this email — no record will be kept.
Acme NG · Lagos, Nigeria · privacy@acme.ng`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Audit trail</h2>
      <p className="mb-4">
        Persist <code>{`{ email, consents, version, timestamp, ipAddress, userAgent }`}</code> for every signup. Section 26(1) puts the burden of proof on you to show consent was given. Use the <code>useConsent</code> + <code>createAuditEntry</code> helpers from <code>/server</code> if you want toolkit-managed records:
      </p>
      <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto"><code className="text-sm">{`import { createAuditEntry, appendAuditEntry } from '@tantainnovative/ndpr-toolkit/server';

// in your /api/newsletter route handler:
const entry = createAuditEntry({
  subjectId: email,
  action: 'consent_given',
  consents: body.consents,
  version: body.version,
  ipAddress: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent'),
});
await appendAuditEntry(entry, /* your storage */);`}</code></pre>

      <h2 className="text-2xl font-bold mt-10 mb-4">Related</h2>
      <ul className="space-y-2">
        <li><Link href="/docs/components/consent-management" className="text-primary hover:underline">Consent Management — full API reference</Link></li>
        <li><Link href="/docs/guides/managing-consent" className="text-primary hover:underline">Guide — managing consent under NDPA 2023</Link></li>
        <li><Link href="/docs/recipes/contact-form-disclosure" className="text-primary hover:underline">Contact Form Disclosure (Section 27)</Link></li>
      </ul>
    </DocLayout>
  );
}
